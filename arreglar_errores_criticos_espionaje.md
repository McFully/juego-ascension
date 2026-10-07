Quiero que trabajes directamente sobre el proyecto actual **Juego Ascensión** y que ejecutes una reparación completa y rigurosa del sistema de ESPIONAJE a partir de la auditoría técnica ya realizada.

IMPORTANTE:

- Trabaja EXCLUSIVAMENTE sobre el proyecto actual Juego Ascensión.
- NO busques, menciones, compares ni tomes como referencia ningún otro juego o proyecto externo.
- NO introduzcas Supabase ni ninguna arquitectura cloud antigua.
- La persistencia válida del proyecto es la arquitectura SQLite actualmente existente.
- NO crees una arquitectura paralela ni sistemas duplicados.
- Reutiliza y extiende los sistemas, componentes, reducers, misiones, persistencia, navegación, eventos y utilidades existentes.
- No hagas una refactorización general del proyecto.
- No cambies arquitectura por comodidad.
- No elimines funcionalidades existentes salvo que la auditoría demuestre que son incorrectas, incompatibles o duplicadas.
- No des por solucionado algo simplemente porque una prueba unitaria pase: debes verificar el comportamiento real del sistema.
- Ningún botón, tarjeta, pestaña, ruta o acción puede quedar sin función.
- No debe ser necesario hacer doble clic para ejecutar una acción.
- No crees pantallas nuevas si el sistema existente puede resolverlo mediante sus pantallas/componentes actuales.

La auditoría técnica realizada sobre el commit `c724504` determinó que el sistema de espionaje está parcialmente implementado, pero presenta errores críticos, sistemas muertos, fuentes de datos incorrectas, fugas de información, una intercepción ficticia y ausencia de integración extremo a extremo.

Por tanto, NO quiero simplemente "parches" aislados. Quiero que conviertas el sistema existente en un sistema de espionaje funcional, coherente, persistente y verificable.

==================================================
FASE 0 — AUDITORÍA PREVIA OBLIGATORIA
==================================================

Antes de modificar código:

1. Revisa el estado actual del proyecto.
2. Revisa específicamente todos los archivos implicados en:
   - espionaje;
   - planetIntel;
   - spyReports;
   - spy missions;
   - espionageProbe;
   - counterespionage;
   - counter-intelligence;
   - ministries;
   - research;
   - AI tick;
   - fleet missions;
   - interception;
   - combat;
   - dossier;
   - observatory;
   - diplomacy;
   - persistence;
   - SQLite;
   - migration;
   - navigation;
   - tests.

3. Comprueba que los hallazgos de la auditoría siguen siendo válidos en el estado actual.

4. No empieces modificando indiscriminadamente.

5. Presenta primero una lista interna/estructurada de:
   - problema;
   - archivo;
   - causa;
   - impacto;
   - solución prevista;
   - pruebas necesarias.

6. Después comienza las reparaciones por fases, respetando estrictamente el orden indicado a continuación.

==================================================
FASE 1 — P0: ERRORES CRÍTICOS DEL ESPIONAJE
==================================================

### 1.1 CORREGIR EL CRASH DE ESPIONAGEBRIEFPANEL

En `EspionageBriefPanel.jsx` existe el problema detectado alrededor del uso de `resources` cuando la variable real es `recursos`.

Debes:

- localizar la causa exacta;
- corregirla usando la fuente de datos correcta;
- comprobar que abrir/seleccionar la acción "Espiar" desde `FleetPage.jsx` ya no produce `ReferenceError`;
- comprobar que el panel realmente renderiza;
- comprobar que los recursos mostrados son los correctos;
- comprobar que lanzar espionaje desde ahí funciona.

NO te limites a corregir el nombre si existe algún problema adicional de flujo.

Debes probar el componente en ejecución real, no solamente mediante análisis estático.

--------------------------------------------------
### 1.2 CORREGIR LA FUSIÓN DEL DOSSIER

En `diploMission.js` se detectó que la lógica de merge utiliza `??` de una forma que permite que valores de tipo `???` sobrescriban información exacta ya conocida.

Esto es incorrecto.

Regla obligatoria:

- `???` significa INFORMACIÓN DESCONOCIDA.
- No significa que la información anterior haya desaparecido.
- Un dato desconocido jamás debe destruir un dato exacto ya almacenado.
- Una información parcial tampoco debe destruir información exacta anterior salvo que exista una actualización explícita y válida.

Implementa una semántica correcta de merge.

Ejemplo:

ANTES:
- recursos exactos conocidos.

