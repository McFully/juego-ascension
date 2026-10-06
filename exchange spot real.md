ACTUALIZACIÓN MAYOR DEL SISTEMA ECONÓMICO DE ASCENSION
IMPLEMENTACIÓN DE UN EXCHANGE SPOT REAL EN LA LONJA GALÁCTICA
INTEGRADO CON EL TERMINAL BURSÁTIL CUÁNTICO Y EL ACCESO FÍSICO AL MERCADO

============================================================
0. OBJETIVO GENERAL
============================================================

Quiero transformar el sistema actual relacionado con la bolsa/mercado de la Lonja Galáctica de Ascension en un sistema de EXCHANGE SPOT REAL, funcional y persistente dentro de la simulación económica del juego.

El objetivo NO es crear simplemente una interfaz que parezca una bolsa.

Quiero implementar un mercado con:

- Libro de órdenes real.
- Órdenes de compra.
- Órdenes de venta.
- Matching real entre contrapartes.
- Ejecuciones parciales.
- Ejecuciones completas.
- Precio determinado por oferta y demanda.
- Profundidad de mercado.
- Bid.
- Ask.
- Spread.
- Volumen.
- Historial de operaciones.
- Gráficas.
- Velas.
- OHLCV.
- Market orders.
- Limit orders.
- Stop orders.
- Stop-Limit.
- Take-Profit cuando sea coherente con la arquitectura.
- Cancelación.
- Modificación.
- Expiración.
- Reservas/bloqueos de activos.
- Liquidación real.
- Trazabilidad.
- Persistencia.
- Control de concurrencia.
- Protección contra doble ejecución.
- Integración con jugadores.
- Integración con facciones autónomas.
- Integración con la IA como participante estratégico, NO como motor de ejecución.

El principio económico fundamental será:

UNA ORDEN NO ES UNA OPERACIÓN.

Una orden únicamente expresa intención de compra o venta.

UNA OPERACIÓN SOLO EXISTE CUANDO EXISTE UNA CONTRAPARTE COMPATIBLE Y EL MATCHING ENGINE EJECUTA EL INTERCAMBIO.

============================================================
1. DECISIÓN ARQUITECTÓNICA: NO ASUMIR DE ANTEMANO
============================================================

ANTES DE IMPLEMENTAR NADA, AUDITA COMPLETAMENTE EL SISTEMA ACTUAL.

En particular, analiza:

- La tarjeta actual de "Terminal Bursátil Cuántico".
- La tarjeta de la "Lonja Galáctica".
- La pantalla de Alto Mando Comercial.
- El sistema actual de mercados.
- El sistema actual de compra/venta.
- El sistema de recursos.
- El sistema monetario.
- El sistema de facciones.
- El sistema de comercio.
- La presencia física de naves en planetas.
- Los permisos/accesos actuales.
- La base de datos.
- Las tablas existentes.
- Las relaciones existentes.
- La arquitectura frontend.
- La arquitectura backend.
- Los servicios existentes.
- Los sistemas de eventos.
- Los sistemas de tiempo.
- La API de IA existente.
- Los sistemas de persistencia.
- Cualquier mercado o bolsa ya implementado.

NO decidas automáticamente que hay que crear una tarjeta nueva.

Quiero que tú, Antigravity, determines mediante auditoría cuál de estas arquitecturas es técnicamente y jugablemente superior:

A) Evolucionar el actual "Terminal Bursátil Cuántico" hasta convertirlo en el Exchange Spot de la Lonja Galáctica.

B) Crear una nueva tarjeta específica dentro del Alto Mando Comercial dedicada al Exchange Spot y mantener el Terminal Bursátil Cuántico como otro sistema.

C) Reestructurar ambas funcionalidades dentro de una arquitectura común, si esto resulta más limpio y coherente.

La decisión debe basarse en:

- Arquitectura actual.
- UX.
- Coherencia temática.
- Evitar duplicación.
- Mantenibilidad.
- Escalabilidad.
- Rendimiento.
- Integración futura.
- Coherencia con el sistema económico.
- Experiencia del jugador.

NO quiero duplicar funcionalidades simplemente por añadir una nueva tarjeta.

Antes de modificar código, presenta internamente un análisis técnico de qué opción es la adecuada y después implementa la opción que tenga mayor sentido.

============================================================
2. CONCEPTO DE ACCESO FÍSICO AL EXCHANGE
============================================================

El Exchange Spot debe estar vinculado físicamente a la Lonja Galáctica.

La intención de diseño es:

EL MERCADO NO ES UNIVERSALMENTE VISIBLE DESDE CUALQUIER LUGAR DEL UNIVERSO.

Para acceder al mercado de una determinada Lonja:

- La entidad/jugador/facción deberá haber llegado físicamente al planeta correspondiente.
- Deberá existir presencia válida en dicho planeta según las reglas actuales de Ascension.
- El sistema deberá determinar si el jugador/facción tiene derecho de acceso.
- Solo entonces podrá consultar las cotizaciones de ese mercado.

