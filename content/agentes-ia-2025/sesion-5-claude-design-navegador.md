---
id: 5
title: "Claude Design + Claude en el navegador"
date: Viernes 12 junio · 10:00–12:00
objectives:
  - Entender que es Claude Design y sobre que base de conocimiento trabaja
  - Crear el esqueleto de identidad de marca con Claude Design paso a paso
  - Saber como extrapolar los resultados a diferentes piezas y formatos
  - Corregir e iterar la marca generada sin perder coherencia
  - Instalar y configurar la extension de Claude para el navegador
  - Entender que puede y que no puede hacer Claude en el navegador, y sus implicaciones de privacidad
---

## Modulo 1 — Que es Claude Design y sobre que base trabaja

**Descripcion breve:** Explicamos que es Claude Design, de donde saca Claude su conocimiento de diseno y cuales son los limites reales que hay que conocer antes de usarlo.

### Contexto

Claude Design es la herramienta de Anthropic para generar identidades visuales y sistemas de marca usando lenguaje natural. No dibuja logos ni genera imagenes directamente — produce el sistema: la logica de la marca, los valores visuales, la paleta, la tipografia, el tono y la guia que orienta todas las piezas.

Antes de usarla, hay que entender **sobre que base trabaja Claude**. No parte de cero: lleva incorporado un corpus enorme de diseno grafico, branding, teoria del color, tipografia y estrategia de marca acumulado hasta su fecha de entrenamiento. Cuando le pedis "crea la identidad de marca de una ceramica industrial aragonesa", Claude no inventa — sintetiza patrones que ha aprendido de miles de marcas reales, manuales de identidad y principios de diseno.

### Los tres limites que hay que conocer

#### 1. Limite de conocimiento temporal

Claude no sabe lo que ha pasado despues de su fecha de corte de entrenamiento. Las tendencias de diseno de los ultimos meses, los colores de temporada actuales, las fuentes tipograficas recientes — Claude no las tiene. Para trabajo de tendencias actuales, hay que alimentarselas vosotras como parte del briefing.

#### 2. Limite de salida: texto y tokens, no imagenes nativas

Claude Design genera el sistema en texto estructurado: valores HEX, nombres de fuentes, proporciones de uso, guias en prosa. No produce archivos .ai, .svg o imagenes renderizadas. El paso de hacer visible la marca requiere un paso mas: llevar los valores a Figma, a una herramienta de paletas o a un disenador.

**Nota**: algunas versiones de Claude.ai tienen acceso a generacion de imagenes integrada. Si la vuestra lo tiene, podeis pedirle bocetos visuales — pero el sistema de marca (los valores, la logica) siempre viene en texto.

#### 3. Limite de contexto: la conversacion es la memoria

Claude no recuerda conversaciones anteriores entre sesiones a menos que usets Projects en Claude.ai. Si cerráis la pestana, la marca no queda guardada en ningun sistema de Claude — solo en vuestro historial de chat. La practica correcta es exportar el resultado al final de cada sesion de trabajo: copiar el sistema completo en un documento propio.

### Por que esto importa antes de empezar

Conocer los limites no es para desanimaros — es para no frustraros. Claude es extraordinariamente bueno construyendo el sistema y la logica de marca. La ejecucion visual final sigue requiriendo vuestras herramientas de siempre. Lo que cambia es que llegáis a esas herramientas con un sistema coherente ya definido, en lugar de empezar desde el lienzo en blanco.

### Resultado esperado

Entendeis que es Claude Design, sobre que conocimiento trabaja y cuales son los tres limites clave. Listos para crear una marca.

---

## Modulo 2 — Crear el esqueleto de marca con Claude Design

**Descripcion breve:** Workflow paso a paso para crear el esqueleto completo de identidad de marca: desde el briefing inicial hasta tener la guia base.

### Contexto

El error mas comun al usar Claude Design es empezar con "crea una marca para mi empresa". Claude necesita materia prima para producir algo util. Cuanto mas contexto le deis, mas preciso y aprovechable es el resultado.

El esqueleto de marca tiene cinco capas: **posicionamiento** (quienes sois y para quien), **personalidad** (como sonais y como os mostráis), **sistema de color** (paleta primaria y secundaria con logica), **tipografia** (familias y jerarquia) y **voz y tono** (como escribis en cada canal). Claude Design genera las cinco si se lo pedis en el orden correcto.

