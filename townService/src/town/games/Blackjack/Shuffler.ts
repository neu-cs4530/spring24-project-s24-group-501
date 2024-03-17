import { Card, NumberValue, FaceValue, Suit } from "../../../types/CoveyTownSocket";

export default class Shuffler {
    private _deck: Card[]

    public constructor() {
        this._deck = this.assembleCards();
        this.shuffle()
    }

    public deal(faceUp: boolean): Card {
        if (this._deck.length === 0) {
            this._deck = this.assembleCards();
            this.shuffle()
        }
        let topCard = this._deck.pop()
        if (topCard) {
            topCard.faceUp = faceUp
            return topCard
        }
        throw new Error('TODO CUSTOM MSG')
    }

    private assembleCards(): Card[] {
        const newDeck: Card[] = []

        const suits: Suit[] = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
        const faceVals: FaceValue[] = ['J', 'Q', 'K', 'A'];

        suits.forEach(suit => {
            for (let numVal = 2; numVal <= 10; numVal++) {
                newDeck.concat({type: suit, value: numVal as NumberValue, faceUp: true})
            }
            faceVals.forEach(faceVal => {
                newDeck.concat({type: suit, value: faceVal, faceUp: true})
            })
        });

        return newDeck
    }

    private shuffle(): void {
        const shuffledDeck = this._deck.slice();
        for (let i = shuffledDeck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledDeck[i], shuffledDeck[j]] = [shuffledDeck[j], shuffledDeck[i]]; // Swap elements
        }
        this._deck = shuffledDeck
    }
}