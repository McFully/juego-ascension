import React, { useRef, useState, useEffect, useMemo } from 'react';

/**
 * VirtualList: Renderizador de ventana virtual de alto rendimiento y cero dependencias.
 * Solo monta en el DOM los elementos visibles en pantalla (+ overscan de margen).
 * Garantiza 60/144 FPS estables sin importar si la lista tiene 10 o 10.000 elementos.
 */
export function VirtualList({
  items = [],
  itemHeight = 60,
  maxHeight = 400,
  overscan = 4,
  renderItem,
  className = '',
  emptyPlaceholder = null
}) {
  const containerRef = useRef(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(maxHeight);

  useEffect(() => {
    if (containerRef.current) {
      setContainerHeight(containerRef.current.clientHeight || maxHeight);
    }
  }, [maxHeight]);

  const onScroll = (e) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  const totalHeight = items.length * itemHeight;

  const { startIndex, endIndex, offsetY } = useMemo(() => {
    if (items.length === 0) {
      return { startIndex: 0, endIndex: 0, offsetY: 0 };
    }
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const end = Math.min(items.length, start + visibleCount + overscan * 2);
    const offset = start * itemHeight;
    return { startIndex: start, endIndex: end, offsetY: offset };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  if (!items || items.length === 0) {
    return emptyPlaceholder || null;
  }

  const visibleItems = items.slice(startIndex, endIndex);

  return (
    <div
      ref={containerRef}
      onScroll={onScroll}
      className={`overflow-y-auto ${className}`}
      style={{ maxHeight: `${maxHeight}px`, position: 'relative' }}
    >
      <div style={{ height: `${totalHeight}px`, width: '100%', position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0
          }}
        >
          {visibleItems.map((item, index) => {
            const actualIndex = startIndex + index;
            return renderItem(item, actualIndex);
          })}
        </div>
      </div>
    </div>
  );
}
