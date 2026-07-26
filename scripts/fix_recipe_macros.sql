-- Corrección de macros en recipes
-- 321 recetas actualizadas — generado 2026-07-24
-- Mantiene kcal original, recalcula carbs_g / protein_g / fat_g según reglas de dieta

UPDATE recipes SET
  carbs_g = 47.5, protein_g = 19, fat_g = 12.7
  WHERE id = 'porridge_chia_iron';  -- grupo:standard | antes: HC61%/PRT13%/FAT26% → HC50%/PRT20%/FAT30%
UPDATE recipes SET
  carbs_g = 5.3, protein_g = 21, fat_g = 35
  WHERE id = 'tortilla_espinacas_aguacate';  -- grupo:keto | antes: HC11%/PRT23%/FAT64% → HC5%/PRT20%/FAT75%
UPDATE recipes SET
  carbs_g = 36.3, protein_g = 14.5, fat_g = 9.7
  WHERE id = 'smoothie_vegano_chia';  -- grupo:standard | antes: HC62%/PRT12%/FAT28% → HC50%/PRT20%/FAT30%
UPDATE recipes SET
  carbs_g = 38, protein_g = 28.5, fat_g = 12.7
  WHERE id = 'tostada_centeno_salmon';  -- grupo:high_protein | antes: HC27%/PRT23%/FAT47% → HC40%/PRT30%/FAT30%
UPDATE recipes SET
  carbs_g = 24.8, protein_g = 20.6, fat_g = 16.5
  WHERE id = 'chia_pudding_coco';  -- grupo:paleo | antes: HC46%/PRT10%/FAT44% → HC30%/PRT25%/FAT45%
UPDATE recipes SET
  carbs_g = 42.5, protein_g = 17, fat_g = 11.3
  WHERE id = 'tortitas_boniato_lowfodmap';  -- grupo:standard | antes: HC61%/PRT14%/FAT24% → HC50%/PRT20%/FAT30%
UPDATE recipes SET
  carbs_g = 36.3, protein_g = 14.5, fat_g = 9.7
  WHERE id = 'bizcocho_calabacin_arandanos';  -- grupo:standard | antes: HC44%/PRT12%/FAT43% → HC50%/PRT20%/FAT30%
UPDATE recipes SET
  carbs_g = 40.5, protein_g = 33.8, fat_g = 27
  WHERE id = 'salmon_quinoa_brocoli';  -- grupo:low_carb | antes: HC31%/PRT28%/FAT30% → HC30%/PRT25%/FAT45%
UPDATE recipes SET
  carbs_g = 48, protein_g = 36, fat_g = 16
  WHERE id = 'lentejas_verduras_hierro';  -- grupo:high_protein | antes: HC57%/PRT20%/FAT15% → HC40%/PRT30%/FAT30%
UPDATE recipes SET
  carbs_g = 63.8, protein_g = 25.5, fat_g = 17
  WHERE id = 'curry_garbanzos_vegano';  -- grupo:standard | antes: HC61%/PRT14%/FAT21% → HC50%/PRT20%/FAT30%
UPDATE recipes SET
  carbs_g = 5.8, protein_g = 23, fat_g = 38.3
  WHERE id = 'ensalada_atun_huevo_keto';  -- grupo:keto | antes: HC7%/PRT28%/FAT63% → HC5%/PRT20%/FAT75%
UPDATE recipes SET
  carbs_g = 39, protein_g = 32.5, fat_g = 26
  WHERE id = 'cesar_pollo_low_carb';  -- grupo:low_carb | antes: HC9%/PRT32%/FAT55% → HC30%/PRT25%/FAT45%
UPDATE recipes SET
  carbs_g = 54, protein_g = 40.5, fat_g = 18
  WHERE id = 'buddha_tofu_batata';  -- grupo:high_protein | antes: HC46%/PRT19%/FAT30% → HC40%/PRT30%/FAT30%
UPDATE recipes SET
  carbs_g = 36.8, protein_g = 30.6, fat_g = 24.5
  WHERE id = 'ternera_salteada_paleo';  -- grupo:low_carb | antes: HC15%/PRT34%/FAT51% → HC30%/PRT25%/FAT45%
UPDATE recipes SET
  carbs_g = 43.8, protein_g = 17.5, fat_g = 11.7
  WHERE id = 'crema_lentejas_rojas';  -- grupo:standard | antes: HC59%/PRT21%/FAT15% → HC50%/PRT20%/FAT30%
UPDATE recipes SET
  carbs_g = 38, protein_g = 28.5, fat_g = 12.7
  WHERE id = 'merluza_papillote_boniato';  -- grupo:high_protein | antes: HC40%/PRT34%/FAT19% → HC40%/PRT30%/FAT30%
UPDATE recipes SET
  carbs_g = 5.8, protein_g = 23, fat_g = 38.3
  WHERE id = 'salmon_horno_esparragos';  -- grupo:keto | antes: HC7%/PRT30%/FAT63% → HC5%/PRT20%/FAT75%
UPDATE recipes SET
  carbs_g = 6.5, protein_g = 26, fat_g = 43.3
  WHERE id = 'pollo_coco_curry_keto';  -- grupo:keto | antes: HC8%/PRT29%/FAT62% → HC5%/PRT20%/FAT75%
UPDATE recipes SET
  carbs_g = 31.5, protein_g = 26.3, fat_g = 21
  WHERE id = 'pollo_calabaza_keto';  -- grupo:low_carb | antes: HC17%/PRT36%/FAT47% → HC30%/PRT25%/FAT45%
UPDATE recipes SET
  carbs_g = 30.8, protein_g = 25.6, fat_g = 20.5
  WHERE id = 'dorada_plancha_verduras';  -- grupo:low_carb | antes: HC9%/PRT35%/FAT53% → HC30%/PRT25%/FAT45%
UPDATE recipes SET
  carbs_g = 20, protein_g = 15, fat_g = 6.7
  WHERE id = 'sopa_miso_tofu_alga';  -- grupo:high_protein | antes: HC28%/PRT32%/FAT36% → HC40%/PRT30%/FAT30%
UPDATE recipes SET
  carbs_g = 3.5, protein_g = 14, fat_g = 23.3
  WHERE id = 'crema_calabacin_keto';  -- grupo:keto | antes: HC16%/PRT17%/FAT68% → HC5%/PRT20%/FAT75%
UPDATE recipes SET
  carbs_g = 30, protein_g = 25, fat_g = 20
  WHERE id = 'albondigas_pavo_calabacin';  -- grupo:low_carb | antes: HC18%/PRT38%/FAT41% → HC30%/PRT25%/FAT45%
UPDATE recipes SET
  carbs_g = 32.3, protein_g = 26.9, fat_g = 21.5
  WHERE id = 'atun_encebollado_lowcarb';  -- grupo:low_carb | antes: HC11%/PRT37%/FAT50% → HC30%/PRT25%/FAT45%
UPDATE recipes SET
  carbs_g = 58, protein_g = 43.5, fat_g = 19.3
  WHERE id = 'salmon_teriyaki_arroz';  -- grupo:high_protein | antes: HC47%/PRT26%/FAT19% → HC40%/PRT30%/FAT30%
UPDATE recipes SET
  carbs_g = 28.5, protein_g = 23.8, fat_g = 19
  WHERE id = 'merluza_salsa_verde';  -- grupo:low_carb | antes: HC15%/PRT38%/FAT43% → HC30%/PRT25%/FAT45%
UPDATE recipes SET
  carbs_g = 4.5, protein_g = 18, fat_g = 30
  WHERE id = 'gambas_ajillo_calabacin';  -- grupo:keto | antes: HC10%/PRT33%/FAT57% → HC5%/PRT20%/FAT75%
UPDATE recipes SET
  carbs_g = 29.3, protein_g = 24.4, fat_g = 19.5
  WHERE id = 'sardinas_horno_tomate';  -- grupo:low_carb | antes: HC10%/PRT33%/FAT58% → HC30%/PRT25%/FAT45%
UPDATE recipes SET
  carbs_g = 60, protein_g = 24, fat_g = 16
  WHERE id = 'lentejas_estofadas_veganas';  -- grupo:standard | antes: HC57%/PRT20%/FAT15% → HC50%/PRT20%/FAT30%
UPDATE recipes SET
  carbs_g = 24.8, protein_g = 20.6, fat_g = 16.5
  WHERE id = 'chia_pudding_mango';  -- grupo:paleo | antes: HC46%/PRT10%/FAT44% → HC30%/PRT25%/FAT45%
UPDATE recipes SET
  carbs_g = 27.5, protein_g = 11, fat_g = 7.3
  WHERE id = 'crema_cacahuete_manzana_snack';  -- grupo:standard | antes: HC45%/PRT11%/FAT45% → HC50%/PRT20%/FAT30%
UPDATE recipes SET
  carbs_g = 39, protein_g = 32.5, fat_g = 26
  WHERE id = 'pollo_limon_boniato_paleo';  -- grupo:paleo | antes: HC29%/PRT32%/FAT35% → HC30%/PRT25%/FAT45%
UPDATE recipes SET
  carbs_g = 25, protein_g = 10, fat_g = 6.7
  WHERE id = 'chocolate_negro_almendras';  -- grupo:standard | antes: HC24%/PRT10%/FAT68% → HC50%/PRT20%/FAT30%
UPDATE recipes SET
  carbs_g = 5.5, protein_g = 22, fat_g = 36.7
  WHERE id = 'ternera_salteada_pimientos_paleo';  -- grupo:keto | antes: HC11%/PRT35%/FAT55% → HC5%/PRT20%/FAT75%
UPDATE recipes SET
  carbs_g = 31.3, protein_g = 12.5, fat_g = 8.3
  WHERE id = 'manzana_mantequilla_cacahuete';  -- grupo:standard | antes: HC45%/PRT11%/FAT50% → HC50%/PRT20%/FAT30%
UPDATE recipes SET
  carbs_g = 18, protein_g = 15, fat_g = 12
  WHERE id = 'yogur_proteico_canela';  -- grupo:low_carb | antes: HC20%/PRT37%/FAT38% → HC30%/PRT25%/FAT45%
UPDATE recipes SET
  carbs_g = 22.5, protein_g = 9, fat_g = 6
  WHERE id = 'dates_walnuts_simple';  -- grupo:standard | antes: HC71%/PRT7%/FAT30% → HC50%/PRT20%/FAT30%
UPDATE recipes SET
  carbs_g = 52.5, protein_g = 21, fat_g = 14
  WHERE id = 'tortilla_patata_fodmap';  -- grupo:standard | antes: HC32%/PRT17%/FAT51% → HC50%/PRT20%/FAT30%
UPDATE recipes SET
  carbs_g = 15.8, protein_g = 13.1, fat_g = 10.5
  WHERE id = 'batido_proteico_fresa';  -- grupo:low_carb | antes: HC34%/PRT53%/FAT13% → HC30%/PRT25%/FAT45%
