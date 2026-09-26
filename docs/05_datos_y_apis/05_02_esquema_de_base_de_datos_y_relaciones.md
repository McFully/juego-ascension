# ESQUEMA DE BASE DE DATOS Y RELACIONES

## 1. ARQUITECTURA DE PERSISTENCIA BASADA EN SQLITE LOCAL UNIFICADO (v4)
Al tratarse de un videojuego de estrategia espacial 100% offline para escritorio, **Ascensión** utiliza un motor embebido de alto rendimiento **SQLite local** mediante `better-sqlite3`:
- **Almacén Primario:** Archivo SQLite transaccional local en `%APPDATA%/Ascension/saves/universe.db`.
- **Copia de Seguridad Atómica:** Respaldo automático (`universe.db.bak`) generado antes de cada transacción para garantizar tolerancia absoluta a fallos de alimentación.
- **Canal de Comunicación:** IPC seguro entre el proceso Main de Electron (`gameRepository.cjs`) y el Renderer.
- **Migración Legacy Automática:** El subsistema `loadMigrator.js` detecta saves históricos en formato JSON (`v2`, `v3`) y los transforma en transacciones SQLite `v4` de forma desatendida.

## 2. DIAGRAMA ENTIDAD-RELACIÓN DEL DOMINIO
```
+------------------+         1:N         +------------------+
|    GameState     |-------------------->|      Planet      |
+------------------+                     +------------------+
         |                                         |
         | 1:N                                     | 1:N
         v                                         v
+------------------+                     +------------------+
|   FleetMission   |                     |    QueueItem     |
+------------------+                     +------------------+
         |
         | 1:1
         v
+------------------+
|   CombatReport   |
+------------------+
```

