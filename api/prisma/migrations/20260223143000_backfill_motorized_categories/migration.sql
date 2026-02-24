ALTER TABLE category
ADD COLUMN IF NOT EXISTS has_engine BOOLEAN NOT NULL DEFAULT FALSE;

WITH RECURSIVE motorized_categories AS (
  SELECT c.category_id
  FROM category c
  WHERE
    c.slug ~* '(tractor|traktor|combine|kombain|harvest|excavator|ekskavator|loader|navantazhuvach|forklift|telehandler|truck|vantazh|tyahach|bus|avtobus|car|auto|sedan|suv|hatchback|coupe|convertible|pickup|minivan|electric|hybrid)'
    OR lower(c.name) ~ '(tractor|traktor|combine|kombain|harvest|excavator|ekskavator|loader|forklift|telehandler|truck|bus|car|sedan|suv|hatchback|coupe|convertible|pickup|minivan|electric|hybrid|трактор|комбайн|екскаватор|навантажувач|тягач|вантаж|автобус|легков|авто)'
  UNION
  SELECT child.category_id
  FROM category child
  INNER JOIN motorized_categories parent
    ON child.parent_id = parent.category_id
)
UPDATE category c
SET has_engine = TRUE
WHERE c.category_id IN (SELECT category_id FROM motorized_categories);
