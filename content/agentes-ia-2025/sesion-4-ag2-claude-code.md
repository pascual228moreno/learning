---
id: 4
title: "AG2 Framework + Claude Code: Agentes por codigo"
date: Viernes 5 junio · 10:00–12:00
objectives:
  - Entender por que el codigo da mas control que la interfaz de consola para construir agentes
  - Instalar Python, Node.js y Claude Code en local via winget
  - Crear la carpeta de trabajo C:\scripts\AG2 y estructurarla correctamente
  - Entender que es CLAUDE.md y que es un SDD y por que son la habilidad clave del desarrollo con IA
  - Pedirle a Claude Code que lea los archivos y construya el pipeline completo de AG2
  - Ver el pipeline funcionando end-to-end: investigacion de mercado, posts LinkedIn y revision corporativa
---

## Modulo 1 — Por que codigo y por que Claude Code

**Descripcion breve:** Explicamos por que pasamos de la consola web al codigo, que es Claude Code, y por que esta forma de trabajar os da autonomia real frente a cualquier herramienta de agentes.

### Contexto

En las sesiones anteriores construisteis agentes desde la consola de Anthropic: interfaz visual, menus, YAML. Funciona para explorar, pero tiene tres limitaciones concretas que habeis notado:

#### 1. No podeis reproducirlo solas

La consola no guarda el proceso, solo el resultado. Si algo falla o quereis replicarlo en otro contexto, dependeis de recordar exactamente que clicasteis. El codigo, en cambio, es el proceso escrito. Lo ejecutas hoy, manana y dentro de un ano y hace lo mismo.

#### 2. Dependeis de lo que la interfaz os permita

La consola os deja hacer lo que Anthropic ha decidido que podeis hacer desde esa pantalla. El codigo no tiene ese limite: podeis conectar cualquier herramienta, disenar cualquier flujo, integrar cualquier fuente de datos.

#### 3. Cada plataforma tiene su propia interfaz

Si manana quereis usar OpenClaw, Hermes o cualquier otro orquestador, volvierais a empezar desde cero. Lo que aprendeis hoy — como disenar agentes, como especificar su comportamiento, como encadenarlos — funciona en cualquier plataforma porque es el concepto, no el menu.

### Que es Claude Code

Claude Code es Claude metido en vuestro terminal. Lee vuestro proyecto, escribe el codigo, lo ejecuta y arregla los errores. No es un editor de texto con sugerencias: es un agente que actua en vuestro entorno de desarrollo siguiendo vuestras instrucciones en lenguaje natural.

La consecuencia practica: **vosotras no vais a escribir codigo hoy. Vais a especificar que quereis. Claude Code lo construye.**

### Que es AG2 y por que lo aprendemos

AG2 (antes llamado AutoGen) es el framework de Python para construir agentes y orquestar su colaboracion. Es el motor que hay debajo de OpenClaw, de Hermes y de cualquier orquestador que os vendan. El Instituto Tecnologico de Aragon trabaja con AG2. Si sabeis lo que hay dentro, sabeis evaluar cualquier herramienta que se construya sobre el.

### Resultado esperado

Entendeis por que hoy trabajamos con codigo y con Claude Code, y por que eso os da mas autonomia que cualquier interfaz visual.

---

## Modulo 2 — Instalar Python, Node.js y Claude Code

**Descripcion breve:** Instalamos las tres herramientas necesarias desde PowerShell usando winget, el gestor de paquetes de Windows. Sin descargar instaladores, sin opciones que confundan.

### Contexto

Vais a instalar Python sin saber programar en Python, igual que instalasteis Chrome sin saber como funciona un motor de renderizado. Lo que importa no es entender cada pieza — es saber encender el motor. Eso si podeis hacerlo. Y hoy lo haceis.

`winget` es el gestor de paquetes oficial de Windows. Viene instalado en cualquier Windows 10/11 actualizado. Una linea por herramienta, sin elegir carpetas ni marcar casillas.

### Pasos

1. Abrir **PowerShell** (buscar "PowerShell" en el menu inicio, ejecutar como usuario normal — no hace falta administrador)

