-- The productivity index is a ratio, and a ratio cannot be extrapolated on its
-- own. Keeping the un-inflated output and input beside each stored run is what
-- lets the future-requirement model fit output against index.
-- Nullable: rows recorded before this change have neither figure.
ALTER TABLE "index" ADD COLUMN IF NOT EXISTS "output_resources" DECIMAL;
ALTER TABLE "index" ADD COLUMN IF NOT EXISTS "input_resources" DECIMAL;