IMPORTANTE:

"Estar allí" debe convertirse en una regla real del juego, no simplemente en una condición visual del frontend.

No debe bastar con abrir una URL o una pantalla.

El backend debe comprobar que la entidad posee presencia válida en el planeta.

============================================================
3. REGLA DE ACCESO BASADA EN LLEGADA/PRESENCIA
============================================================

Analiza el sistema actual de llegada de naves y presencia planetaria.

Determina exactamente qué significa:

- Haber arribado.
- Tener una nave presente.
- Tener una flota presente.
- Tener una base.
- Tener una infraestructura.
- Estar atracado.
- Controlar el planeta.
- Tener permiso comercial.

NO inventes una definición paralela si ya existe una regla válida.

Reutiliza el sistema existente siempre que sea posible.

El acceso al Exchange debe comprobarse server-side.

NO confiar únicamente en:

- Estado del frontend.
- Variables locales.
- React state.
- Parámetros enviados por el cliente.
- Flags manipulables.

El backend debe verificar la condición real.

============================================================
4. VISIBILIDAD DE LAS COTIZACIONES
============================================================

Quiero que las cotizaciones del Exchange sean información contextual.

Si el jugador no tiene acceso legítimo al mercado:

- No debería poder consultar el order book.
- No debería poder consultar precios actuales.
- No debería poder consultar profundidad.
- No debería poder consultar operaciones recientes.
- No debería poder colocar órdenes.
- No debería poder cancelar órdenes desde fuera si las reglas del juego no lo permiten.

Si tiene acceso:

Debe poder consultar el mercado correspondiente.

IMPORTANTE:

Determina si las órdenes abiertas deberían seguir siendo gestionables remotamente después de abandonar el planeta.

NO lo decidas arbitrariamente.

Analiza la lógica económica y determina si tiene más sentido:

A) exigir presencia para consultar y operar;

B) exigir presencia solo para acceder al terminal, pero permitir gestión remota de órdenes ya existentes;

C) establecer diferentes niveles de acceso.

La decisión debe quedar documentada y ser coherente con la lógica del universo.

============================================================
5. MERCADOS LOCALES
============================================================

El sistema debe estar preparado para que cada Lonja Galáctica pueda tener su propio mercado.

Por ejemplo:

PLANETA A
Exchange de Titanio

PLANETA B
Exchange de Titanio

PLANETA C
Exchange de Titanio

Estos mercados pueden tener:

- Precios diferentes.
- Liquidez diferente.
- Volumen diferente.
- Profundidad diferente.
- Participantes diferentes.
- Oferta diferente.
- Demanda diferente.

NO crear automáticamente un precio universal si el diseño actual del juego no lo requiere.

Quiero que el sistema permita verdaderos mercados locales.

Esto permitirá posteriormente:

ARBITRAJE ENTRE PLANETAS.

Ejemplo:

Titanio en planeta A:
100 créditos.

Titanio en planeta B:
127 créditos.

Una facción podría comprar en A y vender en B si:

- Tiene liquidez.
- Tiene logística.
- Tiene capacidad de transporte.
- Tiene acceso.
- El coste de transporte lo permite.
- El riesgo lo permite.

El precio NO debe igualarse mágicamente.

============================================================
6. ORDER BOOK REAL
============================================================

Crear un libro de órdenes real para cada mercado/instrumento.

Cada instrumento deberá poder tener:

ASKS / VENTAS

Precio | Cantidad | Nº órdenes

Y:

BIDS / COMPRAS

Precio | Cantidad | Nº órdenes

La interfaz debe mostrar:

- Mejor Bid.
- Mejor Ask.
- Spread.
- Profundidad.
- Precio último.
- Volumen.
- Variación.
- Máximo.
- Mínimo.
- Apertura.
- Cierre anterior.
- Volumen acumulado.
- Historial de trades.

============================================================
7. PRIORIDAD PRECIO-TIEMPO
============================================================

Implementar un matching engine basado en una regla clara de prioridad.

Para órdenes compatibles:

1. Mejor precio.
2. A igualdad de precio, mayor antigüedad.

Por tanto:

PRECIO → prioridad principal.

TIEMPO → prioridad secundaria.

No utilizar orden aleatorio.

No ejecutar primero la orden que simplemente aparezca primero en una consulta frontend.

La prioridad debe residir en el backend/matching engine.

============================================================
8. EJEMPLO DE MATCHING
============================================================

Ejemplo:

VENDEDOR A:

1.000 unidades de Titanio
Precio mínimo: 100 créditos

COMPRADOR B:

600 unidades
Precio máximo: 105 créditos

Existe compatibilidad.

Debe ejecutarse:

600 Titanio
a 100 créditos

Resultado:

Comprador:
-600 créditos
+600 Titanio

Vendedor:
+60.000 créditos
-600 Titanio

Orden del vendedor:

1.000 → 400 restantes.

La orden NO desaparece.

Continúa abierta con:

400 Titanio @ 100.

============================================================
9. NUNCA CREAR DINERO POR VENDER
============================================================

