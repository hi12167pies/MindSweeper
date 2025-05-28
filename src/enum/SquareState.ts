export enum SquareState {
  /** the spot is safe but unknown value */
  SAFE_UNKNOWN = -4,
  /** error in the reading */
  ERROR = -3,
  /** there is a flag placed */
  FLAG = -2,
  /** the spot is safe */
  EMPTY = -1,
  UNKNOWN = 0
}