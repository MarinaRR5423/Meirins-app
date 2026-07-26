/**
 * generate_blumm_doc.js — genera Blumm_Descripcion_Comercial.docx
 * Uso: node scripts/generate_blumm_doc.js
 */

const {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  Table, TableRow, TableCell, WidthType, ShadingType,
  AlignmentType, BorderStyle, PageBreak, TableOfContents,
} = require('docx');
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, 'Blumm_Descripcion_Comercial.docx');

// ── Colores ──────────────────────────────────────────────────────────────────
const YELLOW    = 'F5C400';
const DARK      = '1A1A1A';
const MID       = '3D3D3D';
const MUTED     = '6B6B6B';
const LIGHT_BG  = 'FFFBE6';
const WHITE     = 'FFFFFF';

// ── Helpers ──────────────────────────────────────────────────────────────────
function h1(text) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 480, after: 120 },
    run: { bold: true, color: DARK, size: 36 },
  });
}

function h2(text) {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, color: DARK, size: 28 })],
    spacing: { before: 360, after: 100 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: YELLOW } },
  });
}

function h3(text) {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, color: MID, size: 24 })],
    spacing: { before: 240, after: 80 },
  });
}

function label(text) {
  return new Paragraph({
    children: [new TextRun({ text: text.toUpperCase(), bold: true, color: YELLOW, size: 18, characterSpacing: 40 })],
    spacing: { before: 320, after: 60 },
  });
}

function body(text) {
  return new Paragraph({
    children: [new TextRun({ text, color: MID, size: 22 })],
    spacing: { after: 120 },
  });
}

function bullet(text) {
  return new Paragraph({
    children: [new TextRun({ text: `→  ${text}`, color: MID, size: 22 })],
    spacing: { after: 80 },
    indent: { left: 360 },
  });
}

function highlight(text) {
  return new Paragraph({
    children: [new TextRun({ text, color: DARK, size: 22, italics: true })],
    spacing: { before: 160, after: 160 },
    indent: { left: 560, right: 560 },
    shading: { type: ShadingType.SOLID, color: LIGHT_BG },
    border: {
      left: { style: BorderStyle.SINGLE, size: 12, color: YELLOW },
    },
  });
}

function spacer() {
  return new Paragraph({ text: '', spacing: { after: 80 } });
}

function divider() {
  return new Paragraph({
    text: '',
    spacing: { before: 240, after: 240 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: 'E8E4D9' } },
  });
}

function stat(num, lbl) {
  return new Paragraph({
    children: [
      new TextRun({ text: num, bold: true, color: YELLOW, size: 36 }),
      new TextRun({ text: `  ${lbl}`, color: MUTED, size: 22 }),
    ],
    spacing: { after: 80 },
    indent: { left: 360 },
  });
}

// ── Tabla de personas ─────────────────────────────────────────────────────────
function personaTable(rows) {
  const headers = ['Perfil', 'Quién es', 'Motivación principal', 'Funcionalidades clave', 'Dieta típica'];

  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map(h => new TableCell({
      shading: { type: ShadingType.SOLID, color: YELLOW },
      children: [new Paragraph({
        children: [new TextRun({ text: h, bold: true, color: DARK, size: 18 })],
      })],
      margins: { top: 100, bottom: 100, left: 120, right: 120 },
    })),
  });

  const dataRows = rows.map((row, i) => new TableRow({
    children: row.map((cell, ci) => new TableCell({
      shading: i % 2 === 1 ? { type: ShadingType.SOLID, color: LIGHT_BG } : undefined,
      children: [new Paragraph({
        children: [new TextRun({
          text: cell,
          color: ci === 0 ? DARK : MID,
          bold: ci === 0,
          size: 18,
        })],
      })],
      margins: { top: 80, bottom: 80, left: 120, right: 120 },
    })),
  }));

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [headerRow, ...dataRows],
  });
}

