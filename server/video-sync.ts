import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "http";
import { pool } from "./db";
import { isPrivilegedStudioRole, normalizePlatformRole, normalizeStudioRole, hasMinStudioRole, isDirectorRole, isDubberRole } from "@shared/roles";

interface SyncMessage {
  type:
    | "video:play"
    | "video:pause"
    | "video:seek"
    | "video:sync"
    | "video:countdown"
    | "video:countdown-start"
    | "video:countdown-tick"
    | "video:loop-preparing"
    | "video:loop-silence-window"
    | "video:sync-loop"
    | "video:take-ready-for-review"
    | "video:take-decision"
    | "grant-permission"
    | "revoke-permission"
    | "toggle-global-control"
    | "revoke-all"
    | "permission-sync"
    | "presence-sync"
    | "presence:update"
    | "text-control:state"
    | "text-control:set-controller"
    | "text-control:clear-controller"
    | "text-control:set-controllers"
    | "text-control:grant-controller"
    | "text-control:revoke-controller"
    | "text-control:update-line"
    | "video:take-status"
    | "video:ack"
    | "text:lock-line"
    | "text:unlock-line"
    | "text:live-change";
  currentTime?: number;
  lineIndex?: number;
  targetUserId?: string;
  targetUserIds?: string[];
  loopRange?: { start: number; end: number } | null;
  userId?: string;
  role?: string;
  globalControl?: boolean;
  permissions?: string[];
  users?: Array<{ userId: string; name: string; role?: string }>;
  controllerUserId?: string | null;
  controllerUserIds?: string[];
  text?: string;
  character?: string;
  start?: number;
  history?: {
    field?: "character" | "text" | "timecode";
    before?: string;
    after?: string;
    by?: string;
  };
  status?: string;
  count?: number;
  initiatorUserId?: string;
  delayMs?: number;
  isPlaying?: boolean;
  // Review flow fields
  takeId?: string;
  audioUrl?: string;
  duration?: number;
  metrics?: any;
  decision?: "approved" | "rejected";
  // Ack fields
  command?: string;
}

const rooms = new Map<string, Set<WebSocket & { userId?: string; role?: string; name?: string; sessionId?: string }>>();
const tempPermissions = new Map<string, Set<string>>();
const globalControlSessions = new Map<string, boolean>();
const textControllerSessions = new Map<string, Set<string>>();
const lineLocks = new Map<string, Map<number, { userId: string; at: number }>>();

function getLineLocks(sessionId: string) {
  if (!lineLocks.has(sessionId)) lineLocks.set(sessionId, new Map());
  return lineLocks.get(sessionId)!;
}

function getTextControllers(sessionId: string) {
  return textControllerSessions.get(sessionId) || new Set<string>();
}

function setTextControllers(sessionId: string, userIds: Iterable<string>) {
  const next = new Set(Array.from(userIds).filter(Boolean));
  if (next.size === 0) {
    textControllerSessions.delete(sessionId);
  } else {
    textControllerSessions.set(sessionId, next);
  }
  return next;
}

function canReceiveTextControl(role: string | undefined) {
  return isDubberRole(role);
}

function getRoster(room: Set<WebSocket & { userId?: string; role?: string; name?: string }>) {
  const users: Array<{ userId: string; name: string; role?: string }> = [];
  room.forEach((ws) => {
    if (!ws.userId) return;
    users.push({ userId: ws.userId, name: ws.name || "Usuario", role: ws.role });
  });
  return users;
}

function broadcast(room: Set<WebSocket>, data: any) {
  const payload = JSON.stringify(data);
  room.forEach((client: any) => {
    if (client.readyState === WebSocket.OPEN) client.send(payload);
  });
}

function parseCookies(header: string | undefined) {
  const out: Record<string, string> = {};
  const raw = String(header || "");
  if (!raw) return out;
  const parts = raw.split(";").map((p) => p.trim()).filter(Boolean);
  for (const part of parts) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const k = part.slice(0, idx).trim();
    const v = part.slice(idx + 1).trim();
    out[k] = v;
  }
  return out;
}

