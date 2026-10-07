# IMPLEMENTACIÓN DE SISTEMA DE AUDITORÍA VISUAL / UI TELEMETRY
## JUEGO ASCENSIÓN — HERRAMIENTA DE INSPECCIÓN VISUAL REAL DEL JUEGO

---

# 1. OBJETIVO

Quiero que implementes dentro de Juego Ascensión una herramienta interna de **Auditoría Visual de Interfaz / UI Visual Telemetry**.

Esta herramienta NO tiene como objetivo auditar principalmente la lógica interna, economía, backend o bases de datos.

Su objetivo principal es responder de forma objetiva a esta pregunta:

> **¿QUÉ ESTÁ RENDERIZANDO REALMENTE EL JUEGO EN PANTALLA?**

Necesito poder ejecutar una auditoría después de que una funcionalidad haya sido implementada y obtener un paquete de información que permita analizar:

- qué pantallas existen;
- qué rutas existen;
- qué componentes se están renderizando;
- qué tarjetas aparecen;
- qué botones aparecen;
- qué textos aparecen;
- dónde están colocados;
- qué tamaño tienen;
- qué estilos tienen;
- qué CSS computado reciben;
- qué elementos son visibles;
- qué elementos están ocultos;
- qué elementos están deshabilitados;
- qué elementos son interactivos;
- qué acción ejecuta cada botón;
- a qué pantalla conduce cada enlace;
- qué estructura DOM tiene cada pantalla;
- qué componentes React están detrás de la interfaz;
- qué errores aparecen;
- qué problemas visuales existen;
- y, sobre todo, generar **capturas de pantalla reales** de las pantallas auditadas.

La herramienta debe inspeccionar la interfaz REAL renderizada por el navegador.

No debe limitarse a leer archivos CSS o JSX estáticos.

---

# 2. UBICACIÓN EN LA INTERFAZ

Crear un nuevo apartado dentro de:

**AJUSTES PRINCIPALES**

con una sección:

> **Herramientas de desarrollo**

o:

> **Diagnóstico y auditoría**

Dentro de ella crear:

> **Auditoría Visual de Interfaz**

La estructura recomendada:

```text
AJUSTES PRINCIPALES
│
├── General
├── Audio
├── Gráficos
├── Controles
├── Notificaciones
├── ...
│
└── HERRAMIENTAS DE DESARROLLO
    │
    ├── Diagnóstico
    ├── Auditoría Visual
    └── Información del Sistema
```

La herramienta debe estar protegida para que no aparezca como una función normal para jugadores finales.

Utilizar el mecanismo de permisos/modo desarrollo que ya exista en el proyecto.

---

# 3. NO CREAR UNA SIMPLE PANTALLA INFORMATIVA

No quiero una pantalla que diga:

> "Auditoría visual disponible."

Quiero una herramienta funcional.

Debe existir un botón claramente visible:

> **GENERAR AUDITORÍA VISUAL COMPLETA**

Y botones secundarios:

- Auditar pantalla actual
- Auditar todas las pantallas
- Capturar pantalla actual
- Generar informe
- Exportar datos
- Exportar paquete completo

---

# 4. FUNCIONAMIENTO PRINCIPAL

Cuando el usuario pulse:

> GENERAR AUDITORÍA VISUAL COMPLETA

la herramienta debe ejecutar un proceso automatizado.

Flujo:

```text
INICIAR AUDITORÍA
        ↓
CAPTURAR INFORMACIÓN DE LA APLICACIÓN
        ↓
IDENTIFICAR RUTAS
        ↓
IDENTIFICAR PANTALLAS
        ↓
RECORRER PANTALLAS AUDITABLES
        ↓
RENDERIZAR CADA PANTALLA
        ↓
INSPECCIONAR DOM REAL
        ↓
INSPECCIONAR COMPONENTES
        ↓
INSPECCIONAR ESTILOS COMPUTADOS
        ↓
INSPECCIONAR TARJETAS
        ↓
INSPECCIONAR BOTONES
        ↓
INSPECCIONAR ENLACES
        ↓
INSPECCIONAR ELEMENTOS INTERACTIVOS
        ↓
CAPTURAR SCREENSHOT
        ↓
REGISTRAR ERRORES
        ↓
GENERAR INFORME
        ↓
EMPAQUETAR RESULTADOS
```

