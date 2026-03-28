import { sql, eq } from "drizzle-orm";
import { pgTable, varchar, timestamp } from "drizzle-orm/pg-core";

export const migration_2024_03_22_simplify_roles = pgTable("migration_2024_03_22_simplify_roles", {
  id: varchar("id").primaryKey(),
  executed_at: timestamp("executed_at").defaultNow(),
});

export async function up(db: any) {
  // Update user platform roles
  await db.execute(sql`
    UPDATE users SET role = 'owner' WHERE role = 'platform_owner';
  `);

  // Update studio membership roles
  await db.execute(sql`
    UPDATE studio_memberships SET role = 'admin' WHERE role IN ('studio_owner', 'studio_admin');
  `);
  
  await db.execute(sql`
    UPDATE studio_memberships SET role = 'dubber' WHERE role IN ('voice_actor', 'dublador', 'dubber', 'engenheiro_audio', 'aluno');
  `);

  // Update user studio roles if that table exists
  await db.execute(sql`
    UPDATE user_studio_roles SET role = 'admin' WHERE role IN ('studio_owner', 'studio_admin');
  `);
  
  await db.execute(sql`
    UPDATE user_studio_roles SET role = 'dubber' WHERE role IN ('voice_actor', 'dublador', 'dubber', 'engenheiro_audio', 'aluno');
  `);

  // Update session participants roles
  await db.execute(sql`
    UPDATE session_participants SET role = 'admin' WHERE role IN ('studio_owner', 'studio_admin');
  `);
  
  await db.execute(sql`
    UPDATE session_participants SET role = 'dubber' WHERE role IN ('voice_actor', 'dublador', 'dubber', 'engenheiro_audio', 'aluno');
  `);

  // Update staff roles
  await db.execute(sql`
    UPDATE staff SET role = 'admin' WHERE role IN ('studio_owner', 'studio_admin');
  `);
  
  await db.execute(sql`
    UPDATE staff SET role = 'dubber' WHERE role IN ('voice_actor', 'dublador', 'dubber', 'engenheiro_audio', 'aluno');
  `);

  // Mark migration as executed
  await db.insert(migration_2024_03_22_simplify_roles).values({ id: 'simplify_roles_2024_03_22' });
}

export async function down(db: any) {
  // Revert changes (optional - for completeness)
  await db.execute(sql`
    UPDATE users SET role = 'platform_owner' WHERE role = 'owner';
  `);
  
  await db.execute(sql`
    UPDATE studio_memberships SET role = 'studio_admin' WHERE role = 'admin';
  `);
  
  await db.execute(sql`
    UPDATE studio_memberships SET role = 'voice_actor' WHERE role = 'dubber';
  `);
  
  // Remove migration record
  await db.delete(migration_2024_03_22_simplify_roles).where(eq(migration_2024_03_22_simplify_roles.id, 'simplify_roles_2024_03_22'));
}