UPDATE recipes SET
  carbs_g = 13.5, protein_g = 11.3, fat_g = 9
  WHERE id = 'edamame_sal';  -- grupo:low_carb | antes: HC31%/PRT38%/FAT30% → HC30%/PRT25%/FAT45%
UPDATE recipes SET
  carbs_g = 5.4, protein_g = 21.5, fat_g = 35.8
  WHERE id = 'salmon_papillote_fodmap';  -- grupo:keto | antes: HC7%/PRT32%/FAT61% → HC5%/PRT20%/FAT75%
UPDATE recipes SET
  carbs_g = 26, protein_g = 19.5, fat_g = 8.7
  WHERE id = 'tostada_tomate_atun';  -- grupo:high_protein | antes: HC34%/PRT28%/FAT42% → HC40%/PRT30%/FAT30%
UPDATE recipes SET
  carbs_g = 15, protein_g = 12.5, fat_g = 10
  WHERE id = 'bolitas_cacao_dates';  -- grupo:paleo | antes: HC56%/PRT10%/FAT41% → HC30%/PRT25%/FAT45%
UPDATE recipes SET
  carbs_g = 10.5, protein_g = 8.8, fat_g = 7
  WHERE id = 'pepino_queso_fresco';  -- grupo:low_carb | antes: HC23%/PRT40%/FAT39% → HC30%/PRT25%/FAT45%
UPDATE recipes SET
  carbs_g = 2.3, protein_g = 9, fat_g = 15
  WHERE id = 'huevo_duro_snack_fodmap';  -- grupo:keto | antes: HC11%/PRT29%/FAT60% → HC5%/PRT20%/FAT75%
UPDATE recipes SET
  carbs_g = 42.5, protein_g = 17, fat_g = 11.3
  WHERE id = 'gachas_trigo_sarraceno';  -- grupo:standard | antes: HC66%/PRT12%/FAT24% → HC50%/PRT20%/FAT30%
UPDATE recipes SET
  carbs_g = 3.9, protein_g = 15.5, fat_g = 25.8
  WHERE id = 'muffins_huevo_verduras';  -- grupo:keto | antes: HC8%/PRT31%/FAT61% → HC5%/PRT20%/FAT75%
UPDATE recipes SET
  carbs_g = 45, protein_g = 18, fat_g = 12
  WHERE id = 'porridge_quinoa_manzana';  -- grupo:standard | antes: HC64%/PRT13%/FAT23% → HC50%/PRT20%/FAT30%
UPDATE recipes SET
  carbs_g = 26.3, protein_g = 21.9, fat_g = 17.5
  WHERE id = 'shakshuka_ligera';  -- grupo:low_carb | antes: HC21%/PRT23%/FAT59% → HC30%/PRT25%/FAT45%
UPDATE recipes SET
  carbs_g = 21.8, protein_g = 18.1, fat_g = 14.5
  WHERE id = 'bowl_yogur_coco_kiwi';  -- grupo:paleo | antes: HC44%/PRT8%/FAT50% → HC30%/PRT25%/FAT45%
UPDATE recipes SET
  carbs_g = 60, protein_g = 24, fat_g = 16
  WHERE id = 'ensalada_quinoa_feta_granada';  -- grupo:standard | antes: HC43%/PRT14%/FAT41% → HC50%/PRT20%/FAT30%
UPDATE recipes SET
  carbs_g = 49, protein_g = 36.8, fat_g = 16.3
  WHERE id = 'fideos_arroz_gambas';  -- grupo:high_protein | antes: HC51%/PRT23%/FAT24% → HC40%/PRT30%/FAT30%
UPDATE recipes SET
  carbs_g = 3.6, protein_g = 14.5, fat_g = 24.2
  WHERE id = 'crema_brocoli_almendras';  -- grupo:keto | antes: HC25%/PRT15%/FAT62% → HC5%/PRT20%/FAT75%
UPDATE recipes SET
  carbs_g = 33, protein_g = 27.5, fat_g = 22
  WHERE id = 'trucha_almendras_judias';  -- grupo:low_carb | antes: HC11%/PRT33%/FAT57% → HC30%/PRT25%/FAT45%
UPDATE recipes SET
  carbs_g = 3.3, protein_g = 13, fat_g = 21.7
  WHERE id = 'tabule_coliflor';  -- grupo:keto | antes: HC25%/PRT12%/FAT66% → HC5%/PRT20%/FAT75%
UPDATE recipes SET
  carbs_g = 42, protein_g = 31.5, fat_g = 14
  WHERE id = 'sopa_pollo_jengibre_fodmap';  -- grupo:high_protein | antes: HC46%/PRT30%/FAT19% → HC40%/PRT30%/FAT30%
UPDATE recipes SET
  carbs_g = 27, protein_g = 22.5, fat_g = 18
  WHERE id = 'pisto_huevo_horno';  -- grupo:low_carb | antes: HC27%/PRT18%/FAT55% → HC30%/PRT25%/FAT45%
UPDATE recipes SET
  carbs_g = 4.9, protein_g = 19.5, fat_g = 32.5
  WHERE id = 'calabacines_rellenos_pavo';  -- grupo:keto | antes: HC14%/PRT39%/FAT48% → HC5%/PRT20%/FAT75%
UPDATE recipes SET
  carbs_g = 4, protein_g = 16, fat_g = 26.7
  WHERE id = 'coliflor_asada_tahini';  -- grupo:keto | antes: HC25%/PRT14%/FAT68% → HC5%/PRT20%/FAT75%
UPDATE recipes SET
  carbs_g = 27.8, protein_g = 23.1, fat_g = 18.5
  WHERE id = 'pavo_judias_verdes_fodmap';  -- grupo:low_carb | antes: HC17%/PRT41%/FAT41% → HC30%/PRT25%/FAT45%
UPDATE recipes SET
  carbs_g = 3.9, protein_g = 15.5, fat_g = 25.8
  WHERE id = 'sepia_plancha_ensalada';  -- grupo:keto | antes: HC13%/PRT44%/FAT44% → HC5%/PRT20%/FAT75%
UPDATE recipes SET
  carbs_g = 32.3, protein_g = 26.9, fat_g = 21.5
  WHERE id = 'atun_plancha_pisto';  -- grupo:low_carb | antes: HC15%/PRT37%/FAT48% → HC30%/PRT25%/FAT45%
UPDATE recipes SET
  carbs_g = 2.3, protein_g = 9, fat_g = 15
  WHERE id = 'yogur_coco_arandanos_snack';  -- grupo:keto | antes: HC31%/PRT7%/FAT65% → HC5%/PRT20%/FAT75%
UPDATE recipes SET
  carbs_g = 2.5, protein_g = 10, fat_g = 16.7
  WHERE id = 'zanahoria_guacamole';  -- grupo:keto | antes: HC32%/PRT6%/FAT68% → HC5%/PRT20%/FAT75%
UPDATE recipes SET
  carbs_g = 26.3, protein_g = 10.5, fat_g = 7
  WHERE id = 'barritas_avena_platano';  -- grupo:standard | antes: HC65%/PRT10%/FAT30% → HC50%/PRT20%/FAT30%
UPDATE recipes SET
  carbs_g = 2.1, protein_g = 8.5, fat_g = 14.2
  WHERE id = 'rollitos_pavo_queso';  -- grupo:keto | antes: HC7%/PRT47%/FAT48% → HC5%/PRT20%/FAT75%
UPDATE recipes SET
  carbs_g = 25, protein_g = 10, fat_g = 6.7
  WHERE id = 'pudding_chia_naranja';  -- grupo:standard | antes: HC40%/PRT12%/FAT50% → HC50%/PRT20%/FAT30%
UPDATE recipes SET
  carbs_g = 23.3, protein_g = 19.4, fat_g = 15.5
  WHERE id = 'chia_leche_coco_fodmap';  -- grupo:paleo | antes: HC28%/PRT10%/FAT64% → HC30%/PRT25%/FAT45%
UPDATE recipes SET
  carbs_g = 6.5, protein_g = 26, fat_g = 43.3
  WHERE id = 'salmon_espinacas_keto';  -- grupo:keto | antes: HC5%/PRT32%/FAT61% → HC5%/PRT20%/FAT75%
UPDATE recipes SET
  carbs_g = 56.3, protein_g = 22.5, fat_g = 15
  WHERE id = 'bowl_atun_quinoa_pescatarian';  -- grupo:standard | antes: HC37%/PRT34%/FAT24% → HC50%/PRT20%/FAT30%
UPDATE recipes SET
  carbs_g = 5.3, protein_g = 21, fat_g = 35
  WHERE id = 'pollo_coliflor_arroz_paleo';  -- grupo:keto | antes: HC13%/PRT36%/FAT51% → HC5%/PRT20%/FAT75%
UPDATE recipes SET
  carbs_g = 36.8, protein_g = 30.6, fat_g = 24.5
  WHERE id = 'ensalada_nicoise_pescatarian';  -- grupo:paleo | antes: HC18%/PRT29%/FAT51% → HC30%/PRT25%/FAT45%
UPDATE recipes SET
  carbs_g = 3.5, protein_g = 14, fat_g = 23.3
  WHERE id = 'caldo_huesos_paleo';  -- grupo:keto | antes: HC26%/PRT34%/FAT32% → HC5%/PRT20%/FAT75%
UPDATE recipes SET
  carbs_g = 4.8, protein_g = 19, fat_g = 31.7
  WHERE id = 'lubina_hinojo_fodmap';  -- grupo:keto | antes: HC8%/PRT40%/FAT47% → HC5%/PRT20%/FAT75%
UPDATE recipes SET
  carbs_g = 5.3, protein_g = 21, fat_g = 35
  WHERE id = 'curry_gambas_coco';  -- grupo:keto | antes: HC15%/PRT30%/FAT56% → HC5%/PRT20%/FAT75%
UPDATE recipes SET
  carbs_g = 6.1, protein_g = 24.5, fat_g = 40.8
  WHERE id = 'salmÃ³n_teriyaki_paleo';  -- grupo:keto | antes: HC10%/PRT33%/FAT55% → HC5%/PRT20%/FAT75%
UPDATE recipes SET
  carbs_g = 4.8, protein_g = 19, fat_g = 31.7
  WHERE id = 'tortilla_verduras_fodmap';  -- grupo:keto | antes: HC13%/PRT25%/FAT62% → HC5%/PRT20%/FAT75%
UPDATE recipes SET
  carbs_g = 27, protein_g = 22.5, fat_g = 18
  WHERE id = 'bacalao_pisto_pescatarian';  -- grupo:paleo | antes: HC20%/PRT38%/FAT35% → HC30%/PRT25%/FAT45%
UPDATE recipes SET
  carbs_g = 2.3, protein_g = 9, fat_g = 15
  WHERE id = 'pepino_salmon_ahumado';  -- grupo:keto | antes: HC9%/PRT36%/FAT55% → HC5%/PRT20%/FAT75%
