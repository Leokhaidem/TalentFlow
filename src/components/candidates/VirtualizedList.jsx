import { useEffect, useState, useRef, useCallback } from "react";

export default function VirtualizedList({ items, renderItem, containerHeight = 600 }) {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 50 });
  const containerRef = useRef(null);
  const itemHeight = 120;

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const scrollTop = containerRef.current.scrollTop;
    const start = Math.floor(scrollTop / itemHeight);
    const end = Math.min(
      start + Math.ceil(containerHeight / itemHeight) + 5,
      items.length
    );
    setVisibleRange({ start, end });
  }, [items.length, containerHeight]);

  useEffect(() => {
    setVisibleRange({ start: 0, end: Math.min(50, items.length) });
  }, [items.length]);

  const visibleItems = items.slice(visibleRange.start, visibleRange.end);
  const offsetY = visibleRange.start * itemHeight;

  return (
    <div
      ref={containerRef}
      className="overflow-y-auto"
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: Math.max(0, items.length * itemHeight), position: "relative" }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, index) => renderItem(item, visibleRange.start + index))}
        </div>
      </div>
    </div>
  );
};