---

# 5. IMPORTANTE: INSPECCIONAR EL DOM REAL

No basta con leer:

```text
src/
```

ni con analizar:

```text
.jsx
.css
```

La herramienta debe inspeccionar el **DOM que realmente existe después del renderizado**.

Debe analizar:

```text
document
document.body
document.querySelector(...)
element.children
element.getBoundingClientRect()
getComputedStyle(element)
```

y cualquier mecanismo equivalente necesario.

---

# 6. INFORMACIÓN GENERAL DE LA AUDITORÍA

El informe debe incluir:

- fecha;
- hora;
- versión;
- build;
- commit Git si está disponible;
- entorno;
- navegador;
- resolución;
- viewport;
- escala/DPR si está disponible;
- ruta actual;
- usuario/modo;
- duración de auditoría.

Ejemplo:

```json
{
  "auditVersion": "1.0",
  "timestamp": "...",
  "gitCommit": "...",
  "viewport": {
    "width": 1920,
    "height": 1080,
    "devicePixelRatio": 1
  }
}
```

---

# 7. IDENTIFICACIÓN DE PANTALLAS

Para cada pantalla registrar:

- nombre;
- ruta;
- URL interna;
- identificador;
- componente principal si puede determinarse;
- título;
- estado;
- visibilidad;
- screenshot correspondiente.

Ejemplo:

```text
Screen:
Alto Mando Comercial — Lonja

Route:
/commercial/lonja

Component:
CommercialCommandView

Screenshot:
screens/001_commercial_lonja.png
```

---

# 8. INVENTARIO DE COMPONENTES

Para cada pantalla intentar identificar:

- componente principal;
- componentes hijos;
- componentes repetidos;
- tarjetas;
- botones;
- modales;
- paneles;
- tablas;
- gráficos;
- formularios;
- navegación.

La información debe indicar, cuando sea posible:

```text
componente
archivo
línea
elemento DOM
```

Si no es posible identificar el archivo fuente directamente desde producción, indicarlo como:

```text
sourceComponent: unknown
```

No inventar nombres.

---

# 9. TARJETAS

Detectar las tarjetas visuales.

No asumir que todas utilizan una clase llamada `card`.

Detectar mediante una combinación de:

- clases;
- atributos;
- estructura DOM;
- componentes;
- roles;
- patrones visuales.

Para cada tarjeta registrar:

- título;
- subtítulo;
- descripción;
- posición;
- tamaño;
- visibilidad;
- estado;
- clase CSS;
- componente;
- elementos hijos;
- botones;
- enlaces;
- destino;
- si es interactiva.

Ejemplo:

```json
{
  "type": "card",
  "title": "Terminal Bursátil Cuántico",
  "visible": true,
  "rect": {
    "x": 810,
    "y": 230,
    "width": 420,
    "height": 280
  },
  "interactive": true
}
```

---

# 10. BOTONES

Detectar TODOS los botones.

Incluir:

- `<button>`;
- elementos con `role="button"`;
- componentes equivalentes;
- botones visuales que realmente sean interactivos.

Registrar:

- texto;
- aria-label;
- title;
- clase;
- posición;
- tamaño;
- visible;
- disabled;
- loading;
- handler identificable;
- destino;
- acción;
- componente;
- estado.

Ejemplo:

```text
BOTÓN

Texto:
Terminal Bursátil

Visible:
YES

Disabled:
NO

Interactive:
YES

Target:
QuantumExchangeScreen

Handler:
navigate(...)

Resultado:
OK
```

---

# 11. DETECCIÓN DE BOTONES POTENCIALMENTE MUERTOS

Detectar posibles botones sin funcionalidad.

Marcar como sospechoso si:

- no tiene handler;
- no tiene enlace;
- no tiene acción identificable;
- no cambia estado;
- no provoca navegación;
- no abre modal;
- no ejecuta ninguna operación observable.

No afirmar automáticamente que está muerto si no puede determinarse con seguridad.

Utilizar estados:

```text
OK
WARNING
UNKNOWN
ERROR
```