UPDATE recipes SET
  carbs_g = 1.5, protein_g = 6, fat_g = 10
  WHERE id = 'chips_kale_paleo';  -- grupo:keto | antes: HC33%/PRT17%/FAT53% → HC5%/PRT20%/FAT75%
UPDATE recipes SET
  carbs_g = 3.3, protein_g = 13, fat_g = 21.7
  WHERE id = 'huevos_rellenos_pescatarian';  -- grupo:keto | antes: HC6%/PRT31%/FAT62% → HC5%/PRT20%/FAT75%
UPDATE recipes SET
  carbs_g = 6.5, protein_g = 26, fat_g = 43.3
  WHERE id = 'ensalada_pollo_nuez';  -- grupo:keto | antes: HC6%/PRT29%/FAT62% → HC5%/PRT20%/FAT75%
UPDATE recipes SET
  carbs_g = 21, protein_g = 17.5, fat_g = 14
  WHERE id = 'mejillones_vapor_pescatarian';  -- grupo:paleo | antes: HC14%/PRT40%/FAT32% → HC30%/PRT25%/FAT45%
UPDATE recipes SET
  carbs_g = 42, protein_g = 35, fat_g = 28
  WHERE id = 'ternera_boniato_paleo';  -- grupo:paleo | antes: HC26%/PRT27%/FAT32% → HC30%/PRT25%/FAT45%
UPDATE recipes SET
  carbs_g = 4.4, protein_g = 17.5, fat_g = 29.2
  WHERE id = 'gambas_aguacate_lettuce';  -- grupo:keto | antes: HC9%/PRT32%/FAT62% → HC5%/PRT20%/FAT75%
UPDATE recipes SET
  carbs_g = 5.5, protein_g = 22, fat_g = 36.7
  WHERE id = 'pez_espada_ensalada_paleo';  -- grupo:keto | antes: HC7%/PRT38%/FAT53% → HC5%/PRT20%/FAT75%
UPDATE recipes SET
  carbs_g = 52.5, protein_g = 21, fat_g = 14
  WHERE id = 'tortilla_espaÃ±ola_fodmap';  -- grupo:standard | antes: HC27%/PRT21%/FAT47% → HC50%/PRT20%/FAT30%
UPDATE recipes SET
  carbs_g = 21, protein_g = 17.5, fat_g = 14
  WHERE id = 'crema_calabaza_coco_fodmap';  -- grupo:paleo | antes: HC40%/PRT9%/FAT51% → HC30%/PRT25%/FAT45%
UPDATE recipes SET
  carbs_g = 4.5, protein_g = 18, fat_g = 30
  WHERE id = 'atun_tataki_paleo';  -- grupo:keto | antes: HC7%/PRT44%/FAT45% → HC5%/PRT20%/FAT75%
UPDATE recipes SET
  carbs_g = 4.8, protein_g = 19, fat_g = 31.7
  WHERE id = 'brochetas_pollo_pimiento_paleo';  -- grupo:keto | antes: HC15%/PRT38%/FAT43% → HC5%/PRT20%/FAT75%
UPDATE recipes SET
  carbs_g = 4.5, protein_g = 18, fat_g = 30
  WHERE id = 'dorada_limÃ³n_paleo';  -- grupo:keto | antes: HC4%/PRT42%/FAT50% → HC5%/PRT20%/FAT75%
UPDATE recipes SET
  carbs_g = 2.8, protein_g = 11, fat_g = 18.3
  WHERE id = 'sardinas_tomate_fodmap';  -- grupo:keto | antes: HC11%/PRT33%/FAT57% → HC5%/PRT20%/FAT75%
UPDATE recipes SET
  carbs_g = 22.5, protein_g = 9, fat_g = 6
  WHERE id = 'arroz_aguacate_snack';  -- grupo:standard | antes: HC49%/PRT7%/FAT45% → HC50%/PRT20%/FAT30%
UPDATE recipes SET
  carbs_g = 19, protein_g = 14.3, fat_g = 6.3
  WHERE id = 'hummus_verduras_snack';  -- grupo:high_protein | antes: HC42%/PRT17%/FAT38% → HC40%/PRT30%/FAT30%
UPDATE recipes SET
  carbs_g = 12.8, protein_g = 10.6, fat_g = 8.5
  WHERE id = 'yogur_frutos_rojos';  -- grupo:low_carb | antes: HC42%/PRT33%/FAT16% → HC30%/PRT25%/FAT45%
UPDATE recipes SET
  carbs_g = 2.5, protein_g = 10, fat_g = 16.7
  WHERE id = 'almendras_chocolate_negro';  -- grupo:keto | antes: HC24%/PRT10%/FAT72% → HC5%/PRT20%/FAT75%
UPDATE recipes SET
  carbs_g = 30, protein_g = 12, fat_g = 8
  WHERE id = 'guacamole_nachos';  -- grupo:standard | antes: HC37%/PRT5%/FAT60% → HC50%/PRT20%/FAT30%
UPDATE recipes SET
  carbs_g = 16.5, protein_g = 13.8, fat_g = 11
  WHERE id = 'platano_mantequilla_almendras';  -- grupo:paleo | antes: HC55%/PRT9%/FAT37% → HC30%/PRT25%/FAT45%
UPDATE recipes SET
  carbs_g = 15, protein_g = 11.3, fat_g = 5
  WHERE id = 'edamame_sal_marina';  -- grupo:high_protein | antes: HC29%/PRT32%/FAT30% → HC40%/PRT30%/FAT30%
UPDATE recipes SET
  carbs_g = 42.5, protein_g = 17, fat_g = 11.3
  WHERE id = 'smoothie_bowl_tropical';  -- grupo:standard | antes: HC71%/PRT9%/FAT21% → HC50%/PRT20%/FAT30%
UPDATE recipes SET
  carbs_g = 38, protein_g = 28.5, fat_g = 12.7
  WHERE id = 'overnight_oats_manzana';  -- grupo:high_protein | antes: HC61%/PRT13%/FAT24% → HC40%/PRT30%/FAT30%
UPDATE recipes SET
  carbs_g = 26, protein_g = 19.5, fat_g = 8.7
  WHERE id = 'tofu_revuelto';  -- grupo:high_protein | antes: HC18%/PRT28%/FAT48% → HC40%/PRT30%/FAT30%
UPDATE recipes SET
  carbs_g = 38, protein_g = 28.5, fat_g = 12.7
  WHERE id = 'tostada_salmon_aguacate';  -- grupo:high_protein | antes: HC29%/PRT21%/FAT38% → HC40%/PRT30%/FAT30%
UPDATE recipes SET
  carbs_g = 31, protein_g = 23.3, fat_g = 10.3
  WHERE id = 'batido_proteina_frutos_rojos';  -- grupo:high_protein | antes: HC39%/PRT36%/FAT15% → HC40%/PRT30%/FAT30%
UPDATE recipes SET
  carbs_g = 32, protein_g = 24, fat_g = 10.7
  WHERE id = 'sopa_lentejas_rojas';  -- grupo:high_protein | antes: HC60%/PRT23%/FAT14% → HC40%/PRT30%/FAT30%
UPDATE recipes SET
  carbs_g = 42, protein_g = 31.5, fat_g = 14
  WHERE id = 'bowl_quinoa_judias_negras';  -- grupo:high_protein | antes: HC55%/PRT17%/FAT21% → HC40%/PRT30%/FAT30%
UPDATE recipes SET
  carbs_g = 27, protein_g = 22.5, fat_g = 18
  WHERE id = 'ensalada_atun_plancha';  -- grupo:low_carb | antes: HC13%/PRT42%/FAT40% → HC30%/PRT25%/FAT45%
UPDATE recipes SET
  carbs_g = 24, protein_g = 20, fat_g = 16
  WHERE id = 'wraps_pavo_lechuga';  -- grupo:low_carb | antes: HC15%/PRT35%/FAT51% → HC30%/PRT25%/FAT45%
UPDATE recipes SET
  carbs_g = 3.6, protein_g = 14.5, fat_g = 24.2
  WHERE id = 'lubina_horno_limón';  -- grupo:keto | antes: HC3%/PRT50%/FAT43% → HC5%/PRT20%/FAT75%
UPDATE recipes SET
  carbs_g = 38, protein_g = 28.5, fat_g = 12.7
  WHERE id = 'pollo_tikka_ligero';  -- grupo:high_protein | antes: HC19%/PRT40%/FAT33% → HC40%/PRT30%/FAT30%
UPDATE recipes SET
  carbs_g = 36, protein_g = 27, fat_g = 12
  WHERE id = 'dahl_lentejas';  -- grupo:high_protein | antes: HC58%/PRT22%/FAT18% → HC40%/PRT30%/FAT30%
UPDATE recipes SET
  carbs_g = 40, protein_g = 16, fat_g = 10.7
  WHERE id = 'berenjena_parmigiana';  -- grupo:standard | antes: HC35%/PRT18%/FAT42% → HC50%/PRT20%/FAT30%
UPDATE recipes SET
  carbs_g = 41, protein_g = 30.8, fat_g = 13.7
  WHERE id = 'salmon_miso_jengibre';  -- grupo:high_protein | antes: HC8%/PRT35%/FAT57% → HC40%/PRT30%/FAT30%
UPDATE recipes SET
  carbs_g = 43.8, protein_g = 17.5, fat_g = 11.7
  WHERE id = 'curry_verduras_coco';  -- grupo:standard | antes: HC46%/PRT9%/FAT46% → HC50%/PRT20%/FAT30%
UPDATE recipes SET
  carbs_g = 3.5, protein_g = 14, fat_g = 23.3
  WHERE id = 'pasta_calabacin_pesto';  -- grupo:keto | antes: HC20%/PRT11%/FAT71% → HC5%/PRT20%/FAT75%
UPDATE recipes SET
  carbs_g = 4.3, protein_g = 17, fat_g = 28.3
  WHERE id = 'pollo_limon_alcaparras';  -- grupo:keto | antes: HC5%/PRT45%/FAT48% → HC5%/PRT20%/FAT75%
UPDATE recipes SET
  carbs_g = 45, protein_g = 18, fat_g = 12
  WHERE id = 'tortilla_española_ligera';  -- grupo:standard | antes: HC36%/PRT20%/FAT40% → HC50%/PRT20%/FAT30%
UPDATE recipes SET
  carbs_g = 46, protein_g = 34.5, fat_g = 15.3
  WHERE id = 'bol_buddha_tahini';  -- grupo:high_protein | antes: HC45%/PRT14%/FAT35% → HC40%/PRT30%/FAT30%
UPDATE recipes SET
  carbs_g = 13.5, protein_g = 11.3, fat_g = 9
  WHERE id = 'datiles_tahini_snack';  -- grupo:paleo | antes: HC62%/PRT9%/FAT35% → HC30%/PRT25%/FAT45%
UPDATE recipes SET
  carbs_g = 29, protein_g = 21.8, fat_g = 9.7
  WHERE id = 'batido_preentrenamiento';  -- grupo:high_protein | antes: HC52%/PRT33%/FAT9% → HC40%/PRT30%/FAT30%