### El briefing que funciona

Antes de abrir Claude Design, preparad un parrafo corto con estas cinco piezas:

1. **Que hace la empresa**: sector, producto o servicio principal
2. **A quien se dirige**: perfil del cliente en terminos actitudinales, no demograficos ("compradores que priorizan durabilidad sobre precio", no "hombres de 35-55")
3. **Como quereis que os perciban**: tres adjetivos maximos, ordenados por prioridad
4. **Que no sois**: una o dos cosas que definitivamente no encajan con vosotras
5. **Referencias visuales**: dos o tres marcas que os gustan aunque sean de otro sector, con una frase de por que

### El flujo en cuatro pasos

**Paso 1 — Posicionamiento y personalidad**

Empezáis siempre por aqui. La personalidad es la base — si esta mal, todo lo que venga encima tambien lo estara.

```text
A partir de este briefing, define el posicionamiento de marca y los cinco atributos de personalidad que deben guiar toda la identidad visual y verbal. Para cada atributo, explica como se traduce visualmente y verbalmente en piezas concretas.

[Pegar el briefing aqui]
```

Revisad la respuesta. Si algun atributo no resuena, corregidlo antes de seguir. No paseis al paso 2 hasta que la personalidad sea la vuestra.

**Paso 2 — Sistema de color**

```text
Basandote en el posicionamiento y la personalidad que acabamos de definir, propón el sistema de color de la marca: color primario, color secundario, color de acento y color neutro. Para cada uno indica el valor HEX, el valor RGB y la logica de por que encaja con la personalidad. Incluye tambien las proporciones de uso recomendadas.
```

**Paso 3 — Tipografia**

```text
Propón el sistema tipografico de la marca. Necesito una fuente para titulares, una para cuerpo de texto y, si lo ves necesario, una tercera para elementos de acento. Para cada fuente: nombre, donde encontrarla (preferiblemente Google Fonts, libre de uso comercial), y para que contextos exactos usarla. Explica la relacion entre las fuentes elegidas y la personalidad de marca.
```

**Paso 4 — Voz y tono**

```text
Define la voz de marca: como habla esta empresa. Incluye: tres principios de escritura, el tono en cada canal principal (redes sociales, email comercial, web, atencion al cliente), palabras y expresiones que SI usamos, palabras y expresiones que NUNCA usamos, y dos ejemplos de mensaje: uno bien escrito segun la voz definida y uno mal escrito.
```

### Cuanto tiempo lleva

Con un briefing ya preparado, los cuatro pasos se completan en 20-30 minutos. El tiempo real es el de revision y correccion — que es el tema del modulo siguiente.

### Resultado esperado

Teneis el esqueleto completo: posicionamiento, cinco atributos de personalidad, paleta con valores HEX, sistema tipografico y guia de voz y tono. Todo en texto estructurado listo para usar.

---

## Modulo 3 — Extrapolar los resultados a otras piezas

**Descripcion breve:** Como aplicar el esqueleto de marca generado a piezas concretas: presentaciones, redes sociales, materiales de venta y web.

### Contexto

El esqueleto es el mapa. La extrapolacion es usarlo. Una vez teneis la marca definida, Claude puede generar piezas especificas que la respetan — pero solo si le dais el sistema como contexto en cada nueva peticion.

La clave es el **handoff**: copiar el sistema de marca completo al inicio de cada conversacion nueva, o trabajar dentro de un Project de Claude.ai donde el contexto persiste automaticamente. Sin ese handoff, Claude no sabe que marca estais usando y os entrega algo generico.

### El handoff correcto

Al iniciar cualquier sesion de extrapolacion:

```text
Vamos a crear piezas de comunicacion para esta marca. El sistema de marca es el siguiente:

[Pegar aqui posicionamiento, personalidad, paleta y tipografia]

A partir de este sistema, necesito que crees: [lo que necesiteis]
```

### Piezas que Claude extrapola bien

**Plantilla de presentacion corporativa**

```text
Con este sistema de marca, define la estructura visual de una presentacion corporativa: colores de fondo para portada, diapositiva de contenido y diapositiva de cierre; colores de texto segun jerarquia titular/cuerpo/pie; estilo de graficos y tablas; y recomendaciones de uso de imagenes. Entrega las instrucciones como si se las dieras a un disenador que no conoce la marca.
```

