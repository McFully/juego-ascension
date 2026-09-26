import asyncio, os, edge_tts

MALE_VOICES = [
    'es-ES-AlvaroNeural', 'es-CL-LorenzoNeural', 'es-CO-GonzaloNeural', 'es-MX-JorgeNeural',
    'es-AR-TomasNeural', 'es-PE-AlexNeural', 'es-UY-MateoNeural', 'es-VE-SebastianNeural',
    'es-BO-MarceloNeural', 'es-CR-JuanNeural', 'es-CU-ManuelNeural', 'es-DO-EmilioNeural',
    'es-EC-LuisNeural', 'es-SV-RodrigoNeural', 'es-GQ-JavierNeural', 'es-GT-AndresNeural',
    'es-HN-CarlosNeural', 'es-NI-FedericoNeural', 'es-PA-RobertoNeural', 'es-PY-MarioNeural',
    'es-PR-VictorNeural', 'es-US-AlonsoNeural'
]

FEMALE_VOICES = [
    'es-ES-ElviraNeural', 'es-ES-XimenaNeural', 'es-MX-DaliaNeural', 'es-UY-ValentinaNeural',
    'es-AR-ElenaNeural', 'es-CO-SalomeNeural', 'es-CL-CatalinaNeural', 'es-PE-CamilaNeural',
    'es-VE-PaolaNeural', 'es-BO-SofiaNeural', 'es-CR-MariaNeural', 'es-CU-BelkysNeural',
    'es-DO-RamonaNeural', 'es-EC-AndreaNeural', 'es-SV-LorenaNeural', 'es-GQ-TeresaNeural',
    'es-GT-MartaNeural', 'es-HN-KarlaNeural', 'es-NI-YolandaNeural', 'es-PA-MargaritaNeural',
    'es-PY-TaniaNeural', 'es-PR-KarinaNeural', 'es-US-PalomaNeural'
]

