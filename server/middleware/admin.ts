import { Request, Response, NextFunction } from "express";
import { storage } from "../storage";
import { InsertAuditLog } from "@shared/schema";

/**
 * requirePlatformOwner — ensures req.user.role === "owner"
 * Throws 403 if not. Logs access attempt.
 */
export async function requirePlatformOwner(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  if ((req.user as any).role !== "owner") {
    await storage.createAuditLogWithActor(
      { userId: (req.user as any).id, action: "platform_admin.denied", details: `Attempted to access platform admin route without owner role` },
      (req.user as any).id
    );
    return res.status(403).json({ error: "Forbidden: owner required" });
  }
  await storage.createAuditLogWithActor(
    { userId: (req.user as any).id, action: "platform_admin.access", details: `Accessed platform admin route: ${req.method} ${req.originalUrl}` },
    (req.user as any).id
  );
  next();
}

/**
 * requireStudioOwner — checks that user has admin role in the given studio.
 * Expects studioId in req.params.studioId, req.body.studioId, or req.query.studioId.
 * Attaches req.studio if found. Throws 403 if not admin. Logs access.
 */
export async function requireStudioOwner(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const studioId =
    (req.params as any).studioId ||
    (req.body as any).studioId ||
    (req.query as any).studioId;
  if (!studioId || typeof studioId !== "string") {
    return res.status(400).json({ error: "Studio ID required" });
  }

  const studio = await storage.getStudio(studioId);
  if (!studio) {
    return res.status(404).json({ error: "Studio not found" });
  }

  const isAdmin = await storage.requireStudioOwner((req.user as any).id, studioId);
  if (!isAdmin) {
    await storage.createAuditLogWithActor(
      { userId: (req.user as any).id, action: "admin.denied", details: `Attempted admin access without admin role for studio ${studioId}` },
      (req.user as any).id
    );
    return res.status(403).json({ error: "Forbidden: admin required for this studio" });
  }

  // Attach studio for downstream handlers
  (req as any).studio = studio;

  await storage.createAuditLogWithActor(
    { userId: (req.user as any).id, action: "admin.access", details: `Accessed admin route for studio ${studioId}: ${req.method} ${req.originalUrl}` },
    (req.user as any).id
  );

  next();
}

/**
 * attachStudioContext — resolves studioId, checks owner OR admin, attaches req.studio.
 * Used for routes where either platform owner or studio admin may access.
 * Logs access.
 */
export async function attachStudioContext(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const studioId =
    (req.params as any).studioId ||
    (req.body as any).studioId ||
    (req.query as any).studioId;

  if (!studioId || typeof studioId !== "string") {
    return res.status(400).json({ error: "Studio ID required" });
  }

  const studio = await storage.getStudio(studioId);
  if (!studio) {
    return res.status(404).json({ error: "Studio not found" });
  }

  // Platform owners bypass; studio admins must own the studio
  if ((req.user as any).role === "owner") {
    (req as any).studio = studio;
    await storage.createAuditLogWithActor(
      { userId: (req.user as any).id, action: "studio_context.access", details: `Platform owner accessed studio context for ${studioId}: ${req.method} ${req.originalUrl}` },
      (req.user as any).id
    );
    return next();
  }

  const isAdmin = await storage.requireStudioOwner((req.user as any).id, studioId);
  if (!isAdmin) {
    await storage.createAuditLogWithActor(
      { userId: (req.user as any).id, action: "studio_context.denied", details: `Attempted studio access without admin role for studio ${studioId}` },
      (req.user as any).id
    );
    return res.status(403).json({ error: "Forbidden: admin or owner required" });
  }

  (req as any).studio = studio;
  await storage.createAuditLogWithActor(
    { userId: (req.user as any).id, action: "studio_context.access", details: `Studio owner accessed context for ${studioId}: ${req.method} ${req.originalUrl}` },
    (req.user as any).id
  );

  next();
}
