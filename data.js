// ================================================================
// data.js — Market-Control: The Industrial Simulator
// Contenido extraído del PPTX: "El rol del gobierno en la regulación del mercado"
// Autores: Carolina Arrieta, Mateo Jiménez, Santiago Ávila, Luis Vergara
// ================================================================

const GAME_DATA = {

  meta: {
    title:    "Market-Control",
    subtitle: "The Industrial Simulator",
    course:   "Ingeniería Industrial · Regulación de Mercados",
    team: [
      { name: "Carolina Arrieta", role: "Supervisora de Mercado",  emoji: "📊" },
      { name: "Mateo Jiménez",    role: "Analista de Regulación",  emoji: "⚙️" },
      { name: "Santiago Ávila",   role: "Inspector de Incentivos", emoji: "🔌" },
      { name: "Luis Vergara",     role: "Jefe de Bienestar Social",emoji: "🏛️" },
    ],
    objective: "Aprende que el gobierno es el regulador necesario para evitar el caos, los abusos y la desigualdad en el mercado.",
  },

  // ── Conceptos teóricos (slide 3, 4, 5, 6, 7, 8) ──────────────
  concepts: {
    mercado: {
      title: "El Mercado",
      body: "Espacio donde se realizan intercambios de bienes y servicios entre productores y consumidores. En él se determinan precios, oferta y demanda.",
      icon: "🏪",
    },
    gobierno: {
      title: "El Gobierno",
      body: "Entidad encargada de organizar, regular y controlar el funcionamiento de la economía de un país.",
      icon: "🏛️",
    },
    regulacion: {
      title: "La Regulación",
      body: "Conjunto de normas y acciones que establece el gobierno para controlar el funcionamiento del mercado. Busca un mercado más justo, equilibrado y seguro.",
      icon: "📋",
    },
    equilibrio: {
      title: "Importancia del Equilibrio",
      body: "Sin control: abusos, monopolios, desigualdad. Con exceso de control: limita la iniciativa empresarial. El equilibrio entre libertad económica e intervención es clave.",
      icon: "⚖️",
    },
  },

  // ── Nivel 1: Flujos de Bienestar ──────────────────────────────
  level1: {
    id: 1,
    name: "Flujos de Bienestar",
    mechanic: "fluid",
    theory: "En el mercado interactúan productores y consumidores de forma libre. Sin embargo, pueden presentarse situaciones como venta de productos innecesarios, prioridad a quienes tienen mayor capacidad de pago y desigualdades económicas.",
    objective: "Ajusta las válvulas de Impuestos y Regulación para dirigir el flujo hacia la Sociedad. Evita que se desvíe a Monopolio o Abuso.",
    tanks: [
      { id: "society",  label: "Sociedad",  color: "#00d4aa", icon: "👥", target: true,  maxFill: 100 },
      { id: "monopoly", label: "Monopolio", color: "#ff6b6b", icon: "🏭", target: false, maxFill: 100 },
      { id: "abuse",    label: "Abuso",     color: "#ff4444", icon: "⚠️", target: false, maxFill: 100 },
    ],
    valves: [
      { id: "tax",        label: "Impuestos",   icon: "💰", description: "Redistribuye riqueza hacia la Sociedad", flowEffect: { society: +0.4, monopoly: -0.3 } },
      { id: "regulation", label: "Regulación",  icon: "📋", description: "Reduce los abusos del mercado",         flowEffect: { abuse: -0.5, society: +0.2 } },
      { id: "subsidy",    label: "Subsidios",   icon: "🤝", description: "Apoya a quienes menos tienen",          flowEffect: { society: +0.6, abuse: -0.1 } },
    ],
    events: [
      { trigger: 15, type: "crisis",  label: "¡Crisis de Monopolio!", message: "Una empresa domina el mercado. Activa Regulación.", effect: { monopoly: +20 } },
      { trigger: 35, type: "warning", label: "Abusos detectados",     message: "Productores suben precios abusivamente. Ajusta Impuestos.", effect: { abuse: +15 } },
      { trigger: 55, type: "bonus",   label: "¡Mercado Activo!",      message: "Alta demanda. Activa Subsidios para proteger a los más vulnerables.", effect: { society: -10 } },
    ],
    winCondition: { societyMin: 75, monopolyMax: 20, abuseMax: 15 },
    maxTime: 90,
    maxScore: 1000,
  },

  // ── Nivel 2: Logística de Control ────────────────────────────
  level2: {
    id: 2,
    name: "Logística de Control",
    mechanic: "sorting",
    theory: "El gobierno establece normas y leyes para controlar la producción, distribución y venta de bienes y servicios. Puede prohibir productos dañinos, limitar su comercialización, supervisar que se cumplan las leyes y sancionar a quienes no respeten las normas.",
    objective: "Clasifica las cajas en la cinta transportadora. Manda los productos dañinos a Sanciones y los bienes necesarios a Consumo Seguro.",
    zones: [
      { id: "safe",     label: "Consumo Seguro", color: "#00d4aa", icon: "✅", correctTypes: ["necesario", "saludable", "educativo"] },
      { id: "sanction", label: "Sanciones",      color: "#ff6b6b", icon: "🚫", correctTypes: ["dañino", "engañoso", "monopolio"]  },
    ],
    boxes: [
      { id: "b01", type: "necesario",  label: "Alimentos básicos",        icon: "🥦", color: "#a8e6cf", zone: "safe",     points: 100, description: "Bien esencial que garantiza el bienestar poblacional." },
      { id: "b02", type: "dañino",     label: "Tabaco sin advertencia",   icon: "🚬", color: "#ff6b6b", zone: "sanction", points: 100, description: "Producto que afecta la salud pública. Requiere sanción y advertencias." },
      { id: "b03", type: "engañoso",   label: "Publicidad falsa",         icon: "📢", color: "#ffd93d", zone: "sanction", points: 100, description: "Influencia indebida en el consumo. El gobierno debe proteger al consumidor." },
      { id: "b04", type: "saludable",  label: "Medicamentos genéricos",   icon: "💊", color: "#a8e6cf", zone: "safe",     points: 100, description: "Acceso a salud para toda la población sin importar capacidad de pago." },
      { id: "b05", type: "monopolio",  label: "Precio abusivo",           icon: "💸", color: "#ff6b6b", zone: "sanction", points: 100, description: "Empresa que fija precios sin competencia. Debe ser regulada." },
      { id: "b06", type: "educativo",  label: "Tecnología educativa",     icon: "💻", color: "#a8e6cf", zone: "safe",     points: 100, description: "Bien que impulsa el desarrollo y el crecimiento económico." },
      { id: "b07", type: "dañino",     label: "Bebida sin regulación",    icon: "🥃", color: "#ff6b6b", zone: "sanction", points: 100, description: "Producto que puede causar daño sin normas de control." },
      { id: "b08", type: "necesario",  label: "Transporte público",       icon: "🚌", color: "#a8e6cf", zone: "safe",     points: 100, description: "Servicio esencial que garantiza movilidad equitativa." },
      { id: "b09", type: "engañoso",   label: "Crédito predatorio",       icon: "🏦", color: "#ffd93d", zone: "sanction", points: 100, description: "Instrumento financiero que abusa de quienes tienen menos recursos." },
      { id: "b10", type: "educativo",  label: "Energías renovables",      icon: "☀️", color: "#a8e6cf", zone: "safe",     points: 100, description: "Sector apoyado por incentivos gubernamentales para el crecimiento." },
      { id: "b11", type: "dañino",     label: "Residuos sin tratar",      icon: "☣️", color: "#ff6b6b", zone: "sanction", points: 100, description: "Daño ambiental. El gobierno cuida el medio ambiente." },
      { id: "b12", type: "saludable",  label: "Agua potable",             icon: "💧", color: "#a8e6cf", zone: "safe",     points: 100, description: "Bien fundamental que el Estado debe garantizar para todos." },
    ],
    penaltyPerError: 50,
    maxTime: 80,
    maxScore: 1200,
  },

  // ── Nivel 3: Circuito de Incentivos ──────────────────────────
  level3: {
    id: 3,
    name: "Circuito de Incentivos",
    mechanic: "circuit",
    theory: "El gobierno ofrece incentivos y ayudas económicas para promover actividades que beneficien a la sociedad y al desarrollo del país. Estos apoyos buscan fortalecer sectores importantes: fomentar la producción de bienes necesarios, apoyar a personas con menos recursos e impulsar el crecimiento económico.",
    objective: "Conecta el nodo Gobierno con los sectores correctos mediante Incentivos para encender los bombillos de Crecimiento.",
    nodes: [
      { id: "gov",     label: "Gobierno",      icon: "🏛️", color: "#667eea", x: 50,  y: 50,  type: "source"  },
      { id: "health",  label: "Salud Pública", icon: "🏥", color: "#00d4aa", x: 20,  y: 20,  type: "sector", reward: "💡 Población sana = mayor productividad" },
      { id: "edu",     label: "Educación",     icon: "🎓", color: "#00d4aa", x: 80,  y: 20,  type: "sector", reward: "💡 Educación = innovación y desarrollo" },
      { id: "agro",    label: "Agricultura",   icon: "🌾", color: "#00d4aa", x: 15,  y: 70,  type: "sector", reward: "💡 Seguridad alimentaria garantizada" },
      { id: "energy",  label: "Energía Limpia",icon: "☀️", color: "#00d4aa", x: 85,  y: 70,  type: "sector", reward: "💡 Crecimiento sostenible a largo plazo" },
      { id: "tech",    label: "Tecnología",    icon: "⚙️", color: "#00d4aa", x: 50,  y: 85,  type: "sector", reward: "💡 Competitividad internacional" },
      { id: "mono",    label: "Monopolio",     icon: "🏭", color: "#ff6b6b", x: 50,  y: 15,  type: "trap",   penalty: "⚠️ Incentivar monopolios genera desigualdad" },
      { id: "specul",  label: "Especulación",  icon: "📈", color: "#ff6b6b", x: 35,  y: 45,  type: "trap",   penalty: "⚠️ La especulación desestabiliza el mercado" },
    ],
    incentives: [
      { id: "subsidy",  label: "Subsidio Directo",   icon: "💰", color: "#ffd93d", connectsTo: ["health","agro"], description: "Apoyo económico directo a sectores vulnerables" },
      { id: "taxbreak", label: "Exención Fiscal",     icon: "📋", color: "#a29bfe", connectsTo: ["edu","tech"],    description: "Reducción de impuestos para fomentar la inversión" },
      { id: "grant",    label: "Subvención I+D",      icon: "🔬", color: "#fd79a8", connectsTo: ["energy","tech"], description: "Financiamiento para investigación y desarrollo" },
    ],
    correctConnections: [
      { from: "gov", incentive: "subsidy",  to: "health" },
      { from: "gov", incentive: "subsidy",  to: "agro"   },
      { from: "gov", incentive: "taxbreak", to: "edu"    },
      { from: "gov", incentive: "taxbreak", to: "tech"   },
      { from: "gov", incentive: "grant",    to: "energy" },
      { from: "gov", incentive: "grant",    to: "tech"   },
    ],
    maxTime: 100,
    maxScore: 1500,
  },

  // ── Preguntas finales de comprensión ─────────────────────────
  finalQuiz: [
    {
      q: "¿Qué es el mercado según el contenido de la presentación?",
      opts: [
        "Un lugar físico donde solo se venden alimentos",
        "El espacio donde se realizan intercambios de bienes y servicios, determinando precios, oferta y demanda",
        "Una entidad controlada exclusivamente por el gobierno",
        "Un sistema que solo beneficia a los productores",
      ],
      correct: 1,
      explanation: "El mercado es el espacio de intercambio libre donde se determinan precios mediante la oferta y la demanda.",
    },
    {
      q: "¿Por qué interviene el gobierno en el mercado?",
      opts: [
        "Para controlar todos los precios y eliminar la competencia",
        "Porque los productores siempre actúan de buena fe",
        "Para garantizar el bienestar social, corregir desigualdades y proteger a los consumidores",
        "Solo para recaudar impuestos",
      ],
      correct: 2,
      explanation: "El gobierno interviene para corregir fallas del mercado: desigualdades, abusos y productos que no benefician a la población.",
    },
    {
      q: "¿Qué puede ocurrir si hay exceso de regulación?",
      opts: [
        "El mercado funciona perfectamente",
        "Se puede limitar la iniciativa empresarial, reducir la inversión y frenar el crecimiento",
        "Desaparecen todos los monopolios automáticamente",
        "Los precios siempre bajan",
      ],
      correct: 1,
      explanation: "El equilibrio es clave: demasiada regulación puede frenar el crecimiento económico.",
    },
    {
      q: "¿Para qué sirven los incentivos económicos del gobierno?",
      opts: [
        "Solo para apoyar a las empresas más grandes",
        "Para eliminar la oferta y demanda",
        "Para fomentar la producción de bienes necesarios, apoyar a personas con menos recursos e impulsar el crecimiento",
        "Para crear monopolios estatales",
      ],
      correct: 2,
      explanation: "Los incentivos fortalecen sectores importantes y garantizan el acceso a bienes y servicios para toda la población.",
    },
    {
      q: "¿Cuál es la conclusión principal sobre el papel del gobierno?",
      opts: [
        "El gobierno debe controlar absolutamente todo el mercado",
        "El gobierno no debe intervenir nunca en el mercado",
        "Debe existir un equilibrio entre libertad económica e intervención del Estado para evitar abusos y limitaciones excesivas",
        "Los mercados libres siempre generan bienestar para todos",
      ],
      correct: 2,
      explanation: "El equilibrio entre libertad económica y regulación es fundamental para un mercado justo, seguro y equitativo.",
    },
  ],

  // ── Configuración de puntuación y rangos ─────────────────────
  scoring: {
    ranks: [
      { min: 3200, label: "Regulador Supremo",  icon: "🏆", color: "#ffd700", msg: "Dominas el arte del equilibrio mercado-regulación." },
      { min: 2400, label: "Inspector Experto",  icon: "🥇", color: "#00d4aa", msg: "Excelente comprensión de los mecanismos de control." },
      { min: 1600, label: "Analista Junior",    icon: "🥈", color: "#a29bfe", msg: "Buen progreso. El mercado necesita más ajuste." },
      { min: 800,  label: "Aprendiz Industrial",icon: "🥉", color: "#fd79a8", msg: "El caos del mercado te superó. ¡Inténtalo de nuevo!" },
      { min: 0,    label: "Caos Total",          icon: "💥", color: "#ff6b6b", msg: "Sin regulación el mercado colapsó. ¡Estudia más!" },
    ],
  },

};
