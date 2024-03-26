import InvalidParametersError, {
  GAME_FULL_MESSAGE,
  GAME_NOT_IN_PROGRESS_MESSAGE,
  INVALID_BET_MESSAGE,
  PLAYER_ALREADY_IN_GAME_MESSAGE,
  PLAYER_NOT_IN_GAME_MESSAGE,
} from '../../../lib/InvalidParametersError';
import Player from '../../../lib/Player';
import {
  BlackjackMove,
  Card,
  CasinoState,
  CoveyBucks,
  GameMove,
  PlayerID,
} from '../../../types/CoveyTownSocket';
import Game from '../Game';
import Shuffler from './Shuffler';

const MAX_PLAYERS = 4;

/**
 * A BlackjackGame is a Game that implements the rules of Blackjack.
 * @see https://www.blackjack.org/blackjack/how-to-play/
 */
export default class BlackjackGame extends Game<CasinoState, BlackjackMove> {
  private _stakeSize: CoveyBucks;

  public constructor(stakeSize?: CoveyBucks, definedDeck?: Card[]) {
    super({
      hands: [],
      status: 'WAITING_FOR_PLAYERS',
      currentPlayer: 0,
      dealerHand: [],
      results: [],
      shuffler: new Shuffler(definedDeck),
      wantsToLeave: [],
    });
    this._stakeSize = stakeSize ?? 10;
  }

  /**
   *
   */
  public placeBet(player: Player, bet: CoveyBucks): void {
    if (bet % this._stakeSize !== 0 || bet < this._stakeSize || bet > 5 * this._stakeSize) {
      throw new InvalidParametersError(INVALID_BET_MESSAGE);
    }

    for (const hand of this.state.hands) {
      if (hand.player === player.id) {
        hand.ante = bet;

        // the game can commence once all players have made their bet
        if (this.state.hands.filter(playerHand => playerHand.ante !== 0).length === 0) {
          this.state = {
            ...this.state,
            status: 'IN_PROGRESS',
          };
        }

        return;
      }
    }
    throw new InvalidParametersError(PLAYER_NOT_IN_GAME_MESSAGE);
  }

  /**
   * Apply Move: Were going to apply a blackjack move to game
   * @param move The move to apply to the game
   * @throws error when the moving player isn't active (Busted or stands)
   * @throws error is not a valid split
   */
  public applyMove(move: GameMove<BlackjackMove>): void {
    if (this.state.status !== 'IN_PROGRESS') {
      throw new Error(GAME_NOT_IN_PROGRESS_MESSAGE);
    }
    let newHand = null;
    let index = 0;
    let counter = 0;
    // Applies the move
    for (const object of this.state.hands) {
      if (object.player === move.playerID) {
        if (!object.active) {
          throw new Error('Player is not active');
        } else if (move.move.action === 'Stand') {
          object.active = false;
        } else if (move.move.action === 'Hit') {
          object.hand.push(this.state.shuffler.deal(true));
          if (this._handValue(object.hand) > 21) {
            object.active = false;
          }
        } else if (move.move.action === 'Double Down') {
          object.hand.push(this.state.shuffler.deal(true));
          object.ante *= 2;
          object.active = false;
        } else if (move.move.action === 'Split') {
          if (object.hand.length !== 2 || object.hand[0].value !== object.hand[1].value) {
            throw new Error('Split is not available here');
          }
          const card = object.hand[0];
          object.hand = [card];
          newHand = object;
          index = counter;
        }
      }
      counter += 1;
    }

    // inserts twin split hand right after first one
    if (newHand !== null) {
      this.state.hands.splice(index, 0, newHand);
    }

    // what to do when the round is over
    if (this.state.hands.filter(p => p.active).length === 0) {
      this._overHandler();
    }
  }

