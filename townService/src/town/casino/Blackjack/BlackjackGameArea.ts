import InvalidParametersError, {
  GAME_ID_MISSMATCH_MESSAGE,
  GAME_NOT_IN_PROGRESS_MESSAGE,
  INVALID_COMMAND_MESSAGE,
} from '../../../lib/InvalidParametersError';
import Player from '../../../lib/Player';
import {
  BlackjackMove,
  BoundingBox,
  InteractableCommand,
  InteractableCommandReturnType,
  InteractableType,
  TownEmitter,
} from '../../../types/CoveyTownSocket';
import BlackjackGame from './BlackjackGame';
import CasinoArea from '../CasinoArea';

/**
 * The BlackJackGameArea class is responsible for managing the state of a single game area for Blackjack.
 * Responsibilty for managing the state of the game itself is delegated to the BlackJackGame class.
 *
 * @see ConnectFourGame
 * @see GameArea
 */
export default class BlackJackGameArea extends CasinoArea<BlackjackGame> {
  public constructor(id: string, rect: BoundingBox, townEmitter: TownEmitter) {
    super(id, rect, townEmitter);
  }

  protected getType(): InteractableType {
    return 'BlackjackArea';
  }

  private _delayGameEnd(): void {
    const intervalId = setInterval(() => {
      if (this.game) {
        if (this.game.state.status === 'OVER') {
          this._emitAreaChanged();
          console.log('refreshing');
        } else {
          this._emitAreaChanged();
          console.log('refreshed!!!');
          clearInterval(intervalId);
        }
      } else {
        clearInterval(intervalId); // Clear the interval if there's no game
        console.log('clearing interval - no game in progress');
      }
    }, 1000);
  }

  public handleCommand<CommandType extends InteractableCommand>(
    command: CommandType,
    player: Player,
  ): InteractableCommandReturnType<CommandType> {
    if (command.type === 'GameMove') {
      const game = this._game;
      if (!game) {
        throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
      }
      if (this._game?.id !== command.gameID) {
        throw new InvalidParametersError(GAME_ID_MISSMATCH_MESSAGE);
      }
      game.applyMove({
        gameID: command.gameID,
        playerID: player.id,
        move: command.move as BlackjackMove,
      });
      // this._emitAreaChanged();
      if (game.state.currentPlayer === -1) {
        console.log('game over');
        this._delayGameEnd();
      } else {
        console.log('game not over');
        this._emitAreaChanged();
      }
      return undefined as InteractableCommandReturnType<CommandType>;
    }
    if (command.type === 'JoinGame') {
      let game = this._game;
      if (!game) {
        // No game in progress, make a new one
        game = new BlackjackGame();
        this._game = game;
      }
      game.join(player);
      this._emitAreaChanged();
      return { gameID: game.id } as InteractableCommandReturnType<CommandType>;
    }
    if (command.type === 'LeaveGame') {
      const game = this._game;
      if (!game) {
        throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
      }
      if (this._game?.id !== command.gameID) {
        throw new InvalidParametersError(GAME_ID_MISSMATCH_MESSAGE);
      }
      game.leave(player);
      this._emitAreaChanged();
      return undefined as InteractableCommandReturnType<CommandType>;
    }
    if (command.type === 'PlaceBet') {
      const game = this._game;
      if (!game) {
        throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
      }
      if (this._game?.id !== command.gameID) {
        throw new InvalidParametersError(GAME_ID_MISSMATCH_MESSAGE);
      }
      game.placeBet(player, command.bet);
      this._emitAreaChanged();
      return undefined as InteractableCommandReturnType<CommandType>;
    }
    throw new InvalidParametersError(INVALID_COMMAND_MESSAGE);
  }
}
