AUDITORÍA FORENSE ULTRAEXHAUSTIVA DEL SISTEMA COMPLETO DE NAVEGACIÓN — JUEGO ASCENSIÓN

Actúa como un ingeniero de software senior especializado en React/JavaScript, arquitectura de aplicaciones complejas, sistemas de navegación, gestión de estado, debugging avanzado, análisis forense de bugs intermitentes, condiciones de carrera, operaciones asíncronas, interfaces interactivas y auditorías de codebases completas.

Estás trabajando sobre el proyecto:

JUEGO ASCENSIÓN

Tu misión es realizar una AUDITORÍA FORENSE, PROFUNDA, SISTÉMICA, EXHAUSTIVA Y NO SUPERFICIAL de TODO el sistema de navegación e interacción del juego.

============================================================
1. PROBLEMA PRINCIPAL QUE DEBES INVESTIGAR
============================================================

Existe un problema intermitente que aparece en numerosas partes del juego.

En ocasiones entro en una sección, menú o pantalla y todo funciona correctamente.

Sin embargo, otras veces, aparentemente de forma aleatoria, al pulsar una determinada tarjeta, botón, opción o elemento de navegación, se abre OTRA PANTALLA diferente de la que debería abrirse.

Ejemplo conceptual:

Tarjeta A
→ normalmente → Pantalla A

Pero ocasionalmente:

Tarjeta A
→ Pantalla B

Posteriormente, sin que aparentemente se haya modificado nada:

Tarjeta A
→ vuelve a abrir Pantalla A

El comportamiento NO parece ser un error estático del enlace.

Si una tarjeta tuviera permanentemente configurado el destino equivocado, fallaría siempre.

Aquí el problema es INTERMITENTE, CONTEXTUAL Y/O NO DETERMINISTA.

Por tanto, NO quiero que simplemente busques "qué botón apunta a qué pantalla".

Quiero que investigues POR QUÉ una misma interacción puede producir diferentes destinos dependiendo del estado previo de la aplicación, del orden de navegación, de renders, de operaciones asíncronas, de eventos, de efectos, de componentes montados, de estados antiguos o de cualquier otra circunstancia.

El objetivo prioritario es encontrar la CAUSA RAÍZ.

============================================================
2. REGLA FUNDAMENTAL: PRIMERO AUDITAR, DESPUÉS MODIFICAR
============================================================

NO empieces modificando el código.

NO hagas parches preventivos.

NO cambies handlers "por si acaso".

NO sustituyas componentes sin demostrar previamente el problema.

NO des por hecho que el problema está en React Router.

NO des por hecho que está en un onClick.

NO des por hecho que está en un estado concreto.

NO des por hecho que se trata de un problema de doble click.

Primero realiza una auditoría completa.

Debes:

1. Inspeccionar la arquitectura.
2. Localizar todo el sistema de navegación.
3. Reconstruir los flujos.
4. Identificar todas las fuentes que pueden cambiar de pantalla.
5. Identificar todas las fuentes de estado relacionadas con navegación.
6. Identificar todas las funciones que modifican navegación.
7. Analizar eventos.
8. Analizar efectos.
9. Analizar operaciones asíncronas.
10. Analizar componentes reutilizados.
11. Analizar rutas.
12. Analizar configuraciones dinámicas.
13. Analizar posibles condiciones de carrera.
14. Analizar posibles estados obsoletos.
15. Analizar suscripciones.
16. Analizar timers.
17. Analizar overlays.
18. Analizar fallbacks.
19. Analizar navegación indirecta.
20. Analizar Git y cambios recientes cuando sea posible.
21. Ejecutar tests y pruebas de reproducción si puedes hacerlo.

Primero quiero DIAGNÓSTICO Y EVIDENCIA.

Después, y solamente después de comprender suficientemente la causa, podrás proponer y/o aplicar las correcciones necesarias.

============================================================
3. ALCANCE DE LA AUDITORÍA
============================================================

No limites la auditoría a un archivo.

No limites la auditoría a los componentes que actualmente parecen relacionados con el problema.

Analiza todo aquello que pueda directa o indirectamente influir en la navegación.

Incluye, como mínimo:

