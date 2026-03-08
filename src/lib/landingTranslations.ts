export type LandingLanguage = 'en' | 'es';

export const homeCopy = {
  en: {
    title: 'Operational intelligence for serum and reagent workflows',
    subtitle: 'Run sample traceability and inventory control from one secure laboratory platform.',
    description:
      'Serum Box gives clinical and research teams the rigor they need to manage samples, control stock, and make faster decisions with confidence.',
    startTrial: 'Enter Platform',
  },
  es: {
    title: 'Inteligencia operativa para flujos de suero y reactivos',
    subtitle: 'Gestiona trazabilidad de muestras y control de inventario en una sola plataforma segura.',
    description:
      'Serum Box brinda a equipos clinicos y de investigacion el rigor necesario para gestionar muestras, controlar stock y tomar decisiones mas rapidas con confianza.',
    startTrial: 'Entrar a la Plataforma',
  },
} as const;

export const featureCopy = {
  en: {
    title1: 'Serum Sample Traceability',
    description1:
      'Track every sample through a structured chain of custody built for clinical and research environments.',
    title2: 'Configurable Rack Architecture',
    description2:
      'Design rack layouts that match your real storage logic, from custom coordinates to flexible capacities.',
    title3: 'Complete Sample Context',
    description3:
      'Capture patient metadata, protocol details, and time-critical sample information in one controlled record.',
    title4: 'Precision Search',
    description4: 'Find exact samples in seconds with filters designed for high-volume laboratory operations.',
    title5: 'Inventory Command Center',
    description5: 'Manage reagent stock with lot-level visibility, expiration alerts, and usage history.',
    title6: 'Operational Analytics',
    description6: 'Convert disposal and consumption data into clear trends for planning and optimization.',
    discover: 'Explore Serum Box Capabilities',
    intro: 'A platform engineered for labs that require compliance, speed, and complete operational visibility.',
  },
  es: {
    title1: 'Trazabilidad de Muestras de Suero',
    description1:
      'Sigue cada muestra con una cadena de custodia estructurada para entornos clinicos y de investigacion.',
    title2: 'Arquitectura de Gradillas Configurable',
    description2:
      'Disena gradillas alineadas con tu logica real de almacenamiento, con coordenadas y capacidades flexibles.',
    title3: 'Contexto Completo de la Muestra',
    description3:
      'Centraliza metadatos del paciente, detalles de protocolo e informacion critica de tiempo en un solo registro.',
    title4: 'Busqueda de Precision',
    description4:
      'Encuentra muestras exactas en segundos con filtros pensados para operaciones de alto volumen.',
    title5: 'Centro de Control de Inventario',
    description5: 'Gestiona reactivos con visibilidad por lote, alertas de vencimiento e historial de uso.',
    title6: 'Analitica Operativa',
    description6: 'Convierte datos de consumo y descarte en tendencias claras para planificar y optimizar.',
    discover: 'Explora las Capacidades de Serum Box',
    intro: 'Una plataforma disenada para laboratorios que exigen cumplimiento, velocidad y visibilidad operativa total.',
  },
} as const;

