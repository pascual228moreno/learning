---
id: 2
title: Claude Managed Agents e inicio AG2
date: Martes 19 mayo · 10:00–12:00
objectives:
  - Verificar tier de Anthropic y desbloquear la creacion de agentes
  - Crear los agentes Researcher, Archivist y Coordinator que dejamos disenados en la sesion 1
  - Configurar el Coordinator como orquestador real mediante el script Python
  - Crear una Skill propia en la consola y asignarla a un agente
  - Conocer AG2 como framework alternativo a Managed Agents
  - Ejecutar el primer hello-world de AG2 con dos agentes Claude conversando
---

## Modulo 1 — Reanudacion y nota sobre tiers de Anthropic

**Descripcion breve:** Recap de la sesion anterior y por que algunos no pudisteis crear agentes el ultimo dia.

### Contexto

En la sesion 1 recorrimos la consola, conectamos Exa y Zapier, configuramos Notion y creamos el almacen de memoria. Llegados al punto de crear los agentes (modulos 5-10 de la sesion 1), varios de vosotros os topasteis con que la consola no os dejaba — pese a haber anadido saldo, la cuenta seguia en el tier Free.

### Por que pasa esto

Anthropic clasifica las cuentas por tiers de uso (Free, Tier 1, Tier 2, etc.). El acceso a ciertas APIs y funcionalidades — entre ellas, crear agentes en la consola — esta restringido por tier. Recargar saldo no implica subir de tier de forma inmediata: Anthropic revisa el historial de uso y el metodo de pago antes de promocionarte automaticamente, y eso puede llevar dias.

No es algo que podamos resolver en directo en esta sesion. Si tu cuenta sigue bloqueada hoy:
- Sigues los modulos como observador y trabajas sobre el ejemplo del profesor en pantalla
- Tras la sesion, abres un ticket en soporte de Anthropic desde la propia consola para acelerar la promocion
- Cuando te suban de tier, replicas los pasos en tu cuenta

### Antes de seguir

Mira por encima que las conexiones de la sesion 1 siguen activas en tu consola (o en la del profesor):
- **exa** y **zapier** en la seccion de conexiones MCP
- El almacen de memoria **perovskita-research** en la seccion de Agents

### Resultado esperado

Entiendes por que la sesion 1 se quedo a medias y como vas a seguir hoy: ejecutando tu mismo si tu cuenta esta lista, o siguiendo al profesor si todavia no lo esta.

---

## Modulo 2 — Crear el agente Researcher

**Descripcion breve:** Ahora si: creamos el agente investigador que dejamos disenado en la sesion 1.

### Contexto

El system prompt y el YAML completo (version base y version definitiva) los tienes en el modulo 5 de la sesion 1. Aqui ejecutamos la creacion siguiendo el flow de la consola.

### Pasos

1. En la consola, **Agents → Create agent**
2. Rellena los campos basicos:
   ```
   Name:        Perovskite Researcher
   Model:       claude-sonnet-4-6
   Speed:       standard
   Description: Investigador tecnico para integracion de celdas solares en ceramica
   ```
3. Pega el system prompt que dejamos definido en el modulo 5 de la sesion 1 (la version base es suficiente para arrancar)
4. En **Tools / Connections**:
   - Marca **exa** y **zapier**
   - Activa el **agent toolset** (es lo que permitira que el Coordinator lo invoque despues)
5. **Save** y copia el ID del agente — apuntalo en la tabla que cierra el modulo 5

### Resultado esperado

El Researcher esta creado y aparece listado en Agents. Tienes su ID anotado.

---

## Modulo 3 — Probar el Researcher en solitario

**Descripcion breve:** Antes de conectar los tres agentes, lanzamos al Researcher con una consulta real y observamos como trabaja.

### Contexto

Probar cada agente aislado antes de orquestarlo es la regla basica para no perderse en errores cruzados. Si el Researcher no publica bien en Notion en solitario, no va a hacerlo mejor desde un pipeline coordinado.

### Pasos

1. Abre el agente Researcher
2. Inicia una nueva sesion y lanza esta consulta:
   ```
   Investiga el estado del arte de la integracion de celdas de perovskita
   en sustratos ceramicos para el sector de pavimentos. Foco en los ultimos 18 meses.
   ```
3. Observa la traza mientras trabaja:
   - Lanza busquedas con Exa?
   - Estructura el informe con las secciones definidas?
   - Intenta publicar en Notion via Zapier?
   - Reporta incidencias al final?
