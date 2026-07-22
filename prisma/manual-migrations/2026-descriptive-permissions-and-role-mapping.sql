-- Data-preserving migration for: descriptive Boolean permissions + role mapping (Approach B)
--
-- WHY RAW SQL (not `prisma db push`): db push does NOT rename columns — it drops
-- the old ones and creates the new ones, which would DELETE every stored
-- permission. This script renames + converts in place so existing data survives.
--
-- Safe to run once. Wrapped in a transaction: it all applies or nothing does.
-- After running, `prisma db push` should report the DB is already in sync.

BEGIN;

-- 1) permission: rename the 14 abbreviated TEXT columns to descriptive names and
--    convert "on"/NULL text to real booleans (NOT NULL DEFAULT false).
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT * FROM (VALUES
      ('manage_user',        'can_manage_user_roles'),
      ('access_em',          'can_access_employee_data'),
      ('ae_all',             'access_employee_all'),
      ('ae_sub',             'access_employee_subordinates'),
      ('ae_sel',             'access_employee_selected'),
      ('define_performance', 'can_define_performance_metrics'),
      ('dp_all',             'define_performance_all'),
      ('dp_sub',             'define_performance_subordinates'),
      ('dp_sel',             'define_performance_selected'),
      ('access_hierachy',    'can_access_reporting_hierarchy'),
      ('manage_review',      'can_manage_performance_reviews'),
      ('mr_all',             'manage_reviews_all'),
      ('mr_sub',             'manage_reviews_subordinates'),
      ('mr_sel',             'manage_reviews_selected')
    ) AS t(old_name, new_name)
  LOOP
    EXECUTE format('ALTER TABLE permission RENAME COLUMN %I TO %I', r.old_name, r.new_name);
    EXECUTE format('ALTER TABLE permission ALTER COLUMN %I TYPE boolean USING (COALESCE(%I = ''on'', false))', r.new_name, r.new_name);
    EXECUTE format('ALTER TABLE permission ALTER COLUMN %I SET DEFAULT false', r.new_name);
    EXECUTE format('ALTER TABLE permission ALTER COLUMN %I SET NOT NULL', r.new_name);
  END LOOP;
END $$;

-- 2) roles: add the base_role mapping column.
ALTER TABLE roles ADD COLUMN IF NOT EXISTS base_role varchar(50);

-- 3) pesuser: add display_role, and backfill it from the current role so existing
--    employees still show a role label. (We intentionally do NOT rewrite existing
--    `role` values — the app's resolveEffectiveRole() fallback keeps them safe.)
ALTER TABLE pesuser ADD COLUMN IF NOT EXISTS display_role varchar(255);
UPDATE pesuser SET display_role = role WHERE display_role IS NULL;

COMMIT;
