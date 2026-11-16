export type ScrollPosition = {
  progress: number;
  direction: 'up' | 'down' | 'none';
};

export function observeScroll(onPosition: (position: ScrollPosition) => void) {
  let previous: number | undefined;
  let frame = 0;

  function read() {
    frame = 0;
    const range = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    const offset = Math.max(0, Math.min(window.scrollY, range));
    const direction = previous === undefined || previous === offset
      ? 'none'
      : offset > previous ? 'down' : 'up';
    previous = offset;
    onPosition({ progress: range ? offset / range : 0, direction });
  }

  function schedule() {
    if (!frame) frame = requestAnimationFrame(read);
  }

  const dimensions = new ResizeObserver(schedule);
  dimensions.observe(document.documentElement);
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  read();

  return () => {
    cancelAnimationFrame(frame);
    dimensions.disconnect();
    window.removeEventListener('scroll', schedule);
    window.removeEventListener('resize', schedule);
  };
}