- App principal.
- Componentes raíz.
- Layouts.
- GameViewports.
- gameNavigation.
- Menús.
- Tarjetas.
- Botones.
- Paneles.
- Modales.
- Submenús.
- Pantallas.
- Secciones.
- Vistas.
- Navegación entre módulos.
- Navegación entre planetas.
- Navegación entre secciones.
- Navegación entre pantallas.
- Alto Mando.
- Lonjas Galácticas.
- Ministerios.
- Finanzas.
- Banca.
- Investigaciones.
- Cualquier otro módulo del juego.
- Estados globales.
- Contextos.
- Stores.
- Reducers.
- Hooks.
- Callbacks.
- Effects.
- Refs.
- Listeners.
- Event emitters.
- Suscripciones.
- Timers.
- Navegación programática.
- Rutas.
- Fallbacks.
- Redirects.
- Componentes dinámicos.
- Configuraciones de navegación.
- Arrays de tarjetas.
- Objetos de configuración.
- Mapas de componentes.
- Diccionarios de vistas.
- Factories.
- Sistemas de selección.

Realiza búsqueda semántica por todo el proyecto.

No te limites a buscar nombres concretos.

============================================================
4. RECONSTRUIR LA ARQUITECTURA REAL DE NAVEGACIÓN
============================================================

Determina exactamente:

- Quién decide qué pantalla se muestra.
- Qué estado representa la pantalla actual.
- Qué función cambia ese estado.
- Qué componente interpreta ese estado.
- Qué otros estados influyen.
- Qué efectos reaccionan.
- Qué componentes pueden sobrescribirlo.
- Qué rutas existen.
- Qué fallbacks existen.
- Qué navegación indirecta existe.

Reconstruye este flujo:

INTERACCIÓN DEL USUARIO
↓
EVENTO
↓
HANDLER
↓
FUNCIÓN DE NAVEGACIÓN
↓
CAMBIO DE ESTADO / RUTA
↓
RENDER
↓
COMPONENTE DESTINO
↓
EFECTOS POSTERIORES
↓
POSIBLES REDIRECCIONES
↓
PANTALLA FINAL

Quiero saber exactamente dónde puede aparecer una divergencia.

============================================================
5. MAPA COMPLETO DE NAVEGACIÓN
============================================================

Reconstruye el mapa de navegación completo del juego.

Para cada elemento navegable identifica:

- Nombre visible.
- Componente.
- Archivo.
- Handler.
- ID.
- Key.
- Target.
- Ruta.
- Estado que modifica.
- Componente destino.
- Posibles efectos posteriores.
- Posibles navegaciones secundarias.

Quiero especialmente detectar:

ELEMENTO A
→ TARGET A

pero en determinadas condiciones:

ELEMENTO A
→ TARGET B

Si existe esta posibilidad, identifica exactamente qué mecanismo la permite.

============================================================
6. AUDITORÍA DE FUNCIONES DE NAVEGACIÓN
============================================================

Localiza TODAS las funciones relacionadas con:

- navigate
- goTo
- open
- setScreen
- setView
- setSection
- setPanel
- setActive
- select
- changeScreen
- changeView
- show
- openPanel
- openMenu
- navigation
- route
- redirect

No importa cómo se llamen realmente.

Para cada función determina:

- dónde se define;
- quién la llama;
- qué parámetros recibe;
- qué estado modifica;
- qué componente depende de ella;
- si puede recibir valores incorrectos;
- si puede ejecutarse varias veces;
- si puede ejecutarse desde efectos;
- si puede ejecutarse después de operaciones asíncronas;
- si puede ejecutarse cuando el componente ya no está montado;
- si puede competir con otra navegación.

============================================================
7. MÚLTIPLES FUENTES DE VERDAD
============================================================

Investiga si existen varios estados que representen simultáneamente la navegación.

Por ejemplo:

currentScreen
activeSection
selectedPanel
activeMenu
currentView
selectedCard
navigationTarget
modalView
subView

Si existen varios, determina si pueden entrar en conflicto.

Ejemplo:

currentScreen = A
activeSection = B
selectedPanel = C

y diferentes componentes interpretan esos valores de forma diferente.

Determina si existe una única fuente de verdad o múltiples fuentes potencialmente contradictorias.

============================================================
8. CONDICIONES DE CARRERA
============================================================

