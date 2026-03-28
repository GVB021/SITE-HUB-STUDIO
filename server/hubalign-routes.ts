import type { Express, Request } from "express";
import multer from "multer";
import path from "path";
import os from "os";
import { createWriteStream, promises as fs } from "fs";
import { pipeline } from "stream/promises";
import { Readable } from "stream";
import { randomUUID } from "crypto";
import { z } from "zod";
import { requireAuth } from "./middleware/auth";
import { storage } from "./storage";
import { logger } from "./lib/logger";
import {
  checkSupabaseConnection,
  deleteFromSupabaseStorage,
  downloadFromSupabaseStorage,
  downloadFromSupabaseStorageUrl,
  listSupabaseStorageObjects,
  parseSupabaseStorageUrl,
  uploadJsonToSupabaseStorage,
  uploadToSupabaseStorage,
} from "./lib/supabase";
import { generateSilenceTrack, mixTracks, type MixTrackInput } from "./lib/audio-mixer";

const START_TIME_CACHE = new Map<string, number[]>();

function parseScriptTimecode(value: unknown): number | null {
  if (value == null) return null;
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.max(0, value);
  }
  const str = String(value).trim();
  if (!str) return null;
  if (/^[+-]?\d+(\.\d+)?$/.test(str)) {
    return Math.max(0, Number(str));
  }
  const normalized = str.replace(/\s+/g, "").replace(/;/g, ":");
  const parts = normalized.split(":");
  if (parts.length >= 3) {
    const hh = Number(parts[0]) || 0;
    const mm = Number(parts[1]) || 0;
    const ss = Number(parts[2]) || 0;
    const sub = parts[3] ? Number(parts[3]) || 0 : 0;
    return Math.max(0, hh * 3600 + mm * 60 + ss + sub / (parts[3]?.length || 1));
  }
  if (parts.length === 2) {
    const mm = Number(parts[0]) || 0;
    const ss = Number(parts[1]) || 0;
    return Math.max(0, mm * 60 + ss);
  }
  return null;
}

async function loadScriptLineStarts(productionId: string): Promise<number[]> {
  const cacheKey = productionId;
  if (START_TIME_CACHE.has(cacheKey)) return START_TIME_CACHE.get(cacheKey)!;
  const production = await storage.getProduction(productionId);
  if (!production) return [];
  const raw = production.scriptJson;
  if (!raw) return [];
  let parsed: any[];
  if (typeof raw === "string") {
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = [];
    }
  } else if (Array.isArray(raw)) {
    parsed = raw;
  } else if (raw && Array.isArray(raw.lines)) {
    parsed = raw.lines;
  } else {
    parsed = [];
  }
  const normalized: number[] = parsed.map((line) => {
    const candidate =
      line?.tempoEmSegundos ??
      line?.start ??
      line?.tempo ??
      line?.timecode ??
      line?.tc ??
      line?.in ??
      null;
    const parsedValue = parseScriptTimecode(candidate);
    return parsedValue ?? null;
  });
  START_TIME_CACHE.set(cacheKey, normalized);
  return normalized;
}

export const HUBALIGN_OWNER_USERNAME = "borbaggabriel";
const upload = multer({ 
  storage: multer.memoryStorage(), 
  limits: { fileSize: 1024 * 1024 * 100 } // Reduzi para 100MB conforme boas práticas de servidor
});

const ALLOWED_MIME_TYPES = [
  "audio/wav", "audio/x-wav", "audio/mpeg", "audio/mp3", "audio/mp4", "audio/x-m4a", "audio/m4a"
];

type HubAlignProject = {
  id: string;
  name: string;
  description: string;
  status: "draft" | "editing" | "ready";
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  fileCount: number;
  versionCount: number;
};

function resolveHubAlignBucket(settings: Record<string, string>) {
  return String(settings.HUBALIGN_SUPABASE_BUCKET || settings.SUPABASE_BUCKET || "takes").trim();
}

export function getEmailUsername(input: unknown) {
  const raw = String(input || "").trim().toLowerCase();
  if (!raw.includes("@")) return raw;
  return raw.split("@")[0] || "";
}

export function isHubAlignOwner(user: any) {
  const email = String(user?.email || "").toLowerCase().trim();
  const byEmail = email === "borbaggabriel@gmail.com" || getEmailUsername(user?.email) === HUBALIGN_OWNER_USERNAME;
  const byDisplayName = String(user?.displayName || "").trim().toLowerCase() === HUBALIGN_OWNER_USERNAME;
  return byEmail || byDisplayName;
}

async function writeHubAlignAudit(req: Request, action: string, details: Record<string, unknown>) {
  const user = (req as any).user;
  await storage.createAuditLog({
    userId: user?.id || null,
    action,
    details: JSON.stringify({
      ...details,
      username: getEmailUsername(user?.email),
      ip: req.ip || null,
      userAgent: req.headers["user-agent"] || null,
      at: new Date().toISOString(),
    }),
  });
}

async function requireHubAlignOwner(req: Request, res: any, next: any) {
  const user = (req as any).user;
  if (!isHubAlignOwner(user)) {
    await writeHubAlignAudit(req, "HUBALIGN_FORBIDDEN_ACCESS", { path: req.path, method: req.method });
    return res.status(403).json({ message: "Acesso exclusivo para borbaggabriel" });
  }
  return next();
}

