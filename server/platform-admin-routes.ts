import { Router } from "express";
import { storage } from "./storage";
import { requirePlatformOwner } from "./middleware/admin";
import { z } from "zod";
import { eq, and, count, sql, desc } from "drizzle-orm";
import { users, studios, studioMemberships, sessions, productions, takes, auditLog, insertStudioSchema } from "@shared/schema";
import { db } from "./db";

const router = Router();

// GET /api/platform-admin/overview — global metrics
router.get("/overview", requirePlatformOwner, async (req, res) => {
  try {
    const [
      totalUsers,
      totalStudios,
      totalSessions,
      totalTakes,
      activeUsers,
      todayTakes,
    ] = await Promise.all([
      db.select({ count: count() }).from(users).then((r: any) => Number(r[0]?.count ?? 0)),
      db.select({ count: count() }).from(studios).then((r: any) => Number(r[0]?.count ?? 0)),
      db.select({ count: count() }).from(sessions).then((r: any) => Number(r[0]?.count ?? 0)),
      db.select({ count: count() }).from(takes).then((r: any) => Number(r[0]?.count ?? 0)),
      db.selectDistinct({ userId: users.id }).from(users)
        .where(eq(users.status, "active")).then((r: any) => r.length),
      db.select({ count: count() }).from(takes)
        .where(sql`${takes.createdAt} >= current_date`).then((r: any) => Number(r[0]?.count ?? 0)),
    ]);

    res.json({
      totalUsers,
      totalStudios,
      totalSessions,
      totalTakes,
      activeUsers,
      todayTakes,
    });
  } catch (error) {
    console.error("[platform-admin] overview error", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/platform-admin/studios — list all studios with optional filters
router.get("/studios", requirePlatformOwner, async (req, res) => {
  try {
    const { status, planTier, page = "1", limit = "50" } = req.query as any;
    const offset = (Number(page) - 1) * Number(limit);
    let query = db.select().from(studios).orderBy(desc(studios.createdAt));

    if (status) {
      query = query.where(eq(studios.isActive, status === "active"));
    }
    if (planTier) {
      query = query.where(eq(studios.planTier, planTier));
    }

    const results = await query.limit(Number(limit)).offset(offset);
    const total = await db.select({ count: count() }).from(studios).then((r: any) => Number(r[0]?.count ?? 0));

    res.json({ studios: results, total, page: Number(page), limit: Number(limit) });
  } catch (error) {
    console.error("[platform-admin] studios list error", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/platform-admin/studios — create a studio (platform owner can set owner)
router.post("/studios", requirePlatformOwner, async (req, res) => {
  try {
    const parsed = insertStudioSchema.parse(req.body);
    const { ownerId, ...studioData } = parsed;
    const studio = await storage.createStudio({ ...studioData, ownerId: ownerId || req.user!.id }, req.user!.id, ownerId);
    res.status(201).json(studio);
  } catch (error: any) {
    console.error("[platform-admin] create studio error", error);
    res.status(400).json({ error: error.message });
  }
});

// PATCH /api/platform-admin/studios/:studioId — update studio, plan, suspend
router.patch("/studios/:studioId", requirePlatformOwner, async (req, res) => {
  try {
    const { studioId } = req.params;
    const updates = req.body;
    const [updated] = await db
      .update(studios)
      .set(updates)
      .where(eq(studios.id, studioId))
      .returning();
    if (!updated) return res.status(404).json({ error: "Studio not found" });
    await storage.createAuditLogWithActor(
      { userId: req.user!.id, action: "platform_admin.studio.updated", details: `Updated studio ${studioId}` },
      req.user!.id
    );
    res.json(updated);
  } catch (error: any) {
    console.error("[platform-admin] update studio error", error);
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/platform-admin/studios/:studioId — soft delete/suspend studio
router.delete("/studios/:studioId", requirePlatformOwner, async (req, res) => {
  try {
    const { studioId } = req.params;
    const [deleted] = await db
      .update(studios)
      .set({ isActive: false })
      .where(eq(studios.id, studioId))
      .returning();
    if (!deleted) return res.status(404).json({ error: "Studio not found" });
    await storage.createAuditLogWithActor(
      { userId: req.user!.id, action: "platform_admin.studio.suspended", details: `Suspended studio ${studioId}` },
      req.user!.id
    );
    res.json({ message: "Studio suspended" });
  } catch (error: any) {
    console.error("[platform-admin] suspend studio error", error);
    res.status(400).json({ error: error.message });
  }
});

// GET /api/platform-admin/studios/:studioId/users — list users in a studio
router.get("/studios/:studioId/users", requirePlatformOwner, async (req, res) => {
  try {
    const { studioId } = req.params;
    const memberships = await storage.getStudioMemberships(studioId);
    res.json(memberships);
  } catch (error: any) {
    console.error("[platform-admin] studio users error", error);
    res.status(400).json({ error: error.message });
  }
});

// POST /api/platform-admin/studios/:studioId/users — assign/create user in studio
router.post("/studios/:studioId/users", requirePlatformOwner, async (req, res) => {
  try {
    const { studioId } = req.params;
    const { userId, role, status = "approved" } = req.body;
    const membership = await storage.createMembership({ userId, studioId, role, status });
    await storage.createAuditLogWithActor(
      { userId: req.user!.id, action: "platform_admin.studio.user_added", details: `Added user ${userId} to studio ${studioId} as ${role}` },
      req.user!.id
    );
    res.status(201).json(membership);
  } catch (error: any) {
    console.error("[platform-admin] add studio user error", error);
    res.status(400).json({ error: error.message });
  }
});

// PATCH /api/platform-admin/users/:userId — update any user
router.patch("/users/:userId", requirePlatformOwner, async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;
    const updated = await storage.updateUser(userId, updates);
    await storage.createAuditLogWithActor(
      { userId: req.user!.id, action: "platform_admin.user.updated", details: `Updated user ${userId}` },
      req.user!.id
    );
    res.json(updated);
  } catch (error: any) {
    console.error("[platform-admin] update user error", error);
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/platform-admin/users/:userId — suspend/delete user
router.delete("/users/:userId", requirePlatformOwner, async (req, res) => {
  try {
    const { userId } = req.params;
    await storage.deleteUser(userId);
    await storage.createAuditLogWithActor(
      { userId: req.user!.id, action: "platform_admin.user.deleted", details: `Deleted user ${userId}` },
      req.user!.id
    );
    res.json({ message: "User deleted" });
  } catch (error: any) {
    console.error("[platform-admin] delete user error", error);
    res.status(400).json({ error: error.message });
  }
});

// POST /api/platform-admin/impersonate — start impersonation session (platform owner only)
router.post("/impersonate", requirePlatformOwner, async (req, res) => {
  try {
    const { targetUserId } = req.body;
    if (!targetUserId) return res.status(400).json({ error: "targetUserId required" });

    const targetUser = await storage.getUser(targetUserId);
    if (!targetUser) return res.status(404).json({ error: "Target user not found" });

    // In a real implementation, you’d generate a short-lived JWT or session flag.
    // For now, return a mock token and log.
    const impersonationToken = `impersonate-${req.user!.id}-${targetUserId}-${Date.now()}`;
    await storage.createAuditLogWithActor(
      { userId: req.user!.id, action: "platform_admin.impersonate", details: `Impersonated user ${targetUserId}` },
      req.user!.id
    );
    res.json({ impersonationToken, targetUser });
  } catch (error: any) {
    console.error("[platform-admin] impersonate error", error);
    res.status(400).json({ error: error.message });
  }
});

// GET /api/platform-admin/audits — global audit trail
router.get("/audits", requirePlatformOwner, async (req, res) => {
  try {
    const { page = "1", limit = "100" } = req.query as any;
    const offset = (Number(page) - 1) * Number(limit);
    const logs = await db
      .select()
      .from(auditLog)
      .orderBy(desc(auditLog.createdAt))
      .limit(Number(limit))
      .offset(offset);
    const total = await db.select({ count: count() }).from(auditLog).then((r: any) => Number(r[0]?.count ?? 0));
    res.json({ audits: logs, total, page: Number(page), limit: Number(limit) });
  } catch (error: any) {
    console.error("[platform-admin] audits error", error);
    res.status(400).json({ error: error.message });
  }
});

export default router;
