import InvalidParametersError, {
  GAME_ID_MISSMATCH_MESSAGE,
  GAME_NOT_IN_PROGRESS_MESSAGE,
  INVALID_COMMAND_MESSAGE,
} from '../../../lib/InvalidParametersError';
import Player from '../../../lib/Player';
import {
  BlackjackMove,
  InteractableCommand,
  InteractableCommandReturnType,
  InteractableType,
} from '../../../types/CoveyTownSocket';
import BlackjackGame from './BlackjackGame';
import CasinoArea from '../CasinoArea';
import CasinoTrackerFactory from '../CasinoTrackerFactory';

/**
 * The BlackJackGameArea class is responsible for managing the state of a single game area for Blackjack.
 * Responsibilty for managing the state of the game itself is delegated to the BlackJackGame class.
 *
 * @see CasinoArea
 */
export default class BlackJackGameArea extends CasinoArea<BlackjackGame> {
  protected getType(): InteractableType {
    return 'BlackjackArea';
  }

  private _delayGameEnd(): void {
    const intervalId = setInterval(() => {
      if (this.game) {
        if (this.game.state.status === 'OVER') {
          this._emitAreaChanged();
        } else {
          this._emitAreaChanged();
          clearInterval(intervalId);
        }
      } else {
        clearInterval(intervalId);
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
      this._emitAreaChanged();
      if (game.state.status === 'OVER') {
        this._delayGameEnd();
      }
      return undefined as InteractableCommandReturnType<CommandType>;
    }
    if (command.type === 'JoinGame') {
      let game = this._game;
      if (!game) {
        // No game in progress, make a new one
        game = new BlackjackGame();
        this._game = game;
        CasinoTrackerFactory.instance().postCasinoSession({
          id: undefined,
          stakes: 'Low',
          game: 'Blackjack',
          date: new Date(),
        });
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
    if (command.type === 'SetPlayerPhoto') {
      const game = this._game;
      if (!game) {
        throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
      }
      if (this._game?.id !== command.gameID) {
        throw new InvalidParametersError(GAME_ID_MISSMATCH_MESSAGE);
      }
      game.setPlayerPhoto(player.id, command.photo);
      this._emitAreaChanged();
      return undefined as InteractableCommandReturnType<CommandType>;
    }

    throw new InvalidParametersError(INVALID_COMMAND_MESSAGE);
  }
}
