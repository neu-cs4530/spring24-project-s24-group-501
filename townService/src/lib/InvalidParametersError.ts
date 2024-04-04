export const INVALID_MOVE_MESSAGE = 'Invalid move';
export const INVALID_COMMAND_MESSAGE = 'Invalid command';
export const INVALID_GAME_PIECE_MESSAGE = 'Invalid game piece';

export const GAME_FULL_MESSAGE = 'Game is full';
export const GAME_NOT_IN_PROGRESS_MESSAGE = 'Game is not in progress';
export const GAME_OVER_MESSAGE = 'Game is over';
export const GAME_ID_MISSMATCH_MESSAGE = 'Game ID mismatch';

export const GAME_NOT_STARTABLE_MESSAGE = 'Game is not startable';

export const BOARD_POSITION_NOT_EMPTY_MESSAGE = 'Board position is not empty';
export const MOVE_NOT_YOUR_TURN_MESSAGE = 'Not your turn';
export const BOARD_POSITION_NOT_VALID_MESSAGE = 'Board position is not valid';

export const PLAYER_NOT_IN_GAME_MESSAGE = 'Player is not in this game';
export const PLAYER_ALREADY_IN_GAME_MESSAGE = 'Player is already in this game';

export const INVALID_BET_MESSAGE = 'Bet is invalid';
export const GAME_NOT_BETTABLE_MESSAGE = 'Game is not in the betting phase';
export const PLAYER_NOT_ACTIVE_MESSAGE = 'Player is not active';
export const INVALID_SPLIT_MESSAGE = 'Invalid hand to split';
export const INVALID_SHUFFLER_STATE_MESSAGE = 'Card cannot be dealt';
export const INSUFFICIENT_UNITS_MESSAGE = 'Player has insufficient units';
export default class InvalidParametersError extends Error {
  public message: string;

  public constructor(message: string) {
    super(message);
    this.message = message;
  }
}
