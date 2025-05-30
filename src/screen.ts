import { getPixelColor as robotGetPixelColourSlow } from "robotjs"
import { EMPTY_SQUARE_COLOUR, FLAG_SQUARE_COLOUR, GAME_OVER_PIXEL_COLOUR, GAME_OVER_PIXEL_POS, GAME_WON_PIXEL_COLOUR, GAME_WON_PIXEL_POS, GRID_COLUMNS, GRID_ROWS, NUMBER_SQUARE_COLOURS, SQUARE_VALUE_OFFSET, UNKNOWN_SQUARE_COLOUR } from "./config"
import { SquareState } from "./enum/SquareState"
import { jimpToString } from "./utils/strings"
import { GameOverToken, GameWonToken, Grid, Position } from "./types"
import screenshotDesktop from "screenshot-desktop"
import { Jimp } from "jimp"
import { getSquarePos } from "./utils/position"
import { combineXY } from "./utils/numbers"

/**
 * Returns number if there is an amonut of mines, otherwise returns square state
 */
export function readSquareState(posX: number, posY: number, screen?: any): number {
  let squareColour: string
  let offsetSquareColour: string

  if (!screen) {
    console.log("Warning: using old method to get pixel colour")
    squareColour = robotGetPixelColourSlow(posX, posY)
    offsetSquareColour = robotGetPixelColourSlow(
      SQUARE_VALUE_OFFSET.x + posX,
      SQUARE_VALUE_OFFSET.y + posY,
    )
  } else {
    squareColour = jimpToString(screen.getPixelColor(posX, posY))
    offsetSquareColour = jimpToString(screen.getPixelColor(
      SQUARE_VALUE_OFFSET.x + posX,
      SQUARE_VALUE_OFFSET.y + posY,
    ))
  }


  if (squareColour == UNKNOWN_SQUARE_COLOUR && offsetSquareColour == FLAG_SQUARE_COLOUR) {
    return SquareState.FLAG;
  }

  if (squareColour == UNKNOWN_SQUARE_COLOUR) {
    return SquareState.UNKNOWN;
  }

  for (let i = 0; i < NUMBER_SQUARE_COLOURS.length; i++) {
    const value = i + 1;
    const colour = NUMBER_SQUARE_COLOURS[i]

    if (offsetSquareColour == colour) {
      return value
    }
  }

  if (offsetSquareColour == EMPTY_SQUARE_COLOUR) {
    return SquareState.EMPTY
  }



  return SquareState.ERROR;
}

/**
 * A list of squares which will skip processing.
 * This will be either EMPTY or FLAGED squares.
 */
export const skipProcessing = new Set<number>()


export const GAME_OVER_TOKEN: GameOverToken = 0x10
export const GAME_WON_TOKEN: GameWonToken = 0x11

export async function readGrid(previousGrid?: Grid): Promise<Grid | GameOverToken | GameWonToken> {
  const grid: Grid = previousGrid || new Array(GRID_ROWS)

  const screenshot = await screenshotDesktop({
    format: "png"
  })
  const jimp = await Jimp.read(screenshot)

  function jimpCheck(pos: Position, colour: string) {
    return jimpToString(jimp.getPixelColor(pos.x, pos.y)) == colour
  }

  if (jimpCheck(GAME_OVER_PIXEL_POS, GAME_OVER_PIXEL_COLOUR)) {
    return GAME_OVER_TOKEN
  }

    if (jimpCheck(GAME_WON_PIXEL_POS, GAME_WON_PIXEL_COLOUR)) {
    return GAME_WON_TOKEN
  }

  for (let y = 0; y < GRID_ROWS; y++) {
    let row = grid[y] || new Array(GRID_COLUMNS)
    
    xLoop: for (let x = 0; x < GRID_COLUMNS; x++) {
      if (row[x] != undefined && !(row[x] == SquareState.UNKNOWN || row[x] == SquareState.SAFE_UNKNOWN)) {
        // Skip processing square
        continue
      }

      const squarePos = getSquarePos(x, y)
      const state = readSquareState(squarePos.x, squarePos.y, jimp)
      
      if (state == SquareState.EMPTY || state == SquareState.FLAG) {
        const combined = combineXY(x, y)
        skipProcessing.add(combined)
      }

      row[x] = state
    }

    grid[y] = row
  }
  return grid
}