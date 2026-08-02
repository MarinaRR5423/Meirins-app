-- recipes_translations.sql
-- 2026-08-02T17:25:45.945Z

BEGIN;

UPDATE recipes SET
  ingredients = jsonb_set(jsonb_set(ingredients, '{fr}', '["80 g de flocons d''avoine","200 ml de lait d''avoine","1 banane mûre","1 cuillère à café de graines de chia","½ cuillère à café de cannelle","1 cuillère à café de miel ou de sirop d''agave"]'::jsonb), '{it}', '["80 g di fiocchi d''avena","200 ml di latte d''avena","1 banana matura","1 cucchiaino di semi di chia","½ cucchiaino di cannella","1 cucchiaino di miele o sciroppo d''agave"]'::jsonb),
  steps       = jsonb_set(jsonb_set(steps,       '{fr}', '["Faites chauffer le lait d''avoine dans une casserole","Ajoutez les flocons d''avoine et laissez cuire 5 minutes en remuant","Versez le tout dans un saladier et coupez la banane en rondelles par-dessus","Ajoute les graines de chia, la cannelle et le miel"]'::jsonb),       '{it}', '["Scalda il latte d''avena in un pentolino","Aggiungi i fiocchi d''avena e cuoci per 5 minuti mescolando","Versalo in una ciotola e affetta la banana sopra","Aggiungi i semi di chia, la cannella e il miele"]'::jsonb)
WHERE id = 'porridge_chia_iron';

UPDATE recipes SET
  ingredients = jsonb_set(jsonb_set(ingredients, '{fr}', '["3 œufs","60 g d''épinards frais","½ avocat","1 cuillère à café d''huile d''olive","Sel et poivre"]'::jsonb), '{it}', '["3 uova","60 g di spinaci freschi","½ avocado","1 cucchiaino di olio d''oliva","Sale e pepe"]'::jsonb),
  steps       = jsonb_set(jsonb_set(steps,       '{fr}', '["Faites revenir les épinards pendant 1 minute","Bats les œufs, ajoute les ingrédients et laisse cuire 3 à 4 minutes","À servir avec des tranches d''avocat"]'::jsonb),       '{it}', '["Fai saltare gli spinaci per 1 minuto","Sbatti le uova, aggiungi gli ingredienti e lascia cuocere per 3-4 minuti","Servire con avocado affettato"]'::jsonb)
WHERE id = 'tortilla_espinacas_aguacate';

UPDATE recipes SET
  ingredients = jsonb_set(jsonb_set(ingredients, '{fr}', '["200 g de yaourt grec 0 %","100 g de fruits rouges","20 g de noix","1 cuillère à café de miel"]'::jsonb), '{it}', '["200 g di yogurt greco 0%","100 g di frutti rossi","20 g di noci","1 cucchiaino di miele"]'::jsonb),
  steps       = jsonb_set(jsonb_set(steps,       '{fr}', '["Versez le yaourt dans un bol","Ajoute les fruits rouges","Saupoudrez de noix et de miel"]'::jsonb),       '{it}', '["Versa lo yogurt in una ciotola","Aggiungi i frutti rossi","Cospargi le noci e il miele"]'::jsonb)
WHERE id = 'yogur_griego_frutos_rojos';

UPDATE recipes SET
  ingredients = jsonb_set(jsonb_set(ingredients, '{fr}', '["1 banane","60 g de jeunes pousses d''épinards","250 ml de lait d''avoine","1 cuillère à soupe de graines de lin","1 cuillère à café de cacao pur","1 datte"]'::jsonb), '{it}', '["1 banana","60 g di spinaci novelli","250 ml di latte d''avena","1 cucchiaio di semi di lino","1 cucchiaino di cacao puro","1 dattero"]'::jsonb),
  steps       = jsonb_set(jsonb_set(steps,       '{fr}', '["Mets le tout dans le mixeur","Mixer pendant 60 secondes","À servir froid"]'::jsonb),       '{it}', '["Metti tutto nel frullatore","Frullare per 60 secondi","Da servire freddo"]'::jsonb)
WHERE id = 'smoothie_vegano_chia';

UPDATE recipes SET
  ingredients = jsonb_set(jsonb_set(ingredients, '{fr}', '["1 tranche de pain de seigle","60 g de saumon fumé","½ avocat","Jus de citron","Poivre noir"]'::jsonb), '{it}', '["1 fetta di pane di segale","60 g di salmone affumicato","½ avocado","Succo di limone","Pepe nero"]'::jsonb),
  steps       = jsonb_set(jsonb_set(steps,       '{fr}', '["Fais griller le pain","Écrase l''avocat avec du citron","Ajoute le saumon et termine par un peu de poivre"]'::jsonb),       '{it}', '["Tosta il pane","Schiaccia l''avocado con il limone","Aggiungi il salmone e completa con un po’ di pepe"]'::jsonb)
WHERE id = 'tostada_centeno_salmon';

UPDATE recipes SET
  ingredients = jsonb_set(jsonb_set(ingredients, '{fr}', '["50 g de flocons d''avoine","1 banane","2 œufs","30 g de protéines en poudre à la vanille","½ cuillère à café de levure chimique","Cannelle"]'::jsonb), '{it}', '["50 g di fiocchi d''avena","1 banana","2 uova","30 g di proteine in polvere alla vaniglia","½ cucchiaino di lievito in polvere","Cannella"]'::jsonb),
  steps       = jsonb_set(jsonb_set(steps,       '{fr}', '["Mixez le tout au mixeur","Versez des portions dans une poêle antiadhésive","Faites cuire 2 minutes de chaque côté à feu moyen","À servir avec des fruits et du yaourt"]'::jsonb),       '{it}', '["Frulla il tutto nel frullatore","Versare le porzioni in una padella antiaderente","Cuocere per 2 minuti per lato a fuoco medio","Servire con frutta e yogurt"]'::jsonb)
WHERE id = 'pancakes_proteicos_avena';

UPDATE recipes SET
  ingredients = jsonb_set(jsonb_set(ingredients, '{fr}', '["3 cuillères à soupe de graines de chia","200 ml de lait de coco","½ mangue mûre","1 cuillère à café de sirop d''érable","Noix de coco râpée"]'::jsonb), '{it}', '["3 cucchiai di semi di chia","200 ml di latte di cocco","½ mango maturo","1 cucchiaino di sciroppo d''acero","Cocco grattugiato"]'::jsonb),
  steps       = jsonb_set(jsonb_set(steps,       '{fr}', '["Mélangez des graines de chia avec du lait de coco et du sirop","Laisse reposer 30 minutes ou toute la nuit","À servir avec de la mangue et de la noix de coco râpée"]'::jsonb),       '{it}', '["Mescola i semi di chia con il latte di cocco e lo sciroppo","Lascia riposare per 30 minuti o per tutta la notte","Servire con mango e cocco grattugiato"]'::jsonb)
WHERE id = 'chia_pudding_coco';

UPDATE recipes SET
  ingredients = jsonb_set(jsonb_set(ingredients, '{fr}', '["1 avocat","2 œufs","1 cuillère à soupe de vinaigre blanc","Citron, sel, poivre","Paprika fumé"]'::jsonb), '{it}', '["1 avocado","2 uova","1 cucchiaio di aceto bianco","Limone, sale, pepe","Paprika affumicata"]'::jsonb),
  steps       = jsonb_set(jsonb_set(steps,       '{fr}', '["Faites bouillir de l''eau avec du vinaigre, puis faites pocher les œufs pendant 3 minutes.","Écrase l''avocat avec du citron et du sel","Disposez les œufs sur l''avocat","Ajoutez du paprika à la fin"]'::jsonb),       '{it}', '["Porta a ebollizione l''acqua con l''aceto, cuoci le uova in camicia per 3 minuti","Schiaccia l''avocado con limone e sale","Servi le uova sull''avocado","Concludi con la paprika"]'::jsonb)
WHERE id = 'tostada_paleo_huevo';

UPDATE recipes SET
  ingredients = jsonb_set(jsonb_set(ingredients, '{fr}', '["150 g de patate douce cuite","50 g de flocons d''avoine certifiés sans gluten","1 œuf","1 cuillère à café de cannelle","½ cuillère à café de gingembre","1 cuillère à café de sirop d''érable"]'::jsonb), '{it}', '["150 g di patata dolce cotta","50 g di fiocchi d''avena certificati senza glutine","1 uovo","1 cucchiaino di cannella","½ cucchiaino di zenzero","1 cucchiaino di sciroppo d''acero"]'::jsonb),
  steps       = jsonb_set(jsonb_set(steps,       '{fr}', '["Écrasez la patate douce avec l''œuf et les flocons d''avoine","Ajoutez des épices et du sirop","Faites cuire les portions à la poêle 2 minutes de chaque côté"]'::jsonb),       '{it}', '["Frulla la patata dolce con l''uovo e i fiocchi d''avena","Aggiungi spezie e sciroppo","Cuocere le porzioni in padella per 2 minuti per lato"]'::jsonb)
