import { KINGDOM_COLORS, STAT_KEYS, STAT_LABELS } from "../data/organisms.js";

const SHORT_LABELS = {
  smartStructure: "Structure",
  toughness: "Toughness",
  sustainability: "Sustainability",
  adaptability: "Adaptability",
  realWorldImpact: "Impact",
  innovation: "Innovation",
};

export function renderRadarChart(canvas, card) {
  const context = canvas.getContext("2d");
  const bounds = canvas.getBoundingClientRect();
  const fallbackBounds = canvas.parentElement?.getBoundingClientRect();
  const width = Math.max(110, Math.min(180, Math.floor(bounds.width || fallbackBounds?.width || 160)));
  const height = Math.round(width * 0.9);
  const centerX = width / 2;
  const centerY = height * 0.44;
  const radius = Math.min(width, height) * 0.29;
  const color = KINGDOM_COLORS[card.category || card.kingdom];
  const tickValues = [25, 50, 75, 100];

  canvas.width = width;
  canvas.height = height;
  canvas.style.width = "100%";
  canvas.style.height = "auto";
  context.clearRect(0, 0, width, height);

  context.fillStyle = "rgba(20,32,51,0.55)";
  context.font = `${Math.max(7, Math.round(width * 0.045))}px IBM Plex Mono`;
  context.textAlign = "left";
  tickValues.forEach((tick, index) => {
    const ringRadius = radius * ((index + 1) / tickValues.length);
    context.beginPath();
    STAT_KEYS.forEach((_, pointIndex) => {
      const angle = (-Math.PI / 2) + (Math.PI * 2 * pointIndex) / STAT_KEYS.length;
      const x = centerX + Math.cos(angle) * ringRadius;
      const y = centerY + Math.sin(angle) * ringRadius;
      pointIndex === 0 ? context.moveTo(x, y) : context.lineTo(x, y);
    });
    context.closePath();
    context.strokeStyle = "rgba(20,32,51,0.12)";
    context.lineWidth = 0.8;
    context.stroke();
    context.fillText(String(tick), centerX + 5, centerY - ringRadius + 10);
  });

  STAT_KEYS.forEach((key, index) => {
    const angle = (-Math.PI / 2) + (Math.PI * 2 * index) / STAT_KEYS.length;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    context.beginPath();
    context.moveTo(centerX, centerY);
    context.lineTo(x, y);
    context.strokeStyle = "rgba(20,32,51,0.12)";
    context.stroke();

    const labelX = centerX + Math.cos(angle) * (radius + 16);
    const labelY = centerY + Math.sin(angle) * (radius + 16);
    context.fillStyle = "rgba(20,32,51,0.88)";
    context.font = `600 ${Math.max(8, Math.round(width * 0.055))}px Outfit`;
    context.textAlign = labelX >= centerX ? "left" : "right";
    context.fillText(SHORT_LABELS[key] || STAT_LABELS[key], labelX, labelY);
  });

  context.beginPath();
  STAT_KEYS.forEach((key, index) => {
    const value = card.stats[key] / 100;
    const angle = (-Math.PI / 2) + (Math.PI * 2 * index) / STAT_KEYS.length;
    const x = centerX + Math.cos(angle) * radius * value;
    const y = centerY + Math.sin(angle) * radius * value;
    index === 0 ? context.moveTo(x, y) : context.lineTo(x, y);
  });
  context.closePath();
  context.fillStyle = `${color}3d`;
  context.strokeStyle = color;
  context.lineWidth = 2;
  context.fill();
  context.stroke();

  STAT_KEYS.forEach((key, index) => {
    const value = card.stats[key] / 100;
    const angle = (-Math.PI / 2) + (Math.PI * 2 * index) / STAT_KEYS.length;
    const x = centerX + Math.cos(angle) * radius * value;
    const y = centerY + Math.sin(angle) * radius * value;
    context.beginPath();
    context.arc(x, y, 3.2, 0, Math.PI * 2);
    context.fillStyle = color;
    context.fill();
    context.strokeStyle = "rgba(255,255,255,0.9)";
    context.lineWidth = 2;
    context.stroke();
  });
}
