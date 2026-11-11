export interface TrailPoint {
  x: number;
  y: number;
}

export function drawTrail(canvas: HTMLCanvasElement, points: readonly TrailPoint[]) {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const scale = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  const context = canvas.getContext('2d');
  if (!context || !width || !height) return;

  context.scale(scale, scale);
  const colors = ['#354d39', '#2f4737', '#3b523d'];
  colors.forEach((color, layer) => {
    const level = height * (0.18 + layer * 0.22);
    const hill = (x: number) =>
      level + Math.sin(x / 123 + layer * 1.4) * 25 + Math.cos(x / 211 + layer) * 20;
    context.beginPath();
    context.moveTo(0, hill(0));
    for (let x = 8; x <= width + 8; x += 8) context.lineTo(x, hill(x));
    context.lineTo(width, height);
    context.lineTo(0, height);
    context.closePath();
    context.fillStyle = color;
    context.fill();
  });

  context.strokeStyle = '#a4b89724';
  context.lineWidth = 1;
  for (let x = 60; x < width; x += 130) {
    const y = height * (0.23 + Math.sin(x / 77) * 0.08);
    for (let tree = 0; tree < 3; tree++) {
      const left = x + tree * 15;
      const top = y + (tree % 2) * 7;
      context.beginPath();
      context.moveTo(left, top + 17);
      context.lineTo(left + 6, top);
      context.lineTo(left + 12, top + 17);
      context.closePath();
      context.stroke();
    }
  }

  const trail = points.map(({ x, y }) => ({ x: (x / 100) * width, y: (y / 100) * height }));
  const first = trail[0];
  const last = trail.at(-1);
  if (!first || !last) return;
  context.beginPath();
  context.moveTo(first.x - 24, first.y + 14);
  context.quadraticCurveTo(first.x - 14, first.y, first.x, first.y);
  for (let index = 1; index < trail.length; index++) {
    const previous = trail[index - 1];
    const current = trail[index];
    const middle = (previous.x + current.x) / 2;
    // Завершаем кривую в центре HTML-маркера, чтобы линия совпадала с остановками.
    context.bezierCurveTo(middle, previous.y, middle, current.y, current.x, current.y);
  }
  context.quadraticCurveTo(last.x + 14, last.y, last.x + 24, last.y - 14);
  context.strokeStyle = '#f5b75f';
  context.lineWidth = 2.5;
  context.lineCap = 'round';
  context.setLineDash([4, 7]);
  context.stroke();
}
