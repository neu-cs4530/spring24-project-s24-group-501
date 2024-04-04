import InvalidParametersError, {
  GAME_ID_MISSMATCH_MESSAGE,
  GAME_NOT_IN_PROGRESS_MESSAGE,
  INVALID_COMMAND_MESSAGE,
} from '../../../lib/InvalidParametersError';
import Player from '../../../lib/Player';
import {
  BlackjackMove,
  BoundingBox,
  CasinoScore,
  BlackjackCasinoState,
  GameInstance,
  InteractableCommand,
  InteractableCommandReturnType,
  InteractableType,
  TownEmitter,
} from '../../../types/CoveyTownSocket';
import GameArea from '../../games/GameArea';
import BlackjackGame from './BlackjackGame';
import CasinoTracker from '../CasinoTracker';
import CasinoTrackerFactory from '../CasinoTrackerFactory';

/**
 * The BlackJackGameArea class is responsible for managing the state of a single game area for Blackjack.
 * Responsibilty for managing the state of the game itself is delegated to the BlackJackGame class.
 *
 * @see ConnectFourGame
 * @see GameArea
 */
export default class BlackJackGameArea extends GameArea<BlackjackGame> {
  private _casinoTracker: CasinoTracker;

  public constructor(id: string, rect: BoundingBox, townEmitter: TownEmitter) {
    super(id, rect, townEmitter);
    this._casinoTracker = CasinoTrackerFactory.instance();
  }

  protected getType(): InteractableType {
    return 'BlackjackArea';
  }

  private _updatePlayerScores(results: CasinoScore[]) {
    const updatedScores: CasinoScore[] = [];
    this._casinoTracker.getPlayersCurrency().then(scores => {
      results.forEach(result => {
        const units =
          scores.find(eachPlayer => eachPlayer.player === result.player)?.netCurrency || 0;
        updatedScores.push({
          player: result.player,
          netCurrency: units + result.netCurrency,
        });
      });
    });
  }

  private _stateUpdated(updatedState: GameInstance<BlackjackCasinoState>) {
    if (updatedState.state.status === 'WAITING_TO_START') {
      // If we haven't yet recorded the outcome, do so now.
      const gameID = this._game?.id;
      if (gameID) {
        const { results } = updatedState.state;
        if (results.length > 0) {
          this._updatePlayerScores([...results]);
          const mutableResults: { [playerName: string]: number } = {};
          results.forEach(result => {
            const player = this._occupants.find(eachPlayer => eachPlayer.id === result.player);
            if (player) {
              mutableResults[player.userName] = result.netCurrency;
            }
          });
          this._history.push({ gameID, scores: mutableResults });
        }
      }
    }
    this._emitAreaChanged();
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
      this._stateUpdated(game.toModel());
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
      this._stateUpdated(game.toModel());
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
      this._stateUpdated(game.toModel());
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
      this._stateUpdated(game.toModel());
      return undefined as InteractableCommandReturnType<CommandType>;
    }
    throw new InvalidParametersError(INVALID_COMMAND_MESSAGE);
  }
}