Este apartado es PRIORITARIO.

Busca situaciones donde dos operaciones puedan modificar navegación casi simultáneamente.

Ejemplo:

Usuario pulsa A
↓
se solicita navegación A
↓
se actualiza un estado
↓
un useEffect detecta el cambio
↓
otro efecto ejecuta navegación B
↓
resultado final = B

Investiga:

- clicks;
- estados;
- efectos;
- promesas;
- cargas;
- Supabase;
- timers;
- eventos globales;
- cambios de selección;
- cambio de planeta;
- cambio de módulo;
- modales;
- suscripciones.

La explicación final debe responder:

¿QUÉ CAMBIA entre una ejecución correcta y una ejecución incorrecta?

============================================================
9. EVENTOS DUPLICADOS
============================================================

Audita exhaustivamente:

- onClick duplicados;
- handlers padre/hijo;
- event bubbling;
- event capturing;
- listeners manuales;
- delegación de eventos;
- handlers en contenedores;
- handlers en tarjetas;
- listeners registrados múltiples veces.

Comprueba si un único click puede generar más de una acción.

Busca específicamente:

click hijo
↓
handler hijo
↓
propagación
↓
handler padre
↓
segunda navegación

Comprueba también:

mousedown
click
pointerdown
pointerup
keydown
Enter
Space

y cualquier combinación que pueda generar acciones duplicadas.

============================================================
10. PROPAGACIÓN DE EVENTOS
============================================================

Investiga todos los contenedores interactivos.

Comprueba:

- event bubbling;
- stopPropagation;
- stopImmediatePropagation;
- handlers anidados;
- tarjetas dentro de tarjetas;
- botones dentro de elementos clicables;
- overlays;
- elementos padres clicables.

Determina si una interacción puede activar más de un elemento.

============================================================
11. ESTADO OBSOLETO / STALE STATE
============================================================

Audita exhaustivamente:

- closures;
- useCallback;
- useEffect;
- estados capturados;
- callbacks;
- dependencias;
- valores derivados;
- props antiguas;
- referencias antiguas.

Busca especialmente handlers que puedan conservar:

- pantalla anterior;
- sección anterior;
- planeta anterior;
- módulo anterior;
- target anterior;
- selección anterior.

============================================================
12. USEEFFECT
============================================================

Audita TODOS los useEffect relacionados directa o indirectamente con navegación.

Comprueba:

- dependencias incompletas;
- dependencias excesivas;
- efectos que ejecutan navegación;
- efectos que modifican estados utilizados por navegación;
- ciclos;
- efectos encadenados;
- efectos que se ejecutan en renders inesperados;
- efectos que dependen de datos asíncronos;
- efectos que navegan después de que el usuario ya haya cambiado de pantalla.

============================================================
13. REACT STRICT MODE
============================================================

Comprueba si se utiliza React Strict Mode.

Determina si existen efectos o inicializaciones que no sean idempotentes.

Busca:

- listeners registrados dos veces;
- navegación ejecutada dos veces;
- suscripciones duplicadas;
- timers duplicados;
- estados inicializados incorrectamente.

No culpes automáticamente a Strict Mode.

Determina si existe código incompatible con ejecuciones repetidas.

============================================================
14. IDENTIDAD Y REUTILIZACIÓN DE COMPONENTES
============================================================

Audita:

- key;
- keys duplicadas;
- keys inestables;
- índices como key;
- componentes reutilizados;
- componentes que React conserva incorrectamente;
- componentes que deberían desmontarse pero no lo hacen;
- componentes que se montan/desmontan inesperadamente.

Determina si un componente puede conservar estado interno perteneciente a otra pantalla.

============================================================
15. TARJETAS Y CONFIGURACIÓN DINÁMICA
============================================================

Si las tarjetas se generan mediante arrays, objetos, map, factories o configuraciones, audítalas exhaustivamente.

Busca:

- IDs duplicados;
- keys duplicadas;
- targets duplicados;
- referencias cruzadas;
- closures incorrectas;
- variables mutables;
- configuraciones compartidas;
- componentes equivocados;
- target incorrecto;
- datos heredados;
- configuración reutilizada de otra pantalla.

