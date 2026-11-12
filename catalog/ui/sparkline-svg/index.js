/**
 * Generates responsive SVG sparkline charts
 */
export function renderSparkline(values = [], options = {}) {
  if (!Array.isArray(values) || values.length === 0) {
    return '<svg viewBox="0 0 100 30" xmlns="http://www.w3.org/2000/svg"></svg>';
  }

  const width = options.width || 120;
  const height = options.height || 36;
  const strokeColor = options.strokeColor || '#0ea5e9';
  const strokeWidth = options.strokeWidth || 2;
  const fillColor = options.fillColor || 'rgba(14, 165, 233, 0.15)';
  const padding = options.padding || 4;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const usableWidth = width - padding * 2;
  const usableHeight = height - padding * 2;
  const stepX = values.length > 1 ? usableWidth / (values.length - 1) : 0;

  const points = values.map((val, idx) => {
    const x = padding + idx * stepX;
    const y = max === min ? height / 2 : height - padding - ((val - min) / range) * usableHeight;
    return { x: Number(x.toFixed(2)), y: Number(y.toFixed(2)) };
  });

  if (points.length === 1) {
    return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${points[0].x}" cy="${points[0].y}" r="${strokeWidth * 1.5}" fill="${strokeColor}" />
    </svg>`;
  }

  // Smooth bezier curve path
  let pathD = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? 0 : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    pathD += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x} ${p2.y}`;
  }

  // Area fill path closing down to bottom
  const fillD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;
  const lastPoint = points[points.length - 1];

  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" class="sparkline-chart">
  <defs>
    <linearGradient id="spark-grad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${fillColor}" />
      <stop offset="100%" stop-color="${fillColor}" stop-opacity="0" />
    </linearGradient>
  </defs>
  <path d="${fillD}" fill="url(#spark-grad)" />
  <path d="${pathD}" fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" />
  <circle cx="${lastPoint.x}" cy="${lastPoint.y}" r="${strokeWidth + 1}" fill="${strokeColor}" />
</svg>`.trim();
}