2. Instalar Python 3.12:
   ```powershell
   winget install Python.Python.3.12
   ```

3. Instalar Node.js (necesario para Claude Code):
   ```powershell
   winget install OpenJS.NodeJS.LTS
   ```

4. **Cerrar PowerShell y volver a abrirlo** — obligatorio para que el PATH se actualice

5. Verificar que ambos responden:
   ```powershell
   python --version
   node --version
   ```

6. Instalar Claude Code:
   ```powershell
   npm install -g @anthropic-ai/claude-code
   ```

7. Verificar que Claude Code esta instalado:
   ```powershell
   claude --version
   ```

### Si algo falla

- **`winget` no reconocido**: Windows desactualizado. Ir a python.org y nodejs.org, descargar los instaladores. En Python marcar "Add Python to PATH".
- **`claude` no reconocido tras instalar**: cerrar y reabrir PowerShell. El PATH necesita actualizarse.
- **PowerShell bloquea la ejecucion de scripts**: ejecutar `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` y pulsar S cuando pregunte.

### Resultado esperado

`python --version`, `node --version` y `claude --version` responden con numeros de version. Las tres herramientas estan listas.

---

## Modulo 3 — Crear la carpeta de trabajo y hacer /login en Claude Code

**Descripcion breve:** Creamos la estructura de carpetas del proyecto y autenticamos Claude Code con la cuenta de Anthropic.

### Contexto

Todo el trabajo de hoy vive en `C:\scripts\AG2`. Claude Code necesita estar dentro de esa carpeta para leer el proyecto y actuar sobre el. Es como abrir un documento antes de editarlo: la ubicacion importa.

### Pasos

1. Crear la carpeta del proyecto (crea `scripts` y `AG2` de una vez aunque `scripts` no exista):
   ```powershell
   mkdir C:\scripts\AG2
   ```

2. Entrar en la carpeta:
   ```powershell
   cd C:\scripts\AG2
   ```

3. Lanzar Claude Code desde dentro de la carpeta:
   ```powershell
   claude
   ```

4. En el primer arranque Claude Code muestra: `Not logged in · Please run /login`

5. Ejecutar el login:
   ```
   /login
   ```

6. Se abrira el navegador con el flujo de autenticacion de Anthropic. Iniciar sesion con la cuenta que tiene creditos de API.

7. Cuando el navegador confirme que la autenticacion fue correcta, volver al terminal. Claude Code ya estara autenticado.

### Nota sobre el plan

Claude Code requiere un plan de pago (Pro, Max, Teams o Enterprise) o creditos de API en la cuenta de Anthropic. El plan gratuito de Claude.ai no da acceso. Si al hacer /login aparece un error de autorizacion, verificar en console.anthropic.com que la cuenta tiene creditos activos.

### Resultado esperado

Claude Code esta abierto dentro de `C:\scripts\AG2` y muestra el prompt listo para recibir instrucciones. La autenticacion fue correcta.

---

## Modulo 4 — CLAUDE.md y SDD: que son y por que importan

**Descripcion breve:** Dejamos los dos archivos clave en la carpeta del proyecto y explicamos que hace cada uno antes de pedirle a Claude Code que los lea.

### Contexto

Cuando Claude Code arranca en una carpeta, busca automaticamente un archivo llamado `CLAUDE.md`. Si existe, lo lee antes de hacer cualquier cosa. Es la **constitucion del proyecto**: le dice quien es, como trabaja, que modelo usa, donde guarda los archivos y que nunca debe hacer.

El segundo archivo es el **SDD** (Spec Driven Development). No es documentacion pasiva — es el contrato ejecutable. Define exactamente que construir, con que arquitectura y con que criterios de calidad. Claude Code lo sigue al pie de la letra.

La diferencia entre los dos:

| Archivo | Responde a |
|---|---|
| `CLAUDE.md` | Como trabajar en este proyecto |
| `sdd.md` | Que construir en este proyecto |

### Por que SDD es la habilidad que importa