UPDATE recipes SET
  carbs_g = 38.8, protein_g = 15.5, fat_g = 10.3
  WHERE id = 'tostada_aguacate_huevo';  -- grupo:standard | antes: HC34%/PRT18%/FAT46% → HC50%/PRT20%/FAT30%
UPDATE recipes SET
  carbs_g = 47.5, protein_g = 19, fat_g = 12.7
  WHERE id = 'granola_casera_sin_azucar';  -- grupo:standard | antes: HC44%/PRT11%/FAT43% → HC50%/PRT20%/FAT30%
UPDATE recipes SET
  carbs_g = 35, protein_g = 14, fat_g = 9.3
  WHERE id = 'huevos_turcos';  -- grupo:standard | antes: HC14%/PRT23%/FAT58% → HC50%/PRT20%/FAT30%
UPDATE recipes SET
  carbs_g = 42, protein_g = 31.5, fat_g = 14
  WHERE id = 'ensalada_nicoise';  -- grupo:high_protein | antes: HC27%/PRT29%/FAT39% → HC40%/PRT30%/FAT30%
UPDATE recipes SET
  carbs_g = 13.5, protein_g = 11.3, fat_g = 9
  WHERE id = 'gazpacho_andaluz';  -- grupo:low_carb | antes: HC49%/PRT9%/FAT40% → HC30%/PRT25%/FAT45%
UPDATE recipes SET
  carbs_g = 42, protein_g = 31.5, fat_g = 14
  WHERE id = 'musaka_ligera';  -- grupo:high_protein | antes: HC27%/PRT27%/FAT43% → HC40%/PRT30%/FAT30%
UPDATE recipes SET
  carbs_g = 21.8, protein_g = 18.1, fat_g = 14.5
  WHERE id = 'bacalao_tomate_aceitunas';  -- grupo:low_carb | antes: HC14%/PRT47%/FAT31% → HC30%/PRT25%/FAT45%
UPDATE recipes SET
  carbs_g = 34.5, protein_g = 28.8, fat_g = 23
  WHERE id = 'estofado_ternera_boniato';  -- grupo:paleo | antes: HC33%/PRT31%/FAT23% → HC30%/PRT25%/FAT45%
UPDATE recipes SET
  carbs_g = 3.5, protein_g = 14, fat_g = 23.3
  WHERE id = 'gambas_ajillo';  -- grupo:keto | antes: HC6%/PRT40%/FAT51% → HC5%/PRT20%/FAT75%
UPDATE recipes SET
  carbs_g = 4.9, protein_g = 19.5, fat_g = 32.5
  WHERE id = 'pechugas_rellenas_espinacas';  -- grupo:keto | antes: HC4%/PRT45%/FAT46% → HC5%/PRT20%/FAT75%
UPDATE recipes SET
  carbs_g = 38, protein_g = 28.5, fat_g = 12.7
  WHERE id = 'trucha_almendras';  -- grupo:high_protein | antes: HC6%/PRT36%/FAT57% → HC40%/PRT30%/FAT30%
UPDATE recipes SET
  carbs_g = 49, protein_g = 36.8, fat_g = 16.3
  WHERE id = 'pasta_integral_bolognesa_vegana';  -- grupo:high_protein | antes: HC59%/PRT16%/FAT18% → HC40%/PRT30%/FAT30%
UPDATE recipes SET
  carbs_g = 23.3, protein_g = 19.4, fat_g = 15.5
  WHERE id = 'pulpo_gallega';  -- grupo:low_carb | antes: HC31%/PRT36%/FAT23% → HC30%/PRT25%/FAT45%
UPDATE recipes SET
  carbs_g = 16.5, protein_g = 13.8, fat_g = 11
  WHERE id = 'galletas_mantequilla_almendras';  -- grupo:low_carb | antes: HC29%/PRT13%/FAT57% → HC30%/PRT25%/FAT45%
UPDATE recipes SET
  carbs_g = 38, protein_g = 28.5, fat_g = 12.7
  WHERE id = 'ensalada_garbanzos_espinacas';  -- grupo:high_protein | antes: HC46%/PRT17%/FAT33% → HC40%/PRT30%/FAT30%
UPDATE recipes SET
  carbs_g = 42, protein_g = 31.5, fat_g = 14
  WHERE id = 'muslos_pollo_naranja';  -- grupo:high_protein | antes: HC13%/PRT32%/FAT51% → HC40%/PRT30%/FAT30%
UPDATE recipes SET
  carbs_g = 3.9, protein_g = 15.5, fat_g = 25.8
  WHERE id = 'pastel_coliflor_jamon';  -- grupo:keto | antes: HC18%/PRT31%/FAT46% → HC5%/PRT20%/FAT75%
UPDATE recipes SET
  carbs_g = 38, protein_g = 28.5, fat_g = 12.7
  WHERE id = 'hamburguesa_atun_casera';  -- grupo:high_protein | antes: HC19%/PRT36%/FAT43% → HC40%/PRT30%/FAT30%
UPDATE recipes SET
  carbs_g = 36, protein_g = 27, fat_g = 12
  WHERE id = 'pollo_zanahoria_jengibre_lf';  -- grupo:high_protein | antes: HC20%/PRT40%/FAT35% → HC40%/PRT30%/FAT30%
UPDATE recipes SET
  carbs_g = 42.5, protein_g = 17, fat_g = 11.3
  WHERE id = 'tortilla_patata_lf';  -- grupo:standard | antes: HC35%/PRT19%/FAT42% → HC50%/PRT20%/FAT30%
UPDATE recipes SET
  carbs_g = 67.5, protein_g = 27, fat_g = 18
  WHERE id = 'pollo_pesto_pasta';  -- grupo:standard | antes: HC34%/PRT31%/FAT23% → HC50%/PRT20%/FAT30%
UPDATE recipes SET
  carbs_g = 47.5, protein_g = 19, fat_g = 12.7
  WHERE id = 'estofado_lentejas_verduras';  -- grupo:standard | antes: HC55%/PRT19%/FAT19% → HC50%/PRT20%/FAT30%
UPDATE recipes SET
  carbs_g = 3.8, protein_g = 15, fat_g = 25
  WHERE id = 'tortilla_francesa_jamón';  -- grupo:keto | antes: HC5%/PRT32%/FAT60% → HC5%/PRT20%/FAT75%
UPDATE recipes SET
  carbs_g = 34, protein_g = 25.5, fat_g = 11.3
  WHERE id = 'batido_recuperacion_postentrenamiento';  -- grupo:high_protein | antes: HC49%/PRT38%/FAT11% → HC40%/PRT30%/FAT30%
UPDATE recipes SET
  carbs_g = 44, protein_g = 33, fat_g = 14.7
  WHERE id = 'arroz_atun_aceite_oliva';  -- grupo:high_protein | antes: HC51%/PRT27%/FAT16% → HC40%/PRT30%/FAT30%
UPDATE recipes SET
  carbs_g = 2.5, protein_g = 10, fat_g = 16.7
  WHERE id = 'fruta_seca_mixta';  -- grupo:keto | antes: HC16%/PRT12%/FAT77% → HC5%/PRT20%/FAT75%
UPDATE recipes SET
  carbs_g = 38.8, protein_g = 15.5, fat_g = 10.3
  WHERE id = 'ensalada_caprese';  -- grupo:standard | antes: HC15%/PRT21%/FAT64% → HC50%/PRT20%/FAT30%
UPDATE recipes SET
  carbs_g = 39, protein_g = 29.3, fat_g = 13
  WHERE id = 'pollo_cacciatore';  -- grupo:high_protein | antes: HC18%/PRT35%/FAT42% → HC40%/PRT30%/FAT30%
UPDATE recipes SET
  carbs_g = 4.3, protein_g = 17, fat_g = 28.3
  WHERE id = 'pizza_coliflor_base';  -- grupo:keto | antes: HC21%/PRT24%/FAT53% → HC5%/PRT20%/FAT75%
UPDATE recipes SET
  carbs_g = 3, protein_g = 12, fat_g = 20
  WHERE id = 'crema_brocoli_coco';  -- grupo:keto | antes: HC37%/PRT13%/FAT53% → HC5%/PRT20%/FAT75%
UPDATE recipes SET
  carbs_g = 2.3, protein_g = 9, fat_g = 15
  WHERE id = 'berberechos_vinagreta';  -- grupo:keto | antes: HC18%/PRT44%/FAT30% → HC5%/PRT20%/FAT75%
UPDATE recipes SET
  carbs_g = 1, protein_g = 4, fat_g = 6.7
  WHERE id = 'caldo_huesos_casero';  -- grupo:keto | antes: HC20%/PRT40%/FAT34% → HC5%/PRT20%/FAT75%
UPDATE recipes SET
  carbs_g = 36.3, protein_g = 14.5, fat_g = 9.7
  WHERE id = 'crumble_manzana_avena';  -- grupo:standard | antes: HC61%/PRT7%/FAT34% → HC50%/PRT20%/FAT30%
UPDATE recipes SET
  carbs_g = 18, protein_g = 13.5, fat_g = 6
  WHERE id = 'muffins_espinacas_queso';  -- grupo:high_protein | antes: HC27%/PRT22%/FAT50% → HC40%/PRT30%/FAT30%
UPDATE recipes SET
  carbs_g = 15, protein_g = 12.5, fat_g = 10
  WHERE id = 'verduras_salteadas_jengibre';  -- grupo:low_carb | antes: HC44%/PRT12%/FAT45% → HC30%/PRT25%/FAT45%
UPDATE recipes SET
  carbs_g = 25, protein_g = 10, fat_g = 6.7
  WHERE id = 'panna_cotta_vainilla_frutos_rojos';  -- grupo:standard | antes: HC36%/PRT8%/FAT54% → HC50%/PRT20%/FAT30%
UPDATE recipes SET
  carbs_g = 23.3, protein_g = 19.4, fat_g = 15.5
  WHERE id = 'ensalada_griega_clasica';  -- grupo:low_carb | antes: HC18%/PRT13%/FAT70% → HC30%/PRT25%/FAT45%
UPDATE recipes SET
  carbs_g = 29.3, protein_g = 24.4, fat_g = 19.5
  WHERE id = 'pollo_limon_oregano_med';  -- grupo:paleo | antes: HC6%/PRT39%/FAT51% → HC30%/PRT25%/FAT45%
UPDATE recipes SET
  carbs_g = 28, protein_g = 21, fat_g = 9.3
  WHERE id = 'hummus_casero_med';  -- grupo:high_protein | antes: HC40%/PRT14%/FAT45% → HC40%/PRT30%/FAT30%
UPDATE recipes SET
  carbs_g = 40, protein_g = 16, fat_g = 10.7
  WHERE id = 'pisto_manchego_med';  -- grupo:standard | antes: HC28%/PRT18%/FAT51% → HC50%/PRT20%/FAT30%
