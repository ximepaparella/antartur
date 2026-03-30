-- Normalize legacy difficulty values to canonical set: Baja / Media / Alta
UPDATE "Tour"
SET difficulty = CASE
  WHEN lower(trim(difficulty)) IN ('baja', 'bajo') THEN 'Baja'
  WHEN lower(trim(difficulty)) IN ('media', 'medio') THEN 'Media'
  WHEN lower(trim(difficulty)) IN ('alta', 'dificil', 'difícil') THEN 'Alta'
  ELSE difficulty
END
WHERE difficulty IS NOT NULL;

-- Verification
SELECT difficulty, COUNT(*) AS total
FROM "Tour"
GROUP BY difficulty
ORDER BY difficulty;
