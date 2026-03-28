import type { Express, Request, Response } from "express";
import { z } from "zod";

import { requireAuth } from "./middleware/auth";
import { storage } from "./storage";
import { normalizePlatformRole, normalizeStudioRole } from "@shared/roles";
import type { Session } from "@shared/schema";

const MASTER_EMAIL = "borbaggabriel@gmail.com";

const approvedTakesQuery = z.object({
  sessionId: z.string().min(1).optional(),
  productionId: z.string().min(1).optional(),
}).refine((value) => Boolean(value.sessionId || value.productionId), {
  message: "Informe sessionId ou productionId",
});

type HubAlignTakeDTO = {
  id: string;
  sessionId: string;
  productionId: string;
  characterName: string;
  voiceActorName: string;
  lineIndex: number;
  timecode: number;
  durationSeconds: number;
  audioUrl: string;
};

function canDownloadAudio(take: any) {
  if (!take?.audioUrl) return false;
  return !String(take.audioUrl).startsWith("discarded://");
}

function serializeTake(take: any): HubAlignTakeDTO {
  const rawTimecode = Number(take.startTimeSeconds ?? take.scriptStartSeconds ?? 0);
  return {
    id: String(take.id),
    sessionId: String(take.sessionId),
    productionId: String(take.productionId),
    characterName: take.characterName || "Personagem",
    voiceActorName: take.voiceActorName || "Sem crédito",
    lineIndex: Number(take.lineIndex ?? 0),
    timecode: Number.isFinite(rawTimecode) ? Math.max(0, rawTimecode) : 0,
    durationSeconds: Math.max(0, Number(take.durationSeconds ?? 0)),
    audioUrl: String(take.audioUrl),
  };
}

async function ensureSessionAccess(req: Request, res: Response, sessionId: string): Promise<Session | null> {
  const session = await storage.getSession(sessionId);
  if (!session) {
    res.status(404).json({ message: "Sessao nao encontrada" });
    return null;
  }

  const user = (req as any).user;
  const platformRole = normalizePlatformRole(user?.role);
  const email = String(user?.email || "").toLowerCase().trim();
  const isMaster = email === MASTER_EMAIL;

  if (platformRole === "owner" || isMaster) {
    return session;
  }

  const studioRoles = (await storage.getUserRolesInStudio(user.id, session.studioId)).map(normalizeStudioRole);
  if (studioRoles.includes("admin")) {
    return session;
  }

  const participants = await storage.getSessionParticipants(sessionId);
  const participant = participants.find((p) => String(p.userId) === String(user.id));
  if (!participant) {
    res.status(403).json({ message: "Acesso negado" });
    return null;
  }

  const participantRole = normalizeStudioRole(participant.role);
  const allowedRoles = new Set(["director", "admin", "owner"]);
  if (!allowedRoles.has(participantRole)) {
    res.status(403).json({ message: "Acesso negado" });
    return null;
  }

  return session;
}

async function ensureProductionAccess(req: Request, res: Response, productionId: string) {
  const production = await storage.getProduction(productionId);
  if (!production) {
    res.status(404).json({ message: "Producao nao encontrada" });
    return null;
  }

  const user = (req as any).user;
  const platformRole = normalizePlatformRole(user?.role);
  const email = String(user?.email || "").toLowerCase().trim();
  const isMaster = email === MASTER_EMAIL;

  if (platformRole === "owner" || isMaster) {
    return production;
  }

  const studioRoles = (await storage.getUserRolesInStudio(user.id, production.studioId)).map(normalizeStudioRole);
  if (!studioRoles.includes("admin")) {
    res.status(403).json({ message: "Acesso negado" });
    return null;
  }

  return production;
}

export function registerHubAlignRoutes(app: Express) {
  app.get("/api/hubalign/approved-takes", requireAuth, async (req, res) => {
    let query: z.infer<typeof approvedTakesQuery>;
    try {
      query = approvedTakesQuery.parse(req.query);
    } catch (error: any) {
      return res.status(400).json({ message: error?.message || "Parametros invalidos" });
    }

    try {
      let takesList: any[] = [];

      if (query.sessionId) {
        const session = await ensureSessionAccess(req, res, query.sessionId);
        if (!session) return;
        takesList = await storage.getSessionTakesWithDetails(query.sessionId);
      } else if (query.productionId) {
        const production = await ensureProductionAccess(req, res, query.productionId);
        if (!production) return;
        takesList = await storage.getProductionTakesWithDetails(query.productionId);
      }

      const approved = takesList
        .filter((take) => take.isPreferred && canDownloadAudio(take))
        .map(serializeTake)
        .sort((a, b) => a.timecode - b.timecode || a.lineIndex - b.lineIndex);

      res.status(200).json({ items: approved });
    } catch (error: any) {
      res.status(500).json({ message: error?.message || "Falha ao carregar takes" });
    }
  });
}
