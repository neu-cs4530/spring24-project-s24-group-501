import _ from 'lodash';
import {
  BlackjackAction,
  BlackjackMove,
  Card,
  CasinoScore,
  GameArea,
  BlackjackCasinoState,
  GameStatus,
  BlackjackPlayer,
} from '../../../../shared/types/CoveyTownSocket';
import GameAreaController, {
  GameEventTypes,
  NO_GAME_IN_PROGRESS_ERROR,
} from './GameAreaController';

export type BlackjackEvents = GameEventTypes & {
  playerHandChanged: (hands: BlackjackPlayer[]) => void;
  dealerHandChanged: (dealerHandCards: Card[]) => void;
  playerChanged: (player: number) => void;
  wantsToLeaveChanged: (wantsToLeave: string[]) => void;
};

export default class BlackjackAreaController extends GameAreaController<
  BlackjackCasinoState,
  BlackjackEvents
> {
  protected _hands: BlackjackPlayer[] = [];

  protected _wantsToLeave: string[] = [];

  protected _dealerHand: Card[] = [];

  /**
   * Returns the current state of the tables hands.
   *
   * The table has at most 4 players, each with their own hands of cards
   *
   * 1 dimensional array
   */
  get hands(): BlackjackPlayer[] | undefined {
    return this._model.game?.state.hands;
  }

  /**
   * Returns the current state of the Dealers hand.
   *
   * The table competes against the dealer
   *
   * 1 dimensional array
   */
  get dealerHand(): Card[] | undefined {
    return this._model.game?.state.dealerHand;
  }

  /**
   * Returns the status of the game
   * If there is no game, returns 'WAITING_FOR_PLAYERS'
   */
  get status(): GameStatus {
    const status = this._model.game?.state.status;
    if (!status) {
      return 'WAITING_FOR_PLAYERS';
    }
    return status;
  }

  /**
   * Returns the current player who is going
   * Number representing the index in the list of hands
   */
  get currentPlayer(): number | undefined {
    return this._model.game?.state.currentPlayer;
  }

  /**
   * Returns true if the current player is a player in this game
   */
  get isPlayer(): boolean {
    return this._model.game?.players.includes(this._townController.ourPlayer.id) || false;
  }

  /**
   * Reurns every players results in the game
   * This is a list of every player and their total net profit/loss in Covey Bucks
   */
  get results(): readonly CasinoScore[] | undefined {
    return this._model.game?.state.results;
  }

  /**
   * List of all the ID's of players who want to leave the game
   */
  get whoWantsToLeave(): string[] | undefined {
    return this._model.game?.state.wantsToLeave;
  }

  public isActive(): boolean {
    return this._model.game?.state.hands.length !== 0;
  }

  /**
   * Updates the internal state of this BlackjackAreaController based on the new model.
   *
   * Calls super._updateFrom, which updates the occupants of this game area and other
   * common properties (including this._model)
   *
   * If the hands has changed, emits a boardChanged event with the new board.
   * If the hands has not changed, does not emit a boardChanged event.
   *
   * If the turn has changed, emits a turnChanged event with the new turn
   * If the turn has not changed, does not emit a turnChanged event.
   */
  protected _updateFrom(newModel: GameArea<BlackjackCasinoState>): void {
    const whoTurn = this.currentPlayer;
    super._updateFrom(newModel);
    const newGame = newModel.game;
    if (newGame) {
      // Hand changed emitter
      const newHands: BlackjackPlayer[] = [];
      newGame.state.hands.forEach(hand => {
        newHands.push(hand);
      });
      if (!_.isEqual(newHands, this.hands)) {
        this._hands = newHands;
        this.emit('handsChanged', this._hands);
      }

      // Wants to Leave emitter
      const newWTL: string[] = [];
      newGame.state.wantsToLeave.forEach(player => {
        newWTL.push(player);
      });
      if (!_.isEqual(newWTL, this.whoWantsToLeave)) {
        this._wantsToLeave = newWTL;
        this.emit('wantsToLeaveChanged', this._wantsToLeave);
      }

      // Dealer changed emitter
      const newDealerHand: Card[] = [];
      newGame.state.dealerHand.forEach(card => {
        newDealerHand.push(card);
      });
      if (!_.isEqual(newDealerHand, this.dealerHand)) {
        this._dealerHand = newDealerHand;
        this.emit('dealerHandChanged', this._dealerHand);
      }
    }
    const newWhoTurn = this.currentPlayer;
    if (whoTurn !== newWhoTurn && newWhoTurn) this.emit('playerChanged', newWhoTurn);
  }

  /**
   * Sends a request to the server to apply the current player's Blackjack decision
   * Does not check if the move is valid.
   *
   *
   * @param bjMove is the string representing the plaers decision to hit/stand/split/double down
   */
  public async makeMove(bjMove: BlackjackAction): Promise<void> {
    const instanceID = this._instanceID;
    if (!instanceID || this._model.game?.state.status !== 'IN_PROGRESS') {
      throw new Error(NO_GAME_IN_PROGRESS_ERROR);
    }
    if (this.hands && this.currentPlayer) {
      const move: BlackjackMove = {
        player: (this.hands[this.currentPlayer] as BlackjackPlayer).player.id,
        action: bjMove,
      };
      await this._townController.sendInteractableCommand(this.id, {
        type: 'GameMove',
        gameID: instanceID,
        move,
      });
    }
    throw new Error('Current Player Undefined');
  }
}