NUEVO INFORME:
- recursos: `???`.

RESULTADO:
- deben conservarse los recursos exactos anteriores.

Otro caso:

ANTES:
- flota exacta conocida.

NUEVO INFORME:
- flota desconocida.

RESULTADO:
- no borrar la información exacta anterior.

Pero si existe una nueva observación válida y más reciente, sí debe poder actualizar la información anterior.

Añade pruebas específicas para:

- exacto + desconocido;
- parcial + desconocido;
- desconocido + exacto;
- exacto antiguo + exacto nuevo;
- diferentes planetas;
- diferentes objetivos;
- informes bloqueados;
- múltiples informes consecutivos.

--------------------------------------------------
### 1.3 CORREGIR EL BONUS DE COMBATE

La auditoría detectó que `combatMission.js` utiliza el último informe global en lugar de la inteligencia correspondiente al planeta objetivo.

Esto es incorrecto.

Caso obligatorio de prueba:

1. Espiar planeta A.
2. Obtener información válida de A.
3. Espiar planeta B.
4. Obtener información válida de B.
5. Atacar A.
6. El bonus de inteligencia utilizado debe corresponder exclusivamente a A.

El hecho de haber espiado B posteriormente NO puede modificar el bonus de A.

No utilices simplemente `reports[reports.length - 1]`.

La información debe estar vinculada al objetivo/planeta correspondiente mediante la estructura persistente adecuada.

Si `planetIntel` es la fuente correcta para esto, utilízala como fuente de verdad.

Debes comprobar también:

- persistencia;
- reinicio;
- múltiples objetivos;
- informes antiguos;
- informes bloqueados;
- ausencia de inteligencia;
- inteligencia parcial;
- inteligencia completa.

==================================================
FASE 2 — FUENTES DE DATOS REALES
==================================================

Hay dos problemas críticos que deben resolverse conjuntamente porque afectan a la misma cuestión: la fuente de verdad.

--------------------------------------------------
### 2.1 MINISTERIOS / CONTRAESPIONAJE

La auditoría detectó que:

`hawk_eye`
`quantum_scrambler`
`sleeper_net`

leen:

`state.ministries.intel.upgrades`

pero las mejoras reales se encuentran en:

`planet.ministryUpgrades`

y el primer objeto no recibe escritura real.

Esto significa que el jugador puede pagar recursos y mejorar el ministerio, pero las mecánicas de espionaje no reciben realmente la mejora.

Debes:

1. Identificar la fuente de verdad actual de las mejoras de ministerios.
2. No crear una segunda fuente paralela.
3. Conectar las mecánicas de espionaje con la fuente real.
4. Verificar que comprar/mejorar un ministerio modifica realmente la defensa contra espionaje.
5. Verificar que:
   - Hawk Eye;
   - Quantum Scrambler;
   - Sleeper Net;
   tienen efectos reales.
6. Comprobar persistencia SQLite.
7. Comprobar carga de partida.
8. Comprobar migraciones.
9. Comprobar que no se pierde la mejora después de guardar/reiniciar.

MUY IMPORTANTE:

No soluciones esto sembrando manualmente:

`state.ministries.intel.upgrades`

en los tests.

Los tests deben utilizar la misma estructura que utiliza el juego real.

--------------------------------------------------
### 2.2 GALACTICCRYPTO

La auditoría detectó que `galacticCrypto` lee:

`planet.research`

pero esa estructura no representa las investigaciones reales y permanece vacía.

Debes:

1. Identificar dónde se almacenan realmente las investigaciones.
2. Utilizar una única fuente de verdad.
3. Conectar `galacticCrypto` con ella.
4. Verificar que mejorar la investigación modifica realmente el espionaje/defensa.
5. Verificar persistencia.
6. Verificar migraciones.
7. Verificar carga después de reiniciar.
8. Añadir pruebas que utilicen el flujo real de investigación.

No crees una segunda estructura artificial únicamente para satisfacer el espionaje.

==================================================
FASE 3 — PLANETINTEL COMO INTELIGENCIA DURADERA
==================================================

Debes consolidar correctamente la inteligencia persistente.

El sistema debe distinguir como mínimo:

1. Nunca observado.
2. Observado parcialmente.
3. Observado completamente.
4. Espionaje bloqueado/interceptado.
5. Información desconocida.
6. Información antigua/expirada.
7. Información actualizada.

No mezcles estos estados.

`???` significa desconocido.

"Sin datos" no debe significar automáticamente "nunca observado".