function projectPath(projectId: string, suffix: string) {
  const safeId = String(projectId || "").replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 64);
  if (!safeId) throw new Error("projectId invalido");
  return `hubalign/projects/${safeId}/${suffix}`.replace(/\/+/g, "/");
}

function productResourcePath(projectId: string, productId: string, suffix: string) {
  return projectPath(projectId, `products/${encodeURIComponent(productId)}/${suffix}`);
}

type HubAlignProductTake = {
  takeId: string;
  lineIndex: number;
  startTimeSeconds: number | null;
  durationSeconds: number; 
  audioUrl: string;
  characterName: string;
  voiceActorName: string;
};

type HubAlignProductAssignment = {
  characterId: string;
  characterName: string;
  voiceActorId: string;
  voiceActorName: string;
  takes: HubAlignProductTake[];
};

type HubAlignProductManifest = {
  id: string;
  projectId: string;
  name: string;
  sessionId: string;
  sessionTitle: string;
  productionId: string;
  productionName: string;
  createdAt: string;
  status: "pending" | "mixing" | "ready" | "error";
  metadata: {
    assignmentCount: number;
    takeCount: number;
  };
  assignments: HubAlignProductAssignment[];
  timeline: HubAlignProductTake[];
  meTrackPath?: string | null;
  finalUrl?: string | null;
  note?: string | null;
};

const createProductSchema = z.object({
  name: z.string().min(1),
  sessionId: z.string().min(1),
  sessionTitle: z.string().min(1),
  productionId: z.string().min(1),
  productionName: z.string().min(1),
  assignments: z
    .array(
      z.object({
        characterId: z.string().min(1),
        characterName: z.string().min(1),
        voiceActorId: z.string().min(1),
        voiceActorName: z.string().min(1),
        takeIds: z.array(z.string().min(1)).min(1),
      })
    )
    .min(1),
  timeline: z
    .array(
      z.object({
        takeId: z.string().min(1),
        lineIndex: z.coerce.number().int().min(0),
        startTimeSeconds: z.number().nullable(),
        durationSeconds: z.number().min(0),
        audioUrl: z.string().min(1),
        characterName: z.string().min(1),
        voiceActorName: z.string().min(1),
      })
    )
    .min(1),
  note: z.string().max(500).optional(),
});

async function saveProjectBackup(bucket: string, projectId: string, data: unknown) {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  await uploadJsonToSupabaseStorage({
    bucket,
    path: projectPath(projectId, `backups/${stamp}_${randomUUID()}.json`),
    data,
  });
}

async function loadProductManifest(bucket: string, projectId: string, productId: string) {
  try {
    const path = productResourcePath(projectId, productId, "manifest.json");
    const response = await downloadFromSupabaseStorage({ bucket, path });
    if (!response.ok) return null;
    return (await response.json()) as HubAlignProductManifest;
  } catch (error) {
    return null;
  }
}

async function saveProductManifest(bucket: string, projectId: string, productId: string, manifest: HubAlignProductManifest) {
  const path = productResourcePath(projectId, productId, "manifest.json");
  await uploadJsonToSupabaseStorage({ bucket, path, data: manifest });
}

function sanitizeTempLabel(value: string) {
  const cleaned = String(value || "asset").replace(/[^a-zA-Z0-9-_]/g, "_");
  const timestamp = Date.now().toString(36);
  return `${cleaned.slice(0, 32)}_${timestamp}`;
}

function guessExtensionFromUrl(value: string) {
  const cleaned = value.split("?")[0] || "";
  const extension = path.extname(cleaned).toLowerCase();
  if (extension) return extension;
  return ".wav";
}

async function downloadAudioUrlToTemp(url: string, bucket: string, tmpDir: string, label: string) {
  const trimmed = String(url || "").trim();
  if (!trimmed) throw new Error("URL de áudio inválida");

  const productLabel = sanitizeTempLabel(label);
  const extension = guessExtensionFromUrl(trimmed);
  const destination = path.join(tmpDir, `${productLabel}${extension}`);
  await fs.mkdir(path.dirname(destination), { recursive: true });

  let response: Response;
  const parsed = parseSupabaseStorageUrl(trimmed);
  if (parsed) {
    response = await downloadFromSupabaseStorage(parsed);
  } else if (/^https?:\/\//i.test(trimmed)) {
    response = await fetch(trimmed);
  } else {
    response = await downloadFromSupabaseStorage({ bucket, path: trimmed });
  }

  if (!response.ok) {
    throw new Error(`Falha ao baixar ${trimmed}: HTTP ${response.status}`);
  }

  const body = response.body;
  if (!body) {
    throw new Error(`Resposta sem corpo ao baixar ${trimmed}`);
  }

  await pipeline(Readable.fromWeb(body as any), createWriteStream(destination));
  return destination;
}