CANDIDATES = [
    {'id': 'cand_economy_0', 'g': 'M', 'name': 'Aritz Elkar', 'text': 'Saludos, comandante. El capital y la mineria pesada son los cimientos de nuestro imperio.'},
    {'id': 'cand_economy_1', 'g': 'F', 'name': 'Valeria Rossi', 'text': 'Directora Rossi a su servicio. Multiplicaremos los creditos y la liquidez de cada colonia.'},
    {'id': 'cand_economy_2', 'g': 'M', 'name': 'Goran Vance', 'text': 'Goran Vance listo. Cada arancel y cada gramo de cristal trabajaran para nuestra causa.'},
    {'id': 'cand_economy_3', 'g': 'F', 'name': 'Lyanna Chen', 'text': 'Auditora Chen preparada. Garantizare la maxima eficiencia presupuestaria en cada obra colonial.'},

    {'id': 'cand_defense_0', 'g': 'M', 'name': 'General Marcus Cole', 'text': 'General Cole al mando. Ninguna incursion enemiga quebrara nuestras defensas planetarias.'},
    {'id': 'cand_defense_1', 'g': 'M', 'name': 'Almirante Roger Vance', 'text': 'Almirante Vance reportandose. Optimizaremos el astillero y blindaremos cada sector.'},
    {'id': 'cand_defense_2', 'g': 'F', 'name': 'Capitana Vespera', 'text': 'Capitana Vespera en linea. Los escudos orbitales resistiran cualquier bombardeo orbital.'},
    {'id': 'cand_defense_3', 'g': 'M', 'name': 'Coronel Rexford', 'text': 'Coronel Rexford presente. Nuestras baterias de superficie pulverizaran a los invasores.'},

    {'id': 'cand_war_0', 'g': 'M', 'name': 'Gran Mariscal Voronin', 'text': 'Gran Mariscal Voronin preparado. Conducire nuestras armadas a la victoria absoluta.'},
    {'id': 'cand_war_1', 'g': 'F', 'name': 'Capitana Sonya Cross', 'text': 'Capitana Cross lista para la ofensiva. Mis escuadrones de cazas dominaran el vacio.'},
    {'id': 'cand_war_2', 'g': 'M', 'name': 'Almirante Thaddeus Vance', 'text': 'Almirante Vance listo. Romperemos las lineas enemigas con fuego de plasma concentrado.'},
    {'id': 'cand_war_3', 'g': 'F', 'name': 'Comandante Lyra Kane', 'text': 'Comandante Kane a su orden. Evasion tactica y ataques coordinados de alta precision.'},

    {'id': 'cand_science_0', 'g': 'F', 'name': 'Doctora Valerie Vance', 'text': 'Doctora Vance reportandose. Los misterios cuanticos aceleraran el progreso de la Republica.'},
    {'id': 'cand_science_1', 'g': 'M', 'name': 'Profesor Kaelen Zenith', 'text': 'Profesor Zenith en linea. La computacion de fusion desatara una nueva era tecnologica.'},
    {'id': 'cand_science_2', 'g': 'F', 'name': 'Doctora Selene Ward', 'text': 'Doctora Ward preparada. Doblegaremos el hiperespacio con nuevos motores de curvatura.'},
    {'id': 'cand_science_3', 'g': 'M', 'name': 'Doctor Bruce Thorne', 'text': 'Doctor Thorne a su disposicion. Los aceleradores masivos revelaran nuevas fuentes energeticas.'},

    {'id': 'cand_energy_0', 'g': 'F', 'name': 'Doctora Solaria Vance', 'text': 'Doctora Solaria Vance lista. Canalizaremos la radiacion estelar para abastecer cada colonia.'},
    {'id': 'cand_energy_1', 'g': 'M', 'name': 'Ingeniero Tarek Helios', 'text': 'Ingeniero Helios reportandose. La contencion magnetica llevara nuestros reactores al limite.'},
    {'id': 'cand_energy_2', 'g': 'F', 'name': 'Directora Rayna', 'text': 'Directora Rayna en sintonia. La red superconductora transferira energia sin una sola perdida.'},
    {'id': 'cand_energy_3', 'g': 'M', 'name': 'Ingeniero Darian Cole', 'text': 'Ingeniero Cole preparado. La constelacion solar orbital multiplicara la potencia de la flota.'},

    {'id': 'cand_resources_0', 'g': 'M', 'name': 'Capataz Darek Vorn', 'text': 'Capataz Vorn listo para picar. Extraeremos hasta el ultimo gramo de metal del nucleo rocoso.'},
    {'id': 'cand_resources_1', 'g': 'F', 'name': 'Ingeniera Mara Shen', 'text': 'Ingeniera Shen a su servicio. Condensaremos deuterio puro de las tormentas de gigantes helados.'},
    {'id': 'cand_resources_2', 'g': 'M', 'name': 'Doctor Vane Korba', 'text': 'Doctor Korba preparado. Los yacimientos cristalinos de alta pureza estan asegurados.'},
    {'id': 'cand_resources_3', 'g': 'M', 'name': 'Comandante Radek', 'text': 'Comandante Radek al habla. Automatizaremos las minas profundas con maxima eficiencia y orden.'},

    {'id': 'cand_industry_0', 'g': 'M', 'name': 'Director Frank Vance', 'text': 'Director Vance listo. Nuestras fundiciones orbitales trabajaran sin descanso dia y noche.'},
    {'id': 'cand_industry_1', 'g': 'F', 'name': 'Maestra Kira Vane', 'text': 'Maestra Vane a su orden. Desarrollaremos aleaciones moleculares de dureza insuperable.'},
    {'id': 'cand_industry_2', 'g': 'M', 'name': 'Ingeniero Jaxen Cruz', 'text': 'Ingeniero Cruz preparado. Los hornos de vacio forjaran las estructuras mas resistentes.'},
    {'id': 'cand_industry_3', 'g': 'F', 'name': 'Supervisora Tova', 'text': 'Supervisora Tova en linea. El ensamblaje con nanitas reducira los tiempos de fabricacion.'},

    {'id': 'cand_infra_0', 'g': 'F', 'name': 'Elena Rostova', 'text': 'Arquitecta Rostova a su servicio. Levantaremos megaciudades y puertos estelares imponentes.'},
    {'id': 'cand_infra_1', 'g': 'M', 'name': 'Logistico Kaelen', 'text': 'Logistico Kaelen reportandose. Rutas seguras y bodegas repletas para sostener el imperio.'},
    {'id': 'cand_infra_2', 'g': 'M', 'name': 'Ingeniero Bram Nolan', 'text': 'Ingeniero Nolan listo. Nuestras nanitas de construccion repararan cualquier dano estructural.'},
    {'id': 'cand_infra_3', 'g': 'F', 'name': 'Doctora Astrid Lind', 'text': 'Doctora Lind lista. Trazaremos colonias sostenibles y autosuficientes en cada mundo.'},

    {'id': 'cand_innovation_0', 'g': 'F', 'name': 'Doctora Nova Lin', 'text': 'Doctora Nova Lin en linea. La nanotecnologia de vanguardia revolucionara nuestra industria.'},
    {'id': 'cand_innovation_1', 'g': 'M', 'name': 'Ingeniero Zephyr Cole', 'text': 'Ingeniero Zephyr preparado. Fuselajes experimentales listos para desafiar el espacio profundo.'},
    {'id': 'cand_innovation_2', 'g': 'M', 'name': 'Profesor Orion Vane', 'text': 'Profesor Vane al habla. Los nuevos procesadores de grafeno aceleraran nuestros calculos.'},
    {'id': 'cand_innovation_3', 'g': 'F', 'name': 'Doctora Mirabel Shen', 'text': 'Doctora Shen reportandose. Titanio molecular comprimido para blindar naves con peso minimo.'},

    {'id': 'cand_cybernetics_0', 'g': 'M', 'name': 'Nodo Epsilon-7', 'text': 'Nodo Epsilon activo. Subrutinas sincronizadas para calculo optimo y automatizacion plena.'},
    {'id': 'cand_cybernetics_1', 'g': 'M', 'name': 'Profesor Gideon Ray', 'text': 'Profesor Ray a su disposicion. La integracion neurocibernetica aumentara el rendimiento colonial.'},
    {'id': 'cand_cybernetics_2', 'g': 'F', 'name': 'Sub-unidad Alfa-09', 'text': 'Subunidad Alfa inicializada. Procesamiento masivo de datos listo para ejecutar sus ordenes.'},
    {'id': 'cand_cybernetics_3', 'g': 'F', 'name': 'Doctora Veronica Voss', 'text': 'Doctora Voss en linea. La matriz sinaptica central garantizara decisiones impecables.'},

    {'id': 'cand_intel_0', 'g': 'F', 'name': 'Serafina Umbra', 'text': 'Serafina a su servicio. Ningun secreto enemigo escapara a nuestra red de sombras.'},
    {'id': 'cand_intel_1', 'g': 'M', 'name': 'Sombra Cero Uno', 'text': 'Operativo Sombra activo. Canales subespaciales descifrados y transmisiones interceptadas.'},
    {'id': 'cand_intel_2', 'g': 'M', 'name': 'Criptografo Vance', 'text': 'Criptografo Vance listo. Cualquier amenaza hostil sera detectada mucho antes de su llegada.'},
    {'id': 'cand_intel_3', 'g': 'F', 'name': 'Agente Jax', 'text': 'Agente Jax reportandose. Reconocimiento encubierto completado en las fronteras oscuras.'},

    {'id': 'cand_justice_0', 'g': 'M', 'name': 'Juez Cayo Tiberio', 'text': 'Magistrado Tiberio al tribunal. La ley imperial y la Carta Magna prevaleceran con firmeza.'},
    {'id': 'cand_justice_1', 'g': 'F', 'name': 'Prefecta Livia', 'text': 'Prefecta Livia en posicion. Mantendremos el orden civil y la tranquilidad en cada ciudad.'},
    {'id': 'cand_justice_2', 'g': 'F', 'name': 'Magistrada Corina', 'text': 'Magistrada Corina lista. Ni un solo credito extraviado, tolerancia cero con la corrupcion.'},
    {'id': 'cand_justice_3', 'g': 'M', 'name': 'Juez Veridian', 'text': 'Juez Veridian presente. Mediacion justa y expedita para resolver cualquier conflicto comercial.'},

    {'id': 'cand_transport_0', 'g': 'M', 'name': 'Capitan Thorne', 'text': 'Capitan Thorne a los mandos. Enlazaremos cada mundo con catapultas y tuneles de vacio ultrarrapidos.'},
    {'id': 'cand_transport_1', 'g': 'M', 'name': 'Superintendente Nova', 'text': 'Superintendente Nova reportandose. Los muelles estelares operaran al doscientos por ciento.'},
    {'id': 'cand_transport_2', 'g': 'F', 'name': 'Comodora Declan', 'text': 'Comodora Declan en linea. El transito hiperloop interurbano funcionara con puntualidad estricta.'},
    {'id': 'cand_transport_3', 'g': 'F', 'name': 'Piloto Mayor Sula', 'text': 'Piloto Sula lista. Guiare a nuestros convoyes por las corrientes mas rapidas y seguras.'},

    {'id': 'cand_logistics_0', 'g': 'M', 'name': 'Comodoro Jaxen', 'text': 'Comodoro Jaxen preparado. Los silos imperiales estaran colmados para cualquier contingencia.'},
    {'id': 'cand_logistics_1', 'g': 'F', 'name': 'Navegante Sybil', 'text': 'Navegante Sybil a la escucha. Rutas logisticas coordinadas para abastecer el frente de batalla.'},
    {'id': 'cand_logistics_2', 'g': 'M', 'name': 'Intendente Balor', 'text': 'Intendente Balor listo. Cada flete sera auditado y distribuido sin un solo extravio.'},
    {'id': 'cand_logistics_3', 'g': 'F', 'name': 'Doctora Nadia Cruz', 'text': 'Doctora Cruz reportandose. Contenedores criogenicos listos para almacenar deuterio pesado.'},

    {'id': 'cand_biosphere_0', 'g': 'M', 'name': 'Doctor Orion Silva', 'text': 'Doctor Silva a su disposicion. Convertiremos mundos esteriles en praderas rebosantes de vida.'},
    {'id': 'cand_biosphere_1', 'g': 'F', 'name': 'Biologa Lyanna', 'text': 'Biologa Lyanna lista. Adaptaremos el genoma colonial para resistir cualquier clima extremo.'},
    {'id': 'cand_biosphere_2', 'g': 'M', 'name': 'Profesor Kieran Vane', 'text': 'Profesor Vane preparado. Nuestros biofiltros purificaran atmosferas toxicas en tiempo record.'},
    {'id': 'cand_biosphere_3', 'g': 'F', 'name': 'Doctora Mara Sol', 'text': 'Doctora Sol en linea. Climatizacion y equilibrio termico garantizados en cada asentamiento.'},

    {'id': 'cand_agriculture_0', 'g': 'F', 'name': 'Doctora Ceres Vane', 'text': 'Doctora Ceres Vance lista. Los anillos agricolas alimentaran a billones de ciudadanos.'},
    {'id': 'cand_agriculture_1', 'g': 'M', 'name': 'Botanico Ren', 'text': 'Botanico Ren reportandose. Cultivos hidroponicos optimizados para cosechas de rendimiento record.'},
    {'id': 'cand_agriculture_2', 'g': 'F', 'name': 'Superintendente Maya', 'text': 'Superintendente Maya a su orden. Las cupulas verticales produciran sustento de calidad superior.'},
    {'id': 'cand_agriculture_3', 'g': 'M', 'name': 'Doctor Aaron Cole', 'text': 'Doctor Cole preparado. Bioquimica celular aplicada para erradicar cualquier plaga de cultivo.'},

    {'id': 'cand_civics_0', 'g': 'F', 'name': 'Tribuna Aurelia', 'text': 'Tribuna Aurelia al habla. Defendere con pasion la unidad y el bienestar de los ciudadanos.'},
    {'id': 'cand_civics_1', 'g': 'M', 'name': 'Director Theron', 'text': 'Director Theron listo. Planificacion urbana y servicios publicos de excelencia para nuestro pueblo.'},
    {'id': 'cand_civics_2', 'g': 'F', 'name': 'Prefecta Valia', 'text': 'Prefecta Valia a su servicio. Mediacion constante para una convivencia colonial armonica.'},
    {'id': 'cand_civics_3', 'g': 'F', 'name': 'Magistrada Silas', 'text': 'Magistrada Silas en posicion. Consolidaremos los derechos y libertades de cada colono.'},

    {'id': 'cand_diplomacy_0', 'g': 'M', 'name': 'Embajador Vane Corvus', 'text': 'Embajador Corvus a su servicio. Forjaremos alianzas comerciales que engrandezcan nuestra posicion.'},
    {'id': 'cand_diplomacy_1', 'g': 'F', 'name': 'Consul Elia Thorne', 'text': 'Consul Thorne reportandose. La diplomacia firme y el respeto mutuo aseguraran la paz galactica.'},
    {'id': 'cand_diplomacy_2', 'g': 'M', 'name': 'Enviado Kaelen', 'text': 'Enviado Kaelen listo. Pacifismo estrategico y acuerdos de no agresion en nuestras fronteras.'},
    {'id': 'cand_diplomacy_3', 'g': 'F', 'name': 'Legada Selene', 'text': 'Legada Selene en el conclave. La voz de la Republica sera escuchada con admiracion y respeto.'},

    {'id': 'cand_culture_0', 'g': 'F', 'name': 'Lady Lyra Solar', 'text': 'Lady Lyra a su servicio. La luz del arte y la diplomacia iluminara los confines del imperio.'},
    {'id': 'cand_culture_1', 'g': 'M', 'name': 'Director Varis', 'text': 'Director Varis preparado. Crearemos obras memorables que unan a todos los mundos bajo una sola voz.'},
    {'id': 'cand_culture_2', 'g': 'F', 'name': 'Curadora Astrid', 'text': 'Curadora Astrid en linea. Protegeremos el legado y las reliquias de nuestra gran civilizacion.'},
    {'id': 'cand_culture_3', 'g': 'M', 'name': 'Maestro Kael', 'text': 'Maestro Kael a su orden. La filosofia y la templanza guiaran el espiritu de nuestra juventud.'}
]

out_dir = os.path.join('public', 'audio', 'voices')
os.makedirs(out_dir, exist_ok=True)

async def main():
    m_i, f_i = 0, 0
    total = len(CANDIDATES)
    done = 0
    for c in CANDIDATES:
        if c['g'] == 'M':
            voice = MALE_VOICES[m_i % len(MALE_VOICES)]
            m_i += 1
        else:
            voice = FEMALE_VOICES[f_i % len(FEMALE_VOICES)]
            f_i += 1
        
        fname = c['id'] + '.mp3'
        path = os.path.join(out_dir, fname)
        if not (os.path.exists(path) and os.path.getsize(path) > 1000):
            comm = edge_tts.Communicate(c['text'], voice)
            await comm.save(path)
        done += 1
        if done % 10 == 0 or done == total:
            print(f'Progreso: {done}/{total}')

asyncio.run(main())
print('Voces sintetizadas con exito.')