WHERE id = 'tortitas_boniato_lowfodmap';

UPDATE recipes SET
  ingredients = jsonb_set(jsonb_set(ingredients, '{fr}', '["150 g de farine d''amande","2 œufs","150 g de courgettes râpées","100 g de myrtilles","50 g de sirop d''érable","1 cuillère à café de levure","Cannelle"]'::jsonb), '{it}', '["150 g di farina di mandorle","2 uova","150 g di zucchine grattugiate","100 g di mirtilli","50 g di sciroppo d''acero","1 cucchiaino di lievito","Cannella"]'::jsonb),
  steps       = jsonb_set(jsonb_set(steps,       '{fr}', '["Préchauffez le four à 180 °C","Mélangez la farine, les œufs, le sirop et la levure","Ajoutez la courgette et les myrtilles","Faites cuire 35 minutes dans un moule chemisé"]'::jsonb),       '{it}', '["Preriscaldare il forno a 180 °C","Mescola la farina, le uova, lo sciroppo e il lievito","Aggiungi la zucchina e i mirtilli","Cuocere in forno per 35 minuti in uno stampo foderato"]'::jsonb)
WHERE id = 'bizcocho_calabacin_arandanos';

UPDATE recipes SET
  ingredients = jsonb_set(jsonb_set(ingredients, '{fr}', '["150 g de saumon","80 g de quinoa","150 g de brocoli","1 cuillère à soupe d''huile d''olive","Citron, sel, poivre"]'::jsonb), '{it}', '["150 g di salmone","80 g di quinoa","150 g di broccoli","1 cucchiaio di olio d''oliva","Limone, sale, pepe"]'::jsonb),
  steps       = jsonb_set(jsonb_set(steps,       '{fr}', '["Faites cuire le quinoa pendant 15 minutes","Cuire le brocoli à la vapeur pendant 8 min","Faites dorer le saumon 3 à 4 minutes de chaque côté","À servir avec du citron"]'::jsonb),       '{it}', '["Cuocere la quinoa per 15 minuti","Cuocere i broccoli al vapore per 8 minuti","Rosolare il salmone per 3-4 minuti per lato","Servire con limone"]'::jsonb)
WHERE id = 'salmon_quinoa_brocoli';

UPDATE recipes SET
  ingredients = jsonb_set(jsonb_set(ingredients, '{fr}', '["150 g de lentilles brunes","½ oignon","1 carotte","1 tomate","Paprika, cumin","½ citron"]'::jsonb), '{it}', '["150 g di lenticchie marroni","½ cipolla","1 carota","1 pomodoro","Paprika, cumino","½ limone"]'::jsonb),
  steps       = jsonb_set(jsonb_set(steps,       '{fr}', '["Faites revenir l''oignon et la carotte","Ajoute des tomates, des épices et des lentilles","Faites cuire 25 minutes dans de l''eau","Finir avec du citron"]'::jsonb),       '{it}', '["Fai soffriggere la cipolla e la carota","Aggiungi pomodoro, spezie e lenticchie","Cuocere per 25 minuti in acqua","Concludi con il limone"]'::jsonb)
WHERE id = 'lentejas_verduras_hierro';

UPDATE recipes SET
  ingredients = jsonb_set(jsonb_set(ingredients, '{fr}', '["150 g de poulet","80 g de quinoa","150 g de courgettes et de poivrons","1 cuillère à soupe d''huile","Cumin, paprika"]'::jsonb), '{it}', '["150 g di pollo","80 g di quinoa","150 g di zucchine e peperoni","1 cucchiaio di olio","Cumino, paprika"]'::jsonb),
  steps       = jsonb_set(jsonb_set(steps,       '{fr}', '["Faites cuire les légumes au four pendant 25 minutes à 200 °C","Faites cuire le quinoa pendant 15 minutes","Faites dorer le poulet 6 minutes de chaque côté","Prépare le bol"]'::jsonb),       '{it}', '["Cuocere le verdure in forno per 25 minuti a 200 °C","Cuocere la quinoa per 15 minuti","Rosolare il pollo per 6 minuti per lato","Prepara la ciotola"]'::jsonb)
WHERE id = 'bowl_pollo_quinoa';

UPDATE recipes SET
  ingredients = jsonb_set(jsonb_set(ingredients, '{fr}', '["1 boîte de pois chiches (240 g)","150 g d''épinards","80 g de riz basmati","200 ml de lait de coco","Curry, gingembre, curcuma","½ oignon"]'::jsonb), '{it}', '["1 lattina di ceci (240 g)","150 g di spinaci","80 g di riso basmati","200 ml di latte di cocco","Curry, zenzero, curcuma","½ cipolla"]'::jsonb),
  steps       = jsonb_set(jsonb_set(steps,       '{fr}', '["Faites revenir l''oignon et les épices","Ajoutez les pois chiches et le lait de coco, puis laissez cuire 10 min","Ajoutez des épinards","À servir avec du riz cuit"]'::jsonb),       '{it}', '["Fai soffriggere la cipolla e le spezie","Aggiungi i ceci e il latte di cocco, fai cuocere per 10 minuti","Aggiungi gli spinaci","Servire con riso cotto"]'::jsonb)
WHERE id = 'curry_garbanzos_vegano';

UPDATE recipes SET
  ingredients = jsonb_set(jsonb_set(ingredients, '{fr}', '["120 g de thon au naturel","2 œufs durs","½ avocat","60 g de roquette","10 olives","1 cuillère à soupe d''huile","Citron"]'::jsonb), '{it}', '["120 g di tonno in acqua","2 uova sode","½ avocado","60 g di rucola","10 olive","1 cucchiaio di olio","Limone"]'::jsonb),
  steps       = jsonb_set(jsonb_set(steps,       '{fr}', '["Faites cuire les œufs pendant 9 minutes","Disposez de la roquette comme base","Ajoute du thon, des œufs, de l''avocat et des olives","Assaisonnez avec de l''huile et du citron"]'::jsonb),       '{it}', '["Cuocere le uova per 9 minuti","Metti la rucola come base","Aggiungi tonno, uova, avocado e olive","Condisci con olio e limone"]'::jsonb)
WHERE id = 'ensalada_atun_huevo_keto';

UPDATE recipes SET
  ingredients = jsonb_set(jsonb_set(ingredients, '{fr}', '["150 g de blanc de poulet","80 g de laitue romaine","30 g de parmesan","2 cuillères à soupe de sauce César allégée","Croûtons","Citron"]'::jsonb), '{it}', '["150 g di petto di pollo","80 g di lattuga romana","30 g di parmigiano","2 cucchiai di salsa Caesar light","Crostini","Limone"]'::jsonb),
  steps       = jsonb_set(jsonb_set(steps,       '{fr}', '["Assaisonnez le poulet et faites-le dorer 6 minutes de chaque côté","Lavez et coupez la laitue","Mélange avec de la sauce, du parmesan et des croûtons","À terminer avec du poulet émincé"]'::jsonb),       '{it}', '["Condisci il pollo e fallo rosolare per 6 minuti per lato","Lava e taglia la lattuga","Condisci con la salsa, il parmigiano e i crostini","Concludi con il pollo a strisce"]'::jsonb)
WHERE id = 'cesar_pollo_low_carb';

UPDATE recipes SET
  ingredients = jsonb_set(jsonb_set(ingredients, '{fr}', '["150 g de tofu ferme","150 g de patate douce","60 g de chou frisé","60 g de quinoa","1 cuillère à soupe de tahini","Citron, ail, curcuma"]'::jsonb), '{it}', '["150 g di tofu compatto","150 g di patata dolce","60 g di cavolo riccio","60 g di quinoa","1 cucchiaio di tahini","Limone, aglio, curcuma"]'::jsonb),
  steps       = jsonb_set(jsonb_set(steps,       '{fr}', '["Faites cuire la patate douce 25 minutes à 200 °C","Faites cuire le quinoa pendant 15 minutes","Faites revenir le tofu coupé en dés pendant 6 minutes","Massez le chou frisé avec du citron","Prépare le bol avec du tahini"]'::jsonb),       '{it}', '["Cuocere la patata dolce per 25 minuti a 200 °C","Cuocere la quinoa per 15 minuti","Rosolare il tofu a cubetti per 6 minuti","Massaggia il cavolo riccio con il limone","Prepara la ciotola con il tahini"]'::jsonb)