Ejemplo:

```text
BOTÓN:
"Ver mercado"

Estado:
ERROR

Motivo:
Elemento interactivo detectado pero no se ha identificado acción asociada.
```

---

# 12. ENLACES Y NAVEGACIÓN

Auditar:

- enlaces;
- botones de navegación;
- rutas;
- tabs;
- menús;
- tarjetas navegables.

Registrar:

```text
origen
↓
acción
↓
destino
```

Esto permitirá detectar errores como:

```text
Directorio Comercial
↓
click
↓
Investigaciones
```

cuando debería ser:

```text
Directorio Comercial
↓
click
↓
DAO / Gobernanza
```

---

# 13. CSS COMPUTADO REAL

Para cada elemento relevante capturar `getComputedStyle()`.

No quiero únicamente la clase CSS.

Quiero saber cómo está realmente renderizado.

Capturar, cuando sea relevante:

- display;
- position;
- width;
- height;
- min-width;
- max-width;
- min-height;
- max-height;
- top;
- right;
- bottom;
- left;
- margin;
- padding;
- gap;
- grid-template-columns;
- grid-template-rows;
- flex-direction;
- flex-wrap;
- align-items;
- justify-content;
- font-family;
- font-size;
- font-weight;
- line-height;
- letter-spacing;
- color;
- background;
- background-color;
- border;
- border-radius;
- box-shadow;
- opacity;
- visibility;
- overflow;
- overflow-x;
- overflow-y;
- z-index;
- transform.

No es necesario capturar absolutamente todas las propiedades CSS de todos los nodos del DOM si eso genera un archivo gigantesco.

Pero sí deben capturarse todas las propiedades relevantes para reconstruir y entender visualmente los componentes importantes.

---

# 14. GEOMETRÍA

Para cada elemento relevante utilizar:

```javascript
element.getBoundingClientRect()
```

Registrar:

```text
x
y
width
height
top
right
bottom
left
```

Esto permitirá saber exactamente:

- dónde está una tarjeta;
- cuánto ocupa;
- si se solapa;
- si queda fuera de pantalla;
- si está comprimida;
- si existe un problema de layout.

---

# 15. VISIBILIDAD REAL

Determinar si un elemento:

- existe;
- está visible;
- está oculto;
- está fuera del viewport;
- tiene opacity 0;
- tiene visibility hidden;
- está display none;
- está tapado;
- está deshabilitado.

No confundir:

```text
existe en DOM
```

con:

```text
es visible para el usuario
```

---

# 16. DETECCIÓN DE OVERFLOW

Auditar especialmente:

- contenido cortado;
- scroll inesperado;
- tarjetas recortadas;
- textos ocultos;
- elementos fuera de pantalla;
- `overflow: hidden`;
- contenedores con altura insuficiente.

Registrar warnings cuando proceda.

---

# 17. DETECCIÓN DE SOLAPAMIENTOS

Detectar elementos relevantes que:

- se superponen;
- tapan botones;
- tapan tarjetas;
- quedan detrás;
- tienen z-index incorrecto.

No marcar como error los solapamientos deliberados propios de modales, overlays o elementos diseñados para superponerse.

---

# 18. SCREENSHOTS REALES

Este punto es OBLIGATORIO.

La herramienta debe generar capturas reales de la interfaz.

Preferiblemente utilizar el mecanismo de captura del navegador/entorno disponible.

No generar una imagen artificial a partir del JSON.

La captura debe representar exactamente lo que el usuario ve.

---

# 19. SCREENSHOT POR PANTALLA

Cada pantalla auditada debe tener una captura.

Ejemplo:

```text
screens/
├── 001_alto_mando_comercial.png
├── 002_lonja.png
├── 003_directorio_comercial.png
├── 004_terminal_bursatil.png
├── 005_megaproyectos.png
├── 006_fondo_soberano.png
├── 007_red_logistica.png
└── 008_bastion_seguridad.png
```

Los nombres deben generarse de forma segura.

---

# 20. RESOLUCIÓN

La auditoría debe usar una resolución estándar reproducible.

Por defecto:

```text
1920 × 1080
```

si el entorno lo permite.

