# INSTRUCCIONES MAESTRAS PARA GOOGLE ANTIGRAVITY
# JUEGO ASCENSIÓN — TRANSFORMACIÓN E IMPLEMENTACIÓN INTEGRAL DE LA LONJA GALÁCTICA

---

# 0. PROPÓSITO GENERAL Y REGLA SUPREMA

Quiero que realices una transformación integral, profunda y funcional del sistema de **Lonja Galáctica** de Juego Ascensión.

No quiero una simulación visual, una maqueta, un conjunto de tarjetas aparentemente funcionales ni datos ficticios.

Quiero que la Lonja Galáctica se convierta en una **entidad económica autónoma, cooperativa, accionarial, comercial, logística, industrial y defensiva**, integrada de verdad con la economía existente del juego.

La Lonja debe funcionar como una auténtica entidad económica persistente incluso cuando ningún jugador esté conectado.

Debe existir una separación clara entre:

- gobernanza;
- propiedad accionarial;
- economía;
- tesorería;
- producción;
- construcción;
- megaproyectos;
- mercado spot;
- mercado secundario de acciones;
- Market Makers;
- almacenamiento;
- logística;
- transporte;
- defensa;
- mantenimiento;
- membresías;
- servicios;
- IA autónoma;
- interfaz;
- auditoría;
- persistencia;
- seguridad transaccional.

No crear sistemas paralelos innecesarios si el juego ya dispone de sistemas equivalentes.

**REUTILIZA E INTEGRA LOS SISTEMAS EXISTENTES SIEMPRE QUE SEA POSIBLE.**

No inventes una segunda economía desconectada de la economía de Ascensión.

---

# INSTRUCCIÓN 0 — DESCOMPOSICIÓN OBLIGATORIA DEL DOCUMENTO MAESTRO ANTES DE IMPLEMENTAR

## 0.1. NO IMPLEMENTAR INMEDIATAMENTE

Antes de modificar código alguno, debes leer íntegramente este documento y comprenderlo como una especificación arquitectónica completa.

No empieces a implementar después de leer solamente una sección.

Primero debes:

1. leer todo este documento;
2. analizar el estado actual del proyecto;
3. localizar los sistemas existentes relacionados;
4. detectar dependencias;
5. identificar conflictos con la arquitectura actual;
6. identificar qué partes ya existen;
7. identificar qué partes están parcialmente implementadas;
8. identificar qué partes deben modificarse;
9. identificar qué partes deben crearse;
10. identificar qué partes NO deben duplicarse.

Después de ello debes dividir esta especificación en documentos Markdown persistentes.

---

## 0.2. CREAR DOCUMENTACIÓN DE EJECUCIÓN PERSISTENTE

Crea una estructura equivalente a:

```text
/docs/lonja/
├── 00_MASTER_LONJA.md
├── 01_AUDITORIA_ESTADO_ACTUAL.md
├── 02_FUNDACION_Y_TIPO_ENTIDAD.md
├── 03_MODELO_ACCIONARIADO.md
├── 04_DAO_GOBERNANZA.md
├── 05_ECONOMIA_TESORERIA_ESTABILIDAD.md
├── 06_EXCHANGE_SPOT.md
├── 07_MARKET_MAKER.md
├── 08_ALMACENAMIENTO_CUSTODIA.md
├── 09_LOGISTICA_TRANSPORTE.md
├── 10_MINISTERIOS_AUTONOMOS.md
├── 11_DESARROLLO_CONSTRUCCION_MEGAPROYECTOS.md
├── 12_DEFENSA_SEGURIDAD.md
├── 13_MEMBRESIAS_TARIFAS_SERVICIOS.md
├── 14_MERCADO_SECUNDARIO_ACCIONES.md
├── 15_AUTONOMIA_IA.md
├── 16_INTEGRACION_ECONOMIA_EXISTENTE.md
├── 17_SEGURIDAD_TRANSACCIONES_PERSISTENCIA.md
├── 18_TESTS_VALIDACION.md
└── 19_AUDITORIA_FINAL.md
```

Los nombres pueden adaptarse a la arquitectura real, pero debe mantenerse la misma separación conceptual.

---

## 0.3. MASTER COMO SOURCE OF TRUTH

`00_MASTER_LONJA.md` será el índice y fuente de verdad de todo el proyecto.

Los documentos individuales deben:

- explicar su área;
- contener requisitos;
- contener dependencias;
- contener criterios de aceptación;
- contener estado;
- contener pruebas necesarias;
- mantener trazabilidad hacia este documento maestro.

No quiero que el proyecto dependa de que Antigravity tenga que volver a releer constantemente todo este documento gigantesco.

Cada fase debe poder ejecutarse consultando principalmente su Markdown correspondiente.

---

## 0.4. ESTADO DE CADA FASE

Cada documento deberá incluir:

```text
ESTADO:
- PENDIENTE
- EN CURSO
- COMPLETADO
- BLOQUEADO
```

Además:

```text
DEPENDENCIAS:
- ...

REQUISITOS:
- ...

CRITERIOS DE ACEPTACIÓN:
- ...

PRUEBAS:
- ...

ARCHIVOS AFECTADOS:
- ...

RIESGOS:
- ...
```

---

## 0.5. TRAZABILIDAD OBLIGATORIA

Mantén una relación:

```text
REQUISITO
↓
DOCUMENTO DE FASE
↓
IMPLEMENTACIÓN
↓
TEST
↓
VALIDACIÓN
```

No marques una fase como COMPLETADA simplemente porque el código compila.

Debe estar funcionalmente implementada y validada.

---

## 0.6. ORDEN DE EJECUCIÓN

Determina automáticamente el orden correcto según dependencias.

No ejecutes fases en un orden que obligue a rehacer arquitectura posteriormente.

Antes de cada fase:

1. lee el Markdown de esa fase;
2. revisa sus dependencias;
3. inspecciona código existente;
4. implementa;
5. prueba;
6. actualiza el documento;
7. registra lo realizado;
8. marca los elementos completados.

---

# 1. AUDITORÍA INICIAL OBLIGATORIA

Antes de implementar, realiza una auditoría completa del proyecto.

Investiga:

- arquitectura frontend;
- backend;
- persistencia;
- modelos de datos;
- API;
- servicios;
- economía;
- recursos;
- créditos;
- inventarios;
- planetas;
- naves;
- logística;
- almacenes;
- ministerios;
- Alto Mando Comercial;
- Directorio Comercial;
- Terminal Bursátil Cuántico;
- Megaproyectos;
- Fondo Soberano;
- Red Logística;
- Bastión de Seguridad;
- acciones;
- inversiones;
- dividendos;
- IA;
- eventos;
- navegación;
- permisos;
- autenticación;
- tests.

Localiza especialmente cualquier código relacionado con:

```text
Lonja
lonja
mercado
exchange
spot
acciones
shares
DAO
market maker
warehouse
storage
logistics
treasury
dividend
investment
megaproject
market
order
trade
inventory
cargo
fleet
defense
```

No presupongas que una funcionalidad no existe solamente porque no sea visible en la interfaz.

---

# 2. PRINCIPIO FUNDAMENTAL: LA LONJA NO ES UN PLANETA NORMAL

Una Lonja Galáctica NO debe comportarse como un planeta normal controlado manualmente por un jugador.

Una vez fundada:

**se convierte en una entidad económica autónoma.**

El fundador deja de ser un administrador manual.

El fundador pasa a ser:

- fundador;
- accionista;
- inversor;
- participante económico;
- titular de derechos políticos/económicos correspondientes.

Pero NO debe tener un panel desde el que pueda:

