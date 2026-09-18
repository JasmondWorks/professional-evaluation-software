-- One-off: tie maintenance runs recorded before 20260902090000 to their machine.
--
-- Those runs stored only the facility's description. Match it back to the
-- register by name within the same org, and lift MTBF out of the results blob
-- into its own column. Only touches rows never linked, so it is safe to repeat.
--
-- Run with:
--   npx --yes dotenv-cli -e .env.production.local -- \
--     npx prisma db execute --file prisma/backfills/20260902_maintenance_run_machine.sql

UPDATE maintenance_run mr
   SET facility_id     = f.id,
       facility_symbol = f.identification_symbol,
       mtbf            = COALESCE(mr.mtbf, (mr.results->>'mtbf')::double precision)
  FROM facilities f
 WHERE f.org = mr.org
   AND lower(trim(f.description_of_facility)) = lower(trim(mr.facility))
   AND mr.facility_id IS NULL;
