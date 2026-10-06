OBJETIVO GENERAL

Quiero que analices, diseñes e implementes el SISTEMA COMPLETO DE ESPIONAJE PLANETARIO de Juego Ascensión, tomando como referencia funcional el comportamiento que tenía el juego "Game", pero SIN COPIAR MECÁNICAMENTE su estructura de pantallas ni romper la arquitectura actual de Juego Ascensión.

IMPORTANTE:
Juego Ascensión NO tiene necesariamente la misma estructura de pantallas, navegación ni arquitectura que "Game".

Por tanto, la prioridad NO es reproducir visualmente las pantallas de Game.

La prioridad es:

1. Comprender exactamente cómo funcionaba el espionaje en Game.
2. Comprender exactamente qué tenemos actualmente en Juego Ascensión.
3. Determinar cómo trasladar funcionalmente ese comportamiento a la arquitectura REAL de Juego Ascensión.
4. Aprovechar al máximo las pantallas, componentes, sistemas, navegación, datos, tablas, servicios y mecánicas que YA existen.
5. Crear únicamente aquello que realmente falte.
6. No duplicar sistemas.
7. No crear pantallas nuevas cuando la funcionalidad pueda integrarse correctamente en una pantalla existente.
8. No romper ninguna funcionalidad existente.
9. No alterar arbitrariamente la estructura actual del juego.
10. Implementar finalmente el flujo completo, real y persistente.

============================================================
REGLA ABSOLUTA: AUDITORÍA ANTES DE IMPLEMENTAR
============================================================

NO EMPIECES IMPLEMENTANDO.

PRIMERO DEBES REALIZAR UNA AUDITORÍA TOTAL, ABSOLUTA Y EXHAUSTIVA DEL ESTADO ACTUAL DEL PROYECTO.

Quiero que primero averigües:

- qué tenemos;
- cómo está organizado;
- qué pantallas existen;
- qué sistemas existen;
- qué componentes existen;
- qué rutas existen;
- cómo funciona la navegación;
- qué entidades existen;
- qué sistemas de viajes existen;
- qué sistemas de naves existen;
- qué sistemas de sondas existen;
- qué sistemas de inteligencia existen;
- qué sistemas de misiones existen;
- qué sistemas de eventos existen;
- qué sistemas de notificaciones existen;
- qué sistemas temporales existen;
- qué persistencia existe;
- qué tablas de Supabase existen;
- qué RPCs existen;
- qué funciones SQL existen;
- qué RLS existe;
- qué estados existen;
- qué tests existen;
- qué partes de Game pueden recuperarse;
- y qué partes de Game NO tienen equivalente actualmente.

NO hagas suposiciones si puedes comprobarlas en el código.

============================================================
FASE 1 — INVENTARIO COMPLETO DE JUEGO ASCENSIÓN
============================================================

Realiza primero un inventario exhaustivo de la arquitectura actual.

Analiza:

- src/
- componentes;
- páginas;
- vistas;
- rutas;
- navegación;
- hooks;
- stores;
- contextos;
- servicios;
- utilidades;
- tipos;
- modelos;
- datos;
- configuración;
- tests;
- Supabase;
- migraciones;
- SQL;
- RPCs;
- triggers;
- funciones;
- políticas RLS;
- sistemas de eventos;
- sistemas de notificaciones;
- sistemas temporales;
- cualquier documentación del proyecto.

Identifica específicamente todas las pantallas relacionadas con:

- planetas;
- alto mando;
- militar;
- inteligencia;
- diplomacia;
- comercio;
- economía;
- flotas;
- naves;
- sondas;
- tecnología;
- investigaciones;
- defensa;
- mapa;
- navegación;
- informes;
- notificaciones;
- operaciones especiales.

Para cada pantalla relevante determina:

- qué función tiene;
- qué datos muestra;
- qué acciones permite;
- qué componentes utiliza;
- a qué otras pantallas navega;
- qué contexto recibe;
- qué contexto conserva;
- qué sistemas backend utiliza;
- qué entidades modifica;
- qué acciones están ya implementadas;
- qué acciones están incompletas.