UPDATE recipes SET
  carbs_g = 36.3, protein_g = 14.5, fat_g = 9.7
  WHERE id = 'tabbouleh_med';  -- grupo:standard | antes: HC66%/PRT11%/FAT25% → HC50%/PRT20%/FAT30%
UPDATE recipes SET
  carbs_g = 35, protein_g = 14, fat_g = 9.3
  WHERE id = 'berenjenas_asadas_med';  -- grupo:standard | antes: HC31%/PRT11%/FAT51% → HC50%/PRT20%/FAT30%
UPDATE recipes SET
  carbs_g = 40, protein_g = 16, fat_g = 10.7
  WHERE id = 'shakshuka_med';  -- grupo:standard | antes: HC25%/PRT20%/FAT51% → HC50%/PRT20%/FAT30%
UPDATE recipes SET
  carbs_g = 38, protein_g = 28.5, fat_g = 12.7
  WHERE id = 'lentejas_espinacas_med';  -- grupo:high_protein | antes: HC55%/PRT19%/FAT19% → HC40%/PRT30%/FAT30%
UPDATE recipes SET
  carbs_g = 21, protein_g = 17.5, fat_g = 14
  WHERE id = 'gambas_ajillo_med';  -- grupo:low_carb | antes: HC6%/PRT40%/FAT51% → HC30%/PRT25%/FAT45%
UPDATE recipes SET
  carbs_g = 25.5, protein_g = 21.3, fat_g = 17
  WHERE id = 'atun_tomate_med';  -- grupo:low_carb | antes: HC14%/PRT35%/FAT48% → HC30%/PRT25%/FAT45%
UPDATE recipes SET
  carbs_g = 36, protein_g = 27, fat_g = 12
  WHERE id = 'bacalao_pisto_med';  -- grupo:high_protein | antes: HC20%/PRT40%/FAT35% → HC40%/PRT30%/FAT30%
UPDATE recipes SET
  carbs_g = 16.5, protein_g = 13.8, fat_g = 11
  WHERE id = 'ceviche_clasico_pesc';  -- grupo:low_carb | antes: HC15%/PRT55%/FAT25% → HC30%/PRT25%/FAT45%
UPDATE recipes SET
  carbs_g = 19.5, protein_g = 16.3, fat_g = 13
  WHERE id = 'mejillones_vapor_pesc';  -- grupo:low_carb | antes: HC15%/PRT43%/FAT28% → HC30%/PRT25%/FAT45%
UPDATE recipes SET
  carbs_g = 33, protein_g = 27.5, fat_g = 22
  WHERE id = 'salmon_miso_jengibre_pesc';  -- grupo:low_carb | antes: HC11%/PRT33%/FAT53% → HC30%/PRT25%/FAT45%
UPDATE recipes SET
  carbs_g = 4.8, protein_g = 19, fat_g = 31.7
  WHERE id = 'tartar_salmon_pesc';  -- grupo:keto | antes: HC8%/PRT29%/FAT62% → HC5%/PRT20%/FAT75%
UPDATE recipes SET
  carbs_g = 32, protein_g = 24, fat_g = 10.7
  WHERE id = 'merluza_verduras_horno_pesc';  -- grupo:high_protein | antes: HC18%/PRT43%/FAT34% → HC40%/PRT30%/FAT30%
UPDATE recipes SET
  carbs_g = 4, protein_g = 16, fat_g = 26.7
  WHERE id = 'tortilla_gambas_pesc';  -- grupo:keto | antes: HC5%/PRT40%/FAT51% → HC5%/PRT20%/FAT75%
UPDATE recipes SET
  carbs_g = 23.3, protein_g = 19.4, fat_g = 15.5
  WHERE id = 'vieiras_pure_guisante_pesc';  -- grupo:low_carb | antes: HC23%/PRT36%/FAT35% → HC30%/PRT25%/FAT45%
UPDATE recipes SET
  carbs_g = 42, protein_g = 31.5, fat_g = 14
  WHERE id = 'ensalada_nicoise_pesc';  -- grupo:high_protein | antes: HC21%/PRT32%/FAT43% → HC40%/PRT30%/FAT30%
UPDATE recipes SET
  carbs_g = 19.5, protein_g = 16.3, fat_g = 13
  WHERE id = 'brochetas_camarones_med';  -- grupo:low_carb | antes: HC6%/PRT40%/FAT48% → HC30%/PRT25%/FAT45%
UPDATE recipes SET
  carbs_g = 25.5, protein_g = 21.3, fat_g = 17
  WHERE id = 'dorada_papillote_med';  -- grupo:low_carb | antes: HC5%/PRT45%/FAT48% → HC30%/PRT25%/FAT45%
UPDATE recipes SET
  carbs_g = 52, protein_g = 39, fat_g = 17.3
  WHERE id = 'risotto_gambas_med';  -- grupo:high_protein | antes: HC52%/PRT22%/FAT21% → HC40%/PRT30%/FAT30%
UPDATE recipes SET
  carbs_g = 36, protein_g = 27, fat_g = 12
  WHERE id = 'bocadillo_caballa_med';  -- grupo:high_protein | antes: HC31%/PRT27%/FAT40% → HC40%/PRT30%/FAT30%
UPDATE recipes SET
  carbs_g = 30, protein_g = 22.5, fat_g = 10
  WHERE id = 'sopa_pescado_azafran_med';  -- grupo:high_protein | antes: HC21%/PRT43%/FAT30% → HC40%/PRT30%/FAT30%
UPDATE recipes SET
  carbs_g = 5.8, protein_g = 23, fat_g = 38.3
  WHERE id = 'pollo_parmesano_keto';  -- grupo:keto | antes: HC3%/PRT37%/FAT55% → HC5%/PRT20%/FAT75%
UPDATE recipes SET
  carbs_g = 4, protein_g = 16, fat_g = 26.7
  WHERE id = 'wrap_lechuga_keto';  -- grupo:keto | antes: HC8%/PRT35%/FAT56% → HC5%/PRT20%/FAT75%
UPDATE recipes SET
  carbs_g = 4.8, protein_g = 19, fat_g = 31.7
  WHERE id = 'bol_atun_keto';  -- grupo:keto | antes: HC6%/PRT36%/FAT57% → HC5%/PRT20%/FAT75%
UPDATE recipes SET
  carbs_g = 4.8, protein_g = 19, fat_g = 31.7
  WHERE id = 'pizza_base_coliflor_keto';  -- grupo:keto | antes: HC13%/PRT25%/FAT62% → HC5%/PRT20%/FAT75%
UPDATE recipes SET
  carbs_g = 3.8, protein_g = 15, fat_g = 25
  WHERE id = 'sopa_pollo_keto';  -- grupo:keto | antes: HC11%/PRT43%/FAT42% → HC5%/PRT20%/FAT75%
UPDATE recipes SET
  carbs_g = 3.5, protein_g = 14, fat_g = 23.3
  WHERE id = 'mousse_chocolate_keto';  -- grupo:keto | antes: HC11%/PRT6%/FAT84% → HC5%/PRT20%/FAT75%
UPDATE recipes SET
  carbs_g = 6.5, protein_g = 26, fat_g = 43.3
  WHERE id = 'ternera_mantequilla_keto';  -- grupo:keto | antes: HC1%/PRT32%/FAT66% → HC5%/PRT20%/FAT75%
UPDATE recipes SET
  carbs_g = 38, protein_g = 28.5, fat_g = 12.7
  WHERE id = 'dal_lentejas_rojas_vegan';  -- grupo:high_protein | antes: HC57%/PRT19%/FAT19% → HC40%/PRT30%/FAT30%
UPDATE recipes SET
  carbs_g = 52, protein_g = 39, fat_g = 17.3
  WHERE id = 'buddha_bowl_vegan';  -- grupo:high_protein | antes: HC51%/PRT15%/FAT28% → HC40%/PRT30%/FAT30%
UPDATE recipes SET
  carbs_g = 42, protein_g = 31.5, fat_g = 14
  WHERE id = 'curry_garbanzos_espinacas_vegan';  -- grupo:high_protein | antes: HC50%/PRT15%/FAT30% → HC40%/PRT30%/FAT30%
UPDATE recipes SET
  carbs_g = 47.5, protein_g = 19, fat_g = 12.7
  WHERE id = 'tacos_jackfruit_vegan';  -- grupo:standard | antes: HC65%/PRT8%/FAT24% → HC50%/PRT20%/FAT30%
UPDATE recipes SET
  carbs_g = 46, protein_g = 34.5, fat_g = 15.3
  WHERE id = 'bowl_quinoa_mango_vegan';  -- grupo:high_protein | antes: HC56%/PRT16%/FAT23% → HC40%/PRT30%/FAT30%
UPDATE recipes SET
  carbs_g = 47.5, protein_g = 19, fat_g = 12.7
  WHERE id = 'porridge_avena_vegan';  -- grupo:standard | antes: HC61%/PRT13%/FAT24% → HC50%/PRT20%/FAT30%
UPDATE recipes SET
  carbs_g = 60, protein_g = 24, fat_g = 16
  WHERE id = 'pasta_tomate_fresco_vegan';  -- grupo:standard | antes: HC62%/PRT12%/FAT26% → HC50%/PRT20%/FAT30%
UPDATE recipes SET
  carbs_g = 32, protein_g = 24, fat_g = 10.7
  WHERE id = 'smoothie_verde_proteico_vegan';  -- grupo:high_protein | antes: HC53%/PRT28%/FAT17% → HC40%/PRT30%/FAT30%
UPDATE recipes SET
  carbs_g = 38, protein_g = 28.5, fat_g = 12.7
  WHERE id = 'stir_fry_tofu_vegan';  -- grupo:high_protein | antes: HC29%/PRT23%/FAT43% → HC40%/PRT30%/FAT30%
UPDATE recipes SET
  carbs_g = 36, protein_g = 30, fat_g = 24
  WHERE id = 'pollo_boniato_paleo';  -- grupo:paleo | antes: HC28%/PRT30%/FAT26% → HC30%/PRT25%/FAT45%
UPDATE recipes SET
  carbs_g = 5.8, protein_g = 23, fat_g = 38.3
  WHERE id = 'hamburguesa_paleo';  -- grupo:keto | antes: HC9%/PRT31%/FAT59% → HC5%/PRT20%/FAT75%
UPDATE recipes SET
  carbs_g = 5.5, protein_g = 22, fat_g = 36.7
  WHERE id = 'salmón_esparragos_paleo';  -- grupo:keto | antes: HC5%/PRT33%/FAT61% → HC5%/PRT20%/FAT75%
UPDATE recipes SET
  carbs_g = 34.5, protein_g = 28.8, fat_g = 23
  WHERE id = 'pollo_curry_coco_paleo';  -- grupo:paleo | antes: HC14%/PRT31%/FAT55% → HC30%/PRT25%/FAT45%
UPDATE recipes SET
  carbs_g = 25.5, protein_g = 21.3, fat_g = 17
  WHERE id = 'ensalada_remolachaa_nueces_paleo';  -- grupo:paleo | antes: HC35%/PRT9%/FAT53% → HC30%/PRT25%/FAT45%
