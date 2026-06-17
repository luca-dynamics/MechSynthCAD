import type { Vector2 } from "@/types";

export function formatNumber(value: number | null, unit = "") {
  return value === null ? "N/A" : `${Number(value.toFixed(6))}${unit}`;
}

export function formatVector(value: Vector2 | null, unit = "") {
  return value === null
    ? "N/A"
    : `[${Number(value[0].toFixed(6))}, ${Number(value[1].toFixed(6))}]${unit}`;
}
