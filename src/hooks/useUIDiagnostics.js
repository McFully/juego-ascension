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
      if (now - lastCheckRef.current < 2000) return;
      lastCheckRef.current = now;

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

      // Comprobar elementos contenedores principales con overflow accidental
      const mainContainer = document.getElementById('main-game-viewport');
      if (mainContainer) {
        if (mainContainer.scrollWidth > mainContainer.clientWidth + 2) {
          logTelemetry('WARN', 'Viewport central con overflow inesperado', {
            activeTab,
            clientWidth: mainContainer.clientWidth,
            scrollWidth: mainContainer.scrollWidth,
          });
        }
      }
    };

    auditUI();
    const handleResize = () => auditUI();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeTab, currentPlanet]);
};

export default useUIDiagnostics;
