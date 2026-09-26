# PERSISTENCIAS LOCALES, CACHÉ Y STORAGE

## 1. RUTA Y POLÍTICA DE ALMACENAMIENTO EN DISCO
- **Directorio de Datos del Usuario:** `%APPDATA%/Ascension/saves/`.
- **Archivo Principal:** `universe.db` (base de datos transaccional SQLite).
- **Archivo de Respaldo:** `universe.db.bak` (copia previa inmediata ante cada guardado).

## 2. PROTOCOLO DE ESCRITURA ATÓMICA Y TOLERANCIA A FALLOS
1. El renderer emite la solicitud de guardado con el estado serializado vía Electron IPC (`gameRepository.cjs`).
2. El proceso principal verifica la integridad del archivo `universe.db`.
3. Si existe, realiza una copia física a `universe.db.bak` antes de iniciar la transacción.
4. Ejecuta una transacción ACID atómica en SQLite actualizando el universo, metadatos y sello temporal.
5. Si ocurre un fallo en el suministro eléctrico o en la escritura, el archivo anterior y su respaldo permanecen intactos.
6. Soporte de exportación/importación manual a JSON para comodín del jugador sin depender de éste para la persistencia nativa.

## 3. POLÍTICA DE `localStorage`
- `localStorage` se emplea estrictamente como almacenamiento secundario para preferencias visuales no críticas (ej. filtros de UI), nunca como fuente de la partida.

