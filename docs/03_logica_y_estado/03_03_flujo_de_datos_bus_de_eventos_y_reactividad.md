# FLUJO DE DATOS, BUS DE EVENTOS Y REACTIVIDAD

## 1. FLUJO UNIDIRECCIONAL DE DATOS
```
[Interfaz de Usuario / HUD]
        |
        v (Disparo de acción con payload)
[dispatch(ACTION)]
        |
        v
[gameReducer (src/core.jsx)]
        |
        +---> [Sub-reductores especializados]
        |
        v
[Nuevo Estado Inmutable (Next GameState)]
        |
        +---> [Re-renderizado selectivo en React]
        +---> [Auto-Guardado periódico mediante IPC hacia %APPDATA%]
```

## 2. SISTEMA DE RETROALIMENTACIÓN DE AUDIO Y SFX
- El bus global expone `window.playSfx(sfxKey)` para emitir sonidos táctiles al interactuar con botones, confirmar construcciones, recibir alarmas de invasión o disparar láseres de combate.
- Se apoya en la Web Audio API y audio estático local (`Musica-menu.ogg`) con aislamiento total frente a caídas.