4. Si hay errores con Zapier o Notion (lo normal en la primera vuelta), anotalos literales — los reciclamos en el modulo de Skills

### Resultado esperado

Tienes un primer informe en Notion (aunque sea con errores) o, al menos, la traza completa de lo que ha intentado el Researcher. Las incidencias anotadas se reutilizan en el modulo 9.

---

## Modulo 4 — Crear el agente Archivist

**Descripcion breve:** Creamos el agente que solo archiva: sin internet, solo memoria.

### Contexto

El system prompt y los YAML estan en el modulo 7 de la sesion 1. Aqui solo ejecutamos la creacion.

### Pasos

1. **Agents → Create agent**
2. Campos basicos:
   ```
   Name:        Memory Archivist
   Model:       claude-sonnet-4-6
   Speed:       standard
   Description: Agente archivista que organiza y guarda informacion en memoria persistente
   ```
3. Pega el system prompt del modulo 7 de la sesion 1
4. En **Tools / Connections**:
   - **No** conectes exa ni zapier — el Archivist no necesita internet
   - Conecta el almacen de memoria **perovskita-research**
   - Activa el **agent toolset**
5. **Save** y copia el ID

### Resultado esperado

El Archivist esta creado, sin acceso a internet, con acceso al almacen de memoria.

---

## Modulo 5 — Crear el agente Coordinator

**Descripcion breve:** Creamos el cerebro del pipeline.

### Contexto

El system prompt y el YAML estan en el modulo 8 de la sesion 1. Recuerda: aunque el Coordinator no use Exa ni Zapier directamente, hay que conectarlos a el porque los subagentes los heredan a traves del Coordinator (limite actual de la plataforma).

### Pasos

1. **Agents → Create agent**
2. Campos basicos:
   ```
   Name:        Perovskite Research Coordinator
   Model:       claude-opus-4-7
   Speed:       standard
   Description: Coordinator agent that orchestrates the perovskite research pipeline
   ```
3. Pega el system prompt del modulo 8 de la sesion 1
4. En **Tools / Connections**:
   - **exa** y **zapier** (aunque no los use directamente)
   - **agent toolset** activado

### Tabla de IDs — completala antes de seguir

| Agente o recurso   | ID |
|--------------------|----|
| Researcher         |    |
| Archivist          |    |
| Coordinator        |    |
| Almacen de memoria |    |

### Resultado esperado

Los tres agentes existen y tienes los cuatro IDs anotados en la tabla.

---

## Modulo 6 — Configurar el Coordinator como orquestador

**Descripcion breve:** Ejecutamos el script Python que registra al Coordinator como orquestador real de los otros dos agentes.

### Contexto

La consola visual no permite todavia marcar a un agente como orquestador de otros. Hay que hacerlo via API. El script es corto: recupera la version actual del agente y la actualiza anadiendo `multiagent.type=coordinator` con los IDs del Researcher y Archivist.

### Pasos

1. Verifica que tienes Python 3.10+ y el SDK instalado:
   ```bash
   pip install anthropic
   ```
2. Crea un fichero `coordinator_setup.py` y sustituye los placeholders por tus IDs:

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

3. Ejecuta:
   ```bash
   python coordinator_setup.py
   ```
4. Verifica que aparece `Coordinator configurado!` en la terminal

### Resultado esperado

El Coordinator ahora es un orquestador real. La proxima vez que lo abras en la consola, vera al Researcher y al Archivist como agentes invocables.

---

## Modulo 7 — Probar el pipeline coordinado

**Descripcion breve:** Lanzamos la misma consulta del modulo 3 pero ahora desde el Coordinator, y verificamos que los tres agentes trabajan como un equipo.

### Contexto

Si el modulo anterior funciono, el Coordinator delega trabajo en lugar de responderlo el mismo. Si no, vuelve al modulo anterior — el script tuvo que dar error o se ejecuto con IDs erroneos.

### Pasos

1. Abre el agente Coordinator
2. Inicia una nueva sesion y lanza:
   ```
   Investiga el estado del arte de la integracion de celdas de perovskita
   en sustratos ceramicos para el sector de pavimentos. Foco en los ultimos
   18 meses. Asegurate de que el resultado queda archivado.
   ```
