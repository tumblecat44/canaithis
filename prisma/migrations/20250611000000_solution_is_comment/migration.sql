-- A solution is the reply unit. Preserve old nested comments by promoting them
-- to first-class solutions on the same challenge, then remove the extra layer.
ALTER TABLE "Solution" ALTER COLUMN "githubUrl" DROP NOT NULL;
ALTER TABLE "Solution" ALTER COLUMN "demoUrl" DROP NOT NULL;

INSERT INTO "Solution" (id, content, "githubUrl", "demoUrl", "challengeId", "authorId", "createdAt")
SELECT
  c.id,
  c.content,
  NULL,
  NULL,
  s."challengeId",
  c."authorId",
  c."createdAt"
FROM "Comment" c
JOIN "Solution" s ON s.id = c."solutionId"
WHERE NOT EXISTS (
  SELECT 1 FROM "Solution" existing WHERE existing.id = c.id
);

DROP TABLE "Comment";
