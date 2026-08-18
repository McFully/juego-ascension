# 🧠 BLOQUE 3: LÓGICA DE NEGOCIO, MOTORES Y ESTADO

## 03.01 BUCLE PRINCIPAL Y CORE LOOP (`src/core.jsx`)

### Bucle de Ticks (`TICK_MS`)
El juego utiliza un bucle de tiempo discreto impulsado por `setInterval` en `App.jsx` que ejecuta una acción de tick periódica:

- **Frecuencia por defecto (`TICK_MS`):** 1000 ms (1 segundo por tick).
- **Velocidad del Juego (`GAME_SPEED`):** Multiplicador configurable que acelera la producción y los tiempos de vuelo/construcción.

### Procesamiento por Tick:
En cada tick del juego, el reductor `gameReducer` procesa:
1. **Producción de Recursos:** Actualización inmutable de Metal, Cristal y Deuterio de cada planeta en función de los edificios de minería y la energía disponible.
2. **Colas de Construcción e Investigación:** Avance del tiempo restante en las colas activas. Al finalizar una construcción o investigación, incrementa automáticamente el nivel del elemento y aplica los efectos globales inmediatos.
3. **Colas de Astillero y Defensa:** Producción progresiva de unidades por lotes.
4. **Vuelo y Movimiento de Flotas:** Cálculo de la posición orbital o estelar de cada flota activa. Al llegar a su destino, se desencadena automáticamente la misión asignada (Ataque, Espionaje, Transportar, Colonizar, Recolectar o Desplegar).
5. **Cálculo de Consumo de Energía:** Evaluación del balance entre centrales de energía (solar, fusión, satélites) y el consumo de minas y construcciones industrias.

---

## 03.02 MATEMÁTICAS, FÓRMULAS Y BALANCING DEL JUEGO

### 1. Fórmulas de Producción de Recursos
La producción por hora se calcula mediante la función `calcProduction(planet, techLevels)`:

- **Mina de Metal:**  
  $$\text{Prod}_{\text{Metal}} = 30 \times \text{Nivel} \times 1.1^{\text{Nivel}} \times \text{FactorEnergia} \times \text{VelocidadJuego}$$

- **Mina de Cristal:**  
  $$\text{Prod}_{\text{Cristal}} = 20 \times \text{Nivel} \times 1.1^{\text{Nivel}} \times \text{FactorEnergia} \times \text{VelocidadJuego}$$

- **Sintetizador de Deuterio:**  
  $$\text{Prod}_{\text{Deuterio}} = 10 \times \text{Nivel} \times 1.1^{\text{Nivel}} \times (1.36 - 0.004 \times \text{TempMax}) \times \text{FactorEnergia} \times \text{VelocidadJuego}$$

- **Factor de Energía:**  
  $$\text{FactorEnergia} = \min\left(1.0, \frac{\text{EnergiaProducida}}{\text{EnergiaConsumida}}\right)$$

---

### 2. Fórmulas de Costes de Edificios e Investigaciones
El coste para subir un edificio o investigación al nivel $N$ sigue una progresión exponencial:

$$\text{Coste}(N) = \text{CosteBase} \times (\text{FactorExponencial})^{N-1}$$

*Ejemplo: El factor exponencial estándar de las minas es $1.5$.*

---

### 3. Fórmulas de Tiempo de Vuelo de Flotas
El tiempo de vuelo en segundos entre dos coordenadas galácticas $(G_1, S_1, P_1)$ y $(G_2, S_2, P_2)$ se determina mediante `calcFlightTime`:

- **Distancia Dentro del Mismo Sistema:**  
  $$\text{Distancia} = 1000 + 5 \times |P_1 - P_2|$$

- **Distancia Entre Sistemas del Mismo Sector:**  
  $$\text{Distancia} = 2700 + 95 \times |S_1 - S_2|$$

- **Distancia Entre Galaxias Distintas:**  
  $$\text{Distancia} = 20000 \times |G_1 - G_2|$$

- **Tiempo de Vuelo ($T$ en segundos):**  
  $$T = 10 + \frac{3500}{\text{PorcentajeVelocidad}} \times \sqrt{\frac{\text{Distancia} \times 10}{\text{VelocidadFlota}}}$$

---

## 03.03 MOTOR DE SIMULACIÓN DE COMBATE (`src/combat.js`)

El combate espacial en **Ascensión** se procesa en una simulación de hasta **6 rondas atómicas**:

1. **Iniciación:** Se recopilan la flota atacante y las defensas/flotas defensoras del planeta destino.
2. **Cálculo de Tecnologías Tácticas:** Se aplican los niveles de Tecnología de Armas, Escudos y Blindaje a los atributos base de cada nave y estructura.
3. **Simulación de Rondas (1 a 6):**
   - Cada grupo de naves/defensas dispara contra objetivos enemigos elegidos de forma estocástica ponderada por la amenaza.
   - **Absorción por Escudo:** El daño entrante impacta primero sobre los escudos de la nave objetivo. Si el impacto de un solo disparo es inferior al 1% del escudo, el escudo rebota el disparo sin sufrir daños.
   - **Integridad del Casco:** Una vez agotado el escudo, el daño resta puntos de estructura.
   - **Fuego Rápido (Rapid Fire):** Ciertas naves (ej. Destructores contra Cazas) poseen multiplicadores de disparos adicionales por ronda contra tipos específicos de unidades.
4. **Resultado del Combate:**
   - **Victoria Atacante / Defensora / Empate.**
   - Generación de **Escombros** en la órbita (30% del metal y cristal destruido en naves).
   - Cálculo del botín saqueado (capacidad de carga de los cargueros atacantes supervivientes).
   - Generación de informes de batalla detallados compatibles con el reproductor de repeticiones (`ReplayPage`).
