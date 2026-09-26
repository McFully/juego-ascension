# BUCLE PRINCIPAL Y CORE LOOP

## 1. MECANISMO TEMPORAL DEL BUCLE (`useGameLoop`)
El corazón del juego opera bajo un ciclo de ticks periódicos coordinados mediante el hook `useGameLoop.js`:
- **Intervalo Base (`TICK_MS`):** 1000 milisegundos (1 segundo real).
- **Multiplicador de Velocidad (`GAME_SPEED`):** Configurable por el usuario para acelerar la simulación o pausar la partida.
- **Acción Emitida:** En cada intervalo se despacha `dispatch({ type: 'TICK', payload: { delta: 1 } })`.

## 2. SECUENCIA CRONOLÓGICA DEL ORQUESTADOR DE TICKS (`tickOrchestrator.js`)
En cada tick del bucle, el orquestador ejecuta los siguientes submódulos en secuencia inmutable:
1. **`resourceTick.js`:** Calcula la generación y consumo horario de Metal, Cristal y Deuterio en función de los edificios de minería, temperatura planetaria y el ratio de energía disponible.
2. **`queueTick.js`:** Decrementa los contadores de tiempo de las colas de construcción de edificios, investigaciones de laboratorio, astillero militar y torretas defensivas.
3. **`populationTick.js`:** Modela el crecimiento demográfico, la felicidad civil, la demanda de alimentos e infraestructuras habitacionales.
4. **`livingPlanetTick.js`:** Actualiza eventos geológicos, biósfera y estabilidad del ecosistema planetario.
5. **`aiEmpireTick.js` & `federationTick.js`:** Simula la toma de decisiones estratégicas de las facciones controladas por IA y las resoluciones del Consejo Galáctico.
6. **`missionsAndRandomEvents.js` & `dialogueTransmissionTick.js`:** Procesa transmisiones entrantes, eventos diplomáticos y encuentros de primer contacto.
7. **`fleetTick`:** Desplaza las flotas en tránsito por la galaxia y activa el combate o la misión de aterrizaje al alcanzar el tiempo cero.