WHERE id = 'buddha_tofu_batata';

UPDATE recipes SET
  ingredients = jsonb_set(jsonb_set(ingredients, '{fr}', '["80 g de pâtes complètes","1 boîte de sardines à l''huile (120 g)","60 g de roquette","1 citron","1 gousse d''ail","Piment, persil"]'::jsonb), '{it}', '["80 g di pasta integrale","1 scatoletta di sardine sott''olio (120 g)","60 g di rucola","1 limone","1 spicchio d''aglio","Peperoncino, prezzemolo"]'::jsonb),
  steps       = jsonb_set(jsonb_set(steps,       '{fr}', '["Faites cuire les pâtes al dente","Faites revenir l''ail et le piment dans l''huile des sardines","Ajoute les sardines coupées en morceaux","Mélange avec des pâtes, de la roquette et du citron"]'::jsonb),       '{it}', '["Cuoci la pasta al dente","Fai soffriggere l''aglio e il peperoncino nell''olio delle sardine","Aggiungi le sardine tagliate a pezzetti","Condisci con pasta, rucola e limone"]'::jsonb)
WHERE id = 'pasta_integral_sardinas';

UPDATE recipes SET
  ingredients = jsonb_set(jsonb_set(ingredients, '{fr}', '["1 wrap complet","100 g de dinde en tranches","3 cuillères à soupe de houmous","60 g d''épinards","½ concombre","1 carotte râpée"]'::jsonb), '{it}', '["1 wrap integrale","100 g di tacchino a fette","3 cucchiai di hummus","60 g di spinaci","½ cetriolo","1 carota grattugiata"]'::jsonb),
  steps       = jsonb_set(jsonb_set(steps,       '{fr}', '["Tartine le wrap avec du houmous","Ajoute de la dinde, des épinards, du concombre et de la carotte","Enroulez bien serré et coupez en deux"]'::jsonb),       '{it}', '["Spalma l''hummus sul wrap","Aggiungi il tacchino, gli spinaci, il cetriolo e la carota","Arrotola ben stretto e taglia a metà"]'::jsonb)
WHERE id = 'wrap_hummus_pavo';

UPDATE recipes SET
  ingredients = jsonb_set(jsonb_set(ingredients, '{fr}', '["180 g de filet de veau","1 poivron rouge","½ oignon","2 cuillères à soupe d''huile d''olive","Ail, gingembre","Poivre"]'::jsonb), '{it}', '["180 g di filetto di manzo","1 peperone rosso","½ cipolla","2 cucchiai di olio d''oliva","Aglio, zenzero","Pepe"]'::jsonb),
  steps       = jsonb_set(jsonb_set(steps,       '{fr}', '["Coupez le veau en lanières","Faites revenir dans de l''huile et de l''ail pendant 2 minutes à feu vif","Ajoutez les poivrons et l''oignon, faites revenir encore 4 minutes","Assaisonnez et servez"]'::jsonb),       '{it}', '["Taglia la carne di vitello a strisce","Fai soffriggere con olio e aglio per 2 minuti a fuoco vivo","Aggiungi i peperoni e la cipolla, fai rosolare per altri 4 minuti","Condisci e servi"]'::jsonb)
WHERE id = 'ternera_salteada_paleo';

UPDATE recipes SET
  ingredients = jsonb_set(jsonb_set(ingredients, '{fr}', '["150 g de lentilles rouges","1 carotte","1 cuillère à café de gingembre râpé","½ cuillère à café de curcuma","500 ml de bouillon de légumes"]'::jsonb), '{it}', '["150 g di lenticchie rosse","1 carota","1 cucchiaino di zenzero grattugiato","½ cucchiaino di curcuma","500 ml di brodo vegetale"]'::jsonb),
  steps       = jsonb_set(jsonb_set(steps,       '{fr}', '["Faites revenir des carottes et des épices","Ajoutez les lentilles et le bouillon, puis laissez mijoter 20 minutes.","Mixer jusqu’à obtenir une texture onctueuse"]'::jsonb),       '{it}', '["Fai soffriggere le carote e le spezie","Aggiungi le lenticchie e il brodo, fai cuocere per 20 minuti","Frullare fino a ottenere una consistenza cremosa"]'::jsonb)
WHERE id = 'crema_lentejas_rojas';

UPDATE recipes SET
  ingredients = jsonb_set(jsonb_set(ingredients, '{fr}', '["150 g de merlu","150 g de patate douce","1 citron","Herbes de Provence","1 cuillère à café d''huile"]'::jsonb), '{it}', '["150 g di nasello","150 g di patata dolce","1 limone","Erbe provenzali","1 cucchiaino di olio"]'::jsonb),
  steps       = jsonb_set(jsonb_set(steps,       '{fr}', '["Préchauffez le four à 200 °C","Enveloppez le merlu dans du citron et des herbes aromatiques","Faites cuire au four avec la patate douce pendant 25 min"]'::jsonb),       '{it}', '["Preriscaldare il forno a 200 °C","Avvolgi il nasello con limone ed erbe aromatiche","Cuocere in forno con la patata dolce per 25 min"]'::jsonb)
WHERE id = 'merluza_papillote_boniato';

UPDATE recipes SET
  ingredients = jsonb_set(jsonb_set(ingredients, '{fr}', '["180 g de filet de saumon","200 g d''asperges vertes","1 cuillère à soupe d''huile d''olive","Citron, sel, poivre et aneth"]'::jsonb), '{it}', '["180 g di filetto di salmone","200 g di asparagi verdi","1 cucchiaio di olio d''oliva","Limone, sale, pepe e aneto"]'::jsonb),
  steps       = jsonb_set(jsonb_set(steps,       '{fr}', '["Préchauffez le four à 200 °C","Disposez le saumon et les asperges sur un plat avec de l''huile et des épices","Faites cuire au four pendant 15 à 18 minutes","Ajoutez du citron et de l''aneth à la fin"]'::jsonb),       '{it}', '["Preriscalda il forno a 200 °C","Disporre il salmone e gli asparagi su una teglia con olio e spezie","Cuocere in forno per 15-18 minuti","Concludi con limone e aneto"]'::jsonb)
WHERE id = 'salmon_horno_esparragos';

UPDATE recipes SET
  ingredients = jsonb_set(jsonb_set(ingredients, '{fr}', '["200 g de tofu ferme","150 g de brocoli","1 cuillère à soupe de sauce soja","1 cuillère à soupe d''huile de sésame","Ail, gingembre"]'::jsonb), '{it}', '["200 g di tofu compatto","150 g di broccoli","1 cucchiaio di salsa di soia","1 cucchiaio di olio di sesamo","Aglio, zenzero"]'::jsonb),
  steps       = jsonb_set(jsonb_set(steps,       '{fr}', '["Faites revenir le tofu coupé en dés pendant 5 min","Ajoutez le brocoli, l''ail et le gingembre, faites revenir 5 min","Arroser de sauce soja"]'::jsonb),       '{it}', '["Rosolare il tofu a cubetti per 5 minuti","Aggiungi i broccoli, l''aglio e lo zenzero, fai rosolare per 5 minuti","Condisci con salsa di soia"]'::jsonb)
WHERE id = 'tofu_salteado_brocoli';

UPDATE recipes SET
  ingredients = jsonb_set(jsonb_set(ingredients, '{fr}', '["200 g de blanc de poulet coupé en dés","200 ml de lait de coco","1 cuillère à soupe de pâte de curry douce","½ courgette coupée en dés","1 cuillère à soupe d''huile de coco","Coriandre fraîche"]'::jsonb), '{it}', '["200 g di petto di pollo a cubetti","200 ml di latte di cocco","1 cucchiaio di pasta di curry delicata","½ zucchina tagliata a dadini","1 cucchiaio di olio di cocco","Coriandolo fresco"]'::jsonb),
  steps       = jsonb_set(jsonb_set(steps,       '{fr}', '["Faites revenir le poulet dans l''huile pendant 5 min","Ajoutez la pâte de curry et remuez pendant 1 minute","Ajoutez le lait de coco et la courgette","Faites cuire à feu doux pendant 12 à 15 minutes","À servir avec de la coriandre"]'::jsonb),       '{it}', '["Rosolare il pollo nell''olio per 5 minuti","Aggiungi la pasta di curry e mescola per 1 minuto","Aggiungi il latte di cocco e la zucchina","Cuocere a fuoco basso per 12-15 minuti","Servire con coriandolo"]'::jsonb)