UPDATE recipes SET
  carbs_g = 22.5, protein_g = 18.8, fat_g = 15
  WHERE id = 'frittata_verduras_paleo';  -- grupo:paleo | antes: HC13%/PRT27%/FAT60% → HC30%/PRT25%/FAT45%
UPDATE recipes SET
  carbs_g = 5, protein_g = 20, fat_g = 33.3
  WHERE id = 'pollo_limon_fodmap';  -- grupo:keto | antes: HC4%/PRT36%/FAT59% → HC5%/PRT20%/FAT75%
UPDATE recipes SET
  carbs_g = 5.3, protein_g = 21, fat_g = 35
  WHERE id = 'salmón_pure_zanahoria_fodmap';  -- grupo:keto | antes: HC17%/PRT32%/FAT47% → HC5%/PRT20%/FAT75%
UPDATE recipes SET
  carbs_g = 46, protein_g = 34.5, fat_g = 15.3
  WHERE id = 'bol_arroz_pavo_fodmap';  -- grupo:high_protein | antes: HC45%/PRT31%/FAT16% → HC40%/PRT30%/FAT30%
UPDATE recipes SET
  carbs_g = 30, protein_g = 12, fat_g = 8
  WHERE id = 'sopa_zanahoria_jengibre_fodmap';  -- grupo:standard | antes: HC53%/PRT7%/FAT38% → HC50%/PRT20%/FAT30%
UPDATE recipes SET
  carbs_g = 34, protein_g = 25.5, fat_g = 11.3
  WHERE id = 'pollo_arroz_caldo_fodmap';  -- grupo:high_protein | antes: HC45%/PRT33%/FAT16% → HC40%/PRT30%/FAT30%
UPDATE recipes SET
  carbs_g = 4, protein_g = 16, fat_g = 26.7
  WHERE id = 'huevos_espinacas_tomate_fodmap';  -- grupo:keto | antes: HC15%/PRT23%/FAT62% → HC5%/PRT20%/FAT75%
UPDATE recipes SET
  carbs_g = 36, protein_g = 30, fat_g = 24
  WHERE id = 'ternera_zanahoria_fodmap';  -- grupo:paleo | antes: HC15%/PRT30%/FAT49% → HC30%/PRT25%/FAT45%
UPDATE recipes SET
  carbs_g = 4.5, protein_g = 18, fat_g = 30
  WHERE id = 'bol_coliflor_arroz_pollo';  -- grupo:keto | antes: HC13%/PRT40%/FAT50% → HC5%/PRT20%/FAT75%
UPDATE recipes SET
  carbs_g = 4.8, protein_g = 19, fat_g = 31.7
  WHERE id = 'espagueti_calabacin_bolonesa';  -- grupo:keto | antes: HC15%/PRT34%/FAT52% → HC5%/PRT20%/FAT75%
UPDATE recipes SET
  carbs_g = 5.5, protein_g = 22, fat_g = 36.7
  WHERE id = 'ensalada_pollo_cesar_lowcarb';  -- grupo:keto | antes: HC5%/PRT36%/FAT57% → HC5%/PRT20%/FAT75%
UPDATE recipes SET
  carbs_g = 3.5, protein_g = 14, fat_g = 23.3
  WHERE id = 'pizza_portobello_lowcarb';  -- grupo:keto | antes: HC11%/PRT26%/FAT64% → HC5%/PRT20%/FAT75%
UPDATE recipes SET
  carbs_g = 13.5, protein_g = 11.3, fat_g = 9
  WHERE id = 'sopa_miso_tofu_lowcarb';  -- grupo:low_carb | antes: HC18%/PRT31%/FAT50% → HC30%/PRT25%/FAT45%
UPDATE recipes SET
  carbs_g = 5.3, protein_g = 21, fat_g = 35
  WHERE id = 'pollo_pesto_espirales_calabacin';  -- grupo:keto | antes: HC8%/PRT34%/FAT60% → HC5%/PRT20%/FAT75%
UPDATE recipes SET
  carbs_g = 4.8, protein_g = 19, fat_g = 31.7
  WHERE id = 'ensalada_atun_aguacate_lowcarb';  -- grupo:keto | antes: HC8%/PRT32%/FAT62% → HC5%/PRT20%/FAT75%
UPDATE recipes SET
  carbs_g = 5, protein_g = 20, fat_g = 33.3
  WHERE id = 'filete_merluza_pure_apio_lowcarb';  -- grupo:keto | antes: HC14%/PRT34%/FAT50% → HC5%/PRT20%/FAT75%
UPDATE recipes SET
  carbs_g = 3.5, protein_g = 14, fat_g = 23.3
  WHERE id = 'bol_huevo_verduras_lowcarb';  -- grupo:keto | antes: HC11%/PRT23%/FAT64% → HC5%/PRT20%/FAT75%
UPDATE recipes SET
  carbs_g = 18, protein_g = 15, fat_g = 12
  WHERE id = 'wrap_lechuga_hummus_verduras_lowcarb';  -- grupo:low_carb | antes: HC30%/PRT13%/FAT60% → HC30%/PRT25%/FAT45%
UPDATE recipes SET
  carbs_g = 5.5, protein_g = 22, fat_g = 36.7
  WHERE id = 'salmón_verduras_horno_lowcarb';  -- grupo:keto | antes: HC7%/PRT33%/FAT57% → HC5%/PRT20%/FAT75%
UPDATE recipes SET
  carbs_g = 3.8, protein_g = 15, fat_g = 25
  WHERE id = 'bol_proteico_queso_cottage_lowcarb';  -- grupo:keto | antes: HC19%/PRT29%/FAT48% → HC5%/PRT20%/FAT75%
UPDATE recipes SET
  carbs_g = 28.5, protein_g = 23.8, fat_g = 19
  WHERE id = 'pollo_verduras_wok_lowcarb';  -- grupo:low_carb | antes: HC15%/PRT38%/FAT43% → HC30%/PRT25%/FAT45%
UPDATE recipes SET
  carbs_g = 2.8, protein_g = 11, fat_g = 18.3
  WHERE id = 'panacotta_coco_lowcarb';  -- grupo:keto | antes: HC11%/PRT7%/FAT82% → HC5%/PRT20%/FAT75%
UPDATE recipes SET
  carbs_g = 6, protein_g = 24, fat_g = 40
  WHERE id = 'ensalada_col_salmón_lowcarb';  -- grupo:keto | antes: HC10%/PRT30%/FAT56% → HC5%/PRT20%/FAT75%
UPDATE recipes SET
  carbs_g = 5.3, protein_g = 21, fat_g = 35
  WHERE id = 'pimientos_rellenos_lowcarb';  -- grupo:keto | antes: HC17%/PRT27%/FAT51% → HC5%/PRT20%/FAT75%
UPDATE recipes SET
  carbs_g = 50, protein_g = 37.5, fat_g = 16.7
  WHERE id = 'tortilla_quinoa_garbanzos_veg';  -- grupo:high_protein | antes: HC48%/PRT18%/FAT29% → HC40%/PRT30%/FAT30%
UPDATE recipes SET
  carbs_g = 52, protein_g = 39, fat_g = 17.3
  WHERE id = 'lasaña_vegetal_veg';  -- grupo:high_protein | antes: HC45%/PRT15%/FAT35% → HC40%/PRT30%/FAT30%
UPDATE recipes SET
  carbs_g = 30, protein_g = 22.5, fat_g = 10
  WHERE id = 'revuelto_tofu_silken_veg';  -- grupo:high_protein | antes: HC16%/PRT27%/FAT54% → HC40%/PRT30%/FAT30%
UPDATE recipes SET
  carbs_g = 3.5, protein_g = 14, fat_g = 23.3
  WHERE id = 'tortilla_proteica_claras_veg';  -- grupo:keto | antes: HC9%/PRT40%/FAT51% → HC5%/PRT20%/FAT75%
UPDATE recipes SET
  carbs_g = 48, protein_g = 36, fat_g = 16
  WHERE id = 'falafel_ensalada_veg';  -- grupo:high_protein | antes: HC47%/PRT17%/FAT30% → HC40%/PRT30%/FAT30%
UPDATE recipes SET
  carbs_g = 42, protein_g = 31.5, fat_g = 14
  WHERE id = 'tosta_aguacate_huevo_veg';  -- grupo:high_protein | antes: HC30%/PRT19%/FAT47% → HC40%/PRT30%/FAT30%
UPDATE recipes SET
  carbs_g = 36, protein_g = 27, fat_g = 12
  WHERE id = 'bol_ricotta_frutas_veg';  -- grupo:high_protein | antes: HC31%/PRT22%/FAT40% → HC40%/PRT30%/FAT30%
UPDATE recipes SET
  carbs_g = 6.5, protein_g = 26, fat_g = 43.3
  WHERE id = 'pollo_ajo_crema_keto';  -- grupo:keto | antes: HC3%/PRT32%/FAT62% → HC5%/PRT20%/FAT75%
UPDATE recipes SET
  carbs_g = 38, protein_g = 28.5, fat_g = 12.7
  WHERE id = 'sopa_lentejas_tomate_vegan';  -- grupo:high_protein | antes: HC59%/PRT19%/FAT14% → HC40%/PRT30%/FAT30%
UPDATE recipes SET
  carbs_g = 47.5, protein_g = 19, fat_g = 12.7
  WHERE id = 'tacos_coliflor_vegan';  -- grupo:standard | antes: HC63%/PRT8%/FAT28% → HC50%/PRT20%/FAT30%
UPDATE recipes SET
  carbs_g = 52.5, protein_g = 21, fat_g = 14
  WHERE id = 'granola_coco_semillas_vegan';  -- grupo:standard | antes: HC51%/PRT10%/FAT39% → HC50%/PRT20%/FAT30%
UPDATE recipes SET
  carbs_g = 31.5, protein_g = 26.3, fat_g = 21
  WHERE id = 'pechuga_mango_paleo';  -- grupo:paleo | antes: HC19%/PRT34%/FAT34% → HC30%/PRT25%/FAT45%
UPDATE recipes SET
  carbs_g = 6, protein_g = 24, fat_g = 40
  WHERE id = 'salmón_costra_hierbas_paleo';  -- grupo:keto | antes: HC5%/PRT30%/FAT64% → HC5%/PRT20%/FAT75%
UPDATE recipes SET
  carbs_g = 40.5, protein_g = 33.8, fat_g = 27
  WHERE id = 'ternera_boniato_paleo2';  -- grupo:paleo | antes: HC18%/PRT28%/FAT47% → HC30%/PRT25%/FAT45%
UPDATE recipes SET
  carbs_g = 31.5, protein_g = 26.3, fat_g = 21
  WHERE id = 'pollo_pepita_paleo';  -- grupo:paleo | antes: HC17%/PRT30%/FAT51% → HC30%/PRT25%/FAT45%
