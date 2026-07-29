/**
 * symptomInsights.js
 * Pop-ups educativos que aparecen al seleccionar un síntoma en el registro diario.
 * Cada entrada explica POR QUÉ ocurre en cada fase y QUÉ AYUDA.
 *
 * Estructura:
 * SYMPTOM_INSIGHTS[categoryId][optionId][phase] = { why, helps }
 * Si no hay entrada específica por fase, se usa [optionId].default
 */

export const SYMPTOM_INSIGHTS = {

 // ── FLUJO ─────────────────────────────────────────────────────────────────

 flow: {
 heavy: {
 menstrual: {
 why: {
 es: 'El útero se contrae para expulsar el endometrio. El flujo abundante en los primeros días es completamente normal.',
 en: 'The uterus contracts to shed the endometrium. Heavy flow in the first days is completely normal.',
 fr: 'L\'utérus se contracte pour expulser l\'endomètre. Un flux abondant les premiers jours est tout à fait normal.',
 it: 'L\'utero si contrae per eliminare l\'endometrio. Il flusso abbondante nei primi giorni è assolutamente normale.',
 },
 helps: {
 es: 'Magnesio (chocolate negro 85%),  calor local,  posición fetal,  hidratación extra',
 en: 'Magnesium (85% dark chocolate),  local heat,  fetal position,  extra hydration',
 fr: 'Magnésium (chocolat noir 85%),  chaleur locale,  position fœtale,  hydratation extra',
 it: 'Magnesio (cioccolato fondente 85%),  calore locale,  posizione fetale,  idratazione extra',
 },
 },
 default: {
 why: {
 es: 'Un flujo intenso fuera de la menstruación puede indicar un quiste, mioma o desequilibrio hormonal. Anótalo y coméntalo con tu ginecóloga si es frecuente.',
 en: 'Heavy flow outside menstruation can indicate a cyst, fibroid or hormonal imbalance. Note it and discuss with your gynecologist if it recurs.',
 fr: 'Un flux intense hors menstruations peut signaler un kyste, un fibrome ou un déséquilibre hormonal. Notez-le et parlez-en à votre gynécologue si cela se répète.',
 it: 'Un flusso intenso fuori dalla mestruazione può indicare una ciste, un fibroma o uno squilibrio ormonale. Annotalo e parlane con la tua ginecologa se è frequente.',
 },
 helps: {
 es: 'Consulta con tu ginecóloga si se repite',
 en: 'Consult your gynecologist if it recurs',
 fr: 'Consultez votre gynécologue si cela se répète',
 it: 'Consulta la tua ginecologa se si ripete',
 },
 },
 },
 },

 // ── DOLOR ─────────────────────────────────────────────────────────────────

 pain: {
 cramps: {
 menstrual: {
 why: {
 es: 'La prostaglandina PGF2α hace que el útero se contraiga. Cuanto más alta sea su concentración, más intensos los cólicos.',
 en: 'Prostaglandin PGF2α causes the uterus to contract. The higher its concentration, the more intense the cramps.',
 fr: 'La prostaglandine PGF2α fait se contracter l\'utérus. Plus sa concentration est élevée, plus les crampes sont intenses.',
 it: 'La prostaglandina PGF2α causa contrazioni uterine. Più alta è la sua concentrazione, più intensi i crampi.',
 },
 helps: {
 es: 'Calor local (bolsa agua caliente),  jengibre + cúrcuma,  yoga suave,  ibuprofeno si es muy intenso',
 en: 'Local heat (hot water bottle),  ginger + turmeric,  gentle yoga,  ibuprofen if very intense',
 fr: 'Chaleur locale (bouillotte),  gingembre + curcuma,  yoga doux,  ibuprofène si très intense',
 it: 'Calore locale (borsa acqua calda),  zenzero + curcuma,  yoga dolce,  ibuprofene se molto intenso',
 },
 },
 luteal: {
 why: {
 es: 'Los dolores antes de la regla (dismenorrea secundaria) son comunes. Si son muy fuertes, pueden indicar endometriosis.',
 en: 'Pre-period cramps (secondary dysmenorrhea) are common. If very strong, they may indicate endometriosis.',
 fr: 'Les douleurs pré-menstruelles (dysménorrhée secondaire) sont fréquentes. Si très intenses, elles peuvent indiquer une endométriose.',
 it: 'I dolori pre-mestruali (dismenorrea secondaria) sono comuni. Se molto forti, possono indicare endometriosi.',
 },
 helps: {
 es: 'Magnesio,  manzanilla,  estiramientos de cadera,  calor preventivo',
 en: 'Magnesium,  chamomile,  hip stretches,  preventive heat',
 fr: 'Magnésium,  camomille,  étirements des hanches,  chaleur préventive',
 it: 'Magnesio,  camomilla,  stretching anca,  calore preventivo',
 },
 },
 default: {
 why: {
 es: 'Los cólicos uterinos fuera de la menstruación merecen atención. Pueden estar relacionados con ovulación u otras causas.',
 en: 'Uterine cramps outside of menstruation deserve attention. They may be related to ovulation or other causes.',
 fr: 'Les crampes utérines hors menstruations méritent attention. Elles peuvent être liées à l\'ovulation ou d\'autres causes.',
 it: 'I crampi uterini fuori dalla mestruazione meritano attenzione. Possono essere legati all\'ovulazione o altre cause.',
 },
 helps: {
 es: 'Calor local,  infusión de jengibre',
 en: 'Local heat,  ginger infusion',
 fr: 'Chaleur locale,  infusion de gingembre',
 it: 'Calore locale,  infusione di zenzero',
 },
 },
 },

 breast: {
 luteal: {
 why: {
 es: 'La progesterona y el estrógeno preparan el tejido mamario para un posible embarazo. La sensibilidad en la fase lútea es muy normal.',
 en: 'Progesterone and estrogen prepare breast tissue for a possible pregnancy. Tenderness in the luteal phase is very normal.',
 fr: 'La progestérone et l\'estrogène préparent le tissu mammaire à une éventuelle grossesse. La sensibilité en phase lutéale est tout à fait normale.',
 it: 'Progesterone ed estrogeni preparano il tessuto mammario a una possibile gravidanza. La sensibilità nella fase luteale è assolutamente normale.',
 },
 helps: {
 es: 'Compresa fría,  sujetador sin aros,  reducir cafeína y sal,  vitamina E',
 en: 'Cold compress,  wire-free bra,  reduce caffeine and salt,  vitamin E',
 fr: 'Compresse froide,  soutien-gorge sans armatures,  réduire caféine et sel,  vitamine E',
 it: 'Compressa fredda,  reggiseno senza ferretto,  ridurre caffeina e sale,  vitamina E',
 },
 },
 ovulation: {
 why: {
 es: 'El pico de estrógeno antes de la ovulación puede provocar sensibilidad mamaria. Es la señal de que tu cuerpo está liberando el óvulo.',
 en: 'The estrogen surge before ovulation can cause breast tenderness. It\'s the signal that your body is releasing the egg.',
 fr: 'Le pic d\'estrogènes avant l\'ovulation peut provoquer une sensibilité mammaire. C\'est le signal que ton corps libère l\'ovule.',
 it: 'Il picco di estrogeni prima dell\'ovulazione può causare sensibilità al seno. È il segnale che il tuo corpo sta rilasciando l\'ovulo.',
 },
 helps: {
 es: 'Compresa fría,  sujetador cómodo sin presión',
 en: 'Cold compress,  comfortable bra without pressure',
 fr: 'Compresse froide,  soutien-gorge confortable sans pression',
 it: 'Compressa fredda,  reggiseno comodo senza pressione',
 },
 },
 default: {
 why: {
 es: 'La sensibilidad mamaria está relacionada con las fluctuaciones de estrógeno y progesterona a lo largo del ciclo.',
 en: 'Breast tenderness is related to estrogen and progesterone fluctuations throughout the cycle.',
 fr: 'La sensibilité mammaire est liée aux fluctuations d\'estrogène et de progestérone tout au long du cycle.',
 it: 'La sensibilità al seno è legata alle fluttuazioni di estrogeno e progesterone durante il ciclo.',
 },
 helps: {
 es: 'Compresa fría,  reduce cafeína',
 en: 'Cold compress,  reduce caffeine',
 fr: 'Compresse froide,  réduire la caféine',
 it: 'Compressa fredda,  riduci caffeina',
 },
 },
 },

 headache: {
 menstrual: {
 why: {
 es: 'La caída brusca de estrógenos justo antes/durante la menstruación es la causa más frecuente de migraña menstrual.',
 en: 'The sudden drop in estrogen just before/during menstruation is the most frequent cause of menstrual migraine.',
 fr: 'La chute brutale des estrogènes juste avant/pendant les règles est la cause la plus fréquente de migraine menstruelle.',
 it: 'Il calo brusco degli estrogeni appena prima/durante la mestruazione è la causa più frequente di emicrania mestruale.',
 },
 helps: {
 es: 'Hidratación (al menos 2L),  magnesio + riboflavina,  descanso en oscuridad, pequeña dosis cafeína puede aliviar',
 en: 'Hydration (at least 2L),  magnesium + riboflavin,  rest in darkness, small caffeine dose can relieve',
 fr: 'Hydratation (au moins 2L),  magnésium + riboflavine,  repos dans l\'obscurité, petite dose de caféine peut soulager',
 it: 'Idratazione (almeno 2L),  magnesio + riboflavina,  riposo al buio, piccola dose di caffeina può alleviare',
 },
 },
 luteal: {
 why: {
 es: 'El SPM puede incluir cefaleas tensionales por el desequilibrio de serotonina que provoca la bajada de progesterona.',
 en: 'PMS can include tension headaches due to the serotonin imbalance caused by progesterone decline.',
 fr: 'Le SPM peut inclure des céphalées de tension dues au déséquilibre en sérotonine causé par la baisse de progestérone.',
 it: 'La SPM può includere cefalee tensionali dovute allo squilibrio della serotonina causato dal calo del progesterone.',
 },
 helps: {
 es: 'Masaje temporal,  hidratación,  magnesio,  respiración profunda',
 en: 'Temple massage,  hydration,  magnesium,  deep breathing',
 fr: 'Massage temporal,  hydratation,  magnésium,  respiration profonde',
 it: 'Massaggio temporale,  idratazione,  magnesio,  respirazione profonda',
 },
 },
 default: {
 why: {
 es: 'Las fluctuaciones hormonales afectan a los vasos sanguíneos y a la serotonina, lo que puede desencadenar dolores de cabeza en cualquier fase.',
 en: 'Hormonal fluctuations affect blood vessels and serotonin, which can trigger headaches in any phase.',
 fr: 'Les fluctuations hormonales affectent les vaisseaux sanguins et la sérotonine, pouvant déclencher des maux de tête à n\'importe quelle phase.',
 it: 'Le fluttuazioni ormonali influenzano i vasi sanguigni e la serotonina, che possono scatenare mal di testa in qualsiasi fase.',
 },
 helps: {
 es: 'Hidratación,  masaje,  magnesio',
 en: 'Hydration,  massage,  magnesium',
 fr: 'Hydratation,  massage,  magnésium',
 it: 'Idratazione,  massaggio,  magnesio',
 },
 },
 },

 back: {
 menstrual: {
 why: {
 es: 'Las prostaglandinas que desencadenan las contracciones uterinas también afectan a los músculos de la espalda baja.',
 en: 'The prostaglandins that trigger uterine contractions also affect lower back muscles.',
 fr: 'Les prostaglandines qui déclenchent les contractions utérines affectent aussi les muscles du bas du dos.',
 it: 'Le prostaglandine che scatenano le contrazioni uterine influenzano anche i muscoli della schiena.',
 },
 helps: {
 es: 'Calor lumbar,  postura de niño (yoga),  masaje lumbar suave,  caminata ligera',
 en: 'Lower back heat,  child\'s pose (yoga),  gentle lower back massage,  light walking',
 fr: 'Chaleur lombaire,  posture de l\'enfant (yoga),  massage lombaire doux,  marche légère',
 it: 'Calore lombare,  posizione del bambino (yoga),  massaggio lombare delicato,  camminata leggera',
 },
 },
 default: {
 why: {
 es: 'El dolor lumbar puede aparecer con la retención de líquidos (fase lútea) o por la postura que adoptamos durante la menstruación.',
 en: 'Lower back pain can appear with water retention (luteal phase) or due to posture we adopt during menstruation.',
 fr: 'Les douleurs lombaires peuvent apparaître avec la rétention d\'eau (phase lutéale) ou en raison de la posture adoptée pendant les règles.',
 it: 'Il mal di schiena può comparire con la ritenzione idrica (fase luteale) o per la postura che adottiamo durante la mestruazione.',
 },
 helps: {
 es: 'Calor local,  estiramientos,  movimiento suave',
 en: 'Local heat,  stretches,  gentle movement',
 fr: 'Chaleur locale,  étirements,  mouvement doux',
 it: 'Calore locale,  stretching,  movimento leggero',
 },
 },
 },

 ovulation: {
 ovulation: {
 why: {
 es: 'El Mittelschmerz ("dolor de la mitad") ocurre cuando el folículo se rompe para liberar el óvulo. Dura pocas horas y es una señal de ovulación activa.',
 en: 'Mittelschmerz ("middle pain") occurs when the follicle ruptures to release the egg. It lasts a few hours and is a sign of active ovulation.',
 fr: 'Le Mittelschmerz ("douleur du milieu") survient quand le follicule se rompt pour libérer l\'ovule. Il dure quelques heures et est un signe d\'ovulation active.',
 it: 'Il Mittelschmerz ("dolore di mezzo") si verifica quando il follicolo si rompe per rilasciare l\'ovulo. Dura poche ore ed è un segnale di ovulazione attiva.',
 },
 helps: {
 es: 'Calor suave en el lateral afectado,  reposo breve,  hidratación',
 en: 'Gentle heat on the affected side,  brief rest,  hydration',
 fr: 'Chaleur douce du côté concerné,  bref repos,  hydratation',
 it: 'Calore delicato sul lato interessato,  breve riposo,  idratazione',
 },
 },
 default: {
 why: {
 es: 'Si sientes dolor de tipo ovulatorio fuera de la ovulación, puede ser un folículo que no ovuló correctamente o un quiste funcional.',
 en: 'If you feel ovulation-type pain outside ovulation, it may be a follicle that did not ovulate correctly or a functional cyst.',
 fr: 'Si tu ressens une douleur de type ovulatoire hors ovulation, cela peut être un follicule qui n\'a pas ovulé correctement ou un kyste fonctionnel.',
 it: 'Se senti dolore di tipo ovulatorio fuori dall\'ovulazione, può essere un follicolo che non ha ovulato correttamente o una ciste funzionale.',
 },
 helps: {
 es: 'Calor suave,  consulta si se repite frecuentemente',
 en: 'Gentle heat,  consult if it recurs frequently',
 fr: 'Chaleur douce,  consulte si cela se répète souvent',
 it: 'Calore delicato,  consulta se si ripete frequentemente',
 },
 },
 },
 },

 // ── SPM ────────────────────────────────────────────────────────────────────

 pms: {
 bloating: {
 luteal: {
 why: {
 es: 'La progesterona ralentiza el tránsito intestinal y favorece la retención de líquidos. Es la causa del "vientre de globo" premenstrual.',
 en: 'Progesterone slows intestinal transit and promotes water retention. This is the cause of the premenstrual "balloon belly".',
 fr: 'La progestérone ralentit le transit intestinal et favorise la rétention d\'eau. C\'est la cause du "ventre ballon" prémenstruel.',
 it: 'Il progesterone rallenta il transito intestinale e favorisce la ritenzione idrica. È la causa del "pancia gonfia" premestruale.',
 },
 helps: {
 es: 'Reduce sal y azúcar,  infusión de hinojo o menta,  movimiento (aunque suave),  más agua (paradójicamente ayuda a eliminar el exceso)',
 en: 'Reduce salt and sugar,  fennel or mint tea,  movement (even gentle),  more water (paradoxically helps eliminate the excess)',
 fr: 'Réduis sel et sucre,  infusion de fenouil ou menthe,  mouvement (même léger),  plus d\'eau (aide paradoxalement à éliminer l\'excès)',
 it: 'Riduci sale e zucchero,  infusione di finocchio o menta,  movimento (anche lieve),  più acqua (paradossalmente aiuta a eliminare l\'eccesso)',
 },
 },
 menstrual: {
 why: {
 es: 'La inflamación uterina puede extenderse al aparato digestivo. La hinchazón en los primeros días de la regla es muy frecuente.',
 en: 'Uterine inflammation can spread to the digestive system. Bloating in the first days of your period is very common.',
 fr: 'L\'inflammation utérine peut s\'étendre à l\'appareil digestif. Les ballonnements dans les premiers jours des règles sont très fréquents.',
 it: 'L\'infiammazione uterina può estendersi all\'apparato digestivo. Il gonfiore nei primi giorni della mestruazione è molto frequente.',
 },
 helps: {
 es: 'Infusión de jengibre,  calor en el abdomen,  evita gluten y lácteos temporalmente',
 en: 'Ginger tea,  heat on abdomen,  temporarily avoid gluten and dairy',
 fr: 'Infusion de gingembre,  chaleur sur le ventre,  évite temporairement gluten et laitages',
 it: 'Infusione di zenzero,  calore sull\'addome,  evita temporaneamente glutine e latticini',
 },
 },
 default: {
 why: {
 es: 'La hinchazón fuera del ciclo puede ser digestiva (FODMAP, aerofagia) o linfática (retención). Observa si tiene relación con alimentos.',
 en: 'Bloating outside the cycle can be digestive (FODMAP, aerophagia) or lymphatic (retention). Observe if it\'s food-related.',
 fr: 'Les ballonnements hors cycle peuvent être digestifs (FODMAP, aérophagie) ou lymphatiques (rétention). Observe si c\'est lié à des aliments.',
 it: 'Il gonfiore fuori dal ciclo può essere digestivo (FODMAP, aerofagia) o linfatico (ritenzione). Osserva se è correlato al cibo.',
 },
 helps: {
 es: 'Infusión de hinojo,  identifica alimentos que te inflaman',
 en: 'Fennel tea,  identify foods that cause bloating',
 fr: 'Infusion de fenouil,  identifie les aliments qui te ballonnent',
 it: 'Infusione di finocchio,  identifica gli alimenti che causano gonfiore',
 },
 },
 },

 cravings: {
 luteal: {
 why: {
 es: 'La serotonina cae en la fase lútea. El cuerpo busca carbohidratos y chocolate para elevarla rápido. Es un mecanismo neurológico real, no "falta de voluntad".',
 en: 'Serotonin drops in the luteal phase. The body seeks carbs and chocolate to quickly raise it. It\'s a real neurological mechanism, not "lack of willpower".',
 fr: 'La sérotonine chute en phase lutéale. Le corps cherche des glucides et du chocolat pour la remonter vite. C\'est un mécanisme neurologique réel, pas un "manque de volonté".',
 it: 'La serotonina cala nella fase luteale. Il corpo cerca carboidrati e cioccolato per alzarla rapidamente. È un meccanismo neurologico reale, non "mancanza di forza di volontà".',
 },
 helps: {
 es: 'Chocolate negro (85%+) satisface y aporta magnesio,  frutos secos,  boniato asado,  no saltes comidas',
 en: 'Dark chocolate (85%+) satisfies and provides magnesium,  nuts,  baked sweet potato,  don\'t skip meals',
 fr: 'Chocolat noir (85%+) satisfait et apporte du magnésium,  fruits secs,  patate douce rôtie,  ne saute pas de repas',
 it: 'Cioccolato fondente (85%+) soddisfa e apporta magnesio,  frutta secca,  patata dolce al forno,  non saltare i pasti',
 },
 },
 menstrual: {
 why: {
 es: 'El cuerpo necesita más hierro y energía para compensar las pérdidas. Los antojos de carne roja o dulce son señales de necesidades reales.',
 en: 'The body needs more iron and energy to compensate for losses. Cravings for red meat or sweets are signals of real needs.',
 fr: 'Le corps a besoin de plus de fer et d\'énergie pour compenser les pertes. Les envies de viande rouge ou de sucré sont des signaux de besoins réels.',
 it: 'Il corpo ha bisogno di più ferro e energia per compensare le perdite. Il desiderio di carne rossa o dolci sono segnali di bisogni reali.',
 },
 helps: {
 es: 'Proteína de calidad (hierro hemo),  chocolate negro,  frutos del bosque para el dulce',
 en: 'Quality protein (heme iron),  dark chocolate,  berries for the sweet craving',
 fr: 'Protéine de qualité (fer héminique),  chocolat noir,  baies pour l\'envie sucrée',
 it: 'Proteina di qualità (ferro eme),  cioccolato fondente,  frutti di bosco per il dolce',
 },
 },
 default: {
 why: {
 es: 'Los antojos a lo largo del ciclo reflejan cambios en la serotonina, los niveles de glucosa y las necesidades energéticas reales.',
 en: 'Cravings throughout the cycle reflect changes in serotonin, glucose levels and real energy needs.',
 fr: 'Les envies tout au long du cycle reflètent les changements de sérotonine, de glycémie et les besoins énergétiques réels.',
 it: 'Le voglie durante il ciclo riflettono cambiamenti nella serotonina, nei livelli di glucosio e nei reali bisogni energetici.',
 },
 helps: {
 es: 'Snack de calidad en vez de ultra-procesado,  mantén horarios estables de comida',
 en: 'Quality snack instead of ultra-processed,  keep stable meal times',
 fr: 'Snack de qualité plutôt qu\'ultra-transformé,  maintiens des horaires de repas stables',
 it: 'Snack di qualità invece di ultra-processato,  mantieni orari regolari dei pasti',
 },
 },
 },

 acne: {
 luteal: {
 why: {
 es: 'El aumento de andrógenos en la fase lútea estimula las glándulas sebáceas. El acné premenstrual aparece 7-10 días antes de la regla.',
 en: 'The increase in androgens in the luteal phase stimulates the sebaceous glands. Premenstrual acne appears 7-10 days before your period.',
 fr: 'L\'augmentation des androgènes en phase lutéale stimule les glandes sébacées. L\'acné prémenstruel apparaît 7-10 jours avant les règles.',
 it: 'L\'aumento degli androgeni nella fase luteale stimola le ghiandole sebacee. L\'acne premestruale compare 7-10 giorni prima della mestruazione.',
 },
 helps: {
 es: 'Reduce azúcar refinado y lácteos,  ácido salicílico tópico,  zinc (semillas de calabaza),  hidratación',
 en: 'Reduce refined sugar and dairy,  topical salicylic acid,  zinc (pumpkin seeds),  hydration',
 fr: 'Réduis sucres raffinés et laitages,  acide salicylique topique,  zinc (graines de citrouille),  hydratation',
 it: 'Riduci zucchero raffinato e latticini,  acido salicilico topico,  zinco (semi di zucca),  idratazione',
 },
 },
 ovulation: {
 why: {
 es: 'El pico de estrógeno antes de ovular puede provocar un pequeño brote. Es transitorio y desaparece en pocos días.',
 en: 'The estrogen peak before ovulation can trigger a small breakout. It\'s transient and disappears within a few days.',
 fr: 'Le pic d\'estrogènes avant l\'ovulation peut provoquer une petite poussée. Elle est transitoire et disparaît en quelques jours.',
 it: 'Il picco di estrogeni prima dell\'ovulazione può provocare una piccola eruzione. È transitoria e scompare in pochi giorni.',
 },
 helps: {
 es: 'Limpieza suave,  no tocar el grano,  antioxidantes',
 en: 'Gentle cleansing,  don\'t touch the spot,  antioxidants',
 fr: 'Nettoyage doux,  ne pas toucher le bouton,  antioxydants',
 it: 'Pulizia delicata,  non toccare il brufolo,  antiossidanti',
 },
 },
 default: {
 why: {
 es: 'El acné cíclico es una señal de desequilibrio hormonal. Si es intenso, puede indicar SOP u otras condiciones.',
 en: 'Cyclic acne is a sign of hormonal imbalance. If intense, it may indicate PCOS or other conditions.',
 fr: 'L\'acné cyclique est un signe de déséquilibre hormonal. S\'il est intense, il peut indiquer un SOPK ou d\'autres conditions.',
 it: 'L\'acne ciclica è un segnale di squilibrio ormonale. Se intenso, può indicare PCOS o altre condizioni.',
 },
 helps: {
 es: 'Dieta antiinflamatoria,  rutina de limpieza consistente',
 en: 'Anti-inflammatory diet,  consistent cleansing routine',
 fr: 'Alimentation anti-inflammatoire,  routine de nettoyage consistante',
 it: 'Dieta antinfiammatoria,  routine di pulizia costante',
 },
 },
 },

 cloudy: {
 luteal: {
 why: {
 es: 'La progesterona alta de la fase lútea baja la serotonina y la dopamina. El "bajón" antes de la regla es químicamente real.',
 en: 'High progesterone in the luteal phase lowers serotonin and dopamine. The premenstrual "low" is chemically real.',
 fr: 'La progestérone élevée en phase lutéale abaisse la sérotonine et la dopamine. Le "coup de mou" prémenstruel est chimiquement réel.',
 it: 'Il progesterone alto nella fase luteale abbassa serotonina e dopamina. Il "calo" premestruale è chimicamente reale.',
 },
 helps: {
 es: 'Luz solar (mínimo 20 min),  ejercicio (libera endorfinas),  chocolate negro (serotonina),  no juzgues tus emociones',
 en: 'Sunlight (minimum 20 min),  exercise (releases endorphins),  dark chocolate (serotonin),  don\'t judge your emotions',
 fr: 'Lumière solaire (minimum 20 min),  exercice (libère endorphines),  chocolat noir (sérotonine),  ne juge pas tes émotions',
 it: 'Luce solare (minimo 20 min),  esercizio (rilascia endorfine),  cioccolato fondente (serotonina),  non giudicare le tue emozioni',
 },
 },
 menstrual: {
 why: {
 es: 'Con la menstruación caen todas las hormonas. Es el momento de mayor necesidad de introspección y descanso del ciclo.',
 en: 'With menstruation, all hormones drop. It\'s the phase of greatest need for introspection and rest in the cycle.',
 fr: 'Avec les règles, toutes les hormones chutent. C\'est la phase du cycle qui demande le plus d\'introspection et de repos.',
 it: 'Con la mestruazione tutte le ormoni calano. È il momento del ciclo con maggiore bisogno di introspezione e riposo.',
 },
 helps: {
 es: 'Prioriza el descanso,  pide apoyo,  magnesio + B6,  journaling',
 en: 'Prioritize rest,  ask for support,  magnesium + B6,  journaling',
 fr: 'Priorité au repos,  demande du soutien,  magnésium + B6,  journaling',
 it: 'Dai priorità al riposo,  chiedi supporto,  magnesio + B6,  journaling',
 },
 },
 default: {
 why: {
 es: 'Los cambios de humor a lo largo del ciclo son una respuesta normal a las fluctuaciones hormonales. Conocer el patrón te da herramientas para gestionarlo.',
 en: 'Mood changes throughout the cycle are a normal response to hormonal fluctuations. Knowing the pattern gives you tools to manage it.',
 fr: 'Les changements d\'humeur au cours du cycle sont une réponse normale aux fluctuations hormonales. Connaître le schéma te donne des outils pour le gérer.',
 it: 'I cambiamenti d\'umore durante il ciclo sono una risposta normale alle fluttuazioni ormonali. Conoscere il pattern ti dà strumenti per gestirlo.',
 },
 helps: {
 es: 'Luz,  movimiento,  autocompasión',
 en: 'Light,  movement,  self-compassion',
 fr: 'Lumière,  mouvement,  auto-compassion',
 it: 'Luce,  movimento,  auto-compassione',
 },
 },
 },
 },

 // ── ENERGÍA ───────────────────────────────────────────────────────────────

 energy: {
 exhausted: {
 menstrual: {
 why: {
 es: 'La pérdida de hierro, la inflamación y el trabajo del útero consumen energía. El agotamiento en los primeros días de la regla es completamente normal.',
 en: 'Iron loss, inflammation and uterine work consume energy. Exhaustion in the first days of your period is completely normal.',
 fr: 'La perte de fer, l\'inflammation et le travail utérin consomment de l\'énergie. L\'épuisement dans les premiers jours des règles est tout à fait normal.',
 it: 'La perdita di ferro, l\'infiammazione e il lavoro uterino consumano energia. L\'esaurimento nei primi giorni della mestruazione è assolutamente normale.',
 },
 helps: {
 es: 'Hierro (carne roja, legumbres), adapta la cafeína,  no luches contra el descanso,  vitamina C con las comidas (mejora absorción del hierro)',
 en: 'Iron (red meat, legumes), adapt caffeine,  don\'t fight rest,  vitamin C with meals (improves iron absorption)',
 fr: 'Fer (viande rouge, légumineuses), adapte la caféine,  ne résiste pas au repos,  vitamine C aux repas (améliore l\'absorption du fer)',
 it: 'Ferro (carne rossa, legumi), adatta la caffeina,  non combattere il riposo,  vitamina C con i pasti (migliora l\'assorbimento del ferro)',
 },
 },
 luteal: {
 why: {
 es: 'En la segunda mitad del ciclo el metabolismo basal sube un 10-15%, el cuerpo gasta más energía. Es normal tener más sueño.',
 en: 'In the second half of the cycle, basal metabolism rises 10-15%, the body spends more energy. It\'s normal to feel sleepier.',
 fr: 'Dans la seconde moitié du cycle, le métabolisme basal augmente de 10-15%, le corps dépense plus d\'énergie. Il est normal d\'avoir plus sommeil.',
 it: 'Nella seconda metà del ciclo il metabolismo basale sale del 10-15%, il corpo consuma più energia. È normale avere più sonno.',
 },
 helps: {
 es: 'Carbohidratos complejos,  30 min más de sueño si es posible,  actividad moderada vs. intensa',
 en: 'Complex carbohydrates,  30 more min of sleep if possible,  moderate vs. intense activity',
 fr: 'Glucides complexes,  30 min de sommeil en plus si possible,  activité modérée vs. intense',
 it: 'Carboidrati complessi,  30 min in più di sonno se possibile,  attività moderata vs. intensa',
 },
 },
 default: {
 why: {
 es: 'El nivel de energía varía a lo largo del ciclo. La fase menstrual y la lútea suelen ser las de menor energía; la folicular y ovulatoria las de mayor.',
 en: 'Energy levels vary throughout the cycle. The menstrual and luteal phases tend to be the lowest energy; follicular and ovulation the highest.',
 fr: 'Le niveau d\'énergie varie tout au long du cycle. Les phases menstruelle et lutéale ont tendance à être les plus faibles; folliculaire et ovulatoire les plus élevées.',
 it: 'I livelli energetici variano durante il ciclo. Le fasi mestruale e luteale tendono ad essere quelle con meno energia; follicolari e ovulatoria quelle con più energia.',
 },
 helps: {
 es: 'Respeta tu descanso,  proteína en cada comida,  hidratación',
 en: 'Respect your rest,  protein in every meal,  hydration',
 fr: 'Respecte ton repos,  protéine à chaque repas,  hydratation',
 it: 'Rispetta il tuo riposo,  proteina in ogni pasto,  idratazione',
 },
 },
 },

 tired: {
 follicular: {
 why: {
 es: 'Si te sientes cansada en la fase folicular (cuando deberías tener más energía), puede ser señal de anemia, tiroides baja o falta de sueño acumulado.',
 en: 'If you feel tired in the follicular phase (when you should have more energy), it may signal anemia, low thyroid, or accumulated sleep debt.',
 fr: 'Si tu te sens fatiguée en phase folliculaire (quand tu devrais avoir plus d\'énergie), cela peut signaler une anémie, une thyroïde basse ou un manque de sommeil accumulé.',
 it: 'Se ti senti stanca nella fase follicolare (quando dovresti avere più energia), può segnalare anemia, tiroide bassa o debito di sonno accumulato.',
 },
 helps: {
 es: 'Revisa tu ingesta de hierro,  prioriza el sueño, luz solar matutina',
 en: 'Check your iron intake,  prioritize sleep, morning sunlight',
 fr: 'Vérifie ton apport en fer,  priorise le sommeil, lumière solaire matinale',
 it: 'Controlla l\'apporto di ferro,  dai priorità al sonno, luce solare mattutina',
 },
 },
 default: {
 why: {
 es: 'El cansancio moderado es parte del ciclo. Escucha tu cuerpo: no todos los días tienen que ser de máxima energía.',
 en: 'Moderate tiredness is part of the cycle. Listen to your body: not every day has to be at maximum energy.',
 fr: 'La fatigue modérée fait partie du cycle. Écoute ton corps: tous les jours ne doivent pas être au maximum d\'énergie.',
 it: 'La stanchezza moderata fa parte del ciclo. Ascolta il tuo corpo: non tutti i giorni devono essere al massimo dell\'energia.',
 },
 helps: {
 es: 'Descanso,  hidratación,  hierro + vitamina C',
 en: 'Rest,  hydration,  iron + vitamin C',
 fr: 'Repos,  hydratation,  fer + vitamine C',
 it: 'Riposo,  idratazione,  ferro + vitamina C',
 },
 },
 },
 },

 // ── MENTE ─────────────────────────────────────────────────────────────────

 mind: {
 foggy: {
 menstrual: {
 why: {
 es: 'La caída de estrógenos reduce el aporte de glucosa al cerebro. La "niebla mental" menstrual es fisiológicamente real, no es pereza.',
 en: 'The drop in estrogen reduces glucose supply to the brain. Menstrual "brain fog" is physiologically real, not laziness.',
 fr: 'La chute des estrogènes réduit l\'apport de glucose au cerveau. Le "brouillard cérébral" menstruel est physiologiquement réel, pas de la paresse.',
 it: 'Il calo degli estrogeni riduce l\'apporto di glucosio al cervello. La "nebbia mentale" mestruale è fisiologicamente reale, non pigrizia.',
 },
 helps: {
 es: 'Omega-3 (salmón, sardinas),  antioxidantes,  listas para no olvidar cosas,  no planifiques decisiones difíciles este día',
 en: 'Omega-3 (salmon, sardines),  antioxidants,  lists so you don\'t forget things,  don\'t schedule difficult decisions this day',
 fr: 'Oméga-3 (saumon, sardines),  antioxydants,  listes pour ne pas oublier,  ne planifie pas de décisions difficiles ce jour',
 it: 'Omega-3 (salmone, sardine),  antiossidanti,  liste per non dimenticare,  non pianificare decisioni difficili questo giorno',
 },
 },
 luteal: {
 why: {
 es: 'La progesterona tiene un efecto sedante en el cerebro. Es normal sentir menos agilidad mental en la segunda mitad del ciclo.',
 en: 'Progesterone has a sedative effect on the brain. It\'s normal to feel less mental agility in the second half of the cycle.',
 fr: 'La progestérone a un effet sédatif sur le cerveau. Il est normal de se sentir moins agile mentalement dans la seconde moitié du cycle.',
 it: 'Il progesterone ha un effetto sedativo sul cervello. È normale sentire meno agilità mentale nella seconda metà del ciclo.',
 },
 helps: {
 es: 'Cafeína moderada,  tareas simples vs. creativas complejas,  sueño de calidad',
 en: 'Moderate caffeine,  simple tasks vs. complex creative ones,  quality sleep',
 fr: 'Caféine modérée,  tâches simples vs. créatives complexes,  sommeil de qualité',
 it: 'Caffeina moderata,  compiti semplici vs. creativi complessi,  sonno di qualità',
 },
 },
 default: {
 why: {
 es: 'La claridad mental varía con el ciclo. La fase folicular y ovulatoria suelen ser las de mayor claridad; menstrual y lútea las de mayor niebla.',
 en: 'Mental clarity varies with the cycle. The follicular and ovulation phases tend to have the most clarity; menstrual and luteal the most fog.',
 fr: 'La clarté mentale varie avec le cycle. Les phases folliculaire et ovulatoire ont généralement la plus grande clarté; menstruelle et lutéale le plus de brouillard.',
 it: 'La chiarezza mentale varia con il ciclo. Le fasi follicolare e ovulatoria tendono ad avere più chiarezza; mestruale e luteale più nebbia.',
 },
 helps: {
 es: 'Omega-3,  antioxidantes,  sueño suficiente',
 en: 'Omega-3,  antioxidants,  sufficient sleep',
 fr: 'Oméga-3,  antioxydants,  sommeil suffisant',
 it: 'Omega-3,  antiossidanti,  sonno sufficiente',
 },
 },
 },

 stressed: {
 luteal: {
 why: {
 es: 'La progesterona alta hace que el sistema nervioso sea más reactivo al estrés. Lo que en otra fase sería leve, en la fase lútea se magnifica.',
 en: 'High progesterone makes the nervous system more reactive to stress. What in another phase would be mild, in the luteal phase is magnified.',
 fr: 'La progestérone élevée rend le système nerveux plus réactif au stress. Ce qui dans une autre phase serait léger, en phase lutéale est amplifié.',
 it: 'Il progesterone alto rende il sistema nervioso più reattivo allo stress. Ciò che in un\'altra fase sarebbe lieve, nella fase luteale si amplifica.',
 },
 helps: {
 es: 'Respiración 4-7-8 (inhala 4s, aguanta 7s, exhala 8s),  magnesio glicin.,  natación o yoga,  límita redes sociales',
 en: '4-7-8 breathing (inhale 4s, hold 7s, exhale 8s),  magnesium glycinate,  swimming or yoga,  limit social media',
 fr: 'Respiration 4-7-8 (inspire 4s, retiens 7s, expire 8s),  magnésium glycinate,  natation ou yoga,  limite les réseaux sociaux',
 it: 'Respirazione 4-7-8 (inspira 4s, trattieni 7s, espira 8s),  magnesio glicinato,  nuoto o yoga,  limita i social media',
 },
 },
 default: {
 why: {
 es: 'El estrés crónico eleva el cortisol, que puede interferir con la ovulación y alargar el ciclo. Gestionar el estrés es parte del cuidado del ciclo.',
 en: 'Chronic stress raises cortisol, which can interfere with ovulation and lengthen the cycle. Managing stress is part of cycle care.',
 fr: 'Le stress chronique élève le cortisol, qui peut interférer avec l\'ovulation et allonger le cycle. Gérer le stress fait partie du soin du cycle.',
 it: 'Lo stress cronico alza il cortisolo, che può interferire con l\'ovulazione e allungare il ciclo. Gestire lo stress è parte della cura del ciclo.',
 },
 helps: {
 es: 'Meditación,  ejercicio,  adaptógenos (ashwagandha),  prioriza el sueño',
 en: 'Meditation,  exercise,  adaptogens (ashwagandha),  prioritize sleep',
 fr: 'Méditation,  exercice,  adaptogènes (ashwagandha),  priorise le sommeil',
 it: 'Meditazione,  esercizio,  adattogeni (ashwagandha),  dai priorità al sonno',
 },
 },
 },
 },

 // ── SENTIMIENTOS ──────────────────────────────────────────────────────────

 feelings: {
 anxious: {
 luteal: {
 why: {
 es: 'La caída de progesterona en los últimos días del ciclo reduce el GABA, el neurotransmisor calmante. La ansiedad premenstrual tiene base bioquímica.',
 en: 'The drop in progesterone in the last days of the cycle reduces GABA, the calming neurotransmitter. Premenstrual anxiety has a biochemical basis.',
 fr: 'La chute de progestérone dans les derniers jours du cycle réduit le GABA, le neurotransmetteur calmant. L\'anxiété prémenstruelle a une base biochimique.',
 it: 'Il calo del progesterone negli ultimi giorni del ciclo riduce il GABA, il neurotrasmettitore calmante. L\'ansia premestruale ha una base biochimica.',
 },
 helps: {
 es: 'Respiración profunda,  magnesio glicin. (favorece GABA),  natación,  descanso digital,  infusión de pasiflora',
 en: 'Deep breathing,  magnesium glycinate (supports GABA),  swimming,  digital detox,  passionflower tea',
 fr: 'Respiration profonde,  magnésium glycinate (favorise GABA),  natation,  détox digitale,  infusion de passiflore',
 it: 'Respirazione profonda,  magnesio glicinato (supporta GABA),  nuoto,  detox digitale,  infusione di passiflora',
 },
 },
 menstrual: {
 why: {
 es: 'Con la bajada de todas las hormonas al inicio de la regla, el sistema nervioso queda más vulnerable. La ansiedad de los primeros días es hormonal.',
 en: 'With all hormones dropping at the start of your period, the nervous system becomes more vulnerable. First-day anxiety is hormonal.',
 fr: 'Avec la baisse de toutes les hormones au début des règles, le système nerveux devient plus vulnérable. L\'anxiété des premiers jours est hormonale.',
 it: 'Con il calo di tutti gli ormoni all\'inizio della mestruazione, il sistema nervoso diventa più vulnerabile. L\'ansia dei primi giorni è ormonale.',
 },
 helps: {
 es: 'Infusión de manzanilla,  reposo y calor,  música relajante,  autocompasión',
 en: 'Chamomile tea,  rest and warmth,  relaxing music,  self-compassion',
 fr: 'Infusion de camomille,  repos et chaleur,  musique relaxante,  auto-compassion',
 it: 'Infusione di camomilla,  riposo e calore,  musica rilassante,  auto-compassione',
 },
 },
 default: {
 why: {
 es: 'La ansiedad puede aparecer en cualquier fase. Si se concentra siempre en la misma semana del ciclo, es un patrón hormonal que vale la pena registrar.',
 en: 'Anxiety can appear in any phase. If it always concentrates in the same week of the cycle, it\'s a hormonal pattern worth tracking.',
 fr: 'L\'anxiété peut apparaître à n\'importe quelle phase. Si elle se concentre toujours dans la même semaine du cycle, c\'est un schéma hormonal qui vaut la peine d\'être noté.',
 it: 'L\'ansia può comparire in qualsiasi fase. Se si concentra sempre nella stessa settimana del ciclo, è un pattern ormonale che vale la pena tenere traccia.',
 },
 helps: {
 es: 'Respiración,  magnesio,  ejercicio suave',
 en: 'Breathing,  magnesium,  gentle exercise',
 fr: 'Respiration,  magnésium,  exercice doux',
 it: 'Respirazione,  magnesio,  esercizio delicato',
 },
 },
 },

 sensitive: {
 luteal: {
 why: {
 es: 'Los receptores cerebrales de oxitocina aumentan en la fase lútea. Esto hace que seamos más empáticas, pero también más vulnerables emocionalmente.',
 en: 'Brain oxytocin receptors increase in the luteal phase. This makes us more empathetic but also more emotionally vulnerable.',
 fr: 'Les récepteurs cérébraux à l\'ocytocine augmentent en phase lutéale. Cela nous rend plus empathiques, mais aussi plus vulnérables émotionnellement.',
 it: 'I recettori cerebrali dell\'ossitocina aumentano nella fase luteale. Questo ci rende più empatiche ma anche più vulnerabili emotivamente.',
 },
 helps: {
 es: 'Comunícalo a las personas cercanas,  valida tus emociones sin juzgarlas,  magnesio + B6',
 en: 'Communicate it to close ones,  validate your emotions without judging them,  magnesium + B6',
 fr: 'Communique-le aux proches,  valide tes émotions sans les juger,  magnésium + B6',
 it: 'Comunicalo alle persone vicine,  valida le tue emozioni senza giudicarle,  magnesio + B6',
 },
 },
 default: {
 why: {
 es: 'La sensibilidad emocional varía con el ciclo. Es una característica humana, no una debilidad.',
 en: 'Emotional sensitivity varies with the cycle. It\'s a human characteristic, not a weakness.',
 fr: 'La sensibilité émotionnelle varie avec le cycle. C\'est une caractéristique humaine, pas une faiblesse.',
 it: 'La sensibilità emotiva varia con il ciclo. È una caratteristica umana, non una debolezza.',
 },
 helps: {
 es: 'Autocompasión,  apoyo social,  journaling',
 en: 'Self-compassion,  social support,  journaling',
 fr: 'Auto-compassion,  soutien social,  journaling',
 it: 'Auto-compassione,  supporto sociale,  journaling',
 },
 },
 },
 },
};

/**
 * Obtiene el insight para un síntoma en una fase concreta desde datos locales.
 * Usado como fallback cuando Supabase no está disponible.
 */
export function getInsightLocal(categoryId, optionId, phase, lang = 'es') {
 const cat = SYMPTOM_INSIGHTS[categoryId];
 if (!cat) return null;
 const opt = cat[optionId];
 if (!opt) return null;
 const entry = opt[phase] || opt.default;
 if (!entry) return null;
 return {
 why: entry.why?.[lang] || entry.why?.es || '',
 helps: entry.helps?.[lang] || entry.helps?.es || '',
 };
}

/**
 * Obtiene el insight desde Supabase con fallback a datos locales.
 * Uso asíncrono: const insight = await getInsight(cat, symptom, phase, lang)
 */
export async function getInsight(categoryId, optionId, phase, lang = 'es') {
 try {
 const { fetchSymptomInsight } = await import('./dataService');
 const remote = await fetchSymptomInsight(categoryId, optionId, phase, lang);
 if (remote) return remote;
 } catch (_) {}
 return getInsightLocal(categoryId, optionId, phase, lang);
}
