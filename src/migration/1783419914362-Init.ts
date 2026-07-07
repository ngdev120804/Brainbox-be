import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1783419914362 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create users table
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "user" (
                id SERIAL PRIMARY KEY,
                username VARCHAR(191) NOT NULL UNIQUE,
                "passwordHash" VARCHAR(191) NOT NULL,
                "fullName" VARCHAR(191),
                "createdAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
            )
        `);

        // Notes
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "note" (
                id SERIAL PRIMARY KEY,
                "userId" integer NOT NULL,
                title VARCHAR(191) NOT NULL,
                content text,
                color VARCHAR(50),
                pinned boolean DEFAULT false,
                archived boolean DEFAULT false,
                trashed boolean DEFAULT false,
                "createdAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
                "updatedAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
                CONSTRAINT fk_note_user FOREIGN KEY ("userId") REFERENCES "user"(id) ON DELETE CASCADE
            )
        `);

        // Tags
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "tag" (
                id SERIAL PRIMARY KEY,
                name VARCHAR(191) NOT NULL,
                "userId" integer NOT NULL,
                "createdAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
                CONSTRAINT fk_tag_user FOREIGN KEY ("userId") REFERENCES "user"(id) ON DELETE CASCADE
            )
        `);

        await queryRunner.query(`
            CREATE UNIQUE INDEX IF NOT EXISTS "idx_tag_user_name" ON "tag" ("userId", name);
        `);

        // NoteTag join
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "note_tag" (
                id SERIAL PRIMARY KEY,
                "noteId" integer NOT NULL,
                "tagId" integer NOT NULL,
                CONSTRAINT fk_notetag_note FOREIGN KEY ("noteId") REFERENCES "note"(id) ON DELETE CASCADE,
                CONSTRAINT fk_notetag_tag FOREIGN KEY ("tagId") REFERENCES "tag"(id) ON DELETE CASCADE
            )
        `);

        await queryRunner.query(`
            CREATE UNIQUE INDEX IF NOT EXISTS "idx_notetag_note_tag" ON "note_tag" ("noteId", "tagId");
        `);

        // Checklist items
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "checklist_item" (
                id SERIAL PRIMARY KEY,
                "noteId" integer NOT NULL,
                content text NOT NULL,
                completed boolean DEFAULT false,
                ordinal integer DEFAULT 0,
                "createdAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
                "updatedAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
                CONSTRAINT fk_checklist_note FOREIGN KEY ("noteId") REFERENCES "note"(id) ON DELETE CASCADE
            )
        `);

        // Refresh tokens
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "refresh_token" (
                id SERIAL PRIMARY KEY,
                "tokenHash" VARCHAR(191) NOT NULL,
                "userId" integer NOT NULL,
                "createdAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
                revoked boolean DEFAULT false,
                CONSTRAINT fk_refreshtoken_user FOREIGN KEY ("userId") REFERENCES "user"(id) ON DELETE CASCADE
            )
        `);

        // Activities
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "activity" (
                id SERIAL PRIMARY KEY,
                "userId" integer NOT NULL,
                "noteId" integer,
                type VARCHAR(191) NOT NULL,
                meta jsonb,
                "createdAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
                CONSTRAINT fk_activity_user FOREIGN KEY ("userId") REFERENCES "user"(id) ON DELETE CASCADE,
                CONSTRAINT fk_activity_note FOREIGN KEY ("noteId") REFERENCES "note"(id) ON DELETE SET NULL
            )
        `);

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop in reverse order
        await queryRunner.query(`DROP TABLE IF EXISTS "activity"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "refresh_token"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "checklist_item"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "note_tag"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "tag"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "note"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "user"`);

    }

}
