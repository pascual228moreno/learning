---
id: 2
title: Claude Managed Agents e inicio AG2
date: Martes 19 mayo · 10:00–12:00
objectives:
  - Entender las tres capas que componen un agente moderno: connectors, tools y skills
  - Crear una Skill propia en la consola y disenar su `description` para que el agente la cargue cuando aplique
  - Crear los agentes Researcher, Archivist y Coordinator usando skills desde el inicio
  - Configurar el Coordinator como orquestador real mediante el script Python
  - Reconstruir el mismo caso en claude.ai como Project, sin codigo
  - Conocer AG2 como framework alternativo a Managed Agents y ejecutar un primer hello-world
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

## Modulo 2 — Las tres capas de un agente: connectors, tools y skills

**Descripcion breve:** Antes de crear nada hoy, distinguimos los tres conceptos que se confunden con facilidad. Esto marca como vamos a montar el Researcher de forma limpia.

### Contexto

Un agente en Managed Agents combina tres tipos de pieza, y conviene tenerlos separados mentalmente:

#### 1. Connectors / MCP (a nivel de cuenta)
Lo que configuraste en la sesion 1: `exa` y `zapier` registrados en la consola. Son **fuentes de herramientas externas**. Existen una vez por cuenta y no llaman a nada por si solas. Cualquiera de tus agentes puede usarlos si se los conectas.

#### 2. Tools del agente (a nivel de agente)
Cuando creas un agente, eliges que connectors atar. A partir de ahi, ese agente concreto **puede llamar** a search Exa o a actions Zapier. El Archivist tendra solo el memory store, asi que no podra llamar a Exa ni a Zapier — son decisiones de alcance por agente.

#### 3. Skills del agente (a nivel de agente, opcional)
Una skill es **un bloque de instrucciones en Markdown**. No llama a nada. No es un step de un pipeline. Cuando se la asocias al agente, el agente solo ve dos cosas de ella: su `name` y su `description`. El cuerpo entra en su contexto **cuando el agente decide cargarla**, en funcion de la `description`.

### Como conviven en una ejecucion real

Cuando le pides al Researcher "investiga la perovskita y publica en Notion":

1. El agente lee su system prompt (su mision, su workflow)
2. Decide hacer busquedas → llama a la **tool** de Exa
3. Recibe resultados, sintetiza el informe
4. Va a publicar en Notion → ve que tiene una skill cuya `description` dice "aplica cuando vayas a publicar en Notion via Zapier" → **carga el cuerpo** de esa skill como instrucciones extra
5. Con esas instrucciones, llama a las actions de Zapier siguiendo las reglas (descubrir workspace, evitar tablas, partir paginas largas)
6. Devuelve el resultado

**La skill no llama a Zapier. El agente llama a Zapier. La skill solo le dice como hacerlo bien.**

### Por que esto cambia como vamos a montar el Researcher

En la sesion 1 disenamos dos versiones del prompt del Researcher:
- **Version base** — corta, solo identidad + workflow. Asume que el agente "se las apana" con Notion.
- **Version definitiva** — larga, con todas las reglas operativas de Notion/Zapier dentro.

Hoy vamos a tomar un tercer camino, mas limpio: **prompt version base + las reglas operativas extraidas a una skill independiente**. El resultado funcional es equivalente al prompt definitivo, pero ahora las reglas de Notion viven en un sitio y son reutilizables por cualquier otro agente que las necesite manana.

### Como decide el agente que skill usar

Lo no obvio: **no le dices al agente "usa esta skill ahora"**. Las skills funcionan por auto-descubrimiento. Por eso **la `description` no describe lo que la skill hace, describe cuando aplica**. Compara:

- ❌ Mal: "Reglas para publicar en Notion" (describe el contenido)
- ✅ Bien: "Aplica cuando vayas a crear paginas en Notion via Zapier — evita errores recurrentes de formato y limites de bloques" (describe el trigger)

Si la `description` esta bien escrita, el agente carga la skill exactamente cuando hace falta. Si esta mal escrita, o el agente la ignora cuando deberia usarla, o la carga sin necesidad y gasta tokens.

### Resultado esperado

