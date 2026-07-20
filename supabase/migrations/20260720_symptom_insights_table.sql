-- ─────────────────────────────────────────────────────────────────────────────
-- Table: symptom_insights
-- Educational pop-ups shown when a user logs a symptom.
-- Each row = one (category, symptom, phase) combination.
-- phase = menstrual | follicular | ovulation | luteal | default
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.symptom_insights (
  id          SERIAL      PRIMARY KEY,
  category    TEXT        NOT NULL,   -- flow | pain | pms | energy | mind | feelings
  symptom     TEXT        NOT NULL,   -- heavy | cramps | breast | bloating | exhausted ...
  phase       TEXT        NOT NULL,   -- menstrual | follicular | ovulation | luteal | default
  why_es      TEXT        NOT NULL,
  why_en      TEXT,
  why_fr      TEXT,
  why_it      TEXT,
  helps_es    TEXT        NOT NULL,
  helps_en    TEXT,
  helps_fr    TEXT,
  helps_it    TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (category, symptom, phase)
);

ALTER TABLE public.symptom_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read symptom_insights"
  ON public.symptom_insights FOR SELECT
  USING (true);

DROP TRIGGER IF EXISTS symptom_insights_updated_at ON public.symptom_insights;
CREATE TRIGGER symptom_insights_updated_at
  BEFORE UPDATE ON public.symptom_insights
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- Data
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO public.symptom_insights
  (category, symptom, phase, why_es, why_en, why_fr, why_it, helps_es, helps_en, helps_fr, helps_it)
VALUES

-- ── FLUJO ───────────────────────────────────────────────────────────────────

('flow', 'heavy', 'menstrual',
  'El útero se contrae para expulsar el endometrio. El flujo abundante en los primeros días es completamente normal.',
  'The uterus contracts to shed the endometrium. Heavy flow in the first days is completely normal.',
  'L''utérus se contracte pour expulser l''endomètre. Un flux abondant les premiers jours est tout à fait normal.',
  'L''utero si contrae per eliminare l''endometrio. Il flusso abbondante nei primi giorni è assolutamente normale.',
  '🍫 Magnesio (chocolate negro 85%), 🌡️ calor local, 🧘 posición fetal, 💧 hidratación extra',
  '🍫 Magnesium (85% dark chocolate), 🌡️ local heat, 🧘 fetal position, 💧 extra hydration',
  '🍫 Magnésium (chocolat noir 85%), 🌡️ chaleur locale, 🧘 position fœtale, 💧 hydratation extra',
  '🍫 Magnesio (cioccolato fondente 85%), 🌡️ calore locale, 🧘 posizione fetale, 💧 idratazione extra'
),
('flow', 'heavy', 'default',
  'Un flujo intenso fuera de la menstruación puede indicar un quiste, mioma o desequilibrio hormonal. Anótalo y coméntalo con tu ginecóloga si es frecuente.',
  'Heavy flow outside menstruation can indicate a cyst, fibroid or hormonal imbalance. Note it and discuss with your gynecologist if it recurs.',
  'Un flux intense hors menstruations peut signaler un kyste, un fibrome ou un déséquilibre hormonal. Notez-le et parlez-en à votre gynécologue si cela se répète.',
  'Un flusso intenso fuori dalla mestruazione può indicare una ciste, un fibroma o uno squilibrio ormonale. Annotalo e parlane con la tua ginecologa se è frequente.',
  '🩺 Consulta con tu ginecóloga si se repite',
  '🩺 Consult your gynecologist if it recurs',
  '🩺 Consultez votre gynécologue si cela se répète',
  '🩺 Consulta la tua ginecologa se si ripete'
),

-- ── DOLOR ───────────────────────────────────────────────────────────────────

('pain', 'cramps', 'menstrual',
  'La prostaglandina PGF2α hace que el útero se contraiga. Cuanto más alta sea su concentración, más intensos los cólicos.',
  'Prostaglandin PGF2α causes the uterus to contract. The higher its concentration, the more intense the cramps.',
  'La prostaglandine PGF2α fait se contracter l''utérus. Plus sa concentration est élevée, plus les crampes sont intenses.',
  'La prostaglandina PGF2α causa contrazioni uterine. Più alta è la sua concentrazione, più intensi i crampi.',
  '🌡️ Calor local (bolsa agua caliente), 🍡 jengibre + cúrcuma, 🧘 yoga suave, 💊 ibuprofeno si es muy intenso',
  '🌡️ Local heat (hot water bottle), 🍡 ginger + turmeric, 🧘 gentle yoga, 💊 ibuprofen if very intense',
  '🌡️ Chaleur locale (bouillotte), 🍡 gingembre + curcuma, 🧘 yoga doux, 💊 ibuprofène si très intense',
  '🌡️ Calore locale (borsa acqua calda), 🍡 zenzero + curcuma, 🧘 yoga dolce, 💊 ibuprofene se molto intenso'
),
('pain', 'cramps', 'luteal',
  'Los dolores antes de la regla (dismenorrea secundaria) son comunes. Si son muy fuertes, pueden indicar endometriosis.',
  'Pre-period cramps (secondary dysmenorrhea) are common. If very strong, they may indicate endometriosis.',
  'Les douleurs pré-menstruelles (dysménorrhée secondaire) sont fréquentes. Si très intenses, elles peuvent indiquer une endométriose.',
  'I dolori pre-mestruali (dismenorrea secondaria) sono comuni. Se molto forti, possono indicare endometriosi.',
  '🍫 Magnesio, 🌿 manzanilla, 🧘 estiramientos de cadera, 🌡️ calor preventivo',
  '🍫 Magnesium, 🌿 chamomile, 🧘 hip stretches, 🌡️ preventive heat',
  '🍫 Magnésium, 🌿 camomille, 🧘 étirements des hanches, 🌡️ chaleur préventive',
  '🍫 Magnesio, 🌿 camomilla, 🧘 stretching anca, 🌡️ calore preventivo'
),
('pain', 'cramps', 'default',
  'Los cólicos uterinos fuera de la menstruación merecen atención. Pueden estar relacionados con ovulación u otras causas.',
  'Uterine cramps outside of menstruation deserve attention. They may be related to ovulation or other causes.',
  'Les crampes utérines hors menstruations méritent attention. Elles peuvent être liées à l''ovulation ou d''autres causes.',
  'I crampi uterini fuori dalla mestruazione meritano attenzione. Possono essere legati all''ovulazione o altre cause.',
  '🌡️ Calor local, 🍵 infusión de jengibre',
  '🌡️ Local heat, 🍵 ginger infusion',
  '🌡️ Chaleur locale, 🍵 infusion de gingembre',
  '🌡️ Calore locale, 🍵 infusione di zenzero'
),

