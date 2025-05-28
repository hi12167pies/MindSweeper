import { GRID_START, SQUARE_SIZE } from "../config";
import { Position } from "../types";

/**
 * Finds the position (top-left) of any square in the minesweeper grid 
 */
export function getSquarePos(squareX: number, squareY: number): Position {
  return {
    x: GRID_START.x + (SQUARE_SIZE.x * squareX) + 1,
    y: GRID_START.y + (SQUARE_SIZE.y * squareY) + 1
  }
}