- mover manualmente naves de la Lonja;
- ordenar construcciones arbitrarias;
- controlar ministerios;
- modificar reservas;
- crear recursos;
- decidir manualmente rutas;
- ejecutar manualmente defensa;
- alterar balances.

La Lonja debe tomar esas decisiones automáticamente.

---

# 3. FUNDACIÓN DE LA LONJA

Ya existe en el juego un tipo especial de nave colonizadora destinado a fundar Lonjas.

Debes conservar e integrar esa funcionalidad.

No conviertas un planeta normal en Lonja mediante un simple cambio de tipo si la lógica actual ya contempla una nave especial.

La fundación debe producir directamente:

```text
PLANETA/ENTIDAD = LONJA GALÁCTICA
```

---

# 4. FUNDADOR Y 10 % PROTEGIDO

Al fundar la Lonja:

- existe un único fundador;
- recibe automáticamente un 10 % protegido.

Ese 10 %:

- es permanente;
- no puede diluirse;
- no puede venderse;
- no puede transferirse;
- no puede ser confiscado;
- no puede desaparecer;
- no puede ser eliminado mediante DAO;
- no puede modificarse mediante votación;
- no puede ser destruido por ampliaciones de capital.

Debe implementarse como una clase/tipo de participación independiente si es necesario.

Por ejemplo:

```text
FOUNDER_PROTECTED
```

separada de:

```text
ORDINARY_SHARES
```

---

# 5. ACCIONES ORDINARIAS

Las acciones ordinarias representan la propiedad económica negociable.

Solo se crean acciones ordinarias mediante aportaciones elegibles a:

**MEGAPROYECTOS / AMPLIACIONES DE CAPITAL.**

No generan acciones:

- producción ordinaria;
- minería ordinaria;
- edificios normales;
- mejoras ordinarias;
- ministerios;
- operaciones comerciales;
- tasas;
- membresías;
- dividendos;
- compras de recursos;
- ventas de recursos.

---

# 6. DILUCIÓN Y NUEVAS APORTACIONES

Cuando un inversor aporta capital nuevo elegible a un Megaproyecto:

1. se registra la aportación;
2. se determina su valor económico;
3. se calcula la nueva participación;
4. se emiten las acciones ordinarias correspondientes;
5. los accionistas ordinarios existentes se diluyen proporcionalmente;
6. el 10 % protegido del fundador permanece intacto.

No utilizar un precio instantáneo fácilmente manipulable para valorar la participación.

La valoración debe utilizar una referencia robusta, basada en parámetros económicos reales de la Lonja y/o un mecanismo de valoración definido.

---

# 7. ACLARACIÓN MATEMÁTICA DE LA CAPITALIZACIÓN

Debes implementar explícitamente la fórmula de capitalización para evitar errores.

El sistema debe distinguir entre:

```text
FOUNDER_PROTECTED_PERCENT
```

y

```text
ORDINARY_EQUITY
```

y debe definir inequívocamente cómo se calcula la participación de una nueva aportación.

El objetivo económico debe respetar el principio indicado:

Si existe una base de inversión y entra una nueva aportación, la nueva participación se calcula sobre la nueva valoración total, mientras que la participación protegida del fundador permanece intacta.

No permitas fórmulas que provoquen accidentalmente:

- pérdida del 10 % protegido;
- creación excesiva de acciones;
- doble contabilización;
- dilución incorrecta;
- porcentajes superiores al 100 %.

---

# 8. MERCADO SECUNDARIO DE ACCIONES

Debe existir desde el principio un mercado secundario de acciones ordinarias.

Debe permitir:

- comprar;
- vender;
- órdenes limitadas;
- órdenes de mercado si procede;
- libro de órdenes;
- precio;
- volumen;
- historial;
- operaciones;
- comisiones;
- liquidación;
- cancelación;
- modificación;
- reservas.

El fundador puede vender únicamente las acciones ordinarias adicionales que haya comprado posteriormente.

Su 10 % protegido:

**NO PUEDE APARECER COMO VENDIBLE.**

---

# 9. DERECHOS DE LAS ACCIONES

Las acciones ordinarias deben tener:

- participación económica;
- derecho a dividendos;
- derecho de voto;
- participación proporcional en decisiones DAO.

El voto debe ser proporcional a la participación.

No utilizar:

```text
1 jugador = 1 voto
```

sino:

```text
peso del voto = participación accionarial
```

salvo los límites de protección que se definan para evitar abusos.

---

# 10. DIRECTORIO COMERCIAL = DAO

La tarjeta existente:

**Directorio Comercial**

debe convertirse en el centro de gobernanza DAO de la Lonja.

Debe mostrar:

- participación accionarial;
- accionistas;
- peso de voto;
- propuestas;
- propuestas activas;
- votaciones;
- historial;
- reglas económicas;
- parámetros configurables;
- resultados;
- fechas de apertura/cierre;
- quorum si se establece;
- estado.

---

# 11. PARTICIPANTES DE LA DAO

Pueden participar:

- jugadores humanos;
- jugadores controlados por IA;
- accionistas elegibles.

Las IA deben recibir las mismas oportunidades de participación.

Cuando se abre una propuesta:

1. se crea;
2. se notifica a participantes;
3. se abre ventana de votación;
4. humanos e IA reciben oportunidad equivalente;
5. se contabilizan votos según participación;
6. se ejecuta la decisión;
7. se registra permanentemente.

---

# 12. REGLA DE MAYORÍA

La mayoría base será:

**50 %**

El sistema debe permitir definir claramente qué significa mayoría:

```text
votos favorables > 50 % del peso computable
```

o el mecanismo equivalente que determine la arquitectura.

No dejes la semántica ambigua.

---

# 13. DURACIÓN DE LAS PROPUESTAS DAO

Las votaciones tendrán una ventana temporal limitada.

Máximo recomendado:

**7 días.**

No permitir votaciones eternas.

Si no se alcanza la condición necesaria:

- propuesta rechazada;
- o resuelta según regla previamente definida.

Debe quedar registrado.

---

# 14. QUÉ PUEDE CONTROLAR LA DAO

La DAO puede decidir parámetros económicos como:

- cuota de registro;
- cuota periódica;
- comisiones;
- tarifas de almacenamiento;
- tarifas logísticas;
- políticas de Market Maker;
- límites de liquidez;
- porcentaje de beneficios distribuido;
- política de reservas;
- políticas de inversión;
- determinados límites operativos.

La DAO establece reglas.

La IA autónoma las ejecuta.

---

# 15. QUÉ NO PUEDE HACER LA DAO

La DAO NO puede:

- crear recursos de la nada;
- crear créditos de la nada;
- modificar balances arbitrariamente;
- eliminar acciones existentes;
- eliminar el 10 % fundador;
- confiscar activos privados;
- inventar liquidez;
- modificar operaciones liquidadas;
- alterar transacciones históricas;
- teleportar recursos;
- teleportar naves;
- reescribir contratos ya ejecutados;
- cambiar retroactivamente derechos económicos.

---

# 16. SEPARACIÓN DE RESPONSABILIDADES

Debe existir una separación arquitectónica clara:

```text
DAO
↓
REGLAS Y GOBERNANZA

SISTEMA AUTÓNOMO
↓
EJECUCIÓN OPERATIVA

EXCHANGE
↓
MATCHING Y LIQUIDACIÓN

LOGÍSTICA
↓
MOVIMIENTO FÍSICO

TESORERÍA
↓
GESTIÓN FINANCIERA

DEFENSA
↓
SEGURIDAD

UI
↓
PRESENTACIÓN E INTERACCIÓN
```

La interfaz jamás debe ser la autoridad económica.

---

# 17. AUTONOMÍA COMPLETA

La Lonja debe continuar funcionando aunque:

- ningún jugador esté conectado;
- el fundador no esté conectado;
- los accionistas no estén conectados.

