# AUDITORÍA DE VARIABLES DE ENTORNO

## 1. POLÍTICA SAGRADA DE VARIABLES DE ENTORNO
El ejecutable de **Ascensión** está diseñado para ser un software local autosuficiente sin conexión a servidores externos ni APIs en la nube.
Por tanto, el runtime final **NO depende de claves secretas en la nube ni de archivos `.env` remotos**.

## 2. VARIABLES DE ENTORNO INTERNAS Y DE BUILD
| Variable | Ámbito | Valor por Defecto | Propósito |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | Compilación / Runtime | `development` o `production` | Determina optimizaciones de Vite y flags de depuración de Electron |
| `ELECTRON_IS_DEV` | Proceso Principal | Derivado de argumentos | Permite abrir las DevTools de Chromium durante el desarrollo local |
| `TAURI_DEV_HOST` | Experimental | `localhost` | Configuración de socket para el puente experimental Tauri |

## 3. AISLAMIENTO Y SEGURIDAD DE CREDENCIALES
- Prohibida la inclusión de tokens privados de Vercel, Firebase o Supabase dentro del paquete binario final del juego.
- Las herramientas de despliegue de landing residen fuera del árbol del ejecutable.
