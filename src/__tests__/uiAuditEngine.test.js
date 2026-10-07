import { describe, it, expect } from 'vitest';
import { executeCurrentScreenAudit } from '../utils/uiAuditEngine.js';

describe('uiAuditEngine Contract', () => {
  it('exporta la función principal executeCurrentScreenAudit', () => {
    expect(typeof executeCurrentScreenAudit).toBe('function');
  });

  it('rechaza con error amigable si se invoca fuera de un entorno DOM', async () => {
    // Si no hay document o window válido, detecta la ausencia de navegador
    if (typeof document === 'undefined') {
      await expect(executeCurrentScreenAudit({ activeTab: 'overview' })).rejects.toThrow('El auditor visual requiere un entorno de navegador con DOM activo.');
    }
  });
});