ESTA ES UNA REGLA ABSOLUTA.

NO permitir:

"Jugador vende 1.000 Titanio → sistema le entrega inmediatamente 100.000 créditos."

Eso es INCORRECTO.

Debe ser:

"Jugador coloca 1.000 Titanio a 100 créditos."

Después:

Si nadie compra:
- 0 créditos recibidos.
- 1.000 Titanio siguen bloqueados/reservados.
- Orden permanece abierta.

Si alguien compra 300:
- Se ejecutan 300.
- Se reciben 30.000 créditos.
- Quedan 700 en la orden.

Si alguien compra otros 700:
- Se completa.
- Se reciben otros 70.000 créditos.

SOLO LAS EJECUCIONES GENERAN LIQUIDACIÓN.

============================================================
10. RESERVA DE ACTIVOS
============================================================

Cuando un jugador/facción coloque una orden de venta:

Los recursos necesarios deben quedar reservados.

Ejemplo:

Tiene:
10.000 Titanio.

Coloca:

8.000 Titanio @ 100.

Debe quedar:

Disponible:
2.000

Reservado en Exchange:
8.000

NO permitir gastar/vender simultáneamente esos mismos 8.000 desde otro sistema.

Lo mismo para órdenes de compra.

Si coloca:

8.000 Titanio @ 100.

Debe reservarse la liquidez necesaria:

800.000 créditos.

Esos créditos NO deben poder gastarse simultáneamente en otra operación.

============================================================
11. LIQUIDACIÓN ATÓMICA
============================================================

La ejecución de una operación debe ser atómica.

O se ejecutan correctamente todas las transferencias o no se ejecuta ninguna.

Nunca permitir:

- Recursos transferidos sin créditos.
- Créditos transferidos sin recursos.
- Doble ejecución.
- Ejecución parcial inconsistente.
- Saldo negativo generado por carrera de procesos.
- Duplicación de activos.

Debe existir control de concurrencia apropiado.

============================================================
12. MARKET ORDERS
============================================================

Implementar Market Order.

Una Market Buy debe consumir las órdenes de venta disponibles empezando por el mejor Ask.

Ejemplo:

ASK:

100 → 500
101 → 700
103 → 1.000

Market Buy:

1.200

Resultado:

500 @ 100
700 @ 101

Total:
1.200

NO debe ejecutar las 1.200 al precio 100.

Debe existir:

PRICE-TIME PRIORITY + MARKET DEPTH.

============================================================
13. LIMIT ORDERS
============================================================

Implementar:

BUY LIMIT

El comprador establece el precio máximo que está dispuesto a pagar.

SELL LIMIT

El vendedor establece el precio mínimo que acepta.

Si no existe compatibilidad:

La orden permanece abierta.

============================================================
14. STOP ORDERS
============================================================

Implementar Stop Orders de forma correcta.

Una Stop Order NO debe ejecutarse inmediatamente.

Debe permanecer pendiente hasta que el precio de activación sea alcanzado.

Al activarse, debe convertirse en la orden correspondiente según la especificación del sistema.

============================================================
15. STOP-LIMIT
============================================================

Implementar:

Stop Price
+
Limit Price

Ejemplo:

Stop:
100

Limit:
99

Cuando el mercado alcanza el stop:

La orden se activa como Limit @ 99.

IMPORTANTE:

Puede no ejecutarse si no existe contraparte compatible.

NO garantizar ejecución.

============================================================
16. TAKE PROFIT
============================================================

Si resulta coherente con la arquitectura, implementar órdenes Take-Profit o mecanismos equivalentes.

Deben respetar exactamente las mismas reglas:

- Activación.
- Matching.
- Liquidez.
- Precio.
- Contraparte.
- Ejecución parcial.

============================================================
17. CANCELACIÓN
============================================================

El usuario debe poder cancelar una orden abierta.

Al cancelar:

- Liberar recursos reservados.
- Liberar créditos reservados.
- Marcar orden como cancelada.
- Registrar timestamp.
- Registrar quién canceló.
- Registrar motivo si existe.

Nunca borrar físicamente el historial de una orden ejecutada/cancelada si ello destruye trazabilidad.

============================================================
18. MODIFICACIÓN
============================================================

Analiza cómo implementar modificación de órdenes.

IMPORTANTE:

Modificar precio o cantidad puede alterar la prioridad temporal.

Por ejemplo:

Cambiar el precio de una orden debería normalmente generar una nueva prioridad temporal.

No permitir que alguien mantenga artificialmente una posición antigua del order book mientras cambia repetidamente su precio.

Implementar la política correcta de prioridad.

============================================================
19. EJECUCIONES PARCIALES
============================================================

Debe soportarse:

Orden:
10.000

Contrapartida:
2.500

Resultado:
2.500 ejecutadas.

Restantes:
7.500.

La orden sigue viva.

============================================================
20. HISTORIAL DE TRADES
============================================================

Cada ejecución debe generar un registro independiente.

Registrar:

- Trade ID.
- Market ID.
- Instrument ID.
- Buy Order ID.
- Sell Order ID.
- Buyer.
- Seller.
- Precio.
- Cantidad.
- Valor total.
- Timestamp.
- Mercado/planeta.
- Fees.
- Estado.

Nunca modificar retrospectivamente una operación ya liquidada salvo mediante mecanismos explícitos de corrección/auditoría.

============================================================
21. DESCUBRIMIENTO DEL PRECIO
============================================================

El precio del recurso NO debe ser impuesto artificialmente.

Debe surgir del mercado.

El sistema debe poder calcular:

- Último precio.
- Mejor Bid.
- Mejor Ask.
- Spread.
- Precio de apertura.
- Máximo.
- Mínimo.
- Cierre.
- Volumen.
- VWAP.
- Variación porcentual.
- Volumen por intervalo.

El precio debe ser consecuencia de trades reales.

============================================================
22. GRÁFICAS
============================================================

La interfaz del Exchange debe disponer de gráficos financieros reales.

Como mínimo:

- Candlestick.
- Línea de precio.
- Volumen.

Intervalos:

- 1m.
- 5m.
- 15m.
- 1h.
- 4h.
- 1d.

Si la arquitectura temporal de Ascension requiere otra granularidad, adáptala.

Las velas deben generarse a partir de operaciones reales:

OPEN
HIGH
LOW
CLOSE
VOLUME

NO generar velas artificiales independientes del order book.

============================================================
23. PROFUNDIDAD DE MERCADO
============================================================

Mostrar profundidad.

Ejemplo:

ASK

130 — 500
129 — 800
128 — 1.200

----------------

LAST: 127

----------------

BID

126 — 900
125 — 1.500
124 — 2.100

Mostrar gráficamente la profundidad acumulada.

============================================================
24. TERMINAL DE TRADING
============================================================

La interfaz debe parecer un auténtico terminal bursátil, pero integrado visualmente con la identidad tecnológica de Ascension.

Debe incluir como mínimo:

- Selector de mercado.
- Selector de recurso.
- Precio actual.
- Variación.
- Bid.
- Ask.
- Spread.
- Volumen.
- Order Book.
- Gráfico.
- Historial de operaciones.
- Panel de creación de órdenes.
- Órdenes abiertas.
- Órdenes ejecutadas.
- Órdenes canceladas.
- Balances disponibles.
- Activos reservados.
- Historial de operaciones propias.

No diseñar simplemente una pantalla decorativa.

TODOS LOS ELEMENTOS DEBEN ESTAR CONECTADOS A DATOS REALES.

============================================================
25. PANEL DE CREACIÓN DE ORDEN
============================================================

Debe permitir seleccionar:

TIPO:

- Market.
- Limit.
- Stop.
- Stop-Limit.
- Take-Profit si está implementado.

LADO:

- Comprar.
- Vender.

Cantidad.

Precio.

Stop Price cuando corresponda.

Limit Price cuando corresponda.

Vigencia cuando corresponda.

Antes de confirmar:

Mostrar:

- Cantidad.
- Precio.
- Coste estimado.
- Liquidez disponible.
- Fondos reservados.
- Fees.
- Riesgos.
- Resultado esperado.

============================================================
26. COSTES Y COMISIONES
============================================================

Audita primero si Ascension ya tiene sistema de comisiones.

Si existe:

Integrarlo.

Si no existe:

No inventar arbitrariamente una economía paralela.

Diseñar la comisión como parámetro configurable del exchange.

Debe quedar claro:

- Quién paga.
- Cuándo se cobra.
- En qué moneda.
- Cómo se contabiliza.
- Cómo aparece en el trade.

============================================================
27. IA COMO PARTICIPANTE DEL MERCADO
============================================================

Integrar este Exchange con el sistema de facciones autónomas y la API de IA existente.

Pero con una regla fundamental:

LA IA NO EJECUTA TRADES.

La IA puede decidir:

"Quiero comprar 20.000 Titanio."

El sistema determina:

- Si puede.
- Cuánto puede.
- A qué precio.
- Qué orden debe crear.
- Si tiene sentido Market o Limit.
- Qué riesgo asume.

Después el Exchange decide si existe contraparte.

La IA no puede decir:

"Compra 20.000 Titanio y recibe inmediatamente los recursos."

Debe pasar siempre por el mercado.

============================================================
28. FACCIONES AUTÓNOMAS COMO PARTICIPANTES
============================================================

Todas las facciones relevantes podrán participar en los mercados.

Pueden:

- Comprar.
- Vender.
- Mantener posiciones.
- Acumular recursos.
- Liquidar reservas.
- Buscar liquidez.
- Especular.
- Cubrir necesidades.
- Comprar para producción.
- Vender excedentes.
- Reaccionar ante escasez.
- Reaccionar ante guerras.
- Reaccionar ante cambios de precio.

Sus decisiones deben integrarse con el sistema de IA autónoma definido anteriormente.

============================================================
29. MERCADO Y ECONOMÍA REAL DEL JUEGO
============================================================

