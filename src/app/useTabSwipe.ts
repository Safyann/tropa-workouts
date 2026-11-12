import { useRef, type TouchEvent } from 'react';

const edgeInset = 24;
const minimumDistance = 64;
const interactiveTarget =
  'a, button, input, select, textarea, label, summary, [contenteditable], [data-tab-swipe-ignore]';

export function useTabSwipe(enabled: boolean, changeTab: (offset: -1 | 1) => void) {
  const origin = useRef<{ x: number; y: number; id: number } | null>(null);

  function onTouchStart(event: TouchEvent<HTMLElement>) {
    origin.current = null;
    if (!enabled || event.touches.length !== 1) return;
    if (event.target instanceof Element && event.target.closest(interactiveTarget)) return;

    const { clientX: x, clientY: y, identifier: id } = event.touches[0];
    if (x < edgeInset || x > window.innerWidth - edgeInset) return;
    origin.current = { x, y, id };
  }

  function onTouchMove(event: TouchEvent<HTMLElement>) {
    const start = origin.current;
    if (!start) return;
    const touch = event.touches[0];
    if (
      event.touches.length !== 1 ||
      (Math.abs(touch.clientY - start.y) > 24 &&
        Math.abs(touch.clientY - start.y) > Math.abs(touch.clientX - start.x))
    )
      origin.current = null;
  }

  function onTouchEnd(event: TouchEvent<HTMLElement>) {
    const start = origin.current;
    origin.current = null;
    if (!enabled || !start || event.touches.length !== 0) return;
    const touch = event.changedTouches[0];
    if (touch?.identifier !== start.id) return;

    const distance = touch.clientX - start.x;
    const vertical = Math.abs(touch.clientY - start.y);
    if (Math.abs(distance) >= minimumDistance && Math.abs(distance) >= vertical * 1.5)
      changeTab(distance < 0 ? 1 : -1);
  }

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    onTouchCancel: () => {
      origin.current = null;
    },
  };
}
