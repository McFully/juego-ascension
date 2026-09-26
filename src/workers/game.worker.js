import { processTick } from '../reducers/tick/tickOrchestrator.js';

self.onmessage = (event) => {
  const { action, payload } = event.data || {};

  if (action === 'TICK') {
    const startTime = performance.now();
    try {
      const newState = processTick(payload.state);
      const duration = performance.now() - startTime;
      self.postMessage({
        action: 'TICK_SUCCESS',
        payload: {
          newState,
          tickId: payload.tickId,
          duration
        }
      });
    } catch (error) {
      self.postMessage({
        action: 'TICK_ERROR',
        payload: {
          error: error?.message || String(error),
          stack: error?.stack || '',
          tickId: payload.tickId
        }
      });
    }
  }
};
