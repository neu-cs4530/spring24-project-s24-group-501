import InvalidParametersError, {
  GAME_FULL_MESSAGE,
  GAME_NOT_BETTABLE_MESSAGE,
  GAME_NOT_IN_PROGRESS_MESSAGE,
  INVALID_BET_MESSAGE,
  INVALID_SPLIT_MESSAGE,
  MOVE_NOT_YOUR_TURN_MESSAGE,
  PLAYER_ALREADY_IN_GAME_MESSAGE,
  PLAYER_NOT_ACTIVE_MESSAGE,
  PLAYER_NOT_IN_GAME_MESSAGE,
} from '../../../lib/InvalidParametersError';
import Player from '../../../lib/Player';
import {
  BlackjackMove,
  Card,
  BlackjackCasinoState,
  CoveyBucks,
  GameMove,
} from '../../../types/CoveyTownSocket';
import Game from '../../games/Game';
import Shuffler from '../Shuffler';

const MAX_PLAYERS = 4;

/**
 * A BlackjackGame is a Game that implements the rules of Blackjack.
 * @see https://www.blackjack.org/blackjack/how-to-play/
 */
export default class BlackjackGame extends Game<BlackjackCasinoState, BlackjackMove> {
  public constructor(stakeSize?: CoveyBucks, definedDeck?: Card[]) {
    super({
      hands: [],
      status: 'WAITING_FOR_PLAYERS',
      currentPlayer: 0,
      dealerHand: [],
      results: [],
      shuffler: new Shuffler(definedDeck),
      wantsToLeave: [],
      stake: stakeSize ?? 10,
    });
  }

  /**
   * @param player the player to place a bet
   * @param bet the amount of currency to bet
   * @throws InvalidParametersError if the game is not in the betting phase (GAME_NOT_BETTABLE_MESSAGE)
   * @throws InvalidParametersError if the bet is not a multiple of the stake size or beyond 1-5x (INVALID_BET_MESSAGE)
   */
  public placeBet(player: Player, bet: CoveyBucks): void {
    if (this.state.status !== 'WAITING_TO_START') {
      throw new InvalidParametersError(GAME_NOT_BETTABLE_MESSAGE);
    }
    if (bet % this.state.stake !== 0 || bet < this.state.stake || bet > 5 * this.state.stake) {
      throw new InvalidParametersError(INVALID_BET_MESSAGE);
    }
    for (const blackjackPlayer of this.state.hands) {
      if (blackjackPlayer.player === player.id) {
        blackjackPlayer.hands[0].wager = bet;

        // the game can commence once all players have made their bet
        if (this.state.hands.filter(playerHand => playerHand.hands[0].wager !== 0).length === 0) {
          this.state = {
            ...this.state,
            status: 'IN_PROGRESS',
          };
          this.state.hands.forEach(playerHand => {
            playerHand.hands[0].cards = [
              this.state.shuffler.deal(true),
              this.state.shuffler.deal(true),
            ];
          });
          this.state.dealerHand = [this.state.shuffler.deal(false), this.state.shuffler.deal(true)];
        }

        return;
      }
    }
    throw new InvalidParametersError(PLAYER_NOT_IN_GAME_MESSAGE);
  }