También registrar la resolución real utilizada.

---

# 21. CAPTURA DE LA PANTALLA COMPLETA

Cuando sea posible generar:

- viewport screenshot;
- full-page screenshot.

Así podremos diferenciar:

```text
lo visible inicialmente
```

de:

```text
todo el contenido desplazable.
```

---

# 22. INFORMACIÓN DE SCROLL

Registrar:

- scrollTop;
- scrollHeight;
- clientHeight;
- scrollWidth;
- clientWidth.

Esto permitirá detectar interfaces excesivamente largas.

---

# 23. ESTRUCTURA DOM

Generar una representación resumida del DOM.

No necesito cada `<span>` insignificante.

Priorizar:

- layout;
- containers;
- cards;
- buttons;
- headings;
- tables;
- charts;
- navigation;
- dialogs;
- forms.

Ejemplo:

```text
MAIN
└── HEADER
└── NAVIGATION
└── CONTENT
    ├── CARD
    │   ├── TITLE
    │   ├── DESCRIPTION
    │   └── BUTTON
    ├── CARD
    └── CARD
└── FOOTER
```

---

# 24. GRÁFICOS

Detectar:

- canvas;
- SVG;
- gráficos;
- charts;
- visualizaciones.

Registrar:

- tipo de elemento;
- tamaño;
- posición;
- visibilidad;
- título si existe;
- librería si puede determinarse;
- componente origen si puede determinarse.

No intentar interpretar el contenido financiero del gráfico en esta fase.

El objetivo es saber:

> ¿Existe realmente el gráfico en pantalla?

---

# 25. TABLAS

Detectar tablas reales.

Registrar:

- número de filas;
- número de columnas;
- encabezados;
- visibilidad;
- tamaño;
- scroll;
- componente.

---

# 26. MODALES

Detectar:

- dialogs;
- overlays;
- drawers;
- ventanas emergentes.

Registrar:

- si están abiertos;
- tamaño;
- posición;
- contenido;
- botones;
- cierre.

---

# 27. ERRORES DEL NAVEGADOR

Durante la auditoría capturar:

- console errors;
- uncaught exceptions;
- warnings relevantes;
- errores de red si el entorno permite capturarlos;
- errores de renderizado.

Separar:

```text
ERROR
WARNING
INFO
```

---

# 28. ARCHIVO JSON PRINCIPAL

Generar:

```text
visual-audit.json
```

Debe contener toda la información estructural.

Estructura aproximada:

```json
{
  "audit": {},
  "application": {},
  "environment": {},
  "screens": [],
  "components": [],
  "cards": [],
  "buttons": [],
  "navigation": [],
  "styles": {},
  "screenshots": [],
  "errors": [],
  "warnings": []
}
```

No es obligatorio utilizar exactamente esta estructura si existe una arquitectura mejor.

Pero debe contener toda la información relevante.

---

# 29. INFORME MARKDOWN

Generar también:

```text
visual-audit.md
```

Este documento debe ser legible por una persona.

Debe contener:

1. resumen;
2. versión;
3. fecha;
4. resolución;
5. pantallas;
6. componentes;
7. tarjetas;
8. botones;
9. navegación;
10. problemas;
11. warnings;
12. screenshots;
13. estadísticas;
14. conclusiones.

---

# 30. INVENTARIO DE PANTALLAS

El informe debe incluir una tabla similar a:

| Pantalla | Ruta | Visible | Componentes | Tarjetas | Botones | Screenshot |
|---|---|---:|---:|---:|---:|---|
| Alto Mando Comercial | ... | Sí | ... | ... | ... | ... |
| Lonja | ... | Sí | ... | ... | ... | ... |

---

# 31. INVENTARIO DE TARJETAS

Incluir:

| Pantalla | Tarjeta | Visible | Posición | Tamaño | Interactiva | Destino |
|---|---|---|---|---|---|---|

---

# 32. INVENTARIO DE BOTONES

Incluir:

| Pantalla | Botón | Visible | Disabled | Acción | Destino | Estado |
|---|---|---|---|---|---|---|

---

# 33. INVENTARIO DE RUTAS

Incluir:

```text
Ruta
↓
Pantalla
↓
Componente
↓
Estado
```