**Bio y descripciones para redes sociales**

```text
Escribe la bio de LinkedIn, la bio de Instagram y la meta description de la web para esta empresa, siguiendo la voz y tono definida. Maximo 160 caracteres para Instagram, 220 para LinkedIn, 155 para la meta description.
```

**Email de primer contacto comercial**

```text
Escribe un email comercial de primer contacto siguiendo la voz de marca. El objetivo es conseguir una reunion de 20 minutos. Asunto, cuerpo y firma. Sin exclamaciones, sin presion de cierre forzada, con el tono que corresponde segun la guia de voz.
```

**Mensajes clave para la web**

```text
A partir del posicionamiento y la voz de marca, escribe: el headline principal de la homepage, el subheadline, el CTA principal y los tres mensajes de beneficio de la pagina de producto o servicio.
```

### Lo que Claude no extrapola bien solo

- **Disenar layouts visuales**: puede describir la estructura, no ejecutarla como archivo
- **Elegir fotografias especificas**: puede definir el estilo fotografico que encaja, no seleccionar imagenes concretas
- **Adaptar a formatos con restricciones tecnicas muy especificas**: si necesitais algo para un formato de embalaje o un soporte publicitario con medidas exactas, dadle esas restricciones antes de pedir

### Resultado esperado

Sabeis como hacer el handoff del sistema de marca para extrapolarlo a cualquier pieza, y conoceis que pide Claude bien y donde necesita mas guia vuestra.

---

## Modulo 4 — Corregir e iterar la marca creada

**Descripcion breve:** Como trabajar el ciclo de correccion con Claude Design sin perder coherencia: que corregir, como pedirlo y cuando empezar de cero.

### Contexto

La primera respuesta de Claude raramente es la definitiva. La marca que os entrega es una hipotesis bien fundamentada — vuestro trabajo es ajustarla hasta que sea vuestra. Saber pedir correcciones es tan importante como saber hacer el briefing inicial.

### Tres tipos de correccion y como pedirlas

#### 1. Correccion puntual — un elemento no encaja

Cuando un color, una fuente o un atributo no os convence pero el resto si:

```text
El color secundario [#valor] se siente demasiado frio para el sector. Mantén el resto de la paleta y propón tres alternativas de color secundario que sean mas calidos pero que sigan funcionando con el primario [#valor]. Para cada alternativa explica por que encaja con la personalidad de marca.
```

La clave: sed especificas sobre QUE no os gusta y por QUE. "No me gusta" no da a Claude con que trabajar. "Se siente demasiado corporativo para una marca que quiere parecer cercana" le da la direccion correcta.

#### 2. Correccion de tono — la direccion general no es la correcta

Cuando el sistema entero va en una direccion que no es la vuestra:

```text
El sistema que hemos definido se percibe [demasiado premium / demasiado casual / demasiado tecnico]. Esta empresa tiene que comunicar [adjetivo] por encima de todo. Revisemos el sistema completo desde esa prioridad: que cambiaria en la paleta, en la tipografia y en la voz para enfatizar esa cualidad sin perder la coherencia del resto.
```

#### 3. Correccion por contraste — mostrar lo que no quereis

A veces es mas facil decir lo que no que lo que si:

```text
Esta marca no debe parecerse en ningun caso a [referencia negativa] ni a [referencia negativa 2]. Teniendo en cuenta la personalidad definida, identifica en el sistema actual los elementos que mas se acercan a esas referencias y propón alternativas.
```

### Cuando empezar de cero

Si tras tres rondas de correccion el sistema sigue sin convenceros, no seguís iterando — empezais de cero con un briefing mejor. El problema casi siempre esta en el briefing original, no en Claude. Las senales de que hay que rehacerlo:

- No podeis describir en una frase por que el resultado no funciona
- Cada correccion genera un nuevo problema en otro elemento
- El sistema no tiene coherencia interna: la paleta no casa con la tipografia, o la voz contradice la personalidad

### El error mas comun en la correccion

Pedir cambios esteticos sin anclarlos a la personalidad. "Quiero algo mas moderno" no le dice a Claude nada util. "Quiero que se perciba como una empresa que lleva diez anos en el sector pero que no ha perdido la capacidad de innovar, y el sistema actual parece demasiado conservador para eso" — eso si es accionable.

### Resultado esperado