Comprueba si una tarjeta puede terminar utilizando accidentalmente la configuración de otra.

============================================================
16. MEMOIZACIÓN
============================================================

Audita:

- React.memo;
- useMemo;
- useCallback.

Determina si pueden conservar:

- targets antiguos;
- callbacks antiguos;
- IDs antiguos;
- pantallas antiguas;
- referencias antiguas.

Comprueba exhaustivamente sus arrays de dependencias.

============================================================
17. OPERACIONES ASÍNCRONAS
============================================================

Audita:

- fetch;
- Supabase;
- promesas;
- async/await;
- setTimeout;
- setInterval;
- realtime;
- subscriptions;
- listeners;
- observers.

Busca especialmente:

Pantalla A
↓
inicia operación async
↓
usuario va a Pantalla B
↓
operación de A termina
↓
actualiza estado
↓
efecto interpreta ese estado
↓
navega accidentalmente

Determina si existe este tipo de riesgo.

============================================================
18. SUSCRIPCIONES Y CLEANUP
============================================================

Busca:

- addEventListener;
- removeEventListener;
- subscriptions;
- on;
- off;
- Supabase channels;
- realtime;
- observers;
- timers.

Comprueba que todos tengan cleanup correcto.

Una suscripción duplicada puede explicar perfectamente un bug intermitente.

============================================================
19. TIMERS
============================================================

Audita todos los:

- setTimeout;
- setInterval;
- requestAnimationFrame;
- callbacks temporizados.

Determina si pueden ejecutar navegación o cambiar estados después de que el usuario haya abandonado la pantalla original.

============================================================
20. OVERLAYS Y CAPAS INTERACTIVAS
============================================================

Audita:

- overlays;
- modales;
- paneles transparentes;
- elementos invisibles;
- z-index;
- pointer-events;
- capas superpuestas.

Determina si un click puede ser interceptado por un componente distinto del esperado.

============================================================
21. ROUTING
============================================================

Si existe React Router u otro router, audita:

- rutas;
- rutas dinámicas;
- parámetros;
- rutas anidadas;
- redirects;
- loaders;
- guards;
- fallback routes;
- navigate;
- replace;
- historial.

Comprueba si dos rutas pueden resolver al mismo destino o si un parámetro puede cambiar.

Si no existe router tradicional y se utiliza navegación mediante estado, audita esa arquitectura con especial profundidad.

============================================================
22. FALLBACKS
============================================================

Busca patrones como:

target || defaultTarget
screen ?? defaultScreen
if (!screen)
default
switch default

Determina si valores:

undefined
null
vacíos
temporales

pueden enviar accidentalmente al usuario a otra pantalla.

============================================================
23. ESTADOS INICIALES
============================================================

Audita:

- estados iniciales;
- valores por defecto;
- props por defecto;
- pantallas iniciales;
- secciones iniciales;
- módulos iniciales.

Comprueba si durante un render intermedio puede mostrarse una pantalla incorrecta.

============================================================
24. NAVEGACIÓN INDIRECTA
============================================================

No analices únicamente onClick.

Busca cualquier mecanismo que pueda cambiar una pantalla:

- efectos;
- callbacks;
- timers;
- promesas;
- respuestas Supabase;
- cambios de estado;
- eventos globales;
- comandos;
- teclado;
- selección;
- cambio de planeta;
- cambio de fase;
- cambio de turno;
- inicialización;
- restauración de sesión;
- apertura/cierre de modal.

============================================================
25. AUDITORÍA DE GIT
============================================================

Si tienes acceso a Git:

analiza commits recientes relacionados con:

- navegación;
- tarjetas;
- menús;
- App;
- GameViewports;
- gameNavigation;
- pantallas;
- estados;
- rutas.

Busca regresiones introducidas recientemente.

No analices solamente el código actual.

============================================================
26. CASO ESPECÍFICO: LONJAS GALÁCTICAS → MINISTERIOS
============================================================

En TODAS las pantallas correspondientes a las LONJAS GALÁCTICAS, localiza la tarjeta/botón/acceso:

MINISTERIOS

Debes comprobar que:

LONJA GALÁCTICA
→ MINISTERIOS
→ MINISTERIOS PROPIOS DE ESA LONJA

Debe ser siempre determinista.

