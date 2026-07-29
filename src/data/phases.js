export const PHASES = {
 menstrual: {
 name: 'Menstrual', emoji: '', color: '#64748B', light: '#F8FAFC', mid: 'rgba(100,116,139,0.10)',
 tagline: 'Restauración & Descanso',
 desc: 'Tu cuerpo se renueva. Nutríte con calma y respeta el descanso.',
 focus: ['Hierro', 'Magnesio', 'Omega-3', 'Antiinflamatorios'], kcal: 'Déficit suave · −200 kcal/día',
 meals: [
 { t: 'Desayuno', ico: '', title: 'Porridge reconfortante', items: ['Avena con leche de avena', 'Plátano + semillas de chía', 'Canela y miel'], recipe: { ingredients: ['80g copos de avena', '200ml leche de avena', '1 plátano maduro', '1 cdta semillas de chía', '½ cdta canela molida', '1 cdta miel'], steps: ['Calienta la leche de avena en un cazo a fuego medio.', 'Añade la avena y cocina 4–5 min removiendo constantemente.', 'Vierte en un bol y lamina el plátano encima.', 'Añade la chía, espolvorea canela y termina con la miel.'] } },
 { t: 'Almuerzo', ico: '', title: 'Salmón antiinflamatorio', items: ['Salmón al horno 150g', 'Quinoa 80g + espinacas salteadas', 'Limón y aceite de oliva'], recipe: { ingredients: ['150g filete de salmón', '80g quinoa cruda', '100g espinacas frescas', '1 limón', '2 cdas aceite de oliva virgen', 'Sal, pimienta, eneldo'], steps: ['Precalienta el horno a 180°C. Salpimienta el salmón y hornea 15–18 min.', 'Cuece la quinoa (ratio 1:2 con agua, 15 min).', 'Saltea las espinacas 2 min con un poco de aceite.', 'Sirve la quinoa con espinacas, el salmón encima y aliña con limón.'] } },
 { t: 'Cena', ico: '', title: 'Crema de lentejas rojas', items: ['Crema de lentejas rojas', 'Pan de centeno tostado', 'Jengibre fresco rallado'], recipe: { ingredients: ['150g lentejas rojas', '½ cebolla', '1 zanahoria', '1 cdta jengibre fresco rallado', '½ cdta cúrcuma', '500ml agua o caldo', '1 cda aceite de oliva', 'Pan de centeno'], steps: ['Sofríe la cebolla y zanahoria en aceite 5 min.', 'Añade las lentejas, jengibre, cúrcuma y agua. Cuece 20 min.', 'Tritura con batidora hasta textura suave.', 'Sirve caliente con el pan de centeno tostado.'] } },
 { t: 'Snacks', ico: '', title: 'Caprichos con propósito', items: ['Chocolate negro 85% · 20g', 'Nueces · 30g', 'Infusión jengibre-cúrcuma'], recipe: { ingredients: ['20g chocolate negro 85%', '30g nueces', '1 taza agua caliente', '1 rodaja jengibre fresco', '½ cdta cúrcuma', '1 cdta miel (opcional)'], steps: ['Hierve el agua y añade el jengibre y la cúrcuma.', 'Deja reposar 5 min, cuela y añade miel si deseas.', 'Disfruta junto con el chocolate negro y las nueces.'] } },
 ],
 intensity: 'Muy baja', intensityPct: 20,
 tip: 'El descanso activo tiene tanto valor como el entreno intenso. Tu cuerpo trabaja internamente.',
 week: [
 { d: 'L', name: 'Yoga restaurativo', dur: "30'", ico: '', on: true, exercises: [{ name: 'Postura del niño (Balasana)', dur: '3 min' }, { name: 'Torsión espinal suave', dur: '2 min c/lado' }, { name: 'Piernas en la pared', dur: '5 min' }, { name: 'Savasana', dur: '10 min' }] },
 { d: 'M', name: 'Paseo suave', dur: "20'", ico: '', on: true, exercises: [{ name: 'Caminata a ritmo cómodo', dur: '20 min' }, { name: 'Respiración profunda caminando', dur: 'todo el paseo' }] },
 { d: 'X', name: 'Pilates suave', dur: "40'", ico: '', on: true, exercises: [{ name: 'The Hundred (modificado)', sets: 3, reps: '10 resp' }, { name: 'Roll Up suave', sets: 3, reps: '8' }, { name: 'Single Leg Stretch', sets: 2, reps: '10 c/lado' }, { name: 'Glute Bridge', sets: 3, reps: '12' }, { name: 'Cat-Cow', sets: 2, reps: '10' }] },
 { d: 'J', name: 'Descanso total', dur: '', ico: '', on: false, exercises: [] },
 { d: 'V', name: 'Estiramientos', dur: "30'", ico: '', on: true, exercises: [{ name: 'Estiramiento de caderas', dur: '2 min c/lado' }, { name: 'Apertura de pecho', dur: '3 min' }, { name: 'Estiramiento lumbar', dur: '3 min' }, { name: 'Relajación con respiración', dur: '10 min' }] },
 { d: 'S', name: 'Paseo en naturaleza', dur: "30'", ico: '', on: true, exercises: [{ name: 'Caminata en terreno natural', dur: '30 min' }] },
 { d: 'D', name: 'Descanso', dur: '', ico: '', on: false, exercises: [] },
 ]
 },
 follicular: {
 name: 'Folicular', emoji: '', color: '#2563EB', light: '#EFF6FF', mid: 'rgba(37,99,235,0.10)',
 tagline: 'Energía & Crecimiento',
 desc: 'Los estrógenos suben. Tu fuerza, resistencia y motivación están en pleno auge.',
 focus: ['Proteína magra', 'Carbohidratos complejos', 'Probióticos', 'Zinc'], kcal: 'Déficit moderado · −300 kcal/día',
 meals: [
 { t: 'Desayuno', ico: '', title: 'Tortilla energética', items: ['3 huevos + espinacas frescas', 'Aguacate ½ · tostada centeno', 'Café o té verde'], recipe: { ingredients: ['3 huevos', '60g espinacas frescas', '½ aguacate', '1 rebanada pan de centeno', 'Sal, pimienta, aceite de oliva'], steps: ['Bate los huevos con sal y pimienta.', 'Saltea las espinacas 1 min en sartén con un poco de aceite.', 'Añade los huevos y cuaja a fuego medio-bajo 3–4 min.', 'Tuesta el pan y sirve con el aguacate laminado.'] } },
 { t: 'Almuerzo', ico: '', title: 'Bowl de fuerza', items: ['Pechuga de pollo 150g', 'Quinoa 80g + brócoli al vapor', 'Comino y limón'], recipe: { ingredients: ['150g pechuga de pollo', '80g quinoa cruda', '150g brócoli', '1 limón', '½ cdta comino', '2 cdas aceite de oliva', 'Sal y pimienta'], steps: ['Cuece la quinoa 15 min. Vaporiza el brócoli 8 min.', 'Sazona el pollo con comino, sal y pimienta.', 'Cocina el pollo a la plancha 6–7 min por lado.', 'Monta el bowl con quinoa, brócoli y pollo laminado. Aliña con limón.'] } },
 { t: 'Cena', ico: '', title: 'Merluza al papillote', items: ['Merluza al papillote 150g', 'Boniato asado 120g', 'Ensalada verde con pepitas'], recipe: { ingredients: ['150g filete de merluza', '120g boniato', '80g ensalada mixta', '15g pepitas de calabaza', 'Limón, aceite oliva, sal, hierbas provenzales'], steps: ['Precalienta el horno a 200°C.', 'Envuelve la merluza en papel de horno con limón, aceite y hierbas. Hornea 15 min.', 'Corta el boniato en cubos y hornea con aceite y sal 25 min.', 'Sirve con la ensalada aliñada y pepitas de calabaza.'] } },
 { t: 'Snacks', ico: '', title: 'Energía limpia', items: ['Fruta de temporada', 'Hummus con crudités', 'Kombucha natural'], recipe: { ingredients: ['1 fruta de temporada', '80g hummus', '100g zanahoria y apio crudos', '250ml kombucha natural'], steps: ['Lava y corta las verduras en bastones.', 'Sirve el hummus en un bol pequeño para dipear.', 'Acompaña con la fruta y la kombucha fría.'] } },
 ],
 intensity: 'Alta', intensityPct: 80,
 tip: '¡Aprovecha esta ventana! Tu fuerza es superior. Intenta superar tus marcas personales.',
 week: [
 { d: 'L', name: 'HIIT', dur: "30'", ico: '', on: true, exercises: [{ name: 'Burpees', sets: 4, reps: '12' }, { name: 'Jump squats', sets: 3, reps: '15' }, { name: 'Mountain climbers', sets: 3, dur: '45s' }, { name: 'High knees', sets: 3, dur: '45s' }, { name: 'Push-ups', sets: 3, reps: '12' }] },
 { d: 'M', name: 'Fuerza · Piernas', dur: "45'", ico: '', on: true, exercises: [{ name: 'Sentadilla con peso', sets: 4, reps: '12' }, { name: 'Peso muerto', sets: 3, reps: '10' }, { name: 'Zancadas alternadas', sets: 3, reps: '12 c/lado' }, { name: 'Hip thrust', sets: 4, reps: '15' }, { name: 'Prensa de piernas', sets: 3, reps: '12' }] },
 { d: 'X', name: 'Carrera continua', dur: "30'", ico: '', on: true, exercises: [{ name: 'Calentamiento caminando', dur: '5 min' }, { name: 'Carrera a ritmo constante', dur: '20 min' }, { name: 'Vuelta a la calma', dur: '5 min' }] },
 { d: 'J', name: 'Fuerza · Upper body', dur: "45'", ico: '', on: true, exercises: [{ name: 'Press banca o flexiones', sets: 4, reps: '12' }, { name: 'Remo con mancuerna', sets: 3, reps: '12 c/lado' }, { name: 'Press hombros', sets: 3, reps: '12' }, { name: 'Curl bíceps', sets: 3, reps: '15' }, { name: 'Tríceps en polea', sets: 3, reps: '15' }] },
 { d: 'V', name: 'HIIT / Crossfit', dur: "30'", ico: '', on: true, exercises: [{ name: 'Box jumps', sets: 4, reps: '10' }, { name: 'Kettlebell swings', sets: 4, reps: '15' }, { name: 'Battle ropes', sets: 3, dur: '30s' }, { name: 'TRX rows', sets: 3, reps: '12' }] },
 { d: 'S', name: 'Deporte outdoor', dur: "60'", ico: '', on: true, exercises: [{ name: 'Bici, senderismo o natación', dur: '60 min' }] },
 { d: 'D', name: 'Descanso activo', dur: "20'", ico: '', on: true, exercises: [{ name: 'Yoga suave o estiramientos', dur: '20 min' }] },
 ]
 },
 ovulation: {
 name: 'Ovulación', emoji: '', color: '#0284C7', light: '#F0F9FF', mid: 'rgba(2,132,199,0.10)',
 tagline: 'Pico de Potencia',
 desc: 'Tu mejor momento. Fuerza, energía y carisma al máximo absoluto.',
 focus: ['Zinc', 'Antioxidantes', 'Fibra', 'Comidas ligeras'], kcal: 'Déficit moderado · −250 kcal/día',
 meals: [
 { t: 'Desayuno', ico: '', title: 'Smoothie bowl', items: ['Leche de coco 200ml', 'Frutos rojos 100g', 'Pepitas de calabaza · granola sin gluten'], recipe: { ingredients: ['200ml leche de coco', '100g frutos rojos (frescos o congelados)', '30g granola sin gluten', '15g pepitas de calabaza', '1 cdta miel (opcional)'], steps: ['Tritura los frutos rojos con la leche de coco hasta obtener una base suave.', 'Vierte en un bol.', 'Decora con la granola y las pepitas de calabaza.', 'Añade miel al gusto.'] } },
 { t: 'Almuerzo', ico: '', title: 'Ensalada proteica', items: ['Gambas a la plancha 150g', 'Aguacate + pepino + rúcula', 'Sésamo · vinagreta limón'], recipe: { ingredients: ['150g gambas peladas', '1 aguacate', '½ pepino', '60g rúcula', '10g semillas de sésamo', 'Zumo 1 limón, 2 cdas aceite oliva, sal'], steps: ['Cocina las gambas a la plancha 2–3 min por lado con sal.', 'Lamina el aguacate y corta el pepino en medias lunas.', 'Monta la ensalada con la rúcula de base.', 'Añade gambas, aguacate y pepino. Aliña y espolvorea sésamo.'] } },
 { t: 'Cena', ico: '', title: 'Pavo & fibra', items: ['Pavo a la plancha 150g', 'Espárragos asados', 'Arroz integral 70g'], recipe: { ingredients: ['150g filete de pavo', '150g espárragos', '70g arroz integral', 'Aceite de oliva, ajo, sal, pimienta, pimentón'], steps: ['Cuece el arroz integral 30–35 min.', 'Asa los espárragos con aceite y sal en horno 200°C 15 min.', 'Salpimienta el pavo y cocina a la plancha 5–6 min por lado.', 'Sirve todo junto con un hilo de aceite y pimentón.'] } },
 { t: 'Snacks', ico: '', title: 'Antioxidantes', items: ['Pepitas de calabaza · 30g', 'Frutos rojos frescos', 'Matcha latte con leche de avena'], recipe: { ingredients: ['30g pepitas de calabaza', '100g frutos rojos frescos', '1 cdta matcha en polvo', '200ml leche de avena caliente', '1 cdta miel'], steps: ['Disuelve el matcha en un poco de agua caliente formando una pasta.', 'Calienta la leche de avena y viértela sobre el matcha.', 'Añade miel y mezcla bien.', 'Acompaña con los frutos rojos y las pepitas.'] } },
 ],
 intensity: 'Máxima', intensityPct: 100,
 tip: '¡Bate tus récords! Tu cuerpo está en su pico absoluto. El momento ideal para nuevos retos.',
 week: [
 { d: 'L', name: 'Carrera intensa', dur: "45'", ico: '', on: true, exercises: [{ name: 'Calentamiento', dur: '10 min' }, { name: 'Intervalos 1 min rápido / 1 min suave', sets: 10, reps: 'x' }, { name: 'Vuelta a la calma', dur: '5 min' }] },
 { d: 'M', name: 'Fuerza total', dur: "50'", ico: '', on: true, exercises: [{ name: 'Sentadilla con barra', sets: 5, reps: '8' }, { name: 'Peso muerto', sets: 4, reps: '8' }, { name: 'Press banca', sets: 4, reps: '8' }, { name: 'Dominadas o jalón', sets: 4, reps: '8' }, { name: 'Press militar', sets: 3, reps: '10' }] },
 { d: 'X', name: 'Boxeo / CrossFit', dur: "45'", ico: '', on: true, exercises: [{ name: 'Saltar a la comba', dur: '5 min' }, { name: 'Combinaciones de boxeo', sets: 5, dur: '2 min' }, { name: 'Thruster con mancuernas', sets: 4, reps: '12' }, { name: 'TRX o dominadas', sets: 3, reps: '8' }] },
 { d: 'J', name: 'Fuerza + Cardio', dur: "50'", ico: '', on: true, exercises: [{ name: 'Circuit training: sentadilla + press', sets: 5, reps: '10 c/u' }, { name: 'AMRAP: burpees + remo', dur: '10 min' }, { name: 'Core: plancha y hollow body', sets: 3, dur: '45s' }] },
 { d: 'V', name: 'Deporte outdoor', dur: "60'", ico: '', on: true, exercises: [{ name: 'Senderismo, escalada o trail running', dur: '60 min' }] },
 { d: 'S', name: 'Actividad social', dur: "60'", ico: '', on: true, exercises: [{ name: 'Natación, pádel, tenis o deporte en grupo', dur: '60 min' }] },
 { d: 'D', name: 'Descanso', dur: '', ico: '', on: false, exercises: [] },
 ]
 },
 luteal: {
 name: 'Lútea', emoji: '', color: '#475569', light: '#F8FAFC', mid: 'rgba(71,85,105,0.10)',
 tagline: 'Calma & Equilibrio',
 desc: 'La progesterona toma el mando. Nutre tu cuerpo para navegar el SPM con energía.',
 focus: ['Carbohidratos complejos', 'Triptófano', 'Magnesio', 'Anti-cravings'], kcal: 'Mantenimiento · +100–150 kcal',
 meals: [
 { t: 'Desayuno', ico: '', title: 'Desayuno saciante', items: ['2 tostadas integrales · huevo poché', 'Aguacate + tomate cherry', 'Semillas de girasol'], recipe: { ingredients: ['2 rebanadas pan integral', '2 huevos', '½ aguacate', '80g tomate cherry', '15g semillas de girasol', 'Vinagre blanco, sal, pimienta'], steps: ['Tuesta el pan. Prepara agua con vinagre y llévala casi al hervor.', 'Rompe el huevo en un cuenco y deslízalo suavemente al agua. Cuece 3–4 min.', 'Machaca el aguacate con sal en las tostadas.', 'Coloca el huevo encima, añade los tomates y las semillas.'] } },
 { t: 'Almuerzo', ico: '', title: 'Bowl vegetal completo', items: ['Tofu firme 150g salteado', 'Arroz integral 80g', 'Verduras al wok · sésamo y tamari'], recipe: { ingredients: ['150g tofu firme', '80g arroz integral', '150g verduras mixtas (pimiento, calabacín, zanahoria)', '1 cda tamari sin gluten', '1 cda aceite de sésamo', '1 cdta jengibre rallado', 'Semillas de sésamo'], steps: ['Cuece el arroz integral 30 min.', 'Corta el tofu en cubos y dóralo en sartén hasta que esté crujiente.', 'Saltea las verduras 5 min. Añade tamari, jengibre y el tofu.', 'Sirve sobre el arroz con aceite de sésamo y semillas.'] } },
 { t: 'Cena', ico: '', title: 'Sopa reconfortante', items: ['Caldo de pollo casero', 'Pollo desmenuzado 100g', 'Fideos de arroz + verduras'], recipe: { ingredients: ['600ml caldo de pollo', '100g pollo cocido desmenuzado', '80g fideos de arroz', '100g verduras (puerro, zanahoria, apio)', 'Sal, pimienta, perejil fresco'], steps: ['Calienta el caldo con las verduras cortadas finas durante 10 min.', 'Añade los fideos de arroz y cocina 5–7 min.', 'Incorpora el pollo desmenuzado y calienta 2 min.', 'Sirve con pimienta y perejil fresco picado.'] } },
 { t: 'Snacks', ico: '', title: 'Antojos inteligentes', items: ['Plátano + mantequilla de almendra', 'Chocolate negro 85% · 20g', 'Dátiles 2–3 unidades'], recipe: { ingredients: ['1 plátano maduro', '1 cda mantequilla de almendra', '20g chocolate negro 85%', '2–3 dátiles Medjool'], steps: ['Corta el plátano en rodajas.', 'Unta la mantequilla de almendra sobre las rodajas o dipea directamente.', 'Acompaña con los dátiles y el chocolate.', 'Tip: congela el plátano 1h para una textura tipo helado.'] } },
 ],
 intensity: 'Moderada', intensityPct: 40,
 tip: 'Ve reduciendo la intensidad progresivamente. Prioriza la recuperación.',
 week: [
 { d: 'L', name: 'Pilates', dur: "45'", ico: '', on: true, exercises: [{ name: 'The Hundred', sets: 3, reps: '10 resp' }, { name: 'Roll Up', sets: 3, reps: '8' }, { name: 'Side Kick series', sets: 2, reps: '12 c/lado' }, { name: 'Swimming', sets: 3, dur: '30s' }, { name: 'Seal', sets: 2, reps: '8' }] },
 { d: 'M', name: 'Fuerza moderada', dur: "40'", ico: '', on: true, exercises: [{ name: 'Sentadilla con mancuernas', sets: 3, reps: '12' }, { name: 'Peso muerto suave', sets: 3, reps: '10' }, { name: 'Remo con banda', sets: 3, reps: '15' }, { name: 'Glute bridge', sets: 3, reps: '15' }, { name: 'Core suave', sets: 2, dur: '30s' }] },
 { d: 'X', name: 'Yoga flow', dur: "45'", ico: '', on: true, exercises: [{ name: 'Saludo al sol (×5)', dur: '10 min' }, { name: 'Guerrero I y II', dur: '3 min c/lado' }, { name: 'Torsiones suaves', dur: '5 min' }, { name: 'Yin yoga / posturas de suelo', dur: '15 min' }] },
 { d: 'J', name: 'Caminata rápida', dur: "45'", ico: '', on: true, exercises: [{ name: 'Caminata a paso rápido', dur: '45 min' }] },
 { d: 'V', name: 'Natación suave', dur: "30'", ico: '', on: true, exercises: [{ name: 'Crol suave', sets: 5, reps: '2 largos' }, { name: 'Espalda', sets: 4, reps: '2 largos' }, { name: 'Flotación y respiración', dur: '5 min' }] },
 { d: 'S', name: 'Estiramientos', dur: "30'", ico: '', on: true, exercises: [{ name: 'Estiramiento completo de cuerpo', dur: '30 min' }] },
 { d: 'D', name: 'Descanso total', dur: '', ico: '', on: false, exercises: [] },
 ]
 }
};