Un informe bloqueado no debe convertirse en ausencia de información.

Una información antigua debe seguir siendo reconocible como antigua.

Una nueva observación válida debe actualizar la información correspondiente.

--------------------------------------------------
### 3.1 CADUCIDAD

Actualmente la auditoría detectó que una inteligencia puede seguir dando bonus de combate aunque tenga muchas horas de antigüedad.

Debes implementar la caducidad de inteligencia utilizando el sistema temporal ya existente en el juego.

NO inventes un segundo reloj ni un sistema temporal paralelo.

La caducidad debe ser coherente con la simulación existente.

Debe quedar claramente definido:

- cuándo una inteligencia es reciente;
- cuándo es antigua;
- cuándo deja de ser válida para bonus;
- qué información sigue siendo visible;
- qué información deja de poder utilizarse tácticamente.

==================================================
FASE 4 — ESPIONAJE DE LA IA
==================================================

La auditoría detectó que el sistema de espionaje de IA está prácticamente muerto porque las colonias IA no reciben/obtienen realmente `espionageProbe`.

Actualmente el tick puede contener lógica de espionaje, pero no existe una cadena real que permita que la IA llegue a ejecutarla.

Debes hacer que la IA pueda utilizar espionaje de verdad.

La cadena completa debe existir:

CONSTRUCCIÓN/OBTENCIÓN DEL PROBE
→ DISPONIBILIDAD
→ DECISIÓN DE ESPIONAJE
→ COSTE
→ SELECCIÓN DEL OBJETIVO
→ VIAJE
→ RESOLUCIÓN
→ RESULTADO
→ INTERCEPCIÓN O ÉXITO
→ INFORMACIÓN
→ REGRESO/DESTRUCCIÓN
→ PERSISTENCIA
→ SIGUIENTE TICK

Debes comprobar:

### Probes
- cómo obtiene la IA los probes;
- cuánto cuestan;
- dónde se almacenan;
- cómo se pierden;
- cómo regresan.

### Límites
Debe existir un límite razonable y coherente.

La auditoría detectó que actualmente el límite es por colonia y no existe un control de facción adecuado.

Revisa esto y evita que una IA con muchas colonias pueda generar una cantidad absurda de espionajes simultáneos.

### Distancia
No utilices simplemente una velocidad artificial que haga que todo llegue prácticamente instantáneamente.

Respeta el sistema de viaje existente.

### Objetivos
Define correctamente:

- objetivos válidos;
- aliados;
- enemigos;
- neutrales;
- objetivos fuera de alcance;
- restricciones diplomáticas.

No permitas espionajes incoherentes.

### Retorno
Actualmente los probes de IA pueden quedar destruidos porque el sistema de retorno no contempla correctamente el espionaje IA.

Debes implementar el retorno real cuando corresponda.

El probe debe:

- volver;
- quedar disponible nuevamente;
- o ser destruido cuando corresponda según la resolución real.

No puede desaparecer simplemente porque no existe una rama de retorno.

### Persistencia
Comprueba:

- guardado;
- carga;
- reinicio;
- misión en vuelo;
- misión completada;
- misión interceptada.

### arrivalTime
La auditoría detectó posibles `NaN` cuando la IA no dispone correctamente de información de galaxia.

Debes evitar:

- `arrivalTime = NaN`;
- misiones eternamente atascadas;
- misiones imposibles de resolver.

==================================================
FASE 5 — NOTIFICACIONES DE ESPIONAJE
==================================================

Actualmente existe una contradicción:

El comentario indica que el jugador no debería recibir una notificación explícita de espionaje, pero `tickOrchestrator.js` puede enviar un mensaje/notificación cuando el espionaje ocurre.

Debes decidir el comportamiento correcto según el diseño del sistema.

La detección debe depender de la defensa/intercepción real.

No debe aparecer una notificación automática diciendo simplemente:

"Te han espiado"

si el espionaje no fue detectado.

La información que recibe el defensor debe corresponder a la resolución real:

- no detectado;
- detectado;
- interceptado;
- combate;
- pérdida;
- etc.

El sistema de notificación debe depender del resultado real.

==================================================
FASE 6 — INTERCEPCIÓN REAL
==================================================

Este es uno de los puntos más importantes.

La auditoría determinó que la intercepción actual es básicamente ficticia:

`PATROL_INTERCEPT_BONUS = 0.35`

y que `patrol.fleet` ni siquiera se utiliza realmente.

NO quiero una intercepción basada únicamente en:

`+0.35`

