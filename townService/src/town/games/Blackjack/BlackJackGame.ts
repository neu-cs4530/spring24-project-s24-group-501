import InvalidParametersError, { GAME_FULL_MESSAGE, GAME_NOT_IN_PROGRESS_MESSAGE, PLAYER_ALREADY_IN_GAME_MESSAGE, PLAYER_NOT_IN_GAME_MESSAGE } from "../../../lib/InvalidParametersError";
import Player from "../../../lib/Player";
import { BlackjackMove, Card, CasinoState, CoveyBucks, GameMove, PlayerID } from "../../../types/CoveyTownSocket";
import Game from "../Game";
import Shuffler from "./Shuffler";

const MAX_PLAYERS = 4

/**
 * A BlackJackGame is a Game that implements the rules of BlackJack.
 * @see https://www.blackjack.org/blackjack/how-to-play/
 */
export default class BlackJackGame extends Game<CasinoState, BlackjackMove> {
    private _stakeSize: CoveyBucks;

    public constructor(stakeSize?: CoveyBucks, defaultGame?: BlackJackGame, definedDeck?: Card[]) {
      super({
          hands: defaultGame?.state.hands ?? [],
          status: defaultGame?.state.status ?? 'WAITING_TO_START',
          dealerHand: [],
          results: [],
          shuffler: new Shuffler(),
          wantsToLeave: []
      });
      this._stakeSize = stakeSize ?? 10
    }

    /**
     * 
     */
    public placeBet(player: Player, bet: CoveyBucks): void {
        for (let hand of this.state.hands) {
            if (hand.player === player.id) {
                hand.ante = bet

                // the game can commence once all players have made their bet
                if (this.state.hands.filter(hand => hand.ante !== 0).length === 0) {
                    this.state = {
                        ...this.state,
                        status: 'IN_PROGRESS'
                    }
                }

                return
            }
        }
        throw new Error(PLAYER_NOT_IN_GAME_MESSAGE);
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
        var newHand = null
        var index = 0;
        var counter = 0
        // Applies the move
        for (let object of this.state.hands) {
            if (object.player == move.playerID) {
                if (!object.active) {
                    throw new Error("Player is not active");
                }
                else if (move.move.action === "Stand") {
                    object.active = false;
                }
                else if (move.move.action === "Hit") {
                    object.hand.push(this.state.shuffler.deal(true));
                    if (this.handValue(object.hand) > 21) {
                        object.active = false;
                    }
                }
                else if (move.move.action === "Double Down") {
                    object.hand.push(this.state.shuffler.deal(true));
                    object.ante *= 2;
                    object.active = false;
                }
                else if (move.move.action === "Split") {
                    if (object.hand.length != 2 || object.hand[0] !== object.hand[1]) {
                        throw new Error("Split is not available here")
                    }
                    let card = object.hand[0]
                    object.hand = [card];
                    newHand = object;
                    index = counter;
                }
                counter += 1;
            }
        }

        // inserts twin split hand right after first one
        if (newHand !== null) {
            this.state.hands.splice(index,0,newHand)
        }

        // what to do when the round is over
        if (this.state.hands.filter(p => !p.active).length === 0) {
            this.state.dealerHand[0].faceUp = true;
            while (this.handValue(this.state.dealerHand) < 17) {
                this.state.dealerHand.push(this.state.shuffler.deal(true))
            }
            let finalDealerValue = 0;
            if (this.handValue(this.state.dealerHand) > 21) {
                finalDealerValue = 0;
            }
            else {
                finalDealerValue = this.handValue(this.state.dealerHand);
            }
            
            for (let player of this.state.hands) {
                if (finalDealerValue === this.handValue(player.hand)) {

                }
                else if ( 21 < this.handValue(player.hand)) {
                    for (let result of this.state.results) {
                        if (result.player = move.playerID) {
                            result.netCurrency -= player.ante
                        }
                    }
                }
                else if (finalDealerValue > this.handValue(player.hand)) {
                    for (let result of this.state.results) {
                        if (result.player = move.playerID) {
                            result.netCurrency -= player.ante
                        }
                    }
                }
                else {
                    for (let result of this.state.results) {
                        if (result.player = move.playerID) {
                            result.netCurrency += player.ante
                        }
                    }
                }
            }
            this.state = {
                ...this.state,
                shuffler: this.state.shuffler.refresh(),
                hands: this.state.hands.filter(hand => !this.state.wantsToLeave.includes(hand.player))
            }
            
            for (let object of this.state.hands) {
                object.hand = [ this.state.shuffler.deal(true), this.state.shuffler.deal(true)]; 
                object.active = true;
            }
            this.state.dealerHand = [this.state.shuffler.deal(false), this.state.shuffler.deal(true)]
        }

    }

    /**
     * Helper to get the value of a hand to see if a player has busted
     * @param cards 
     * @returns number value of someones hand
     */
    private handValue(cards: Card[]) : number {
        var value = 0;
        var aceCount = 0;
        for (let card of cards) {
            if (typeof(card) == "number") {
                value += card;
            }
            if (card.value === "J" || card.value === "Q" || card.value === "K") {
                value += 10;
            }
            if (card.value === "A") {
                value += 11;
            }
            
            while (aceCount > 0) {
                if (value > 21) {
                    value -= 10;
                    aceCount -= 1;
                }
                else {
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
            active: false
        });

        this.state.status = "IN_PROGRESS";
    }


   /**
   * Adds a player to a queue to leave the game.
   * The player will be removed after the current hand finishes.
   * @param player The player to remove from the game
   * @throws InvalidParametersError if the player is not in the game (PLAYER_NOT_IN_GAME_MESSAGE)
   */
    protected _leave(player: Player): void {
        if (!(this.state.hands.map(h => h.player).includes(player.id))) {
            throw new InvalidParametersError(PLAYER_NOT_IN_GAME_MESSAGE);
        }
        this.state.wantsToLeave.push(player.id);
    }
}