('pain', 'breast', 'luteal',
  'La progesterona y el estrógeno preparan el tejido mamario para un posible embarazo. La sensibilidad en la fase lútea es muy normal.',
  'Progesterone and estrogen prepare breast tissue for a possible pregnancy. Tenderness in the luteal phase is very normal.',
  'La progestérone et l''estrogène préparent le tissu mammaire à une éventuelle grossesse. La sensibilité en phase lutéale est tout à fait normale.',
  'Progesterone ed estrogeni preparano il tessuto mammario a una possibile gravidanza. La sensibilità nella fase luteale è assolutamente normale.',
  '🧊 Compresa fría, 👙 sujetador sin aros, 🚫 reducir cafeína y sal, 💊 vitamina E',
  '🧊 Cold compress, 👙 wire-free bra, 🚫 reduce caffeine and salt, 💊 vitamin E',
  '🧊 Compresse froide, 👙 soutien-gorge sans armatures, 🚫 réduire caféine et sel, 💊 vitamine E',
  '🧊 Compressa fredda, 👙 reggiseno senza ferretto, 🚫 ridurre caffeina e sale, 💊 vitamina E'
),
('pain', 'breast', 'ovulation',
  'El pico de estrógeno antes de la ovulación puede provocar sensibilidad mamaria. Es la señal de que tu cuerpo está liberando el óvulo.',
  'The estrogen surge before ovulation can cause breast tenderness. It''s the signal that your body is releasing the egg.',
  'Le pic d''estrogènes avant l''ovulation peut provoquer une sensibilité mammaire. C''est le signal que ton corps libère l''ovule.',
  'Il picco di estrogeni prima dell''ovulazione può causare sensibilità al seno. È il segnale che il tuo corpo sta rilasciando l''ovulo.',
  '🧊 Compresa fría, 👙 sujetador cómodo sin presión',
  '🧊 Cold compress, 👙 comfortable bra without pressure',
  '🧊 Compresse froide, 👙 soutien-gorge confortable sans pression',
  '🧊 Compressa fredda, 👙 reggiseno comodo senza pressione'
),
('pain', 'breast', 'default',
  'La sensibilidad mamaria está relacionada con las fluctuaciones de estrógeno y progesterona a lo largo del ciclo.',
  'Breast tenderness is related to estrogen and progesterone fluctuations throughout the cycle.',
  'La sensibilité mammaire est liée aux fluctuations d''estrogène et de progestérone tout au long du cycle.',
  'La sensibilità al seno è legata alle fluttuazioni di estrogeno e progesterone durante il ciclo.',
  '🧊 Compresa fría, 🚫 reduce cafeína',
  '🧊 Cold compress, 🚫 reduce caffeine',
  '🧊 Compresse froide, 🚫 réduire la caféine',
  '🧊 Compressa fredda, 🚫 riduci caffeina'
),

('pain', 'headache', 'menstrual',
  'La caída brusca de estrógenos justo antes/durante la menstruación es la causa más frecuente de migraña menstrual.',
  'The sudden drop in estrogen just before/during menstruation is the most frequent cause of menstrual migraine.',
  'La chute brutale des estrogènes juste avant/pendant les règles est la cause la plus fréquente de migraine menstruelle.',
  'Il calo brusco degli estrogeni appena prima/durante la mestruazione è la causa più frequente di emicrania mestruale.',
  '💧 Hidratación (al menos 2L), 🌿 magnesio + riboflavina, 🧘 descanso en oscuridad, ☕ pequeña dosis cafeína puede aliviar',
  '💧 Hydration (at least 2L), 🌿 magnesium + riboflavin, 🧘 rest in darkness, ☕ small caffeine dose can relieve',
  '💧 Hydratation (au moins 2L), 🌿 magnésium + riboflavine, 🧘 repos dans l''obscurité, ☕ petite dose de caféine peut soulager',
  '💧 Idratazione (almeno 2L), 🌿 magnesio + riboflavina, 🧘 riposo al buio, ☕ piccola dose di caffeina può alleviare'
),
('pain', 'headache', 'luteal',
  'El SPM puede incluir cefaleas tensionales por el desequilibrio de serotonina que provoca la bajada de progesterona.',
  'PMS can include tension headaches due to the serotonin imbalance caused by progesterone decline.',
  'Le SPM peut inclure des céphalées de tension dues au déséquilibre en sérotonine causé par la baisse de progestérone.',
  'La SPM può includere cefalee tensionali dovute allo squilibrio della serotonina causato dal calo del progesterone.',
  '💆 Masaje temporal, 💧 hidratación, 🌿 magnesio, 🧘 respiración profunda',
  '💆 Temple massage, 💧 hydration, 🌿 magnesium, 🧘 deep breathing',
  '💆 Massage temporal, 💧 hydratation, 🌿 magnésium, 🧘 respiration profonde',
  '💆 Massaggio temporale, 💧 idratazione, 🌿 magnesio, 🧘 respirazione profonda'
),
('pain', 'headache', 'default',
  'Las fluctuaciones hormonales afectan a los vasos sanguíneos y a la serotonina, lo que puede desencadenar dolores de cabeza en cualquier fase.',
  'Hormonal fluctuations affect blood vessels and serotonin, which can trigger headaches in any phase.',
  'Les fluctuations hormonales affectent les vaisseaux sanguins et la sérotonine, pouvant déclencher des maux de tête à n''importe quelle phase.',
  'Le fluttuazioni ormonali influenzano i vasi sanguigni e la serotonina, che possono scatenare mal di testa in qualsiasi fase.',
  '💧 Hidratación, 💆 masaje, 🌿 magnesio',
  '💧 Hydration, 💆 massage, 🌿 magnesium',
  '💧 Hydratation, 💆 massage, 🌿 magnésium',
  '💧 Idratazione, 💆 massaggio, 🌿 magnesio'
),