UPDATE recipes SET
  carbs_g = 40, protein_g = 16, fat_g = 10.7
  WHERE id = 'briam_griego';  -- grupo:standard | antes: HC53%/PRT8%/FAT39% → HC50%/PRT20%/FAT30%
UPDATE recipes SET
  carbs_g = 48, protein_g = 36, fat_g = 16
  WHERE id = 'moussaka_ligera_med';  -- grupo:high_protein | antes: HC18%/PRT25%/FAT53% → HC40%/PRT30%/FAT30%
UPDATE recipes SET
  carbs_g = 42.5, protein_g = 17, fat_g = 11.3
  WHERE id = 'dolmades_arroz_med';  -- grupo:standard | antes: HC66%/PRT7%/FAT26% → HC50%/PRT20%/FAT30%
UPDATE recipes SET
  carbs_g = 30, protein_g = 25, fat_g = 20
  WHERE id = 'ensalada_griega_clasica_v2';  -- grupo:low_carb | antes: HC12%/PRT28%/FAT63% → HC30%/PRT25%/FAT45%
UPDATE recipes SET
  carbs_g = 34.5, protein_g = 28.8, fat_g = 23
  WHERE id = 'pollo_aceitunas_med';  -- grupo:paleo | antes: HC10%/PRT33%/FAT55% → HC30%/PRT25%/FAT45%
UPDATE recipes SET
  carbs_g = 32, protein_g = 24, fat_g = 10.7
  WHERE id = 'mejillones_marinera_pesc';  -- grupo:high_protein | antes: HC18%/PRT35%/FAT34% → HC40%/PRT30%/FAT30%
UPDATE recipes SET
  carbs_g = 4.8, protein_g = 19, fat_g = 31.7
  WHERE id = 'brochetas_atun_pesc';  -- grupo:keto | antes: HC4%/PRT38%/FAT57% → HC5%/PRT20%/FAT75%
UPDATE recipes SET
  carbs_g = 21, protein_g = 17.5, fat_g = 14
  WHERE id = 'ceviche_gambas_pesc';  -- grupo:low_carb | antes: HC26%/PRT34%/FAT32% → HC30%/PRT25%/FAT45%
UPDATE recipes SET
  carbs_g = 34.5, protein_g = 28.8, fat_g = 23
  WHERE id = 'pollo_cúrcuma_coco_fodmap';  -- grupo:paleo | antes: HC14%/PRT31%/FAT55% → HC30%/PRT25%/FAT45%
UPDATE recipes SET
  carbs_g = 5.8, protein_g = 23, fat_g = 38.3
  WHERE id = 'salmón_jengibre_sésamo_anti';  -- grupo:keto | antes: HC7%/PRT31%/FAT59% → HC5%/PRT20%/FAT75%
UPDATE recipes SET
  carbs_g = 35, protein_g = 14, fat_g = 9.3
  WHERE id = 'crema_calabaza_coco_anti';  -- grupo:standard | antes: HC51%/PRT7%/FAT39% → HC50%/PRT20%/FAT30%
UPDATE recipes SET
  carbs_g = 35, protein_g = 14, fat_g = 9.3
  WHERE id = 'golden_milk_chia_anti';  -- grupo:standard | antes: HC40%/PRT11%/FAT51% → HC50%/PRT20%/FAT30%
UPDATE recipes SET
  carbs_g = 46, protein_g = 34.5, fat_g = 15.3
  WHERE id = 'arroz_pollo_azafrán_fodmap';  -- grupo:high_protein | antes: HC47%/PRT28%/FAT20% → HC40%/PRT30%/FAT30%
UPDATE recipes SET
  carbs_g = 3.8, protein_g = 15, fat_g = 25
  WHERE id = 'gambas_limón_fodmap';  -- grupo:keto | antes: HC5%/PRT37%/FAT54% → HC5%/PRT20%/FAT75%
UPDATE recipes SET
  carbs_g = 4.5, protein_g = 18, fat_g = 30
  WHERE id = 'pechuga_ensalada_fodmap';  -- grupo:keto | antes: HC13%/PRT38%/FAT45% → HC5%/PRT20%/FAT75%
UPDATE recipes SET
  carbs_g = 48, protein_g = 36, fat_g = 16
  WHERE id = 'pasta_arroz_pollo_verduras_fodmap';  -- grupo:high_protein | antes: HC47%/PRT27%/FAT19% → HC40%/PRT30%/FAT30%
UPDATE recipes SET
  carbs_g = 45, protein_g = 18, fat_g = 12
  WHERE id = 'tortitas_avena_arándanos_fodmap';  -- grupo:standard | antes: HC64%/PRT11%/FAT25% → HC50%/PRT20%/FAT30%
UPDATE recipes SET
  carbs_g = 46, protein_g = 34.5, fat_g = 15.3
  WHERE id = 'ternera_zanahoria_arroz_fodmap';  -- grupo:high_protein | antes: HC47%/PRT28%/FAT20% → HC40%/PRT30%/FAT30%
UPDATE recipes SET
  carbs_g = 38, protein_g = 28.5, fat_g = 12.7
  WHERE id = 'creps_espinacas_ricotta_fodmap';  -- grupo:high_protein | antes: HC44%/PRT19%/FAT33% → HC40%/PRT30%/FAT30%
UPDATE recipes SET
  carbs_g = 25.5, protein_g = 21.3, fat_g = 17
  WHERE id = 'pavo_verduras_vapor_fodmap';  -- grupo:low_carb | antes: HC19%/PRT42%/FAT26% → HC30%/PRT25%/FAT45%
UPDATE recipes SET
  carbs_g = 45, protein_g = 18, fat_g = 12
  WHERE id = 'porridge_arroz_canela_fodmap';  -- grupo:standard | antes: HC76%/PRT8%/FAT15% → HC50%/PRT20%/FAT30%
UPDATE recipes SET
  carbs_g = 46, protein_g = 34.5, fat_g = 15.3
  WHERE id = 'bol_pavo_zanahoria_jengibre_fodmap';  -- grupo:high_protein | antes: HC47%/PRT28%/FAT20% → HC40%/PRT30%/FAT30%
UPDATE recipes SET
  carbs_g = 37.5, protein_g = 15, fat_g = 10
  WHERE id = 'batido_fresa_avena_fodmap';  -- grupo:standard | antes: HC67%/PRT12%/FAT24% → HC50%/PRT20%/FAT30%
UPDATE recipes SET
  carbs_g = 4.8, protein_g = 19, fat_g = 31.7
  WHERE id = 'trucha_limon_fodmap';  -- grupo:keto | antes: HC2%/PRT36%/FAT57% → HC5%/PRT20%/FAT75%
UPDATE recipes SET
  carbs_g = 36, protein_g = 27, fat_g = 12
  WHERE id = 'bacalao_tomate_zanahoria_fodmap';  -- grupo:high_protein | antes: HC18%/PRT36%/FAT35% → HC40%/PRT30%/FAT30%
UPDATE recipes SET
  carbs_g = 3.8, protein_g = 15, fat_g = 25
  WHERE id = 'gambas_calabacin_fodmap';  -- grupo:keto | antes: HC13%/PRT32%/FAT48% → HC5%/PRT20%/FAT75%
UPDATE recipes SET
  carbs_g = 4.8, protein_g = 19, fat_g = 31.7
  WHERE id = 'dorada_limon_papillote_fodmap';  -- grupo:keto | antes: HC4%/PRT36%/FAT52% → HC5%/PRT20%/FAT75%
UPDATE recipes SET
  carbs_g = 3.3, protein_g = 13, fat_g = 21.7
  WHERE id = 'wrap_pavo_lechuga_fodmap';  -- grupo:keto | antes: HC12%/PRT34%/FAT48% → HC5%/PRT20%/FAT75%
UPDATE recipes SET
  carbs_g = 5.8, protein_g = 23, fat_g = 38.3
  WHERE id = 'pechuga_rellena_espinacas_fodmap';  -- grupo:keto | antes: HC3%/PRT38%/FAT55% → HC5%/PRT20%/FAT75%
UPDATE recipes SET
  carbs_g = 35, protein_g = 14, fat_g = 9.3
  WHERE id = 'crema_patata_puerro_verde_fodmap';  -- grupo:standard | antes: HC60%/PRT9%/FAT32% → HC50%/PRT20%/FAT30%
UPDATE recipes SET
  carbs_g = 35, protein_g = 14, fat_g = 9.3
  WHERE id = 'ensalada_rúcula_naranja_fodmap';  -- grupo:standard | antes: HC31%/PRT9%/FAT58% → HC50%/PRT20%/FAT30%
UPDATE recipes SET
  carbs_g = 46, protein_g = 34.5, fat_g = 15.3
  WHERE id = 'pollo_paprika_arroz_fodmap';  -- grupo:high_protein | antes: HC45%/PRT30%/FAT20% → HC40%/PRT30%/FAT30%
UPDATE recipes SET
  carbs_g = 5, protein_g = 20, fat_g = 33.3
  WHERE id = 'lubina_salsa_verde_med';  -- grupo:keto | antes: HC4%/PRT36%/FAT59% → HC5%/PRT20%/FAT75%
UPDATE recipes SET
  carbs_g = 3.5, protein_g = 14, fat_g = 23.3
  WHERE id = 'espárragos_prosciutto_med';  -- grupo:keto | antes: HC9%/PRT29%/FAT64% → HC5%/PRT20%/FAT75%
UPDATE recipes SET
  carbs_g = 38, protein_g = 28.5, fat_g = 12.7
  WHERE id = 'pulpo_patatas_med';  -- grupo:high_protein | antes: HC29%/PRT34%/FAT24% → HC40%/PRT30%/FAT30%
UPDATE recipes SET
  carbs_g = 42, protein_g = 31.5, fat_g = 14
  WHERE id = 'ensalada_lentejas_med';  -- grupo:high_protein | antes: HC53%/PRT17%/FAT26% → HC40%/PRT30%/FAT30%
UPDATE recipes SET
  carbs_g = 36, protein_g = 30, fat_g = 24
  WHERE id = 'pollo_romesco_med';  -- grupo:paleo | antes: HC12%/PRT32%/FAT53% → HC30%/PRT25%/FAT45%
UPDATE recipes SET
  carbs_g = 25, protein_g = 10, fat_g = 6.7
  WHERE id = 'crema_calabacin_menta_fodmap';  -- grupo:standard | antes: HC36%/PRT10%/FAT54% → HC50%/PRT20%/FAT30%
UPDATE recipes SET
  carbs_g = 30, protein_g = 22.5, fat_g = 10
  WHERE id = 'tortilla_zanahoria_pimiento_fodmap';  -- grupo:high_protein | antes: HC19%/PRT21%/FAT60% → HC40%/PRT30%/FAT30%
UPDATE recipes SET
  carbs_g = 65, protein_g = 26, fat_g = 17.3
  WHERE id = 'pollo_asado_domingo_std';  -- grupo:standard | antes: HC3%/PRT32%/FAT62% → HC50%/PRT20%/FAT30%