Debe seguir:

- produciendo;
- consumiendo;
- manteniendo;
- comerciando;
- gestionando reservas;
- gestionando Market Making;
- gestionando naves;
- defendiendo;
- reparando;
- financiando proyectos;
- gestionando almacenamiento;
- cobrando tarifas;
- pagando obligaciones;
- acumulando beneficios;
- distribuyendo dividendos según política.

---

# 18. ECONOMÍA INTERNA DE LA LONJA

Los recursos producidos por la Lonja pertenecen a:

**LA LONJA**

No pertenecen directamente al fundador.

No se reparten automáticamente a los accionistas.

Pueden utilizarse para:

- operaciones;
- mantenimiento;
- reservas;
- Megaproyectos;
- defensa;
- almacenamiento;
- logística;
- Market Making;
- reconstrucción;
- ventas;
- servicios.

---

# 19. TESORERÍA

Crear o integrar una tesorería autónoma.

Debe gestionar:

- créditos;
- ingresos;
- gastos;
- reservas;
- obligaciones;
- inversiones;
- dividendos;
- Market Making;
- defensa;
- mantenimiento.

Debe existir trazabilidad contable.

Cada movimiento importante debe tener:

- ID;
- origen;
- destino;
- concepto;
- cantidad;
- timestamp;
- estado;
- referencia.

---

# 20. PRIORIDAD DEL DINERO

La política económica base debe priorizar:

1. obligaciones con terceros;
2. operaciones;
3. mantenimiento;
4. defensa;
5. reserva mínima;
6. expansión;
7. Market Making;
8. dividendos;
9. inversiones no esenciales.

Nunca distribuir dividendos si ello incumple obligaciones esenciales.

---

# 21. DIVIDENDOS

Los dividendos deben proceder de:

**beneficio distribuible real.**

Nunca crear créditos artificialmente.

La DAO puede votar el porcentaje de beneficio distribuible dentro de límites seguros.

Los dividendos:

- se calculan proporcionalmente;
- se acreditan al accionista;
- se acumulan en su **Fondo Soberano**, manteniendo la lógica existente;
- pueden retirarse posteriormente.

---

# 22. PREVENCIÓN DE QUIEBRA

La Lonja no debe desaparecer simplemente porque tenga una mala racha.

Implementar estados:

```text
NORMAL
PRECAUCIÓN
PROTECCIÓN
CRÍTICO
```

Cuando disminuyan las reservas:

### NORMAL
Operación normal.

### PRECAUCIÓN
- reducir inversiones no esenciales;
- controlar Market Making;
- aumentar prudencia.

### PROTECCIÓN
- detener proyectos no prioritarios;
- proteger liquidez;
- limitar exposición;
- priorizar mantenimiento/defensa/obligaciones.

### CRÍTICO
- preservar supervivencia;
- minimizar gastos;
- reducir drásticamente Market Making;
- proteger activos de terceros;
- buscar financiación;
- priorizar operaciones esenciales.

No crear dinero mágico para evitar la crisis.

---

# 23. ESTABILIDAD

Debe existir una reserva mínima de estabilidad.

Puede dividirse en:

```text
RESERVA OPERATIVA
RESERVA ESTRATÉGICA
LIQUIDEZ COMERCIAL
```

Estas reservas deben estar separadas lógicamente.

---

# 24. DESARROLLO Y CONSTRUCCIÓN

La Lonja no debe utilizar simplemente los larguísimos tiempos de construcción de un planeta normal.

No quiero que un crecimiento importante dependa de timers arbitrarios de 14–50 días.

Crear/integrar un:

**Centro de Desarrollo / Dirección de Desarrollo y Expansión**

que represente capacidades como:

- automatización;
- ingeniería;
- construcción;
- optimización industrial;
- logística;
- gestión de flota;
- almacenamiento;
- energía;
- comercio;
- reparación;
- defensa.

---

# 25. TIEMPO DE CONSTRUCCIÓN REAL

El tiempo debe depender de:

- capacidad industrial;
- materiales;
- maquinaria;
- recursos;
- transporte;
- capacidad logística;
- trabajadores/servicios simulados;
- nivel de automatización;
- créditos disponibles para contratar capacidad adicional.

No utilizar tiempos arbitrarios desconectados de la economía.

---

# 26. ACELERACIÓN MEDIANTE CRÉDITOS

El jugador/inversor puede acelerar determinadas construcciones mediante créditos.

Pero esos créditos deben representar:

- contratación de capacidad industrial;
- transporte;
- componentes;
- maquinaria;
- servicios;
- horas adicionales;
- capacidad externa;
- prioridad logística.

No debe ser:

```text
pagar 100 créditos = magia = construcción instantánea
```

Debe ser una compra de capacidad económica real.

---

# 27. MEGAPROYECTOS

Los Megaproyectos son expansiones estratégicas de gran escala.

Ejemplos:

- megalmacenes;
- ampliación logística;
- grandes muelles;
- astilleros;
- defensa orbital;
- capacidad industrial;
- grandes flotas;
- infraestructura estratégica.

---

# 28. LOS MEGAPROYECTOS SIEMPRE PUEDEN FINANCIARSE

No exigir una votación DAO para decidir si un Megaproyecto puede existir.

La Lonja puede:

- financiarlo internamente;
- abrirlo a inversión externa;
- financiar una parte internamente y otra externamente.

---

# 29. FINANCIACIÓN MIXTA

Ejemplo:

```text
MEGAPROYECTO = 50 M

TESORERÍA LONJA = 30 M
INVERSIÓN EXTERNA = 20 M
```

Los 30 M internos:

**NO CREAN ACCIONES.**

Los 20 M externos elegibles:

**SÍ CREAN ACCIONES ORDINARIAS.**

Implementar esta distinción explícitamente.

---

# 30. TERMINAL BURSÁTIL CUÁNTICO

La tarjeta:

**Terminal Bursátil Cuántico**

debe dejar de ser un simple menú de tarjetas.

Debe convertirse en una interfaz profesional de mercado spot.

Al entrar debe aparecer directamente el mercado.

---

# 31. MERCADO SPOT CONTINUO

Debe existir un mercado continuo real.

Cada mercado está asociado a una ubicación.

No debe existir un mercado universal mágico.

Ejemplo:

```text
LONJA A
METAL / CRÉDITOS
```

es diferente de:

```text
LONJA B
METAL / CRÉDITOS
```

Los precios pueden diferir.

---

# 32. CABECERA DEL MERCADO

Mostrar:

- activo;
- precio actual;
- variación;
- bid;
- ask;
- spread;
- volumen;
- profundidad;
- estado;
- liquidez.

---

# 33. GRÁFICO

Implementar gráfico de velas real.

Debe derivarse de operaciones reales.

Mostrar:

- OHLC;
- volumen;
- histórico.

Periodos:

- 1D;
- 7D;
- 30D;
- 90D;
- 1Y.

Intervalos:

- 5m;
- 1h;
- 4h;
- 1D.

Incluir:

- zoom;
- desplazamiento;
- tooltip;
- volumen.

No añadir de momento:

- RSI;
- MACD;
- Bollinger;
- Fibonacci;
- indicadores técnicos avanzados.

---

# 34. LIBRO DE ÓRDENES

Debe existir un Order Book real.

Mostrar:

### VENTAS

- precio;
- cantidad;
- número de órdenes.

### COMPRAS

- precio;
- cantidad;
- número de órdenes.

Mostrar:

- mejor bid;
- mejor ask;
- spread;
- profundidad.

---

# 35. MOTOR DE MATCHING

Implementar prioridad:

```text
PRICE-TIME PRIORITY
```

Primero mejor precio.

A igualdad de precio:

primero la orden más antigua.