async function getAuthenticatedUserId(req: any) {
  const cookies = parseCookies(req.headers?.cookie);
  const sidCookie = cookies["connect.sid"];
  if (!sidCookie) return null;

  const decoded = decodeURIComponent(sidCookie);
  const signed = decoded.startsWith("s:") ? decoded.slice(2) : decoded;

  let sid: string | null = null;
  try {
    const mod: any = await import("cookie-signature");
    const secret = process.env.SESSION_SECRET || "dev-session-secret";
    const unsigned = mod.unsign(signed, secret);
    if (typeof unsigned === "string" && unsigned) sid = unsigned;
  } catch {
    const cut = signed.split(".")[0];
    sid = cut || null;
  }

  if (!sid) return null;

  const row = await pool.query("select sess from http_sessions where sid = $1 and expire > now() limit 1", [sid]);
  const sess = row.rows?.[0]?.sess;
  const userId = sess?.passport?.user;
  return typeof userId === "string" && userId ? userId : null;
}

async function getWsIdentity(studioId: string, req: any) {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) return null;

  const ures = await pool.query(
    "select id, role, full_name, display_name, email from users where id = $1 limit 1",
    [userId],
  );
  const userRow = ures.rows?.[0];
  if (!userRow?.id) return null;

  const platformRole = normalizePlatformRole(userRow.role);
  const name = String(userRow.display_name || userRow.full_name || userRow.email || "Usuario");

  let studioRole: string | null = null;

  if (platformRole === "platform_owner") {
    studioRole = "platform_owner";
  } else {
    const studioMembership = await pool.query(
      `select coalesce(usr.role, sm.role) as role
       from studio_memberships sm
       left join user_studio_roles usr on usr.membership_id = sm.id
       where sm.studio_id = $1 and sm.user_id = $2 and sm.status = 'approved'
       order by case
         when coalesce(usr.role, sm.role) = 'studio_admin' then 1
         when coalesce(usr.role, sm.role) = 'diretor' then 2
         when coalesce(usr.role, sm.role) = 'engenheiro_audio' then 3
         when coalesce(usr.role, sm.role) = 'dublador' then 4
         when coalesce(usr.role, sm.role) = 'aluno' then 5
         else 99
       end
       limit 1`,
      [studioId, userId],
    );
    const membershipRole = studioMembership.rows?.[0]?.role;
    if (membershipRole) {
      studioRole = normalizeStudioRole(membershipRole);
    }
  }

  if (!studioRole) return null;

  return { userId, role: studioRole, name, platformRole };
}