('pain', 'back', 'menstrual',
  'Las prostaglandinas que desencadenan las contracciones uterinas también afectan a los músculos de la espalda baja.',
  'The prostaglandins that trigger uterine contractions also affect lower back muscles.',
  'Les prostaglandines qui déclenchent les contractions utérines affectent aussi les muscles du bas du dos.',
  'Le prostaglandine che scatenano le contrazioni uterine influenzano anche i muscoli della schiena.',
  '🌡️ Calor lumbar, 🧘 postura de niño (yoga), 💆 masaje lumbar suave, 🚶 caminata ligera',
  '🌡️ Lower back heat, 🧘 child''s pose (yoga), 💆 gentle lower back massage, 🚶 light walking',
  '🌡️ Chaleur lombaire, 🧘 posture de l''enfant (yoga), 💆 massage lombaire doux, 🚶 marche légère',
  '🌡️ Calore lombare, 🧘 posizione del bambino (yoga), 💆 massaggio lombare delicato, 🚶 camminata leggera'
),
('pain', 'back', 'default',
  'El dolor lumbar puede aparecer con la retención de líquidos (fase lútea) o por la postura que adoptamos durante la menstruación.',
  'Lower back pain can appear with water retention (luteal phase) or due to posture we adopt during menstruation.',
  'Les douleurs lombaires peuvent apparaître avec la rétention d''eau (phase lutéale) ou en raison de la posture adoptée pendant les règles.',
  'Il mal di schiena può comparire con la ritenzione idrica (fase luteale) o per la postura che adottiamo durante la mestruazione.',
  '🌡️ Calor local, 🧘 estiramientos, 🚶 movimiento suave',
  '🌡️ Local heat, 🧘 stretches, 🚶 gentle movement',
  '🌡️ Chaleur locale, 🧘 étirements, 🚶 mouvement doux',
  '🌡️ Calore locale, 🧘 stretching, 🚶 movimento leggero'
),

('pain', 'ovulation', 'ovulation',
  'El Mittelschmerz ("dolor de la mitad") ocurre cuando el folículo se rompe para liberar el óvulo. Dura pocas horas y es una señal de ovulación activa.',
  'Mittelschmerz ("middle pain") occurs when the follicle ruptures to release the egg. It lasts a few hours and is a sign of active ovulation.',
  'Le Mittelschmerz ("douleur du milieu") survient quand le follicule se rompt pour libérer l''ovule. Il dure quelques heures et est un signe d''ovulation active.',
  'Il Mittelschmerz ("dolore di mezzo") si verifica quando il follicolo si rompe per rilasciare l''ovulo. Dura poche ore ed è un segnale di ovulazione attiva.',
  '🌡️ Calor suave en el lateral afectado, 🧘 reposo breve, 💧 hidratación',
  '🌡️ Gentle heat on the affected side, 🧘 brief rest, 💧 hydration',
  '🌡️ Chaleur douce du côté concerné, 🧘 bref repos, 💧 hydratation',
  '🌡️ Calore delicato sul lato interessato, 🧘 breve riposo, 💧 idratazione'
),
('pain', 'ovulation', 'default',
  'Si sientes dolor de tipo ovulatorio fuera de la ovulación, puede ser un folículo que no ovuló correctamente o un quiste funcional.',
  'If you feel ovulation-type pain outside ovulation, it may be a follicle that did not ovulate correctly or a functional cyst.',
  'Si tu ressens une douleur de type ovulatoire hors ovulation, cela peut être un follicule qui n''a pas ovulé correctement ou un kyste fonctionnel.',
  'Se senti dolore di tipo ovulatorio fuori dall''ovulazione, può essere un follicolo che non ha ovulato correttamente o una ciste funzionale.',
  '🌡️ Calor suave, 🩺 consulta si se repite frecuentemente',
  '🌡️ Gentle heat, 🩺 consult if it recurs frequently',
  '🌡️ Chaleur douce, 🩺 consulte si cela se répète souvent',
  '🌡️ Calore delicato, 🩺 consulta se si ripete frequentemente'
),

-- ── SPM ─────────────────────────────────────────────────────────────────────

