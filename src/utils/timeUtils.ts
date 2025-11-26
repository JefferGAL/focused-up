export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// SVG Polar to Cartesian coordinates
export const polarToCartesian = (
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
) => {
  // SVG starts 0 at 3 o'clock, we want 12 o'clock so we subtract 90
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;

  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
};

// Generate SVG Path for a wedge/arc
export const describeArc = (
  x: number,
  y: number,
  radius: number,
  startAngle: number,
  endAngle: number
): string => {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);

  // If the arc is a full circle (360 degrees), we need two arcs or it disappears
  if (endAngle - startAngle >= 360) {
    return [
      "M", x, y - radius,
      "A", radius, radius, 0, 1, 1, x, y + radius,
      "A", radius, radius, 0, 1, 1, x, y - radius,
      "Z"
    ].join(" ");
  }

  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  const d = [
    "M", x, y,
    "L", start.x, start.y,
    "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
    "L", x, y, // Line back to center to close the wedge
    "Z" // Close path
  ].join(" ");

  return d;
};
