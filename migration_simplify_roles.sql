-- Migration: Simplify role system to 4 roles
-- Old roles: platform_owner, studio_owner, studio_admin, director, diretor, voice_actor, dublador, dubber, engenheiro_audio, aluno
-- New roles: owner, admin, director, dubber

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

-- Commit changes
COMMIT;
