// Config values (Value that most likely will change)

/** Maximum interations before the program will shut off */
export const MAX_INTERATIONS = 500

export const GRID_COLUMNS = 16
export const GRID_ROWS = 16

/** Position of the top-left square in the grid */
export const GRID_START = { x: 261, y: 248 }
/** Position of the pixel that determines if the game is over */
export const GAME_OVER_PIXEL_POS = { x: 508, y: 204 }

export const GAME_WON_PIXEL_POS = { x: 516, y: 190 }


// Magic values (Values that can change, but shouldn't be unless you are using a different colour scheme or something)

/** Size of each square on the screen in pixels */
export const SQUARE_SIZE = {
  x: 32,
  y: 32
}

/** The offset from the top-left to get the colour of the number in the square */
export const SQUARE_VALUE_OFFSET = {
  x: 18,
  y: 22
}

/** Colour of the pixel (uses same as number offset) to be determined a flag */
export const FLAG_SQUARE_COLOUR = "000000"

/** Colour of the pixel used to determine if the game is over yet or not */
export const GAME_OVER_PIXEL_COLOUR = "000000"

/** Colour of the pixel used to determine if the game is over yet or not */
export const GAME_WON_PIXEL_COLOUR = "000000"

/** Colour for when a square has not been clicked yet */
export const UNKNOWN_SQUARE_COLOUR = "ffffff"

/** Colour for an empty tile */
export const EMPTY_SQUARE_COLOUR = "bdbdbd"

export const NUMBER_SQUARE_COLOURS = [
  // 1 (blue)
  "0000ff",
  // 2 (green)
  "007b00",
  // 3 (red)
  "ff0000",
  // 4 (dark-blue)
  "00007b",
  // 5 (dark-red)
  "7b0000",
  // 6 (cyan)
  "007b7b",
  // 7 (black)
  "000000",
  // 8 (gray)
  "7b7b7b"
]