Comprueba:

- tarjeta;
- handler;
- ID;
- key;
- target;
- ruta;
- componente destino;
- estado;
- callbacks;
- configuración;
- efectos;
- fallbacks.

No debe abrir:

- otro módulo;
- Finanzas;
- Investigaciones;
- otra sección;
- ministerios de otro contexto;
- una pantalla genérica incorrecta.

Si existen varias implementaciones de Lonja Galáctica, audítalas TODAS.

Comprueba especialmente si las tarjetas de las Lonjas se generan mediante una configuración común.

Busca posibles colisiones entre nombres como:

ministerios
ministry
ministries
finance
finances
research
ministerialResearch

No presupongas que existe un problema: demuestra si existe.

============================================================
27. CASO ESPECÍFICO: ALTO MANDO → BANCA
============================================================

En las pantallas de ALTO MANDO DE LOS PLANETAS, localiza:

BANCA

Debes comprobar que:

ALTO MANDO DEL PLANETA
→ BANCA
→ PANTALLA PROPIA DE BANCA

Y que NUNCA:

BANCA
→ INVESTIGACIONES DE LOS MINISTERIOS DE FINANZAS

Debe existir separación inequívoca entre ambos destinos.

Audita:

- target;
- ID;
- key;
- componente;
- handler;
- callback;
- ruta;
- estado;
- switch;
- diccionario;
- mapa de componentes;
- configuración;
- efectos;
- redirects;
- fallbacks.

============================================================
28. CASO ESPECÍFICO: INVESTIGACIONES DE LOS MINISTERIOS DE FINANZAS
============================================================

Identifica exactamente cómo se accede a:

INVESTIGACIONES DE LOS MINISTERIOS DE FINANZAS

Determina cuál es su target legítimo.

Debe ser independiente de:

BANCA

Comprueba que no compartan accidentalmente:

- ID;
- key;
- target;
- componente;
- estado;
- ruta;
- callback;
- configuración.

============================================================
29. PRUEBAS ESPECÍFICAS DE MINISTERIOS
============================================================

Realiza, si puedes ejecutar el juego:

1. Entrar en una Lonja Galáctica.
2. Pulsar Ministerios.
3. Confirmar destino.
4. Volver.
5. Entrar de nuevo.
6. Navegar previamente por otras tarjetas.
7. Volver a pulsar Ministerios.
8. Repetir muchas veces.
9. Cambiar de planeta si procede.
10. Volver a entrar.
11. Repetir.

Objetivo:

MINISTERIOS debe abrir SIEMPRE su pantalla correspondiente.

============================================================
30. PRUEBAS ESPECÍFICAS DE BANCA
============================================================

Realiza:

1. Entrar en Alto Mando.
2. Pulsar Banca.
3. Confirmar pantalla propia de Banca.
4. Volver.
5. Entrar otra vez.
6. Navegar previamente por Finanzas.
7. Entrar en Investigaciones de los Ministerios de Finanzas.
8. Volver al Alto Mando.
9. Pulsar Banca.
10. Confirmar que sigue abriendo Banca.
11. Repetir muchas veces.
12. Cambiar de planeta si procede.
13. Volver al Alto Mando.
14. Pulsar Banca.

Objetivo:

BANCA debe abrir SIEMPRE Banca.

============================================================
31. PRUEBAS GENERALES DE REPRODUCCIÓN
============================================================

Diseña y ejecuta, si es posible:

PRUEBA 1
Pulsar repetidamente la misma tarjeta.

PRUEBA 2
Entrar/salir repetidamente.

PRUEBA 3
Alternar rápidamente entre dos tarjetas.

PRUEBA 4
Navegar mientras hay operaciones asíncronas.

PRUEBA 5
Navegar inmediatamente después de recibir datos.

PRUEBA 6
Abrir/cerrar modales durante navegación.

PRUEBA 7
Cambiar planeta y navegar inmediatamente.

PRUEBA 8
Volver atrás y entrar otra vez.

PRUEBA 9
Navegar durante actualizaciones de estado.

PRUEBA 10
Repetir exactamente la misma secuencia muchas veces.

El objetivo es detectar resultados diferentes ante la misma secuencia.

============================================================
32. INSTRUMENTACIÓN TEMPORAL
============================================================

