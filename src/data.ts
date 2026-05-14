import { Course } from './types';

export const courses: Course[] = [
  {
    id: "agentes-ia-2025",
    title: "Golive AI Academy: Especialista en Agentes de IA",
    description: "Domina la construcción de sistemas autónomos con Claude, AG2, Gemini y más.",
    instructor: "Golive Team",
    category: "Inteligencia Artificial",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800",
    sessions: [
      {
        id: 1,
        title: "Claude + Managed Agents I",
        date: "Viernes 15 mayo",
        objectives: [
          "Entender la arquitectura básica de un agente de IA",
          "Configurar el entorno de desarrollo con Claude",
          "Crear el primer 'Managed Agent' básico",
          "Aprender a depurar respuestas del agente"
        ],
        script: [
          {
            id: "s1-1",
            title: "Introducción y Conceptos Clave",
            duration: "30 min",
            description: "Repaso de qué es un agente vs un simple chatbot. Arquitectura de razonamiento (Loop de pensamiento).",
            resources: [
              { title: "Arquitectura de Agentes (PDF)", url: "#" }
            ]
          },
          {
            id: "s1-2",
            title: "Setup de Managed Agents",
            duration: "45 min",
            description: "Configuración de API Keys, herramientas básicas y estructura de carpetas sugerida."
          },
          {
            id: "s1-3",
            title: "Demo en vivo: Mi primer agente",
            duration: "45 min",
            description: "Implementación paso a paso de un agente que consulta una base de conocimientos local."
          }
        ],
        exercises: [
          {
            id: "ex1-1",
            title: "El Agente Investigador",
            description: "Crea un script que permita al agente buscar información en 3 archivos PDF locales y sintetizar una respuesta."
          }
        ],
        takeaways: [
          "Diferencia entre RAG y agentes autónomos",
          "Script básico de orquestación en Claude",
          "Mejores prácticas de Prompt Engineering para agentes"
        ]
      },
      {
        id: 2,
        title: "Claude Managed Agents e inicio AG2",
        date: "Martes 19 mayo",
        objectives: [],
        script: [],
        exercises: [],
        takeaways: []
      },
      {
        id: 3,
        title: "AG2 Framework",
        date: "Viernes 22 mayo",
        objectives: [],
        script: [],
        exercises: [],
        takeaways: []
      },
      {
        id: 4,
        title: "ChatGPT Workspace Agents",
        date: "Martes 26 mayo",
        objectives: [],
        script: [],
        exercises: [],
        takeaways: []
      },
      {
        id: 5,
        title: "Google Gemini Enterprise Agents",
        date: "Viernes 5 junio",
        objectives: [],
        script: [],
        exercises: [],
        takeaways: []
      },
      {
        id: 6,
        title: "Claude Design",
        date: "Martes 9 junio",
        objectives: [],
        script: [],
        exercises: [],
        takeaways: []
      },
      {
        id: 7,
        title: "Cowork, OpenClaw y conexión con apps",
        date: "Viernes 12 junio",
        objectives: [],
        script: [],
        exercises: [],
        takeaways: []
      },
      {
        id: 8,
        title: "Comparativa, costes y cierre",
        date: "Martes 16 junio",
        objectives: [],
        script: [],
        exercises: [],
        takeaways: []
      }
    ]
  },
  {
    id: "prompt-engineering-avanzado",
    title: "Mastering Prompt Engineering",
    description: "Técnicas avanzadas de prompting para modelos de lenguaje de gran escala.",
    instructor: "Golive Team",
    category: "Productividad",
    image: "https://images.unsplash.com/photo-1620712943543-bcc4628c9759?auto=format&fit=crop&q=80&w=800",
    sessions: [
      {
        id: 1,
        title: "Fundamentos y Zero-shot",
        date: "Lunes 1 de Junio",
        objectives: ["Bases del prompting"],
        script: [],
        exercises: [],
        takeaways: []
      }
    ]
  }
];
