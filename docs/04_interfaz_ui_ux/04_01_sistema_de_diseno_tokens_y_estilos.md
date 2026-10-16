# SISTEMA DE DISEÑO, TOKENS Y ESTILOS

## 1. PALETA CROMÁTICA SCI-FI ESPACIAL
El estilo visual de **Ascensión** se basa en un diseño espacial oscuro y tecnológico de grado militar:
- **Fondo Primario Global:** `#030712` (`bg-slate-950` / `space-black`).
- **Paneles y Contenedores HUD:** `#0f172a` (`bg-slate-900/80`) con acabado mate y opacidad táctica.
- **Bordes y Delimitadores:** `cyan-500/30` o `cyan-500/20` para marcos tenues de alta definición.
- **Color de Acento Primario:** `#06b6d4` (`cyan-500`) para elementos interactivos, selecciones y tecnología.
- **Acentos Económicos:** `#f59e0b` (`amber-500`) para metal, `#38bdf8` (`sky-400`) para cristal, `#10b981` (`emerald-500`) para deuterio y `#eab308` (`yellow-500`) para energía.
- **Acentos de Combate y Alerta:** `#ef4444` (`red-500`) para flotas hostiles, invasiones y daño crítico.

## 2. ESCALA TIPOGRÁFICA Y FUENTES
- **Tipografía de Datos / Métricas:** `font-mono` con espaciado amplio (`tracking-wider`) para coordenadas, tiempos, recursos y cantidades numéricas.
- **Tipografía de Navegación y Títulos:** Sans-serif moderna (`font-sans`, `font-bold`, `uppercase`, `tracking-widest`).

## 3. MICROINTERACCIONES Y EFECTOS VISUALES
- **Elevación y Sombras:** `shadow-lg`, `shadow-cyan-950/40` para resaltar elementos flotantes.
- **Hover Táctico:** `hover:border-cyan-400`, `hover:bg-slate-800/80`, `hover:scale-[1.01]` con transiciones de 150ms a 200ms.
- **Glow Espacial:** Resplandor cian tenue en botones primarios y tarjetas de construcción activas.

## 4. PIPELINE Y ARQUITECTURA DE ASSETS DUAL (CARD THUMBNAILS Y FULL-RES)
- **Imágenes Maestras (`Assets/`):** 470 ilustraciones WebP en resolución completa (1080p+, ~800 KB a 1.5 MB), preservadas sin pérdidas ni alteraciones destructivas.
- **Miniaturas Tácticas (`Assets/cards/`):** Redimensionadas a 560px de ancho con factor de compresión WebP q82 (~35 KB por asset, 96.3% de reducción de peso).
- **Mapeo Automático (`src/assets.jsx`):**
  - `getCardImage(id, category)`: Entrega miniaturas ultraligeras para el 100% de la navegación de menús y tarjetas (`CardBanner`, `CardImage`, `SafeImg`).
  - `getFullImage(id, category)`: Entrega la imagen maestra en alta definición para vistas ampliadas y modales de inspección (`CodexModal` con `fullRes={true}`).
  - **Fallback de Seguridad:** Si un archivo no tiene miniatura generada, el resolver conmuta automáticamente a la versión maestra original sin pantallas en blanco.
- **Generador Batch Incremental:** `scripts/generateCardThumbnails.cjs` (procesamiento local con `sharp`).