Si es necesario, crea temporalmente instrumentación de debugging.

Registra:

timestamp
evento
componente origen
elemento pulsado
ID
target solicitado
pantalla anterior
pantalla solicitada
pantalla resultante
función de navegación
estado relevante
contexto
stack/contexto de llamada

Idealmente:

NAVIGATION_EVENT

timestamp
source
action
requestedTarget
previousTarget
resultingTarget

Y, cuando sea posible:

CALL STACK

La instrumentación debe permitir demostrar:

Usuario pulsa X
↓
X solicita navegación a A
↓
Y solicita navegación a B
↓
resultado final = B

NO dejes necesariamente esta instrumentación permanente.

============================================================
33. DETERMINISMO
============================================================

Para una misma:

ENTRADA + ESTADO LÓGICO

debe existir:

MISMO DESTINO

Si existe:

misma interacción
+
mismo estado
=
destinos diferentes

debes localizar exactamente qué variable, evento, efecto, timing o estado externo está introduciendo la divergencia.

============================================================
34. AUDITORÍA DE BOTONES Y TARJETAS SIN FUNCIÓN
============================================================

Además de los problemas de navegación intermitente, revisa que NO existan botones, tarjetas o elementos interactivos que:

- no hagan nada;
- tengan handlers vacíos;
- tengan handlers muertos;
- tengan destinos undefined;
- tengan targets inexistentes;
- tengan callbacks que no ejecutan ninguna acción;
- estén visualmente habilitados pero funcionalmente desconectados.

Cada elemento interactivo debe tener una función real.

Si encuentras alguno, inclúyelo en el informe.

============================================================
35. CLASIFICACIÓN DE HALLAZGOS
============================================================

Clasifica cada problema:

CRÍTICO
Puede explicar directamente el bug intermitente.

ALTO
Puede provocar navegación incorrecta bajo determinadas condiciones.

MEDIO
Puede contribuir al problema.

BAJO
Problema arquitectónico o de mantenimiento sin evidencia de ser causa directa.

Y diferencia claramente:

HECHO DEMOSTRADO
CAUSA PROBABLE
HIPÓTESIS
PROBLEMA POTENCIAL

NO presentes una hipótesis como causa confirmada.

============================================================
36. MATRIZ DE RIESGO
============================================================

Crea una tabla:

Problema
Ubicación
Componente
Función
Evidencia
Probabilidad
Impacto
Puede explicar el bug
Nivel
Recomendación

============================================================
37. HIPÓTESIS DESCARTADAS
============================================================

Indica qué posibles causas investigaste y descartaste.

Por ejemplo:

- enlace estático incorrecto;
- doble click del usuario;
- React Strict Mode;
- event bubbling;
- estado obsoleto;
- async race;
- configuración incorrecta;
- target duplicado;
- componente reutilizado;
- listener duplicado;
- fallback;
- ruta incorrecta.

Explica por qué cada hipótesis fue descartada o mantenida.

============================================================
38. NO CONFUNDIR SÍNTOMA CON CAUSA
============================================================

Si encuentras:

Tarjeta A → Pantalla B

NO concluyas automáticamente:

"El enlace está mal."

Debes preguntar:

¿Por qué ocurre solamente algunas veces?

La explicación final debe justificar específicamente la INTERMITENCIA.

Debe responder:

¿Qué cambia entre la ejecución correcta y la incorrecta?

============================================================
39. CAUSA COMÚN
============================================================

Comprueba si:

- Lonja → Ministerios
- Alto Mando → Banca
- otras tarjetas que navegan incorrectamente

comparten una causa arquitectónica.

Busca:

- configuración compartida;
- targets ambiguos;
- IDs duplicados;
- navegación contextual defectuosa;
- estado global;
- componentes compartidos;
- callbacks;
- closures;
- efectos;
- rutas;
- mapas de componentes;
- múltiples fuentes de verdad.

Si existe una causa común, identifícala.

============================================================
40. RESULTADO DE LA AUDITORÍA
============================================================

ANTES DE MODIFICAR EL PROYECTO, entrega un informe completo con:

A. RESUMEN EJECUTIVO

Cuál parece ser la causa principal.

B. ARQUITECTURA ACTUAL