WHERE id = 'pollo_coco_curry_keto';

UPDATE recipes SET
  ingredients = jsonb_set(jsonb_set(ingredients, '{fr}', '["2 œufs","1 avocat","2 tranches de bacon","80 g de roquette","1 cuillère à soupe d''huile d''olive","Vinaigre et moutarde"]'::jsonb), '{it}', '["2 uova","1 avocado","2 fette di pancetta","80 g di rucola","1 cucchiaio di olio d''oliva","Aceto e senape"]'::jsonb),
  steps       = jsonb_set(jsonb_set(steps,       '{fr}', '["Faites cuire les œufs pendant 9 minutes, puis laissez-les refroidir","Faites cuire le bacon jusqu’à ce qu’il soit croustillant","Préparez la salade avec de la roquette, de l''avocat, des œufs et du bacon coupés en morceaux","Assaisonnez avec de l''huile, du vinaigre et de la moutarde"]'::jsonb),       '{it}', '["Cuoci le uova per 9 minuti e lasciale raffreddare","Fai rosolare la pancetta finché non diventa croccante","Prepara l''insalata con rucola, avocado, uovo e pancetta tagliati a pezzetti","Condisci con olio, aceto e senape"]'::jsonb)
WHERE id = 'ensalada_aguacate_huevo_keto';

UPDATE recipes SET
  ingredients = jsonb_set(jsonb_set(ingredients, '{fr}', '["180 g de cuisse de poulet","200 g de potiron","1 brin de romarin","1 cuillère à soupe d''huile","Ail, sel"]'::jsonb), '{it}', '["180 g di coscia di pollo","200 g di zucca","1 rametto di rosmarino","1 cucchiaio di olio","Aglio, sale"]'::jsonb),
  steps       = jsonb_set(jsonb_set(steps,       '{fr}', '["Préchauffez le four à 200 °C","Assaisonnez le poulet et le potiron avec de l''huile et des épices","Faites cuire au four pendant 30 min"]'::jsonb),       '{it}', '["Preriscaldare il forno a 200 °C","Condisci il pollo e la zucca con olio e spezie","Cuocere in forno per 30 minuti"]'::jsonb)
WHERE id = 'pollo_calabaza_keto';

UPDATE recipes SET
  ingredients = jsonb_set(jsonb_set(ingredients, '{fr}', '["3 œufs","½ avocat","30 g de roquette","1 cuillère à café d''huile","Pimentón"]'::jsonb), '{it}', '["3 uova","½ avocado","30 g di rucola","1 cucchiaino di olio","Paprika"]'::jsonb),
  steps       = jsonb_set(jsonb_set(steps,       '{fr}', '["Bats les œufs","Faites-les cuire à feu doux pendant 3 minutes","À servir avec de la roquette et de l''avocat"]'::jsonb),       '{it}', '["Sbatti le uova","Cuocili a fuoco basso per 3 minuti","Servire con rucola e avocado"]'::jsonb)
WHERE id = 'huevos_revueltos_aguacate';

UPDATE recipes SET
  ingredients = jsonb_set(jsonb_set(ingredients, '{fr}', '["3 œufs","100 g de champignons variés","30 g de fromage de chèvre","1 cuillère à café de beurre","Ciboulette, sel et poivre"]'::jsonb), '{it}', '["3 uova","100 g di funghi misti","30 g di formaggio di capra","1 cucchiaino di burro","Erba cipollina, sale e pepe"]'::jsonb),
  steps       = jsonb_set(jsonb_set(steps,       '{fr}', '["Faites revenir les champignons dans du beurre pendant 4 minutes","Bats les œufs et ajoute-les à feu doux","Remuez jusqu’à obtenir une consistance crémeuse","Émiettez le fromage par-dessus et parsemez de ciboulette"]'::jsonb),       '{it}', '["Fai saltare i funghi nel burro per 4 minuti","Sbatti le uova e aggiungile a fuoco basso","Mescolare fino a ottenere una consistenza cremosa","Cospargi il formaggio grattugiato sopra e completa con l''erba cipollina"]'::jsonb)
WHERE id = 'revuelto_setas_queso_keto';

UPDATE recipes SET
  ingredients = jsonb_set(jsonb_set(ingredients, '{fr}', '["1 dorade en filets (250 g)","1 courgette","1 poivron rouge","2 cuillères à soupe d''huile d''olive","Ail, persil et citron"]'::jsonb), '{it}', '["1 orata a filetti (250 g)","1 zucchina","1 peperone rosso","2 cucchiai di olio d''oliva","Aglio, prezzemolo e limone"]'::jsonb),
  steps       = jsonb_set(jsonb_set(steps,       '{fr}', '["Faites revenir les légumes coupés en lamelles dans 1 cuillère à soupe d''huile pendant 6 à 8 minutes.","Faites cuire la dorade à la plancha 3 à 4 minutes de chaque côté","Servir avec un mélange d''ail et de persil, du citron et le reste de l''huile, à consommer crue"]'::jsonb),       '{it}', '["Fai saltare le verdure tagliate a listarelle con 1 cucchiaio di olio per 6-8 minuti","Cuoci la orata alla griglia per 3-4 minuti per lato","Servire con aglio e prezzemolo, limone e il resto dell''olio a crudo"]'::jsonb)
WHERE id = 'dorada_plancha_verduras';

UPDATE recipes SET
  ingredients = jsonb_set(jsonb_set(ingredients, '{fr}', '["500 ml d''eau","2 cuillères à soupe de pâte de miso","100 g de tofu ferme","1 cuillère à soupe d''algues wakame","2 oignons nouveaux"]'::jsonb), '{it}', '["500 ml di acqua","2 cucchiai di pasta di miso","100 g di tofu compatto","1 cucchiaio di alghe wakame","2 cipollotti"]'::jsonb),
  steps       = jsonb_set(jsonb_set(steps,       '{fr}', '["Faites tremper les algues pendant 5 minutes","Fais chauffer l''eau (sans la faire bouillir)","Délayez le miso","Ajoutez du tofu coupé en dés et du wakame","Ajoutez de la ciboulette à la fin"]'::jsonb),       '{it}', '["Lascia le alghe in ammollo per 5 minuti","Scalda l''acqua (senza portarla a ebollizione)","Sciogli il miso","Aggiungi il tofu a cubetti e il wakame","Completa con un po’ di cipollotto"]'::jsonb)
WHERE id = 'sopa_miso_tofu_alga';

UPDATE recipes SET
  ingredients = jsonb_set(jsonb_set(ingredients, '{fr}', '["2 courgettes","½ oignon","30 g de parmesan","200 ml de bouillon de légumes","1 cuillère à soupe d''huile d''olive","50 ml de crème légère (facultatif)"]'::jsonb), '{it}', '["2 zucchine","½ cipolla","30 g di parmigiano","200 ml di brodo vegetale","1 cucchiaio di olio d''oliva","50 ml di panna leggera (facoltativa)"]'::jsonb),
  steps       = jsonb_set(jsonb_set(steps,       '{fr}', '["Faites revenir l''oignon pendant 3 minutes","Ajoutez les rondelles de courgette et le bouillon","Faites cuire 12 min, puis mixez","À servir avec du parmesan râpé"]'::jsonb),       '{it}', '["Fai soffriggere la cipolla per 3 minuti","Aggiungi le fette di zucchina e il brodo","Cuocere per 12 minuti e frullare","Servire con parmigiano grattugiato"]'::jsonb)
WHERE id = 'crema_calabacin_keto';

UPDATE recipes SET
  ingredients = jsonb_set(jsonb_set(ingredients, '{fr}', '["1 bar (200 g)","150 g d''asperges vertes","150 g de pommes de terre","Citron, ail","1 cuillère à soupe d''huile d''olive"]'::jsonb), '{it}', '["1 spigola (200 g)","150 g di asparagi verdi","150 g di patate","Limone, aglio","1 cucchiaio di olio d''oliva"]'::jsonb),
  steps       = jsonb_set(jsonb_set(steps,       '{fr}', '["Préchauffez le four à 200 °C","Coupez les pommes de terre en fines rondelles et les asperges","Dispose le poisson par-dessus avec du citron et de l''ail","Faites cuire au four pendant 20 à 25 minutes"]'::jsonb),       '{it}', '["Preriscaldare il forno a 200 °C","Taglia le patate a fette sottili e gli asparagi","Adagia il pesce sopra con limone e aglio","Cuocere in forno per 20-25 minuti"]'::jsonb)
WHERE id = 'lubina_esparragos_patata';

