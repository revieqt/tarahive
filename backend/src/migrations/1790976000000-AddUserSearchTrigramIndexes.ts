import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserSearchTrigramIndexes1790976000000 implements MigrationInterface {
  name = "AddUserSearchTrigramIndexes1790976000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("CREATE EXTENSION IF NOT EXISTS pg_trgm");
    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS "IDX_users_fname_trgm" ON "users" USING GIN ("fname" gin_trgm_ops)'
    );
    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS "IDX_users_lname_trgm" ON "users" USING GIN ("lname" gin_trgm_ops)'
    );
    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS "IDX_users_username_trgm" ON "users" USING GIN ("username" gin_trgm_ops)'
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS "IDX_users_username_trgm"');
    await queryRunner.query('DROP INDEX IF EXISTS "IDX_users_lname_trgm"');
    await queryRunner.query('DROP INDEX IF EXISTS "IDX_users_fname_trgm"');
  }
}