// ── Documento ─────────────────────────────────────────────────────────────────
const doc = new Document({
  styles: {
    default: {
      document: {
        run: { font: 'Calibri', color: DARK, size: 22 },
      },
    },
  },
  sections: [{
    children: [
      // ── PORTADA ──
      new Paragraph({
        children: [new TextRun({ text: 'B', bold: true, color: DARK, size: 120 })],
        alignment: AlignmentType.CENTER,
        spacing: { before: 1200, after: 200 },
      }),
      new Paragraph({
        children: [new TextRun({ text: 'BLUMM', bold: true, color: DARK, size: 72, characterSpacing: 80 })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 160 },
      }),
      new Paragraph({
        children: [new TextRun({ text: 'Nutrición y bienestar sincronizados con tu ciclo hormonal', color: MUTED, size: 26, italics: true })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 80 },
      }),
      new Paragraph({
        children: [new TextRun({ text: 'Descripción Comercial de Producto  ·  Julio 2026  ·  Confidencial', color: MUTED, size: 20 })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 80 },
      }),
      new Paragraph({
        children: [new TextRun({ text: 'iOS  ·  React Native / Expo SDK 54  ·  ES · EN · FR · IT', color: MUTED, size: 20 })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 1200 },
      }),
      new Paragraph({ children: [new PageBreak()] }),

      // ── 1. QUÉ ES ──
      label('Concepto de producto'),
      h2('¿Qué es Blumm?'),
      body('Blumm es una aplicación móvil de salud femenina que personaliza la nutrición, el entrenamiento y el bienestar en función de la fase del ciclo menstrual de la usuaria. A diferencia de los apps de fitness genéricos, Blumm parte de una premisa científica: los niveles hormonales de la mujer cambian cada semana, y con ellos cambia su metabolismo, su capacidad de recuperación, su apetito y su energía.'),
      body('La app traduce esta ciencia en recomendaciones diarias accionables: qué comer hoy, qué entrenar hoy, qué suplementar, cómo descansar — todo adaptado a la fase menstrual (menstrual, folicular, ovulación, lútea) y al perfil individual de cada mujer.'),
      highlight('"Blumm no es una app de dieta. Es una herramienta de sincronización hormonal que convierte el ciclo menstrual en una ventaja competitiva para la salud, el rendimiento y el bienestar."'),

      // ── 2. PROBLEMA ──
      label('El problema que resuelve'),
      h2('Por qué las soluciones actuales no funcionan para las mujeres'),
      body('El 73% de las apps de nutrición y fitness están diseñadas con datos mayoritariamente masculinos. Las mujeres experimentan fluctuaciones hormonales cíclicas que afectan directamente a cómo metabolizan los carbohidratos, cómo responden al ejercicio de fuerza, cómo duermen y cómo gestionan el estrés.'),
      spacer(),
      bullet('Apps genéricas no consideran fluctuaciones hormonales'),
      bullet('Planes de dieta estáticos que no cambian con el ciclo'),
      bullet('Rutinas de entrenamiento diseñadas para hombres'),
      bullet('Falta de recetas adaptadas a cada fase menstrual'),
      bullet('Sin soporte para condiciones como PCOS o endometriosis'),
      bullet('Ausencia de orientación sobre suplementación femenina'),
      bullet('Cero personalización para etapas como menopausia o postparto'),
      bullet('No integran anticonceptivos hormonales en la ecuación'),

      divider(),

      // ── 3. FUNCIONALIDADES ──
      label('Producto'),
      h2('Módulos y funcionalidades principales'),
      h3('1. Seguimiento del ciclo'),
      body('Registro de la menstruación, predicción de fases, longitud de ciclo personalizable. Identifica en qué fase está la usuaria cada día y adapta todas las recomendaciones en tiempo real.'),
      h3('2. Nutrición por fase'),
      body('Motor de recetas con más de 440 recetas en 4 idiomas, filtradas por dieta, alergias, fase del ciclo, objetivo y macros. Menú diario personalizado que rota de forma determinista.'),
      h3('3. Entrenamiento adaptado'),
      body('Sesiones de running, fuerza y movilidad adaptadas a la fase hormonal. La intensidad recomendada baja en la fase menstrual y lútea, y sube en la folicular y ovulación.'),
      h3('4. Suelo pélvico'),
      body('Programa de reeducación de suelo pélvico adaptado a la etapa: prenatal, postparto inmediato o recuperación avanzada. Ejercicios hipopresivos, Kegel progresivos y entrenamiento seguro para diástasis y prolapso.'),
      h3('5. Lista de la compra'),
      body('Lista de ingredientes generada automáticamente según la fase del ciclo actual. Ingredientes organizados por categoría con cantidades ajustadas y etiquetas multilingües.'),
      h3('6. Batch Cooking'),
      body('Planificación semanal de cocina por lotes. Diferencia días tipo A, B y libre para organizar la preparación de comidas de forma eficiente y sostenible.'),
      h3('7. Seguimiento del sueño'),
      body('Registro diario de horas y calidad del sueño. Correlaciona los patrones de descanso con la fase hormonal para detectar impactos del ciclo en el sueño.'),
      h3('8. Cálculo de macros'),
      body('Cálculo de TDEE personalizado por edad, peso, altura, nivel de actividad y objetivo. Reglas de macros específicas por grupo de dieta (4 grupos) y por comida del día.'),
      h3('9. Artículos y educación'),
      body('Biblioteca de contenido sobre salud hormonal femenina: PCOS, endometriosis, nutrición antiinflamatoria, suplementación, menopausia, suelo pélvico postparto y rendimiento deportivo.'),

      spacer(),
      label('Métricas del producto'),
      stat('443', 'recetas en base de datos'),
      stat('4', 'idiomas (ES · EN · FR · IT)'),
      stat('4', 'fases del ciclo'),
      stat('11', 'tipos de dieta soportados'),
      stat('6', 'etapas de vida cubiertas'),
      stat('8.168', 'alimentos en base de datos nutricional (USDA FoodData Central)'),

      divider(),

      // ── 4. DIETAS ──
      label('Segmentación nutricional'),
      h2('Tipos de dieta y grupos de macros soportados'),
      h3('Grupo 1 — Dietas equilibradas  (50% HC / 20% PRT / 30% GRS)'),
      body('Estándar, Mediterránea, Vegetariana, Vegana, Pescateriana, Sin gluten, Sin lactosa, FODMAP, DASH, Antiinflamatoria'),
      h3('Grupo 2 — Cetogénica  (5% HC / 20% PRT / 75% GRS)'),
      body('Keto, Ketogénica'),
      h3('Grupo 3 — Baja en carbos  (30% HC / 25% PRT / 45% GRS)'),
      body('Low Carb, Paleo'),
      h3('Grupo 4 — Alta proteína  (40% HC / 30% PRT / 30% GRS)'),
      body('High Protein'),

      divider(),

      // ── 5. ETAPAS ──
      label('Ciclo de vida de la usuaria'),
      h2('Etapas hormonales contempladas'),
      bullet('Edad reproductiva'),
      bullet('Embarazo (con programa prenatal de suelo pélvico)'),
      bullet('Postparto (con reeducación de suelo pélvico y recuperación)'),
      bullet('Perimenopausia'),
      bullet('Menopausia'),
      bullet('Postmenopausia'),
      spacer(),
      body('Anticonceptivos registrados: Píldora · DIU hormonal · DIU de cobre · Anillo · Parche · Implante'),

      divider(),

      // ── 6. CONDICIONES ──
      label('Salud y condiciones específicas'),
      h2('Condiciones de salud contempladas'),
      bullet('PCOS (Síndrome de ovario poliquístico)'),
      bullet('Endometriosis'),
      bullet('Diabetes tipo 2 / resistencia insulínica'),
      bullet('Hipotiroidismo / Hashimoto'),
      bullet('Anemia ferropénica'),
      bullet('Síndrome premenstrual severo (SPM)'),
      bullet('Dismenorrea (dolor menstrual)'),
      bullet('Amenorrea / ciclos irregulares'),
      bullet('Disfunción de suelo pélvico (postparto, prolapso, incontinencia)'),
      bullet('Diástasis abdominal postparto'),

      divider(),

      // ── 7. OBJETIVOS ──
      label('Motivaciones de la usuaria'),
      h2('Objetivos que persigue la usuaria con Blumm'),
      h3('Objetivos de ciclo'),
      body('Entender mi ciclo  ·  Reducir el dolor menstrual  ·  Buscar embarazo'),
      h3('Objetivos nutricionales'),
      body('Comer mejor  ·  Perder peso  ·  Ganar peso  ·  Más energía'),
      h3('Objetivos deportivos'),
      body('Ganar músculo  ·  Tonificar  ·  Competición  ·  Retomar el deporte'),

      divider(),

      // ── 8. DIFERENCIACIÓN ──
      label('Diferenciación competitiva'),
      h2('Por qué Blumm es diferente'),
      h3('Base científica real'),
      body('Las recomendaciones se fundamentan en la variabilidad hormonal del ciclo menstrual, no en pautas genéricas. Adaptadas por nutricionista especializada en salud femenina.'),
      h3('Hiperpersonalización'),
      body('Combina fase del ciclo + dieta + condición de salud + etapa de vida + objetivo + nivel de actividad para generar recomendaciones únicas para cada usuaria cada día.'),
      h3('Suelo pélvico integrado'),
      body('Única app que conecta la reeducación de suelo pélvico (prenatal y postparto) con la nutrición, el ciclo hormonal y el entrenamiento en una sola herramienta.'),
      h3('Multilingüe desde el día 1'),
      body('Español, inglés, francés e italiano completos. Mercado potencial: Europa + Latinoamérica.'),
      h3('Holístico, no fragmentado'),
      body('Nutrición + entrenamiento + sueño + ciclo + suelo pélvico + educación en una sola app.'),

      divider(),

      // ── 9. PERSONAS ──
      label('Insights para buyer personas'),
      h2('Arquetipos de usuaria identificados'),
      body('A partir de las funcionalidades, objetivos y condiciones soportadas, se identifican los siguientes perfiles de usuaria potencial:'),
      spacer(),
      personaTable([
        ['🌱 La consciente de su ciclo', '25–35 años, urbana, interesada en bienestar femenino y «cycle syncing»', 'Entender su cuerpo y vivir en armonía con sus hormonas', 'Seguimiento de ciclo, artículos, ingredientes por fase', 'Estándar / Mediterránea'],
        ['⚡ La deportista', '22–40 años, activa 5+ días/semana, orientada a resultados físicos', 'Optimizar rendimiento y recuperación según la fase hormonal', 'Entrenamiento adaptado, macros por dieta, batch cooking', 'Alta proteína / Low Carb'],
        ['🥑 La foodie saludable', '28–45 años, cocina en casa, busca recetas prácticas y nutritivas', 'Comer bien sin esfuerzo, con variedad y ajustado a sus restricciones', 'Recetas, lista de la compra, batch cooking, filtros de dieta', 'Vegana / Vegetariana / Sin gluten'],
        ['🌸 La que gestiona su condición', '25–45 años con PCOS, endometriosis, SPM severo o dismenorrea', 'Reducir síntomas a través de la alimentación y el estilo de vida', 'Recetas antiinflamatorias, artículos, FODMAP', 'Antiinflamatoria / FODMAP / Sin gluten'],
        ['🔥 La que está en la transición', '42–55 años en perimenopausia o menopausia', 'Gestionar cambios hormonales: peso, sueño, energía, ánimo', 'Etapa de vida, seguimiento del sueño, recetas adaptadas, artículos', 'Mediterránea / DASH / Alta proteína'],
        ['💪 La que busca resultados keto', '25–40 años, pérdida de grasa o control glucémico', 'Seguir la dieta cetogénica con recetas variadas y control de macros', 'Recetas keto, cálculo de macros, filtros de dieta', 'Cetogénica / Low Carb'],
        ['🤰 La embarazada', '25–38 años, primer o segundo embarazo, activa o con historial deportivo', 'Cuidar la nutrición durante el embarazo y preparar el cuerpo para el parto', 'Etapa embarazo, recetas adaptadas, entrenamiento de suelo pélvico prenatal, artículos', 'Estándar / Mediterránea / Sin gluten'],
        ['👶 La mamá en recuperación', '25–40 años, postparto reciente (0–18 meses), con o sin lactancia', 'Recuperar el suelo pélvico, volver al movimiento de forma segura y recuperar energía', 'Reeducación de suelo pélvico postparto, hipopresivos, seguimiento del sueño, recetas para lactancia', 'Estándar / Alta proteína'],
      ]),

      divider(),

      // ── 10. MERCADO ──
      label('Mercado y posicionamiento'),
      h2('A quién se dirige Blumm'),
      h3('España y Latinoamérica'),
      body('Mercado principal. Español como idioma nativo. Recetas y cultura gastronómica mediterránea y latinoamericana.'),
      h3('Mercado anglosajón (UK, EE.UU., Australia)'),
      body('Inglés completo. El segmento «cycle syncing» está en pleno auge en estos mercados.'),
      h3('Francia e Italia'),
      body('Francés e italiano nativos. Mercados con alta sensibilidad hacia productos de bienestar femenino holístico.'),
      spacer(),
      highlight('Mercado global de apps de salud femenina: $4.500M en 2024, con crecimiento estimado del 18% anual hasta 2030. El nicho de «cycle syncing» y nutrición hormonal está emergiendo con fuerte tracción en redes sociales (TikTok, Instagram).'),

      spacer(),
      spacer(),
      new Paragraph({
        children: [new TextRun({ text: '© 2026 Blumm  ·  Documento interno de producto  ·  Confidencial', color: MUTED, size: 18, italics: true })],
        alignment: AlignmentType.CENTER,
      }),
    ],
  }],
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync(OUT, buf);
  const kb = (buf.length / 1024).toFixed(0);
  console.log(`✅ Generado: ${OUT} (${kb} KB)`);
});
