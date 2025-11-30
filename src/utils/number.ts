export function clamp(value: number, min = -Infinity, max = Infinity): number {
  return Math.min(max, Math.max(min, value));
}

export function normalizeDecimal(value: number, fractionDigits = 2): number {
  return Number.isInteger(value) ? value : Number(value.toFixed(fractionDigits));
}