---

# 36. ÓRDENES

Como mínimo:

- LIMIT;
- MARKET.

Si se implementan otros tipos, deben ser reales y estar respaldados por el motor.

---

# 37. ÓRDENES LIMIT

Una orden limit:

- permanece abierta;
- entra en el libro;
- puede ejecutarse parcialmente;
- puede ejecutarse completamente;
- puede cancelarse;
- puede modificarse según reglas;
- puede expirar.

---

# 38. ÓRDENES MARKET

Una orden market consume la liquidez disponible.

Debe existir:

- slippage;
- profundidad real;
- precio medio;
- posibilidad de ejecución parcial.

No garantizar un precio inexistente.

---

# 39. RECURSOS FÍSICOS

Regla absolutamente obligatoria:

**NO SE PUEDE VENDER UN RECURSO QUE NO EXISTA FÍSICAMENTE EN ESA LONJA.**

Ejemplo:

Jugador:

```text
500.000 Metal
```

pero físicamente en la Lonja:

```text
10.000 Metal
```

Solo puede vender:

```text
10.000 Metal
```

---

# 40. RESERVA AL CREAR UNA VENTA

Al crear una orden de venta:

- el recurso debe existir;
- debe reservarse;
- no puede venderse simultáneamente en otra orden;
- no puede desaparecer;
- no puede gastarse en otra operación.

---

# 41. COMPRA

Una orden de compra debe reservar créditos suficientes.

Al ejecutarse:

```text
créditos → vendedor
recurso → comprador/custodia
```

Todo debe liquidarse atómicamente.

---

# 42. PROHIBICIONES ABSOLUTAS

Nunca permitir:

- saldo negativo;
- recursos duplicados;
- créditos duplicados;
- doble ejecución;
- doble venta;
- doble compra;
- liquidación parcial inconsistente;
- teleportación de recursos;
- creación de activos por colocar órdenes.

---

# 43. COINCIDENCIA Y LIQUIDACIÓN

Solo una operación realmente ejecutada produce transferencia.

Colocar una orden NO produce:

- ingresos;
- recursos;
- beneficios;
- volumen ficticio.

---

# 44. CONCURRENCIA

Implementar controles contra:

- race conditions;
- doble click;
- peticiones duplicadas;
- ejecución simultánea;
- stale state;
- reintentos;
- doble settlement.

Utilizar:

- locks;
- transacciones;
- constraints;
- IDs únicos;
- idempotencia;
- validaciones server-side.

---

# 45. REGISTRO DE OPERACIONES

Cada trade debe almacenar como mínimo:

```text
tradeId
orderId
buyOrderId
sellOrderId
marketId
buyerId
sellerId
asset
quantity
price
grossValue
fees
timestamp
status
```

Mantener historial auditable.

---

# 46. INTERFAZ DE TRADING

Mostrar:

- comprar/vender;
- tipo de orden;
- precio;
- cantidad;
- total;
- comisión;
- saldo;
- activo reservado;
- órdenes abiertas;
- operaciones realizadas.

---

# 47. MARKET MAKER AUTÓNOMO

La Lonja debe tener Market Makers propios.

Esto es parte fundamental de la economía.

No debe ser un simple bot que invente precios.

Debe estar respaldado por activos reales.

---

# 48. RESPALDO 100 % REAL

Si el Market Maker dispone de:

```text
5.000.000 Metal
```

no puede publicar:

```text
20.000.000 Metal
```

de venta.

El inventario publicado debe estar respaldado.

---

# 49. LIQUIDEZ DEL MARKET MAKER

Puede utilizar:

- recursos reales;
- créditos reales.

Debe existir una asignación explícita:

```text
LIQUIDITY_ALLOCATION
```

No puede utilizar libremente:

- reserva estratégica;
- reserva operativa;
- activos de terceros.

---

# 50. POLÍTICA DEL MARKET MAKER

La DAO puede establecer:

- porcentaje máximo de reservas utilizado;
- exposición máxima;
- spreads permitidos;
- límites de inventario;
- límites de riesgo.

El sistema autónomo determina las cotizaciones concretas.

---

# 51. COMPORTAMIENTO DINÁMICO

El Market Maker debe adaptarse.

Ejemplo:

### Mucho stock
→ mayor capacidad de venta.

### Poco stock
→ reducir ventas.

### Mucho crédito
→ mayor capacidad de compra.

### Poco crédito
→ reducir compras.

### Alta volatilidad
→ spread mayor y profundidad menor.

### Ataque
→ reducir exposición.

### Necesidad de financiar proyecto
→ reducir liquidez destinada al mercado.

No utilizar aleatoriedad sin fundamento económico.

---

# 52. INGRESOS DEL MARKET MAKER

La Lonja puede obtener ingresos mediante:

- comisiones;
- spread;
- margen de intermediación;
- almacenamiento;
- logística;
- servicios.

No crear beneficios ficticios.

---

# 53. ALMACENAMIENTO

La Lonja NO debe tener almacenamiento infinito.

Debe existir capacidad física real.

---

# 54. CAPAS DE ALMACENAMIENTO

Separar:

### A. ALMACÉN DE LIQUIDACIÓN DEL EXCHANGE
Recursos depositados para vender.

### B. ALMACÉN PRIVADO DEL USUARIO
Recursos comprados y custodiados para el jugador.

### C. RESERVAS INTERNAS DE LA LONJA
Recursos propios.

### D. ALMACENAMIENTO DE MARKET MAKER
Recursos asignados a liquidez.

### E. MEGAALMACENES
Capacidad adicional obtenida mediante expansión.

---

# 55. CAPACIDAD POR RECURSO

No utilizar solamente:

```text
storageCapacity = 100M
```

Debe poder existir capacidad especializada.

Ejemplos:

- minerales;
- gases;
- Deuterio;
- materiales especiales;
- componentes tecnológicos.

La infraestructura puede tener capacidades específicas.

---

# 56. RESERVA DE CAPACIDAD

Si existe:

```text
100M capacidad física
```

no necesariamente:

```text
100M disponible para usuarios.
```

Ejemplo:

```text
20M reserva operativa
80M comercial
```

---

# 57. SATURACIÓN

Cuando varios jugadores llegan simultáneamente con grandes cantidades:

1. detectar capacidad;
2. comprobar capacidad disponible;
3. aceptar únicamente lo físicamente posible;
4. reservar;
5. rechazar/poner en cola el exceso;
6. mostrar claramente el motivo.

Nunca permitir depósitos mágicos fuera de capacidad.

---

# 58. COLA DE DEPÓSITOS

Puede existir:

```text
WAITLIST
```

para depósitos que no puedan entrar inmediatamente.

Pero la cola no equivale a que el recurso esté almacenado.

Mientras no exista capacidad física:

**el recurso sigue donde realmente está.**

---

# 59. CRECIMIENTO DEL ALMACENAMIENTO

Si la demanda aumenta:

- la Lonja detecta saturación;
- analiza capacidad;
- puede iniciar expansión interna;
- puede abrir Megaproyecto;
- puede financiarlo;
- puede aceptar inversión externa;
- puede acelerar construcción.

---

# 60. NO TRANSFERIR AUTOMÁTICAMENTE A OTRA LONJA

Una Lonja no debe solucionar su saturación enviando mágicamente recursos a otra Lonja.

Cada Lonja es:

**UNA ENTIDAD ECONÓMICA INDEPENDIENTE.**

No mezclar inventarios.

---

# 61. ALMACÉN PRIVADO DEL JUGADOR

Si un jugador compra recursos y no puede transportarlos inmediatamente:

pueden permanecer en su almacén privado de la Lonja.

Debe existir:

- capacidad;
- tarifa;
- titularidad;
- tiempo;
- estado;
- posibilidad de retirada;
- historial.