3. Observa la traza:
   - El Coordinator delega al Researcher?
   - Espera al resultado y lo pasa al Archivist?
   - El Archivist confirma que ha guardado en `/perovskitas/...`?
4. Si alguna parte falla, lee el output completo y anota la incidencia

### Resultado esperado

El pipeline funciona end-to-end: Coordinator delega → Researcher investiga y publica en Notion → Archivist guarda en memoria. Acabas de construir tu primer sistema multi-agente real en Managed Agents.

---

## Modulo 8 — Skills en la consola: que son y cuando usarlas

**Descripcion breve:** Una Skill es un bloque de instrucciones reutilizable que puedes asignar a varios agentes. Aprende cuando merece la pena extraer comportamiento a una Skill.

### Contexto

Hasta ahora todo el comportamiento de un agente vive dentro de su system prompt. Funciona para empezar pero genera dos problemas:

1. **Duplicacion** — si tres agentes necesitan saber "como publicar en Notion sin que Zapier falle", repites el mismo bloque en tres prompts distintos.
2. **Mantenimiento** — cada vez que descubres una regla operativa nueva (como las que aparecen en el YAML "version definitiva" del modulo 5 de la sesion 1), tienes que actualizar varios sitios.

Las Skills resuelven esto: extraes ese bloque de comportamiento a un objeto independiente, lo nombras, lo versionas, y lo asignas a los agentes que lo necesiten. Es el mismo patron que cualquier sistema de modulos en programacion.

Una Skill tipica en la consola de Anthropic contiene:
- Un nombre y descripcion
- Un cuerpo de instrucciones en Markdown que el agente carga cuando detecta que la skill es relevante
- Opcionalmente, ficheros de referencia o scripts auxiliares

### Como decide el agente que skill usar

Lo no obvio: **no le dices al agente "usa esta skill ahora"**. Las skills funcionan por auto-descubrimiento. Cuando asocias una skill a un agente, el agente ve solo dos cosas de cada skill: su `name` y su `description`. El cuerpo de la skill no entra en el contexto hasta que el agente decide cargarlo.

Esto cambia la regla mas importante a la hora de disenar una skill: **la `description` no describe lo que la skill hace, describe cuando aplica**. Compara:

- ❌ Mal: "Reglas para publicar en Notion" (describe el contenido)
- ✅ Bien: "Aplica cuando vayas a crear paginas en Notion via Zapier — evita errores recurrentes de formato y limites de bloques" (describe el trigger)

Si la `description` esta bien escrita, el agente carga la skill exactamente cuando hace falta. Si esta mal escrita, o el agente la ignora cuando deberia usarla, o la carga sin necesidad y gasta tokens.

### Cuando extraer a Skill y cuando dejar en system prompt

- **Deja en system prompt** lo que define la identidad del agente (su mision, tono, restricciones) y lo que solo aplica a el.
- **Extrae a Skill** lo que es conocimiento operativo reutilizable: integraciones con herramientas externas, plantillas de output, protocolos de error.

### Resultado esperado

Tienes claro que una Skill encapsula un trozo de comportamiento reutilizable y que la decision de extraer depende de si ese conocimiento se va a usar en varios agentes o evolucionar de forma independiente.

---

## Modulo 9 — Crear una Skill propia y asignarla al Researcher

**Descripcion breve:** Convertimos las reglas operativas de "publicar en Notion sin que Zapier falle" en una Skill independiente.

### Contexto

En el modulo 3 anotaste las incidencias del Researcher con Zapier/Notion. Algunas de esas reglas son justo las que aparecen en el YAML "version definitiva" del modulo 5 de la sesion 1: no usar tablas Markdown, partir paginas largas en multiples llamadas, descubrir el workspace antes de crear paginas. Las extraemos a una Skill que pueda usar cualquier agente que publique en Notion.

### Pasos

1. En la consola, ve a la seccion de **Skills** dentro de Agents
2. Crea una skill nueva con estos datos (fijate en la `description` — aplica lo del modulo 8: describe cuando se activa, no que contiene):
   ```
   Name:        notion-publishing-rules
   Description: Aplica cuando vayas a crear o actualizar paginas en Notion via Zapier — evita errores recurrentes de formato, descubre el workspace y respeta el limite de bloques por pagina
   ```
3. En el cuerpo de la skill, pega:

```markdown
## Como publicar en Notion via Zapier sin errores

### Descubrimiento del workspace
Antes de crear cualquier pagina:
1. Ejecuta `list_enabled_zapier_actions` con `app="Notion"` para ver las acciones disponibles
2. Ejecuta `page_by_title` con `exact_match="no"` y `title="a"` para descubrir TODAS las paginas compartidas con la integracion
3. Anota el ID y titulo de la pagina que usaras como `parent_page`
4. NO asumas que existen paginas llamadas "Research", "Home" o "Projects" — solo usa paginas confirmadas por busqueda

### Formato del contenido
- NO uses tablas Markdown (sintaxis |---|). Notion/Zapier no las parsea bien y genera errores de validacion
- Usa listas con guiones (-) o texto plano
- Evita caracteres especiales y acentos si puedes

### Limite de bloques por pagina
- Notion admite maximo 100 bloques por llamada `create_page`
- Un parrafo, un item de lista o una linea en blanco cuenta como 1 bloque
- Si el contenido tiene mas de 70 parrafos/items, DIVIDE la publicacion:
  1. Crea la pagina con titulo y resumen ejecutivo (max. 60 bloques)
  2. Usa la accion `page_content` para anadir secciones adicionales en llamadas separadas

### Evitar follow-up questions de Zapier
- Pasa SIEMPRE todos los parametros explicitamente: title, content, parent_page, icon, cover=""
- Si Zapier pide confirmacion, repite la llamada con los mismos parametros
```

4. Guarda la skill
5. Vuelve al agente Researcher → editar → en la seccion de Skills asociadas, asigna `notion-publishing-rules`
6. Guarda el agente
7. Lanza una consulta nueva al Researcher y verifica que la traza incluye ahora las verificaciones del workspace antes de crear la pagina

### Resultado esperado

La skill esta creada y el Researcher la usa. Si en una sesion futura creas otro agente que tambien publique en Notion, le asignas la misma skill sin reescribir nada.

---

## Modulo 10 — Projects en claude.ai: la ruta no-code para el mismo problema

**Descripcion breve:** Antes de saltar a AG2, vemos una tercera ruta para resolver el caso de perovskita: 1 Project en claude.ai con su system prompt, sus knowledge files y sus skills. Sin consola dev, sin scripts.

### Contexto

Hasta ahora hemos visto que el mismo problema — investigar perovskita y archivar resultados — se puede atacar con varios niveles de sofisticacion:

- **Multi-agent en Managed Agents** (lo que acabas de construir): tres agentes orquestados, control total via consola dev + API. Requiere ejecutar un script Python para el coordinator y disenar prompts especializados por rol.
- **1 agente + skills en Managed Agents**: variante mas simple del anterior, sin orquestacion pero con la misma consola dev.
- **Projects en claude.ai**: la opcion mas sencilla. No tocas la consola dev. No escribes codigo. Trabajas desde claude.ai con un Project que tiene su system prompt, sus knowledge files y sus skills asociadas.

Para muchos casos reales, la tercera opcion es la mas razonable. Las dos primeras tienen sentido cuando necesitas orquestacion automatizada, integracion programatica con sistemas internos o ejecucion sin un humano en el loop. Si la mision es asistir a un investigador que va a estar conversando con el sistema, claude.ai Projects suele ser suficiente.

### Cuando elegir Projects en claude.ai

- Trabajo investigador con humano en el loop (el usuario ve los borradores, pide afinar)
- No hay requisito de auto-publicar en sistemas externos
- El equipo no es tecnico
- Quieres iterar muy rapido sobre instrucciones y conocimiento base

### Cuando NO elegir Projects (mejor Managed Agents o AG2)

- Necesitas orquestacion entre varios agentes especializados trabajando en paralelo
- Necesitas auto-publicacion en Notion, Drive o sistemas internos con disparo programatico
- Necesitas que el sistema corra sin interaccion humana, en respuesta a eventos

### Resultado esperado

Tienes claras las tres rutas (multi-agent / 1-agente+skills / Projects claude.ai) y cuando aplica cada una. La cuarta — AG2 — viene en los modulos siguientes.

---

## Modulo 11 — Crear el Project Perovskita en claude.ai

**Descripcion breve:** Reconstruimos el caso perovskita en claude.ai como Project, sin orquestacion automatizada.

### Contexto

Vamos a crear un Project en claude.ai que englobe la mision de investigacion de perovskita y le adjuntamos las skills que apliquen. Trabajaremos con el desde el chat de claude.ai como si fuera un asistente especializado.

