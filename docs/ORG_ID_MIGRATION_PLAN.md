# Future Work: Organization ID Migration Plan

## Overview
Currently, the application architecture handles multi-tenancy and relational links by passing and storing the **organization name (String)** across almost all database models (e.g., `pesuser`, `appraisal`, `stress`, `personnel_utilization`) and within the JWT payload. 

While currently secured via JWT validation against IDOR, this string-based linkage creates significant **architectural and technical debt**:
1. **Data Integrity Risks:** If an organization rebrands or requests a name change, a cascading `UPDATE` must be manually executed across dozens of tables. Failure to update even one table results in orphaned data.
2. **Re-Registration Vulnerability:** If a company deletes its account and leaves orphaned records, a new company registering with the exact same string name would accidentally inherit the previous company's data.
3. **Performance & Storage:** Storing and indexing a 255-character `VarChar` string as a foreign key across millions of rows is significantly less performant and consumes more storage than an indexed Integer or UUID.

This document outlines the phased implementation plan required to migrate the system from a `String`-based organization linkage to an immutable `org_id` (Integer/UUID).

---

## Migration Strategy

The migration must be handled in carefully orchestrated phases to ensure zero data loss and uninterrupted service.

### Phase 1: Schema Extension (Non-Breaking)
1. **Update Prisma Schema:** Add a new nullable column `org_id Int?` to every model that currently contains `org String? @db.VarChar(255)`.
2. **Establish Foreign Keys:** Map `org_id` as a true relational foreign key to the `org.id` primary key.
3. **Database Migration:** Run `npx prisma migrate` to apply the columns without dropping the existing `org` string columns.

### Phase 2: Dual-Writing & Data Backfill
1. **Update API/Backend Logic:** Modify the user creation and model saving routes to **dual-write**. When a record is created, the backend must save *both* the `org` string and the `org_id` integer.
2. **Update JWT Generation:** Update `app/api/login/route.ts` to include `org_id` in the JWT payload alongside the string name.
3. **Backfill Existing Data:** Write and execute a background script that iterates through all tables. For every record, query the `org` table using the string name, retrieve the `id`, and populate the new `org_id` column.

### Phase 3: Transition Read Operations
1. **Update API Data Fetching:** Refactor all `GET` routes and data retrieval logic to query the database using `where: { org_id: user.org_id }` instead of the string name.
2. **Quality Assurance:** Run the system in staging to verify that all dashboards, models, and history tables load correctly using the integer ID.

### Phase 4: Deprecation and Cleanup (Breaking)
1. **Remove Old Columns:** Once all reads and writes are strictly utilizing `org_id`, remove the `org String?` columns from the Prisma schema.
2. **Final Database Migration:** Run `npx prisma migrate` to permanently drop the legacy string columns from the PostgreSQL database, reclaiming storage space and cementing the new architecture.

---

## Affected Models
The following Prisma models currently rely on `org String` and will require the `org_id` migration:

*   `pesuser`
*   `notifications`
*   `appraisal`
*   `non_academic_appraisal`
*   `staff_appraisal`
*   `stress`
*   `userperformance`
*   `motivation`
*   `staff_motivation` (Note: Currently uses `Int` but must be verified for consistency)
*   `org_structure_results`
*   `personnel_utilization`
*   `personnel_redundancy`
*   `productivity_index`
*   `redundancy_index`
*   `utility_index`
*   `student_teacher_ratio`
*   `staff_number`
*   *(And any other operational research model storing historical data)*