  /**
   * Helper to get the value of a hand to see if a player has busted
   * @param cards
   * @returns number value of someones hand
   */
  private _handValue(cards: Card[]): number {
    let value = 0;
    let aceCount = 0;
    for (const card of cards) {
      if (typeof card.value === 'number') {
        value += card.value;
      }
      if (card.value === 'J' || card.value === 'Q' || card.value === 'K') {
        value += 10;
      }
      if (card.value === 'A') {
        value += 11;
        aceCount += 1;
      }

      while (aceCount > 0) {
        if (value > 21) {
          value -= 10;
          aceCount -= 1;
        } else {
          break;
        }
      }
    }
    return value;
  }

  /**
   * Adds a player to the game.
   * Updates the game's state to reflect the new player, taking the first seat at the table.
   *
   * @param player The player to join the game
   * @throws InvalidParametersError if the player is already in the game (PLAYER_ALREADY_IN_GAME_MESSAGE)
   *  or the game is full (GAME_FULL_MESSAGE)
   */
  protected _join(player: Player): void {
    if (this.state.hands.map(h => h.player).includes(player.id)) {
      throw new InvalidParametersError(PLAYER_ALREADY_IN_GAME_MESSAGE);
    }
    if (this.state.hands.length === MAX_PLAYERS) {
      throw new InvalidParametersError(GAME_FULL_MESSAGE);
    }

    this.state.hands.unshift({
      player: player.id,
      hand: [],
      ante: 0,
      active: false,
    });
    this.state.status = 'IN_PROGRESS';
  }

  /**
   * Adds a player to a queue to leave the game.
   * The player will be removed after the current hand finishes.
   * @param player The player to remove from the game
   * @throws InvalidParametersError if the player is not in the game (PLAYER_NOT_IN_GAME_MESSAGE)
   */
  protected _leave(player: Player): void {
    if (!this.state.hands.map(h => h.player).includes(player.id)) {
      throw new InvalidParametersError(PLAYER_NOT_IN_GAME_MESSAGE);
    }
    this.state.wantsToLeave.push(player.id);
  }

  /**
   * Handles dishing out antes and resseting the game after a round is over
   */
  private _overHandler(): void {
    const finalDealerValue = this._dealerHandler();

    for (const player of this.state.hands) {
      if (this._handValue(player.hand) > 21) {
        for (const result of this.state.results) {
          if (result.player === player.player) {
            result.netCurrency -= player.ante;
          }
        }
      } else if (finalDealerValue > this._handValue(player.hand)) {
        for (const result of this.state.results) {
          if (result.player === player.player) {
            result.netCurrency -= player.ante;
          }
        }
      } else if (finalDealerValue < this._handValue(player.hand)) {
        for (const result of this.state.results) {
          if (result.player === player.player) {
            result.netCurrency += player.ante;
          }
        }
      }
    }
    this.state.shuffler.refresh();
    this.state = {
      ...this.state,
      hands: this.state.hands.filter(hand => !this.state.wantsToLeave.includes(hand.player)),
    };

    if (this.state.hands.length === 0) {
      this.state.status = 'WAITING_FOR_PLAYERS';
    } else {
      for (const object of this.state.hands) {
        object.hand = [this.state.shuffler.deal(true), this.state.shuffler.deal(true)];
        object.active = true;
      }
      this.state.dealerHand = [this.state.shuffler.deal(false), this.state.shuffler.deal(true)];
    }
  }

  /**
   * Deals out the cards for the dealer (hit until over 17, always stands if value is 17 or higher)
   * @returns the value of the dealers hand
   */
  private _dealerHandler(): number {
    this.state.dealerHand[0].faceUp = true;
    while (this._handValue(this.state.dealerHand) < 17) {
      this.state.dealerHand.push(this.state.shuffler.deal(true));
    }
    let finalDealerValue = 0;
    if (this._handValue(this.state.dealerHand) > 21) {
      finalDealerValue = 0;
    } else {
      finalDealerValue = this._handValue(this.state.dealerHand);
    }
    return finalDealerValue;
  }
}
