-- Migration: Simplify role system to 4 roles
-- Old roles: platform_owner, studio_owner, studio_admin, director, diretor, voice_actor, dublador, dubber, engenheiro_audio, aluno
-- New roles: owner, admin, director, dubber

BEGIN;

-- Update user platform roles
UPDATE users SET role = 'owner' WHERE role = 'platform_owner';

-- Update studio membership roles
UPDATE studio_memberships SET role = 'admin' WHERE role IN ('studio_owner', 'studio_admin');
UPDATE studio_memberships SET role = 'dubber' WHERE role IN ('voice_actor', 'dublador', 'dubber', 'engenheiro_audio', 'aluno');

-- Update user studio roles if that table exists
UPDATE user_studio_roles SET role = 'admin' WHERE role IN ('studio_owner', 'studio_admin');
UPDATE user_studio_roles SET role = 'dubber' WHERE role IN ('voice_actor', 'dublador', 'dubber', 'engenheiro_audio', 'aluno');

-- Update session participants roles
UPDATE session_participants SET role = 'admin' WHERE role IN ('studio_owner', 'studio_admin');
UPDATE session_participants SET role = 'dubber' WHERE role IN ('voice_actor', 'dublador', 'dubber', 'engenheiro_audio', 'aluno');

-- Update staff roles
UPDATE staff SET role = 'admin' WHERE role IN ('studio_owner', 'studio_admin');
UPDATE staff SET role = 'dubber' WHERE role IN ('voice_actor', 'dublador', 'dubber', 'engenheiro_audio', 'aluno');

-- Log migration completion (using correct column names from schema)
INSERT INTO audit_log (user_id, acting_user_id, action, details, created_at) 
SELECT 
  COALESCE((SELECT id FROM users WHERE role = 'owner' LIMIT 1), 'system'),
  COALESCE((SELECT id FROM users WHERE role = 'owner' LIMIT 1), 'system'),
  'role_migration_completed',
  'Migrated role system from old roles to 4-role system (owner, admin, director, dubber)',
  NOW() WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_log');

COMMIT;

-- Verification queries (run these after migration to verify success)
-- SELECT role, COUNT(*) FROM users GROUP BY role ORDER BY role;
-- SELECT role, COUNT(*) FROM studio_memberships GROUP BY role ORDER BY role;