UPDATE recipes SET
  ingredients = jsonb_set(jsonb_set(ingredients, '{fr}', '["180 g de dinde hachée","1 œuf","1 courgette","2 cuillères à soupe d''amandes moulues","Ail, persil","Huile d''olive"]'::jsonb), '{it}', '["180 g di tacchino tritato","1 uovo","1 zucchina","2 cucchiai di mandorle tritate","Aglio, prezzemolo","Olio d''oliva"]'::jsonb),
  steps       = jsonb_set(jsonb_set(steps,       '{fr}', '["Mélangez la dinde avec l''œuf, les amandes, l''ail et le persil","Façonnez de petites boulettes","Faire dorer à la poêle pendant 10 min","À servir avec des courgettes sautées"]'::jsonb),       '{it}', '["Mescola il tacchino con l''uovo, le mandorle, l''aglio e il prezzemolo","Forma delle polpettine","Cuocere in padella per 10 minuti","Da accompagnare con zucchine saltate in padella"]'::jsonb)
WHERE id = 'albondigas_pavo_calabacin';

UPDATE recipes SET
  ingredients = jsonb_set(jsonb_set(ingredients, '{fr}', '["200 g de thon frais en morceaux","1 gros oignon","1 poivron vert","2 cuillères à soupe d''huile d''olive","Paprika, laurier et vinaigre de xérès"]'::jsonb), '{it}', '["200 g di tonno fresco a pezzetti","1 cipolla grande","1 peperone verde","2 cucchiai di olio d''oliva","Paprika, alloro e aceto di sherry"]'::jsonb),
  steps       = jsonb_set(jsonb_set(steps,       '{fr}', '["Faites revenir l''oignon et le poivron pendant 8 min","Ajoutez du paprika, du laurier et un filet de vinaigre","Ajoutez le thon et laissez cuire 3 à 4 minutes (pour qu''il reste juteux à l''intérieur)"]'::jsonb),       '{it}', '["Soffriggere la cipolla e il peperone per 8 minuti","Aggiungi la paprika, l''alloro e un goccio di aceto","Aggiungere il tonno e cuocere per 3-4 minuti (in modo che rimanga succoso all’interno)"]'::jsonb)
WHERE id = 'atun_encebollado_lowcarb';

UPDATE recipes SET
  ingredients = jsonb_set(jsonb_set(ingredients, '{fr}', '["80 g de riz Arborio","150 g de potiron","500 ml de bouillon de légumes","½ oignon","30 g de parmesan","1 cuillère à soupe d''huile d''olive"]'::jsonb), '{it}', '["80 g di riso Arborio","150 g di zucca","500 ml di brodo vegetale","½ cipolla","30 g di parmigiano","1 cucchiaio di olio d''oliva"]'::jsonb),
  steps       = jsonb_set(jsonb_set(steps,       '{fr}', '["Faites revenir l''oignon et les dés de potiron","Ajoutez le riz et faites cuire 1 min","Ajouter le bouillon petit à petit en remuant pendant 18 min","Saupoudrer de parmesan"]'::jsonb),       '{it}', '["Fai soffriggere la cipolla e la zucca tagliate a cubetti","Aggiungi il riso e fai cuocere per 1 minuto","Aggiungere il brodo poco alla volta, mescolando, per 18 min","Completa con del parmigiano"]'::jsonb)
WHERE id = 'risotto_calabaza_queso';

UPDATE recipes SET
  ingredients = jsonb_set(jsonb_set(ingredients, '{fr}', '["1 gros avocat","1 boîte de thon au naturel","1 œuf dur","1 cuillère à soupe de yaourt grec ou de mayonnaise allégée","Ciboulette et poivre"]'::jsonb), '{it}', '["1 avocado grande","1 scatoletta di tonno al naturale","1 uovo sodo","1 cucchiaio di yogurt greco o maionese light","Erba cipollina e pepe"]'::jsonb),
  steps       = jsonb_set(jsonb_set(steps,       '{fr}', '["Coupez l''avocat en deux et prélevez un peu de chair","Mélangez le thon, l''œuf haché, la chair et le yaourt","Farcissez les moitiés et parsemez de ciboulette"]'::jsonb),       '{it}', '["Taglia l''avocado a metà e rimuovi un po'' di polpa","Mescola il tonno, l''uovo tritato, la polpa e lo yogurt","Farcisci le metà e completa con l''erba cipollina"]'::jsonb)
WHERE id = 'aguacate_relleno_atun';

UPDATE recipes SET
  ingredients = jsonb_set(jsonb_set(ingredients, '{fr}', '["150 g de saumon","80 g de riz complet","2 cuillères à soupe de sauce soja","1 cuillère à soupe de miel","1 cuillère à café de gingembre","Sésame"]'::jsonb), '{it}', '["150 g di salmone","80 g di riso integrale","2 cucchiai di salsa di soia","1 cucchiaio di miele","1 cucchiaino di zenzero","Sesamo"]'::jsonb),
  steps       = jsonb_set(jsonb_set(steps,       '{fr}', '["Faites cuire le riz complet pendant 25 minutes","Mélange de soja, de miel et de gingembre","Faites mariner le saumon pendant 5 minutes, puis faites-le dorer 4 minutes de chaque côté","Nappez avec la sauce","À la fin, ajoutez du sésame"]'::jsonb),       '{it}', '["Cuocere il riso integrale per 25 minuti","Miscela di soia, miele e zenzero","Rosola il salmone per 5 minuti e fallo dorare per 4 minuti per lato","Ricopri con la salsa","Con sesamo"]'::jsonb)
WHERE id = 'salmon_teriyaki_arroz';

UPDATE recipes SET
  ingredients = jsonb_set(jsonb_set(ingredients, '{fr}', '["200 g de filet de merlu","80 g de petits pois","2 gousses d''ail","Beaucoup de persil frais","150 ml de bouillon de poisson","2 cuillères à soupe d''huile d''olive","1 cuillère à café de farine de riz"]'::jsonb), '{it}', '["200 g di filetto di nasello","80 g di piselli","2 spicchi d''aglio","Prezzemolo fresco in abbondanza","150 ml di brodo di pesce","2 cucchiai di olio d''oliva","1 cucchiaino di farina di riso"]'::jsonb),
  steps       = jsonb_set(jsonb_set(steps,       '{fr}', '["Faites revenir l''ail dans l''huile, puis ajoutez la farine","Versez le bouillon petit à petit jusqu’à ce que la sauce prenne de la consistance","Ajoutez le merlu et les petits pois, laissez cuire 8 minutes à couvert","Parsemez généreusement de persil haché"]'::jsonb),       '{it}', '["Fai soffriggere l''aglio nell''olio e aggiungi la farina","Versa il brodo poco alla volta fino a ottenere una consistenza omogenea","Aggiungi il nasello e i piselli, cuoci per 8 minuti con il coperchio","Completa il tutto con abbondante prezzemolo tritato"]'::jsonb)
WHERE id = 'merluza_salsa_verde';

UPDATE recipes SET
  ingredients = jsonb_set(jsonb_set(ingredients, '{fr}', '["200 g de crevettes décortiquées","1 grosse courgette coupée en spirales","3 gousses d''ail","1 piment","3 cuillères à soupe d''huile d''olive","Persil"]'::jsonb), '{it}', '["200 g di gamberetti sgusciati","1 zucchina grande tagliata a spirale","3 spicchi d''aglio","1 peperoncino","3 cucchiai di olio d''oliva","Prezzemolo"]'::jsonb),
  steps       = jsonb_set(jsonb_set(steps,       '{fr}', '["Faites revenir l''ail émincé et le piment dans l''huile","Augmentez le feu et faites revenir les crevettes pendant 2 à 3 minutes","Ajoutez les spaghettis de courgette pendant 1 à 2 minutes","Ajoutez du persil à la fin"]'::jsonb),       '{it}', '["Fai soffriggere l''aglio affettato e il peperoncino nell''olio","Alza la fiamma e fai saltare i gamberi per 2-3 minuti","Aggiungi gli spaghetti di zucchina per 1-2 minuti","Completa con prezzemolo"]'::jsonb)
WHERE id = 'gambas_ajillo_calabacin';

