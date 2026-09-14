-- Organization name is no longer the tenant identifier: two organizations
-- may legitimately share a name (unrelated companies/schools around the
-- world coincidentally named the same). org.id remains the real, unique
-- identifier — this migration only removes the constraint that used to
-- force names apart. Application-level checks on organization_name in
-- /provision and /availability have already been removed to match.
DROP INDEX "org_name_key";
