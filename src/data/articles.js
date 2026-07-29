// ─── Meirins · Articles / Tips content ────────────────────────────────────────
// Each article: id, category, icon, readTime, title{es,en,fr}, summary{es,en,fr}, body{es,en,fr}

export const ARTICLE_CATEGORIES = {
 cycle: { icon: '', color: '#7C3AED', bg: '#F5F3FF' },
 nutrition: { icon: '', color: '#059669', bg: '#ECFDF5' },
 health: { icon: '', color: '#DC2626', bg: '#FEF2F2' },
 fitness: { icon: '', color: '#2563EB', bg: '#EFF6FF' },
 sleep: { icon: '', color: '#0891B2', bg: '#ECFEFF' },
};

export const ARTICLES = [
 {
 id: 'nutrition-menstrual',
 category: 'nutrition',
 icon: '',
 readTime: 4,
 title: {
 es: 'Qué comer durante la menstruación',
 en: 'What to eat during your period',
 fr: 'Que manger pendant les règles',
 },
 summary: {
 es: 'Los alimentos correctos pueden reducir el dolor, los antojos y la fatiga menstrual.',
 en: 'The right foods can reduce pain, cravings and menstrual fatigue.',
 fr: 'Les bons aliments peuvent réduire la douleur, les envies et la fatigue menstruelle.',
 },
 body: {
 es: [
 'Durante la menstruación, el cuerpo pierde hierro con el sangrado. Prioriza alimentos ricos en hierro hemo (carne roja magra, mejillones) o hierro no hemo (lentejas, espinacas, tofu) acompañados de vitamina C para mejorar su absorción.',
 'El magnesio es tu aliado contra los calambres. Puedes encontrarlo en el chocolate negro, las almendras, las semillas de calabaza y los plátanos. Un cuadradito de chocolate negro 85% no solo es placentero, también es antiinflamatorio.',
 'Reduce el consumo de sal y alcohol, que aumentan la retención de líquidos y emporan la hinchazón. Los ácidos grasos omega-3 del salmón, las nueces y las semillas de lino tienen efecto antiinflamatorio demostrado.',
 'Los carbohidratos complejos (avena, arroz integral, boniato) ayudan a estabilizar el ánimo y la energía, mientras que los azúcares simples disparan y luego hunden el cortisol. Escucha tus antojos pero elige versiones nutritivas.',
 ],
 en: [
 'During menstruation, the body loses iron through bleeding. Prioritise foods rich in haem iron (lean red meat, mussels) or non-haem iron (lentils, spinach, tofu) paired with vitamin C to improve absorption.',
 'Magnesium is your ally against cramps. Find it in dark chocolate, almonds, pumpkin seeds and bananas. A square of 85% dark chocolate is not only enjoyable, it is also anti-inflammatory.',
 'Reduce salt and alcohol intake, which increase fluid retention and worsen bloating. Omega-3 fatty acids from salmon, walnuts and flaxseeds have proven anti-inflammatory effects.',
 'Complex carbohydrates (oats, brown rice, sweet potato) help stabilise mood and energy, while simple sugars spike and then crash cortisol. Listen to your cravings but choose nutritious versions.',
 ],
 fr: [
 "Pendant les règles, le corps perd du fer par les saignements. Privilégie les aliments riches en fer héminique (viande rouge maigre, moules) ou non héminique (lentilles, épinards, tofu) accompagnés de vitamine C pour améliorer l'absorption.",
 "Le magnésium est ton allié contre les crampes. Tu en trouveras dans le chocolat noir, les amandes, les graines de courge et les bananes. Un carré de chocolat noir 85% est non seulement agréable, mais aussi anti-inflammatoire.",
 "Réduis le sel et l'alcool, qui augmentent la rétention d'eau et aggravent les ballonnements. Les acides gras oméga-3 du saumon, des noix et des graines de lin ont des effets anti-inflammatoires prouvés.",
 "Les glucides complexes (flocons d'avoine, riz complet, patate douce) aident à stabiliser l'humeur et l'énergie, tandis que les sucres simples font monter puis chuter le cortisol. Écoute tes envies mais choisis des versions nutritives.",
 ],
 },
 },

 {
 id: 'cycle-training',
 category: 'fitness',
 icon: '',
 readTime: 5,
 title: {
 es: 'Entrena con tu ciclo, no contra él',
 en: 'Train with your cycle, not against it',
 fr: 'Entraîne-toi avec ton cycle, pas contre lui',
 },
 summary: {
 es: 'Sincronizar tu entrenamiento con tus fases hormonales multiplica los resultados y reduce las lesiones.',
 en: 'Syncing your training with your hormonal phases multiplies results and reduces injury.',
 fr: 'Synchroniser ton entraînement avec tes phases hormonales multiplie les résultats et réduit les blessures.',
 },
 body: {
 es: [
 'La periodización del ciclo menstrual es una estrategia real utilizada por atletas de élite. Tus niveles hormonales cambian drásticamente a lo largo del ciclo, y con ellos tu fuerza, resistencia, temperatura corporal y recuperación.',
 'Durante la fase folicular (días 6-13), el estrógeno sube y con él tu fuerza muscular, tolerancia al dolor y capacidad de adaptación. Es el mejor momento para entrenamientos intensos, HIIT y romper marcas personales. El músculo se construye más eficientemente ahora.',
 'La ovulación marca tu pico de energía y rendimiento. La coordinación motora y la fuerza explosiva están al máximo. Aprovecha para pruebas, competiciones o sesiones más exigentes.',
 'En la fase lútea, la progesterona sube la temperatura corporal y aumenta el esfuerzo percibido. No es que seas menos capaz, sino que tu cuerpo trabaja más duro para el mismo rendimiento. Adapta la intensidad progresivamente hacia entrenamientos de movilidad, fuerza moderada y yoga.',
 ],
 en: [
 'Menstrual cycle periodisation is a real strategy used by elite athletes. Your hormone levels change dramatically throughout the cycle, and with them your strength, endurance, core body temperature and recovery.',
 'During the follicular phase (days 6-13), oestrogen rises and with it your muscular strength, pain tolerance and adaptability. This is the best time for intense training, HIIT and personal records. Muscle is built more efficiently now.',
 'Ovulation marks your peak energy and performance. Motor coordination and explosive strength are at their maximum. Use this for tests, competitions or more demanding sessions.',
 'In the luteal phase, progesterone raises body temperature and increases perceived effort. You are not less capable — your body simply works harder for the same output. Progressively adapt intensity towards mobility work, moderate strength and yoga.',
 ],
 fr: [
 "La périodisation du cycle menstruel est une stratégie réelle utilisée par les athlètes d'élite. Tes niveaux hormonaux changent radicalement au cours du cycle, et avec eux ta force, ton endurance, ta température corporelle et ta récupération.",
 "Pendant la phase folliculaire (jours 6-13), les œstrogènes augmentent ainsi que ta force musculaire, ta tolérance à la douleur et ta capacité d'adaptation. C'est le meilleur moment pour les entraînements intenses, le HIIT et les records personnels. Le muscle se construit plus efficacement maintenant.",
 "L'ovulation marque ton pic d'énergie et de performance. La coordination motrice et la force explosive sont à leur maximum. Profite-en pour les tests, compétitions ou séances plus exigeantes.",
 "En phase lutéale, la progestérone élève la température corporelle et augmente l'effort perçu. Tu n'es pas moins capable — ton corps travaille simplement plus fort pour le même résultat. Adapte progressivement l'intensité vers la mobilité, la force modérée et le yoga.",
 ],
 },
 },

 {
 id: 'endometriosis-nutrition',
 category: 'health',
 icon: '',
 readTime: 6,
 title: {
 es: 'Endometriosis y alimentación antiinflamatoria',
 en: 'Endometriosis and anti-inflammatory nutrition',
 fr: 'Endométriose et alimentation anti-inflammatoire',
 },
 summary: {
 es: 'La dieta no cura la endometriosis, pero puede reducir significativamente el dolor y la inflamación.',
 en: 'Diet does not cure endometriosis, but it can significantly reduce pain and inflammation.',
 fr: "L'alimentation ne guérit pas l'endométriose, mais elle peut réduire significativement la douleur et l'inflammation.",
 },
 body: {
 es: [
 'La endometriosis es una enfermedad inflamatoria crónica en la que el tejido similar al endometrio crece fuera del útero. Aunque la cirugía y la medicación son los pilares del tratamiento, la dieta puede ser una herramienta complementaria poderosa para controlar la inflamación sistémica.',
 'Los alimentos pro-inflamatorios que conviene limitar incluyen: carnes rojas procesadas (embutidos, salchichas), grasas trans, azúcares refinados, alcohol y productos lácteos enteros. Estos alimentos estimulan la producción de prostaglandinas, que son las responsables de los calambres y el dolor.',
 'Por el contrario, una dieta mediterránea rica en omega-3 (salmón, sardinas, semillas de lino), antioxidantes (frutos rojos, cúrcuma, jengibre) y fibra (verduras, legumbres) ha mostrado reducir los marcadores inflamatorios en estudios clínicos.',
 'El gluten y los lácteos pueden agravar los síntomas en algunas mujeres con endo, aunque no en todas. Si sospechas que algún alimento empeora tu dolor, lleva un diario de síntomas durante 4-6 semanas antes de eliminarlo por completo. Consulta siempre con tu ginecóloga y una dietista especializada.',
 ],
 en: [
 'Endometriosis is a chronic inflammatory disease in which tissue similar to the endometrium grows outside the uterus. Although surgery and medication are the pillars of treatment, diet can be a powerful complementary tool for controlling systemic inflammation.',
 'Pro-inflammatory foods to limit include: processed red meats (cold cuts, sausages), trans fats, refined sugars, alcohol and full-fat dairy. These foods stimulate prostaglandin production, which is responsible for cramps and pain.',
 'In contrast, a Mediterranean diet rich in omega-3s (salmon, sardines, flaxseeds), antioxidants (berries, turmeric, ginger) and fibre (vegetables, legumes) has been shown to reduce inflammatory markers in clinical studies.',
 'Gluten and dairy can worsen symptoms in some women with endo, though not in all. If you suspect a food is worsening your pain, keep a symptom diary for 4-6 weeks before eliminating it completely. Always consult your gynaecologist and a specialist dietitian.',
 ],
 fr: [
 "L'endométriose est une maladie inflammatoire chronique dans laquelle des tissus similaires à l'endomètre se développent en dehors de l'utérus. Bien que la chirurgie et la médication soient les piliers du traitement, l'alimentation peut être un outil complémentaire puissant pour contrôler l'inflammation systémique.",
 "Les aliments pro-inflammatoires à limiter comprennent : les viandes rouges transformées (charcuteries, saucisses), les graisses trans, les sucres raffinés, l'alcool et les produits laitiers entiers. Ces aliments stimulent la production de prostaglandines, responsables des crampes et de la douleur.",
 "En revanche, un régime méditerranéen riche en oméga-3 (saumon, sardines, graines de lin), en antioxydants (fruits rouges, curcuma, gingembre) et en fibres (légumes, légumineuses) a montré une réduction des marqueurs inflammatoires dans des études cliniques.",
 "Le gluten et les produits laitiers peuvent aggraver les symptômes chez certaines femmes atteintes d'endométriose, mais pas toutes. Si tu suspectes qu'un aliment aggrave ta douleur, tiens un journal des symptômes pendant 4-6 semaines avant de l'éliminer complètement. Consulte toujours ton gynécologue et une diététicienne spécialisée.",
 ],
 },
 },

 {
 id: 'pcos-hormones',
 category: 'health',
 icon: '',
 readTime: 5,
 title: {
 es: 'SOP: equilibrio hormonal a través del estilo de vida',
 en: 'PCOS: hormonal balance through lifestyle',
 fr: 'SOPK : équilibre hormonal par le style de vie',
 },
 summary: {
 es: 'El síndrome de ovario poliquístico responde muy bien a cambios en la alimentación y el ejercicio.',
 en: 'Polycystic ovary syndrome responds very well to changes in diet and exercise.',
 fr: 'Le syndrome des ovaires polykystiques répond très bien aux changements alimentaires et à l\'exercice.',
 },
 body: {
 es: [
 'El SOP es el trastorno hormonal más común en mujeres en edad reproductiva, afectando al 10-15%. Se caracteriza por niveles elevados de andrógenos, resistencia a la insulina en muchos casos, y ciclos irregulares. La buena noticia: el estilo de vida es uno de los pilares del tratamiento.',
 'La resistencia a la insulina, presente en el 70% de las mujeres con SOP, hace que el azúcar en sangre sea más difícil de controlar. Una dieta con bajo índice glucémico —reduciendo harinas refinadas, azúcares y alcohol— puede mejorar significativamente la sensibilidad a la insulina en pocas semanas.',
 'El ejercicio de fuerza (pesas, pilates, bandas de resistencia) es especialmente beneficioso en el SOP porque mejora la sensibilidad a la insulina y ayuda a regular los andrógenos. El HIIT también es eficaz, pero en mujeres con SOP muy sintomáticas puede elevar el cortisol y empeorar los síntomas si se hace en exceso.',
 'Suplementos con evidencia en el SOP: inositol (myo-inositol + D-chiro), vitamina D, omega-3 y magnesio. Habla siempre con tu médico antes de iniciar cualquier suplementación. El objetivo no es "curar" el SOP, sino reducir sus síntomas y mejorar la calidad de vida.',
 ],
 en: [
 'PCOS is the most common hormonal disorder in women of reproductive age, affecting 10-15%. It is characterised by elevated androgens, insulin resistance in many cases, and irregular cycles. The good news: lifestyle is one of the main pillars of treatment.',
 'Insulin resistance, present in 70% of women with PCOS, makes blood sugar harder to control. A low glycaemic index diet — reducing refined flours, sugars and alcohol — can significantly improve insulin sensitivity within weeks.',
 'Strength training (weights, pilates, resistance bands) is especially beneficial in PCOS because it improves insulin sensitivity and helps regulate androgens. HIIT is also effective, but in women with severe PCOS symptoms it can raise cortisol and worsen symptoms if overdone.',
 'Supplements with evidence in PCOS: inositol (myo-inositol + D-chiro), vitamin D, omega-3 and magnesium. Always speak to your doctor before starting any supplementation. The goal is not to "cure" PCOS but to reduce symptoms and improve quality of life.',
 ],
 fr: [
 "Le SOPK est le trouble hormonal le plus courant chez les femmes en âge de procréer, touchant 10 à 15 %. Il se caractérise par des androgènes élevés, une résistance à l'insuline dans de nombreux cas, et des cycles irréguliers. La bonne nouvelle : le mode de vie est l'un des principaux piliers du traitement.",
 "La résistance à l'insuline, présente chez 70 % des femmes atteintes de SOPK, rend la glycémie plus difficile à contrôler. Un régime à faible index glycémique — réduisant les farines raffinées, les sucres et l'alcool — peut améliorer significativement la sensibilité à l'insuline en quelques semaines.",
 "L'entraînement en force (haltères, pilates, bandes élastiques) est particulièrement bénéfique dans le SOPK car il améliore la sensibilité à l'insuline et aide à réguler les androgènes. Le HIIT est également efficace, mais chez les femmes avec des symptômes sévères, il peut élever le cortisol et aggraver les symptômes si excessif.",
 "Compléments avec des preuves dans le SOPK : inositol (myo-inositol + D-chiro), vitamine D, oméga-3 et magnésium. Consulte toujours ton médecin avant de commencer tout supplément. L'objectif n'est pas de \"guérir\" le SOPK mais de réduire les symptômes et d'améliorer la qualité de vie.",
 ],
 },
 },

 {
 id: 'sleep-cycle',
 category: 'sleep',
 icon: '',
 readTime: 4,
 title: {
 es: 'Cómo el sueño regula tus hormonas',
 en: 'How sleep regulates your hormones',
 fr: 'Comment le sommeil régule tes hormones',
 },
 summary: {
 es: 'El sueño de calidad no es un lujo: es la base sobre la que se construyen tus ciclos hormonales.',
 en: 'Quality sleep is not a luxury: it is the foundation on which your hormonal cycles are built.',
 fr: "Un sommeil de qualité n'est pas un luxe : c'est la base sur laquelle se construisent tes cycles hormonaux.",
 },
 body: {
 es: [
 'La privación de sueño —incluso de forma crónica moderada, dormir 6h en lugar de 8h— eleva el cortisol, la hormona del estrés. El cortisol elevado suprime la producción de progesterona, altera el eje hipotálamo-hipófisis-ovario y puede causar ciclos más cortos, irregulares o con más síntomas premenstruales.',
 'La melatonina, secretada durante el sueño, no solo regula el ciclo circadiano sino que también tiene efectos antioxidantes en los ovarios y puede mejorar la calidad ovocitaria. Exponte a la luz natural por la mañana y evita pantallas brillantes en las 2 horas previas a dormir.',
 'El sueño profundo (fases N3) es cuando el cuerpo secreta la mayor cantidad de hormona de crecimiento, fundamental para la reparación muscular y el mantenimiento del peso. En la fase lútea, la progesterona puede fragmentar más el sueño — es normal. Un ritual de relajación ayuda.',
 'Temperatura, oscuridad y silencio son los tres pilares del ambiente de sueño óptimo. Mantén la habitación entre 17-19°C. Si tienes ciclos muy sintomáticos, el seguimiento del sueño puede ayudarte a correlacionar la calidad del descanso con tus síntomas menstruales.',
 ],
 en: [
 'Sleep deprivation — even chronic moderate deprivation, sleeping 6h instead of 8h — raises cortisol, the stress hormone. Elevated cortisol suppresses progesterone production, disrupts the hypothalamus-pituitary-ovary axis and can cause shorter, irregular cycles or worse premenstrual symptoms.',
 'Melatonin, secreted during sleep, not only regulates the circadian cycle but also has antioxidant effects on the ovaries and may improve egg quality. Get natural light exposure in the morning and avoid bright screens in the 2 hours before bed.',
 'Deep sleep (N3 phases) is when the body secretes the most growth hormone, essential for muscle repair and weight management. In the luteal phase, progesterone can fragment sleep more — this is normal. A relaxation ritual helps.',
 'Temperature, darkness and silence are the three pillars of optimal sleep environment. Keep the room at 17-19°C. If you have very symptomatic cycles, sleep tracking can help you correlate rest quality with your menstrual symptoms.',
 ],
 fr: [
 "La privation de sommeil — même chronique modérée, dormir 6h au lieu de 8h — élève le cortisol, l'hormone du stress. Un cortisol élevé supprime la production de progestérone, perturbe l'axe hypothalamo-hypophyso-ovarien et peut provoquer des cycles plus courts, irréguliers ou avec plus de symptômes prémenstruels.",
 "La mélatonine, sécrétée pendant le sommeil, ne régule pas seulement le cycle circadien mais a également des effets antioxydants sur les ovaires et peut améliorer la qualité ovocytaire. Expose-toi à la lumière naturelle le matin et évite les écrans lumineux dans les 2 heures avant de dormir.",
 "Le sommeil profond (phases N3) est le moment où le corps sécrète le plus d'hormone de croissance, essentielle à la réparation musculaire et au maintien du poids. En phase lutéale, la progestérone peut fragmenter davantage le sommeil — c'est normal. Un rituel de relaxation aide.",
 "Température, obscurité et silence sont les trois piliers d'un environnement de sommeil optimal. Maintiens la chambre entre 17 et 19°C. Si tu as des cycles très symptomatiques, le suivi du sommeil peut t'aider à corréler la qualité du repos avec tes symptômes menstruels.",
 ],
 },
 },

 {
 id: 'pregnancy-nutrition',
 category: 'health',
 icon: '',
 readTime: 5,
 title: {
 es: 'Nutrición en el embarazo: los esenciales',
 en: 'Nutrition during pregnancy: the essentials',
 fr: 'Nutrition pendant la grossesse : les essentiels',
 },
 summary: {
 es: 'Lo que comes durante el embarazo influye en el desarrollo del bebé y en tu recuperación post-parto.',
 en: 'What you eat during pregnancy influences baby development and your postpartum recovery.',
 fr: "Ce que tu manges pendant la grossesse influence le développement du bébé et ta récupération post-partum.",
 },
 body: {
 es: [
 'El embarazo no significa "comer por dos" en cantidad, sino por dos en calidad. Las necesidades calóricas solo aumentan ~300 kcal/día en el segundo trimestre y ~500 kcal/día en el tercero. Lo realmente importante es la densidad nutricional de cada comida.',
 'Nutrientes clave durante el embarazo: ácido fólico (esencial en el primer trimestre para prevenir defectos del tubo neural), hierro (las necesidades se duplican), calcio y vitamina D, yodo, omega-3 DHA (para el desarrollo cerebral del bebé) y proteínas de calidad.',
 'Alimentos a evitar: pescado azul de gran tamaño (atún, pez espada, tiburón) por mercurio, carnes y pescados crudos o poco cocinados, embutidos no pasteurizados, quesos de pasta blanda no pasteurizados, alcohol y cafeína en exceso (menos de 200mg/día).',
 'La anemia ferropénica es la deficiencia nutricional más común en el embarazo. Combina fuentes de hierro con vitamina C (un zumo de naranja con las lentejas) y evita tomar café o té con las comidas principales. Tu médica o matrona definirá la suplementación específica que necesitas.',
 ],
 en: [
 'Pregnancy does not mean "eating for two" in quantity, but in quality. Caloric needs only increase by ~300 kcal/day in the second trimester and ~500 kcal/day in the third. What truly matters is the nutritional density of each meal.',
 'Key nutrients during pregnancy: folic acid (essential in the first trimester to prevent neural tube defects), iron (needs double), calcium and vitamin D, iodine, omega-3 DHA (for baby brain development) and quality protein.',
 'Foods to avoid: large oily fish (tuna, swordfish, shark) due to mercury, raw or undercooked meats and fish, unpasteurised cold cuts, unpasteurised soft cheeses, alcohol and excess caffeine (under 200mg/day).',
 'Iron deficiency anaemia is the most common nutritional deficiency in pregnancy. Combine iron sources with vitamin C (orange juice with lentils) and avoid tea or coffee with main meals. Your doctor or midwife will define the specific supplementation you need.',
 ],
 fr: [
 "La grossesse ne signifie pas \"manger pour deux\" en quantité, mais en qualité. Les besoins caloriques n'augmentent que d'environ 300 kcal/jour au deuxième trimestre et 500 kcal/jour au troisième. Ce qui compte vraiment, c'est la densité nutritionnelle de chaque repas.",
 "Nutriments clés pendant la grossesse : acide folique (essentiel au premier trimestre pour prévenir les anomalies du tube neural), fer (les besoins doublent), calcium et vitamine D, iode, oméga-3 DHA (pour le développement cérébral du bébé) et protéines de qualité.",
 "Aliments à éviter : grands poissons gras (thon, espadon, requin) en raison du mercure, viandes et poissons crus ou peu cuits, charcuteries non pasteurisées, fromages à pâte molle non pasteurisés, alcool et caféine en excès (moins de 200 mg/jour).",
 "L'anémie ferriprive est la carence nutritionnelle la plus courante pendant la grossesse. Associe les sources de fer à la vitamine C (un jus d'orange avec les lentilles) et évite le thé ou le café pendant les repas principaux. Ton médecin ou ta sage-femme définira la supplémentation spécifique dont tu as besoin.",
 ],
 },
 },
];