('pms', 'bloating', 'luteal',
  'La progesterona ralentiza el tránsito intestinal y favorece la retención de líquidos. Es la causa del "vientre de globo" premenstrual.',
  'Progesterone slows intestinal transit and promotes water retention. This is the cause of the premenstrual "balloon belly".',
  'La progestérone ralentit le transit intestinal et favorise la rétention d''eau. C''est la cause du "ventre ballon" prémenstruel.',
  'Il progesterone rallenta il transito intestinale e favorisce la ritenzione idrica. È la causa del "pancia gonfia" premestruale.',
  '🚫 Reduce sal y azúcar, 🌿 infusión de hinojo o menta, 🚶 movimiento (aunque suave), 💧 más agua (paradójicamente ayuda a eliminar el exceso)',
  '🚫 Reduce salt and sugar, 🌿 fennel or mint tea, 🚶 movement (even gentle), 💧 more water (paradoxically helps eliminate the excess)',
  '🚫 Réduis sel et sucre, 🌿 infusion de fenouil ou menthe, 🚶 mouvement (même léger), 💧 plus d''eau (aide paradoxalement à éliminer l''excès)',
  '🚫 Riduci sale e zucchero, 🌿 infusione di finocchio o menta, 🚶 movimento (anche lieve), 💧 più acqua (paradossalmente aiuta a eliminare l''eccesso)'
),
('pms', 'bloating', 'menstrual',
  'La inflamación uterina puede extenderse al aparato digestivo. La hinchazón en los primeros días de la regla es muy frecuente.',
  'Uterine inflammation can spread to the digestive system. Bloating in the first days of your period is very common.',
  'L''inflammation utérine peut s''étendre à l''appareil digestif. Les ballonnements dans les premiers jours des règles sont très fréquents.',
  'L''infiammazione uterina può estendersi all''apparato digestivo. Il gonfiore nei primi giorni della mestruazione è molto frequente.',
  '🌿 Infusión de jengibre, 🌡️ calor en el abdomen, 🚫 evita gluten y lácteos temporalmente',
  '🌿 Ginger tea, 🌡️ heat on abdomen, 🚫 temporarily avoid gluten and dairy',
  '🌿 Infusion de gingembre, 🌡️ chaleur sur le ventre, 🚫 évite temporairement gluten et laitages',
  '🌿 Infusione di zenzero, 🌡️ calore sull''addome, 🚫 evita temporaneamente glutine e latticini'
),
('pms', 'bloating', 'default',
  'La hinchazón fuera del ciclo puede ser digestiva (FODMAP, aerofagia) o linfática (retención). Observa si tiene relación con alimentos.',
  'Bloating outside the cycle can be digestive (FODMAP, aerophagia) or lymphatic (retention). Observe if it''s food-related.',
  'Les ballonnements hors cycle peuvent être digestifs (FODMAP, aérophagie) ou lymphatiques (rétention). Observe si c''est lié à des aliments.',
  'Il gonfiore fuori dal ciclo può essere digestivo (FODMAP, aerofagia) o linfatico (ritenzione). Osserva se è correlato al cibo.',
  '🌿 Infusión de hinojo, 🚫 identifica alimentos que te inflaman',
  '🌿 Fennel tea, 🚫 identify foods that cause bloating',
  '🌿 Infusion de fenouil, 🚫 identifie les aliments qui te ballonnent',
  '🌿 Infusione di finocchio, 🚫 identifica gli alimenti che causano gonfiore'
),

('pms', 'cravings', 'luteal',
  'La serotonina cae en la fase lútea. El cuerpo busca carbohidratos y chocolate para elevarla rápido. Es un mecanismo neurológico real, no "falta de voluntad".',
  'Serotonin drops in the luteal phase. The body seeks carbs and chocolate to quickly raise it. It''s a real neurological mechanism, not "lack of willpower".',
  'La sérotonine chute en phase lutéale. Le corps cherche des glucides et du chocolat pour la remonter vite. C''est un mécanisme neurologique réel, pas un "manque de volonté".',
  'La serotonina cala nella fase luteale. Il corpo cerca carboidrati e cioccolato per alzarla rapidamente. È un meccanismo neurologico reale, non "mancanza di forza di volontà".',
  '🍫 Chocolate negro (85%+) satisface y aporta magnesio, 🥜 frutos secos, 🍠 boniato asado, 🕐 no saltes comidas',
  '🍫 Dark chocolate (85%+) satisfies and provides magnesium, 🥜 nuts, 🍠 baked sweet potato, 🕐 don''t skip meals',
  '🍫 Chocolat noir (85%+) satisfait et apporte du magnésium, 🥜 fruits secs, 🍠 patate douce rôtie, 🕐 ne saute pas de repas',
  '🍫 Cioccolato fondente (85%+) soddisfa e apporta magnesio, 🥜 frutta secca, 🍠 patata dolce al forno, 🕐 non saltare i pasti'
),
('pms', 'cravings', 'menstrual',
  'El cuerpo necesita más hierro y energía para compensar las pérdidas. Los antojos de carne roja o dulce son señales de necesidades reales.',
  'The body needs more iron and energy to compensate for losses. Cravings for red meat or sweets are signals of real needs.',
  'Le corps a besoin de plus de fer et d''énergie pour compenser les pertes. Les envies de viande rouge ou de sucré sont des signaux de besoins réels.',
  'Il corpo ha bisogno di più ferro e energia per compensare le perdite. Il desiderio di carne rossa o dolci sono segnali di bisogni reali.',
  '🥩 Proteína de calidad (hierro hemo), 🍫 chocolate negro, 🫐 frutos del bosque para el dulce',
  '🥩 Quality protein (heme iron), 🍫 dark chocolate, 🫐 berries for the sweet craving',
  '🥩 Protéine de qualité (fer héminique), 🍫 chocolat noir, 🫐 baies pour l''envie sucrée',
  '🥩 Proteina di qualità (ferro eme), 🍫 cioccolato fondente, 🫐 frutti di bosco per il dolce'
),
('pms', 'cravings', 'default',
  'Los antojos a lo largo del ciclo reflejan cambios en la serotonina, los niveles de glucosa y las necesidades energéticas reales.',
  'Cravings throughout the cycle reflect changes in serotonin, glucose levels and real energy needs.',
  'Les envies tout au long du cycle reflètent les changements de sérotonine, de glycémie et les besoins énergétiques réels.',
  'Le voglie durante il ciclo riflettono cambiamenti nella serotonina, nei livelli di glucosio e nei reali bisogni energetici.',
  '🍫 Snack de calidad en vez de ultra-procesado, 🕐 mantén horarios estables de comida',
  '🍫 Quality snack instead of ultra-processed, 🕐 keep stable meal times',
  '🍫 Snack de qualité plutôt qu''ultra-transformé, 🕐 maintiens des horaires de repas stables',
  '🍫 Snack di qualità invece di ultra-processato, 🕐 mantieni orari regolari dei pasti'
),

