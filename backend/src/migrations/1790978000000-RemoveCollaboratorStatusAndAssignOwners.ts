import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveCollaboratorStatusAndAssignOwners1790978000000 implements MigrationInterface {
  name = "RemoveCollaboratorStatusAndAssignOwners1790978000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'UPDATE "itinerary_collaborators" AS collaborator SET "permission" = \'owner\' FROM "itineraries" AS itinerary WHERE collaborator."itineraryId" = itinerary."id" AND collaborator."userId" = itinerary."userId"'
    );
    await queryRunner.query('ALTER TABLE "itinerary_collaborators" DROP COLUMN IF EXISTS "status"');
    await queryRunner.query('DROP TYPE IF EXISTS "itinerary_collaborators_status_enum"');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE TYPE "itinerary_collaborators_status_enum" AS ENUM (\'pending\', \'accepted\')');
    await queryRunner.query(
      'ALTER TABLE "itinerary_collaborators" ADD COLUMN "status" "itinerary_collaborators_status_enum" NOT NULL DEFAULT \'accepted\''
    );
  }
}