ni otro porcentaje arbitrario que sustituya a un combate real.

Ya existen sistemas reales que deben reutilizarse:

- `simulateCombat`;
- `resolveCombatOnShips`;
- `handleInterceptInvasion`;
- `tacticalEvent`;
- `combatLog`;
- `fleetReturnEvents`;
- `assignShipsToMission`;
- `returnShipsToPlanet`.

Reutiliza estos mecanismos.

La intercepción de espionaje debe integrarse con el sistema de combate existente cuando corresponda.

Debe poder producir:

- detección;
- combate;
- pérdidas reales;
- destrucción del probe;
- supervivencia de unidades;
- regreso de unidades;
- registros;
- eventos;
- trazabilidad.

No inventes un segundo simulador de combate.

--------------------------------------------------
### 6.1 PATRULLAS

La auditoría detectó que:

- `patrol.fleet` no se lee;
- `patrolType` prácticamente no participa;
- las patrullas pueden perderse durante migración/carga.

Debes comprobar:

- creación;
- almacenamiento;
- persistencia;
- carga;
- migración;
- participación real en la intercepción;
- pérdidas;
- retorno.

--------------------------------------------------
### 6.2 CLAMP / POTENCIA DE INTERCEPCIÓN

Revisa especialmente el orden de los cálculos.

La auditoría detectó que el bonus de patrulla puede terminar siendo mucho más poderoso de lo previsto debido al orden del clamp.

No basta con cambiar un número.

Debes comprobar matemáticamente el resultado de:

- defensa básica;
- mejoras;
- patrullas;
- sensores;
- investigación;
- contramedidas.

Y garantizar que el resultado respeta los límites previstos por el diseño.

==================================================
FASE 7 — CERRAR FUGAS DE INFORMACIÓN
==================================================

Este punto es obligatorio.

El espionaje no tiene sentido si otras pantallas muestran directamente la información que debería descubrirse mediante espionaje.

Debes auditar y corregir, como mínimo:

### CombatSimulatorModal
Actualmente puede mostrar información exacta de:

- flota;
- defensas;
- investigación.

Eso puede saltarse completamente el espionaje.

Debes determinar qué información es legítimamente pública y qué información requiere inteligencia.

No elimines la funcionalidad de combate.

Haz que respete la clasificación de información del juego.

### GalacticObservatoryPage
La auditoría detectó exposición exacta de:

- recursos;
- flota;
- defensas.

Revisa qué debe ser público y qué debe requerir inteligencia.

### DiplomacyChat
Actualmente determinadas relaciones pueden permitir consultar flota enemiga exacta.

Eso también debe respetar el sistema de inteligencia.

### EspionageBriefPanel
No debe mostrar directamente un porcentaje exacto de detección si ese dato representa información interna del defensor.

El atacante no debe recibir información privilegiada del sistema de contraespionaje.

### IncomingInvasionsAlert
Revisa si la composición exacta de una flota entrante es legítimamente conocida por los sensores/radar existentes o si está revelando información que debería requerir una mecánica concreta.

### GalaxyPage
Revisa la exposición de niveles internos de IA.

### Political Profile / Observatory
Revisa qué información política es pública y cuál debe clasificarse.

IMPORTANTE:

No ocultes indiscriminadamente información que el jugador debería conocer.

Clasifica primero:

A = información pública/observable por sistemas existentes.

B = información diplomática/política legítimamente visible.

C = información condicionada por relaciones/sistemas existentes.

D = inteligencia privada obtenida mediante espionaje.

Y aplica esa clasificación coherentemente.

==================================================
FASE 8 — DISCOVERED / GALAXIA CONOCIDA
==================================================

La auditoría detectó incoherencias en `discovered`.

También se observó que determinadas migraciones pueden marcar información como descubierta de forma demasiado amplia.

Debes revisar:

- creación de partidas nuevas;
- partidas antiguas;
- migraciones;
- galaxias conocidas;
- planetas descubiertos;
- observación;
- espionaje.

No permitas que una migración convierta accidentalmente toda la galaxia en información conocida si el diseño actual no lo contempla.

==================================================
FASE 9 — OTROS REGRESOS Y REGRESIONES DETECTADOS
==================================================

Además del espionaje, revisa los siguientes problemas encontrados durante la auditoría.

### combatMission.js
La búsqueda de informe mediante `.find()` se modificó de forma que puede utilizar el último informe global en lugar del informe correspondiente.

Corrígelo según la fuente de inteligencia correcta.