---

# 62. PROPIEDAD DE LOS ACTIVOS

Un recurso almacenado por un jugador:

**SIGUE SIENDO DEL JUGADOR.**

La Lonja solo presta custodia.

No puede apropiárselo.

---

# 63. LOGÍSTICA REAL

La logística debe ser física.

No existe:

```text
Comprar → recurso aparece mágicamente en planeta del jugador
```

Debe existir:

```text
Compra
↓
Custodia
↓
Transporte
↓
Llegada
```

---

# 64. CAPACIDAD DEL JUGADOR

Si el jugador dispone de:

```text
100.000 capacidad
```

y compra:

```text
500.000
```

solo puede transportar inmediatamente:

```text
100.000
```

El resto debe permanecer:

- en almacén;
- o contratar transporte.

---

# 65. TRANSPORTE CONTRATADO

La Lonja puede ofrecer transporte si tiene:

- naves;
- capacidad;
- disponibilidad;
- combustible;
- ruta;
- tiempo.

Si no dispone de capacidad:

**el servicio no está disponible.**

No inventar transporte.

---

# 66. PRECIO DEL TRANSPORTE

Debe considerar:

- distancia;
- capacidad;
- combustible;
- tiempo;
- riesgo;
- ruta;
- demanda;
- disponibilidad;
- seguridad.

---

# 67. ESTADOS DE CUSTODIA

Cada activo debe indicar dónde está:

```text
EN_NAVE_PROPIA
EN_ALMACEN_PRIVADO
EN_TRANSPORTE_CONTRATADO
EN_TRANSITO
EN_ALMACEN_EXCHANGE
EN_RESERVA_LONJA
```

No puede existir ambigüedad.

---

# 68. NAVES DE LA LONJA

Las naves de la Lonja pertenecen a la entidad.

No al fundador.

No a un accionista concreto.

Tipos posibles:

- cargueros;
- grandes cargueros;
- transportes logísticos;
- remolcadores;
- mantenimiento;
- reparación;
- patrulla;
- defensa;
- interceptores;
- escoltas.

---

# 69. NAVES QUE NO DEBE TENER

No asignar como flota operativa normal:

- colonizadores personales;
- naves de conquista;
- sondas de espionaje personales;
- naves cuya función sea exclusivamente una acción del jugador.

La nave colonizadora especial existe para fundar la Lonja, no como nave operacional ordinaria.

---

# 70. CONTROL DE NAVES

El usuario no debe mover manualmente las naves de la Lonja.

El sistema autónomo decide:

- rutas;
- asignaciones;
- mantenimiento;
- transporte;
- defensa;
- reparación;
- prioridad.

---

# 71. MINISTERIOS

No eliminar los ministerios existentes.

Transformar su función.

En planeta normal:

```text
MINISTERIO
↓
CENTRO DE MANDO DEL JUGADOR
```

En Lonja:

```text
MINISTERIO
↓
DEPARTAMENTO OPERATIVO AUTÓNOMO
```

---

# 72. EJEMPLO DE MINISTERIO AUTÓNOMO

“Ministerio de Recursos — Gestión Autónoma”

Debe mostrar:

- producción;
- consumo;
- reservas;
- demanda;
- capacidad;
- previsión;
- necesidades;
- mantenimiento;
- infraestructura;
- decisiones automáticas;
- proyectos;
- capacidad disponible;
- riesgos.

No mostrar botones manuales del tipo:

```text
Construir mina
```

si la Lonja debe decidirlo autónomamente.

---

# 73. OTROS MINISTERIOS

Aplicar la misma filosofía a:

- recursos;
- industria;
- investigación;
- comercio;
- logística;
- defensa;
- energía;
- construcción;
- población/servicios si procede.

Los ministerios informan y ejecutan automáticamente.

---

# 74. CENTRO DE DESARROLLO

Debe ser el centro de:

- automatización;
- crecimiento;
- construcción;
- capacidad;
- ingeniería;
- expansión.

Debe mostrar:

- capacidad actual;
- proyectos;
- trabajos activos;
- recursos requeridos;
- capacidad industrial;
- tiempo estimado;
- aceleradores;
- inversiones.

---

# 75. DEFENSA

La Lonja debe ser atacable.

Debe existir riesgo real.

Pero también debe defenderse autónomamente.

---

# 76. SISTEMA DE DEFENSA AUTÓNOMO

Debe incluir:

- detección;
- evaluación;
- amenazas;
- prioridades;
- patrullas;
- defensa orbital;
- naves;
- interceptación;
- reparación;
- mantenimiento;
- reconstrucción.

---

# 77. DECISIONES DE DEFENSA

La IA debe determinar:

- qué amenaza es prioritaria;
- qué naves enviar;
- cuándo interceptar;
- cuándo retirarse;
- cuándo proteger recursos;
- cuándo reparar;
- cuándo utilizar reservas.

---

# 78. ATAQUES

Un ataque puede provocar:

- daño;
- destrucción;
- interrupción;
- pérdidas;
- reducción de capacidad;
- problemas logísticos;
- caída de producción;
- cierre temporal de mercados.

No hacer la Lonja invulnerable.

---

# 79. DESTRUCCIÓN

Si una infraestructura es destruida:

- los recursos invertidos se pierden;
- la capacidad disminuye;
- el valor económico puede disminuir;
- debe reconstruirse.

Pero:

**las acciones existentes NO desaparecen automáticamente.**

Los accionistas siguen siendo accionistas.

---

# 80. CUSTODIA DE ACTIVOS DE TERCEROS

Debe existir una separación estricta entre:

```text
ACTIVOS DE LONJA
```

y:

```text
ACTIVOS DE CLIENTES
```

Los activos privados almacenados no pertenecen a la Lonja.

---

# 81. PROTECCIÓN DE CUSTODIA

Implementar un sistema de custodia/garantía/seguro apropiado para evitar que la destrucción de una infraestructura implique arbitrariamente:

```text
destrucción del edificio
=
destrucción automática del patrimonio de los clientes
```

Debe existir una política explícita de:

- custodia;
- responsabilidad;
- reservas;
- compensación;
- seguro/fondo de garantía si procede.

---

# 82. SUSPENSIÓN DEL MERCADO EN ATAQUES

Si existe una amenaza grave:

el sistema puede suspender temporalmente determinadas operaciones.

Debe existir:

- estado del mercado;
- motivo;
- timestamp;
- condiciones de reapertura;
- protección de órdenes;
- recuperación.

Nunca modificar silenciosamente una operación ya liquidada.

---

# 83. MEMBRESÍA COMERCIAL

Separar claramente:

```text
SER ACCIONISTA
```

de:

```text
SER OPERADOR COMERCIAL
```

Un jugador puede:

- tener acciones y no comerciar;
- comerciar y no tener acciones;
- hacer ambas cosas.

---

# 84. REGISTRO COMERCIAL

Para operar como comprador/vendedor/cliente de servicios puede existir:

### cuota de registro única

y:

### cuota periódica.

Además:

### tarifas por uso.

---

# 85. QUÉ CONCEDE LA MEMBRESÍA

Permite:

- comprar;
- vender;
- depositar;
- retirar;
- usar almacenes;
- contratar logística;
- utilizar servicios.

No concede:

- acciones;
- voto;
- propiedad.

---

# 86. VISITANTES

Un visitante puede consultar información pública sin necesariamente registrarse.

Por ejemplo:

- precios públicos;
- mercado;
- estadísticas;
- información de la Lonja.

---

# 87. IMPAGO

Si una cuota periódica no se paga:

- suspender servicios comerciales;
- impedir nuevas operaciones si procede;
- conservar los activos del usuario;
- permitir retirada/recuperación de sus activos según las reglas de custodia.

