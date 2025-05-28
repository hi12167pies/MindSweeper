export function combineXY(x: number, y: number): number {
  return x | (y << 16)
}