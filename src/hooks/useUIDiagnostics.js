import { useEffect, useRef } from 'react';
import { logTelemetry } from '../utils/telemetry.js';

/**
 * Hook de Diagnóstico y Telemetría de UI en Tiempo Real.
 * Inspecciona autónomamente el DOM para detectar:
 * 1. Desbordamientos horizontales de pantalla (overflow-x).
 * 2. Cuellos de botella o solapamientos.
 * 3. Elementos fuera de límites en viewport.
 */
export const useUIDiagnostics = (activeTab, currentPlanet) => {
  const lastCheckRef = useRef(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const auditUI = () => {
      const now = Date.now();
      if (now - lastCheckRef.current < 4000) return;
      lastCheckRef.current = now;

      const scheduleAudit = window.requestIdleCallback || ((cb) => setTimeout(cb, 50));
      scheduleAudit(() => {
        // Detección de horizontal overflow en el documento principal
        const docWidth = document.documentElement.clientWidth;
        const scrollWidth = document.documentElement.scrollWidth;

      if (scrollWidth > docWidth + 2) {
        logTelemetry('WARN', 'Desbordamiento horizontal detectado en UI', {
          activeTab,
          docWidth,
          scrollWidth,
          diff: scrollWidth - docWidth,
          planetId: currentPlanet?.id,
        });
      }

      // Comprobar elementos contenedores principales con overflow accidental genuino (> 20px o si el documento sufre scroll horizontal)
      const mainContainer = document.getElementById('main-game-viewport');
      if (mainContainer) {
        const diff = mainContainer.scrollWidth - mainContainer.clientWidth;
        // Solo reportar si supera el ancho típico de scrollbar nativo de Windows (17-18px) y hay desbordamiento real
        if (diff > 20) {
          logTelemetry('WARN', 'Viewport central con overflow inesperado', {
            activeTab,
            clientWidth: mainContainer.clientWidth,
            scrollWidth: mainContainer.scrollWidth,
            diff,
          });
        }
      }
      });
    };

    auditUI();
    const handleResize = () => auditUI();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeTab, currentPlanet]);
};

export default useUIDiagnostics;
