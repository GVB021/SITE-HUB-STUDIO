-- Migration: Simplify roles to 3 roles (platform_owner, diretor, dublador)
-- Run this script to convert existing users to the new role system

-- ============================================
-- STEP 1: Convert platform-level user roles
-- ============================================

-- Convert admin/director/producer/teacher/engineer roles to diretor
UPDATE users 
SET role = 'diretor' 
WHERE role IN (
  'admin', 
  'director', 
  'diretor',
  'producer', 
  'produtor',
  'teacher',
  'engineer',
  'engenheiro_audio',
  'audio_engineer',
  'studio_admin'
);

-- Convert aluno/voice_actor/student/actor/user roles to dublador
UPDATE users 
SET role = 'dublador' 
WHERE role IN (
  'aluno',
  'voice_actor',
  'student',
  'actor',
  'user'
);

-- Ensure platform_owner stays platform_owner (only borbaggabriel@gmail.com should have this)
-- This is enforced in the application layer (requireAdmin middleware)

-- ============================================
-- STEP 2: Convert studio membership roles
-- ============================================

-- Update studio_memberships table
UPDATE studio_memberships 
SET role = 'diretor' 
WHERE role IN (
  'studio_admin',
  'engenheiro_audio'
);

UPDATE studio_memberships 
SET role = 'dublador' 
WHERE role IN (
  'aluno',
  'voice_actor',
  'student',
  'actor'
);

-- ============================================
-- STEP 3: Convert user_studio_roles table
-- ============================================

-- Convert roles to diretor
UPDATE user_studio_roles 
SET role = 'diretor' 
WHERE role IN (
  'studio_admin',
  'engenheiro_audio'
);

-- Convert roles to dublador
UPDATE user_studio_roles 
SET role = 'dublador' 
WHERE role IN (
  'aluno',
  'voice_actor',
  'student',
  'actor'
);

-- ============================================
-- STEP 4: Convert session_participants roles
-- ============================================

-- Convert session participant roles
UPDATE session_participants 
SET role = 'diretor' 
WHERE role IN (
  'studio_admin',
  'engenheiro_audio'
);

UPDATE session_participants 
SET role = 'dublador' 
WHERE role IN (
  'aluno',
  'voice_actor',
  'student',
  'actor'
);

-- ============================================
-- VERIFICATION QUERY (run after migration)
-- ============================================
-- Check remaining non-standard roles:
-- SELECT DISTINCT role FROM users WHERE role NOT IN ('platform_owner', 'diretor', 'dublador');
-- SELECT DISTINCT role FROM studio_memberships WHERE role NOT IN ('platform_owner', 'diretor', 'dublador', 'pending', 'rejected');
-- SELECT DISTINCT role FROM user_studio_roles WHERE role NOT IN ('platform_owner', 'diretor', 'dublador');
-- SELECT DISTINCT role FROM session_participants WHERE role NOT IN ('platform_owner', 'diretor', 'dublador');
