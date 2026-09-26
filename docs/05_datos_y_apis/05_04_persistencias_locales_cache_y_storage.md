# PERSISTENCIAS LOCALES, CACHÉ Y STORAGE

## 1. RUTA Y POLÍTICA DE ALMACENAMIENTO EN DISCO
- **Directorio de Datos del Usuario:** Ruta local de la aplicación en Windows.
- **Archivo Principal:** `savegame.json`.
- **Archivo de Respaldo:** `savegame.bak`.

## 2. PROTOCOLO DE ESCRITURA ATÓMICA Y TOLERANCIA A FALLOS
1. El renderer emite la solicitud de guardado con el estado serializado.
2. El proceso principal verifica si ya existe el archivo de guardado principal.
3. Si existe, lo copia a la extensión `.bak` antes de realizar cualquier modificación.
4. Escribe los nuevos datos en un archivo temporal (`savegame.tmp`).
5. Renombra atómicamente `savegame.tmp` al archivo principal mediante `fs.promises.rename`.
6. Si ocurre un fallo en el suministro eléctrico o en la escritura, el archivo anterior permanece intacto.

## 3. POLÍTICA DE `localStorage`
- `localStorage` se emplea únicamente como almacenamiento secundario para preferencias visuales no críticas, nunca como fuente de la partida.
