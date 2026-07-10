import { MigrationInterface, QueryRunner } from "typeorm";

export class AddClientIdToChecklist20260709123000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "checklist_item" ADD COLUMN IF NOT EXISTS "clientId" VARCHAR(191)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "checklist_item" DROP COLUMN IF EXISTS "clientId"`);
    }
}