============================================================
FASE 2 — AUDITORÍA ESPECÍFICA DE GAME
============================================================

Investiga exhaustivamente el código, documentación, historial o cualquier referencia disponible de "Game".

Busca todo lo relacionado con:

- espionaje;
- inteligencia;
- espías;
- sondas;
- sondas de espionaje;
- reconocimiento;
- vigilancia;
- infiltración;
- planetas objetivo;
- misiones;
- detección;
- contraespionaje;
- interceptación;
- informes;
- resultados;
- inteligencia obtenida.

Determina exactamente cómo funcionaba.

Quiero saber:

- desde dónde se iniciaba;
- cómo se seleccionaba el objetivo;
- qué pantalla se utilizaba;
- qué información podía verse;
- qué información estaba oculta;
- qué requisitos había;
- qué recursos se necesitaban;
- qué costes existían;
- qué unidad/sonda se utilizaba;
- cómo se enviaba;
- cómo se desplazaba;
- cuánto tardaba;
- qué estados existían;
- cómo se resolvía;
- cómo se calculaba el éxito;
- cómo se calculaba el fracaso;
- cómo funcionaba la detección;
- cómo funcionaba el contraespionaje;
- qué sucedía si era interceptada;
- qué sucedía si era destruida;
- qué sucedía si tenía éxito;
- qué información podía obtener;
- cómo regresaba, si correspondía;
- cómo se registraba;
- cómo se notificaba;
- dónde se consultaba posteriormente.

No te limites a buscar nombres obvios.

Realiza una búsqueda semántica y estructural para descubrir implementaciones indirectas.

============================================================
FASE 3 — COMPARACIÓN GAME VS JUEGO ASCENSIÓN
============================================================

Después de las dos auditorías anteriores, crea mentalmente una matriz de correspondencia:

GAME
↓
FUNCIONALIDAD
↓
EQUIVALENTE ACTUAL EN JUEGO ASCENSIÓN
↓
¿REUTILIZABLE?
↓
¿REQUIERE MODIFICACIÓN?
↓
¿REQUIERE NUEVA IMPLEMENTACIÓN?
↓
¿DÓNDE DEBE INTEGRARSE?

Para cada funcionalidad determina:

A) YA EXISTE Y FUNCIONA
→ reutilizar.

B) EXISTE PERO ES INSUFICIENTE
→ ampliar/modificar.

C) EXISTE PARCIALMENTE
→ completar.

D) NO EXISTE
→ diseñar e implementar.

E) EXISTE PERO EN OTRA PANTALLA
→ determinar si debe integrarse allí o si existe una razón real para crear una nueva.

F) EXISTE UNA IMPLEMENTACIÓN PARECIDA PERO NO ES LA CORRECTA
→ no reutilizarla automáticamente; evaluar antes de modificar.

============================================================
FASE 4 — VALORACIÓN ARQUITECTÓNICA PREVIA
============================================================

ESTA FASE ES OBLIGATORIA.

Antes de tocar código, debes realizar una valoración técnica completa de CÓMO implementar el espionaje dentro de la estructura actual de Juego Ascensión.

No quiero que simplemente copies el flujo de Game.

Quiero que determines:

- qué pantalla actual debe ser el punto de entrada;
- qué pantalla actual debe permitir seleccionar el planeta;
- qué pantalla actual debe mostrar el estado de la misión;
- qué pantalla actual debe mostrar los resultados;
- dónde debe aparecer la inteligencia;
- dónde debe aparecer el informe;
- qué componentes existentes pueden reutilizarse;
- qué componentes deben ampliarse;
- qué componentes nuevos son imprescindibles;
- qué rutas deben modificarse;
- qué rutas NO deben modificarse;
- qué servicios deben ampliarse;
- qué tablas deben reutilizarse;
- qué tablas deben ampliarse;
- qué tablas nuevas son realmente necesarias;
- qué RPCs deben crearse o modificarse;
- qué estados deben añadirse;
- qué eventos deben reutilizarse;
- qué notificaciones deben reutilizarse.

Y, sobre todo:

DEBES DETERMINAR CÓMO INTEGRAR EL SISTEMA EN LAS PANTALLAS QUE YA TENEMOS.