export const testimonialsCopy = {
  en: {
    title: 'What our users say',
    testimonials: [
      {
        name: 'Dr. Maria Garcia',
        role: 'Immunology Researcher',
        content:
          'Serum Box has transformed how we manage our serum samples. The ability to customize racks and record detailed information is invaluable for our laboratory.',
      },
      {
        name: 'Prof. John Smith',
        role: 'Clinical Laboratory Director',
        content:
          'The ease of use and power of Serum Box have significantly improved our efficiency. We can now track and manage thousands of samples effortlessly.',
      },
      {
        name: 'Dr. Laura Martinez',
        role: 'Clinical Studies Coordinator',
        content:
          'Serum Box has been crucial in organizing our multicenter studies. The ability to access sample information quickly and accurately has accelerated our research processes.',
      },
    ],
  },
  es: {
    title: 'Lo que dicen nuestros usuarios',
    testimonials: [
      {
        name: 'Dra. Maria Garcia',
        role: 'Investigadora en Inmunologia',
        content:
          'Serum Box ha transformado la forma en que gestionamos nuestras muestras de suero. La capacidad de personalizar gradillas y registrar informacion detallada es invaluable para nuestro laboratorio.',
      },
      {
        name: 'Prof. John Smith',
        role: 'Director de Laboratorio Clinico',
        content:
          'La facilidad de uso y la potencia de Serum Box han mejorado significativamente nuestra eficiencia. Ahora podemos rastrear y gestionar miles de muestras sin esfuerzo.',
      },
      {
        name: 'Dra. Laura Martinez',
        role: 'Coordinadora de Estudios Clinicos',
        content:
          'Serum Box ha sido fundamental en la organizacion de nuestros estudios multicentricos. La capacidad de acceder a la informacion de las muestras de forma rapida y precisa ha acelerado nuestros procesos de investigacion.',
      },
    ],
  },
} as const;

export const faqCopy = {
  en: {
    title: 'Frequently Asked Questions',
    questions: [
      {
        q: 'What is Serum Box and how does it work?',
        a: 'Serum Box is a comprehensive laboratory management platform that combines serum sample management with reagent inventory control. It offers three main functionalities: Grid Manager for organizing and tracking serum samples in customizable grids, Stock Manager for efficient reagent inventory control with lot numbers and expiration dates tracking, and Stock Analytics for detailed analysis of reagent usage patterns and optimization of inventory management.',
      },
      {
        q: 'Can I customize racks according to my needs?',
        a: 'Yes. Serum Box allows fully customizable racks with flexible coordinates and layouts adapted to your workflow.',
      },
      {
        q: 'What information can I store for each sample?',
        a: 'You can store patient identifiers, birth date, sample date, protocol number, and additional research fields required by your team.',
      },
      {
        q: 'Is it safe to store sensitive information in Serum Box?',
        a: 'Yes. Serum Box prioritizes security with encryption and operational safeguards to protect sensitive patient and sample information.',
      },
      {
        q: 'Can I track reagent expiration dates?',
        a: 'Yes. Stock Manager tracks lot numbers, expiration dates, and usage history for each reagent entry.',
      },
    ],
  },
  es: {
    title: 'Preguntas frecuentes',
    questions: [
      {
        q: 'Que es Serum Box y como funciona?',
        a: 'Serum Box es una plataforma integral de gestion de laboratorio que combina la gestion de muestras de suero con el control de inventario de reactivos. Ofrece tres funcionalidades principales: Grid Manager para organizar y rastrear muestras en gradillas personalizables, Stock Manager para el control eficiente del inventario con seguimiento de lotes y vencimientos, y Stock Analytics para analizar patrones de uso y optimizar operaciones.',
      },
      {
        q: 'Puedo personalizar las gradillas segun mis necesidades?',
        a: 'Si. Serum Box permite configurar gradillas totalmente personalizadas con coordenadas y estructuras adaptadas a tu flujo de trabajo.',
      },
      {
        q: 'Que informacion puedo guardar para cada muestra?',
        a: 'Puedes registrar identificadores del paciente, fecha de nacimiento, fecha de muestra, numero de protocolo y campos adicionales relevantes para tu investigacion.',
      },
      {
        q: 'Es seguro almacenar informacion sensible en Serum Box?',
        a: 'Si. Serum Box prioriza la seguridad con cifrado y controles operativos para proteger informacion sensible de pacientes y muestras.',
      },
      {
        q: 'Puedo realizar seguimiento de vencimiento de reactivos?',
        a: 'Si. Stock Manager permite seguir lotes, fechas de vencimiento e historial de uso por cada ingreso de reactivos.',
      },
    ],
  },
} as const;