export function registerHubAlignRoutes(app: Express) {
  app.get("/api/hubalign/access", requireAuth, async (req, res) => {
    const user = (req as any).user;
    const allowed = isHubAlignOwner(user);
    const supabase = await checkSupabaseConnection(false);
    if (allowed) {
      await writeHubAlignAudit(req, "HUBALIGN_ACCESS_GRANTED", { path: req.path });
    }
    return res.status(200).json({
      allowed,
      username: getEmailUsername(user?.email),
      expected: HUBALIGN_OWNER_USERNAME,
      supabaseOk: supabase.ok,
      supabaseReason: supabase.reason || null,
    });
  });

  app.get("/api/hubalign/projects", requireAuth, requireHubAlignOwner, async (req, res) => {
    try {
      const settings = await storage.getAllSettings();
      const bucket = resolveHubAlignBucket(settings);
      
      // Listamos tudo sob hubalign/projects/ para encontrar as pastas de projeto
      const rows = await listSupabaseStorageObjects({
        bucket,
        prefix: "hubalign/projects/",
        limit: 500,
        offset: 0,
        sortBy: { column: "updated_at", order: "desc" },
      });

      const projectIds = new Set<string>();
      for (const row of rows as any[]) {
        const name = String(row?.name || "");
        // O formato esperado agora é hubalign/projects/ID/project.json ou similar
        // A listagem do Supabase costuma retornar apenas o nome relativo ao prefixo se usarmos delimitador, 
        // mas aqui estamos pegando o nome completo ou relativo dependendo da implementação.
        // Se 'prefix' for 'hubalign/projects/', row.name pode ser 'ID/project.json'
        const parts = name.split("/");
        if (parts.length > 0 && parts[0]) projectIds.add(parts[0]);
      }

      const projects: HubAlignProject[] = [];
      const fetchPromises = Array.from(projectIds).map(async (id) => {
        try {
          const path = projectPath(id, "project.json");
          const response = await downloadFromSupabaseStorage({ bucket, path });
          if (response.ok) {
            const data = await response.json();
            
            // Calculamos contagens reais
            const fileCount = rows.filter((r: any) => String(r?.name || "").startsWith(`${id}/files/`)).length;
            const versionCount = rows.filter((r: any) => String(r?.name || "").startsWith(`${id}/versions/`)).length;

            projects.push({
              ...data,
              fileCount,
              versionCount,
            });
          }
        } catch (e) {
          // Se não encontrar project.json, ignoramos ou adicionamos um placeholder
          logger.warn(`[HubAlign] Falha ao carregar project.json para ${id}:`, (e as any).message);
        }
      });

      await Promise.all(fetchPromises);

      // Ordenar por data de atualização (mais recente primeiro)
      projects.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

      await writeHubAlignAudit(req, "HUBALIGN_PROJECTS_LISTED", { count: projects.length });
      return res.status(200).json({ items: projects });
    } catch (err: any) {
      logger.error("[HubAlign] Projects list failure:", err);
      return res.status(500).json({ message: err?.message || "Falha ao listar projetos HubAlign" });
    }
  });

  app.get("/api/hubalign/sessions", requireAuth, requireHubAlignOwner, async (req, res) => {
    try {
      const allTakes = await storage.getAllTakesGrouped();
      const sessions = new Map<
        string,
        {
          id: string;
          title: string;
          productionId: string;
          productionName: string;
          characterNames: Set<string>;
          totalTakeCount: number;
          preferredTakeCount: number;
        }
      >();

      for (const take of allTakes) {
        if (!take.sessionId) continue;
        const existing = sessions.get(take.sessionId) ?? {
          id: take.sessionId,
          title: take.sessionTitle || "Sessão sem título",
          productionId: take.productionId || "",
          productionName: take.productionName || "",
          characterNames: new Set<string>(),
          totalTakeCount: 0,
          preferredTakeCount: 0,
        };
        if (take.characterName) existing.characterNames.add(take.characterName);
        existing.totalTakeCount += 1;
        if (take.isPreferred) existing.preferredTakeCount += 1;
        sessions.set(take.sessionId, existing);
      }

      const items = Array.from(sessions.values())
        .map((session) => ({
          id: session.id,
          title: session.title,
          productionId: session.productionId,
          productionName: session.productionName,
          characterCount: session.characterNames.size,
          takeCount: session.totalTakeCount,
          preferredTakeCount: session.preferredTakeCount,
          totalTakeCount: session.totalTakeCount,
        }))
        .sort((a, b) => a.title.localeCompare(b.title));

      await writeHubAlignAudit(req, "HUBALIGN_SESSIONS_LISTED", { count: items.length });
      return res.status(200).json({ items });
    } catch (err: any) {
      logger.error("[HubAlign] Sessions list failure:", err);
      return res.status(500).json({ message: err?.message || "Falha ao listar sessões do HubAlign" });
    }
  });

  app.get("/api/hubalign/projects/:projectId/status", requireAuth, requireHubAlignOwner, async (req, res) => {
    try {
      const projectId = String(req.params.projectId || "").trim();
      const settings = await storage.getAllSettings();
      const bucket = resolveHubAlignBucket(settings);
      
      const path = projectPath(projectId, "tracks/latest.json");
      let latestVersion = null;
      try {
        const response = await downloadFromSupabaseStorage({ bucket, path });
        if (response.ok) {
          latestVersion = await response.json();
        }
      } catch (e) {
        // Sem versão ainda
      }

      // Buscar histórico de versões
      const versionRows = await listSupabaseStorageObjects({
        bucket,
        prefix: projectPath(projectId, "versions/"),
        limit: 20,
        sortBy: { column: "created_at", order: "desc" }
      });

      return res.status(200).json({
        projectId,
        latestVersion,
        history: versionRows.map((r: any) => ({
          name: r.name,
          updatedAt: r.updated_at,
          size: r.metadata?.size
        })),
        metrics: {
          lastAssemblyTime: latestVersion?.assembledAt || null,
          takesCount: latestVersion?.takes?.length || 0,
          status: latestVersion ? "ready" : "pending"
        }
      });
    } catch (err: any) {
      return res.status(500).json({ message: err?.message || "Falha ao obter status do projeto" });
    }
  });

  app.post("/api/hubalign/projects", requireAuth, requireHubAlignOwner, async (req, res) => {
    const debug: string[] = [];
    try {
      debug.push(`[${new Date().toISOString()}] Iniciando criacao de projeto`);
      const user = (req as any).user;
      const name = String(req.body?.name || "").trim() || `Projeto ${new Date().toLocaleDateString("pt-BR")}`;
      const description = String(req.body?.description || "").trim();
      
      if (!name) {
        debug.push("Erro: Nome do projeto vazio");
        throw new Error("Nome do projeto e obrigatorio");
      }

      const projectId = randomUUID().replace(/-/g, "").slice(0, 16);
      debug.push(`ID gerado: ${projectId}`);
      
      const now = new Date().toISOString();
      const project: HubAlignProject = {
        id: projectId,
        name,
        description,
        status: "draft",
        createdBy: String(user?.id || ""),
        createdAt: now,
        updatedAt: now,
        fileCount: 0,
        versionCount: 0,
      };

      const settings = await storage.getAllSettings();
      const bucket = resolveHubAlignBucket(settings);
      debug.push(`Bucket resolvido: ${bucket}`);

      const path = projectPath(projectId, "project.json");
      debug.push(`Tentando upload para Supabase: ${path}`);
      
      try {
        await uploadJsonToSupabaseStorage({
          bucket,
          path,
          data: project,
        });
        debug.push("Upload de project.json concluido");
      } catch (uploadErr: any) {
        debug.push(`Falha no upload Supabase: ${uploadErr.message}`);
        throw uploadErr;
      }

      await saveProjectBackup(bucket, projectId, { type: "project_created", payload: project });
      debug.push("Backup do projeto salvo");
      
      await writeHubAlignAudit(req, "HUBALIGN_PROJECT_CREATED", { projectId });
      return res.status(201).json({ ...project, debug });
    } catch (err: any) {
      logger.error("[HubAlign] Project creation failure:", { error: err.message, debug });
      return res.status(500).json({ 
        message: err?.message || "Falha ao criar projeto HubAlign",
        debug 
      });
    }
  });

  app.post("/api/hubalign/projects/:projectId/products", requireAuth, requireHubAlignOwner, async (req, res) => {
    try {
      const projectId = String(req.params.projectId || "").trim();
      if (!projectId) {
        return res.status(400).json({ message: "projectId é obrigatório" });
      }
      const payload = createProductSchema.parse(req.body);
      const settings = await storage.getAllSettings();
      const bucket = resolveHubAlignBucket(settings);

      const timeline = payload.timeline.map((item) => ({ ...item }));
      const timelineById = new Map<string, HubAlignProductTake>();
      timeline.forEach((take) => timelineById.set(take.takeId, take));

      const assignments: HubAlignProductAssignment[] = payload.assignments.map((assignment) => {
        const missing = assignment.takeIds.filter((takeId) => !timelineById.has(takeId));
        if (missing.length > 0) {
          throw new Error(`Takes não encontrados na timeline: ${missing.join(", ")}`);
        }
        const takes = assignment.takeIds.map((takeId) => timelineById.get(takeId)!);
        return {
          characterId: assignment.characterId,
          characterName: assignment.characterName,
          voiceActorId: assignment.voiceActorId,
          voiceActorName: assignment.voiceActorName,
          takes,
        };
      });

      const manifest: HubAlignProductManifest = {
        id: randomUUID().replace(/-/g, ""),
        projectId,
        name: payload.name,
        sessionId: payload.sessionId,
        sessionTitle: payload.sessionTitle,
        productionId: payload.productionId,
        productionName: payload.productionName,
        createdAt: new Date().toISOString(),
        status: "pending",
        metadata: {
          assignmentCount: assignments.length,
          takeCount: timeline.length,
        },
        assignments,
        timeline,
        meTrackPath: null,
        finalUrl: null,
        note: payload.note ?? null,
      };

      await saveProductManifest(bucket, projectId, manifest.id, manifest);
      await writeHubAlignAudit(req, "HUBALIGN_PRODUCT_CREATED", { projectId, productId: manifest.id });
      return res.status(201).json({ manifest });
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Payload inválido", issues: err.issues });
      }
      return res.status(500).json({ message: err?.message || "Falha ao criar produto" });
    }
  });

  app.get("/api/hubalign/projects/:projectId/products", requireAuth, requireHubAlignOwner, async (req, res) => {
    try {
      const projectId = String(req.params.projectId || "").trim();
      if (!projectId) {
        return res.status(400).json({ message: "projectId é obrigatório" });
      }
      const settings = await storage.getAllSettings();
      const bucket = resolveHubAlignBucket(settings);
      const prefix = projectPath(projectId, "products/");
      const rows = await listSupabaseStorageObjects({ bucket, prefix, limit: 500 });
      const manifests: HubAlignProductManifest[] = [];
      await Promise.all(
        (rows as any[])
          .map((row) => String(row?.name || ""))
          .filter((name) => name.endsWith("manifest.json"))
          .map(async (relative) => {
            const normalized = relative.replace(/^\/+/, "");
            const manifestPath = normalized.startsWith(prefix) ? normalized : `${prefix}${normalized}`;
            try {
              const response = await downloadFromSupabaseStorage({ bucket, path: manifestPath });
              const data = await response.json();
              manifests.push(data);
            } catch (err) {
              logger.warn("[HubAlign] Falha ao carregar manifest de produto", { path: manifestPath, error: (err as any)?.message });
            }
          })
      );

      await writeHubAlignAudit(req, "HUBALIGN_PRODUCTS_LISTED", { projectId, count: manifests.length });
      return res.status(200).json({ items: manifests });
    } catch (err: any) {
      return res.status(500).json({ message: err?.message || "Falha ao listar produtos" });
    }
  });

  app.delete("/api/hubalign/projects/:projectId/products/:productId", requireAuth, requireHubAlignOwner, async (req, res) => {
    try {
      const projectId = String(req.params.projectId || "").trim();
      const productId = String(req.params.productId || "").trim();
      if (!projectId || !productId) {
        return res.status(400).json({ message: "projectId e productId são obrigatórios" });
      }
      const settings = await storage.getAllSettings();
      const bucket = resolveHubAlignBucket(settings);
      const manifest = await loadProductManifest(bucket, projectId, productId);
      if (!manifest) {
        return res.status(404).json({ message: "Produto não encontrado" });
      }

      const targets = new Set<string>();
      targets.add(productResourcePath(projectId, productId, "manifest.json"));
      if (manifest.finalUrl) targets.add(manifest.finalUrl);
      if (manifest.meTrackPath) targets.add(manifest.meTrackPath);

      for (const targetPath of targets) {
        try {
          await deleteFromSupabaseStorage({ bucket, path: targetPath });
        } catch (err) {
          logger.warn("[HubAlign] Falha ao deletar recurso do produto", { path: targetPath, error: (err as any)?.message });
        }
      }

      await writeHubAlignAudit(req, "HUBALIGN_PRODUCT_DELETED", { projectId, productId });
      return res.status(200).json({ message: "Produto removido" });
    } catch (err: any) {
      return res.status(500).json({ message: err?.message || "Falha ao deletar produto" });
    }
  });

  app.post(
    "/api/hubalign/projects/:projectId/products/:productId/me-upload",
    requireAuth,
    requireHubAlignOwner,
    upload.single("meTrack"),
    async (req, res) => {
      try {
        const projectId = String(req.params.projectId || "").trim();
        const productId = String(req.params.productId || "").trim();
        if (!projectId || !productId) {
          return res.status(400).json({ message: "projectId e productId são obrigatórios" });
        }
        const file = req.file;
        if (!file) {
          return res.status(400).json({ message: "Arquivo ausente" });
        }
        const mime = String(file.mimetype || "").toLowerCase();
        if (!ALLOWED_MIME_TYPES.includes(mime)) {
          return res.status(400).json({ message: "Tipo de arquivo não suportado" });
        }

        const settings = await storage.getAllSettings();
        const bucket = resolveHubAlignBucket(settings);
        const ext = path.extname(String(file.originalname || "").toLowerCase()) || ".wav";
        const targetPath = productResourcePath(projectId, productId, `me${ext}`);
        await uploadToSupabaseStorage({ bucket, path: targetPath, buffer: file.buffer, contentType: mime || "audio/wav" });

        const manifest = await loadProductManifest(bucket, projectId, productId);
        if (!manifest) {
          return res.status(404).json({ message: "Produto não encontrado" });
        }

        if (manifest.finalUrl) {
          try {
            await deleteFromSupabaseStorage({ bucket, path: manifest.finalUrl });
          } catch (err) {
            logger.warn("[HubAlign] Falha ao remover mix anterior", { path: manifest.finalUrl, error: (err as any)?.message });
          }
        }

        const updatedManifest: HubAlignProductManifest = {
          ...manifest,
          meTrackPath: targetPath,
          finalUrl: null,
          status: "pending",
          note: `M&E atualizada em ${new Date().toISOString()}`,
        };

        await saveProductManifest(bucket, projectId, productId, updatedManifest);
        await writeHubAlignAudit(req, "HUBALIGN_PRODUCT_ME_UPLOADED", { projectId, productId, meTrackPath: targetPath });
        return res.status(200).json({ manifest: updatedManifest });
      } catch (err: any) {
        return res.status(500).json({ message: err?.message || "Falha ao fazer upload da M&E" });
      }
    }
  );

  app.post("/api/hubalign/projects/:projectId/products/:productId/mix", requireAuth, requireHubAlignOwner, async (req, res) => {
    const projectId = String(req.params.projectId || "").trim();
    const productId = String(req.params.productId || "").trim();
    if (!projectId || !productId) {
      return res.status(400).json({ message: "projectId e productId são obrigatórios" });
    }
    const settings = await storage.getAllSettings();
    const bucket = resolveHubAlignBucket(settings);
    const manifest = await loadProductManifest(bucket, projectId, productId);
    if (!manifest) {
      return res.status(404).json({ message: "Produto não encontrado" });
    }
    if (!manifest.timeline.length) {
      return res.status(400).json({ message: "Produto não possui timeline para mixar" });
    }

    const baseTempDir = path.join(os.tmpdir(), "hubalign", "mixes");
    await fs.mkdir(baseTempDir, { recursive: true });
    const tempDir = await fs.mkdtemp(path.join(baseTempDir, `${projectId}-${productId}-`));
    const manifestMixing: HubAlignProductManifest = {
      ...manifest,
      status: "mixing",
      note: `Mix iniciado em ${new Date().toISOString()}`,
    };
    await saveProductManifest(bucket, projectId, productId, manifestMixing);

    let localMeTrack: string | null = null;
    try {
      if (manifest.meTrackPath) {
        localMeTrack = await downloadAudioUrlToTemp(manifest.meTrackPath, bucket, tempDir, "me-track");
      } else {
        const totalDuration = Math.max(...manifest.timeline.map((take) => (take.startTimeSeconds ?? 0) + (take.durationSeconds || 0)), 1);
        const silencePath = path.join(tempDir, "silence.wav");
        await generateSilenceTrack(silencePath, totalDuration, { sampleRate: 44100, channels: 2 });
        localMeTrack = silencePath;
      }

      const downloadedTracks: MixTrackInput[] = [];
      for (const take of manifest.timeline) {
        const localPath = await downloadAudioUrlToTemp(take.audioUrl, bucket, tempDir, `take-${take.takeId}`);
        downloadedTracks.push({
          id: take.takeId,
          path: localPath,
          startTimeSeconds: take.startTimeSeconds ?? 0,
          durationSeconds: take.durationSeconds,
        });
      }

      const outputPath = path.join(tempDir, "final.wav");
      await mixTracks({
        tracks: downloadedTracks,
        meTrackPath: localMeTrack,
        outputPath,
        sampleRate: 44100,
        channels: 2,
      });

      const buffer = await fs.readFile(outputPath);
      const finalPath = productResourcePath(projectId, productId, "final.wav");
      await uploadToSupabaseStorage({ bucket, path: finalPath, buffer, contentType: "audio/wav" });

      const readyManifest: HubAlignProductManifest = {
        ...manifestMixing,
        status: "ready",
        finalUrl: finalPath,
        note: `Mix concluído em ${new Date().toISOString()}`,
      };
      await saveProductManifest(bucket, projectId, productId, readyManifest);
      await writeHubAlignAudit(req, "HUBALIGN_PRODUCT_MIXED", { projectId, productId, finalPath });
      return res.status(200).json({ manifest: readyManifest });
    } catch (err: any) {
      const errorManifest: HubAlignProductManifest = {
        ...manifest,
        status: "error",
        note: `Falha na mixagem: ${err?.message || "Não especificado"}`,
      };
      await saveProductManifest(bucket, projectId, productId, errorManifest);
      logger.error("[HubAlign] Mixagem falhou", { projectId, productId, error: err?.message });
      return res.status(500).json({ message: err?.message || "Falha ao mixar produto" });
    } finally {
      try {
        await fs.rm(tempDir, { recursive: true, force: true });
      } catch {}
    }
  });

  // ROTA DE UPLOAD REMOVIDA CONFORME REQUISITO: "ELIMINAR COMPLETAMENTE todas as funcionalidades de upload"
  
  app.get("/api/hubalign/hubdub-takes", requireAuth, requireHubAlignOwner, async (req, res) => {
    try {
      const { search, character, studioId, sessionId } = req.query;
      const includeAllTakes = String(req.query.allTakes || "false").toLowerCase() === "true";
      let allTakes = await storage.getAllTakesGrouped();

      if (!includeAllTakes) {
        allTakes = allTakes.filter((t) => t.isPreferred);
      }
      if (studioId) {
        allTakes = allTakes.filter((t) => t.studioId === studioId);
      }
      if (sessionId) {
        allTakes = allTakes.filter((t) => t.sessionId === sessionId);
      }
      if (character) {
        const lowercase = String(character).toLowerCase();
        allTakes = allTakes.filter((t) => String(t.characterName || "").toLowerCase().includes(lowercase));
      }
      if (search) {
        const s = String(search).toLowerCase();
        allTakes = allTakes.filter(
          (t) =>
            String(t.productionName || "").toLowerCase().includes(s) ||
            String(t.sessionTitle || "").toLowerCase().includes(s) ||
            String(t.voiceActorName || "").toLowerCase().includes(s)
        );
      }

      const uniqueProductions = Array.from(new Set(allTakes.map((t) => t.productionId).filter(Boolean)));
      const startTable = new Map<string, number[]>();
      await Promise.all(
        uniqueProductions.map(async (productionId) => {
          const starts = await loadScriptLineStarts(productionId);
          startTable.set(productionId, starts);
        })
      );

      const items = allTakes.map((t) => {
        const starts = startTable.get(t.productionId) || [];
        const startSeconds = Number.isFinite(starts[t.lineIndex] as number) ? starts[t.lineIndex] : null;
        return {
          ...t,
          startTimeSeconds: startSeconds,
          streamUrl: `/api/hubalign/files/stream?path=${encodeURIComponent(t.audioUrl)}`,
        };
      });

      await writeHubAlignAudit(req, "HUBALIGN_HUBDUB_TAKES_LISTED", { count: items.length });
      return res.status(200).json({ items });
    } catch (err: any) {
      return res.status(500).json({ message: err?.message || "Falha ao buscar takes do HubDub" });
    }
  });

  app.get("/api/hubalign/projects/:projectId/files", requireAuth, requireHubAlignOwner, async (req, res) => {
    try {
      const projectId = String(req.params.projectId || "").trim();
      const settings = await storage.getAllSettings();
      const bucket = resolveHubAlignBucket(settings);
      const rows = await listSupabaseStorageObjects({
        bucket,
        prefix: projectPath(projectId, "files/"),
        limit: 300,
        offset: 0,
        sortBy: { column: "name", order: "asc" },
      });
      const files = (rows as any[]).map((row) => {
        const objectPath = String(row?.name || "");
        const encodedPath = encodeURIComponent(objectPath);
        return {
          name: objectPath.split("/").pop() || objectPath,
          objectPath,
          size: Number(row?.metadata?.size || row?.metadata?.contentLength || 0),
          updatedAt: row?.updated_at || null,
          streamUrl: `/api/hubalign/files/stream?path=${encodedPath}`,
        };
      });
      return res.status(200).json({ items: files });
    } catch (err: any) {
      return res.status(500).json({ message: err?.message || "Falha ao listar arquivos do projeto" });
    }
  });

  app.get("/api/hubalign/files/stream", requireAuth, requireHubAlignOwner, async (req, res) => {
    try {
      // Express decodifica req.query automaticamente.
      // Removemos o decodeURIComponent redundante que causava falha se o caminho contivesse caracteres especiais ou '%'
      const rawPath = String(req.query.path || "").trim();
      const pathOrUrl = rawPath.replace(/^\/+/, "");
      
      if (!pathOrUrl) {
        return res.status(400).json({ message: "Caminho ou URL ausente" });
      }

      const settings = await storage.getAllSettings();
      const bucket = resolveHubAlignBucket(settings);
      const range = String(req.headers.range || "").trim();

      let response;
      if (pathOrUrl.startsWith("http")) {
        const { downloadFromSupabaseStorageUrl } = await import("./lib/supabase");
        response = await downloadFromSupabaseStorageUrl(pathOrUrl, { range });
      } else {
        response = await downloadFromSupabaseStorage({ bucket, path: pathOrUrl }, range ? { range } : undefined);
      }

      // Definimos o status retornado pelo upstream (200 ou 206)
      res.status(response.status);

      res.setHeader("content-type", response.headers.get("content-type") || "audio/wav");
      res.setHeader("accept-ranges", "bytes");
      
      const contentRange = response.headers.get("content-range");
      if (contentRange) res.setHeader("content-range", contentRange);
      
      const contentLength = response.headers.get("content-length");
      if (contentLength) res.setHeader("content-length", contentLength);

      const body = response.body;
      if (!body) return res.status(204).end();

      const { Readable } = await import("stream");
      Readable.fromWeb(body as any).pipe(res);
    } catch (err: any) {
      logger.error("[HubAlign] Stream error:", {
        path: req.query.path,
        message: err?.message,
        stack: err?.stack,
      });
      return res.status(500).json({ message: err?.message || "Falha ao transmitir arquivo" });
    }
  });

  app.post("/api/hubalign/projects/:projectId/tracks/version", requireAuth, requireHubAlignOwner, async (req, res) => {
    try {
      const projectId = String(req.params.projectId || "").trim();
      const versionData = {
        id: randomUUID(),
        projectId,
        createdAt: new Date().toISOString(),
        tracks: Array.isArray(req.body?.tracks) ? req.body.tracks : [],
        playback: req.body?.playback || {},
        note: String(req.body?.note || "").trim(),
      };
      const settings = await storage.getAllSettings();
      const bucket = resolveHubAlignBucket(settings);
      const versionPath = projectPath(projectId, `versions/${Date.now()}_${versionData.id}.json`);
      await uploadJsonToSupabaseStorage({ bucket, path: versionPath, data: versionData });
      await uploadJsonToSupabaseStorage({
        bucket,
        path: projectPath(projectId, "tracks/latest.json"),
        data: versionData,
      });
      await saveProjectBackup(bucket, projectId, { type: "version_saved", versionPath, versionData });
      await writeHubAlignAudit(req, "HUBALIGN_TRACK_VERSION_SAVED", { projectId, versionPath });
      return res.status(201).json(versionData);
    } catch (err: any) {
      return res.status(500).json({ message: err?.message || "Falha ao versionar tracks" });
    }
  });

  app.post("/api/hubalign/projects/:projectId/export", requireAuth, requireHubAlignOwner, async (req, res) => {
    try {
      const projectId = String(req.params.projectId || "").trim();
      const exportPayload = {
        id: randomUUID(),
        projectId,
        createdAt: new Date().toISOString(),
        selectedFiles: Array.isArray(req.body?.selectedFiles) ? req.body.selectedFiles : [],
        timeline: Array.isArray(req.body?.timeline) ? req.body.timeline : [],
      };
      const settings = await storage.getAllSettings();
      const bucket = resolveHubAlignBucket(settings);
      const path = projectPath(projectId, `exports/${Date.now()}_${exportPayload.id}.json`);
      const publicUrl = await uploadJsonToSupabaseStorage({ bucket, path, data: exportPayload });
      await saveProjectBackup(bucket, projectId, { type: "project_exported", exportPath: path });
      await writeHubAlignAudit(req, "HUBALIGN_PROJECT_EXPORTED", { projectId, path });
      return res.status(201).json({ exportId: exportPayload.id, publicUrl });
    } catch (err: any) {
      return res.status(500).json({ message: err?.message || "Falha ao exportar projeto" });
    }
  });

  // NOVA ROTA DE MONTAGEM CRITICA (HUB ALIGN CORE)
  app.post("/api/hubalign/projects/:projectId/assemble", requireAuth, requireHubAlignOwner, async (req, res) => {
    const debug: string[] = [];
    const projectId = String(req.params.projectId || "").trim();
    let createdVersionPath: string | null = null;
    const settings = await storage.getAllSettings();
    const bucket = resolveHubAlignBucket(settings);

    try {
      debug.push(`[${new Date().toISOString()}] Iniciando montagem de track para projeto ${projectId}`);
      const { selectedTakes, timeline } = req.body;

      if (!Array.isArray(selectedTakes) || selectedTakes.length === 0) {
        throw new Error("Nenhum take selecionado para montagem.");
      }

      // 1. Verificar integridade dos arquivos de takes
      debug.push("Verificando integridade dos arquivos...");
      for (const take of selectedTakes) {
        const path = String(take.audioUrl || "").replace(/^\/+/, "");
        if (!path) throw new Error(`Take ${take.id} sem URL de audio.`);
        
        try {
          // Apenas listamos para ver se o arquivo existe (checar integridade basica)
          const name = path.split("/").pop() || "";
          const prefix = path.replace(name, "");
          const objects = await listSupabaseStorageObjects({ bucket, prefix, limit: 1 });
          const exists = (objects as any[]).some(o => o.name === path);
          if (!exists && !path.startsWith("http")) {
             debug.push(`Aviso: Arquivo ${path} nao encontrado no storage (checar se e URL externa)`);
          }
        } catch (e) {
          debug.push(`Erro ao verificar arquivo ${path}: ${(e as any).message}`);
        }
      }

      // 2. Validar nomenclatura para evitar conflitos
      debug.push("Validando nomenclatura dos takes...");
      const names = new Set<string>();
      for (const take of selectedTakes) {
        const name = String(take.characterName || "take") + "_" + String(take.id);
        if (names.has(name)) {
          throw new Error(`Conflito de nomenclatura detectado: ${name}`);
        }
        names.add(name);
      }

      // 3. Gerar versao da track (Algoritmo de Montagem de Timeline)
      debug.push("Gerando timeline da track...");
      const startedAssemblyAt = performance.now();
      const versionId = randomUUID();
      
      // A "montagem" aqui é a criação de um manifesto (Timeline) que o editor pode usar.
      // Não há processamento físico de áudio (renderização/mixagem) no servidor para manter a integridade original dos arquivos.
      const versionData = {
        id: versionId,
        projectId,
        assembledAt: new Date().toISOString(),
        takes: selectedTakes,
        timeline: timeline || [],
        status: "timeline_ready", // Status alterado para refletir que é uma timeline lógica
        metadata: {
            totalDuration: selectedTakes.reduce((acc: number, t: any) => acc + (t.durationSeconds || 0), 0),
            characterCount: new Set(selectedTakes.map((t: any) => t.characterName)).size,
            takeCount: selectedTakes.length
        },
        processingTimeMs: Math.round(performance.now() - startedAssemblyAt),
      };

      createdVersionPath = projectPath(projectId, `versions/timeline_${Date.now()}_${versionId}.json`);
      await uploadJsonToSupabaseStorage({ bucket, path: createdVersionPath, data: versionData });
      
      debug.push(`Timeline salva com sucesso: ${createdVersionPath}`);
      await writeHubAlignAudit(req, "HUBALIGN_TIMELINE_CREATED", { projectId, versionId });

      return res.status(201).json({ 
        message: "Timeline de dublagem montada com sucesso", 
        versionId, 
        debug 
      });

    } catch (err: any) {
      debug.push(`FALHA CRITICA NA MONTAGEM: ${err.message}`);
      
      // 4. ROLLBACK AUTOMATICO
      if (createdVersionPath) {
        debug.push(`Iniciando ROLLBACK: removendo ${createdVersionPath}`);
        try {
          const { deleteFromSupabaseStorage } = await import("./lib/supabase");
          await deleteFromSupabaseStorage({ bucket, path: createdVersionPath });
          debug.push("Rollback: Versao parcial removida com sucesso.");
        } catch (rollbackErr) {
          debug.push(`Falha no rollback: ${(rollbackErr as any).message}`);
        }
      }

      logger.error("[HubAlign] Assembly failure:", { error: err.message, debug });
      return res.status(500).json({ 
        message: err.message || "Falha na montagem da track", 
        debug 
      });
    }
  });
}
