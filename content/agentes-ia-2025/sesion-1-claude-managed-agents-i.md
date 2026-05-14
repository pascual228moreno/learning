---
id: 1
title: Claude + Managed Agents I
date: Viernes 15 mayo · 10:00–12:00
objectives:
  - Conocer la consola de Anthropic y diferenciar Workbench, Models, Agents, Usage y API Keys
  - Conectar Exa y Zapier como fuentes de herramientas para los agentes
  - Crear un almacén de memoria persistente para el pipeline
  - Crear los agentes Researcher, Archivist y Coordinator
  - Probar el sistema en solitario y como pipeline coordinado
---

## Modulo 1 — Introduccion a la consola de Anthropic

**Descripcion breve:** Conoce la diferencia entre claude.ai y la consola de Anthropic, y orientate por sus secciones principales.

### Contexto

Claude.ai es el producto de consumo que ya conoces. La consola de Anthropic es algo completamente distinto: es la plataforma donde se construyen y gestionan los agentes, se accede a la API y se controla el consumo. A partir de hoy vas a trabajar desde aqui.

### Pasos

1. Abre [console.anthropic.com](https://console.anthropic.com) en tu navegador
2. Explora cada seccion del menu principal:
   - **Workbench** — aqui puedes probar la API directamente, sin interfaz de chat
   - **Models** — lista de modelos disponibles (Sonnet, Opus, Haiku) con sus diferencias de coste y capacidad
   - **Agents** — donde viven los Managed Agents, aqui es donde vamos a trabajar
   - **Usage** — consumo y coste en tiempo real de tu cuenta
   - **API Keys** — claves de acceso a la API
   - **Settings** — configuracion general
3. Navega por cada seccion sin modificar nada todavia. Solo observa que hay en cada una.

### Resultado esperado

Tienes una vision general de la consola y sabes donde esta cada seccion. Entiendes que la consola y claude.ai son dos entornos distintos con propositos distintos.

---

## Modulo 2 — Configurar el almacen de credenciales

**Descripcion breve:** Conecta Exa y Zapier como fuentes de herramientas disponibles para tus agentes.

### Contexto

Antes de crear ningun agente, hay que configurar las conexiones externas. Los agentes no pueden usar herramientas que no esten disponibles en la cuenta. La consola de Anthropic tiene una seccion donde se guardan estas credenciales y conexiones, que luego podras asignar a cada agente durante su creacion.

### Pasos

**Conectar Exa**

Exa es un motor de busqueda disenado especificamente para agentes de IA. A diferencia de Google, entiende el significado de la consulta, no solo las palabras clave. Es especialmente potente para research cientifico y tecnico.

1. Ve a la seccion de credenciales o conexiones de la consola
2. Anade una nueva conexion con estos datos:
   ```
   Name: exa
   Type: url
   URL:  https://mcp.exa.ai/mcp
   ```
3. Guarda y verifica que aparece como activa

**Conectar Zapier**

Zapier actua como hub centralizado de credenciales. En lugar de conectar Notion, Gmail y otras apps directamente a cada agente, las conectas una vez en Zapier y los agentes acceden a todo desde un unico punto.

1. Anade una nueva conexion con estos datos:
   ```
   Name: zapier
   Type: url
   URL:  https://mcp.zapier.com/api/v1/connect
   ```
2. Sigue el flujo de autenticacion que Zapier solicita
3. Autoriza el acceso y vuelve a la consola
4. Verifica que aparece como activa

### Resultado esperado

Exa y Zapier aparecen como conexiones disponibles en tu consola. Los agentes que crees podran usar estas herramientas.

---

## Modulo 3 — Configurar Notion en Zapier

**Descripcion breve:** Activa todas las acciones de Notion disponibles en Zapier para que tus agentes puedan publicar y gestionar paginas.

### Contexto

Zapier te permite controlar que apps y acciones expone a los agentes. Hoy solo necesitamos Notion. Gmail la dejaremos para mas adelante cuando la incorporemos al pipeline.

### Pasos

1. Entra en tu cuenta de Zapier
2. Ve a la seccion de configuracion MCP o de herramientas disponibles
3. Busca **Notion** y activa todas las acciones disponibles
4. Guarda la configuracion

### Resultado esperado

Tus agentes pueden usar todas las acciones de Notion disponibles en Zapier: crear paginas, anadir contenido, buscar, etc.

---

## Modulo 4 — Crear el almacen de memoria

**Descripcion breve:** Crea el espacio donde los agentes guardaran informacion de forma persistente entre sesiones.

### Contexto

Sin memoria persistente, cada vez que lances el pipeline los agentes empezarian desde cero. El espacio de memoria es una base de conocimiento que el Archivist va a ir llenando con los resultados del Researcher. La proxima vez que busques sobre perovskita, el sistema ya sabe lo que encontro antes.

### Pasos

1. Dentro de la seccion de Agents en la consola, busca la opcion para crear un almacen de memoria o knowledge store
2. Crea uno nuevo con estos datos:
   ```
   Nombre:      perovskita-research
   Descripcion: Almacen de conocimiento sobre integracion de perovskita en ceramica
   ```
3. Guarda y espera a que se cree
4. Anota el ID del almacen — lo necesitaras al configurar el Archivist

### Resultado esperado

Tienes un almacen de memoria creado y su ID anotado. Este es el espacio donde el Archivist guardara todo el conocimiento que vaya acumulando el pipeline.

---

## Modulo 5 — Crear el agente Researcher

**Descripcion breve:** Crea el agente que busca informacion, sintetiza resultados y publica en Notion.

### Contexto

El Researcher es el agente que hace el trabajo de campo. Recibe una pregunta, busca informacion con Exa, genera un informe estructurado y lo publica en Notion via Zapier. Es el agente mas complejo del sistema porque tiene acceso a herramientas externas.

### Pasos

1. Ve a la seccion de Agents y crea un nuevo agente
2. Rellena los campos basicos:
   ```
   Name:        Perovskite Researcher
   Model:       claude-sonnet-4-6
   Speed:       standard
   Description: Investigador tecnico para integracion de celdas solares en ceramica
   ```
3. En el campo de instrucciones del sistema, pega el siguiente texto:

```
Eres un agente investigador especializado en materiales fotovoltaicos y ceramica.
Tu mision es investigar la viabilidad de integrar celdas de perovskita en sustratos ceramicos.

Cuando recibas una tarea:
1. Busca informacion tecnica, comercial y de mercado usando las herramientas disponibles.
2. Prioriza fuentes academicas y tecnicas sobre blogs o redes sociales.
3. Genera un informe estructurado con:
   - Resumen ejecutivo
   - Estado del arte tecnico
   - Players comerciales relevantes
   - Estimacion de costes
   - Riesgos principales
4. Publica el informe en Notion usando Zapier.
5. Si encuentras errores durante la ejecucion, reportalos al final de tu respuesta.
```

4. Cuando la consola te pregunte que herramientas necesita el agente, selecciona:
   - Conexion a **exa**
   - Conexion a **zapier**
   - Activa el agent toolset (necesario para que pueda ser coordinado)
5. Guarda el agente
6. Anota el ID del agente Researcher

### YAML de referencia — version base

Este es el YAML que representa el agente que acabas de crear:

```yaml
name: Perovskite Researcher
model:
  id: claude-sonnet-4-6
  speed: standard
description: Investigador tecnico para integracion de celdas solares en ceramica
system: |-
  Eres un agente investigador especializado en materiales fotovoltaicos y ceramica.
  Tu mision es investigar la viabilidad de integrar celdas de perovskita en sustratos ceramicos.

  Cuando recibas una tarea:
  1. Busca informacion tecnica, comercial y de mercado usando las herramientas disponibles.
  2. Prioriza fuentes academicas y tecnicas sobre blogs o redes sociales.
  3. Genera un informe estructurado con:
     - Resumen ejecutivo
     - Estado del arte tecnico
     - Players comerciales relevantes
     - Estimacion de costes
     - Riesgos principales
  4. Publica el informe en Notion usando Zapier.
  5. Si encuentras errores durante la ejecucion, reportalos al final de tu respuesta.
mcp_servers:
  - name: exa
    type: url
    url: https://mcp.exa.ai/mcp
  - name: zapier
    type: url
    url: https://mcp.zapier.com/api/v1/connect
tools:
  - configs: []
    default_config:
      enabled: true
      permission_policy:
        type: always_allow
    type: agent_toolset_20260401
  - configs: []
    default_config:
      enabled: true
      permission_policy:
        type: always_allow
    mcp_server_name: exa
    type: mcp_toolset
  - configs: []
    default_config:
      enabled: true
      permission_policy:
        type: always_allow
    mcp_server_name: zapier
    type: mcp_toolset
skills: []
metadata:
  template: deep-research
```

### YAML de referencia — version definitiva

Esta es la version evolucionada del mismo agente, con instrucciones operativas especificas que evitan los errores mas comunes con Zapier y Notion. Usala como referencia para entender hacia donde puede llegar el refinamiento de un agente:

```yaml
name: Euroarce Perovskita Researcher
model:
  id: claude-sonnet-4-6
  speed: standard
description: Investigador tecnico para integracion de celdas solares en ceramica.
system: |-
  Eres el Agente Coordinador de I+D para Samca Euroarce. Tu mision es evaluar la viabilidad de integrar celdas de perovskita en sustratos ceramicos.

  Sigue este flujo estricto:

  1. Descompón el tema en:
     - Estado del arte tecnico: eficiencia real de celdas de perovskita sobre ceramica, estabilidad termica y quimica documentada en literatura cientifica.
     - Analisis de patentes activas: titulares, fechas de expiracion, libertad de operacion.
     - Players comerciales: empresas que ya fabrican o estan cerca de comercializar perovskita-ceramica.
     - Estimacion de costes de materiales: precursores de perovskita, sustratos ceramicos, procesos de deposicion.

  2. Filtro de fuentes: Prioriza Google Scholar, repositorios de patentes (Espacenet, USPTO, Google Patents) y publicaciones de ingenieria (IEEE, ACS, Nature Energy). Ignora blogs comerciales, redes sociales y fuentes sin revision por pares.

  3. Ejecuta busquedas especificas y paralelas usando las herramientas disponibles (Exa para busqueda semantica avanzada, web_search y web_fetch para fuentes directas). Extrae datos concretos: porcentajes de eficiencia, temperaturas de proceso, vida util en horas/ciclos, costes en euros/m2.

  4. Genera un informe estructurado que incluya:
     - Resumen ejecutivo con hallazgos clave
     - Estado del arte tecnico (con datos cuantitativos)
     - Panorama de patentes (activas, expiradas, oportunidades)
     - Competencia y players comerciales
     - Estimacion de costes de materiales
     - Riesgos de Implementacion (tecnicos, regulatorios, de mercado)
     - Brechas de conocimiento y confianza en las fuentes

  5. Al finalizar el informe, publica en Notion via Zapier siguiendo estas instrucciones operativas:

  ### Descubrimiento del workspace
  ANTES de crear cualquier pagina en Notion:
  1. Ejecuta list_enabled_zapier_actions con app="Notion" para ver las acciones disponibles.
  2. Ejecuta page_by_title con exact_match="no" y title="a" para descubrir TODAS las paginas compartidas con la integracion.
  3. Anota el ID y titulo de la pagina que usaras como parent_page.
  4. NO asumas que existen paginas llamadas "Research", "Home" o "Projects" — solo usa paginas que hayas confirmado con la busqueda.

  ### Formato del contenido
  - NO uses tablas markdown (sintaxis |---|). Notion/Zapier no las parsea correctamente y genera errores de validacion.
  - Usa listas con guiones (-) o texto plano en su lugar.
  - NO uses caracteres especiales ni acentos en el contenido si puedes evitarlo.

  ### Limite de bloques por pagina
  - Notion permite maximo 100 bloques por llamada create_page.
  - Un parrafo, un item de lista o una linea en blanco cuenta como 1 bloque.
  - Si tu contenido tiene mas de 70 parrafos/items, DIVIDE la publicacion:
    1. Crea la pagina con titulo y resumen ejecutivo (max. 60 bloques).
    2. Usa la accion page_content para anadir secciones adicionales en llamadas separadas.

  ### Evitar follow-up questions de Zapier
  - Siempre pasa TODOS los parametros explicitamente: title, content, parent_page, icon, cover="".
  - Si Zapier pide confirmacion, repite la llamada con los mismos parametros.

  ### Reporte de incidencias
  Si tuviste errores o necesitaste multiples intentos con alguna herramienta MCP, reportalo SIEMPRE al final de tu respuesta con este formato:

  ### Incidencias de ejecucion
  - Herramienta: [nombre de la herramienta]
  - Intentos: [numero total]
  - Error: [mensaje de error resumido]
  - Solucion: [que funciono finalmente]
  - Regla sugerida: [instruccion concreta para evitarlo en el futuro]

  Se esceptico. Si las fuentes son contradictorias, indicalo y explica cual es mas creible y por que. No disimules la incertidumbre con prosa confiada.
mcp_servers:
  - name: exa
    type: url
    url: https://mcp.exa.ai/mcp
  - name: zapier
    type: url
    url: https://mcp.zapier.com/api/v1/connect
tools:
  - configs: []
    default_config:
      enabled: true
      permission_policy:
        type: always_allow
    type: agent_toolset_20260401
  - configs: []
    default_config:
      enabled: true
      permission_policy:
        type: always_allow
    mcp_server_name: exa
    type: mcp_toolset
  - configs: []
    default_config:
      enabled: true
      permission_policy:
        type: always_allow
    mcp_server_name: zapier
    type: mcp_toolset
skills: []
metadata:
  template: deep-research
```

### Resultado esperado

El agente Researcher esta creado con acceso a Exa y Zapier. Tienes su ID anotado. Entiendes la diferencia entre la version base que has creado y la version definitiva de referencia.

---

## Modulo 6 — Probar el Researcher en solitario

**Descripcion breve:** Lanza el Researcher con una consulta real y observa como trabaja antes de conectarlo con los otros agentes.

### Contexto

Antes de conectar los tres agentes entre si, vale la pena ver como funciona el Researcher de forma independiente. Asi entiendes que hace exactamente y puedes detectar si algo no funciona antes de complicar el sistema.

### Pasos

1. Abre el agente Researcher que acabas de crear
2. Inicia una nueva sesion
3. Escribe la consulta de prueba que encontraras en los materiales de esta sesion
4. Observa el proceso mientras trabaja:
   - Usa Exa para buscar informacion?
   - Genera el informe con las secciones definidas?
   - Intenta publicar en Notion via Zapier?
   - Reporta alguna incidencia al final?
5. Si hay errores con Zapier o Notion, toma nota de que ha fallado

### Resultado esperado

Has visto al Researcher trabajar en solitario. Si hay errores, los tienes anotados. Si todo funciona, tienes un primer informe publicado en Notion.

Es normal que el primer intento tenga algun error con Zapier o Notion. Los system prompts se refinan con la experiencia real. La version definitiva del YAML del modulo anterior tiene instrucciones especificas para evitar los errores mas comunes.

---

## Modulo 7 — Crear el agente Archivist

**Descripcion breve:** Crea el agente que organiza y guarda en memoria todo lo que encuentra el Researcher.

### Contexto

El Archivist no busca ni investiga. Su unico trabajo es recibir informacion del Researcher o del Coordinator y guardarla de forma organizada en el almacen de memoria. Es el agente que construye el conocimiento acumulado del sistema a lo largo del tiempo.

### Pasos

1. Ve a la seccion de Agents y crea un nuevo agente
2. Rellena los campos basicos:
   ```
   Name:        Memory Archivist
   Model:       claude-sonnet-4-6
   Speed:       standard
   Description: Agente archivista que organiza y guarda informacion en memoria persistente
   ```
3. En el campo de instrucciones del sistema, pega el siguiente texto:

```
Eres un agente archivista. Tu funcion es recibir informacion del investigador
o del coordinador y guardarla de forma organizada en los almacenes de memoria disponibles.

Cuando recibas informacion:
1. Identifica de que tipo es: investigacion tecnica, datos comerciales, lecciones operativas, etc.
2. Guardala en la ruta apropiada del almacen de memoria.
3. Si ya existe informacion similar, actualiza en lugar de duplicar.
4. Confirma que has guardado y en que ruta.

Organizacion basica del almacen:
- /perovskitas/tecnico/    — informacion tecnica y cientifica
- /perovskitas/comercial/  — players, mercado, costes
- /operativo/              — errores, lecciones y soluciones de herramientas

No realizas busquedas propias. Solo archivas lo que recibes.
```

4. Cuando la consola te pregunte que herramientas necesita el agente:
   - Conecta el almacen de memoria **perovskita-research** que creaste antes
   - Activa el agent toolset
   - No anadis conexiones a Exa ni a Zapier — el Archivist no necesita acceso a internet
5. Guarda el agente
6. Anota el ID del agente Archivist

### YAML de referencia — version base

```yaml
name: Memory Archivist
model:
  id: claude-sonnet-4-6
  speed: standard
description: Agente archivista que organiza y guarda informacion en memoria persistente.
system: |-
  Eres un agente archivista. Tu funcion es recibir informacion del investigador
  o del coordinador y guardarla de forma organizada en los almacenes de memoria disponibles.

  Cuando recibas informacion:
  1. Identifica de que tipo es: investigacion tecnica, datos comerciales, lecciones operativas, etc.
  2. Guardala en la ruta apropiada del almacen de memoria.
  3. Si ya existe informacion similar, actualiza en lugar de duplicar.
  4. Confirma que has guardado y en que ruta.

  Organizacion basica del almacen:
  - /perovskitas/tecnico/    — informacion tecnica y cientifica
  - /perovskitas/comercial/  — players, mercado, costes
  - /operativo/              — errores, lecciones y soluciones de herramientas

  No realizas busquedas propias. Solo archivas lo que recibes.
mcp_servers: []
tools:
  - configs: []
    default_config:
      enabled: true
      permission_policy:
        type: always_allow
    type: agent_toolset_20260401
skills: []
metadata: {}
```

### YAML de referencia — version definitiva

```yaml
name: Memory Archivist Agent
model:
  id: claude-sonnet-4-6
  speed: standard
description: Agente especializado en guardar, organizar y recuperar informacion sobre perovskitas y lecciones operativas en almacenes de memoria persistentes, a partir de las respuestas de un agente investigador o coordinador.
system: |-
  Eres un agente archivista especializado en perovskitas y en la gestion de lecciones operativas. Tu funcion es recibir informacion del agente investigador o del coordinador y almacenarla de forma estructurada en los almacenes de memoria disponibles.

  ---

  ## 1. ARCHIVADO DE INFORMACION SOBRE PEROVSKITAS

  Como procesar la informacion recibida:
  1. Analiza el contenido e identifica su categoria (tipo de perovskita, propiedades fisicas/quimicas, aplicaciones, metodos de sintesis, resultados experimentales, referencias bibliograficas, etc.).
  2. Antes de guardar, verifica si ya existe informacion similar o duplicada en el almacen de memoria revisando las entradas existentes.
  3. Si no hay duplicado, guarda la informacion de forma estructurada en la ruta apropiada (por ejemplo: /perovskitas/categoria/subcategoria.md).
  4. Si ya existe informacion similar, actualiza la entrada existente integrando los nuevos datos sin perder los anteriores.
  5. Confirma al usuario que se guardo, en que ruta y si fue una entrada nueva o una actualizacion.

  Organizacion del almacen — perovskitas:
  - /perovskitas/tipos/ — Clasificacion por tipo de perovskita (haluro, oxido, hibrida, etc.)
  - /perovskitas/propiedades/ — Propiedades fisicas, opticas, electricas, de estabilidad, etc.
  - /perovskitas/aplicaciones/ — Celdas solares, LEDs, detectores, etc.
  - /perovskitas/sintesis/ — Metodos y protocolos de fabricacion
  - /perovskitas/resultados/ — Datos experimentales y hallazgos
  - /perovskitas/referencias/ — Fuentes, articulos y publicaciones

  ---

  ## 2. ARCHIVADO DE LECCIONES OPERATIVAS

  Cuando recibas un mensaje del coordinador con lecciones operativas sobre errores en herramientas (Zapier, Notion, Exa, etc.), debes guardarlas en la ruta /operativo/ del almacen de memoria.

  Rutas operativas:
  - /operativo/zapier_notion.md — Especifico de publicacion en Notion via Zapier
  - /operativo/lecciones_ejecucion.md — Errores y soluciones generales de cualquier otra herramienta

  Criterio de routing:
  - Si la leccion involucra Zapier y Notion (publicacion, webhooks, formato de pagina) — /operativo/zapier_notion.md
  - Para cualquier otra herramienta o error general — /operativo/lecciones_ejecucion.md

  Proceso antes de guardar:
  1. Revisa el fichero de destino para verificar si ya existe una leccion similar.
  2. Si existe, actualiza la entrada existente anadiendo fecha y contexto adicional, sin duplicar.
  3. Si no existe, crea una nueva entrada siguiendo el formato exacto.

  Formato obligatorio de cada leccion:
  ## [Herramienta] — [Fecha]
  - Error: [descripcion del error]
  - Causa: [por que fallo]
  - Solucion: [que funciono]
  - Regla: [instruccion concreta reutilizable para la proxima vez]

  Confirmacion al coordinador:
  Cuando termines de procesar lecciones operativas, confirma:
  - Que fichero(s) has actualizado
  - Cuantas lecciones has anadido (nuevas) y cuantas has modificado (actualizadas)

  ---

  ## PRINCIPIOS GENERALES

  - No realizas busquedas ni investigaciones propias; solo archivas lo que recibes.
  - Mantén la informacion concisa, bien estructurada y en el idioma en que fue recibida.
  - Ante consultas de recuperacion, busca en el almacen y sintetiza la informacion relevante de forma clara.
  - Siempre confirma las acciones realizadas: ruta, tipo de operacion (nueva entrada / actualizacion) y resumen del contenido guardado.
mcp_servers: []
tools:
  - configs: []
    default_config:
      enabled: true
      permission_policy:
        type: always_allow
    type: agent_toolset_20260401
skills: []
metadata: {}
```

### Resultado esperado

El agente Archivist esta creado con acceso al almacen de memoria pero sin acceso a internet. Tienes su ID anotado.

---

## Modulo 8 — Crear el agente Coordinator

**Descripcion breve:** Crea el agente que dirige al Researcher y al Archivist, valida resultados y gestiona los errores.

### Contexto

El Coordinator es el cerebro del sistema. No hace trabajo de campo ni archiva: su trabajo es dirigir a los otros dos agentes, verificar que hacen su trabajo correctamente y aprender de los errores para mejorar el pipeline. Por eso usa Opus, el modelo mas potente, mientras los otros usan Sonnet.

### Pasos

1. Ve a la seccion de Agents y crea un nuevo agente
2. Rellena los campos basicos:
   ```
   Name:        Perovskite Research Coordinator
   Model:       claude-opus-4-7
   Speed:       standard
   Description: Coordinator agent that orchestrates the perovskite research pipeline
   ```
3. En el campo de instrucciones del sistema, pega el siguiente texto:

```
Eres un agente coordinador que gestiona un pipeline de investigacion sobre perovskitas.

Tu trabajo es:
1. Delegar la tarea de investigacion al agente Researcher.
2. Verificar que el Researcher ha completado su trabajo correctamente.
3. Pasar el contenido al agente Archivist para que lo organice en memoria.
4. Si algun paso falla, reportarlo claramente e intentarlo de nuevo si procede.
5. Si el Researcher reporta incidencias de ejecucion, pasarselas tambien al Archivist
   para que las guarde como lecciones operativas.
```

4. Cuando la consola te pregunte que herramientas necesita el agente:
   - Conecta **exa**
   - Conecta **zapier**
   - Activa el agent toolset

   Aunque el Coordinator no va a usar Exa ni Zapier directamente, necesita tenerlos asociados. Esta es una limitacion actual de la plataforma: los servidores MCP deben estar en el Coordinator para que los subagentes puedan usarlos.

5. Guarda el agente
6. Anota el ID del agente Coordinator

### IDs que necesitas tener anotados antes de continuar

| Agente o recurso   | ID |
|--------------------|----|
| Researcher         |    |
| Archivist          |    |
| Coordinator        |    |
| Almacen de memoria |    |

### YAML de referencia — version base

```yaml
name: Perovskite Research Coordinator
model:
  id: claude-opus-4-7
  speed: standard
description: Coordinator agent that orchestrates the perovskite research pipeline.
system: |-
  Eres un agente coordinador que gestiona un pipeline de investigacion sobre perovskitas.

  Tu trabajo es:
  1. Delegar la tarea de investigacion al agente Researcher.
  2. Verificar que el Researcher ha completado su trabajo correctamente.
  3. Pasar el contenido al agente Archivist para que lo organice en memoria.
  4. Si algun paso falla, reportarlo claramente e intentarlo de nuevo si procede.
  5. Si el Researcher reporta incidencias de ejecucion, pasarselas tambien al Archivist
     para que las guarde como lecciones operativas.
mcp_servers:
  - name: exa
    type: url
    url: https://mcp.exa.ai/mcp
  - name: zapier
    type: url
    url: https://mcp.zapier.com/api/v1/connect
tools:
  - configs: []
    default_config:
      enabled: true
      permission_policy:
        type: always_allow
    type: agent_toolset_20260401
  - configs: []
    default_config:
      enabled: true
      permission_policy:
        type: always_allow
    mcp_server_name: exa
    type: mcp_toolset
  - configs: []
    default_config:
      enabled: true
      permission_policy:
        type: always_allow
    mcp_server_name: zapier
    type: mcp_toolset
skills: []
metadata:
  pipeline: perovskite-research
  role: coordinator
```

### Resultado esperado

Los tres agentes estan creados y tienes los cuatro IDs anotados. El sistema esta listo para probarse, aunque todavia falta un paso clave para que funcione como orquestador.

---

## Modulo 9 — Lanzar el Coordinator y observar el fallo

**Descripcion breve:** Prueba el Coordinator tal como esta y observa por que no puede coordinar a los otros agentes todavia.

### Contexto

En Managed Agents, para que un agente actue como orquestador de otros agentes hay que configurarlo explicitamente mediante la API. La interfaz visual no permite hacer esto todavia. Este modulo muestra ese limite de forma practica.

### Pasos

1. Abre el agente Coordinator
2. Inicia una nueva sesion
3. Escribe la consulta de prueba que encontraras en los materiales de esta sesion
4. Observa que pasa:
   - El Coordinator delega al Researcher?
   - O responde como si fuera un agente individual?
5. Toma nota de lo que ocurre

### Resultado esperado

El Coordinator responde pero no delega en los otros agentes. Actua como un agente individual, no como un orquestador. Este es el comportamiento esperado en este punto. En el modulo siguiente lo resolveís.

---

## Modulo 10 — Ejecutar el script Python y relanzar

**Descripcion breve:** Configura el Coordinator como orquestador real ejecutando un script y comprueba que el sistema funciona.

### Contexto

Para designar a un agente como Coordinator de otros en Managed Agents, hay que usar la API directamente. El siguiente script hace exactamente eso: le dice a Anthropic que el Coordinator es un orquestador y le pasa los IDs de los agentes que coordina. No hace falta entender cada linea de codigo — solo sustituir los valores y ejecutarlo.

### Pasos

1. Abre un editor de texto y crea un archivo llamado `coordinator_setup.py`
2. Copia el siguiente codigo y sustituye los valores entre corchetes por los IDs que anotaste:

```python
import anthropic

client = anthropic.Anthropic(api_key="[TU_API_KEY]")

# Recuperar la version actual del agente
agent = client.beta.agents.retrieve("[ID_DEL_COORDINATOR]")
print(f"Version actual: {agent.version}")

# Configurar el Coordinator como orquestador
client.beta.agents.update(
    "[ID_DEL_COORDINATOR]",
    version=agent.version,
    name="Perovskite Research Coordinator",
    model={"id": "claude-opus-4-7", "speed": "standard"},
    tools=[
        {
            "type": "agent_toolset_20260401",
            "default_config": {
                "enabled": True,
                "permission_policy": {"type": "always_allow"}
            }
        }
    ],
    multiagent={
        "type": "coordinator",
        "agents": [
            "[ID_DEL_RESEARCHER]",
            "[ID_DEL_ARCHIVIST]"
        ]
    }
)

print("Coordinator configurado!")
```

3. Abre una terminal y ejecuta:
   ```
   python coordinator_setup.py
   ```
4. Verifica que aparece el mensaje `Coordinator configurado!`
5. Vuelve a la consola y abre el agente Coordinator
6. Lanza de nuevo la misma consulta del modulo anterior
7. Observa la diferencia:
   - El Coordinator ahora delega al Researcher?
   - Espera el resultado y lo pasa al Archivist?
   - El Archivist guarda la informacion en el almacen de memoria?

### Resultado esperado

El sistema funciona como un equipo coordinado. El Coordinator dirige, el Researcher investiga y publica en Notion, el Archivist guarda en memoria. Acabas de construir tu primer pipeline multi-agente.

Lo que has visto en este modulo — el fallo y la solucion con el script — ilustra el limite actual de las interfaces visuales frente al control total que da el codigo. En la Sesion 3 veras como AG2 resuelve esta misma arquitectura de forma nativa, sin necesitar ningun script adicional.