No quiero una copia de Game introducida artificialmente dentro de Juego Ascensión.

Quiero que el espionaje SE ADAPTE A LA ARQUITECTURA EXISTENTE DE JUEGO ASCENSIÓN.

============================================================
FASE 5 — PRINCIPIO DE NO DESTRUCCIÓN
============================================================

Antes de modificar cualquier archivo, identifica dependencias y riesgos.

Para cada modificación importante analiza:

- qué funcionalidad existente podría verse afectada;
- qué componentes dependen de ella;
- qué rutas utilizan ese componente;
- qué estados utiliza;
- qué datos modifica;
- qué tests podrían romperse;
- qué migraciones podrían afectar a otras funciones;
- qué relaciones de Supabase existen;
- qué RLS podría verse afectado.

NO hagas refactors masivos innecesarios.

NO cambies arquitectura solo porque una arquitectura distinta te parezca más elegante.

NO reemplaces un sistema existente que ya funciona si puede ampliarse.

NO renombres componentes, rutas o entidades sin necesidad real.

NO muevas pantallas simplemente para que se parezcan a Game.

============================================================
FASE 6 — PROPUESTA DE INTEGRACIÓN
============================================================

Una vez terminada la auditoría, define exactamente cómo quedaría el sistema dentro de las pantallas ACTUALES.

Por ejemplo, debes determinar de forma concreta:

PANTALLA EXISTENTE
→ qué elemento se añade.

TARJETA EXISTENTE
→ qué acción se incorpora.

BOTÓN EXISTENTE
→ qué debe hacer.

MODAL EXISTENTE
→ qué información adicional debe mostrar.

PANTALLA DE PLANETA
→ qué acceso al espionaje corresponde.

PANTALLA DE INTELIGENCIA
→ qué información debe mostrar.

PANTALLA DE MISIONES
→ cómo se representa la misión.

PANTALLA DE INFORMES
→ cómo aparece el resultado.

NOTIFICACIÓN
→ a qué pantalla debe llevar.

MAPA
→ si corresponde, cómo se accede al espionaje.

No asumas que todo necesita una pantalla nueva.

PRIORIDAD:

1. reutilizar pantalla existente;
2. ampliar componente existente;
3. crear componente especializado;
4. crear nueva pantalla únicamente si resulta arquitectónicamente necesaria.

============================================================
FASE 7 — APROBACIÓN INTERNA DEL PLAN
============================================================

ANTES DE IMPLEMENTAR, genera internamente un plan de implementación completo.

Ese plan debe responder:

- qué vamos a modificar;
- por qué;
- dónde;
- cómo;
- qué reutilizamos;
- qué creamos;
- qué riesgo existe;
- cómo evitamos romper lo existente;
- cómo se migrarán los datos;
- cómo se mantendrá compatibilidad;
- cómo se probará.

NO pases directamente de "auditoría" a "codificación".

Primero debe existir una estrategia de integración basada en lo que realmente encontraste.

============================================================
FASE 8 — IMPLEMENTACIÓN DEL FLUJO COMPLETO
============================================================

Una vez definido el encaje arquitectónico, implementa el sistema completo.

El flujo funcional debe cubrir:

PLANETA / PANTALLA DE ORIGEN
↓
ACCESO A ESPIONAJE
↓
SELECCIÓN DE PLANETA OBJETIVO
↓
ANÁLISIS DEL OBJETIVO
↓
INFORMACIÓN CONOCIDA / DESCONOCIDA
↓
COMPROBACIÓN DE REQUISITOS
↓
COSTES
↓
SELECCIÓN DE SONDA / UNIDAD
↓
CONFIRMACIÓN
↓
LANZAMIENTO
↓
VIAJE
↓
APROXIMACIÓN
↓
POSIBLE DETECCIÓN
↓
POSIBLE INTERCEPTACIÓN
↓
LLEGADA
↓
OPERACIÓN DE ESPIONAJE
↓
RECOPILACIÓN DE INTELIGENCIA
↓
RESOLUCIÓN
↓
ÉXITO / FRACASO / DETECCIÓN / DESTRUCCIÓN / ETC.
↓
REGISTRO
↓
NOTIFICACIÓN
↓
INFORME
↓
INTELIGENCIA DISPONIBLE
↓
CONSULTA POSTERIOR.