El Exchange debe estar conectado a la economía real de Ascension.

Si una empresa produce:

10.000 Titanio.

Ese Titanio puede terminar:

- En inventario.
- En reserva.
- En una orden de venta.
- En una venta ejecutada.
- En consumo industrial.

NO duplicar recursos.

Los recursos deben tener trazabilidad.

============================================================
30. ARBITRAJE
============================================================

La arquitectura debe quedar preparada para permitir posteriormente arbitraje entre mercados.

Ejemplo:

Planeta A:
Titanio = 100

Planeta B:
Titanio = 130

Una facción puede intentar:

Comprar A.
Transportar.
Vender B.

Pero el resultado económico debe considerar:

- Transporte.
- Tiempo.
- Combustible.
- Riesgo.
- Capacidad de carga.
- Acceso.
- Seguridad.
- Distancia.
- Posibles bloqueos.

NO implementar un sistema de arbitraje mágico.

Preparar la arquitectura para ello.

============================================================
31. ACCESO FÍSICO Y DESCUBRIMIENTO
============================================================

Determina si el hecho de que una nave llegue primero al planeta debe:

A) otorgar automáticamente acceso al mercado;

B) registrar a esa entidad como participante;

C) desbloquear el mercado para esa entidad;

D) simplemente permitir consultar el mercado;

E) depender de una infraestructura concreta de la Lonja.

NO asumir la respuesta.

Analiza el sistema actual de:

- Arribo de naves.
- Infraestructura planetaria.
- Comercio.
- Puertos.
- Lonjas.
- Control planetario.
- Permisos.

Después determina la regla más coherente.

El requisito del diseño es:

EL MERCADO DEBE ESTAR VINCULADO A LA PRESENCIA/ACCESO FÍSICO AL MERCADO.

============================================================
32. DATOS EN TIEMPO REAL
============================================================

Cuando el usuario esté viendo un mercado:

Debe poder observar cambios reales del order book.

Si otra facción ejecuta una operación:

El usuario debe poder ver:

- Cambio del precio.
- Cambio del volumen.
- Cambio del order book.
- Nueva operación.
- Actualización de la gráfica.

Si la arquitectura permite tiempo real mediante WebSockets/realtime:

Utilizarlo.

Si existe ya infraestructura realtime en Supabase/PostgreSQL:

Reutilizarla.

NO crear polling agresivo si existe una solución realtime adecuada.

============================================================
33. CONCURRENCIA
============================================================

Este punto es CRÍTICO.

Puede haber simultáneamente:

- Jugadores.
- Facciones.
- IA.
- Eventos automáticos.
- Procesos económicos.

Todos pueden intentar operar simultáneamente.

El matching engine debe ser seguro frente a:

- Race conditions.
- Doble consumo.
- Doble venta.
- Doble ejecución.
- Saldos negativos.
- Reservas inconsistentes.

Diseñar correctamente:

- Locks.
- Transactions.
- Constraints.
- Idempotency.
- Ordenación.
- Control de versiones cuando sea necesario.

============================================================
34. IDEMPOTENCIA
============================================================

Una misma orden o evento NO puede ejecutarse dos veces por:

- Reintento.
- Timeout.
- Doble click.
- Reconexión.
- Error de red.
- Reenvío de petición.

Cada acción crítica debe disponer de mecanismo idempotente.

============================================================
35. DOBLE CLICK Y PROBLEMAS DE INTERFAZ
============================================================

En Ascension ya se ha detectado que algunas acciones pueden requerir aparentemente doble click o comportarse como si el primer click no hubiera funcionado.

Al implementar el Exchange:

AUDITA ESPECÍFICAMENTE ESTO.

Todas las acciones deben responder correctamente a un único click.

Evitar:

- Doble ejecución.
- Botones que parecen no responder.
- Eventos duplicados.
- Debounce incorrecto.
- Estados de loading defectuosos.
- Race conditions frontend.

Un botón de:

"Comprar"

debe ejecutar una única intención de compra.

Nunca dos.

============================================================
36. SEGURIDAD
============================================================

El servidor debe ser la autoridad absoluta.

Nunca confiar en:

- Precio enviado por frontend.
- Balance enviado por frontend.
- Inventario enviado por frontend.
- Permiso enviado por frontend.
- Estado de presencia enviado por frontend.

Todo debe recalcularse/verificarse server-side.

============================================================
37. BASE DE DATOS
============================================================

Audita la base de datos existente.

Determina si son necesarias nuevas entidades/tablas para:

- Markets.
- Instruments.
- Orders.
- Order states.
- Order book.
- Trades.
- Order executions.
- Balances.
- Reservations.
- Candles/OHLCV.
- Market participants.
- Access permissions.
- Market sessions si son necesarias.
- Audit events.

NO crear tablas redundantes.

Utilizar las existentes cuando puedan ampliarse correctamente.

Toda migración debe ser segura.

============================================================
38. ESTADOS DE UNA ORDEN
============================================================

Como mínimo contemplar:

- PENDING.
- OPEN.
- PARTIALLY_FILLED.
- FILLED.
- CANCELLED.
- EXPIRED.
- REJECTED.
- TRIGGERED cuando sea necesario.

Los estados deben ser coherentes y auditables.

============================================================
39. ESTADOS DE UNA OPERACIÓN
============================================================

Un trade ejecutado debe tener un estado inequívoco.

La liquidación debe permitir verificar:

Orden compra
+
Orden venta
+
Trade
+
Transferencia de activo
+
Transferencia monetaria

Todo debe poder reconstruirse posteriormente.

============================================================
40. AUDITORÍA ECONÓMICA
============================================================

Crear trazabilidad completa.

Debe poder responderse:

¿Quién vendió?

¿Quién compró?

¿Qué recurso?

¿Cuánta cantidad?

¿A qué precio?

¿En qué mercado?

¿En qué planeta?

¿Cuándo?

¿Qué órdenes participaron?

¿Qué saldo tenía cada participante?

¿Qué quedó reservado?

¿Qué se liquidó?

¿Qué comisión se aplicó?

¿Qué saldo quedó después?

============================================================
41. NO MANIPULAR ARTIFICIALMENTE LOS PRECIOS
============================================================

No crear:

- Precio mínimo artificial.
- Precio máximo artificial.
- Compra automática de respaldo.
- Venta automática de respaldo.
- NPC comprador universal.
- NPC vendedor universal.

Si no existe contraparte:

NO HAY TRADE.

El mercado puede quedarse sin liquidez.

Eso es correcto.

============================================================
42. LIQUIDEZ
============================================================

La liquidez debe surgir de los participantes reales.

Sin órdenes:

Spread enorme o mercado vacío.

Con muchas órdenes:

Mercado líquido.

El sistema debe mostrar correctamente:

- Liquidez disponible.
- Profundidad.
- Slippage estimado para Market Orders.

============================================================
43. SLIPPAGE
============================================================

Una Market Order grande puede consumir varios niveles de precio.

Mostrar al usuario una estimación del:

- Precio medio esperado.
- Coste estimado.
- Slippage.

Después ejecutar según el order book real.

============================================================
44. HISTORIAL DEL MERCADO
============================================================

El usuario debe poder consultar:

- Trades recientes.
- Histórico.
- Gráficas.
- Volumen.
- Variación.

Pero respetando la regla de acceso definida para mercados locales.

============================================================
45. INTERFAZ VISUAL
============================================================

La interfaz debe transmitir:

"Terminal financiero avanzado del futuro"

pero seguir siendo inequívocamente Ascension.

Debe ser:

- Profesional.
- Densa pero legible.
- Clara.
- Funcional.
- Consistente con el resto del juego.
- Sin elementos puramente decorativos.
- Sin botones sin función.

NO sacrificar funcionalidad por estética.

============================================================
46. INTEGRACIÓN CON LA TARJETA DE LA LONJA
============================================================

Analiza específicamente la tarjeta actual de la Lonja Galáctica y el actual "Terminal Bursátil Cuántico".

Determina:

- Qué debe permanecer.
- Qué debe transformarse.
- Qué debe eliminarse.
- Qué debe integrarse.
- Qué debe convertirse en acceso al Exchange.

Si el Terminal Bursátil Cuántico ya representa conceptualmente el mercado:

Probablemente deberá evolucionar hacia el Exchange.

Pero NO asumirlo sin auditar primero.

Si una nueva tarjeta mejora realmente la arquitectura:

Créala.

Si una nueva tarjeta solo duplica una funcionalidad existente:

NO crearla.

La decisión final debe venir de la auditoría técnica.

============================================================
47. EXPERIENCIA DEL JUGADOR
============================================================

El flujo ideal debe ser:

1. La nave llega al planeta.
2. Se registra su presencia.
3. Se habilita el acceso correspondiente.
4. El jugador entra en la Lonja Galáctica.
5. Accede al Exchange.
6. Selecciona un mercado.
7. Consulta cotizaciones.
8. Consulta order book.
9. Consulta gráfico.
10. Decide comprar/vender.
11. Coloca una orden.
12. El sistema bloquea fondos/recursos.
13. La orden entra en el libro.
14. El matching engine busca contraparte.
15. Si existe:
    - ejecuta;
    - liquida;
    - actualiza balances;
    - actualiza order book;
    - actualiza histórico;
    - actualiza gráfico.
16. Si no existe:
    - la orden permanece abierta.
17. Cuando posteriormente aparece una contraparte:
    - se ejecuta automáticamente según las reglas.

============================================================
48. NO QUIERO UNA SIMULACIÓN VISUAL
============================================================

Esto es especialmente importante.

NO quiero:

- Números que cambien artificialmente.
- Gráficas falsas.
- Order book decorativo.
- Precios generados por random.
- "Comprar" que simplemente reste créditos y cree recursos.
- "Vender" que simplemente cree créditos.
- Trades ficticios.

Quiero un mercado cuya información derive de operaciones reales.

