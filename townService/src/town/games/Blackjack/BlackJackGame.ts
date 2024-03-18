import Player from "../../../lib/Player";
import { BlackjackMove, Card, CasinoState, GameMove } from "../../../types/CoveyTownSocket";
import Game from "../Game";
import Shuffler from "./Shuffler";


/**
 * A BlackJackGame is a Game that implements the rules ofBlackJack.
 */
export default class BlackJackGame extends Game<CasinoState, BlackjackMove> {
    public constructor() {
      super({
          hands: [],
          status: 'WAITING_TO_START',
          dealerHand: [],
          results: [],
          shuffler: new Shuffler(),
      });
    }

    /**
     * Apply Move: Were going to appky a blackjack move to game
     */
    private _applyMove(move: BlackjackMove): void {
        var newHand = null
        var index = 0;
        var counter = 0
        for(let object of this.state.hands) {
            if (object.player == move.player) {
                if (!object.active) {
                    throw new Error("Player is not active");
                }
                else if (move.action === "Stand") {
                    object.active = false;
                }
                else if (move.action === "Hit") {
                    object.hand.push(this.state.shuffler.deal());
                    if (this.handValue(object.hand) > 21) {
                        object.active = false;
                    }
                }
                else if (move.action === "Double Down") {
                    object.hand.push(this.state.shuffler.deal());
                    object.ante *= 2;
                    object.active = false;
                }
                else if (move.action === "Split") {
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

        if (newHand !== null) {
            this.state.hands.splice(index,0,newHand)
        }
    }

    private handValue(cards: Card[]) : number {
        var value = 0;
        for (let card of cards) {
            if (typeof(card) == "number") {
                value += card;
            }
            if (card.value === "J" || card.value === "Q" || card.value === "K") {
                value += 10;
            }
            if (card.value === "A" && value + 11 <= 21) {
                value += 11;
            }
            if (card.value === "A" && value + 11 > 21) {
                value += 1;
            }
        }
        return value;
    }
}