UPDATE recipes SET
  ingredients = jsonb_set(jsonb_set(ingredients, '{fr}', '["6 sardines nettoyées","2 tomates mûres","1 oignon","2 cuillères à soupe d''huile d''olive","Origan et citron"]'::jsonb), '{it}', '["6 sardine pulite","2 pomodori maturi","1 cipolla","2 cucchiai di olio d''oliva","Origano e limone"]'::jsonb),
  steps       = jsonb_set(jsonb_set(steps,       '{fr}', '["Disposez une couche de tomates et d''oignons coupés en rondelles","Dispose les sardines par-dessus, avec de l''huile et de l''origan","Faites cuire au four à 200 °C pendant 12 à 15 minutes","À servir avec du citron"]'::jsonb),       '{it}', '["Prepara un letto di pomodori e cipolle affettate","Adagia le sardine sopra con olio e origano","Cuocere in forno a 200 °C per 12-15 minuti","Servire con limone"]'::jsonb)
WHERE id = 'sardinas_horno_tomate';

UPDATE recipes SET
  ingredients = jsonb_set(jsonb_set(ingredients, '{fr}', '["120 g de saumon frais de qualité sushi, coupé en dés","150 g de riz complet cuit","50 g d''edamame","¼ d''avocat","Concombre et carotte coupés en julienne","1 cuillère à soupe de sauce soja","1 cuillère à café d''huile de sésame","Sésame grillé"]'::jsonb), '{it}', '["120 g di salmone fresco da sushi tagliato a cubetti","150 g di riso integrale cotto","50 g di edamame","¼ di avocado","Cetriolo e carota tagliati a julienne","1 cucchiaio di salsa di soia","1 cucchiaino di olio di sesamo","Sesamo tostato"]'::jsonb),
  steps       = jsonb_set(jsonb_set(steps,       '{fr}', '["Mariner le saumon avec du soja et de l''huile de sésame 5 min","Préparez le bol : riz, légumes, edamame et saumon","À finir avec du sésame grillé"]'::jsonb),       '{it}', '["Marinare il salmone con soia e olio di sesamo 5 min","Prepara l''insalata: riso, verdure, edamame e salmone","Concludere con sesamo tostato"]'::jsonb)
WHERE id = 'poke_salmon_integral';

UPDATE recipes SET
  ingredients = jsonb_set(jsonb_set(ingredients, '{fr}', '["200 g de lentilles brunes","1 carotte","1 poivron vert","½ oignon","2 gousses d''ail","1 tomate","Paprika, cumin et laurier","2 cuillères à soupe d''huile d''olive"]'::jsonb), '{it}', '["200 g di lenticchie marroni","1 carota","1 peperone verde","½ cipolla","2 spicchi d''aglio","1 pomodoro","Paprika, cumino e alloro","2 cucchiai di olio d''oliva"]'::jsonb),
  steps       = jsonb_set(jsonb_set(steps,       '{fr}', '["Faites revenir les légumes coupés en morceaux pendant 5 minutes","Ajoutez les lentilles, les épices et de l''eau jusqu''à ce que le niveau dépasse de deux doigts","Faites cuire à feu moyen pendant 25 à 30 minutes","Ajustez l''assaisonnement et laissez reposer 5 minutes"]'::jsonb),       '{it}', '["Fai soffriggere le verdure tritate per 5 minuti","Aggiungi le lenticchie, le spezie e l''acqua fino a coprire di circa 2 dita","Cuocere a fuoco medio per 25-30 minuti","Aggiungi un po’ di sale e lascia riposare per 5 minuti"]'::jsonb)
WHERE id = 'lentejas_estofadas_veganas';

UPDATE recipes SET
  ingredients = jsonb_set(jsonb_set(ingredients, '{fr}', '["400 g de pois chiches cuits","150 g d''épinards","200 ml de lait de coco","1 cuillère à soupe de curry en poudre","1 tomate concassée","½ oignon","1 cuillère à soupe d''huile d''olive"]'::jsonb), '{it}', '["400 g di ceci cotti","150 g di spinaci","200 ml di latte di cocco","1 cucchiaio di curry in polvere","1 pomodoro tritato","½ cipolla","1 cucchiaio di olio d''oliva"]'::jsonb),
  steps       = jsonb_set(jsonb_set(steps,       '{fr}', '["Faites revenir l''oignon et le curry pendant 3 minutes","Ajoute des tomates, des pois chiches et du lait de coco","Faites cuire 10 minutes à feu doux","Ajoutez les épinards et laissez-les réduire"]'::jsonb),       '{it}', '["Fai soffriggere la cipolla e il curry per 3 minuti","Aggiungi pomodoro, ceci e latte di cocco","Cuocere per 10 minuti a fuoco basso","Aggiungere gli spinaci e lasciarli appassire"]'::jsonb)
WHERE id = 'garbanzos_espinacas_curry';

UPDATE recipes SET
  ingredients = jsonb_set(jsonb_set(ingredients, '{fr}', '["120 g de tempeh en lamelles","80 g de quinoa","1 petite patate douce","1 cuillère à soupe de sauce soja","1 cuillère à soupe d''huile d''olive","Roquette et graines de courge"]'::jsonb), '{it}', '["120 g di tempeh a fette","80 g di quinoa","1 patata dolce piccola","1 cucchiaio di salsa di soia","1 cucchiaio di olio d''oliva","Rucola e semi di zucca"]'::jsonb),
  steps       = jsonb_set(jsonb_set(steps,       '{fr}', '["Faites cuire la patate douce coupée en dés à 200 °C pendant 25 min","Faites cuire le quinoa pendant 12 minutes","Faites cuire le tempeh avec la sauce soja 3 minutes de chaque côté","Prépare le bol avec de la roquette et des graines"]'::jsonb),       '{it}', '["Cuocere la patata dolce a cubetti a 200 °C per 25 minuti","Cuocere la quinoa per 12 minuti","Fai rosolare il tempeh con la soia per 3 minuti per lato","Prepara l''insalata con rucola e semi"]'::jsonb)
WHERE id = 'tempeh_quinoa_bowl';

UPDATE recipes SET
  ingredients = jsonb_set(jsonb_set(ingredients, '{fr}', '["2 tranches de pain complet","60 g de houmous","1 tomate","Origan, huile d''olive et sel"]'::jsonb), '{it}', '["2 fette di pane integrale","60 g di hummus","1 pomodoro","Origano, olio d''oliva e sale"]'::jsonb),
  steps       = jsonb_set(jsonb_set(steps,       '{fr}', '["Fais griller le pain","Étalez généreusement le houmous","Garnissez de tranches de tomate, d''origan et d''un filet d''huile"]'::jsonb),       '{it}', '["Tosta il pane","Spalma generosamente l''hummus","Condisci con fette di pomodoro, origano e un filo d''olio"]'::jsonb)
WHERE id = 'tostada_hummus_tomate';

UPDATE recipes SET
  ingredients = jsonb_set(jsonb_set(ingredients, '{fr}', '["3 cuillères à soupe de graines de chia","200 ml de boisson à la noix de coco","½ mangue mûre","Noix de coco râpée","Quelques gouttes de vanille"]'::jsonb), '{it}', '["3 cucchiai di semi di chia","200 ml di bevanda al cocco","½ mango maturo","Cocco grattugiato","Qualche goccia di vaniglia"]'::jsonb),
  steps       = jsonb_set(jsonb_set(steps,       '{fr}', '["Mélange de graines de chia, de boisson à la noix de coco et de vanille","Laisser refroidir au moins 4 heures ou toute la nuit","À servir avec des dés de mangue et de la noix de coco râpée"]'::jsonb),       '{it}', '["Miscela di chia, bevanda al cocco e vaniglia","Lasciare raffreddare per almeno 4 ore o per tutta la notte","Servire con mango a cubetti e cocco grattugiato"]'::jsonb)
WHERE id = 'chia_pudding_mango';

UPDATE recipes SET
  ingredients = jsonb_set(jsonb_set(ingredients, '{fr}', '["150 g de seitan en lamelles","1 carotte","½ poivron rouge","100 g de chou chinois","2 cuillères à soupe de sauce soja","1 cuillère à soupe d''huile de sésame","Gingembre et ail"]'::jsonb), '{it}', '["150 g di seitan a strisce","1 carota","½ peperone rosso","100 g di cavolo cinese","2 cucchiai di salsa di soia","1 cucchiaio di olio di sesamo","Zenzero e aglio"]'::jsonb),
  steps       = jsonb_set(jsonb_set(steps,       '{fr}', '["Faites chauffer le wok à feu très vif avec l''huile","Faites revenir le seitan pendant 2 minutes, puis réservez-le","Faites revenir les légumes pendant 3 à 4 minutes (pour qu''ils restent croquants)","Mélangez le tout avec le soja, l''ail et le gingembre pendant 1 min"]'::jsonb),       '{it}', '["Scalda il wok con l''olio a fuoco molto alto","Fai saltare il seitan per 2 minuti e mettilo da parte","Soffriggi le verdure per 3-4 minuti (finché non diventano croccanti)","Mescolare il tutto con la soia, l''aglio e lo zenzero per 1 minuto"]'::jsonb)
