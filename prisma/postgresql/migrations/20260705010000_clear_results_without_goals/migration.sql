UPDATE "Result" AS r
SET "targetValue" = 0,
    "achievement" = 0,
    "trafficLight" = 'SEM_META'
WHERE NOT EXISTS (
  SELECT 1
  FROM "Goal" AS g
  WHERE g."indicatorId" = r."indicatorId"
    AND g."year" = EXTRACT(YEAR FROM r."referenceDate")::integer
    AND (
      g."month" = EXTRACT(MONTH FROM r."referenceDate")::integer
      OR (g."month" IS NULL AND g."quarter" = CEIL(EXTRACT(MONTH FROM r."referenceDate") / 3.0)::integer)
      OR (g."month" IS NULL AND g."quarter" IS NULL)
    )
);
