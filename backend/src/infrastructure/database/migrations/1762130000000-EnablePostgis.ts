
import { MigrationInterface, QueryRunner } from 'typeorm';

export class EnablePostgis1762130000000
  implements MigrationInterface
{
  name = 'EnablePostgis1762130000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE EXTENSION IF NOT EXISTS postgis;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP EXTENSION IF EXISTS postgis;
    `);
  }
}
