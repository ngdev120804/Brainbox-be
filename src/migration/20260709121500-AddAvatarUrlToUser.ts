import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAvatarUrlToUser20260709121500 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "avatarUrl" VARCHAR(255)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN IF EXISTS "avatarUrl"`);
    }
}
