# MATEMÁTICAS, FÓRMULAS Y ALGORITMOS CLAVE

## 1. FÓRMULAS DE PRODUCCIÓN DE RECURSOS
Ubicadas en `src/utils/formulas/productionFormulas.js`:
- **Producción Horaria de Metal:**
  $$P_{metal} = 30 	imes L 	imes (1.1)^L 	imes F_{energia} 	imes V_{juego}$$
- **Producción Horaria de Cristal:**
  $$P_{cristal} = 20 	imes L 	imes (1.1)^L 	imes F_{energia} 	imes V_{juego}$$
- **Producción Horaria de Deuterio:**
  $$P_{deuterio} = 10 	imes L 	imes (1.1)^L 	imes (1.36 - 0.004 	imes T_{max}) 	imes F_{energia} 	imes V_{juego}$$
- **Factor de Eficiencia Energética:**
  $$F_{energia} = minleft(1.0, rac{E_{producida}}{E_{consumida}}ight)$$

## 2. FÓRMULAS DE COSTES Y TIEMPOS DE CONSTRUCCIÓN
Ubicadas en `src/utils/formulas/costFormulas.js`:
- **Coste de Edificios/Investigación al Nivel $N$:**
  $$Coste(N) = CosteBase 	imes (FactorExponencial)^{N - 1}$$
- **Tiempo de Construcción:**
  $$Tiempo (segundos) = rac{(CosteMetal + CosteCristal)}{2500 	imes (1 + NivelFabricaRobots) 	imes V_{juego}}$$

## 3. FÓRMULAS DE VUELO Y DISTANCIA GALÁCTICA
Ubicadas en `src/utils/formulas/flightFormulas.js`:
- **Mismo Sistema Solar:** $Distancia = 1000 + 5 	imes |P_1 - P_2|$
- **Misma Galaxia, Distinto Sistema:** $Distancia = 2700 + 95 	imes |S_1 - S_2|$
- **Distinta Galaxia:** $Distancia = 20000 	imes |G_1 - G_2|$
- **Tiempo de Vuelo:**
  $$T = 10 + rac{3500}{VelocidadPorcentaje} 	imes sqrt{rac{Distancia 	imes 10}{VelocidadNaveMasLenta}}$$

## 4. ALGORITMO DE SIMULACIÓN DE COMBATE (`src/combat.js`)
- Simulación estocástica por turnos de hasta 6 rondas.
- Ponderación de tecnología militar: Armas (+10% daño por nivel), Escudos (+10% absorción por nivel), Blindaje (+10% integridad de casco por nivel).
- Mecánica de Fuego Rápido (Rapid Fire) entre clases de naves específicas.
- Cálculo de campo de escombros orbital: 30% del metal y cristal invertido en naves destruidas.

## 5. SISTEMA DE ESCORIA Y ECONOMÍA CIRCULAR
Ubicado en `src/utils/formulas/productionFormulas.js`:
- **Generación Bruta de Escoria:** Generada proporcionalmente por refinerías y complejos industriales pesados según su consumo de materias primas y factor de degradación de maquinaria.
- **Capacidad de Reciclaje Activo:** Calculada a partir de plantas de tratamiento y tecnologías de reciclaje ministerial.
- **Escoria Neta Acumulada:**
  $$Escoria_{neta} = \max(0, Escoria_{bruta} - CapacidadReciclaje)$$
- **Revalorización de Residuos:** El material reciclado se devuelve al ciclo productivo activo con un rendimiento constante:
  - 70% reintegrado como Metal refinado.
  - 25% reintegrado como Cristal purificado.
- **Penalización por Saturación:** Si los depósitos de escoria superan el límite de tolerancia ecológica del planeta, la producción minera sufre un decremento porcentual por degradación ambiental.