Esto será muy importante para detectar navegaciones incorrectas.

---

# 34. MANIFEST

Generar:

```text
VISUAL_AUDIT_MANIFEST.json
```

Debe incluir:

```text
auditVersion
timestamp
buildVersion
gitCommit
environment
browser
viewport
screens
screenshots
files
```

---

# 35. IDENTIFICACIÓN DE LA VERSIÓN

Si existe Git:

capturar:

```text
git commit
branch
dirty state
```

siempre que sea posible.

Así sabremos exactamente qué versión del juego produjo la auditoría.

---

# 36. PAQUETE FINAL

Generar un ZIP:

```text
JuegoAscension_UI_Audit_<timestamp>.zip
```

Contenido:

```text
visual-audit.json
visual-audit.md
VISUAL_AUDIT_MANIFEST.json

/screens
/components
/styles
/navigation
/errors
```

No incluir secretos.

NO incluir:

- contraseñas;
- tokens;
- API keys;
- credenciales;
- cookies;
- información privada innecesaria.

---

# 37. BOTÓN DE EXPORTACIÓN

Debe existir:

> **EXPORTAR AUDITORÍA**

y producir el ZIP.

Mostrar:

```text
Auditoría generada correctamente.

Pantallas auditadas: X
Componentes: X
Tarjetas: X
Botones: X
Warnings: X
Errores: X

[EXPORTAR ZIP]
```

---

# 38. AUDITAR PANTALLA ACTUAL

Crear también:

> **AUDITAR PANTALLA ACTUAL**

Esto permitirá hacer una auditoría rápida sin recorrer todo el juego.

Debe generar:

```text
current-screen.json
current-screen.md
current-screen.png
```

---

# 39. MODO AUTOMÁTICO

Crear:

> **AUDITORÍA COMPLETA**

que intente recorrer todas las rutas/pantallas que puedan ser auditadas automáticamente.

No ejecutar acciones destructivas.

No:

- comprar;
- vender;
- borrar;
- transferir;
- construir;
- invertir;
- votar;
- lanzar ataques.

La auditoría debe ser principalmente de lectura.

---

# 40. NAVEGACIÓN SEGURA

Para recorrer pantallas:

- utilizar rutas conocidas;
- utilizar estados de prueba si existen;
- utilizar fixtures/mock data únicamente si son necesarios para renderizar una pantalla;
- marcar claramente cualquier pantalla renderizada con datos simulados.

No modificar datos reales del jugador durante una auditoría.

---

# 41. DATOS DE PRUEBA

Si una pantalla necesita datos para mostrar sus componentes:

utilizar un entorno seguro de auditoría.

Ejemplo:

```text
UI_AUDIT_MODE = true
```

Nunca utilizar este modo para modificar economía real.

---

# 42. NO FINGIR ELEMENTOS AUSENTES

Si un componente no aparece porque faltan datos:

NO inventarlo en el informe.

Registrar:

```text
componentExpectedButNotRendered
```

si existe una expectativa conocida.

---

# 43. SISTEMA DE EXPECTATIVAS VISUALES

Crear opcionalmente un manifiesto:

```text
ui-audit-expectations.json
```

Este archivo podrá definir posteriormente qué debe aparecer en determinadas pantallas.

Ejemplo:

```json
{
  "screen": "LonjaCommercialCommand",
  "expectedCards": [
    "Directorio Comercial",
    "Terminal Bursátil Cuántico",
    "Centro de Desarrollo",
    "Megaproyectos",
    "Fondo Soberano",
    "Red Logística",
    "Bastión de Seguridad"
  ]
}
```

---

# 44. COMPARACIÓN ESPERADO VS REAL

Si existe `ui-audit-expectations.json`, generar:

```text
visual-audit-comparison.md
```

con:

```text
ESPERADO
↓
REAL
↓
DIFERENCIA
```

Ejemplo:

```text
🔴 Centro de Desarrollo

Esperado: SÍ
Encontrado: NO
Resultado: FALTA

🟢 Fondo Soberano

Esperado: SÍ
Encontrado: SÍ
Resultado: OK
```

---

# 45. NO LIMITAR EL SISTEMA A LA LONJA

