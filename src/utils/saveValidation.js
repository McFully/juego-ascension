import { z } from 'zod';

// Esquema Zod para recursos
export const ResourcesSchema = z.object({
  metal: z.number().default(0),
  crystal: z.number().default(0),
  deuterium: z.number().default(0)
}).passthrough();

// Esquema Zod para planetas
export const PlanetSchema = z.object({
  id: z.string().default('unknown'),
  name: z.string().default('Planeta Desconocido'),
  galaxy: z.number().default(1),
  system: z.number().default(1),
  position: z.number().default(1),
  isHome: z.boolean().default(false),
  resources: ResourcesSchema.default({ metal: 500, crystal: 500, deuterium: 100 }),
  buildings: z.record(z.string(), z.number()).default({}),
  fleet: z.record(z.string(), z.number()).default({}),
  defenses: z.record(z.string(), z.number()).default({})
}).passthrough();

// Esquema Zod para partidas guardadas
export const SaveGameSchema = z.object({
  version: z.union([z.literal(2), z.literal(3), z.literal(4)]).default(4),
  playerName: z.string().min(1),
  gameStarted: z.literal(true),
  planets: z.array(PlanetSchema).min(1),
  research: z.record(z.string(), z.number()).default({}),
  fleetMissions: z.array(z.any()).default([]),
  stats: z.record(z.string(), z.any()).default({})
}).passthrough();

/**
 * Validador exhaustivo de partidas guardadas con Zod.
 * Normaliza y sanea cualquier estructura incompleta o legacy.
 */
export const validateSave = (data) => {
  if (!data) {
    return { valid: false, errors: ['Save vacío'], version: null };
  }

  const result = SaveGameSchema.safeParse(data);
  if (!result.success) {
    const errorMessages = result.error.issues.map(
      issue => `${issue.path.join('.') || 'root'}: ${issue.message}`
    );
    return {
      valid: false,
      errors: errorMessages,
      version: data.version || null
    };
  }

  return {
    valid: true,
    data: result.data,
    errors: [],
    version: result.data.version,
    canMigrate: result.data.version === 2 || result.data.version === 3
  };
};