Sabeis como pedir correcciones especificas, como trabajar el ciclo de iteracion y cuando es mas eficiente empezar de nuevo que seguir ajustando.

---

## Modulo 5 — La extension de Claude para el navegador

**Descripcion breve:** Que es la extension de Claude para el navegador, como se instala y que puede hacer cuando esta activa.

### Contexto

La extension de Claude para el navegador lleva Claude directamente a vuestro flujo de trabajo en la web. En lugar de abrir una pestana separada de claude.ai, podeis invocar a Claude sin salir de la pagina en la que estais: mientras leis un articulo, revisais un documento online, trabajais en una plataforma o navegais por cualquier web.

La extension funciona como un panel lateral que se activa cuando vosotras quereis. No esta activa de fondo de forma permanente — se invoca con un clic o con un atajo de teclado.

### Instalacion

1. Abrir la Chrome Web Store (o la tienda de extensiones de vuestro navegador)
2. Buscar "Claude" de Anthropic — verificad que el autor es Anthropic, no un tercero
3. Añadir la extension
4. En el primer uso: iniciar sesion con la cuenta de Claude.ai que ya teneis

La extension esta disponible para Chrome y Edge principalmente. En dispositivos moviles el acceso es a traves de la app de Claude directamente.

### Que puede hacer la extension

**Leer el contenido de la pagina actual**

Podeis pedirle a Claude que lea lo que estais viendo: un articulo largo, los terminos y condiciones de un servicio, una oferta de trabajo, un informe en PDF abierto en el navegador. Claude analiza el texto visible de la pagina y responde preguntas sobre el.

Ejemplos de uso inmediato:

- "Resume este articulo en cinco puntos clave"
- "Que clausulas de estos terminos me afectan si soy usuario europeo"
- "Hay contradicciones en este informe de resultados"
- "Traduce este contrato al espanol y senala los puntos que deberia revisar con un abogado"

**Trabajar con texto seleccionado**

Seleccionais texto en cualquier pagina y le pedis a Claude que haga algo con el: mejorarlo, traducirlo, explicarlo, convertirlo en un email, resumirlo.

**Generar contenido en contexto**

Podeis pedirle a Claude que escriba algo teniendo en cuenta lo que estais mirando: un email de respuesta a un mensaje que estais leyendo, un comentario para una publicacion que teneis abierta, una propuesta basada en un brief que estais revisando.

### Resultado esperado

Teneis la extension instalada y habeis probado al menos una consulta con contenido de una pagina real. Entendeis la diferencia entre tener Claude abierto en otra pestana y tenerlo integrado en el navegador.

---

## Modulo 6 — Potencial, riesgos y que no puede hacer la extension

**Descripcion breve:** Evaluacion realista de la extension: que da de verdad, donde no funciona y que implicaciones de privacidad hay que conocer antes de usarla en entornos profesionales.

### Contexto

La extension de Claude tiene un potencial real y bien definido. Pero como cualquier herramienta que accede a lo que veis en pantalla, tiene implicaciones que hay que entender antes de usarla en contextos sensibles. Esta sesion os da las herramientas para tomar esa decision de forma informada.

### Donde da resultado de verdad

**Velocidad en tareas repetitivas de texto**

Revisar documentos, resumir contenido, reescribir borradores, traducir — estas tareas que antes requerían abrir otra herramienta o copiar y pegar entre ventanas ahora se hacen en el mismo flujo. Para perfiles que leen y escriben mucho (comunicacion, ventas, recursos humanos, legal, compras), el ahorro de friccion es real y acumulativo.

**Analisis de paginas complejas**

Webs con mucho contenido, informes online, tablas de datos en plataformas — Claude puede ayudar a extraer lo relevante sin que tengais que leerlo todo manualmente.

**Onboarding en plataformas nuevas**

Cuando entrais en una plataforma que no conoceis (un CRM nuevo, una herramienta de gestion, una plataforma de compras electronica), podeis pedirle a Claude que os explique lo que estais viendo directamente en esa pagina, sin salir de ella.

### Los limites reales

**No actua en la pagina — solo lee y responde**

La extension de Claude no puede hacer clic, no puede rellenar formularios, no puede navegar a otra pagina por vosotras. Lee el contenido visible y genera texto. Si quereis un agente que tome acciones en el navegador por vosotras, eso es una capacidad diferente — Computer Use — que requiere configuracion separada y tiene sus propias limitaciones.

