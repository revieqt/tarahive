import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPostSystemConstraints1762140000000 implements MigrationInterface {
  name = 'AddPostSystemConstraints1762140000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "UQ_likes_user_post_active"
      ON "likes" ("userId", "postId")
      WHERE "type" = 'post' AND "postId" IS NOT NULL
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "UQ_likes_user_comment_active"
      ON "likes" ("userId", "commentId")
      WHERE "type" = 'comment' AND "commentId" IS NOT NULL
    `);
    await queryRunner.query(`
      DELETE FROM "post_reposts" older
      USING "post_reposts" newer
      WHERE older."userId" = newer."userId"
        AND older."postId" = newer."postId"
        AND (
          older."createdOn" > newer."createdOn"
          OR (older."createdOn" = newer."createdOn" AND older.ctid > newer.ctid)
        )
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "UQ_post_reposts_user_post"
      ON "post_reposts" ("userId", "postId")
    `);
    await queryRunner.query(`
      ALTER TABLE "comments"
      ADD CONSTRAINT "CHK_comments_target"
      CHECK (
        ("type" = 'post' AND "postId" IS NOT NULL AND "journalId" IS NULL)
        OR ("type" = 'journal' AND "postId" IS NULL AND "journalId" IS NOT NULL)
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "likes"
      ADD CONSTRAINT "CHK_likes_target"
      CHECK (
        ("type" = 'post' AND "postId" IS NOT NULL AND "journalId" IS NULL AND "commentId" IS NULL)
        OR ("type" = 'journal' AND "postId" IS NULL AND "journalId" IS NOT NULL AND "commentId" IS NULL)
        OR ("type" = 'comment' AND "postId" IS NULL AND "journalId" IS NULL AND "commentId" IS NOT NULL)
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "likes" DROP CONSTRAINT IF EXISTS "CHK_likes_target"');
    await queryRunner.query('ALTER TABLE "comments" DROP CONSTRAINT IF EXISTS "CHK_comments_target"');
    await queryRunner.query('DROP INDEX IF EXISTS "UQ_likes_user_comment_active"');
    await queryRunner.query('DROP INDEX IF EXISTS "UQ_likes_user_post_active"');
    await queryRunner.query('DROP INDEX IF EXISTS "UQ_post_reposts_user_post"');
  }
}
