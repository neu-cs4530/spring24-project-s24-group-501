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
  CasinoScore,
} from '../../../types/CoveyTownSocket';
import Game from '../../games/Game';
import CasinoTracker from '../CasinoTracker';
import CasinoTrackerFactory from '../CasinoTrackerFactory';
import Shuffler from '../Shuffler';

const MAX_PLAYERS = 4;

/**
 * A BlackjackGame is a Game that implements the rules of Blackjack.
 * @see https://www.blackjack.org/blackjack/how-to-play/
 */
export default class BlackjackGame extends Game<BlackjackCasinoState, BlackjackMove> {
  private _casinoTracker: CasinoTracker;

  public constructor(stakeSize?: CoveyBucks, definedDeck?: Card[]) {
    super({
      hands: [],
      status: 'WAITING_FOR_PLAYERS',
      currentPlayer: 0,
      dealerHand: { cards: [], bust: false, text: '' },
      results: [],
      shuffler: new Shuffler(definedDeck),
      wantsToLeave: [],
      stake: stakeSize ?? 10,
    });
    this._casinoTracker = CasinoTrackerFactory.instance();
  }

  /**
   * Applies a bet for the user to the game.
   *
   * @param player the player to place a bet
   * @param bet the amount of currency to bet
   * @throws InvalidParametersError if the game is not in the betting phase (GAME_NOT_BETTABLE_MESSAGE)
   * @throws InvalidParametersError if the bet is not a multiple of the stake size or beyond 1-10x (INVALID_BET_MESSAGE)
   */
  public placeBet(player: Player, bet: CoveyBucks): void {
    if (this.state.status !== 'WAITING_TO_START') {
      throw new InvalidParametersError(GAME_NOT_BETTABLE_MESSAGE);
    }
    if (bet % this.state.stake !== 0 || bet < this.state.stake || bet > 10 * this.state.stake) {
      throw new InvalidParametersError(INVALID_BET_MESSAGE);
    }
    for (const blackjackPlayer of this.state.hands) {
      if (blackjackPlayer.player === player.id) {
        blackjackPlayer.hands[0].wager = bet;

        // the game can commence once all players have made their bet
        if (this.state.hands.filter(playerHand => playerHand.hands[0].wager === 0).length === 0) {
          this.state = {
            ...this.state,
            status: 'IN_PROGRESS',
          };
          this.state.hands.forEach(playerHand => {
            playerHand.hands[0].cards = [
              this.state.shuffler.deal(true),
              this.state.shuffler.deal(true),
            ];
            playerHand.hands[0].text = this._render(playerHand.hands[0].cards);
          });
          this.state.dealerHand.cards = [
            this.state.shuffler.deal(false),
            this.state.shuffler.deal(true),
          ];
        }

        return;
      }
    }
    throw new InvalidParametersError(PLAYER_NOT_IN_GAME_MESSAGE);
  }

  private async _endGame(): Promise<void> {
    await this._dealerHandler();
    await this._dishWagers();
    await new Promise<void>(resolve => {
      setTimeout(() => {
        resolve();
      }, 3000);
    });
    this._resetGame();
  }

  /**
   * Processes the wagers of the game and updates the player's currency.
   */
  private async _dishWagers(): Promise<void> {
    // await this._dealerHandler();
    let dealerValue = this._handValue(this.state.dealerHand.cards);
    if (dealerValue > 21) {
      this.state.dealerHand.bust = true;
      dealerValue = 0;
    }
    for (const bjPlayer of this.state.hands) {
      let netPlayerWinnings = 0;
      for (const hand of bjPlayer.hands) {
        const playerValue = this._handValue(hand.cards);
        if (playerValue > 21) {
          netPlayerWinnings -= hand.wager;
          hand.outcome = 'Bust';
        }
        if (dealerValue > playerValue) {
          netPlayerWinnings -= hand.wager;
          hand.outcome = 'Loss';
        } else {
          netPlayerWinnings += hand.wager;
          hand.outcome = 'Win';
        }
      }
      const playerObj = this._players.find(player => player.id === bjPlayer.player);
      if (playerObj) {
        playerObj.units += netPlayerWinnings;
        this._updateCurrency({ player: bjPlayer.player, netCurrency: netPlayerWinnings });
      }
    }
  }

  private async _updateCurrency(score: CasinoScore): Promise<void> {
    await this._casinoTracker.putPlayerCurrency(score);
  }

  /**
   * Resets the game to its initial state by shuffling the deck, producing empty hands, and processing players who want to leave.
   */
  private _resetGame(): void {
    this.state.shuffler.refresh();
    this.state = {
      ...this.state,
      currentPlayer: 0,
      dealerHand: { cards: [], bust: false, text: '' },
      hands: this.state.hands.filter(hand => !this.state.wantsToLeave.includes(hand.player)),
      wantsToLeave: [],
    };
    if (this.state.hands.length === 0) {
      this.state.status = 'WAITING_FOR_PLAYERS';
    } else {
      this.state.status = 'WAITING_TO_START';
      for (const player of this.state.hands) {
        player.hands = [{ cards: [], wager: 0, text: '', outcome: undefined }];
        player.active = true;
        player.currentHand = 0;
      }
    }
  }