('pms', 'acne', 'luteal',
  'El aumento de andrógenos en la fase lútea estimula las glándulas sebáceas. El acné premenstrual aparece 7-10 días antes de la regla.',
  'The increase in androgens in the luteal phase stimulates the sebaceous glands. Premenstrual acne appears 7-10 days before your period.',
  'L''augmentation des androgènes en phase lutéale stimule les glandes sébacées. L''acné prémenstruel apparaît 7-10 jours avant les règles.',
  'L''aumento degli androgeni nella fase luteale stimola le ghiandole sebacee. L''acne premestruale compare 7-10 giorni prima della mestruazione.',
  '🚫 Reduce azúcar refinado y lácteos, 🧴 ácido salicílico tópico, 🥗 zinc (semillas de calabaza), 💧 hidratación',
  '🚫 Reduce refined sugar and dairy, 🧴 topical salicylic acid, 🥗 zinc (pumpkin seeds), 💧 hydration',
  '🚫 Réduis sucres raffinés et laitages, 🧴 acide salicylique topique, 🥗 zinc (graines de citrouille), 💧 hydratation',
  '🚫 Riduci zucchero raffinato e latticini, 🧴 acido salicilico topico, 🥗 zinco (semi di zucca), 💧 idratazione'
),
('pms', 'acne', 'ovulation',
  'El pico de estrógeno antes de ovular puede provocar un pequeño brote. Es transitorio y desaparece en pocos días.',
  'The estrogen peak before ovulation can trigger a small breakout. It''s transient and disappears within a few days.',
  'Le pic d''estrogènes avant l''ovulation peut provoquer une petite poussée. Elle est transitoire et disparaît en quelques jours.',
  'Il picco di estrogeni prima dell''ovulazione può provocare una piccola eruzione. È transitoria e scompare in pochi giorni.',
  '🧴 Limpieza suave, 🚫 no tocar el grano, 🥗 antioxidantes',
  '🧴 Gentle cleansing, 🚫 don''t touch the spot, 🥗 antioxidants',
  '🧴 Nettoyage doux, 🚫 ne pas toucher le bouton, 🥗 antioxydants',
  '🧴 Pulizia delicata, 🚫 non toccare il brufolo, 🥗 antiossidanti'
),
('pms', 'acne', 'default',
  'El acné cíclico es una señal de desequilibrio hormonal. Si es intenso, puede indicar SOP u otras condiciones.',
  'Cyclic acne is a sign of hormonal imbalance. If intense, it may indicate PCOS or other conditions.',
  'L''acné cyclique est un signe de déséquilibre hormonal. S''il est intense, il peut indiquer un SOPK ou d''autres conditions.',
  'L''acne ciclica è un segnale di squilibrio ormonale. Se intenso, può indicare PCOS o altre condizioni.',
  '🥗 Dieta antiinflamatoria, 🧴 rutina de limpieza consistente',
  '🥗 Anti-inflammatory diet, 🧴 consistent cleansing routine',
  '🥗 Alimentation anti-inflammatoire, 🧴 routine de nettoyage consistante',
  '🥗 Dieta antinfiammatoria, 🧴 routine di pulizia costante'
),

('pms', 'cloudy', 'luteal',
  'La progesterona alta de la fase lútea baja la serotonina y la dopamina. El "bajón" antes de la regla es químicamente real.',
  'High progesterone in the luteal phase lowers serotonin and dopamine. The premenstrual "low" is chemically real.',
  'La progestérone élevée en phase lutéale abaisse la sérotonine et la dopamine. Le "coup de mou" prémenstruel est chimiquement réel.',
  'Il progesterone alto nella fase luteale abbassa serotonina e dopamina. Il "calo" premestruale è chimicamente reale.',
  '☀️ Luz solar (mínimo 20 min), 🏃 ejercicio (libera endorfinas), 🍫 chocolate negro (serotonina), 🧘 no juzgues tus emociones',
  '☀️ Sunlight (minimum 20 min), 🏃 exercise (releases endorphins), 🍫 dark chocolate (serotonin), 🧘 don''t judge your emotions',
  '☀️ Lumière solaire (minimum 20 min), 🏃 exercice (libère endorphines), 🍫 chocolat noir (sérotonine), 🧘 ne juge pas tes émotions',
  '☀️ Luce solare (minimo 20 min), 🏃 esercizio (rilascia endorfine), 🍫 cioccolato fondente (serotonina), 🧘 non giudicare le tue emozioni'
),
('pms', 'cloudy', 'menstrual',
  'Con la menstruación caen todas las hormonas. Es el momento de mayor necesidad de introspección y descanso del ciclo.',
  'With menstruation, all hormones drop. It''s the phase of greatest need for introspection and rest in the cycle.',
  'Avec les règles, toutes les hormones chutent. C''est la phase du cycle qui demande le plus d''introspection et de repos.',
  'Con la mestruazione tutte le ormoni calano. È il momento del ciclo con maggiore bisogno di introspezione e riposo.',
  '🛏️ Prioriza el descanso, 🤝 pide apoyo, 🌿 magnesio + B6, 📔 journaling',
  '🛏️ Prioritize rest, 🤝 ask for support, 🌿 magnesium + B6, 📔 journaling',
  '🛏️ Priorité au repos, 🤝 demande du soutien, 🌿 magnésium + B6, 📔 journaling',
  '🛏️ Dai priorità al riposo, 🤝 chiedi supporto, 🌿 magnesio + B6, 📔 journaling'
),
('pms', 'cloudy', 'default',
  'Los cambios de humor a lo largo del ciclo son una respuesta normal a las fluctuaciones hormonales. Conocer el patrón te da herramientas para gestionarlo.',
  'Mood changes throughout the cycle are a normal response to hormonal fluctuations. Knowing the pattern gives you tools to manage it.',
  'Les changements d''humeur au cours du cycle sont une réponse normale aux fluctuations hormonales. Connaître le schéma te donne des outils pour le gérer.',
  'I cambiamenti d''umore durante il ciclo sono una risposta normale alle fluttuazioni ormonali. Conoscere il pattern ti dà strumenti per gestirlo.',
  '☀️ Luz, 🏃 movimiento, 🧘 autocompasión',
  '☀️ Light, 🏃 movement, 🧘 self-compassion',
  '☀️ Lumière, 🏃 mouvement, 🧘 auto-compassion',
  '☀️ Luce, 🏃 movimento, 🧘 auto-compassione'
),

