import asyncio
import os
import edge_tts

VOICE_CONFIG = {
    # Diplomacia / Facciones alienigenas y humanas
    "diplo_human_greeting": {
        "voice": "es-ES-AlvaroNeural",
        "text": "Canal seguro establecido. Aqui el mando de la Republica Nova. Proceda con su propuesta.",
        "file": "diplo_human_greeting.mp3"
    },
    "diplo_human_hostile": {
        "voice": "es-ES-AlvaroNeural",
        "text": "Transmision de emergencia. Sus incursiones fronterizas han alertado a nuestro senado. Habla rapido.",
        "file": "diplo_human_hostile.mp3"
    },
    "diplo_cyborg_greeting": {
        "voice": "es-ES-XimenaNeural",
        "text": "Protocolo de enlace activo. Dominion Xelar reporta compatibilidad estructural. Evaluando vector tactico.",
        "file": "diplo_cyborg_greeting.mp3"
    },
    "diplo_cyborg_hostile": {
        "voice": "es-ES-XimenaNeural",
        "text": "Error en transmision. Tu firma biologica representa ineficiencia critica. Iniciando protocolo de asimilacion.",
        "file": "diplo_cyborg_hostile.mp3"
    },
    "diplo_synth_greeting": {
        "voice": "es-CR-MariaNeural",
        "text": "Conciencia Directriz Zenith en linea. Procesando intercambio de paquetes de datos y acuerdos comerciales.",
        "file": "diplo_synth_greeting.mp3"
    },
    "diplo_draconian_greeting": {
        "voice": "es-CL-LorenzoNeural",
        "text": "Habla el Senor de la Guerra Ghornak. Si vienes a arrodillarte ante el Imperio Draconiano, dilo ya.",
        "file": "diplo_draconian_greeting.mp3"
    },
    "diplo_helios_greeting": {
        "voice": "es-CO-GonzaloNeural",
        "text": "Saludos desde el trono de la Confederacion Helios. Que la radiacion estelar ilumine nuestras conversaciones.",
        "file": "diplo_helios_greeting.mp3"
    },
    "diplo_solaris_greeting": {
        "voice": "es-ES-ElviraNeural",
        "text": "Soy la Primarca Solar Varis. El Imperio Solaris escucha tu audiencia con atencion.",
        "file": "diplo_solaris_greeting.mp3"
    },
    "diplo_vortex_greeting": {
        "voice": "es-MX-JorgeNeural",
        "text": "El Susurrador del Vacio te observa a traves de las fallas subespaciales. Que buscas en las sombras?",
        "file": "diplo_vortex_greeting.mp3"
    },
    "diplo_umbra_greeting": {
        "voice": "es-UY-ValentinaNeural",
        "text": "Protectorado Umbra confirma contacto. Nuestras sombras registran cada movimiento de tu flota.",
        "file": "diplo_umbra_greeting.mp3"
    },

    # Ministros del Gobierno
    "minister_economy_aritz": {
        "voice": "es-ES-AlvaroNeural",
        "text": "Reporte financiero listo, comandante. La extraccion mineral y el balance presupuestario estan bajo control.",
        "file": "minister_economy_aritz.mp3"
    },
    "minister_economy_valeria": {
        "voice": "es-ES-ElviraNeural",
        "text": "Directora Rossi al habla. Las reservas de creditos y los subsidios comerciales muestran un rendimiento optimo.",
        "file": "minister_economy_valeria.mp3"
    },
    "minister_defense_marcus": {
        "voice": "es-CL-LorenzoNeural",
        "text": "General Marcus Cole. Sistemas de defensa orbital en alerta maxima. Las flotas aguardan sus ordenes de combate.",
        "file": "minister_defense_marcus.mp3"
    },
    "minister_defense_roger": {
        "voice": "es-ES-AlvaroNeural",
        "text": "Almirante Roger Vance. Los astilleros navales han optimizado la cadena de montaje de blindajes y naves.",
        "file": "minister_defense_roger.mp3"
    },
    "minister_science_valerie": {
        "voice": "es-AR-ElenaNeural",
        "text": "Doctora Valerie Vance. Las matrices cuanticas y los laboratorios han alcanzado un nuevo umbral de eficiencia.",
        "file": "minister_science_valerie.mp3"
    },
    "minister_science_kaelen": {
        "voice": "es-CR-MariaNeural",
        "text": "Nucleo Sintetico Kaelen reportando. Algoritmos de fusion y nanotecnologia sincronizados con exito.",
        "file": "minister_science_kaelen.mp3"
    },
    "minister_culture_lyra": {
        "voice": "es-ES-XimenaNeural",
        "text": "Lady Lyra Solar a su servicio. La influencia de nuestro imperio se expande con fuerza en el senado galactico.",
        "file": "minister_culture_lyra.mp3"
    },
    "minister_culture_varis": {
        "voice": "es-CO-GonzaloNeural",
        "text": "Director Varis. La cohesion social y el patriotismo en las colonias alcanzan niveles historicos.",
        "file": "minister_culture_varis.mp3"
    },
    "minister_infra_elena": {
        "voice": "es-MX-DaliaNeural",
        "text": "Arquitecta Elena Rostova. Las super-autovias y complejos habitacionales avanzan segun el cronograma.",
        "file": "minister_infra_elena.mp3"
    },
    "minister_intel_serafina": {
        "voice": "es-UY-ValentinaNeural",
        "text": "Agente Serafina Umbra. Redes de contrainteligencia activas. No detectamos filtraciones enemigas.",
        "file": "minister_intel_serafina.mp3"
    },

    # Alertas y Notificaciones Tacticas
    "alert_fleet_combat": {
        "voice": "es-ES-AlvaroNeural",
        "text": "Alerta general! Sensores de largo alcance detectan enfrentamiento naval inminente.",
        "file": "alert_fleet_combat.mp3"
    },
    "alert_research_complete": {
        "voice": "es-AR-ElenaNeural",
        "text": "Investigacion completada con exito. Nuevos esquemas tecnologicos listos para produccion.",
        "file": "alert_research_complete.mp3"
    },
    "alert_construction_complete": {
        "voice": "es-MX-DaliaNeural",
        "text": "Construccion finalizada. La nueva infraestructura ya esta operativa en la colonia.",
        "file": "alert_construction_complete.mp3"
    },
    "alert_treaty_signed": {
        "voice": "es-ES-XimenaNeural",
        "text": "Tratado interestelar ratificado solemnemente ante el senado galactico.",
        "file": "alert_treaty_signed.mp3"
    }
}

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "public", "audio", "voices")

async def generate_all():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    print(f"Generando voces HD en: {OUTPUT_DIR}")
    for key, data in VOICE_CONFIG.items():
        out_path = os.path.join(OUTPUT_DIR, data["file"])
        if os.path.exists(out_path) and os.path.getsize(out_path) > 1000:
            print(f"[OK Cached] {data['file']}")
            continue
        print(f"[Sintetizando HD] {key} ({data['voice']})...")
        comm = edge_tts.Communicate(data["text"], data["voice"])
        await comm.save(out_path)
        print(f"[Listo] {data['file']} ({os.path.getsize(out_path)} bytes)")

if __name__ == "__main__":
    asyncio.run(generate_all())