export function setupVideoSync(httpServer: Server) {
  const wss = new WebSocketServer({ server: httpServer, path: "/ws/video-sync" });

  wss.on("connection", (ws: WebSocket & { userId?: string; role?: string; name?: string; sessionId?: string; studioId?: string }, req) => {
    (async () => {
      const rawUrl = req.url ?? "";
      const url = new URL(rawUrl, `http://${req.headers.host ?? "localhost"}`);
      const studioId = url.searchParams.get("studioId");
      const sessionId = url.searchParams.get("sessionId");

      if (!studioId) {
        ws.close(1008, "studioId required");
        console.log("[WS] Conexão rejeitada: studioId ausente");
        return;
      }

      console.log(`[WS] Nova conexão tentando entrar no estúdio: ${studioId} (Sessão: ${sessionId})`);
      const identity = await getWsIdentity(studioId, req);
      if (!identity) {
        ws.close(1008, "unauthorized");
        console.log(`[WS] Conexão rejeitada: não autorizado no estúdio ${studioId}`);
        return;
      }

      ws.userId = identity.userId;
      ws.role = identity.role;
      ws.name = identity.name;
      ws.studioId = studioId;
      ws.sessionId = sessionId || undefined;

      const roomKey = studioId; // Use Studio ID as the room key

      if (!rooms.has(roomKey)) rooms.set(roomKey, new Set());
      rooms.get(roomKey)!.add(ws);

      const room = rooms.get(roomKey)!;
      const perms = Array.from(tempPermissions.get(roomKey) || []);
      const globalControl = globalControlSessions.get(roomKey) || false;
      const controllerUserIds = Array.from(getTextControllers(roomKey));
      
      console.log(`[WS] Usuário ${identity.name} (${identity.role}) entrou no estúdio ${roomKey}. Total clientes na sala: ${room.size}`);

      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "permission-sync", permissions: perms, globalControl } satisfies SyncMessage));
        ws.send(JSON.stringify({ type: "presence-sync", users: getRoster(room) } satisfies SyncMessage));
        ws.send(JSON.stringify({ type: "text-control:state", controllerUserIds } satisfies SyncMessage));
      }
      
      broadcast(room as any, { type: "presence-sync", users: getRoster(room) } satisfies SyncMessage);
      broadcast(room as any, { type: "text-control:state", controllerUserIds } satisfies SyncMessage);
    })().catch((err) => {
      console.error("[WS] Erro na conexão:", err);
      ws.close(1011, "internal");
    });

    ws.on("message", (data) => {
      try {
        if (!ws.userId || !ws.role || !ws.studioId) {
          console.warn("[WS] Mensagem ignorada: Usuário sem role/id/studioId definido");
          return;
        }
        const msg = JSON.parse(data.toString()) as SyncMessage;
        const roomKey = ws.studioId; // Use Studio ID as room key
        const room = rooms.get(roomKey);
        
        if (!room) {
          console.warn(`[WS] Sala (Estúdio) ${roomKey} não encontrada para mensagem de ${ws.name}`);
          return;
        }

        console.log(`[WS] Recebido ${msg.type} de ${ws.name} (${ws.userId}) no estúdio ${roomKey}`);

        const isPrivileged = isPrivilegedStudioRole(ws.role);
        const controllerUserIds = getTextControllers(roomKey);
        const isController = Boolean(ws.userId && controllerUserIds.has(ws.userId));

        if (
          msg.type === "grant-permission" ||
          msg.type === "revoke-permission" ||
          msg.type === "toggle-global-control" ||
          msg.type === "revoke-all" ||
          msg.type === "text-control:set-controller" ||
          msg.type === "text-control:clear-controller" ||
          msg.type === "text-control:set-controllers" ||
          msg.type === "text-control:grant-controller" ||
          msg.type === "text-control:revoke-controller"
        ) {
          if (!isPrivileged) {
            console.warn(`[WS] Ação administrativa ${msg.type} bloqueada para ${ws.name} (${ws.role})`);
            return;
          }

          if (msg.type === "grant-permission" && msg.targetUserId) {
            if (!tempPermissions.has(roomKey)) tempPermissions.set(roomKey, new Set());
            tempPermissions.get(roomKey)!.add(msg.targetUserId);
          } else if (msg.type === "revoke-permission" && msg.targetUserId) {
            tempPermissions.get(roomKey)?.delete(msg.targetUserId);
          } else if (msg.type === "toggle-global-control") {
            globalControlSessions.set(roomKey, !!msg.globalControl);
          } else if (msg.type === "revoke-all") {
            tempPermissions.get(roomKey)?.clear();
            globalControlSessions.set(roomKey, false);
            textControllerSessions.delete(roomKey);
          } else if (msg.type === "text-control:set-controller" && msg.targetUserId) {
            setTextControllers(roomKey, [msg.targetUserId]);
          } else if (msg.type === "text-control:clear-controller") {
            textControllerSessions.delete(roomKey);
          } else if (msg.type === "text-control:set-controllers") {
            const allowedTargets = (msg.targetUserIds || []).filter((targetUserId) => {
              const target = getRoster(room as any).find((user) => user.userId === targetUserId);
              return canReceiveTextControl(target?.role);
            });
            setTextControllers(roomKey, allowedTargets);
          } else if (msg.type === "text-control:grant-controller" && msg.targetUserId) {
            const target = getRoster(room as any).find((user) => user.userId === msg.targetUserId);
            console.log(`[WS] grant-controller: targetUserId=${msg.targetUserId} target=`, target);
            if (!canReceiveTextControl(target?.role)) {
              console.warn(`[WS] grant-controller bloqueado: role=${target?.role} canReceive=${canReceiveTextControl(target?.role)}`);
              return;
            }
            const next = new Set(getTextControllers(roomKey));
            next.add(msg.targetUserId);
            setTextControllers(roomKey, next);
            console.log(`[WS] grant-controller OK: controllers=${Array.from(next)}`);
          } else if (msg.type === "text-control:revoke-controller" && msg.targetUserId) {
            const target = getRoster(room as any).find((user) => user.userId === msg.targetUserId);
            console.log(`[WS] revoke-controller: targetUserId=${msg.targetUserId} target=`, target);
            if (!canReceiveTextControl(target?.role)) {
              console.warn(`[WS] revoke-controller bloqueado: role=${target?.role}`);
              return;
            }
            const next = new Set(getTextControllers(roomKey));
            next.delete(msg.targetUserId);
            setTextControllers(roomKey, next);
            console.log(`[WS] revoke-controller OK: controllers=${Array.from(next)}`);
          }

          const permissions = Array.from(tempPermissions.get(roomKey) || []);
          const globalControl = globalControlSessions.get(roomKey) || false;
          const controllerUserIds = Array.from(getTextControllers(roomKey));
          broadcast(room as any, { type: "permission-sync", permissions, globalControl } satisfies SyncMessage);
          broadcast(room as any, { type: "text-control:state", controllerUserIds } satisfies SyncMessage);
          return;
        }

        if (msg.type === "text-control:update-line") {
          if (!isPrivileged && !isController) {
             console.warn(`[WS] Edição de texto bloqueada para ${ws.name}`);
             return;
          }
          if (typeof msg.lineIndex !== "number") return;
          if (typeof msg.text !== "string" && typeof msg.character !== "string" && typeof msg.start !== "number") return;

          // Persistir alteração no banco de dados
          const targetLineIndex = msg.lineIndex;
          const targetText = msg.text;
          const targetChar = msg.character;
          const targetStart = msg.start;

          (async () => {
            try {
              // Try to use the session ID from the WebSocket connection if available
              const targetSessionId = ws.sessionId;
              if (!targetSessionId) {
                console.warn("[WS] Cannot persist script: No session ID linked to WebSocket connection");
                return;
              }

              const sessionRes = await pool.query("SELECT production_id FROM recording_sessions WHERE id = $1", [targetSessionId]);
              const productionId = sessionRes.rows[0]?.production_id;

              if (productionId) {
                const prodRes = await pool.query("SELECT script_json FROM productions WHERE id = $1", [productionId]);
                let scriptJson = prodRes.rows[0]?.script_json;
                let script: any = [];
                
                try { 
                  if (typeof scriptJson === 'string') script = JSON.parse(scriptJson);
                  else if (typeof scriptJson === 'object' && scriptJson !== null) script = scriptJson;
                } catch {}
                
                // Handle different script structures ({ lines: [] } or just [])
                if (!Array.isArray(script) && script && typeof script === 'object' && 'lines' in script) {
                   script = (script as any).lines;
                }
                if (!Array.isArray(script)) script = [];

                if (script[targetLineIndex]) {
                  if (targetText !== undefined) script[targetLineIndex].text = targetText;
                  // Fallback para campos comuns de script
                  if (targetText !== undefined) script[targetLineIndex].fala = targetText; 
                  
                  if (targetChar !== undefined) script[targetLineIndex].character = targetChar;
                  if (targetChar !== undefined) script[targetLineIndex].personagem = targetChar;

                  if (targetStart !== undefined) script[targetLineIndex].start = targetStart;
                  if (targetStart !== undefined) script[targetLineIndex].timecode = new Date(targetStart * 1000).toISOString().substr(11, 8); // Simple conversion

                  await pool.query("UPDATE productions SET script_json = $1 WHERE id = $2", [JSON.stringify(script), productionId]);
                  console.log(`[WS] Script persistido para produção ${productionId} linha ${targetLineIndex}`);
                }
              }
            } catch (err) {
              console.error("[WS] Erro ao persistir script:", err);
            }
          })();
        }

        if (msg.type === "video:seek" && typeof msg.lineIndex === "number") {
          if (!isPrivileged && !isController) return;
        }

        // Eventos de revisão de take
        if (msg.type === "video:take-decision") {
          // Apenas Diretores ou superior podem tomar decisão sobre take
          const hasDirectorRole = isDirectorRole(ws.role);
          const isPlatformOwner = ws.role === "platform_owner";
          if (!hasDirectorRole && !isPlatformOwner) {
            console.warn(`[WS] Decisão de take bloqueada para ${ws.name} (${ws.role})`);
            return;
          }
        }

        // ACK de comando de vídeo
        if (msg.type === "video:ack") {
          // Apenas retransmite para que o diretor saiba quem recebeu
          // Não precisa de permissão especial, qualquer um pode confirmar recebimento
        }

        // Bloqueio de linhas de texto (concorrência)
        if (msg.type === "text:lock-line") {
          if (!isPrivileged && !isController) return;
          if (typeof msg.lineIndex !== "number") return;
          const locks = getLineLocks(roomKey);
          const existing = locks.get(msg.lineIndex);
          // Se já bloqueado por outro, ignora (ou poderia enviar erro)
          if (existing && existing.userId !== ws.userId) {
            return;
          }
          locks.set(msg.lineIndex, { userId: ws.userId, at: Date.now() });
        }

        if (msg.type === "text:unlock-line") {
          if (!isPrivileged && !isController) return;
          if (typeof msg.lineIndex !== "number") return;
          const locks = getLineLocks(roomKey);
          const existing = locks.get(msg.lineIndex);
          
          const isDirector = isDirectorRole(ws.role);
          const isOwner = ws.role === "platform_owner";
          const canForceUnlock = isDirector || isOwner;

          // Só quem bloqueou (ou admin/diretor) pode desbloquear
          if (existing) {
            if (existing.userId === ws.userId || canForceUnlock) {
              locks.delete(msg.lineIndex);
            } else {
              // Bloqueado por outro e não sou admin -> ignora
              return;
            }
          }
        }

        // Edição em tempo real (apenas broadcast, sem persistência no backend aqui)
        if (msg.type === "text:live-change") {
          if (typeof msg.lineIndex !== "number") return;
          // Verificar se usuário tem permissão de edição (controller ou privilegiado)
          if (!isPrivileged && !isController) return;
        }

        console.log(`[WS] Fazendo broadcast de ${msg.type} para estúdio ${roomKey}. Remetente: ${ws.name}`);
        
        const clientsInRoom = Array.from(room).map(c => (c as any).name || (c as any).userId);
        console.log(`[WS] Clientes no estúdio ${roomKey}: ${clientsInRoom.join(", ")}`);

        const payload = JSON.stringify({ ...msg, userId: ws.userId });
        let sentCount = 0;
        room.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(payload);
            sentCount++;
          }
        });
        console.log(`[WS] Broadcast enviado para ${sentCount} clientes (total na sala: ${room.size})`);
      } catch (err) {
        console.error("[WS] Erro ao processar mensagem:", err);
      }
    });

    const cleanup = () => {
      const roomKey = ws.studioId;
      if (!roomKey) return;
      
      const room = rooms.get(roomKey);
      if (room) {
        room.delete(ws);
        if (room.size === 0) {
          rooms.delete(roomKey);
        }
        const roster = getRoster(room as any);
        broadcast(room as any, { type: "presence-sync", users: roster } satisfies SyncMessage);
        const controllers = getTextControllers(roomKey);
        if (controllers.size) {
          const next = new Set(Array.from(controllers).filter((id) => roster.some((u) => u.userId === id)));
          if (next.size !== controllers.size) {
            setTextControllers(roomKey, next);
            broadcast(room as any, { type: "text-control:state", controllerUserIds: Array.from(next) } satisfies SyncMessage);
          }
        }
      }
    };

    ws.on("close", cleanup);
    ws.on("error", cleanup);
  });
}
