# STACK TECNOLÓGICO Y ÁRBOL DE DEPENDENCIAS

## 1. DEPENDENCIAS DE PRODUCCIÓN (RUNTIME)
| Paquete | Versión Exacta | Propósito en el Juego | Justificación Técnica |
| :--- | :--- | :--- | :--- |
| `react` | `18.3.1` | Núcleo del árbol de componentes de interfaz | Renderizado declarativo eficiente y manejo de estado reactivo |
| `react-dom` | `18.3.1` | Montaje en el DOM virtual de Chromium | Enlace con la raíz HTML |
| `framer-motion` | `11.15.0` | Animaciones y transiciones de interfaz | Microinteracciones espaciales, modales y animaciones HUD |
| `three` | `0.183.0` | Gráficos 3D espaciales | Renderizado del mapa galáctico y visualización de sistemas planetarios |

## 2. DEPENDENCIAS DE DESARROLLO Y COMPILACIÓN
| Herramienta | Versión Exacta | Función |
| :--- | :--- | :--- |
| `electron` | `42.2.0` | Contenedor de escritorio nativo Windows |
| `electron-builder` | `26.8.1` | Empaquetado en instaladores NSIS y binarios portables |
| `vite` | `6.0.5` | Empaquetador de módulos ultrarrápido y servidor HMR |
| `tailwindcss` | `3.4.17` | Motor de utilidades CSS para estilizado pixel-perfect |
| `postcss` | `8.4.49` | Procesamiento de hojas de estilo |
| `autoprefixer` | `10.4.20` | Prefijado automático CSS para motores Chromium |
| `vitest` | `4.1.8` | Framework de testing unitario ultrarrápido |
| `sharp` | `0.34.2` | Optimización y reescalado de imágenes y assets |
| `@tauri-apps/api` | `2.9.1` | Capa puente experimental para arquitecturas nativas |

## 3. POLÍTICA DE DEPENDENCIAS EXTERNAS
- Queda terminantemente prohibido incorporar SDKs con llamadas salientes de red en el runtime del ejecutable.
- Todas las librerías se compilan localmente dentro del bundle empaquetado en `dist/`.