Cómo funciona actualmente la navegación.

C. MAPA DE NAVEGACIÓN

Cómo se llega a las principales pantallas.

D. HALLAZGOS

Todos los problemas encontrados.

E. CAUSA RAÍZ

La causa o causas que mejor explican la intermitencia.

F. EVIDENCIAS

Archivo, componente, función y lógica implicada.

G. HIPÓTESIS DESCARTADAS

Qué investigaste y por qué.

H. REPRODUCCIÓN

Cómo reproducir el problema.

I. CASOS ESPECÍFICOS

Resultado de:

Lonjas Galácticas → Ministerios

Alto Mando → Banca

Banca → NO Investigaciones de Ministerios de Finanzas

J. PLAN DE CORRECCIÓN

Cambios necesarios, ordenados por prioridad.

K. RIESGO DE REGRESIÓN

Qué otras partes pueden verse afectadas.

L. PLAN DE VALIDACIÓN

Cómo demostrar que realmente se ha solucionado.

============================================================
41. CRITERIOS DE ACEPTACIÓN
============================================================

La auditoría y posterior solución solamente podrán considerarse satisfactorias si se puede demostrar que:

1. Cada tarjeta tiene un destino inequívoco.
2. Cada botón tiene una función real.
3. Una interacción no genera múltiples navegaciones.
4. Los eventos no se propagan accidentalmente.
5. Los callbacks utilizan el estado correcto.
6. No existen efectos que sobrescriban navegación legítima.
7. Operaciones asíncronas antiguas no alteran navegación actual.
8. Las suscripciones no se duplican.
9. Los timers tienen cleanup.
10. No existen fuentes de verdad contradictorias.
11. La navegación es determinista.
12. Los fallbacks no provocan destinos incorrectos.
13. React no reutiliza incorrectamente componentes con estado ajeno.
14. Las tarjetas dinámicas tienen IDs y targets correctos.
15. Un click produce una única acción lógica.
16. La navegación no depende accidentalmente del historial previo.
17. No existen navegaciones ocultas que sobrescriban la navegación principal.
18. MINISTERIOS en Lonjas Galácticas abre siempre sus propios Ministerios.
19. BANCA en Alto Mando abre siempre su propia pantalla de Banca.
20. BANCA nunca abre Investigaciones de los Ministerios de Finanzas.
21. Investigaciones de los Ministerios de Finanzas tiene su propio destino independiente.
22. No existe ningún camino conocido por el que una pantalla pueda ser sobrescrita accidentalmente por otra.

============================================================
42. REGLA FINAL
============================================================

Trata este problema como un BUG DE PRODUCCIÓN CRÍTICO DE NAVEGACIÓN.

No quiero un parche superficial.

No quiero simplemente cambiar un target.

No quiero que consideres solucionado el problema porque una prueba manual haya funcionado una vez.

Quiero una investigación forense completa.

La solución final debe garantizar que:

CADA INTERACCIÓN
→ GENERA UNA ÚNICA INTENCIÓN DE NAVEGACIÓN
→ CON UN DESTINO DETERMINISTA
→ Y NINGUNA OPERACIÓN SECUNDARIA PUEDE SOBRESCRIBIRLA ACCIDENTALMENTE.

La arquitectura de navegación debe quedar:

- determinista;
- predecible;
- trazable;
- depurable;
- resistente a renders;
- resistente a operaciones asíncronas;
- resistente a navegación rápida;
- resistente a eventos duplicados;
- resistente a estados obsoletos;
- resistente a componentes reutilizados;
- resistente a suscripciones duplicadas;
- resistente a condiciones de carrera;
- y suficientemente clara para evitar que este tipo de bug vuelva a aparecer.

IMPORTANTE:

Primero AUDITA.
Después DIAGNOSTICA.
Después DEMUESTRA.
Después PROPÓN LA CORRECCIÓN.
Y solamente después de tener evidencia suficiente, APLICA LOS CAMBIOS.

No declares una causa raíz sin evidencia técnica.

No confundas una coincidencia con una causa.

No ocultes problemas encontrados aunque no sean la causa principal.

Quiero una auditoría honesta, exhaustiva y técnicamente demostrable de TODO el sistema de navegación del Juego Ascensión.