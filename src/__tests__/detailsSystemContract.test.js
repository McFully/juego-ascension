import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * CONTRATO TDD FASE 16: VER DETALLES Y SISTEMA UNIFICADO DE DETALLES.
 *
 * 1. ItemCard debe tener UN solo botón de "Ver detalles", ubicado en el pie junto a la acción principal.
 *    El botón duplicado de la cabecera (menu_book) debe ser removido.
 * 2. Todos los botones de "Ver detalles" en componentes y cards deben contar con guarda
 *    onOpenCodex && onOpenCodex(id) para evitar crashes si el handler no está definido.
 * 3. En CodexModal y componentes de detalle, se unifica el tratamiento de valores ausentes:
 *    estandarizado a "No disponible" o "No aplica" en lugar de "N/A" o fallos silenciosos.
 * 4. CodexModal soporta edificios, investigaciones, naves y defensas resolviendo estadísticas reales
 *    y suministrando fallback con "No disponible" / "No aplica".
 */

describe('Fase 16: Ver Detalles y Sistema Unificado Contract', () => {
  const itemCardCode = readFileSync(
    join(process.cwd(), 'src', 'components', 'ui', 'ItemCard.jsx'),
    'utf-8'
  );
  const codexModalCode = readFileSync(
    join(process.cwd(), 'src', 'components', 'ui', 'CodexModal.jsx'),
    'utf-8'
  );
  const defenseGridCode = readFileSync(
    join(process.cwd(), 'src', 'components', 'defense', 'DefenseGrid.jsx'),
    'utf-8'
  );
  const missilePageCode = readFileSync(
    join(process.cwd(), 'src', 'pages', 'MissilesPage.jsx'),
    'utf-8'
  );
  const shipCardCode = readFileSync(
    join(process.cwd(), 'src', 'components', 'shipyard', 'ShipProductionCard.jsx'),
    'utf-8'
  );

  it('ItemCard no debe duplicar el botón de ver detalles en la cabecera', () => {
    // La cabecera NO debe contener el botón con title="Ver detalles" y menu_book
    expect(itemCardCode).not.toMatch(/title="Ver detalles"[\s\S]*?menu_book/);
    // Pero el pie SÍ debe contener el botón de ver detalles con guarda segura
    expect(itemCardCode).toMatch(/onOpenCodex\s*&&\s*onOpenCodex\(id\)/);
  });

  it('Los botones de ver detalles en DefenseGrid, MissilesPage y ShipProductionCard deben tener guarda de onOpenCodex', () => {
    expect(defenseGridCode).toMatch(/onOpenCodex\s*&&\s*onOpenCodex\(id\)/);
    expect(missilePageCode).toMatch(/onOpenCodex\s*&&\s*onOpenCodex\(id\)/);
    expect(shipCardCode).toMatch(/onOpenCodex\s*&&\s*onOpenCodex\(id\)/);
  });

  it('CodexModal debe usar estandarización No disponible / No aplica en lugar de N/A', () => {
    expect(codexModalCode).not.toMatch(/'N\/A'/);
    expect(codexModalCode).toMatch(/No aplica/);
  });
});
