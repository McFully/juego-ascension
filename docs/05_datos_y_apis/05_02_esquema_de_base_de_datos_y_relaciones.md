# ESQUEMA DE BASE DE DATOS Y RELACIONES

## 1. ARQUITECTURA DE PERSISTENCIA BASADA EN DOCUMENTOS LOCALES
Al tratarse de un videojuego de estrategia 100% offline para escritorio, **Ascensión** no utiliza bases de datos relacionales cliente-servidor, sino una **Base de Datos Documental JSON Local**:
- **Almacén Primario:** Archivo JSON estructurado (`savegame.json`) en el directorio de datos de usuario de Windows.
- **Copia de Seguridad Atómica:** Respaldo automático (`savegame.bak`) generado antes de cada operación de guardado para garantizar tolerancia a fallos.

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