SDD empezo como metodologia de desarrollo profesional y en 2025-2026 se convirtio en el estandar para trabajar con agentes de IA. La razon: sin un spec previo, los agentes de IA producen codigo que parece correcto pero se desvía de lo que querías. El spec es lo que los ancla.

**La habilidad no es programar. Es especificar con precision.** Si sabeis escribir un buen SDD, podeis dirigir a Claude Code, a un desarrollador externo o a cualquier herramienta de agentes. La especificacion es vuestro poder, independientemente de quien o que ejecute.

### Pasos

1. Salir de Claude Code temporalmente (escribir `/exit` o Ctrl+C)

2. Copiar los archivos `CLAUDE.md` y `sdd.md` en `C:\scripts\AG2` (por email, USB o carpeta compartida)

3. Verificar que estan en la carpeta:
   ```powershell
   dir C:\scripts\AG2
   ```
   Deben aparecer `CLAUDE.md` y `sdd.md`

4. Abrir cada archivo y leerlo brevemente para entender su contenido antes de darselo a Claude Code

### Resultado esperado

Los dos archivos estan en `C:\scripts\AG2`. Entendeis la diferencia entre constitucion del proyecto (CLAUDE.md) y contrato de construccion (sdd.md). Listos para dar la instruccion a Claude Code.

---

## Modulo 5 — Claude Code lee los archivos y construye el pipeline

**Descripcion breve:** Lanzamos Claude Code, le damos la instruccion de arranque y observamos como lee el spec y construye los tres agentes AG2 sin que escribamos una sola linea de codigo.

### Contexto

A partir de aqui vuestro trabajo es **observar y guiar**, no teclear codigo. Claude Code lee el `CLAUDE.md` y el `sdd.md`, instala las dependencias que necesita, crea la carpeta `agentes/` y construye los tres agentes siguiendo la arquitectura definida en el spec.

Lo que va a construir por debajo es AG2 real: `ConversableAgent`, `GroupChat`, `GroupChatManager`, `register_function`. La misma tecnologia que usa el ITA. Vosotras no veis el codigo hasta que esta construido — y cuando lo veis, podeis leerlo y entenderlo porque el spec que escribisteis es exactamente lo que describe.

### Pasos

1. Volver a lanzar Claude Code dentro de `C:\scripts\AG2`:
   ```powershell
   cd C:\scripts\AG2
   claude
   ```

2. Escribir la instruccion de arranque:
   ```
   Lee el CLAUDE.md y el sdd.md. Siguiendo estrictamente las especificaciones del sdd.md, construye el pipeline completo: los tres agentes en la carpeta agentes/ y el lanzador.py en la raiz. Empieza instalando las dependencias.
   ```

3. Claude Code leera ambos archivos, confirmara que entiende la arquitectura y empezara a trabajar. **No interrumpais** mientras trabaja.

4. Claude Code instalara las dependencias automaticamente:
   ```bash
   pip install "ag2[anthropic]" python-dotenv duckduckgo-search
   ```
   Si os pide confirmacion para instalar algo, responded `s` o `yes`.

5. Observad como crea los archivos en orden: `agentes/agente1_investigador.py`, `agentes/agente2_generador.py`, `agentes/agente3_revisor.py`, `lanzador.py`

6. Si Claude Code hace una pregunta sobre algo del spec que no entiende, respondedla en lenguaje natural. El no toca codigo hasta tener claro que construir.

### Que esta haciendo AG2 por debajo mientras construye

Cada agente que construye Claude Code es un `ConversableAgent`: un LLM (Claude) con instrucciones especificas (`system_message`) y un rol definido. Los tres agentes se coordinan dentro de un `GroupChat` gestionado por un `GroupChatManager`. La herramienta de busqueda web esta registrada con `register_function`. Las transiciones entre agentes estan forzadas para que el flujo sea siempre el correcto.

Esto es exactamente lo que hay dentro de OpenClaw o de cualquier orquestador que os muestren. La diferencia es que hoy lo estais viendo construirse.

### Resultado esperado