WHERE id = 'wok_verduras_seitan';

UPDATE recipes SET
  ingredients = jsonb_set(jsonb_set(ingredients, '{fr}', '["1 pomme","1 cuillère à soupe de pâte d''arachide 100 %","Cannelle"]'::jsonb), '{it}', '["1 mela","1 cucchiaio di crema di arachidi al 100%","Cannella"]'::jsonb),
  steps       = jsonb_set(jsonb_set(steps,       '{fr}', '["Coupez la pomme en quartiers","Tartinez-la ou trempez-la dans la crème de cacahuètes","Saupoudrez de cannelle"]'::jsonb),       '{it}', '["Taglia la mela a spicchi","Spalmala o intingila nella crema di arachidi","Cospargi di cannella"]'::jsonb)
WHERE id = 'crema_cacahuete_manzana_snack';

UPDATE recipes SET
  ingredients = jsonb_set(jsonb_set(ingredients, '{fr}', '["100 g de houmous","2 carottes coupées en bâtonnets","1 concombre coupé en bâtonnets"]'::jsonb), '{it}', '["100 g di hummus","2 carote tagliate a bastoncini","1 cetriolo tagliato a bastoncini"]'::jsonb),
  steps       = jsonb_set(jsonb_set(steps,       '{fr}', '["Servez le houmous dans un bol","Accompagne-le de légumes"]'::jsonb),       '{it}', '["Servi l''hummus in una ciotola","Accompagnalo con le verdure"]'::jsonb)
WHERE id = 'hummus_crudites';

UPDATE recipes SET
  ingredients = jsonb_set(jsonb_set(ingredients, '{fr}', '["1 gros blanc de poulet","1 patate-douce","1 citron","2 cuillères à soupe d''huile d''olive","Romarin, ail en poudre, sel et poivre"]'::jsonb), '{it}', '["1 petto di pollo grande","1 patata dolce","1 limone","2 cucchiai di olio d''oliva","Rosmarino, aglio in polvere, sale e pepe"]'::jsonb),
  steps       = jsonb_set(jsonb_set(steps,       '{fr}', '["Faites cuire la patate douce coupée en quartiers dans de l''huile à 200 °C pendant 25 à 30 minutes.","Mariner le poulet au citron et aux épices 10 min","Faites-le à la plancha 5 à 6 minutes de chaque côté","À servir avec le jus du citron rôti"]'::jsonb),       '{it}', '["Cuocere la patata dolce tagliata a spicchi in olio a 200 °C per 25-30 minuti","Marinare il pollo con limone e spezie 10 min","Cuocilo alla piastra per 5-6 minuti per lato","Servire con il succo del limone arrosto"]'::jsonb)
WHERE id = 'pollo_limon_boniato_paleo';

UPDATE recipes SET
  ingredients = jsonb_set(jsonb_set(ingredients, '{fr}', '["20 g de chocolat noir à 85 %","15 g d''amandes crues"]'::jsonb), '{it}', '["20 g di cioccolato fondente all''85%","15 g di mandorle crude"]'::jsonb),
  steps       = jsonb_set(jsonb_set(steps,       '{fr}', '["À servir ensemble comme en-cas"]'::jsonb),       '{it}', '["Servitelo insieme come spuntino"]'::jsonb)
WHERE id = 'chocolate_negro_almendras';

UPDATE recipes SET
  ingredients = jsonb_set(jsonb_set(ingredients, '{fr}', '["180 g de lanières de veau","1 poivron rouge","100 g de champignons","1 gousse d''ail","2 cuillères à soupe d''huile d''olive","Sel, poivre et thym"]'::jsonb), '{it}', '["180 g di strisce di manzo","1 peperone rosso","100 g di funghi champignon","1 spicchio d''aglio","2 cucchiai di olio d''oliva","Sale, pepe e timo"]'::jsonb),
  steps       = jsonb_set(jsonb_set(steps,       '{fr}', '["Faites revenir le veau à feu vif pendant 2 minutes, puis réservez-le","Faites revenir les poivrons, les champignons et l''ail pendant 5 minutes","Faites cuire le tout 1 min avec du thym"]'::jsonb),       '{it}', '["Rosola la carne di vitello a fuoco vivo per 2 minuti e mettila da parte","Fai soffriggere peperoni, funghi e aglio per 5 minuti","Cuoci il tutto per 1 minuto con il timo"]'::jsonb)
WHERE id = 'ternera_salteada_pimientos_paleo';

UPDATE recipes SET
  ingredients = jsonb_set(jsonb_set(ingredients, '{fr}', '["1 pomme","2 cuillères à soupe de beurre de cacahuète","Cannelle"]'::jsonb), '{it}', '["1 mela","2 cucchiai di burro di arachidi","Cannella"]'::jsonb),
  steps       = jsonb_set(jsonb_set(steps,       '{fr}', '["Coupez la pomme en quartiers","À servir avec du beurre et de la cannelle"]'::jsonb),       '{it}', '["Taglia la mela a spicchi","Servire con burro e cannella"]'::jsonb)
WHERE id = 'manzana_mantequilla_cacahuete';

UPDATE recipes SET
  ingredients = jsonb_set(jsonb_set(ingredients, '{fr}', '["200 g de yaourt grec 0 %","15 g de noix","Cannelle","1 cuillère à café de miel"]'::jsonb), '{it}', '["200 g di yogurt greco 0%","15 g di noci","Cannella","1 cucchiaino di miele"]'::jsonb),
  steps       = jsonb_set(jsonb_set(steps,       '{fr}', '["Servez le yaourt dans un bol","Ajoute des noix, de la cannelle et du miel"]'::jsonb),       '{it}', '["Versa lo yogurt in una ciotola","Aggiungi noci, cannella e miele"]'::jsonb)
WHERE id = 'yogur_proteico_canela';

UPDATE recipes SET
  ingredients = jsonb_set(jsonb_set(ingredients, '{fr}', '["2 œufs","1 petite patate-douce","½ avocat","1 cuillère à soupe d''huile d''olive","Paprika et sel"]'::jsonb), '{it}', '["2 uova","1 patata dolce piccola","½ avocado","1 cucchiaio di olio d''oliva","Paprika e sale"]'::jsonb),
  steps       = jsonb_set(jsonb_set(steps,       '{fr}', '["Faites cuire les dés de patate douce dans une poêle couverte pendant 10 à 12 minutes.","Fais cuire les œufs à la poêle dessus","À servir avec de l''avocat et du paprika"]'::jsonb),       '{it}', '["Cuoci la patata dolce tagliata a cubetti in una padella con il coperchio per 10-12 minuti","Cuoci le uova alla piastra sopra","Servire con avocado e paprika"]'::jsonb)
WHERE id = 'huevos_rotos_boniato_paleo';

UPDATE recipes SET
  ingredients = jsonb_set(jsonb_set(ingredients, '{fr}', '["4 dattes Medjool","8 moitiés de noix"]'::jsonb), '{it}', '["4 datteri Medjool","8 metà di noce"]'::jsonb),
  steps       = jsonb_set(jsonb_set(steps,       '{fr}', '["Ouvre chaque datte","Garnissez avec 2 moitiés de noix"]'::jsonb),       '{it}', '["Apri ogni dattero","Farcire con 2 metà di noce"]'::jsonb)
WHERE id = 'dates_walnuts_simple';

UPDATE recipes SET
  ingredients = jsonb_set(jsonb_set(ingredients, '{fr}', '["180 g de blanc de poulet","80 g de riz blanc","1 carotte","1 cuillère à soupe d''huile d''olive","Gingembre, sel et ciboulette (partie verte)"]'::jsonb), '{it}', '["180 g di petto di pollo","80 g di riso bianco","1 carota","1 cucchiaio di olio d''oliva","Zenzero, sale ed erba cipollina (parte verde)"]'::jsonb),
  steps       = jsonb_set(jsonb_set(steps,       '{fr}', '["Faites cuire le riz avec les rondelles de carotte pendant 15 minutes","Faites cuire le poulet à la plancha 5 à 6 minutes de chaque côté","À servir avec de l''huile d''olive, du gingembre et de la ciboulette"]'::jsonb),       '{it}', '["Cuocere il riso con la carota tagliata a rondelle per 15 minuti","Cuoci il pollo alla griglia per 5-6 minuti per lato","Servire con olio d''oliva a crudo, zenzero ed erba cipollina"]'::jsonb)