-- ── ENERGÍA ─────────────────────────────────────────────────────────────────

('energy', 'exhausted', 'menstrual',
  'La pérdida de hierro, la inflamación y el trabajo del útero consumen energía. El agotamiento en los primeros días de la regla es completamente normal.',
  'Iron loss, inflammation and uterine work consume energy. Exhaustion in the first days of your period is completely normal.',
  'La perte de fer, l''inflammation et le travail utérin consomment de l''énergie. L''épuisement dans les premiers jours des règles est tout à fait normal.',
  'La perdita di ferro, l''infiammazione e il lavoro uterino consumano energia. L''esaurimento nei primi giorni della mestruazione è assolutamente normale.',
  '🥩 Hierro (carne roja, legumbres), ☕ adapta la cafeína, 🛏️ no luches contra el descanso, 🌿 vitamina C con las comidas (mejora absorción del hierro)',
  '🥩 Iron (red meat, legumes), ☕ adapt caffeine, 🛏️ don''t fight rest, 🌿 vitamin C with meals (improves iron absorption)',
  '🥩 Fer (viande rouge, légumineuses), ☕ adapte la caféine, 🛏️ ne résiste pas au repos, 🌿 vitamine C aux repas (améliore l''absorption du fer)',
  '🥩 Ferro (carne rossa, legumi), ☕ adatta la caffeina, 🛏️ non combattere il riposo, 🌿 vitamina C con i pasti (migliora l''assorbimento del ferro)'
),
('energy', 'exhausted', 'luteal',
  'En la segunda mitad del ciclo el metabolismo basal sube un 10-15%, el cuerpo gasta más energía. Es normal tener más sueño.',
  'In the second half of the cycle, basal metabolism rises 10-15%, the body spends more energy. It''s normal to feel sleepier.',
  'Dans la seconde moitié du cycle, le métabolisme basal augmente de 10-15%, le corps dépense plus d''énergie. Il est normal d''avoir plus sommeil.',
  'Nella seconda metà del ciclo il metabolismo basale sale del 10-15%, il corpo consuma più energia. È normale avere più sonno.',
  '🍠 Carbohidratos complejos, 🛏️ 30 min más de sueño si es posible, 🧘 actividad moderada vs. intensa',
  '🍠 Complex carbohydrates, 🛏️ 30 more min of sleep if possible, 🧘 moderate vs. intense activity',
  '🍠 Glucides complexes, 🛏️ 30 min de sommeil en plus si possible, 🧘 activité modérée vs. intense',
  '🍠 Carboidrati complessi, 🛏️ 30 min in più di sonno se possibile, 🧘 attività moderata vs. intensa'
),
('energy', 'exhausted', 'default',
  'El nivel de energía varía a lo largo del ciclo. La fase menstrual y la lútea suelen ser las de menor energía; la folicular y ovulatoria las de mayor.',
  'Energy levels vary throughout the cycle. The menstrual and luteal phases tend to be the lowest energy; follicular and ovulation the highest.',
  'Le niveau d''énergie varie tout au long du cycle. Les phases menstruelle et lutéale ont tendance à être les plus faibles; folliculaire et ovulatoire les plus élevées.',
  'I livelli energetici variano durante il ciclo. Le fasi mestruale e luteale tendono ad essere quelle con meno energia; follicolari e ovulatoria quelle con più energia.',
  '🛏️ Respeta tu descanso, 🥗 proteína en cada comida, 💧 hidratación',
  '🛏️ Respect your rest, 🥗 protein in every meal, 💧 hydration',
  '🛏️ Respecte ton repos, 🥗 protéine à chaque repas, 💧 hydratation',
  '🛏️ Rispetta il tuo riposo, 🥗 proteina in ogni pasto, 💧 idratazione'
),

('energy', 'tired', 'follicular',
  'Si te sientes cansada en la fase folicular (cuando deberías tener más energía), puede ser señal de anemia, tiroides baja o falta de sueño acumulado.',
  'If you feel tired in the follicular phase (when you should have more energy), it may signal anemia, low thyroid, or accumulated sleep debt.',
  'Si tu te sens fatiguée en phase folliculaire (quand tu devrais avoir plus d''énergie), cela peut signaler une anémie, une thyroïde basse ou un manque de sommeil accumulé.',
  'Se ti senti stanca nella fase follicolare (quando dovresti avere più energia), può segnalare anemia, tiroide bassa o debito di sonno accumulato.',
  '🥩 Revisa tu ingesta de hierro, 🛏️ prioriza el sueño, ☀️ luz solar matutina',
  '🥩 Check your iron intake, 🛏️ prioritize sleep, ☀️ morning sunlight',
  '🥩 Vérifie ton apport en fer, 🛏️ priorise le sommeil, ☀️ lumière solaire matinale',
  '🥩 Controlla l''apporto di ferro, 🛏️ dai priorità al sonno, ☀️ luce solare mattutina'
),
('energy', 'tired', 'default',
  'El cansancio moderado es parte del ciclo. Escucha tu cuerpo: no todos los días tienen que ser de máxima energía.',
  'Moderate tiredness is part of the cycle. Listen to your body: not every day has to be at maximum energy.',
  'La fatigue modérée fait partie du cycle. Écoute ton corps: tous les jours ne doivent pas être au maximum d''énergie.',
  'La stanchezza moderata fa parte del ciclo. Ascolta il tuo corpo: non tutti i giorni devono essere al massimo dell''energia.',
  '🛏️ Descanso, 💧 hidratación, 🥗 hierro + vitamina C',
  '🛏️ Rest, 💧 hydration, 🥗 iron + vitamin C',
  '🛏️ Repos, 💧 hydratation, 🥗 fer + vitamine C',
  '🛏️ Riposo, 💧 idratazione, 🥗 ferro + vitamina C'
),

-- ── MENTE ────────────────────────────────────────────────────────────────────