Aunque la primera finalidad sea auditar la Lonja Galáctica, la herramienta debe ser genérica.

Debe poder auditar posteriormente:

- planetas;
- alto mando;
- ministerios;
- diplomacia;
- banca;
- comercio;
- investigación;
- flotas;
- navegación;
- otras pantallas.

---

# 46. MODO DE DESARROLLO

La herramienta debe estar disponible solamente cuando:

```text
development/debug/admin/audit mode
```

esté habilitado.

No debe ser accesible para un jugador normal en producción pública.

---

# 47. SEGURIDAD

Nunca permitir que un jugador normal pueda:

- inspeccionar información privada;
- descargar secretos;
- obtener tokens;
- obtener credenciales;
- obtener información interna del servidor.

La auditoría debe limitarse a información necesaria para inspección de UI.

---

# 48. RENDIMIENTO

No ejecutar continuamente.

La auditoría solo debe ejecutarse cuando el usuario la solicita.

No añadir listeners permanentes innecesarios.

Eliminar listeners al finalizar.

---

# 49. ROBUSTEZ

Si una pantalla falla durante la auditoría:

NO detener todo el proceso.

Registrar:

```text
screen
error
stack
timestamp
```

y continuar con la siguiente pantalla.

Al final:

```text
Pantallas exitosas: X
Pantallas con error: Y
```

---

# 50. PANTALLAS NO AUTOMATIZABLES

Si una pantalla requiere interacción manual o condiciones especiales:

registrarla como:

```text
MANUAL_AUDIT_REQUIRED
```

No fingir que ha sido auditada.

---

# 51. ESTADOS DE AUDITORÍA

Cada pantalla debe terminar con uno de:

```text
PASSED
WARNING
FAILED
MANUAL_REQUIRED
```

---

# 52. DETECCIÓN DE PROBLEMAS VISUALES

El sistema debe intentar detectar automáticamente:

- elementos fuera del viewport;
- botones invisibles;
- botones demasiado pequeños;
- texto desbordado;
- elementos superpuestos;
- overflow;
- tarjetas sin contenido;
- botones sin acción identificable;
- enlaces sin destino;
- elementos disabled inesperadamente;
- componentes vacíos.

No convertir heurísticas en certezas.

Utilizar:

```text
ERROR
WARNING
UNKNOWN
```

según el grado de certeza.

---

# 53. TAMAÑOS Y POSICIONES

Registrar siempre coordenadas relativas al viewport.

Esto permitirá comparar:

```text
versión A
```

contra:

```text
versión B
```

posteriormente.

---

# 54. POSIBILIDAD DE REGRESIÓN VISUAL

Diseñar la estructura para permitir posteriormente:

```text
AUDITORÍA A
vs
AUDITORÍA B
```

y detectar:

- tarjeta desaparecida;
- botón desaparecido;
- cambio de tamaño;
- cambio de posición;
- cambio de ruta;
- cambio de estilo;
- cambio de cantidad de componentes.

---

# 55. HASH DE COMPONENTES

Cuando sea posible, generar identificadores/hashes de determinados elementos o estructuras.

Esto puede ayudar a detectar:

```text
misma estructura
```

frente a:

```text
estructura modificada.
```

---

# 56. NO CONFIAR ÚNICAMENTE EN SELECTORES CSS

Los selectores CSS pueden cambiar.

Utilizar múltiples identificadores:

- role;
- aria-label;
- texto;
- data-testid;
- id;
- class;
- estructura;
- componente;
- ruta.

---

# 57. DATA ATTRIBUTES

Cuando sea razonable y no rompa la arquitectura, añadir atributos estables como:

```html
data-ui-audit-id="lonja-terminal-bursatil"
```

o equivalentes.

Esto facilitará futuras auditorías.

No llenar indiscriminadamente todo el DOM de atributos innecesarios.

---

# 58. COMPONENTES IMPORTANTES

Priorizar identificación de:

- cards;
- buttons;
- tabs;
- navigation;
- dialogs;
- tables;
- charts;
- forms;
- menus;
- headers;
- footers;
- main content;
- sidebars.

---

# 59. INFORME DE ESTADÍSTICAS