WHERE id = 'pollo_arroz_zanahoria_fodmap';

UPDATE recipes SET
  ingredients = jsonb_set(jsonb_set(ingredients, '{fr}', '["3 œufs","1 pomme de terre moyenne","½ courgette","3 cuillères à soupe d''huile d''olive","Sel"]'::jsonb), '{it}', '["3 uova","1 patata media","½ zucchina","3 cucchiai di olio d''oliva","Sale"]'::jsonb),
  steps       = jsonb_set(jsonb_set(steps,       '{fr}', '["Faites revenir la pomme de terre et la courgette dans l''huile pendant 12 min","Égouttez-les et mélangez-les avec les œufs battus","Faites cuire l''omelette 3 minutes de chaque côté"]'::jsonb),       '{it}', '["Fai soffriggere la patata e la zucchina nell''olio per 12 minuti","Scolate e mescolate con le uova sbattute","Cuocere la tortilla per 3 minuti per lato"]'::jsonb)
WHERE id = 'tortilla_patata_fodmap';

UPDATE recipes SET
  ingredients = jsonb_set(jsonb_set(ingredients, '{fr}', '["30 g de protéines de lactosérum","100 g de fraises","250 ml de lait écrémé ou végétal","Glace"]'::jsonb), '{it}', '["30 g di proteine del siero di latte","100 g di fragole","250 ml di latte scremato o vegetale","Ghiaccio"]'::jsonb),
  steps       = jsonb_set(jsonb_set(steps,       '{fr}', '["Mets le tout dans le mixeur","Mixer pendant 30 secondes","À servir froid"]'::jsonb),       '{it}', '["Metti tutto nel frullatore","Frullare per 30 secondi","Da servire freddo"]'::jsonb)
WHERE id = 'batido_proteico_fresa';

UPDATE recipes SET
  ingredients = jsonb_set(jsonb_set(ingredients, '{fr}', '["150 g d''edamame en gousse","Sel marin","Citron (facultatif)"]'::jsonb), '{it}', '["150 g di edamame con il baccello","Sale marino","Limone (facoltativo)"]'::jsonb),
  steps       = jsonb_set(jsonb_set(steps,       '{fr}', '["Faites cuire l''edamame pendant 4 minutes","Égouttez et saupoudrez de sel","À servir chaud ou tiède"]'::jsonb),       '{it}', '["Fai bollire l''edamame per 4 minuti","Scolate e cospargete di sale","Da servire caldo o tiepido"]'::jsonb)
WHERE id = 'edamame_sal';

UPDATE recipes SET
  ingredients = jsonb_set(jsonb_set(ingredients, '{fr}', '["180 g de saumon","½ courgette coupée en rondelles","½ citron","1 cuillère à soupe d''huile d''olive","Aneth et poivre"]'::jsonb), '{it}', '["180 g di salmone","½ zucchina a fette","½ limone","1 cucchiaio di olio d''oliva","Aneto e pepe"]'::jsonb),
  steps       = jsonb_set(jsonb_set(steps,       '{fr}', '["Disposez le saumon et les courgettes sur du papier sulfurisé","Assaisonnez avec de l''huile, du citron et de l''aneth","Fermez le paquet et enfournez à 190 °C pendant 15 à 18 minutes."]'::jsonb),       '{it}', '["Metti il salmone e le zucchine su carta da forno","Condisci con olio, limone e aneto","Chiudere la confezione e cuocere in forno a 190 °C per 15-18 minuti"]'::jsonb)
WHERE id = 'salmon_papillote_fodmap';

UPDATE recipes SET
  ingredients = jsonb_set(jsonb_set(ingredients, '{fr}', '["60 g de flocons d''avoine","1 banane","2 œufs","1 cuillère de protéines à la vanille","Cannelle et huile de coco pour la poêle"]'::jsonb), '{it}', '["60 g di fiocchi d''avena","1 banana","2 uova","1 misurino di proteine al gusto di vaniglia","Cannella e olio di cocco per la padella"]'::jsonb),
  steps       = jsonb_set(jsonb_set(steps,       '{fr}', '["Mixez tous les ingrédients","Faites cuire de petites crêpes 2 minutes de chaque côté à feu moyen","À servir avec de la cannelle et des fruits"]'::jsonb),       '{it}', '["Frulla tutti gli ingredienti","Prepara dei pancake piccoli, cuocendoli 2 minuti per lato a fuoco medio","Da servire con cannella e frutta"]'::jsonb)
WHERE id = 'pancakes_avena_proteicos';

UPDATE recipes SET
  ingredients = jsonb_set(jsonb_set(ingredients, '{fr}', '["1 tranche de pain complet","½ tomate mûre","60 g de thon à l''huile égoutté","1 cuillère à café d''huile d''olive","Sel"]'::jsonb), '{it}', '["1 fetta di pane integrale","½ pomodoro maturo","60 g di tonno sott''olio scolato","1 cucchiaino di olio d''oliva","Sale"]'::jsonb),
  steps       = jsonb_set(jsonb_set(steps,       '{fr}', '["Fais griller le pain","Frottez avec de la tomate et arrosez d''huile","Recouvrez avec le thon"]'::jsonb),       '{it}', '["Tosta il pane","Condisci con pomodoro e irrorare con olio","Ricopri con il tonno"]'::jsonb)
WHERE id = 'tostada_tomate_atun';

UPDATE recipes SET
  ingredients = jsonb_set(jsonb_set(ingredients, '{fr}', '["6 dattes Medjool","30 g d''amandes","2 cuillères à soupe de cacao pur","1 cuillère à café d''huile de coco","Une pincée de sel"]'::jsonb), '{it}', '["6 datteri Medjool","30 g di mandorle","2 cucchiai di cacao puro","1 cucchiaino di olio di cocco","Un pizzico di sale"]'::jsonb),
  steps       = jsonb_set(jsonb_set(steps,       '{fr}', '["Réduisez les amandes en poudre","Ajoute des dattes, du cacao et de l''huile","Forme des petites boules avec tes mains","Laisser refroidir 30 min"]'::jsonb),       '{it}', '["Trita le mandorle fino a ridurle in polvere","Aggiungi datteri, cacao e olio","Forma delle palline con le mani","Lasciare raffreddare per 30 minuti"]'::jsonb)
WHERE id = 'bolitas_cacao_dates';

UPDATE recipes SET
  ingredients = jsonb_set(jsonb_set(ingredients, '{fr}', '["150 g de skyr nature","60 g de myrtilles","1 cuillère à soupe de graines de courge"]'::jsonb), '{it}', '["150 g di skyr naturale","60 g di mirtilli","1 cucchiaio di semi di zucca"]'::jsonb),
  steps       = jsonb_set(jsonb_set(steps,       '{fr}', '["Versez le skyr dans un bol","Ajoutez des myrtilles et des graines"]'::jsonb),       '{it}', '["Versa lo skyr in una ciotola","Aggiungi mirtilli e semi"]'::jsonb)
WHERE id = 'skyr_granola_snack';

UPDATE recipes SET
  ingredients = jsonb_set(jsonb_set(ingredients, '{fr}', '["½ concombre coupé en rondelles","100 g de fromage frais battu","Aneth frais","Poivre"]'::jsonb), '{it}', '["½ cetriolo a fette","100 g di formaggio fresco sbattuto","Aneto fresco","Pepe"]'::jsonb),
  steps       = jsonb_set(jsonb_set(steps,       '{fr}', '["Disposez des rondelles de concombre dans une assiette","Mets une cuillère à café de fromage frais sur chacune d''elles","Ajoutez de l''aneth et du poivre"]'::jsonb),       '{it}', '["Disponi le fette di cetriolo nel piatto","Metti un cucchiaino di formaggio fresco sopra ciascuna di esse","Completa con aneto e pepe"]'::jsonb)
WHERE id = 'pepino_queso_fresco';

UPDATE recipes SET
  ingredients = jsonb_set(jsonb_set(ingredients, '{fr}', '["2 œufs","6 tomates cerises","Sel aux herbes"]'::jsonb), '{it}', '["2 uova","6 pomodorini","Sale alle erbe"]'::jsonb),
  steps       = jsonb_set(jsonb_set(steps,       '{fr}', '["Faites cuire les œufs pendant 9 minutes","Laissez refroidir, épluchez et servez avec les petites tomates et le sel"]'::jsonb),       '{it}', '["Cuoci le uova per 9 minuti","Lascia raffreddare, sbuccia e servi con i pomodorini e il sale"]'::jsonb)
WHERE id = 'huevo_duro_snack_fodmap';


COMMIT;