============================================================
FASE 9 — REUTILIZACIÓN DE SISTEMAS
============================================================

Antes de crear cualquier sistema nuevo, comprueba si ya existe uno equivalente.

Especialmente:

- viajes;
- flotas;
- naves;
- sondas;
- misiones;
- temporizadores;
- eventos;
- notificaciones;
- informes;
- inteligencia;
- recursos;
- tecnología;
- diplomacia;
- planetas;
- rutas;
- estados.

Si existe un sistema reutilizable, intégrate con él.

NO construyas:

"EspionajeTravelSystem"

si ya existe:

"TravelSystem"

que puede soportarlo.

NO construyas:

"EspionageNotificationSystem"

si ya existe:

"NotificationSystem"

que puede ampliarse.

NO construyas una segunda arquitectura de misiones si ya existe una.

============================================================
FASE 10 — SONDA Y MISIÓN
============================================================

Debe existir una representación real y persistente de la misión.

Debe poder conocerse:

- jugador;
- origen;
- objetivo;
- sonda;
- fecha de lanzamiento;
- estado;
- viaje;
- detección;
- interceptación;
- resultado;
- inteligencia obtenida;
- retorno;
- fecha de finalización.

Si las entidades actuales ya pueden representar esto, reutilízalas.

============================================================
FASE 11 — REQUISITOS
============================================================

Validar:

- objetivo;
- origen;
- tecnología;
- recursos;
- coste;
- disponibilidad de sonda;
- capacidad;
- distancia;
- restricciones diplomáticas;
- restricciones militares;
- estado planetario;
- cualquier requisito heredado de Game.

Validar tanto en:

FRONTEND

como en:

BACKEND.

============================================================
FASE 12 — PERSISTENCIA
============================================================

Audita Supabase antes de crear tablas.

Determina qué puede reutilizarse.

Solo crea estructuras nuevas cuando sea necesario.

Garantiza:

- PK;
- FK;
- índices;
- constraints;
- estados válidos;
- timestamps;
- RLS;
- permisos;
- integridad;
- concurrencia.

Las operaciones críticas deben ser atómicas.

Evita:

- doble lanzamiento;
- doble descuento;
- sonda duplicada;
- misión duplicada;
- estado imposible;
- misión sin sonda;
- misión sin origen;
- misión sin destino.

============================================================
FASE 13 — VIAJE Y ESTADOS
============================================================

Implementa estados reales y persistentes.

Utiliza el sistema de estados existente cuando sea posible.

Como referencia, deben poder representarse los estados que correspondan a:

- preparada;
- lanzada;
- en tránsito;
- aproximándose;
- detectada;
- interceptada;
- llegando;
- en órbita;
- espiando;
- recopilando;
- completada;
- fracasada;
- destruida;
- regresando;
- retornada;
- cancelada.

No añadas estados que no sean necesarios.

============================================================
FASE 14 — INTELIGENCIA
============================================================

La información descubierta debe estar separada conceptualmente entre:

INFORMACIÓN YA CONOCIDA

e

INFORMACIÓN DESCUBIERTA POR ESPIONAJE.

Determina, según Game y las reglas actuales:

- información básica;
- población;
- economía;
- producción;
- recursos;
- edificios;
- tecnología;
- investigaciones;
- fuerzas militares;
- flotas;
- defensas;
- comercio;
- proyectos;
- instalaciones;
- cualquier otra información estratégica.

No revelar información que el jugador no haya descubierto.

============================================================
FASE 15 — DETECCIÓN Y CONTRAESPIONAJE
============================================================

Investiga primero cómo funcionaba en Game.

Después comprueba qué sistemas actuales de Juego Ascensión pueden soportarlo.

Implementa:

- detección;
- defensa;
- sensores;
- contraespionaje;
- interceptación;
- consecuencias diplomáticas/militares;
- alertas;
- penalizaciones;

solo cuando correspondan según las reglas.