  /**
   * Pauses execution for a given duration.
   * @param ms millisends to sleep
   * @returns a Promise that resolves after the given duration
   */
  private _sleep(card: Card, ms: number): Promise<void> {
    return new Promise<void>(resolve => {
      setTimeout(() => {
        resolve();
      }, ms);
    }).then(() => {
      this.state.dealerHand.cards.push(card);
      console.log('dealt new dealer card');
      this.state.dealerHand.text = this._render(this.state.dealerHand.cards);
    });
  }

  /**
   * Deals out the cards for the dealer.
   * - They hit while their hand value is under 17, then standing.
   * - If they bust, they return 0.
   *
   * @returns the value of the dealers hand
   */
  private async _dealerHandler(): Promise<void> {
    this.state.currentPlayer = -1;
    this.state.dealerHand.cards[0].faceUp = true;
    const dealerCards = [];
    while (this._handValue(this.state.dealerHand.cards.concat(dealerCards)) < 17) {
      dealerCards.push(this.state.shuffler.deal(true));
    }
    await Promise.all(dealerCards.map((card, index) => this._sleep(card, 1000 * (index + 1))));
  }

  /**
   * Applies a BlackJack move to the current game. A player can:
   * - stand, making their current hand inactive.
   * - hit, adding a card to their current hand. If they bust, their hand becomes inactive.
   * - double down, doubling their wager and adding a card to their current hand. Their hand becomes inactive.
   * - split, if they have a pair of cards. The player splits their hand into two separate hands, each with one of the pair.
   * Once all players become inactive, the game will process the wagers and trigger a state reset.
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

    const updatePlayerAndHand = (): void => {
      currPlayerHand.currentHand += 1;
      if (currPlayerHand.currentHand >= currPlayerHand.hands.length) {
        currPlayerHand.active = false;
        // Find the next active player
        while (
          this.state.currentPlayer < this.state.hands.length &&
          !this.state.hands[this.state.currentPlayer].active
        ) {
          this.state.currentPlayer += 1;
        }
      }
    };

    if (move.move.action === 'Stand') {
      updatePlayerAndHand();
    } else if (move.move.action === 'Hit') {
      const hand = currPlayerHand.hands[currPlayerHand.currentHand];
      hand.cards.push(this.state.shuffler.deal(true));
      hand.text = this._render(hand.cards);
      // Check if the player has busted or reached 21
      if (this._handValue(hand.cards) >= 21) {
        updatePlayerAndHand();
        if (this._handValue(hand.cards) > 21) {
          hand.outcome = 'Bust';
        }
      }
    } else if (move.move.action === 'Double Down') {
      const hand = currPlayerHand.hands[currPlayerHand.currentHand];
      hand.cards.push(this.state.shuffler.deal(true));
      hand.wager *= 2;
      hand.text = this._render(hand.cards);
      updatePlayerAndHand();
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
      currPlayerHand.hands[0].text = this._render(currPlayerHand.hands[0].cards);
      const secondHandCards = [card, this.state.shuffler.deal(true)];
      currPlayerHand.hands.push({
        cards: secondHandCards,
        wager: currPlayerHand.hands[0].wager,
        text: this._render(secondHandCards),
        outcome: undefined,
      });
    }

    // The round is over if all players are inactive
    if (this.state.hands.filter(player => player.active).length === 0) {
      this.state.status = 'OVER';
      this._endGame();
    }
  }

  /**
   * Renders the text display for a player's hand
   * @param cards the cards in the hand
   * @returns the text display for someones hand
   */
  private _render(cards: Card[]): string {
    const handValue = this._handValue(cards);
    const nonAces = cards.filter(card => card.value !== 'A');
    const numAces = cards.length - nonAces.length;
    if (handValue === 0) {
      return '';
    }
    if (numAces === 0 || handValue > 21 || this._handValue(nonAces) + numAces === handValue) {
      return `${handValue}`;
    }
    return `${handValue}/${handValue - 10}`;
  }

  /**
   * Computes the numeric value of a hand
   * @param cards the cards in the hand
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
    if (this.state.hands.map(hand => hand.player).includes(player.id)) {
      throw new InvalidParametersError(PLAYER_ALREADY_IN_GAME_MESSAGE);
    }
    if (this.state.hands.length === MAX_PLAYERS) {
      throw new InvalidParametersError(GAME_FULL_MESSAGE);
    }

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
      hands: [{ cards: [], wager: 0, text: '', outcome: undefined }],
      currentHand: 0,
      active,
    });
  }

  /**
   * If the game is in the betting phase, removes a player from the game.
   * If the game is in progress, adds a player to a queue to leave the game. The player will be removed after the current hand finishes.
   *
   * @param player The player to remove from the game
   * @throws InvalidParametersError if the player is not in the game (PLAYER_NOT_IN_GAME_MESSAGE)
   */
  protected _leave(player: Player): void {
    if (!this.state.hands.map(hand => hand.player).includes(player.id)) {
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
