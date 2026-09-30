import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Orden de las tarjetas de un hub de mando, persistido por hub.
 *
 * La clave la decide quien usa el hook, y ese es todo el punto: el hub imperial
 * guarda en `ascension_cmd_hub_imperial_v1` y cada mundo guarda en
 * `ascension_cmd_hub_planet_<planetId>`. Antes ambos compartían
 * `ascension_cmd_hub_planet_v1`, así que reordenar el tablero de un mundo
 * reordenaba el de todos los demás.
 *
 * @param {string} storageKey  clave única de este hub
 * @param {string[]} allowedCards  catálogo de tarjetas de este hub
 */
export const useCardOrder = (storageKey, allowedCards) => {
  const [cardOrder, setCardOrder] = useState(() => {
    const defaults = [...allowedCards];
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const validSaved = parsed.filter(id => allowedCards.includes(id));
          const missingIds = allowedCards.filter(id => !validSaved.includes(id));
          return [...validSaved, ...missingIds];
        }
      }
    } catch {
      // localStorage puede estar bloqueado: se usa el orden por defecto.
    }
    return defaults;
  });

  // Si el catálogo de este hub cambia (o cambia el planeta), lo que hay en
  // almacenamiento deja de ser válido y se vuelve a componer desde cero.
  const allowedKey = allowedCards.join('|');
  useEffect(() => {
    setCardOrder(prev => {
      const allowed = allowedKey.split('|').filter(Boolean);
      const validSaved = prev.filter(id => allowed.includes(id));
      const missingIds = allowed.filter(id => !validSaved.includes(id));
      return [...validSaved, ...missingIds];
    });
  }, [allowedKey]);

  const updateCardOrder = useCallback((newOrder) => {
    const valid = newOrder.filter(id => allowedCards.includes(id));
    setCardOrder(valid);
    try {
      localStorage.setItem(storageKey, JSON.stringify(valid));
    } catch {
      // Sin persistencia el orden sigue funcionando en memoria.
    }
  }, [storageKey, allowedCards]);

  const handleResetOrder = useCallback(() => {
    updateCardOrder([...allowedCards]);
    if (window.playSfx) window.playSfx('build');
  }, [updateCardOrder, allowedCards]);

  const handleMoveCard = useCallback((id, direction) => {
    setCardOrder(prev => {
      const currentIndex = prev.indexOf(id);
      if (currentIndex === -1) return prev;
      const targetIndex = direction === 'left' ? currentIndex - 1 : currentIndex + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;

      const next = [...prev];
      const [moved] = next.splice(currentIndex, 1);
      next.splice(targetIndex, 0, moved);
      try {
        localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        // ignorar
      }
      return next;
    });
    if (window.playSfx) window.playSfx('click');
  }, [storageKey]);

  // Modo reordenación activa y arrastre
  const [isReordering, setIsReordering] = useState(false);
  const [activeDragId, setActiveDragId] = useState(null);
  const longPressTimerRef = useRef(null);
  const lastSwapTimeRef = useRef(0);

  const handlePointerDown = useCallback((id) => {
    if (!isReordering) return;
    if (window.playSfx) window.playSfx('click');
    setActiveDragId(id);
    setIsReordering(true);
  }, [isReordering]);

  const handlePointerUpOrCancel = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  // Swap en tiempo real mientras se arrastra la tarjeta sobre otra
  const handleDragOverTarget = useCallback((draggedId, targetId, lockedCardId) => {
    if (!draggedId || !targetId || draggedId === targetId) return;
    // La tarjeta de retorno al imperio es inamovible y queda siempre al final.
    if (draggedId === lockedCardId || targetId === lockedCardId) return;
    const now = Date.now();
    // Throttle para estabilidad de animación
    if (now - lastSwapTimeRef.current < 150) return;

    setCardOrder(prev => {
      const oldIdx = prev.indexOf(draggedId);
      const newIdx = prev.indexOf(targetId);
      if (oldIdx === -1 || newIdx === -1) return prev;
      lastSwapTimeRef.current = now;
      const next = [...prev];
      const [moved] = next.splice(oldIdx, 1);
      next.splice(newIdx, 0, moved);
      try {
        localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        // ignorar
      }
      return next;
    });
  }, [storageKey]);

  const handleDragEnd = useCallback(() => {
    if (window.playSfx) window.playSfx('build');
    setActiveDragId(null);
  }, []);

  return {
    cardOrder,
    isReordering,
    activeDragId,
    setIsReordering,
    handleResetOrder,
    handleMoveCard,
    handlePointerDown,
    handlePointerUpOrCancel,
    handleDragOverTarget,
    handleDragEnd,
  };
};