### fleetMissionActions.js
La presencia de `espionageProbe` puede provocar rechazo de flotas que contienen probe.

Comprueba todas las misiones afectadas.

No rompas:

- ataque;
- transporte;
- colonización;
- exploración;
- espionaje;
- retorno.

### fleetMissionActions.js
Existe una operación tipo:

`crystal -= 0`

que puede provocar `NaN` si la propiedad no existe.

Corrige la causa de forma segura.

### missionMeta
Revisa si la propagación de metadata puede sobrescribir:

- probes;
- phase;
- cost;
- datos de misión.

### persistenceContract
La auditoría detectó que únicamente inspecciona determinadas rutas (`src/reducers/**`) y puede no cubrir datos persistidos desde `src/missions/**`.

Amplía el contrato si realmente es necesario, sin convertirlo en una refactorización general.

==================================================
FASE 10 — SPOT EXCHANGE
==================================================

Este problema es independiente del espionaje, pero la auditoría detectó una regresión importante anterior:

`spotExchange` no aparece correctamente incluido en `GLOBAL_STATE_KEYS`.

Esto provoca que el mercado pueda perderse después de guardar.

NO mezcles innecesariamente esta reparación con el sistema de espionaje.

Pero sí debes:

1. Corregir la persistencia de `spotExchange`.
2. Verificar:
   - órdenes;
   - ejecuciones;
   - velas;
   - estadísticas;
   - guardado;
   - carga;
   - reinicio.
3. Añadir una prueba de persistencia real.

==================================================
FASE 11 — OTROS PROBLEMAS DE PERSISTENCIA DETECTADOS
==================================================

Revisa también:

- `ships.session_id` quedando NULL y siendo asignado incorrectamente a múltiples sesiones;
- `dbResolveCombatShips` cuando recibe una misión desconocida;
- probes que puedan quedar `in_flight` después de errores;
- migraciones;
- carga de partidas;
- reinicios.

No hagas una refactorización general.

Corrige únicamente los problemas demostrados.

==================================================
FASE 12 — TESTS REALES, NO TESTS DE TEXTO
==================================================

Esta fase es crítica.

La auditoría detectó que existen muchos tests que simplemente hacen:

`readFileSync + toContain`

Eso no demuestra que el juego funcione.

Debes reducir la dependencia de tests que únicamente inspeccionan texto fuente.

Necesito pruebas que ejecuten comportamiento real.

--------------------------------------------------
### 12.1 INTEGRACIÓN

Debes crear/verificar tests que ejecuten realmente:

- creación de misión de espionaje;
- lanzamiento;
- tick;
- llegada;
- resolución;
- resultado;
- persistencia;
- carga;
- regreso/intercepción.

--------------------------------------------------
### 12.2 COMPONENTES

El crash de `EspionageBriefPanel` no fue detectado porque no había montaje real del componente.

Debes añadir una prueba de renderizado real.

La prueba debe demostrar que:

- el componente monta;
- muestra datos;
- permite seleccionar espionaje;
- ejecuta la acción;
- no produce `ReferenceError`.

--------------------------------------------------
### 12.3 SQLITE

Debe existir al menos una prueba que demuestre realmente:

1. escribir estado;
2. guardar;
3. cerrar/reiniciar contexto;
4. volver a cargar;
5. comprobar que la inteligencia sigue existiendo.

Lo mismo debe probarse para:

- mejoras de ministerios;
- investigación;
- probes;
- misiones;
- spotExchange.

--------------------------------------------------
### 12.4 TEST DE OBJETIVOS MÚLTIPLES

Obligatorio:

A → espionaje A

B → espionaje B

A → ataque A

El ataque a A debe utilizar inteligencia de A.

Nunca la última inteligencia global.

--------------------------------------------------
### 12.5 TEST DE UNKNOWN

Obligatorio:

- información exacta;
- informe posterior desconocido;
- comprobar que la información exacta no se destruye.

--------------------------------------------------
### 12.6 TEST DE INTERCEPCIÓN

Debe comprobar:

- probe enviado;
- defensa/patrulla real;
- intercepción;
- combate;
- pérdidas;
- resultado;
- persistencia;
- retorno o destrucción.

No acepto un test que únicamente compruebe que un número cambia de porcentaje.

==================================================
FASE 13 — AUDITORÍA DE BOTONES Y NAVEGACIÓN
==================================================

Aprovecha la reparación para comprobar que todo lo relacionado con espionaje funciona realmente:

- botón Espiar;
- tarjetas;
- pestañas;
- navegación;
- regreso;
- informes;
- dossier;
- acciones de flota;
- acciones de ministerios;
- observatorio;
- diplomacia.