Al final mostrar:

```text
Pantallas auditadas: 42

Componentes: 317

Tarjetas: 84

Botones: 191

Enlaces: 73

Charts: 11

Tablas: 8

Warnings: 13

Errores: 2
```

---

# 60. INTEGRACIÓN CON LOS TESTS

La herramienta debe poder utilizarse desde tests cuando sea posible.

Crear tests para comprobar:

- generación del informe;
- identificación de botones;
- identificación de tarjetas;
- screenshots;
- manifest;
- exportación;
- detección de errores.

---

# 61. PRUEBA FUNDAMENTAL

Después de implementar la herramienta, ejecutarla sobre la propia pantalla de:

**Auditoría Visual**

y verificar que:

- se detecta;
- se captura;
- se documenta;
- el ZIP se genera;
- no aparecen errores.

---

# 62. PRUEBA SOBRE LA LONJA

Ejecutar una auditoría completa sobre las pantallas actuales de Lonja.

Especialmente:

- Alto Mando Comercial;
- Directorio Comercial;
- Terminal Bursátil Cuántico;
- Centro de Desarrollo;
- Megaproyectos;
- Fondo Soberano;
- Red Logística;
- Bastión de Seguridad;
- ministerios relacionados.

---

# 63. IMPORTANTE: NO CORREGIR AUTOMÁTICAMENTE

La primera versión del auditor debe:

**OBSERVAR Y REPORTAR.**

No modificar automáticamente la interfaz.

No cambiar CSS.

No añadir tarjetas.

No borrar tarjetas.

No cambiar rutas.

No modificar código durante la auditoría.

El objetivo es obtener una radiografía fiable.

---

# 64. RESULTADO QUE NECESITO DE ANTIGRAVITY

Una vez implementado:

1. ejecuta la herramienta;
2. genera una auditoría real;
3. verifica que el ZIP existe;
4. proporciona en el informe:
   - ubicación;
   - nombre del archivo;
   - número de pantallas;
   - número de componentes;
   - número de tarjetas;
   - número de botones;
   - errores;
   - warnings.

---

# 65. CRITERIO DE ACEPTACIÓN FINAL

La funcionalidad se considera correctamente implementada cuando pueda hacer:

```text
AJUSTES PRINCIPALES
↓
HERRAMIENTAS DE DESARROLLO
↓
AUDITORÍA VISUAL
↓
GENERAR AUDITORÍA VISUAL COMPLETA
↓
ESPERAR
↓
EXPORTAR ZIP
```

y obtener un paquete que permita conocer de forma objetiva:

> **qué está mostrando realmente el juego, cómo está estructurado visualmente, qué componentes lo generan, qué estilos tiene, qué botones existen, a dónde conducen y qué pantallas se están renderizando.**

---

# 66. REGLA FINAL

No quiero que esta herramienta genere un informe basado en lo que el código "pretende" mostrar.

Quiero que describa:

# LO QUE REALMENTE ESTÁ RENDERIZADO EN EL NAVEGADOR.

Debe existir una diferencia clara entre:

```text
IMPLEMENTADO EN CÓDIGO
```

y:

```text
RENDERIZADO REALMENTE
```

La segunda es la información prioritaria de esta herramienta.

El objetivo es que, posteriormente, pueda proporcionar el ZIP de auditoría y las capturas generadas y utilizar esa información para realizar una auditoría visual externa, sin tener que adivinar cómo está construida actualmente la interfaz.

---

# 67. ENTREGA FINAL DE ANTIGRAVITY

Al terminar esta tarea, NO limitarse a decir:

> "Auditoría visual implementada."

Debes informar:

```text
ARCHIVOS CREADOS
ARCHIVOS MODIFICADOS
RUTAS AÑADIDAS
COMPONENTES AÑADIDOS
MÉTODO DE GENERACIÓN
MÉTODO DE EXPORTACIÓN
FORMATO DEL ZIP
FORMATO JSON
FORMATO MARKDOWN
TESTS REALIZADOS
RESULTADOS
LIMITACIONES CONOCIDAS
```

Y realizar una primera ejecución real sobre la aplicación para demostrar que el sistema funciona.