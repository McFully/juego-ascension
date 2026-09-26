export const getActionReply = (actionType, personality) => {
  const actionNames = {
    greet: "Saludo Formal", official_intro: "Presentación Oficial", 
    cultural_exchange: "Intercambio Cultural", scientific_exchange: "Intercambio Científico",
    trade_agreement: "Acuerdo Comercial", research_agreement: "Acuerdo de Investigación",
    transit_agreement: "Acuerdo de Tránsito", non_aggression: "Pacto de No Agresión", defense_agreement: "Pacto de Defensa",
    threat: "Amenaza Diplomática", ultimatum: "Ultimátum",
    embargo: "Embargo Comercial", sanctions: "Sanciones Económicas",
    protectorate: "Propuesta de Protectorado", vassalage: "Demanda de Vasallaje",
    break_relations: "Ruptura de Relaciones"
  };
  const playerMsg = `[Iniciando protocolo: ${actionNames[actionType] || actionType}]`;

  let reply = "Señal de sub-espacio transmitida. Esperando respuesta de la civilización...";

  if (actionType === "greet") {
    reply = personality === "bélico" ? "¿Saludos? Los débiles hablan mientras los fuertes conquistan. No nos hagas perder el tiempo." :
            personality === "mercantilista" ? "Saludos, viajero. Las rutas comerciales están abiertas. Que el flujo de créditos sea mutuo." :
            "Saludos en son de paz. Valoramos la armonía interestelar entre las especies.";
  } else if (actionType === "official_intro") {
    reply = "Presentación formal aceptada. Registrando coordenadas de soberanía en la base de datos galáctica.";
  } else if (actionType === "cultural_exchange") {
    reply = "Tus delegaciones culturales son bienvenidas. Compartamos nuestras visiones artísticas e históricas para enriquecer ambos mundos.";
  } else if (actionType === "scientific_exchange") {
    reply = "Intercambio de datos cuánticos y archivos de laboratorio completado con éxito. La ciencia progresa de forma acelerada.";
  } else if (actionType === "economic_exchange") {
    reply = "Transacciones comerciales y de materias primas procesadas. Excelente tasa de rentabilidad para ambos imperios.";
  } else if (actionType === "trade_agreement") {
    reply = "Acuerdo comercial firmado. Abriendo aduanas y liberando aranceles en todo nuestro espacio soberano.";
  } else if (actionType === "research_agreement") {
    reply = "Acuerdo de investigación conjunto firmado. La cooperación impulsará el conocimiento mutuo a nuevas cotas.";
  } else if (actionType === "transit_agreement") {
    reply = "Acuerdo de tránsito estelar ratificado. Tus naves tienen permiso oficial de tránsito por nuestras zonas restringidas.";
  } else if (actionType === "non_aggression") {
    reply = "Pacto de no agresión ratificado. Ninguna nave de nuestras flotas abrirá fuego contra tus posiciones fronterizas.";
  } else if (actionType === "defense_agreement") {
    reply = "Pacto de defensa mutua firmado. Cualquier agresión contra una de nuestras soberanías será respondida conjuntamente.";
  } else if (actionType === "guarantee_independence") {
    reply = "Agradecemos tu garantía de soberanía. Esto estabiliza enormemente la seguridad en el cuadrante local.";
  } else if (actionType === "protectorate") {
    reply = "Protectorado establecido. Bajo vuestra ala protectora nos sentiremos seguros frente a las hostilidades externas.";
  } else if (actionType === "vassalage") {
    reply = "Aceptamos con pesar vuestra soberanía forzada. Que se registre el vasallaje de nuestro pueblo.";
  } else if (actionType === "confederation") {
    reply = "La confederación interestelar es un gran paso. Avancemos en la unión legislativa de nuestros pueblos.";
  } else if (actionType === "threat") {
    reply = "¡¿Te atreves a amenazarnos?! Recordaremos este insulto. El Almirantazgo ya está trazando rutas tácticas de represalia.";
  } else if (actionType === "ultimatum") {
    reply = "Tu arrogancia no conoce límites. O te retiras de inmediato o convertiremos tus planetas en cenizas cósmicas.";
  } else if (actionType === "embargo") {
    reply = "Embargo comercial en vigor. Ningún mercante de tu imperio tiene permitido comerciar en nuestros puertos espaciales.";
  } else if (actionType === "sanctions") {
    reply = "Sanciones comerciales aplicadas. Prepárate para el aislamiento comercial y las penalizaciones arancelarias.";
  } else if (actionType === "break_relations") {
    reply = "Canal de comunicaciones cerrado. No hay nada más que hablar con tu diplomacia.";
  }

  return { playerMsg, reply };
};