Ningún botón puede:

- no hacer nada;
- requerir doble clic;
- desaparecer sin motivo;
- llevar a una pantalla equivocada;
- abrir una pantalla duplicada;
- ejecutar una acción distinta de la indicada.

No cambies la arquitectura de navegación si no es necesario.

==================================================
FASE 14 — BUILD Y VALIDACIÓN FINAL
==================================================

NO hagas el build como sustituto de las pruebas.

Primero:

1. tests unitarios;
2. tests de integración;
3. tests de componentes;
4. persistencia SQLite;
5. pruebas de navegación;
6. pruebas de espionaje;
7. pruebas de intercepción;
8. pruebas de IA.

Después ejecuta:

- build;
- comprobación de errores;
- smoke test real.

El antiguo E2E de Supabase NO debe restaurarse.

Si existe un smoke test heredado de la arquitectura antigua, trátalo como legacy y no introduzcas Supabase para hacerlo pasar.

Si necesitas un smoke test, crea/adapta uno coherente con la arquitectura SQLite actual.

==================================================
FASE 15 — VALIDACIÓN END-TO-END OBLIGATORIA
==================================================

Antes de considerar terminado el trabajo, debes poder demostrar esta secuencia completa:

JUGADOR A
↓
construye/dispone de espionageProbe
↓
selecciona planeta B
↓
abre Espiar
↓
EspionageBriefPanel funciona
↓
lanza probe
↓
se descuenta correctamente el coste
↓
se registra la misión
↓
el probe viaja
↓
el sistema de defensa de B se calcula realmente
↓
ministerios/investigación/patrullas afectan realmente
↓
se resuelve espionaje
↓
si no es detectado:
   obtiene información
↓
si es detectado:
   existe detección real
↓
si existe intercepción:
   se ejecuta combate real
↓
se registran pérdidas/resultados
↓
el informe se persiste
↓
planetIntel se actualiza
↓
el dossier refleja correctamente la información
↓
el bonus de combate de B utiliza esa inteligencia
↓
la información caduca cuando corresponde
↓
una nueva observación puede actualizarla
↓
si la IA espía al jugador:
   utiliza un probe real
   paga coste
   viaja
   se resuelve
   puede ser interceptada
   puede regresar
   deja trazabilidad
↓
todo sobrevive a guardar/cerrar/cargar.

==================================================
REGLAS ABSOLUTAS
==================================================

1. NO Supabase.
2. NO arquitectura externa.
3. NO referencias a otros juegos/proyectos.
4. NO sistemas duplicados.
5. NO nuevas pantallas innecesarias.
6. NO refactorización general.
7. NO soluciones simuladas únicamente para satisfacer tests.
8. NO tests que simplemente comprueben texto fuente como sustituto de comportamiento.
9. NO información secreta mostrada por UI sin pasar por la lógica de inteligencia correspondiente.
10. NO espionaje IA ficticio.
11. NO intercepción ficticia mediante un simple porcentaje.
12. NO `???` sobrescribiendo información válida.
13. NO bonus de combate basado en el último informe global.
14. NO mejoras de ministerio que el juego guarda pero que la lógica no utiliza.
15. NO investigación que se paga pero que no afecta al espionaje.
16. NO probes que desaparecen por falta de una rama de retorno.
17. NO `NaN`.
18. NO misiones eternamente atascadas.
19. NO botones muertos.
20. NO doble clic obligatorio.
21. NO regresiones de las misiones existentes.
22. NO modificar commits históricos ni hacer amend salvo autorización explícita.
23. NO dar por terminado el trabajo porque "los tests pasan" si los tests no ejecutan el comportamiento real.

==================================================
FORMA DE TRABAJO
==================================================

Trabaja por fases.

Después de cada fase:

- ejecuta las pruebas relevantes;
- inspecciona los cambios;
- comprueba que no introduces regresiones;
- verifica persistencia cuando corresponda;
- informa de qué se ha corregido realmente;
- informa de qué pruebas lo demuestran;
- indica cualquier problema que impida continuar.

NO saltes directamente al final.

Empieza por la FASE 0 y después ejecuta únicamente la FASE 1.

Cuando la FASE 1 esté completamente corregida y verificada, continúa con la FASE 2.

No avances a una fase posterior simplemente porque una prueba superficial pase.

El criterio de finalización es que el sistema funcione realmente de extremo a extremo dentro de la arquitectura actual de Juego Ascensión.