UPDATE recipes SET
  carbs_g = 72.5, protein_g = 29, fat_g = 19.3
  WHERE id = 'huevos_benedictinos_std';  -- grupo:standard | antes: HC22%/PRT17%/FAT62% → HC50%/PRT20%/FAT30%
UPDATE recipes SET
  carbs_g = 90, protein_g = 36, fat_g = 24
  WHERE id = 'burger_clásica_std';  -- grupo:standard | antes: HC29%/PRT21%/FAT45% → HC50%/PRT20%/FAT30%
UPDATE recipes SET
  carbs_g = 77.5, protein_g = 31, fat_g = 20.7
  WHERE id = 'lasaña_boloñesa_std';  -- grupo:standard | antes: HC35%/PRT19%/FAT41% → HC50%/PRT20%/FAT30%
UPDATE recipes SET
  carbs_g = 65, protein_g = 26, fat_g = 17.3
  WHERE id = 'tacos_pollo_std';  -- grupo:standard | antes: HC37%/PRT25%/FAT31% → HC50%/PRT20%/FAT30%
UPDATE recipes SET
  carbs_g = 35, protein_g = 14, fat_g = 9.3
  WHERE id = 'crema_tomate_albahaca_std';  -- grupo:standard | antes: HC46%/PRT9%/FAT45% → HC50%/PRT20%/FAT30%
UPDATE recipes SET
  carbs_g = 65, protein_g = 26, fat_g = 17.3
  WHERE id = 'bacón_huevos_fritos_std';  -- grupo:standard | antes: HC22%/PRT22%/FAT52% → HC50%/PRT20%/FAT30%
UPDATE recipes SET
  carbs_g = 52, protein_g = 39, fat_g = 17.3
  WHERE id = 'pollo_tikka_masala_std';  -- grupo:high_protein | antes: HC17%/PRT29%/FAT48% → HC40%/PRT30%/FAT30%
UPDATE recipes SET
  carbs_g = 47.5, protein_g = 19, fat_g = 12.7
  WHERE id = 'croquetas_jamon_std';  -- grupo:standard | antes: HC34%/PRT15%/FAT52% → HC50%/PRT20%/FAT30%
UPDATE recipes SET
  carbs_g = 55, protein_g = 22, fat_g = 14.7
  WHERE id = 'tortilla_española_std';  -- grupo:standard | antes: HC35%/PRT16%/FAT49% → HC50%/PRT20%/FAT30%
UPDATE recipes SET
  carbs_g = 34, protein_g = 25.5, fat_g = 11.3
  WHERE id = 'caldo_cocido_std';  -- grupo:high_protein | antes: HC28%/PRT31%/FAT37% → HC40%/PRT30%/FAT30%
UPDATE recipes SET
  carbs_g = 52.5, protein_g = 21, fat_g = 14
  WHERE id = 'tarta_queso_std';  -- grupo:standard | antes: HC30%/PRT10%/FAT60% → HC50%/PRT20%/FAT30%
UPDATE recipes SET
  carbs_g = 52.5, protein_g = 21, fat_g = 14
  WHERE id = 'patatas_bravas_std';  -- grupo:standard | antes: HC51%/PRT6%/FAT39% → HC50%/PRT20%/FAT30%
UPDATE recipes SET
  carbs_g = 54, protein_g = 40.5, fat_g = 18
  WHERE id = 'paella_valenciana_std';  -- grupo:high_protein | antes: HC50%/PRT24%/FAT23% → HC40%/PRT30%/FAT30%
UPDATE recipes SET
  carbs_g = 22.5, protein_g = 9, fat_g = 6
  WHERE id = 'gazpacho_andaluz_std';  -- grupo:standard | antes: HC49%/PRT7%/FAT40% → HC50%/PRT20%/FAT30%
UPDATE recipes SET
  carbs_g = 47.5, protein_g = 19, fat_g = 12.7
  WHERE id = 'crema_chocolate_std';  -- grupo:standard | antes: HC29%/PRT6%/FAT62% → HC50%/PRT20%/FAT30%
UPDATE recipes SET
  carbs_g = 52.5, protein_g = 21, fat_g = 14
  WHERE id = 'sopa_cebolla_std';  -- grupo:standard | antes: HC40%/PRT13%/FAT43% → HC50%/PRT20%/FAT30%
UPDATE recipes SET
  carbs_g = 46, protein_g = 34.5, fat_g = 15.3
  WHERE id = 'pollo_pimientos_std';  -- grupo:high_protein | antes: HC14%/PRT33%/FAT43% → HC40%/PRT30%/FAT30%
UPDATE recipes SET
  carbs_g = 58, protein_g = 43.5, fat_g = 19.3
  WHERE id = 'costillas_bbq_std';  -- grupo:high_protein | antes: HC19%/PRT23%/FAT56% → HC40%/PRT30%/FAT30%
UPDATE recipes SET
  carbs_g = 28.5, protein_g = 23.8, fat_g = 19
  WHERE id = 'espárragos_trigueros_huevo_std';  -- grupo:low_carb | antes: HC8%/PRT23%/FAT66% → HC30%/PRT25%/FAT45%
UPDATE recipes SET
  carbs_g = 28, protein_g = 21, fat_g = 9.3
  WHERE id = 'ceviche_mixto_std';  -- grupo:high_protein | antes: HC17%/PRT40%/FAT32% → HC40%/PRT30%/FAT30%
UPDATE recipes SET
  carbs_g = 62, protein_g = 46.5, fat_g = 20.7
  WHERE id = 'sándwich_club_std';  -- grupo:high_protein | antes: HC31%/PRT22%/FAT41% → HC40%/PRT30%/FAT30%
UPDATE recipes SET
  carbs_g = 52.5, protein_g = 21, fat_g = 14
  WHERE id = 'tiramisú_std';  -- grupo:standard | antes: HC36%/PRT8%/FAT56% → HC50%/PRT20%/FAT30%
UPDATE recipes SET
  carbs_g = 52.5, protein_g = 21, fat_g = 14
  WHERE id = 'shakshuka_std';  -- grupo:standard | antes: HC30%/PRT19%/FAT47% → HC50%/PRT20%/FAT30%
UPDATE recipes SET
  carbs_g = 56, protein_g = 42, fat_g = 18.7
  WHERE id = 'cochinita_pibil_std';  -- grupo:high_protein | antes: HC23%/PRT26%/FAT48% → HC40%/PRT30%/FAT30%
UPDATE recipes SET
  carbs_g = 2.8, protein_g = 11, fat_g = 18.3
  WHERE id = 'boquerones_vinagre_std';  -- grupo:keto | antes: HC4%/PRT36%/FAT57% → HC5%/PRT20%/FAT75%
UPDATE recipes SET
  carbs_g = 47.5, protein_g = 19, fat_g = 12.7
  WHERE id = 'pisto_huevo_std';  -- grupo:standard | antes: HC29%/PRT15%/FAT52% → HC50%/PRT20%/FAT30%
UPDATE recipes SET
  carbs_g = 48, protein_g = 36, fat_g = 16
  WHERE id = 'pollo_marsala_std';  -- grupo:high_protein | antes: HC17%/PRT30%/FAT45% → HC40%/PRT30%/FAT30%
UPDATE recipes SET
  carbs_g = 30, protein_g = 12, fat_g = 8
  WHERE id = 'tostada_anchoas_std';  -- grupo:standard | antes: HC37%/PRT17%/FAT45% → HC50%/PRT20%/FAT30%
UPDATE recipes SET
  carbs_g = 39, protein_g = 32.5, fat_g = 26
  WHERE id = 'steak_salsa_chimichurri_std';  -- grupo:low_carb | antes: HC3%/PRT29%/FAT66% → HC30%/PRT25%/FAT45%
UPDATE recipes SET
  carbs_g = 34, protein_g = 25.5, fat_g = 11.3
  WHERE id = 'crema_guisantes_bacon_std';  -- grupo:high_protein | antes: HC38%/PRT19%/FAT42% → HC40%/PRT30%/FAT30%
UPDATE recipes SET
  carbs_g = 16.5, protein_g = 13.8, fat_g = 11
  WHERE id = 'anchoas_pimientos_asados_std';  -- grupo:low_carb | antes: HC33%/PRT15%/FAT57% → HC30%/PRT25%/FAT45%
UPDATE recipes SET
  carbs_g = 52, protein_g = 39, fat_g = 17.3
  WHERE id = 'pollo_korma_std';  -- grupo:high_protein | antes: HC14%/PRT28%/FAT55% → HC40%/PRT30%/FAT30%
UPDATE recipes SET
  carbs_g = 52.5, protein_g = 21, fat_g = 14
  WHERE id = 'brownie_chocolate_std';  -- grupo:standard | antes: HC44%/PRT6%/FAT51% → HC50%/PRT20%/FAT30%
UPDATE recipes SET
  carbs_g = 54, protein_g = 40.5, fat_g = 18
  WHERE id = 'carrilleras_vino_tinto_std';  -- grupo:high_protein | antes: HC13%/PRT27%/FAT50% → HC40%/PRT30%/FAT30%
UPDATE recipes SET
  carbs_g = 47.5, protein_g = 19, fat_g = 12.7
  WHERE id = 'tarta_manzana_std';  -- grupo:standard | antes: HC55%/PRT4%/FAT38% → HC50%/PRT20%/FAT30%
UPDATE recipes SET
  carbs_g = 42.5, protein_g = 17, fat_g = 11.3
  WHERE id = 'croquetas_bacalao_std';  -- grupo:standard | antes: HC35%/PRT19%/FAT42% → HC50%/PRT20%/FAT30%
UPDATE recipes SET
  carbs_g = 46, protein_g = 34.5, fat_g = 15.3
  WHERE id = 'potaje_garbanzos_espinacas_std';  -- grupo:high_protein | antes: HC50%/PRT19%/FAT27% → HC40%/PRT30%/FAT30%
UPDATE recipes SET
  carbs_g = 38, protein_g = 28.5, fat_g = 12.7
  WHERE id = 'merluza_salsa_verde_std';  -- grupo:high_protein | antes: HC8%/PRT38%/FAT43% → HC40%/PRT30%/FAT30%
UPDATE recipes SET
  carbs_g = 47.5, protein_g = 19, fat_g = 12.7
  WHERE id = 'ensaladilla_rusa_std';  -- grupo:standard | antes: HC34%/PRT15%/FAT52% → HC50%/PRT20%/FAT30%
UPDATE recipes SET
  carbs_g = 48, protein_g = 36, fat_g = 16
  WHERE id = 'pollo_francés_mostaza_std';  -- grupo:high_protein | antes: HC3%/PRT32%/FAT60% → HC40%/PRT30%/FAT30%
UPDATE recipes SET
  carbs_g = 52.5, protein_g = 21, fat_g = 14
  WHERE id = 'tarta_santiago_std';  -- grupo:standard | antes: HC36%/PRT10%/FAT56% → HC50%/PRT20%/FAT30%