('mind', 'foggy', 'menstrual',
  'La caída de estrógenos reduce el aporte de glucosa al cerebro. La "niebla mental" menstrual es fisiológicamente real, no es pereza.',
  'The drop in estrogen reduces glucose supply to the brain. Menstrual "brain fog" is physiologically real, not laziness.',
  'La chute des estrogènes réduit l''apport de glucose au cerveau. Le "brouillard cérébral" menstruel est physiologiquement réel, pas de la paresse.',
  'Il calo degli estrogeni riduce l''apporto di glucosio al cervello. La "nebbia mentale" mestruale è fisiologicamente reale, non pigrizia.',
  '🐟 Omega-3 (salmón, sardinas), 🫐 antioxidantes, 📝 listas para no olvidar cosas, 🧘 no planifiques decisiones difíciles este día',
  '🐟 Omega-3 (salmon, sardines), 🫐 antioxidants, 📝 lists so you don''t forget things, 🧘 don''t schedule difficult decisions this day',
  '🐟 Oméga-3 (saumon, sardines), 🫐 antioxydants, 📝 listes pour ne pas oublier, 🧘 ne planifie pas de décisions difficiles ce jour',
  '🐟 Omega-3 (salmone, sardine), 🫐 antiossidanti, 📝 liste per non dimenticare, 🧘 non pianificare decisioni difficili questo giorno'
),
('mind', 'foggy', 'luteal',
  'La progesterona tiene un efecto sedante en el cerebro. Es normal sentir menos agilidad mental en la segunda mitad del ciclo.',
  'Progesterone has a sedative effect on the brain. It''s normal to feel less mental agility in the second half of the cycle.',
  'La progestérone a un effet sédatif sur le cerveau. Il est normal de se sentir moins agile mentalement dans la seconde moitié du cycle.',
  'Il progesterone ha un effetto sedativo sul cervello. È normale sentire meno agilità mentale nella seconda metà del ciclo.',
  '☕ Cafeína moderada, 🧩 tareas simples vs. creativas complejas, 🛏️ sueño de calidad',
  '☕ Moderate caffeine, 🧩 simple tasks vs. complex creative ones, 🛏️ quality sleep',
  '☕ Caféine modérée, 🧩 tâches simples vs. créatives complexes, 🛏️ sommeil de qualité',
  '☕ Caffeina moderata, 🧩 compiti semplici vs. creativi complessi, 🛏️ sonno di qualità'
),
('mind', 'foggy', 'default',
  'La claridad mental varía con el ciclo. La fase folicular y ovulatoria suelen ser las de mayor claridad; menstrual y lútea las de mayor niebla.',
  'Mental clarity varies with the cycle. The follicular and ovulation phases tend to have the most clarity; menstrual and luteal the most fog.',
  'La clarté mentale varie avec le cycle. Les phases folliculaire et ovulatoire ont généralement la plus grande clarté; menstruelle et lutéale le plus de brouillard.',
  'La chiarezza mentale varia con il ciclo. Le fasi follicolare e ovulatoria tendono ad avere più chiarezza; mestruale e luteale più nebbia.',
  '🐟 Omega-3, 🫐 antioxidantes, 🛏️ sueño suficiente',
  '🐟 Omega-3, 🫐 antioxidants, 🛏️ sufficient sleep',
  '🐟 Oméga-3, 🫐 antioxydants, 🛏️ sommeil suffisant',
  '🐟 Omega-3, 🫐 antiossidanti, 🛏️ sonno sufficiente'
),

('mind', 'stressed', 'luteal',
  'La progesterona alta hace que el sistema nervioso sea más reactivo al estrés. Lo que en otra fase sería leve, en la fase lútea se magnifica.',
  'High progesterone makes the nervous system more reactive to stress. What in another phase would be mild, in the luteal phase is magnified.',
  'La progestérone élevée rend le système nerveux plus réactif au stress. Ce qui dans une autre phase serait léger, en phase lutéale est amplifié.',
  'Il progesterone alto rende il sistema nervioso più reattivo allo stress. Ciò che in un''altra fase sarebbe lieve, nella fase luteale si amplifica.',
  '🧘 Respiración 4-7-8 (inhala 4s, aguanta 7s, exhala 8s), 🌿 magnesio glicin., 🏊 natación o yoga, 📵 límita redes sociales',
  '🧘 4-7-8 breathing (inhale 4s, hold 7s, exhale 8s), 🌿 magnesium glycinate, 🏊 swimming or yoga, 📵 limit social media',
  '🧘 Respiration 4-7-8 (inspire 4s, retiens 7s, expire 8s), 🌿 magnésium glycinate, 🏊 natation ou yoga, 📵 limite les réseaux sociaux',
  '🧘 Respirazione 4-7-8 (inspira 4s, trattieni 7s, espira 8s), 🌿 magnesio glicinato, 🏊 nuoto o yoga, 📵 limita i social media'
),
('mind', 'stressed', 'default',
  'El estrés crónico eleva el cortisol, que puede interferir con la ovulación y alargar el ciclo. Gestionar el estrés es parte del cuidado del ciclo.',
  'Chronic stress raises cortisol, which can interfere with ovulation and lengthen the cycle. Managing stress is part of cycle care.',
  'Le stress chronique élève le cortisol, qui peut interférer avec l''ovulation et allonger le cycle. Gérer le stress fait partie du soin du cycle.',
  'Lo stress cronico alza il cortisolo, che può interferire con l''ovulazione e allungare il ciclo. Gestire lo stress è parte della cura del ciclo.',
  '🧘 Meditación, 🏃 ejercicio, 🌿 adaptógenos (ashwagandha), 🛏️ prioriza el sueño',
  '🧘 Meditation, 🏃 exercise, 🌿 adaptogens (ashwagandha), 🛏️ prioritize sleep',
  '🧘 Méditation, 🏃 exercice, 🌿 adaptogènes (ashwagandha), 🛏️ priorise le sommeil',
  '🧘 Meditazione, 🏃 esercizio, 🌿 adattogeni (ashwagandha), 🛏️ dai priorità al sonno'
),

-- ── SENTIMIENTOS ─────────────────────────────────────────────────────────────

