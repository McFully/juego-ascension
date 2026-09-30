# Auditoría de Assets y Catálogo de Imágenes — MISSING_ASSETS.md
**Proyecto:** Ascension (Juego 100% Offline para Windows)  
**Fecha:** 2026-09-30  
**Fase de Implementación:** FASE 07 — Pipeline de imágenes y assets  
**Estado General:** ✅ **0 ASSETS REFERENCIADOS FALTANTES (INTEGRIDAD 100%)**

---

## 1. Declaración Oficial de Integridad
Tras la ejecución exhaustiva del script de verificación de catálogo (`scripts/verify-catalog-integrity.cjs`) y la suite de pruebas automatizadas de contrato (`src/__tests__/assetsContract.test.js`), se constata y certifica formalmente que:

- **Total de referencias en catálogo (`REAL_IMAGES`):** 557 items.
- **Assets referenciados presentes en disco:** 557 (100%).
- **Assets referenciados faltantes:** **0 (CERO)**.
- **Errores HTTP 404 / Enlaces rotos de assets en runtime:** **0**.

---

## 2. Acciones de Saneamiento y Limpieza Ejecutadas

### 2.1. Eliminación de Claves Duplicadas en Catálogo
Se eliminaron 14 declaraciones duplicadas al final de `src/data/assetsCatalog.js` que sobreescribían claves del menú principal e interfaces modales con imágenes no deseadas:
- Claves duplicadas saneadas: `menuNewGame`, `menuContinue`, `menuSaveGame`, `menuLoadGame`, `menuTutorial`, `menuSettings`, `menuExit`, `menuCustomGalaxy`, `menuEmpire`, `menuPlanet`, `menuFleets`, `menuShipyard`, `menuResearch`, `menuMissions`.
- Adición de alias limpios: `menuImport`, `menuExport`.
- **Claves duplicadas en objeto léxico `REAL_IMAGES`:** **0**.

### 2.2. Erradicación de Assets Huérfanos
1. `Assets/aiCore.webp`: Eliminado. El catálogo ya apuntaba canónicamente a `Assets/Núcleo de IA.webp` (89 KB, lossless).
2. `public/backgrounds/government/*.svg` (11 archivos): Eliminados físicamente. Correspondían a la propiedad muerta `bgImage` de `src/data/ministryMetadata.js`, que nunca fue leída por ningún componente ni renderizada en la UI.
3. `src/assets/cartoon/*.svg` y `src/assets/leaders/*.svg` (11 archivos): Eliminados físicamente tras confirmar 0 referencias activas en el código de producción.
4. `Assets/prompts_image_library.md` (45 KB): Reubicado a `docs/prompts_image_library.md` para evitar empaquetado innecesario en el bundle final de Vite.
5. `Musica-menu.ogg` (3,9 MB en raíz): Confirmada su eliminación previa (Fase 04); la única copia servida es `public/Musica-menu.ogg`.

### 2.3. Pipeline de Conversión Lossless
- En `scripts/convert-assets-to-webp.cjs`, se actualizó la configuración de Sharp a compresión sin pérdidas (`lossless: true`) y se eliminó el redimensionado forzado destructivo con recorte (`resize(1920,1080, {fit: 'cover'})`).
- Se mantiene la integridad visual 1:1 de todos los renders espaciales sin degradación de artefactos de compresión.

---

## 3. Registro de Entradas (Formato Especificación Phase 27)

Como resultado del diagnóstico:
**NO FALTA NINGÚN ASSET REFERENCIADO EN EL CÓDIGO.**

Cualquier futura solicitud de nuevos assets temáticos o decorativos deberá seguir la plantilla normativa:
- **identifier:** `[ID del asset]`
- **screen:** `[Pantalla donde se muestra]`
- **section:** `[Sección interna]`
- **card:** `[Tarjeta o componente contenedor]`
- **function:** `[Propósito funcional/lúdico]`
- **reason:** `[Motivo por el que se requiere]`
- **replacement:** `[Asset sustituido o 'Ninguno']`
- **descripción visual precisa:** `[Detalle del render espacial]`
- **orientación:** `[Horizontal/Vertical/Cuadrada]`
- **formato:** `webp (lossless)`
- **aspect ratio:** `[16:9 / 1:1 / 4:3]`
- **resolución:** `[p.ej. 1920x1080 o 512x512]`
- **restricciones:** `Fondo espacial oscuro profundo, sin texto embebido, estética premium Ascension`
- **filename propuesto:** `[nombre_en_assets.webp]`