Nunca confiscar automáticamente sus activos privados por una simple cuota impagada salvo que exista una regla económica explícita y legítima.

---

# 88. INGRESOS DE LA LONJA

Las principales fuentes pueden incluir:

- comisiones;
- Market Making;
- almacenamiento;
- logística;
- transporte;
- membresías;
- servicios;
- producción;
- comercio;
- otras actividades económicas reales.

---

# 89. NAVEGACIÓN Y TARJETAS

La estructura del Alto Mando Comercial de la Lonja debe quedar conceptualmente organizada alrededor de:

```text
Directorio Comercial
→ DAO / Gobernanza

Terminal Bursátil Cuántico
→ Exchange Spot

Centro de Desarrollo
→ Automatización / Construcción / Capacidad

Megaproyectos
→ Expansión estratégica / financiación

Fondo Soberano
→ Tesorería / reservas / dividendos

Red Logística
→ flota / transporte / almacenamiento

Bastión de Seguridad
→ defensa / amenazas / reparación
```

Los ministerios existentes pueden mantenerse como áreas operativas autónomas.

---

# 90. NO DUPLICAR FUNCIONALIDAD

Antes de crear cualquier nuevo sistema:

buscar si ya existe.

Si existe:

- reutilizar;
- adaptar;
- encapsular;
- extender.

No crear:

```text
NewEconomy
```

si ya existe:

```text
Economy
```

No crear una segunda logística si existe una logística válida.

---

# 91. INTEGRACIÓN CON LA ECONOMÍA DE ASCENSIÓN

La Lonja debe utilizar:

- recursos existentes;
- créditos existentes;
- naves existentes;
- sistemas de inventario existentes;
- rutas existentes;
- producción existente;
- economía existente.

Los nuevos componentes deben integrarse.

No crear una economía paralela.

---

# 92. PRECIOS

Los precios del mercado deben surgir de:

- órdenes;
- operaciones;
- liquidez;
- oferta;
- demanda.

No de números aleatorios.

No generar precios falsos para llenar gráficos.

---

# 93. IA

La IA puede:

- decidir;
- proponer;
- votar;
- comprar;
- vender;
- transportar;
- invertir;
- defender;
- gestionar.

Pero siempre a través de los mismos sistemas económicos.

La IA NO puede:

- crear recursos;
- crear créditos;
- saltarse órdenes;
- inventar precios;
- teleportar activos;
- ignorar capacidad;
- saltarse permisos.

---

# 94. ARBITRAJE ENTRE LONJAS

Si dos Lonjas tienen precios diferentes, puede existir oportunidad de arbitraje.

Pero debe tener en cuenta:

- distancia;
- combustible;
- capacidad;
- tiempo;
- riesgo;
- almacenamiento;
- tarifas;
- bloqueos;
- seguridad;
- disponibilidad de naves.

Nunca asumir que:

```text
comprar en A
=
vender instantáneamente en B
```

---

# 95. ACCESO FÍSICO

Si la regla del juego exige presencia física para acceder a determinadas operaciones de una Lonja:

debe validarse server-side.

No confiar únicamente en la interfaz.

---

# 96. SEGURIDAD ECONÓMICA

Todos los sistemas económicos críticos deben estar protegidos contra:

- manipulación del cliente;
- requests duplicadas;
- race conditions;
- estados obsoletos;
- doble ejecución;
- valores negativos;
- overflow;
- balances inconsistentes;
- IDs duplicados;
- operaciones fuera de orden.

---

# 97. AUTORIDAD DEL BACKEND

El frontend:

**NO ES LA FUENTE DE VERDAD.**

El backend/sistema económico autorizado debe determinar:

- balances;
- acciones;
- inventarios;
- trades;
- depósitos;
- retiros;
- órdenes;
- liquidaciones;
- dividendos;
- financiación;
- propiedad.

---

# 98. PERSISTENCIA

La información debe sobrevivir:

- refresh;
- logout;
- login;
- reinicio;
- paso del tiempo;
- ausencia del jugador.

No almacenar el estado económico exclusivamente en memoria del frontend.

---

# 99. IDENTIFICADORES

Utilizar IDs únicos para:

- Lonja;
- accionistas;
- clases de acciones;
- emisiones;
- órdenes;
- trades;
- depósitos;
- retiros;
- proyectos;
- votos;
- propuestas;
- naves;
- contratos;
- envíos;
- almacenes.

---

# 100. AUDITORÍA ECONÓMICA

Debe existir un ledger/audit log suficiente para reconstruir:

```text
qué ocurrió
quién lo ejecutó
cuándo
qué activos movió
qué cantidades
qué precio
qué comisión
qué estado
```

---

# 101. BOTONES

REGLA ABSOLUTA:

**NO PUEDE EXISTIR NI UN SOLO BOTÓN SIN FUNCIÓN.**

Auditar toda la interfaz de la Lonja.

Para cada botón comprobar:

- tiene acción;
- ejecuta una operación;
- muestra feedback;
- maneja loading;
- maneja error;
- maneja éxito;
- respeta permisos;
- no ejecuta dos veces.

---

# 102. DOBLE CLICK

Auditar especialmente el problema existente de botones que aparentemente requieren doble click.

Debe garantizarse:

```text
1 click
=
1 acción
```

Evitar:

- pérdida de foco;
- debounce excesivo;
- doble handler;
- navegación interrumpida;
- estado stale;
- botón deshabilitado incorrectamente.

---

# 103. FEEDBACK VISUAL

Toda acción debe proporcionar feedback:

- cargando;
- éxito;
- error;
- confirmación;
- estado.

No dejar al usuario preguntándose si su acción se ejecutó.

---

# 104. ERROR HANDLING

Nunca ocultar errores silenciosamente.

Mostrar errores comprensibles.

Registrar errores técnicos.

No inventar éxito cuando falla una operación.

---

# 105. UI PROFESIONAL

El Terminal Bursátil debe parecer un verdadero terminal profesional de mercado.

Priorizar:

- densidad informativa;
- jerarquía;
- legibilidad;
- datos en tiempo real;
- profundidad;
- estados;
- controles claros.

Pero sin introducir complejidad innecesaria.

---

# 106. NO CREAR INDICADORES TÉCNICOS INNECESARIOS

No añadir RSI, MACD, Bollinger, Fibonacci u otros indicadores salvo que posteriormente se solicite expresamente.

El objetivo es:

**mercado real y funcional**, no simulación de plataforma de trading llena de widgets.

---

# 107. PRUEBAS DEL EXCHANGE

Crear tests para:

### ORDEN DE COMPRA
- saldo suficiente;
- reserva;
- matching;
- liquidación.

### ORDEN DE VENTA
- inventario suficiente;
- reserva;
- matching.

### PARTIAL FILL
- ejecución parcial.

### MARKET ORDER
- consume varios niveles.

### LIMIT ORDER
- permanece abierta.

### CANCEL
- libera reservas.

### DUPLICACIÓN
- no puede ejecutarse dos veces.

### CONCURRENCIA
- no produce saldos negativos.

---

# 108. PRUEBAS DE ALMACENAMIENTO

Probar:

- capacidad;
- saturación;
- depósitos;
- retiradas;
- colas;
- almacén privado;
- almacenamiento especializado;
- expansión.

---

# 109. PRUEBAS DE LOGÍSTICA

Probar:

- capacidad;
- combustible;
- ruta;
- tiempo;
- disponibilidad;
- transporte contratado;
- pérdida/interrupción;
- llegada;
- retirada.

---

# 110. PRUEBAS DE ACCIONES

Probar:

- emisión;
- dilución;
- compra;
- venta;
- fundador;
- 10 % protegido;
- acciones adicionales del fundador;
- dividendos;
- voto.