('feelings', 'anxious', 'luteal',
  'La caída de progesterona en los últimos días del ciclo reduce el GABA, el neurotransmisor calmante. La ansiedad premenstrual tiene base bioquímica.',
  'The drop in progesterone in the last days of the cycle reduces GABA, the calming neurotransmitter. Premenstrual anxiety has a biochemical basis.',
  'La chute de progestérone dans les derniers jours du cycle réduit le GABA, le neurotransmetteur calmant. L''anxiété prémenstruelle a une base biochimique.',
  'Il calo del progesterone negli ultimi giorni del ciclo riduce il GABA, il neurotrasmettitore calmante. L''ansia premestruale ha una base biochimica.',
  '🧘 Respiración profunda, 🌿 magnesio glicin. (favorece GABA), 🏊 natación, 📵 descanso digital, 🍵 infusión de pasiflora',
  '🧘 Deep breathing, 🌿 magnesium glycinate (supports GABA), 🏊 swimming, 📵 digital detox, 🍵 passionflower tea',
  '🧘 Respiration profonde, 🌿 magnésium glycinate (favorise GABA), 🏊 natation, 📵 détox digitale, 🍵 infusion de passiflore',
  '🧘 Respirazione profonda, 🌿 magnesio glicinato (supporta GABA), 🏊 nuoto, 📵 detox digitale, 🍵 infusione di passiflora'
),
('feelings', 'anxious', 'menstrual',
  'Con la bajada de todas las hormonas al inicio de la regla, el sistema nervioso queda más vulnerable. La ansiedad de los primeros días es hormonal.',
  'With all hormones dropping at the start of your period, the nervous system becomes more vulnerable. First-day anxiety is hormonal.',
  'Avec la baisse de toutes les hormones au début des règles, le système nerveux devient plus vulnérable. L''anxiété des premiers jours est hormonale.',
  'Con il calo di tutti gli ormoni all''inizio della mestruazione, il sistema nervoso diventa più vulnerabile. L''ansia dei primi giorni è ormonale.',
  '🌿 Infusión de manzanilla, 🛏️ reposo y calor, 🎵 música relajante, 🧘 autocompasión',
  '🌿 Chamomile tea, 🛏️ rest and warmth, 🎵 relaxing music, 🧘 self-compassion',
  '🌿 Infusion de camomille, 🛏️ repos et chaleur, 🎵 musique relaxante, 🧘 auto-compassion',
  '🌿 Infusione di camomilla, 🛏️ riposo e calore, 🎵 musica rilassante, 🧘 auto-compassione'
),
('feelings', 'anxious', 'default',
  'La ansiedad puede aparecer en cualquier fase. Si se concentra siempre en la misma semana del ciclo, es un patrón hormonal que vale la pena registrar.',
  'Anxiety can appear in any phase. If it always concentrates in the same week of the cycle, it''s a hormonal pattern worth tracking.',
  'L''anxiété peut apparaître à n''importe quelle phase. Si elle se concentre toujours dans la même semaine du cycle, c''est un schéma hormonal qui vaut la peine d''être noté.',
  'L''ansia può comparire in qualsiasi fase. Se si concentra sempre nella stessa settimana del ciclo, è un pattern ormonale che vale la pena tenere traccia.',
  '🧘 Respiración, 🌿 magnesio, 🏃 ejercicio suave',
  '🧘 Breathing, 🌿 magnesium, 🏃 gentle exercise',
  '🧘 Respiration, 🌿 magnésium, 🏃 exercice doux',
  '🧘 Respirazione, 🌿 magnesio, 🏃 esercizio delicato'
),

('feelings', 'sensitive', 'luteal',
  'Los receptores cerebrales de oxitocina aumentan en la fase lútea. Esto hace que seamos más empáticas, pero también más vulnerables emocionalmente.',
  'Brain oxytocin receptors increase in the luteal phase. This makes us more empathetic but also more emotionally vulnerable.',
  'Les récepteurs cérébraux à l''ocytocine augmentent en phase lutéale. Cela nous rend plus empathiques, mais aussi plus vulnérables émotionnellement.',
  'I recettori cerebrali dell''ossitocina aumentano nella fase luteale. Questo ci rende più empatiche ma anche più vulnerabili emotivamente.',
  '🤝 Comunícalo a las personas cercanas, 🧘 valida tus emociones sin juzgarlas, 🌿 magnesio + B6',
  '🤝 Communicate it to close ones, 🧘 validate your emotions without judging them, 🌿 magnesium + B6',
  '🤝 Communique-le aux proches, 🧘 valide tes émotions sans les juger, 🌿 magnésium + B6',
  '🤝 Comunicalo alle persone vicine, 🧘 valida le tue emozioni senza giudicarle, 🌿 magnesio + B6'
),
('feelings', 'sensitive', 'default',
  'La sensibilidad emocional varía con el ciclo. Es una característica humana, no una debilidad.',
  'Emotional sensitivity varies with the cycle. It''s a human characteristic, not a weakness.',
  'La sensibilité émotionnelle varie avec le cycle. C''est une caractéristique humaine, pas une faiblesse.',
  'La sensibilità emotiva varia con il ciclo. È una caratteristica umana, non una debolezza.',
  '🧘 Autocompasión, 🤝 apoyo social, 📔 journaling',
  '🧘 Self-compassion, 🤝 social support, 📔 journaling',
  '🧘 Auto-compassion, 🤝 soutien social, 📔 journaling',
  '🧘 Auto-compassione, 🤝 supporto sociale, 📔 journaling'
)

ON CONFLICT (category, symptom, phase) DO UPDATE SET
  why_es   = EXCLUDED.why_es,
  why_en   = EXCLUDED.why_en,
  why_fr   = EXCLUDED.why_fr,
  why_it   = EXCLUDED.why_it,
  helps_es = EXCLUDED.helps_es,
  helps_en = EXCLUDED.helps_en,
  helps_fr = EXCLUDED.helps_fr,
  helps_it = EXCLUDED.helps_it,
  updated_at = NOW();