export const getPhaseInfo = (dateStr, cycleLen, periodEndDate = null) => {
 if (!dateStr) return null;
 const start = new Date(dateStr); start.setHours(0, 0, 0, 0);
 const today = new Date(); today.setHours(0, 0, 0, 0);
 const diff = Math.round((today - start) / 86400000);
 const day = (diff % cycleLen) + 1;

 // Determine actual menstrual end (default day 5, overridden by logged period end)
 let menstrualEnd = 5;
 if (periodEndDate) {
 const pEnd = new Date(periodEndDate); pEnd.setHours(0, 0, 0, 0);
 const pEndDay = Math.round((pEnd - start) / 86400000) + 1;
 if (pEndDay >= 1 && pEndDay <= 12) menstrualEnd = pEndDay;
 }

 const phase = day <= menstrualEnd ? 'menstrual'
 : day <= 13 ? 'follicular'
 : day <= 16 ? 'ovulation'
 : 'luteal';
 const nextDay = phase === 'menstrual' ? menstrualEnd + 1
 : phase === 'follicular' ? 14
 : phase === 'ovulation' ? 17
 : cycleLen + 1;
 return { phase, day, daysLeft: Math.max(nextDay - day, 0), data: PHASES[phase], cycleLen, menstrualEnd };
};

export const DAY_LABELS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
export const DAY_SHORT = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
export const jsToIdx = { 1: 0, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 0: 6 };