============================================================
FASE 16 — INTERFAZ Y EXPERIENCIA
============================================================

La interfaz debe integrarse en las pantallas existentes.

NO crear una interfaz paralela innecesaria.

Debe quedar claro:

- objetivo;
- propietario;
- origen;
- coste;
- duración;
- sonda;
- riesgo;
- estado;
- información disponible;
- información desconocida;
- resultado.

Todos los botones deben funcionar.

Un clic debe realizar la acción correspondiente.

No debe existir ningún:

- botón muerto;
- enlace muerto;
- botón sin handler;
- botón que navegue a una pantalla incorrecta;
- botón que requiera doble clic;
- botón visualmente activo que no haga nada.

============================================================
FASE 17 — NAVEGACIÓN
============================================================

Audita toda la navegación del nuevo sistema.

Comprueba:

- planeta;
- alto mando;
- inteligencia;
- mapa;
- misión;
- informe;
- notificación;
- planeta objetivo;
- vuelta atrás.

El contexto debe conservar correctamente:

- jugador;
- planeta origen;
- planeta objetivo;
- misión;
- sonda.

NUNCA reutilices accidentalmente rutas de otros sistemas.

Un botón de espionaje debe llevar a espionaje.

No debe terminar en:

- investigaciones;
- banca;
- ministerios;
- comercio;
- otra pantalla incorrecta.

============================================================
FASE 18 — NOTIFICACIONES
============================================================

Reutiliza el sistema de notificaciones existente.

Notificar según corresponda:

- lanzamiento;
- tránsito;
- detección;
- interceptación;
- llegada;
- resultado;
- inteligencia;
- retorno;
- pérdida.

Cada notificación debe enlazar con la pantalla correcta.

============================================================
FASE 19 — SEGURIDAD Y CONCURRENCIA
============================================================

Proteger contra:

- doble clic;
- doble envío;
- refresh;
- dos pestañas;
- manipulación del frontend;
- llamadas duplicadas;
- race conditions;
- recursos negativos;
- sondas duplicadas;
- misiones duplicadas;
- saltarse requisitos;
- alterar resultados.

============================================================
FASE 20 — TESTS
============================================================

Crear o ampliar tests para:

- acceso;
- selección;
- validación;
- lanzamiento;
- doble lanzamiento;
- persistencia;
- viaje;
- estados;
- detección;
- interceptación;
- fracaso;
- éxito;
- inteligencia;
- notificaciones;
- navegación;
- refresh;
- recuperación;
- RLS;
- concurrencia.

============================================================
FASE 21 — PRUEBA DE NO REGRESIÓN
============================================================

Después de implementar, comprobar que las pantallas que han sido modificadas siguen funcionando correctamente en sus funcionalidades originales.

Especialmente comprobar:

- navegación;
- tarjetas;
- botones;
- datos;
- estados;
- economía;
- banca;
- ministerios;
- investigaciones;
- alto mando;
- diplomacia;
- comercio;
- militar;
- planetas;
- flotas;
- defensa;
- notificaciones.

No basta con comprobar que el espionaje funciona.

Hay que comprobar que NO hemos roto lo que ya funcionaba.

============================================================
FASE 22 — AUDITORÍA FINAL EXTREMA
============================================================

Al finalizar:

- ejecutar tests;
- ejecutar lint;
- ejecutar build;
- revisar errores;
- revisar warnings relevantes;
- revisar rutas;
- revisar navegación;
- revisar Supabase;
- revisar migraciones;
- revisar RLS;
- revisar estados;
- revisar persistencia;
- revisar concurrencia;
- revisar botones;
- revisar notificaciones;
- revisar duplicidades;
- revisar código muerto;
- revisar posibles regresiones.

============================================================
ESCENARIO COMPLETO DE VALIDACIÓN
============================================================

Simula y prueba:

1. Entrar en planeta propio.
2. Acceder al sistema de espionaje desde la pantalla que corresponda según la arquitectura actual.
3. Seleccionar planeta enemigo.
4. Ver información conocida.
5. Ver información desconocida.
6. Consultar requisitos.
7. Consultar coste.
8. Seleccionar sonda.
9. Lanzar.
10. Salir de la pantalla.
11. Navegar por otras pantallas.
12. Volver posteriormente.
13. Consultar la misión.
14. Ver su estado correcto.
15. Resolver misión.
16. Recibir notificación.
17. Abrir informe.
18. Consultar inteligencia.
19. Comprobar persistencia.
20. Comprobar que la información descubierta aparece posteriormente donde corresponda.

============================================================
PRINCIPIO FUNDAMENTAL DE IMPLEMENTACIÓN
============================================================

NO QUIERO QUE TRANSFORMES JUEGO ASCENSIÓN EN UNA COPIA DE GAME.

Quiero que EXTRAIGAS EL COMPORTAMIENTO FUNCIONAL DEL ESPIONAJE DE GAME y lo INTEGRES CORRECTAMENTE EN LA ARQUITECTURA ACTUAL DE JUEGO ASCENSIÓN.

La estructura de Juego Ascensión es la fuente de verdad para:

- pantallas;
- navegación;
- componentes;
- arquitectura;
- UX;
- datos;
- sistemas existentes.

Game es la referencia principal para:

- comportamiento;
- mecánicas;
- flujo funcional;
- reglas de espionaje;
- estados;
- resultados;
- lógica histórica.

Cuando ambas cosas entren en conflicto:

1. conservar la arquitectura de Juego Ascensión;
2. preservar el funcionamiento que sea compatible;
3. adaptar la mecánica de Game a las estructuras actuales;
4. evitar romper sistemas existentes;
5. documentar cualquier desviación funcional inevitable.

============================================================
ORDEN OBLIGATORIO DE EJECUCIÓN
============================================================

NO implementes directamente.

Sigue obligatoriamente este orden:

FASE A
→ Auditoría absoluta de Juego Ascensión.

FASE B
→ Auditoría absoluta de Game.

FASE C
→ Comparación funcional Game vs Juego Ascensión.

FASE D
→ Inventario de sistemas reutilizables.

FASE E
→ Identificación de carencias.

FASE F
→ Valoración arquitectónica.

FASE G
→ Diseño de integración en las pantallas actuales.

FASE H
→ Evaluación de riesgos y prevención de regresiones.

FASE I
→ Plan técnico completo.

FASE J
→ Implementación.

FASE K
→ Tests.

FASE L
→ Auditoría de navegación y botones.

FASE M
→ Auditoría de persistencia y seguridad.

FASE N
→ Build/lint/tests.

FASE O
→ Prueba completa de extremo a extremo.

============================================================
RESULTADO FINAL ESPERADO
============================================================

El resultado debe ser un sistema de espionaje planetario:

- completamente funcional;
- integrado;
- persistente;
- seguro;
- coherente con Game;
- adaptado a Juego Ascensión;
- integrado en las pantallas existentes;
- sin duplicar sistemas;
- sin navegación incorrecta;
- sin botones muertos;
- sin estados ficticios;
- sin mocks permanentes;
- sin datos hardcodeados donde corresponda persistencia;
- sin romper funcionalidades existentes.

Y, sobre todo:

ANTES DE MODIFICAR EL CÓDIGO DEBES SABER EXACTAMENTE QUÉ TENEMOS, QUÉ QUEREMOS CONSEGUIR, QUÉ PARTE YA EXISTE, QUÉ PARTE PUEDE REUTILIZARSE, QUÉ PARTE DEBE MODIFICARSE, QUÉ PARTE FALTA Y EXACTAMENTE EN QUÉ PUNTO DE LA ARQUITECTURA ACTUAL DE JUEGO ASCENSIÓN DEBE INTEGRARSE CADA PIEZA.

NO QUIERO UNA IMPLEMENTACIÓN A CIEGAS.

QUIERO UNA IMPLEMENTACIÓN BASADA EN UNA AUDITORÍA PREVIA, UNA VALORACIÓN ARQUITECTÓNICA COMPLETA Y UN PLAN DE INTEGRACIÓN DISEÑADO PARA NO ROMPER ABSOLUTAMENTE NADA DE LO QUE YA FUNCIONA.