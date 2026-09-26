# INTEGRACIONES CON TERCEROS Y SDKS

## 1. POLÍTICA SAGRADA DE CERO DEPENDENCIAS EXTERNAS EN RUNTIME
El ejecutable final de **Ascensión** está estrictamente diseñado para no realizar llamadas a servidores externos:
- **Sin SDKs de Telemetría:** No se incluyen analytics invasivos ni trackers de terceros.
- **Sin Cloud Saves:** No depende de Firebase, Supabase ni servidores HTTP para partidas.
- **Soberanía y Privacidad:** El jugador disfruta de una experiencia 100% offline y privada.

## 2. ECOSISTEMA DE SOPORTE Y DISTRIBUCIÓN EXTERNO (FUERA DEL JUEGO)
- La carpeta `landing/` y las herramientas de Firebase (`firebase-download/`) pertenecen al portal web de descarga y distribución pública, estando completamente separadas del runtime del videojuego de escritorio.
