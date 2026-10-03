import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOwnerCollaboratorPermission1790977000000 implements MigrationInterface {
  name = "AddOwnerCollaboratorPermission1790977000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TYPE "itinerary_collaborators_permission_enum" ADD VALUE IF NOT EXISTS \'owner\''
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'UPDATE "itinerary_collaborators" SET "permission" = \'edit\' WHERE "permission" = \'owner\''
    );
    await queryRunner.query('ALTER TABLE "itinerary_collaborators" ALTER COLUMN "permission" DROP DEFAULT');
    await queryRunner.query('ALTER TYPE "itinerary_collaborators_permission_enum" RENAME TO "itinerary_collaborators_permission_enum_old"');
    await queryRunner.query('CREATE TYPE "itinerary_collaborators_permission_enum" AS ENUM (\'edit\', \'view\')');
    await queryRunner.query(
      'ALTER TABLE "itinerary_collaborators" ALTER COLUMN "permission" TYPE "itinerary_collaborators_permission_enum" USING "permission"::text::"itinerary_collaborators_permission_enum"'
    );
    await queryRunner.query('ALTER TABLE "itinerary_collaborators" ALTER COLUMN "permission" SET DEFAULT \'view\'');
    await queryRunner.query('DROP TYPE "itinerary_collaborators_permission_enum_old"');
  }
}