### Pasos

1. Entra en [claude.ai](https://claude.ai) con la misma cuenta que usas en la consola
2. En el menu lateral busca **Projects** y crea uno nuevo:
   ```
   Name:        Perovskita en ceramica
   Description: Investigacion y seguimiento de la integracion de celdas de perovskita en sustratos ceramicos
   ```
3. En el campo de **Custom instructions** (system prompt del Project) pega una version simplificada del prompt del Researcher (el del modulo 5 de la sesion 1 sirve como base). La parte de "publica en Notion via Zapier" sobra aqui — en este flow el usuario humano decide cuando copiar el resultado a Notion.
4. Sube como **knowledge files** los documentos que tengas del proyecto: informes previos, datos de costes, articulos de referencia, especificaciones tecnicas. Es lo que en el pipeline multi-agente vivia en el almacen de memoria, pero ahora es estatico (lo subes tu).
5. Asocia al Project las skills que apliquen. Algunas observaciones:
   - La `notion-publishing-rules` que creaste en el modulo 9 puede no aplicar aqui si vas a copiar manualmente el output a Notion
   - Si tienes (o creas) una skill de "formato de informe estructurado" o "criterios de evaluacion de fuentes", esas si encajan
   - Segun la version de claude.ai, las Skills se asocian al Project desde su panel propio o estan disponibles a nivel de cuenta. El profesor ensena en directo donde aparece hoy
6. Abre una conversacion nueva en el Project y lanza la misma consulta de los modulos 3 y 7:
   ```
   Investiga el estado del arte de la integracion de celdas de perovskita
   en sustratos ceramicos para el sector de pavimentos. Foco en los ultimos
   18 meses.
   ```
7. Observa como el Project:
   - Usa el system prompt y los knowledge files automaticamente
   - Aplica las skills relevantes sin que se lo pidas (auto-discovery via `description`)
   - Te entrega un informe que tu decides donde copiar

### Comparativa rapida con lo que has hecho antes

| Aspecto              | Multi-agent (modulos 1-7)              | Project en claude.ai (este modulo)        |
|----------------------|----------------------------------------|-------------------------------------------|
| Setup                | Consola dev + script Python            | UI de claude.ai, cero codigo              |
| Orquestacion         | Coordinator delega a 2 subagentes      | No hay — un solo asistente                |
| Persistencia         | Memory store dinamico (el Archivist)   | Knowledge files estaticos (los subes tu)  |
| Publicacion          | Auto a Notion via Zapier               | Manual: copias el output                  |
| Humano en el loop    | Opcional                               | Necesario                                 |
| Iteracion            | Lenta (re-deploy + scripts)            | Rapida (editas el Project y ya)           |

### Resultado esperado

Tienes un Project funcional en claude.ai resolviendo el mismo caso de perovskita desde la opcion mas simple. Has visto el mismo problema atacado desde dos angulos opuestos — esto te da criterio para elegir la herramienta correcta en proximos proyectos.

---

## Modulo 12 — AG2: que es y por que un framework distinto

**Descripcion breve:** Introduccion a AG2 como alternativa a Managed Agents. Cuando merece la pena cada uno.

### Contexto

Managed Agents es la opcion "cloud-first" de Anthropic: defines agentes en su consola, viven en sus servidores, los invocas por API o desde la propia interfaz. Es rapido para arrancar y no necesitas instalar nada local.

AG2 (anteriormente conocido como AutoGen, ahora mantenido por la comunidad bajo el nombre AG2) es lo opuesto: un framework Python open source para construir sistemas multi-agente que corren donde tu decidas — tu portatil, un servidor propio, un contenedor en cloud. Te da control total sobre la conversacion entre agentes, la persistencia, el manejo de errores y las herramientas. A cambio, la curva de entrada es mayor y operas tu propia infra.

### Comparativa rapida

| Dimension              | Managed Agents (Anthropic)                | AG2 (Python framework)                                       |
|------------------------|-------------------------------------------|--------------------------------------------------------------|
| Donde corre            | Cloud de Anthropic                        | Donde tu lo despliegues                                      |
| Setup                  | Consola visual, sin codigo                | Codigo Python, `pip install`                                 |
| Coordinacion           | `multiagent.type=coordinator` via API     | Patrones nativos: GroupChat, Swarm, sequential, nested       |
| Modelos soportados     | Claude (Anthropic)                        | Cualquiera con API compatible: Claude, GPT, Gemini, locales  |
| Control sobre el flujo | Limitado a lo que expone la API           | Total — escribes el flow tu mismo                            |
| Persistencia           | Memory stores nativos                     | Tu eliges: SQLite, Postgres, fichero, vector store           |
| Ideal para             | Equipos no-tecnicos, prototipos rapidos   | Equipos tecnicos, sistemas en produccion, requisitos custom  |

### Cuando elegir cual

- **Empieza por Managed Agents** si tu equipo no es muy tecnico, quieres iterar rapido sobre system prompts y no necesitas integrar con sistemas internos complejos.
- **Pasa a AG2** cuando necesites combinar modelos de distintos providers, ejecutar agentes on-premise por compliance, controlar exactamente la conversacion entre agentes o integrar con un stack Python existente.

No son excluyentes — muchos proyectos arrancan en Managed Agents para validar el caso y migran a AG2 cuando el sistema se vuelve critico.

### Resultado esperado

Tienes claro que AG2 no es "una alternativa mejor" sino una herramienta distinta. La sesion 3 ira entera a AG2 a fondo; hoy solo abrimos la puerta.

---

## Modulo 13 — Instalar AG2 y primer ejemplo

**Descripcion breve:** Hello world: dos agentes AG2 conversando localmente, usando Claude por debajo.

### Contexto

La forma mas rapida de entender AG2 es ver dos agentes intercambiando mensajes. Aqui no construimos pipeline ni herramientas — solo demostramos que el framework funciona en tu maquina y que puedes ejecutar agentes Claude desde Python sin pasar por la consola.

### Pasos

1. Instala AG2 con soporte para Anthropic:
   ```bash
   pip install "ag2[anthropic]"
   ```

2. Crea un fichero `hello_ag2.py`:

```python
from autogen import ConversableAgent

# Configuracion del modelo Claude
llm_config = {
    "config_list": [
        {
            "model": "claude-sonnet-4-6",
            "api_key": "TU_API_KEY_ANTHROPIC",
            "api_type": "anthropic",
        }
    ]
}

# Dos agentes con personalidades opuestas
ceramista = ConversableAgent(
    name="ceramista",
    system_message=(
        "Eres un ingeniero ceramista esceptico sobre nuevas tecnologias. "
        "Haces preguntas tecnicas duras antes de aceptar nada."
    ),
    llm_config=llm_config,
    human_input_mode="NEVER",
)

investigador = ConversableAgent(
    name="investigador",
    system_message=(
        "Eres un investigador de perovskitas. Defiendes con datos la "
        "viabilidad de integrar celdas de perovskita en ceramica."
    ),
    llm_config=llm_config,
    human_input_mode="NEVER",
)

# Iniciar la conversacion
ceramista.initiate_chat(
    investigador,
    message=(
        "Convenceme en menos de 5 turnos de que integrar perovskita en "
        "pavimentos ceramicos es comercialmente viable hoy."
    ),
    max_turns=5,
)
```

3. Ejecuta:
   ```bash
   python hello_ag2.py
   ```

4. Observa la traza: dos agentes hablando entre si, sin que tu intervengas, hasta que se cumple `max_turns=5`

### Resultado esperado

Has visto que AG2 funciona y que puedes orquestar agentes Claude desde Python en menos de 50 lineas. La sesion 3 va a partir de aqui para reconstruir un equivalente del pipeline Researcher / Archivist / Coordinator pero en AG2, comparando ventajas e inconvenientes con la version que has hecho hoy en Managed Agents.

---

## Cierre — Resumen de hoy y puente a la sesion 3

En esta sesion hemos:
- Recapitulado por que la sesion 1 se quedo a medias (tiers de Anthropic)
- Creado los tres agentes y configurado el Coordinator como orquestador via script Python
- Visto en vivo un pipeline multi-agente trabajando de forma coordinada
- Aprendido a extraer comportamiento reutilizable a Skills y como el agente decide cuando usarlas
- Reconstruido el mismo caso en claude.ai como Project, sin codigo ni consola dev
- Abierto la puerta a AG2 como framework alternativo

La sesion 3 (Viernes 22 mayo) ira entera a AG2: reconstruimos el pipeline de hoy con codigo y comparamos las dos aproximaciones lado a lado.