============================================================
49. PRUEBAS DE INTEGRIDAD
============================================================

Crear pruebas automatizadas para casos como:

CASO 1:
Venta sin comprador.

Resultado:
No trade.

CASO 2:
Compra compatible.

Resultado:
Trade.

CASO 3:
Compra parcial.

Resultado:
Orden parcialmente ejecutada.

CASO 4:
Venta parcial.

Resultado:
Resto permanece abierto.

CASO 5:
Market order consume varios niveles.

Resultado:
Varios trades.

CASO 6:
Stop no alcanzado.

Resultado:
No ejecución.

CASO 7:
Stop alcanzado pero sin liquidez.

Resultado:
No ejecución o comportamiento definido correctamente según tipo.

CASO 8:
Cancelación.

Resultado:
Fondos liberados.

CASO 9:
Dos compradores compiten al mismo precio.

Resultado:
Prioridad temporal.

CASO 10:
Dos vendedores compiten al mismo precio.

Resultado:
Prioridad temporal.

CASO 11:
Dos procesos intentan gastar los mismos fondos.

Resultado:
Solo una operación válida.

CASO 12:
Doble click.

Resultado:
Una sola orden.

CASO 13:
Reintento de petición.

Resultado:
No duplicación.

CASO 14:
API de IA caída.

Resultado:
Exchange continúa funcionando.

CASO 15:
Usuario abandona planeta.

Resultado:
Aplicar exactamente la política de acceso definida durante la auditoría.

============================================================
50. PRUEBA DE SIMULACIÓN A GRAN ESCALA
============================================================

Después de implementar:

Ejecuta simulaciones prolongadas con múltiples participantes.

Ejemplo:

- 10 facciones.
- 50 facciones.
- 100 facciones.
- Diferentes niveles de riqueza.
- Diferentes perfiles económicos.
- Diferentes planetas.
- Diferentes recursos.

Comprobar:

- Que aparecen precios.
- Que aparecen spreads.
- Que existen mercados ilíquidos.
- Que existen mercados líquidos.
- Que aparecen operaciones.
- Que las órdenes permanecen abiertas cuando no hay contrapartida.
- Que los precios evolucionan por actividad real.
- Que no aparecen recursos de la nada.
- Que no aparece dinero de la nada.
- Que los balances cuadran.
- Que el sistema escala correctamente.

============================================================
51. INTEGRACIÓN CON EL SISTEMA DE UNIVERSO VIVO
============================================================

El Exchange debe integrarse con el sistema de simulación autónoma desarrollado anteriormente.

Las guerras pueden afectar:

- Oferta.
- Demanda.
- Logística.
- Riesgo.
- Precios.

Las crisis pueden afectar:

- Liquidez.
- Demanda.
- Producción.

Las nuevas tecnologías pueden afectar:

- Consumo.
- Producción.
- Demanda.

Los bloqueos pueden afectar:

- Transporte.
- Oferta local.

Las expansiones pueden crear:

- Nuevos mercados.
- Nuevos consumidores.
- Nuevos productores.

De esta manera:

ECONOMÍA
↔
MERCADO
↔
FACCIONES
↔
DIPLOMACIA
↔
GUERRAS
↔
LOGÍSTICA
↔
PRODUCCIÓN

Todo debe poder influirse mutuamente.

============================================================
52. NO UTILIZAR LA IA PARA INVENTAR MERCADO
============================================================

La API de IA NO debe inventarse:

- Precios.
- Trades.
- Liquidez.
- Balances.
- Recursos.
- Contrapartidas.

La IA puede decidir comportamiento.

El Exchange determina la realidad económica.

============================================================
53. FALLBACK
============================================================

El Exchange debe continuar funcionando aunque:

- La API de IA falle.
- Un agente IA no responda.
- Exista timeout.
- Exista pérdida de conexión.
- Exista un error temporal del servicio de IA.

La IA es opcional para el funcionamiento del mercado.

El matching engine es fundamental.

============================================================
54. OBSERVABILIDAD
============================================================

Crear herramientas internas para poder inspeccionar:

- Order books.
- Órdenes.
- Trades.
- Balances.
- Reservas.
- Liquidez.
- Participantes.
- Errores.
- Latencia.
- Matching.
- Rechazos.
- Cancelaciones.

Debe ser posible diagnosticar por qué una orden no se ejecutó.

============================================================
55. AUDITORÍA ANTES DE IMPLEMENTACIÓN
============================================================

ANTES DE ESCRIBIR CÓDIGO:

Realiza una auditoría exhaustiva de la implementación actual.

Identifica:

- Arquitectura.
- Componentes.
- APIs.
- Servicios.
- Base de datos.
- Tablas.
- RPCs.
- funciones SQL.
- triggers.
- realtime.
- frontend.
- backend.
- tarjetas.
- navegación.
- sistemas de acceso.
- sistemas de presencia.
- sistemas de recursos.
- sistemas de moneda.
- sistemas de comercio.
- IA.

Determina qué puede reutilizarse.

Determina qué debe modificarse.

