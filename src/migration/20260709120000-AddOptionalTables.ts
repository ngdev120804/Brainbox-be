import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOptionalTables20260709120000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add lastLogin to user
        await queryRunner.query(`
            ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "lastLogin" TIMESTAMP WITHOUT TIME ZONE
        `);

        // Add tags and checklist JSON fields to note (optional, FE may send arrays)
        await queryRunner.query(`
            ALTER TABLE "note" ADD COLUMN IF NOT EXISTS tags jsonb
        `);

        await queryRunner.query(`
            ALTER TABLE "note" ADD COLUMN IF NOT EXISTS checklist jsonb
        `);

        // Add expiresAt to refresh_token
        await queryRunner.query(`
            ALTER TABLE "refresh_token" ADD COLUMN IF NOT EXISTS "expiresAt" TIMESTAMP WITHOUT TIME ZONE
        `);

        // User settings
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "user_settings" (
                id SERIAL PRIMARY KEY,
                "userId" integer NOT NULL,
                prefs jsonb DEFAULT '{}'::jsonb,
                "createdAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
                CONSTRAINT fk_usersettings_user FOREIGN KEY ("userId") REFERENCES "user"(id) ON DELETE CASCADE
            )
        `);

        // Social accounts
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "social_account" (
                id SERIAL PRIMARY KEY,
                "userId" integer NOT NULL,
                provider VARCHAR(191) NOT NULL,
                "providerId" VARCHAR(191) NOT NULL,
                "profileData" jsonb,
                "createdAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
                CONSTRAINT fk_social_user FOREIGN KEY ("userId") REFERENCES "user"(id) ON DELETE CASCADE
            )
        `);

        // Attachments for notes
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "attachment" (
                id SERIAL PRIMARY KEY,
                "noteId" integer NOT NULL,
                filename VARCHAR(255) NOT NULL,
                path VARCHAR(1024),
                mime VARCHAR(191),
                size bigint,
                "createdAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
                CONSTRAINT fk_attachment_note FOREIGN KEY ("noteId") REFERENCES "note"(id) ON DELETE CASCADE
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop new tables
        await queryRunner.query(`DROP TABLE IF EXISTS "attachment"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "social_account"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "user_settings"`);

        // Drop added columns
        await queryRunner.query(`ALTER TABLE "refresh_token" DROP COLUMN IF EXISTS "expiresAt"`);
        await queryRunner.query(`ALTER TABLE "note" DROP COLUMN IF EXISTS checklist`);
        await queryRunner.query(`ALTER TABLE "note" DROP COLUMN IF EXISTS tags`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN IF EXISTS "lastLogin"`);
    }

}