Tienes claras las tres capas y sabes por que vamos a crear primero la skill y despues el Researcher con la skill ya atada, en vez de embutir todas las reglas en el prompt.

---

## Modulo 3 — Crear la skill notion-publishing-rules

**Descripcion breve:** Creamos la skill que recoge las reglas operativas de publicar en Notion via Zapier — la asociaremos al Researcher cuando lo creemos en el modulo siguiente.

### Contexto

Estas reglas son las que aparecen en el YAML "version definitiva" del modulo 5 de la sesion 1, integradas dentro del system prompt. Las sacamos de ahi y las dejamos como una skill independiente.

### Pasos

1. En la consola, ve a la seccion de **Skills** dentro de Agents
2. Crea una skill nueva con estos datos (fijate en la `description` — describe cuando se activa, no que contiene):
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

### Cuando extraer a Skill y cuando dejar en system prompt

- **Deja en system prompt** lo que define la identidad del agente (su mision, tono, restricciones) y lo que solo aplica a el.
- **Extrae a Skill** lo que es conocimiento operativo reutilizable: integraciones con herramientas externas, plantillas de output, protocolos de error.

Las reglas de Notion son reutilizables — manana puede que crees otro agente que publique en Notion para otra mision distinta y esta skill le servira tal cual. Por eso van fuera del prompt.

### Resultado esperado

La skill esta creada en la consola. Lista para asociarse al Researcher en el modulo siguiente.

---

## Modulo 4 — Crear el agente Researcher con la skill atada

**Descripcion breve:** Creamos el Researcher con un prompt lean (solo identidad + workflow) y le atamos la skill que creaste en el modulo anterior.

### Contexto

Vamos a usar la **version base** del system prompt del modulo 5 de la sesion 1, no la definitiva. La diferencia es que la base no incluye las reglas de Notion — esas viajan ahora en la skill. El resultado funcional es equivalente al de la version definitiva, pero el prompt es la mitad de largo y las reglas se pueden reutilizar en otros agentes.

### Pasos

1. En la consola, **Agents → Create agent**
2. Rellena los campos basicos:
   ```
   Name:        Perovskite Researcher
   Model:       claude-sonnet-4-6
   Speed:       standard
   Description: Investigador tecnico para integracion de celdas solares en ceramica
   ```
3. Pega el system prompt **version base** del modulo 5 de la sesion 1:

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

Fijate que el paso 4 solo dice "Publica el informe en Notion usando Zapier" — el **como** vive en la skill.

4. En **Tools / Connections**:
   - Marca **exa** y **zapier**
   - Activa el **agent toolset** (permitira que el Coordinator lo invoque despues)

5. En **Skills** del agente, asocia la skill `notion-publishing-rules` que creaste en el modulo 3

6. **Save** y copia el ID del agente — apuntalo en la tabla que aparece al final del modulo 7

### Resultado esperado

El Researcher esta creado con un prompt lean + skill atada. Tienes su ID anotado.

---

## Modulo 5 — Probar el Researcher y verificar que la skill se carga

**Descripcion breve:** Lanzamos al Researcher con una consulta real y comprobamos que carga la skill cuando le toca publicar en Notion.

### Contexto

Esta es la prueba de fuego de la `description` de la skill. Si esta bien escrita, el agente la carga cuando intenta publicar en Notion. Si no la carga, hay que mejorar la `description`.

### Pasos

1. Abre el agente Researcher
2. Inicia una nueva sesion y lanza:
   ```
   Investiga el estado del arte de la integracion de celdas de perovskita
   en sustratos ceramicos para el sector de pavimentos. Foco en los ultimos 18 meses.
   ```
3. Observa la traza con atencion:
   - Lanza busquedas con Exa?
   - Estructura el informe con las secciones definidas?
   - Cuando empieza la fase de publicacion en Notion, **carga la skill `notion-publishing-rules`**? Suele aparecer un evento tipo "skill loaded" en la traza
   - Sigue los pasos de la skill: descubrir workspace, evitar tablas, partir paginas si es largo?

### Si la skill NO se carga cuando deberia

Vuelve a la skill y reescribe su `description`. Aclara explicitamente cuando aplica. Ejemplo de iteracion:

- Inicial: "Aplica cuando vayas a crear paginas en Notion via Zapier"
- Mejor: "Aplica siempre que el agente vaya a llamar a una accion de Zapier sobre Notion (crear pagina, actualizar contenido, anadir bloques) — define el protocolo correcto para evitar errores de validacion"

Vuelve a lanzar al Researcher y verifica.

### Resultado esperado

El Researcher publica en Notion siguiendo las reglas de la skill, o iteras la `description` hasta que lo haga. Has visto en vivo el ciclo de feedback que define el trabajo con skills.

---

## Modulo 6 — Crear el agente Archivist

**Descripcion breve:** Creamos el agente que solo archiva: sin internet, solo memoria.

### Contexto

El system prompt y los YAML estan en el modulo 7 de la sesion 1. Aqui solo ejecutamos la creacion. El Archivist no necesita skills hoy — su funcion es lo bastante acotada como para vivir entera en su system prompt. Si manana aparece comportamiento reutilizable (por ejemplo, "como deduplicar entradas en el memory store"), entonces lo extraeriamos a una skill.

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

## Modulo 7 — Crear el agente Coordinator

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

| Agente o recurso          | ID |
|---------------------------|----|
| Skill notion-publishing-rules |   |
| Researcher                |    |
| Archivist                 |    |
| Coordinator               |    |
| Almacen de memoria        |    |

### Resultado esperado

Los tres agentes existen y tienes anotados los IDs de skill, agentes y memory store.

---

## Modulo 8 — Configurar el Coordinator como orquestador

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

## Modulo 9 — Probar el pipeline coordinado

**Descripcion breve:** Lanzamos la misma consulta del modulo 5 pero ahora desde el Coordinator, y verificamos que los tres agentes trabajan como un equipo.

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
   - El Researcher carga la skill `notion-publishing-rules` cuando le toca publicar?
   - El Coordinator espera al resultado y lo pasa al Archivist?
   - El Archivist confirma que ha guardado en `/perovskitas/...`?
4. Si alguna parte falla, lee el output completo y anota la incidencia

### Resultado esperado

El pipeline funciona end-to-end: Coordinator delega → Researcher investiga + carga skill + publica en Notion → Archivist guarda en memoria. Acabas de construir tu primer sistema multi-agente real en Managed Agents, con skills bien factorizadas.

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
3. En el campo de **Custom instructions** (system prompt del Project) pega una version simplificada del prompt del Researcher (el del modulo 4 de esta sesion sirve como base). La parte de "publica en Notion via Zapier" sobra aqui — en este flow el usuario humano decide cuando copiar el resultado a Notion.
4. Sube como **knowledge files** los documentos que tengas del proyecto: informes previos, datos de costes, articulos de referencia, especificaciones tecnicas. Es lo que en el pipeline multi-agente vivia en el almacen de memoria, pero ahora es estatico (lo subes tu).
5. Asocia al Project las skills que apliquen. Algunas observaciones:
   - La `notion-publishing-rules` puede no aplicar aqui si vas a copiar manualmente el output a Notion
   - Si tienes (o creas) una skill de "formato de informe estructurado" o "criterios de evaluacion de fuentes", esas si encajan
   - Segun la version de claude.ai, las Skills se asocian al Project desde su panel propio o estan disponibles a nivel de cuenta. El profesor ensena en directo donde aparece hoy
6. Abre una conversacion nueva en el Project y lanza la misma consulta de los modulos 5 y 9:
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

| Aspecto              | Multi-agent (modulos 1-9)              | Project en claude.ai (este modulo)        |
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
- Distinguido las tres capas: connectors, tools y skills
- Creado una skill independiente y aprendido a disenar su `description` para auto-discovery
- Creado los tres agentes con prompts lean y la skill atada desde el primer momento
- Configurado el Coordinator como orquestador via script Python
- Visto en vivo un pipeline multi-agente coordinado, con skills cargandose cuando aplican
- Reconstruido el mismo caso en claude.ai como Project, sin codigo ni consola dev
- Abierto la puerta a AG2 como framework alternativo

La sesion 3 (Viernes 22 mayo) ira entera a AG2: reconstruimos el pipeline de hoy con codigo y comparamos las dos aproximaciones lado a lado.