Determina qué debe eliminarse.

Determina qué debe crearse.

============================================================
56. PLAN DE IMPLEMENTACIÓN
============================================================

Después de la auditoría, genera y ejecuta un plan por fases:

FASE 1
Auditoría arquitectónica.

FASE 2
Diseño definitivo del Exchange.

FASE 3
Modelo de datos.

FASE 4
Motor de órdenes.

FASE 5
Matching engine.

FASE 6
Reservas y liquidación.

FASE 7
Mercados locales y acceso físico.

FASE 8
Integración económica.

FASE 9
Integración con facciones IA.

FASE 10
Interfaz del Exchange.

FASE 11
Gráficas y datos históricos.

FASE 12
Realtime.

FASE 13
Seguridad.

FASE 14
Pruebas.

FASE 15
Simulación prolongada.

FASE 16
Auditoría final.

============================================================
57. CRITERIO DE ÉXITO
============================================================

Consideraré correctamente implementado el sistema únicamente si:

1. Una orden de venta no genera dinero por sí misma.

2. Una orden de compra no genera recursos por sí misma.

3. Solo un matching produce un trade.

4. El trade produce la transferencia real de ambos activos.

5. Las órdenes pueden permanecer abiertas.

6. Las órdenes pueden ejecutarse parcialmente.

7. Existe prioridad precio-tiempo.

8. Existe order book real.

9. Existe profundidad.

10. Existe bid/ask.

11. Existe spread.

12. Existe historial de trades.

13. Las gráficas derivan de trades reales.

14. Las órdenes tienen estados persistentes.

15. Los fondos y recursos se reservan correctamente.

16. No existe doble gasto.

17. No existe doble ejecución.

18. El servidor es la autoridad.

19. La IA no puede inventar operaciones.

20. Las facciones autónomas pueden participar realmente.

21. Los mercados pueden tener diferentes precios y liquidez.

22. El acceso al mercado está vinculado realmente a la presencia/acceso físico definido por las reglas del juego.

23. El sistema funciona sin la IA.

24. El sistema puede escalar.

25. La interfaz no contiene botones sin función.

26. Un solo click produce una sola acción.

27. Toda operación puede auditarse.

28. No existen números económicos mágicos.

============================================================
58. REGLA FINAL
============================================================

NO implementes simplemente una "pantalla de bolsa".

IMPLEMENTA UN EXCHANGE.

El jugador debe sentir que está entrando físicamente en una infraestructura financiera real de Ascension.

Cuando mire una cotización, debe representar oferta y demanda reales.

Cuando vea un precio, debe proceder del mercado.

Cuando coloque una orden, debe entrar realmente en el libro.

Cuando venda, NO debe recibir dinero hasta que exista comprador.

Cuando compre, NO debe recibir recursos hasta que exista vendedor.

Cuando no haya liquidez, NO debe ejecutarse nada.

Cuando aparezca una contraparte, debe producirse el matching correspondiente.

Cuando una facción autónoma necesite recursos, debe acudir al mismo mercado.

Cuando una guerra, crisis o acontecimiento altere la economía, debe poder afectar indirectamente a la oferta, demanda, liquidez y precios.

El mercado debe ser una pieza real de la economía sistémica de Ascension.

============================================================
59. DECISIÓN SOBRE LA TARJETA
============================================================

TÚ, ANTIGRAVITY, DEBES DETERMINAR FINALMENTE SI:

- El actual "Terminal Bursátil Cuántico" se transforma completamente en este Exchange;
- Se crea una nueva tarjeta;
- Se fusionan conceptos;
- O se reorganiza la arquitectura existente.

NO quiero una decisión basada únicamente en estética.

Quiero una decisión basada en:

- Arquitectura.
- Coherencia funcional.
- UX.
- Escalabilidad.
- Mantenibilidad.
- Economía del juego.
- Acceso físico.
- Integración con la Lonja Galáctica.
- Integración futura con multiplayer.
- Evitar duplicación.

La decisión debe quedar documentada antes de ejecutarse.

============================================================
60. RESULTADO FINAL ESPERADO
============================================================

El resultado debe ser un auténtico:

ASCENSION GALACTIC SPOT EXCHANGE

integrado orgánicamente en la Lonja Galáctica y conectado al resto del universo.

Debe ser:

- Real.
- Persistente.
- Determinista en su ejecución.
- Dinámico en sus precios.
- Basado en oferta y demanda.
- Basado en contrapartidas.
- Basado en liquidez.
- Compatible con IA.
- Compatible con jugadores.
- Compatible con facciones autónomas.
- Compatible con múltiples mercados.
- Preparado para arbitraje.
- Preparado para expansión futura.
- Auditable.
- Seguro.
- Resistente a concurrencia.
- Sin creación mágica de dinero.
- Sin creación mágica de recursos.
- Sin trades ficticios.

Y, sobre todo:

EL PRECIO NO DEBE SER EL MOTOR DEL MERCADO.

EL MERCADO DEBE SER EL MOTOR DEL PRECIO.