---

# 111. PRUEBAS DAO

Probar:

- propuesta;
- notificación;
- voto humano;
- voto IA;
- ponderación;
- mayoría;
- cierre;
- ejecución;
- rechazo;
- expiración.

---

# 112. PRUEBAS DE TESORERÍA

Probar:

- ingresos;
- gastos;
- reservas;
- dividendos;
- Market Making;
- estados de crisis;
- recuperación.

---

# 113. PRUEBAS DE DEFENSA

Probar:

- detección;
- respuesta;
- asignación;
- daño;
- reparación;
- pérdida de infraestructura;
- protección de activos de terceros.

---

# 114. PRUEBAS DE AUTONOMÍA

Simular:

```text
0 jugadores conectados
```

durante un periodo significativo.

La Lonja debe continuar funcionando.

Verificar:

- producción;
- consumo;
- tesorería;
- Market Making;
- logística;
- defensa;
- proyectos;
- reservas.

---

# 115. SIMULACIÓN DE ESTRÉS

Crear escenarios:

### ESCENARIO A
Un jugador vende enorme volumen.

### ESCENARIO B
Cuatro jugadores venden simultáneamente enormes cantidades.

### ESCENARIO C
Muchos jugadores compran.

### ESCENARIO D
El almacén llega al máximo.

### ESCENARIO E
El Market Maker tiene poco inventario.

### ESCENARIO F
La Lonja sufre un ataque.

### ESCENARIO G
La tesorería entra en estado crítico.

### ESCENARIO H
Se financia un Megaproyecto.

### ESCENARIO I
Se produce una nueva ampliación de capital.

### ESCENARIO J
El fundador compra acciones adicionales y posteriormente las vende.

---

# 116. CRITERIOS DE ÉXITO

La implementación no se considera terminada si:

- el exchange es solo visual;
- los precios son falsos;
- existen botones muertos;
- los recursos se teletransportan;
- hay almacenamiento infinito;
- las naves no existen realmente;
- la DAO solo es decorativa;
- las acciones no tienen economía real;
- el Market Maker inventa liquidez;
- la IA genera recursos;
- el sistema se rompe cuando nadie está conectado;
- existen balances negativos;
- hay doble liquidación;
- el fundador puede perder su 10 % protegido;
- una Lonja funciona como planeta normal.

---

# 117. AUDITORÍA DE INTEGRACIÓN

Al finalizar, revisar todas las pantallas relacionadas.

Comprobar:

- navegación;
- botones;
- enlaces;
- datos;
- permisos;
- estados;
- persistencia;
- errores;
- coherencia.

Comprobar especialmente que cada tarjeta lleve a su sistema correcto y no a una pantalla de otro ministerio o funcionalidad.

---

# 118. AUDITORÍA DE DATOS

No permitir:

- datos ficticios presentados como reales;
- números aleatorios;
- balances inconsistentes;
- inventarios imposibles;
- precios sin operaciones;
- volumen ficticio.

Los datos de demostración deben identificarse como tales.

---

# 119. AUDITORÍA DE ECONOMÍA

Realizar una auditoría matemática completa:

- suma de acciones;
- porcentajes;
- dilución;
- dividendos;
- tesorería;
- reservas;
- Market Making;
- inventarios;
- almacenamiento;
- comisiones;
- financiación.

Verificar que:

```text
activos ≠ creados de la nada
```

y que toda transferencia tenga origen y destino válidos.

---

# 120. AUDITORÍA DE SEGURIDAD

Intentar romper deliberadamente:

- compra doble;
- venta doble;
- retiro doble;
- depósito doble;
- emisión duplicada;
- voto duplicado;
- dividendo duplicado;
- orden duplicada;
- cancelación duplicada.

Todas deben ser seguras.

---

# 121. AUDITORÍA DE EXPERIENCIA DE USUARIO

Comprobar:

- que se entiende qué es la Lonja;
- quién posee qué;
- qué pertenece al usuario;
- qué pertenece a la Lonja;
- qué es una acción;
- qué es una aportación;
- qué es una orden;
- dónde está un recurso;
- cuánto cuesta almacenar;
- cuánto cuesta transportar;
- qué está en tránsito;
- qué puede votar;
- qué está haciendo la IA.

---

# 122. AUDITORÍA DE IA

La IA debe ser autónoma pero limitada.

Auditar:

```text
IA decide
≠
IA hace magia
```

Toda decisión de IA debe terminar pasando por los sistemas económicos normales.

---

# 123. AUDITORÍA FINAL DE BOTONES

Recorrer manualmente toda la interfaz de la Lonja.

Pulsar todos los botones.

No debe quedar:

- botón sin acción;
- botón placebo;
- botón decorativo que parezca interactivo;
- enlace incorrecto;
- navegación rota.

---

# 124. AUDITORÍA FINAL DE DOBLE CLICK

Repetir pruebas de:

- botones;
- tarjetas;
- navegación;
- órdenes;
- votaciones;
- compra;
- venta;
- depósitos;
- retiradas;
- financiación.

Todo debe responder correctamente al primer click.

---

# 125. NO HACER CAMBIOS DESTRUCTIVOS SIN NECESIDAD

No borrar sistemas existentes porque parezcan antiguos.

Primero:

1. comprender;
2. comprobar dependencias;
3. reutilizar;
4. adaptar;
5. migrar;
6. probar;
7. eliminar únicamente cuando sea seguro.

---

# 126. COMPATIBILIDAD

No romper:

- planetas normales;
- economía existente;
- naves existentes;
- ministerios;
- navegación;
- Fondo Soberano;
- rutas;
- sistemas de comercio;
- sistemas de investigación;
- otras entidades.

La Lonja debe ser una extensión profunda del juego, no una ruptura del juego.

---

# 127. MIGRACIÓN DE DATOS

Si ya existen Lonjas creadas durante desarrollo:

crear una estrategia de migración segura.

No destruir datos.

Si faltan campos:

- asignar defaults;
- registrar migración;
- validar;
- no inventar valores económicos imposibles.

---

# 128. DOCUMENTACIÓN

Cada sistema implementado debe quedar documentado.

Documentar:

- modelos;
- APIs;
- eventos;
- reglas;
- cálculos;
- estados;
- errores;
- dependencias;
- tests.

---

# 129. NO DAR POR TERMINADO POR COMPILAR

El criterio de finalización es:

```text
COMPILA
+
FUNCIONA
+
PERSISTE
+
ES SEGURO
+
ES AUTÓNOMO
+
ESTÁ INTEGRADO
+
TIENE TESTS
+
HA SIDO AUDITADO
```

---

# 130. INFORME FINAL OBLIGATORIO

Cuando termines, generar un informe final con:

## A. IMPLEMENTADO

Lista exacta.

## B. MODIFICADO

Lista exacta.

## C. CREADO

Lista exacta.

## D. MIGRADO

Lista exacta.

## E. TESTS

Tests ejecutados y resultados.

## F. PROBLEMAS

Problemas encontrados.

## G. RIESGOS

Riesgos restantes.

## H. DEUDA TÉCNICA

Pendientes.

## I. AUDITORÍA

Resultado.

## J. ARCHIVOS

Lista de archivos modificados.

---

# 131. REGLA SOBRE INFORMACIÓN FALTANTE

Si encuentras una decisión no definida expresamente en esta especificación:

NO te detengas automáticamente para preguntarme si puedes resolverla razonablemente.

Primero:

1. analiza la arquitectura;
2. busca patrones existentes;
3. prioriza coherencia con el juego;
4. prioriza economía real;
5. prioriza seguridad;
6. prioriza autonomía;
7. documenta la decisión;
8. implementa la solución más coherente.