  /**
   * Handles dishing out antes and resseting the game after a round is over
   */
  private _overHandler(): void {
    // const finalDealerValue = this._dealerHandler();
    // for (const player of this.state.hands) {
    //   if (this._handValue(player.hand) > 21) {
    //     for (const result of this.state.results) {
    //       if (result.player === player.player) {
    //         result.netCurrency -= player.ante;
    //       }
    //     }
    //   } else if (finalDealerValue > this._handValue(player.hand)) {
    //     for (const result of this.state.results) {
    //       if (result.player === player.player) {
    //         result.netCurrency -= player.ante;
    //       }
    //     }
    //   } else if (finalDealerValue < this._handValue(player.hand)) {
    //     for (const result of this.state.results) {
    //       if (result.player === player.player) {
    //         result.netCurrency += player.ante;
    //       }
    //     }
    //   }
    // }
    // this.state.shuffler.refresh();
    // this.state = {
    //   ...this.state,
    //   hands: this.state.hands.filter(hand => !this.state.wantsToLeave.includes(hand.player)),
    //   results: this.state.results.filter(hand => !this.state.wantsToLeave.includes(hand.player)),
    // };
    // if (this.state.hands.length === 0) {
    //   this.state.status = 'WAITING_FOR_PLAYERS';
    // } else {
    //   for (const object of this.state.hands) {
    //     object.hand = [this.state.shuffler.deal(true), this.state.shuffler.deal(true)];
    //     object.active = true;
    //   }
    //   this.state.dealerHand = [this.state.shuffler.deal(false), this.state.shuffler.deal(true)];
    // }
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

  /**
   * Applies a BlackJack move to the current game.
   *
   * @param move the player's action
   * @throws InvalidParametersError if the game is not in progress (GAME_NOT_IN_PROGRESS_MESSAGE)
   * @throws InvalidParametersError if it is not the player's turn (MOVE_NOT_YOUR_TURN_MESSAGE)
   * @throws InvalidParametersError if the player is not active (PLAYER_NOT_ACTIVE_MESSAGE)
   * @throws InvalidParametersError is not a valid split (INVALID_SPLIT_MESSAGE)
   */
  public applyMove(move: GameMove<BlackjackMove>): void {
    if (this.state.status !== 'IN_PROGRESS') {
      throw new Error(GAME_NOT_IN_PROGRESS_MESSAGE);
    }

    // Extract the current player
    const currPlayerHand = this.state.hands[this.state.currentPlayer];
    if (currPlayerHand.player !== move.playerID) {
      throw new InvalidParametersError(MOVE_NOT_YOUR_TURN_MESSAGE);
    }
    if (!currPlayerHand.active) {
      throw new InvalidParametersError(PLAYER_NOT_ACTIVE_MESSAGE);
    }

    // Process the move
    if (move.move.action === 'Stand') {
      currPlayerHand.currentHand += 1;
      if (currPlayerHand.currentHand >= currPlayerHand.hands.length) {
        currPlayerHand.active = false;
        this.state.currentPlayer += 1;
      }
    } else if (move.move.action === 'Hit') {
      currPlayerHand.hands[currPlayerHand.currentHand].cards.push(this.state.shuffler.deal(true));
      // Check if the player has busted or reached 21
      if (this._handValue(currPlayerHand.hands[currPlayerHand.currentHand].cards) >= 21) {
        currPlayerHand.currentHand += 1;
        if (currPlayerHand.currentHand >= currPlayerHand.hands.length) {
          currPlayerHand.active = false;
          this.state.currentPlayer += 1;
        }
      }
    } else if (move.move.action === 'Double Down') {
      currPlayerHand.hands[currPlayerHand.currentHand].cards.push(this.state.shuffler.deal(true));
      currPlayerHand.hands[currPlayerHand.currentHand].wager *= 2;
      currPlayerHand.currentHand += 1;
      if (currPlayerHand.currentHand >= currPlayerHand.hands.length) {
        currPlayerHand.active = false;
        this.state.currentPlayer += 1;
      }
    } else if (move.move.action === 'Split') {
      // A split is only valid if the player has a pair and hasn't split already
      if (
        currPlayerHand.hands.length !== 1 ||
        currPlayerHand.hands[0].cards.length !== 2 ||
        currPlayerHand.hands[0].cards[0] !== currPlayerHand.hands[0].cards[1]
      ) {
        throw new InvalidParametersError(INVALID_SPLIT_MESSAGE);
      }
      const card = currPlayerHand.hands[0].cards.pop();
      currPlayerHand.hands[0].cards.push(this.state.shuffler.deal(true));
      currPlayerHand.hands.push({
        cards: [card, this.state.shuffler.deal(true)],
        wager: currPlayerHand.hands[0].wager,
      });
    }

    // The round is over if all players are inactive
    if (this.state.hands.filter(player => player.active).length === 0) {
      this.state.currentPlayer = 0;
      // this.
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

    if (this.state)
      if (this.state.status === 'WAITING_FOR_PLAYERS') {
        // Start the game once the first player joins
        this.state.status = 'WAITING_TO_START';
      }

    let active = true;
    if (this.state.status === 'IN_PROGRESS') {
      // a player joining mid-game should not be able to make moves
      active = false;
    }

    this.state.hands.unshift({
      player: player.id,
      hands: [{ cards: [], wager: 0 }],
      currentHand: 0,
      active,
    });
  }

  /**
   * If the game is in the betting phase, removes a player from the game.
   * If the game is in progress, adds a player to a queue to leave the game. The player will be removed after the current hand finishes.
   * @param player The player to remove from the game
   * @throws InvalidParametersError if the player is not in the game (PLAYER_NOT_IN_GAME_MESSAGE)
   */
  protected _leave(player: Player): void {
    if (!this.state.hands.map(h => h.player).includes(player.id)) {
      throw new InvalidParametersError(PLAYER_NOT_IN_GAME_MESSAGE);
    }
    if (this.state.status === 'WAITING_TO_START') {
      this.state.hands = this.state.hands.filter(playerHand => playerHand.player !== player.id);
      if (this.state.hands.length === 0) {
        this.state.status = 'WAITING_FOR_PLAYERS';
      }
      return;
    }
    this.state.wantsToLeave.push(player.id);
  }
}
