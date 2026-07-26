-- Tabla recipe_ingredients
-- Vincula cada receta con sus ingredientes y cantidades.
-- Los macros de la receta se calculan sumando (quantity_g / 100) * macro_per_100g de cada food.

create table if not exists recipe_ingredients (
  id               uuid primary key default gen_random_uuid(),
  recipe_id        text not null,         -- referencia al id de la receta en Supabase
  food_id          uuid references foods(id) on delete set null,
  food_name_raw    text not null,         -- texto original del ingrediente (para debug/revisión)
  quantity_g       numeric(8,2),          -- cantidad convertida a gramos o ml
  quantity_raw     text,                  -- cantidad original tal como viene ("½ cdta", "1 ud"...)
  unit_raw         text,                  -- unidad original ("g","ml","cdta","cda","ud"...)
  created_at       timestamptz default now()
);

create index if not exists recipe_ingredients_recipe_id_idx on recipe_ingredients(recipe_id);
create index if not exists recipe_ingredients_food_id_idx   on recipe_ingredients(food_id);

alter table recipe_ingredients enable row level security;
create policy "recipe_ingredients_read" on recipe_ingredients for select using (auth.role() = 'authenticated');

-- Vista: macros calculados por receta desde sus ingredientes
create or replace view recipe_macros_calculated as
select
  ri.recipe_id,
  round(sum(ri.quantity_g / 100.0 * f.kcal)::numeric,    1) as kcal,
  round(sum(ri.quantity_g / 100.0 * f.protein_g)::numeric,2) as protein_g,
  round(sum(ri.quantity_g / 100.0 * f.carbs_g)::numeric,  2) as carbs_g,
  round(sum(ri.quantity_g / 100.0 * f.fat_g)::numeric,    2) as fat_g,
  round(sum(ri.quantity_g / 100.0 * f.fiber_g)::numeric,  2) as fiber_g,
  count(*) as num_ingredients,
  count(ri.food_id) as num_matched   -- ingredientes que encontraron match en foods
from recipe_ingredients ri
left join foods f on f.id = ri.food_id
group by ri.recipe_id;
