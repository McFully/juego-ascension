# SISTEMA MAESTRO DE ORQUESTACIÓN: RECONSTRUCCIÓN AUTÓNOMA 1:1

> **Proyecto:** Juego Ascensión  
> **Categoría:** Juegos  
> **Tipo de Software:** VIDEOJUEGO DE ESTRATEGIA ESPACIAL (4X SCI-FI)  
> **Versión Registrada:** 1.1.101  
> **Runtime:** 100% Local y Offline (Electron, React 18, Vite, SQLite v4 con better-sqlite3)

---

## 🎯 PROPÓSITO DEL ORQUESTADOR
Este documento constituye el Meta-Prompt maestro ejecutable para la reconstrucción completa, autónoma y de fidelidad absoluta del proyecto **Juego Ascensión** (v1.1.101). Cualquier desarrollador senior o agente inteligente puede ejecutar este plan fase por fase para replicar el 100% de la arquitectura, componentes, lógica de negocio, estilos, fórmulas y persistencia sin haber visto el código fuente original.

---

## ⚡ DISPARO RÁPIDO DE RECONSTRUCCIÓN EN UN CLIC
Para iniciar la reconstrucción integral sin pérdida de contexto ni truncamiento de tokens, ejecuta la siguiente directiva:

```text
Actúa como un Ingeniero Principal de Software y reconstruye secuencialmente el proyecto Juego Ascensión (v1.1.101) siguiendo de forma estricta las especificaciones atómicas de la carpeta /docs/. Ejecuta las fases del Bloque 08 paso a paso, validando cada módulo con tests antes de continuar.
```

---

## 🗺️ MATRIZ DE EJECUCIÓN SECUENCIAL POR FASES

| Fase | Documento de Referencia | Objetivo Principal | Estado |
| :--- | :--- | :--- | :--- |
| **Fase 1** | `/docs/08_guia_reconstruccion/08_01_paso_01_setup_inicial_y_herramientas.md` | Entorno, dependencias base, scripts y tooling | Validado |
| **Fase 2** | `/docs/08_guia_reconstruccion/08_02_paso_02_construccion_de_tipos_y_modelos.md` | Modelos de datos, contratos e interfaces del dominio | Validado |
| **Fase 3** | `/docs/08_guia_reconstruccion/08_03_paso_03_servicios_de_base_de_datos_y_apis.md` | Persistencia SQLite local v4 (`universe.db`) y canales IPC | Validado |
| **Fase 4** | `/docs/08_guia_reconstruccion/08_04_paso_04_motores_de_logica_y_estado.md` | Reductores, Tick Loop (1000ms), gobernanza e IA | Validado |
| **Fase 5** | `/docs/08_guia_reconstruccion/08_05_paso_05_sistema_de_diseno_y_ui_atomi.md` | Design System, tokens visuales, 136 componentes y 16 modales | Validado |
| **Fase 6** | `/docs/08_guia_reconstruccion/08_06_paso_06_ensamblaje_de_pantallas_y_rutas.md` | Ensamblaje de 21 pantallas completas y navegación | Validado |
| **Fase 7** | `/docs/08_guia_reconstruccion/08_07_paso_07_integracion_final_y_validacion.md` | Suite de 364 tests Vitest, empaquetado NSIS y despliegue | Validado |

---

## 📂 REGISTRO MAESTRO DE INVENTARIO ATÓMICO
- **Pantallas documentadas:** 21 vistas en `/docs/04_interfaz_ui_ux/pantallas/`
- **Componentes modulares documentados:** 136 componentes en `/docs/04_interfaz_ui_ux/componentes/`
- **Modales documentados:** 16 modales interactivos en `/docs/04_interfaz_ui_ux/modales/`
- **Especificaciones de Persistencia:** SQLite unificado v4 con WAL checkpoint en `/docs/05_datos_y_apis/`
- **Especificaciones de Simulación:** Fórmulas de economía, combates y escoria en `/docs/03_logica_y_estado/`