La carpeta `C:\scripts\AG2` contiene `agentes/` con tres scripts Python y `lanzador.py` en la raiz. Claude Code confirma que el pipeline esta construido. Listos para anadir la API key.

---

## Modulo 6 — Anadir el .env y lanzar el pipeline

**Descripcion breve:** Creamos el archivo .env con la API key de Anthropic y ejecutamos el pipeline completo por primera vez.

### Contexto

El unico dato que Claude Code no puede manejar por vosotras es la API key: es vuestra credencial privada y nunca debe aparecer escrita en el codigo. Por eso se guarda en un archivo `.env` separado que el script lee al arrancar pero que nunca se comparte ni se sube a repositorios.

### Pasos

1. Salir de Claude Code: `/exit`

2. Abrir el Bloc de notas y escribir exactamente esto (sustituyendo por vuestra clave real):
   ```
   ANTHROPIC_API_KEY=sk-ant-vuestra-clave-aqui
   ```

3. Guardar el archivo como `.env` (con el punto delante) en `C:\scripts\AG2`
   - En el Bloc de notas, al guardar: cambiar "Tipo" a "Todos los archivos" y escribir `.env` como nombre

4. Verificar que el archivo existe:
   ```powershell
   dir C:\scripts\AG2
   ```
   Debe aparecer `.env` junto a `CLAUDE.md` y `sdd.md`

5. Lanzar el pipeline:
   ```powershell
   python lanzador.py
   ```

6. El pipeline os pedira una pregunta de mercado. Escribir por ejemplo:
   ```
   ¿Cual es la situacion actual del mercado europeo de arcillas ceramicas?
   ```

7. Observad el pipeline en accion:
   - El investigador busca en DuckDuckGo y produce el briefing
   - El generador convierte el briefing en tres posts de LinkedIn
   - El revisor evalua cada post y entrega las versiones corregidas
   - El pipeline pregunta si quereis guardar el resultado en `resultado.txt`

### Si algo falla

- **`KeyError: ANTHROPIC_API_KEY`**: el archivo `.env` no esta en `C:\scripts\AG2` o tiene un error de formato. Verificar que no tiene espacios alrededor del `=`.
- **Error 401 de Anthropic**: la clave es incorrecta o la cuenta no tiene creditos. Verificar en console.anthropic.com.
- **DuckDuckGo no devuelve resultados**: rate limit temporal. Esperar 30 segundos y volver a ejecutar.
- **El pipeline no termina**: el agente revisor no escribio "PIPELINE COMPLETADO". Interrumpir con Ctrl+C y pedirle a Claude Code que revise la condicion de terminacion.

### Resultado esperado

El pipeline se ejecuta end-to-end: el investigador busca, el generador escribe y el revisor aprueba. El resultado final son tres posts de LinkedIn revisados y listos para publicar. Si guardasteis en `.txt`, teneis el informe completo en `resultado.txt`.

---

## Cierre — Resumen de hoy y puente a la sesion 5

En esta sesion hemos:

- Explicado por que el codigo da mas control y autonomia que la interfaz visual de la consola
- Instalado Python, Node.js y Claude Code en local usando winget desde PowerShell
- Creado la carpeta `C:\scripts\AG2` y autenticado Claude Code con la cuenta de Anthropic
- Entendido la diferencia entre `CLAUDE.md` (como trabajar) y `sdd.md` (que construir), y por que el SDD es la habilidad que manda cuando se trabaja con IA
- Pedido a Claude Code que leyera los archivos y construyera el pipeline sin escribir una sola linea de codigo
- Visto AG2 real funcionando: `ConversableAgent`, `GroupChat`, `GroupChatManager`, `register_function`, el mismo motor que usa el ITA
- Ejecutado el pipeline completo: pregunta de mercado → briefing → tres posts LinkedIn → revision corporativa → resultado listo para publicar

La sesion 5 abre la siguiente capa: comparar lo que acabais de construir con el equivalente en otras plataformas (ChatGPT Workspace, OpenClaw), analizar cuando elegir cada opcion y empezar a disenar vuestros propios casos de uso a partir de los 20 que identificamos para SAMCA.