Solo detente si existe una contradicción real que impida continuar sin una decisión humana.

---

# 132. PRINCIPIO DE REALISMO ECONÓMICO

Cada elemento económico debe responder:

> ¿De dónde sale este activo?

> ¿Quién lo posee?

> ¿Dónde está físicamente?

> ¿Quién lo custodia?

> ¿Qué capacidad existe?

> ¿Qué coste tiene moverlo?

> ¿Qué riesgo existe?

> ¿Qué operación lo creó?

> ¿Qué operación puede destruirlo?

Si el sistema no puede responder estas preguntas, la implementación está incompleta.

---

# 133. PRINCIPIO DE NO MAGIA

Está absolutamente prohibido implementar:

- recursos mágicos;
- créditos mágicos;
- almacenamiento infinito;
- transporte instantáneo;
- liquidez infinita;
- precios ficticios;
- acciones gratuitas;
- dividendos sin beneficio;
- Market Making sin respaldo;
- IA omnipotente.

Todo debe tener una causa económica.

---

# 134. PRINCIPIO DE AUTONOMÍA

La Lonja debe comportarse como una organización económica viva.

Debe poder:

```text
producir
↓
vender
↓
ingresar
↓
mantener
↓
invertir
↓
crecer
↓
aumentar capacidad
↓
atraer comercio
↓
generar más actividad
```

Y también:

```text
sufrir crisis
↓
reducir gasto
↓
proteger reservas
↓
reducir exposición
↓
buscar financiación
↓
recuperarse
```

---

# 135. PRINCIPIO DE CRECIMIENTO ENDÓGENO

Más actividad económica debe poder producir:

```text
más ingresos
↓
más inversión
↓
más infraestructura
↓
más capacidad
↓
más comercio
↓
más ingresos
```

No debe depender únicamente de timers artificiales.

---

# 136. PRINCIPIO DE JUGADOR COMO PARTICIPANTE

El jugador debe sentir que está interactuando con una economía real.

Puede:

- invertir;
- comerciar;
- especular;
- prestar servicios;
- transportar;
- almacenar;
- votar;
- recibir dividendos;
- financiar proyectos.

Pero no tiene que microgestionar la Lonja.

---

# 137. PRINCIPIO DE IA COMO OPERADOR

La IA representa la administración autónoma.

No es una fuente de recursos.

No es un botón mágico.

Es el mecanismo que toma decisiones dentro de las reglas.

---

# 138. PRINCIPIO DE TRAZABILIDAD

Toda operación económica importante debe poder reconstruirse posteriormente.

Debe existir un historial suficiente para responder:

```text
¿Qué pasó?
¿Por qué?
¿Quién lo ejecutó?
¿Con qué activos?
¿A qué precio?
¿Dónde estaba el activo?
¿Qué comisión se pagó?
¿Cuál fue el resultado?
```

---

# 139. PRINCIPIO DE CONSISTENCIA

Una misma realidad económica debe tener una única fuente de verdad.

No permitir:

```text
frontend dice 100
backend dice 80
inventario dice 120
```

Debe existir reconciliación.

---

# 140. PRINCIPIO DE VALIDACIÓN FINAL

Al terminar toda la implementación:

1. ejecutar build;
2. ejecutar tests;
3. ejecutar tests de integración;
4. ejecutar tests económicos;
5. ejecutar tests de concurrencia;
6. ejecutar pruebas de UI;
7. revisar navegación;
8. revisar botones;
9. revisar persistencia;
10. revisar autonomía;
11. revisar acciones;
12. revisar DAO;
13. revisar Exchange;
14. revisar Market Maker;
15. revisar almacenamiento;
16. revisar logística;
17. revisar defensa;
18. revisar crisis;
19. revisar migración;
20. realizar auditoría final completa.

---

# 141. RESULTADO FINAL ESPERADO

Al finalizar, Juego Ascensión debe disponer de una Lonja Galáctica que pueda describirse así:

> Una entidad comercial autónoma fundada por un jugador, con un 10 % fundador protegido, propiedad accionarial ordinaria negociable, mercado secundario, gobernanza DAO ponderada por participación, tesorería propia, producción autónoma, infraestructura propia, Megaproyectos financiables, mercado spot continuo, libro de órdenes real, Market Makers respaldados por activos reales, almacenamiento físico limitado, logística física, transporte real, custodia de activos de terceros, defensa autónoma, IA operativa, membresías comerciales, dividendos y mecanismos de estabilidad económica.

Y todo ello debe estar:

```text
PERSISTENTE
+
TRANSACCIONAL
+
AUDITABLE
+
SEGURO
+
AUTÓNOMO
+
INTEGRADO
+
FUNCIONAL
```

---

# 142. ORDEN FINAL DE EJECUCIÓN

NO implementes todo de golpe sin control.

El flujo obligatorio será:

```text
LECTURA COMPLETA
↓
AUDITORÍA
↓
DESCOMPOSICIÓN EN MARKDOWN
↓
MAPA DE DEPENDENCIAS
↓
ARQUITECTURA
↓
FUNDACIÓN
↓
ACCIONES
↓
DAO
↓
ECONOMÍA
↓
EXCHANGE
↓
MARKET MAKER
↓
ALMACENAMIENTO
↓
LOGÍSTICA
↓
MINISTERIOS AUTÓNOMOS
↓
DESARROLLO
↓
MEGAPROYECTOS
↓
DEFENSA
↓
MEMBRESÍAS
↓
MERCADO SECUNDARIO
↓
IA
↓
INTEGRACIÓN
↓
SEGURIDAD
↓
TESTS
↓
AUDITORÍA FINAL
```

El orden exacto puede modificarse si el análisis de dependencias demuestra que existe un orden técnicamente mejor.

Pero ninguna fase debe saltarse.

---

# 143. REGLA FINAL Y MÁS IMPORTANTE

No quiero que implementes una apariencia de Lonja.

Quiero que implementes **la Lonja como un sistema económico real dentro de Juego Ascensión**.

Si una función aparece en la interfaz pero no tiene backend/lógica/persistencia real:

**NO ESTÁ IMPLEMENTADA.**

Si una operación económica puede crear activos de la nada:

**ESTÁ MAL IMPLEMENTADA.**

Si un recurso puede venderse sin existir físicamente:

**ESTÁ MAL IMPLEMENTADA.**

Si una orden puede ejecutarse dos veces:

**ESTÁ MAL IMPLEMENTADA.**

Si una IA puede saltarse las reglas:

**ESTÁ MAL IMPLEMENTADA.**

Si un botón no hace nada:

**ESTÁ MAL IMPLEMENTADO.**

Si el fundador puede perder o transferir su 10 % protegido:

**ESTÁ MAL IMPLEMENTADO.**

Si la Lonja necesita que un jugador esté conectado para funcionar:

**ESTÁ MAL IMPLEMENTADA.**

Si el Exchange es únicamente visual:

**ESTÁ MAL IMPLEMENTADO.**

Si el almacenamiento es infinito:

**ESTÁ MAL IMPLEMENTADO.**

Si la logística teletransporta recursos:

**ESTÁ MAL IMPLEMENTADA.**

Si la DAO solo cambia una etiqueta visual:

**ESTÁ MAL IMPLEMENTADA.**

Si los dividendos crean créditos de la nada:

**ESTÁ MAL IMPLEMENTADO.**

Si el Market Maker inventa liquidez:

**ESTÁ MAL IMPLEMENTADO.**

Si la implementación rompe los sistemas existentes de Ascensión:

**ESTÁ MAL IMPLEMENTADA.**

El objetivo final no es tener más pantallas.

El objetivo final es que la **Lonja Galáctica exista realmente como una entidad económica autónoma dentro del universo de Juego Ascensión.**