import { Router } from "express";
import { storage } from "./storage";
import { requireStudioOwner, attachStudioContext } from "./middleware/admin";
import { z } from "zod";
import { eq, and, count, sql, desc } from "drizzle-orm";
import { users, studios, studioMemberships, sessions, productions, takes, characters, insertProductionSchema, insertSessionSchema, insertCharacterSchema, insertStudioMembershipSchema } from "@shared/schema";
import { db } from "./db";

const router = Router();

// GET /api/studio-admin/studios/:studioId/overview — studio metrics
router.get("/studios/:studioId/overview", requireStudioOwner, async (req, res) => {
  try {
    const { studioId } = req.params;
    const stats = await storage.getStudioStats(studioId);
    res.json(stats);
  } catch (error: any) {
    console.error("[studio-admin] overview error", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /api/studio-admin/studios/:studioId/settings — update studio name/logo (read-only plan)
router.patch("/studios/:studioId/settings", requireStudioOwner, async (req, res) => {
  try {
    const { studioId } = req.params;
    const allowed = ["name", "logoUrl", "photoUrl", "website", "instagram", "linkedin", "description"];
    const updates: any = {};
    for (const key of allowed) {
      if (req.body.hasOwnProperty(key)) updates[key] = req.body[key];
    }
    const [updated] = await db
      .update(studios)
      .set(updates)
      .where(eq(studios.id, studioId))
      .returning();
    if (!updated) return res.status(404).json({ error: "Studio not found" });
    await storage.createAuditLogWithActor(
      { userId: req.user!.id, action: "admin.settings.updated", details: `Updated settings for studio ${studioId}` },
      req.user!.id
    );
    res.json(updated);
  } catch (error: any) {
    console.error("[studio-admin] update settings error", error);
    res.status(400).json({ error: error.message });
  }
});

// GET /api/studio-admin/studios/:studioId/users — list members
router.get("/studios/:studioId/users", requireStudioOwner, async (req, res) => {
  try {
    const { studioId } = req.params;
    const memberships = await storage.getStudioMemberships(studioId);
    res.json(memberships);
  } catch (error: any) {
    console.error("[studio-admin] list users error", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/studio-admin/studios/:studioId/invite — invite user (role: director|voice_actor)
router.post("/studios/:studioId/invite", requireStudioOwner, async (req, res) => {
  try {
    const { studioId } = req.params;
    const { userId, role } = req.body;
    if (!["director", "dubber", "admin"].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }
    const membership = await storage.createMembership({ userId, studioId, role, status: "pending" });
    await storage.createAuditLogWithActor(
      { userId: req.user!.id, action: "admin.invited", details: `Invited user ${userId} as ${role} to studio ${studioId}` },
      req.user!.id
    );
    res.status(201).json(membership);
  } catch (error: any) {
    console.error("[studio-admin] invite error", error);
    res.status(400).json({ error: error.message });
  }
});

// PATCH /api/studio-admin/studios/:studioId/users/:userId — change role/status
router.patch("/studios/:studioId/users/:userId", requireStudioOwner, async (req, res) => {
  try {
    const { studioId, userId } = req.params;
    const { role, status } = req.body;
    const membership = await db
      .select()
      .from(studioMemberships)
      .where(and(eq(studioMemberships.studioId, studioId), eq(studioMemberships.userId, userId)))
      .limit(1);
    if (!membership.length) return res.status(404).json({ error: "Membership not found" });
    const updated = await storage.updateMembershipStatus(membership[0].id, status, role);
    await storage.createAuditLogWithActor(
      { userId: req.user!.id, action: "admin.user_updated", details: `Updated user ${userId} in studio ${studioId}` },
      req.user!.id
    );
    res.json(updated);
  } catch (error: any) {
    console.error("[studio-admin] update user error", error);
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/studio-admin/studios/:studioId/users/:userId — remove from studio
router.delete("/studios/:studioId/users/:userId", requireStudioOwner, async (req, res) => {
  try {
    const { studioId, userId } = req.params;
    await db
      .delete(studioMemberships)
      .where(and(eq(studioMemberships.studioId, studioId), eq(studioMemberships.userId, userId)));
    await storage.createAuditLogWithActor(
      { userId: req.user!.id, action: "admin.user_removed", details: `Removed user ${userId} from studio ${studioId}` },
      req.user!.id
    );
    res.json({ message: "User removed from studio" });
  } catch (error: any) {
    console.error("[studio-admin] remove user error", error);
    res.status(400).json({ error: error.message });
  }
});

// GET /api/studio-admin/studios/:studioId/projects — list productions
router.get("/studios/:studioId/projects", requireStudioOwner, async (req, res) => {
  try {
    const { studioId } = req.params;
    const projects = await storage.getProductions(studioId);
    res.json(projects);
  } catch (error: any) {
    console.error("[studio-admin] list projects error", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/studio-admin/studios/:studioId/projects — create production
router.post("/studios/:studioId/projects", requireStudioOwner, async (req, res) => {
  try {
    const { studioId } = req.params;
    const parsed = insertProductionSchema.parse({ ...req.body, studioId });
    const production = await storage.createProduction(parsed);
    await storage.createAuditLogWithActor(
      { userId: req.user!.id, action: "admin.project.created", details: `Created production in studio ${studioId}` },
      req.user!.id
    );
    res.status(201).json(production);
  } catch (error: any) {
    console.error("[studio-admin] create project error", error);
    res.status(400).json({ error: error.message });
  }
});

// PATCH /api/studio-admin/studios/:studioId/projects/:projectId — update production
router.patch("/studios/:studioId/projects/:projectId", requireStudioOwner, async (req, res) => {
  try {
    const { projectId } = req.params;
    const [updated] = await db
      .update(productions)
      .set(req.body)
      .where(eq(productions.id, projectId))
      .returning();
    if (!updated) return res.status(404).json({ error: "Production not found" });
    await storage.createAuditLogWithActor(
      { userId: req.user!.id, action: "admin.project.updated", details: `Updated production ${projectId}` },
      req.user!.id
    );
    res.json(updated);
  } catch (error: any) {
    console.error("[studio-admin] update project error", error);
    res.status(400).json({ error: error.message });
  }
});

// GET /api/studio-admin/studios/:studioId/sessions — list sessions
router.get("/studios/:studioId/sessions", requireStudioOwner, async (req, res) => {
  try {
    const { studioId } = req.params;
    const sessions = await storage.getSessions(studioId);
    res.json(sessions);
  } catch (error: any) {
    console.error("[studio-admin] list sessions error", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/studio-admin/studios/:studioId/sessions — create session
router.post("/studios/:studioId/sessions", requireStudioOwner, async (req, res) => {
  try {
    const { studioId } = req.params;
    const parsed = insertSessionSchema.parse({ ...req.body, studioId });
    const session = await storage.createSession(parsed);
    await storage.createAuditLogWithActor(
      { userId: req.user!.id, action: "admin.session.created", details: `Created session in studio ${studioId}` },
      req.user!.id
    );
    res.status(201).json(session);
  } catch (error: any) {
    console.error("[studio-admin] create session error", error);
    res.status(400).json({ error: error.message });
  }
});

// PATCH /api/studio-admin/studios/:studioId/sessions/:sessionId — update session
router.patch("/studios/:studioId/sessions/:sessionId", requireStudioOwner, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const [updated] = await db
      .update(sessions)
      .set(req.body)
      .where(eq(sessions.id, sessionId))
      .returning();
    if (!updated) return res.status(404).json({ error: "Session not found" });
    await storage.createAuditLogWithActor(
      { userId: req.user!.id, action: "admin.session.updated", details: `Updated session ${sessionId}` },
      req.user!.id
    );
    res.json(updated);
  } catch (error: any) {
    console.error("[studio-admin] update session error", error);
    res.status(400).json({ error: error.message });
  }
});

// GET /api/studio-admin/studios/:studioId/takes — list takes (all)
router.get("/studios/:studioId/takes", requireStudioOwner, async (req, res) => {
  try {
    const { studioId } = req.params;
    // Join sessions to enforce studio scope
    const takesList = await db
      .select()
      .from(takes)
      .innerJoin(sessions, eq(takes.sessionId, sessions.id))
      .where(eq(sessions.studioId, studioId))
      .orderBy(desc(takes.createdAt));
    res.json(takesList.map(row => row.takes));
  } catch (error: any) {
    console.error("[studio-admin] list takes error", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/studio-admin/studios/:studioId/timelines — aggregated timeline data
router.get("/studios/:studioId/timelines", requireStudioOwner, async (req, res) => {
  try {
    const { studioId } = req.params;
    // Example: return sessions with basic timeline data
    const timelineSessions = await db
      .select({
        sessionId: sessions.id,
        title: sessions.title,
        scheduledAt: sessions.scheduledAt,
        durationMinutes: sessions.durationMinutes,
        status: sessions.status,
        productionName: productions.name,
      })
      .from(sessions)
      .innerJoin(productions, eq(sessions.productionId, productions.id))
      .where(eq(sessions.studioId, studioId))
      .orderBy(desc(sessions.scheduledAt));
    res.json(timelineSessions);
  } catch (error: any) {
    console.error("[studio-admin] timelines error", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
