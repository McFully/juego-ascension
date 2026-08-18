# 🛡️ BLOQUE 6: CALIDAD, SEGURIDAD Y RENDIMIENTO

## 06.01 AUDITORÍA DE SEGURIDAD Y PRECARGA ELECTRON (`electron/preload.cjs`)

### Isolation de Contexto (`contextIsolation: true`)
La comunicación entre la interfaz (React) y el sistema operativo está estrictamente aislada mediante la API `contextBridge`. El entorno web **no tiene acceso a la librería `node:fs`, `child_process` ni al objeto global `require`**.

### Métodos Expuestos en `window.electronAPI`:
- `saveGame(saveData)`: Envía el objeto de guardado al proceso principal.
- `loadGame()`: Solicita la lectura de la partida guardada desde disco local.
- `onSaveResult(callback)`: Suscripción a eventos de confirmación de guardado.

---

## 06.02 OPTIMIZACIÓN DE RENDIMIENTO Y RENDERING
1. **Lazy Loading Diferido con React Suspense:** Las 18 páginas principales del juego se importan bajo demanda, reduciendo el tamaño del bundle inicial a menos de 400 KB.
2. **Memorización de Cálculos Costosos (`useMemo`):** Los cálculos de producción diaria, consumos de combustible y capacidad de almacenes se recalculan únicamente al modificar los niveles de edificios o tecnologías correspondientes.
3. **Control del Watchdog de Arranque (10s):** `LoadingScreen` incluye un temporizador defensivo de 10 segundos. Si el sistema operativo bloquea la lectura en disco, ofrece un botón de reintento o forzado de inicio sin romper el hilo del proceso.