**No funciona en todo el contenido**

Aplicaciones web complejas (Google Docs en modo edicion, algunas aplicaciones SaaS), contenido dentro de iframes y webs con protecciones especificas contra lectura automatizada pueden no ser accesibles para la extension. Si la extension os dice que no puede leer la pagina, es uno de estos casos.

**Memoria limitada por sesion**

La extension no recuerda conversaciones anteriores a menos que tengais Projects sincronizados. Cada activacion es una sesion nueva.

### Las implicaciones de privacidad que hay que conocer

**Que datos ve Claude cuando leis una pagina**

Cuando pedís a Claude que lea la pagina actual, el contenido visible de esa pagina se envia a los servidores de Anthropic para procesar la respuesta. Esto incluye el texto — no las imagenes renderizadas ni los videos, pero si el texto que aparece en pantalla.

**Lo que esto significa segun el tipo de pagina:**

- **Paginas publicas**: sin riesgo especifico. Claude lee lo que cualquier persona veria navegando
- **Plataformas con informacion de clientes**: si teneis abierto vuestro CRM con una ficha de cliente y le pedís a Claude que la analice, los datos de ese cliente estan siendo enviados a Anthropic. Revisad si vuestra empresa tiene politica sobre el uso de IA con datos de terceros
- **Documentos internos abiertos en el navegador**: si abrís un contrato o un informe interno y le pedís a Claude que lo analice, ese contenido va a Anthropic. Para muchas empresas esto no es compatible con sus politicas de confidencialidad sin revisar antes los terminos de uso de Anthropic y si tienen un acuerdo empresarial (plan Enterprise)
- **Credenciales y datos sensibles**: nunca pidáis a Claude que lea una pagina que tenga contrasenas visibles, numeros de tarjeta o datos de salud

### La regla practica para entornos profesionales

Antes de usar la extension en cualquier pagina con informacion que no es publica, haceos esta pregunta: **¿estaria comodo si este contenido apareciera en los registros de un proveedor de IA externo?** Si la respuesta es no, no useis la extension en esa pagina. Usad claude.ai con copia manual del texto que querais analizar — el nivel de exposicion de datos es el mismo, pero la decision es consciente y deliberada.

### Cuando tiene mas sentido NO usar la extension

- Plataformas internas con datos de empleados o clientes
- Documentos marcados como confidenciales por vuestra empresa
- Procesos de facturacion, pagos o gestion de credenciales
- Paginas de sesion activa donde aparecen tokens o datos de autenticacion visibles

### Por que merece la pena a pesar de todo

El riesgo real no es la extension — es no saber cuando usarla. Una vez que teneis claro el perimetro (paginas publicas y contenido que ya seria compartible con un proveedor externo), la extension elimina una cantidad importante de friccion cotidiana. El problema historico con las herramientas de IA no ha sido el riesgo inherente sino el uso sin criterio. Vosotras ya teneis el criterio.

### Resultado esperado

Teneis una evaluacion clara de cuando la extension aporta y cuando no es la herramienta correcta. Sabeis que datos se comparten al usarla y podeis tomar una decision informada sobre como integrarla en vuestro contexto profesional.

---

## Cierre — Resumen de hoy y puente a la sesion 6

En esta sesion hemos:

- Entendido que es Claude Design y sobre que base de conocimiento trabaja: su corpus de diseno, sus limites temporales y su modo de salida en texto y tokens, no en imagenes nativas
- Creado el esqueleto de marca completo siguiendo el flujo de cuatro pasos: posicionamiento y personalidad, paleta con valores HEX, sistema tipografico y guia de voz y tono
- Aprendido como extrapolar los resultados a piezas concretas con el handoff correcto al inicio de cada nueva sesion
- Trabajado el ciclo de correccion: como pedir cambios puntuales, de tono o por contraste, y cuando es mas eficiente empezar de nuevo que seguir ajustando
- Instalado la extension de Claude para el navegador y entendido que puede hacer: leer paginas, trabajar con texto seleccionado, generar contenido en contexto
- Evaluado sus limites reales (no actua, solo lee) y sus implicaciones de privacidad para entornos profesionales

La sesion 6 entra en los agentes de Google: Gemini Enterprise y como se compara con lo que habeis construido con Claude. Veremos donde cada plataforma tiene ventaja real y como elegir la herramienta segun el caso de uso.
