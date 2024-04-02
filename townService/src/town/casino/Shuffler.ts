import { INVALID_SHUFFLER_STATE_MESSAGE } from '../../lib/InvalidParametersError';
import { Card, NumberValue, FaceValue, Suit } from '../../types/CoveyTownSocket';

export default class Shuffler {
  private _deck: Card[];

  public constructor(deck?: Card[]) {
    if (deck) {
      this._deck = deck;
    } else {
      this._deck = this._assembleCards();
      this._shuffle();
    }
  }

  public get deck(): Card[] {
    return this._deck;
  }

  public deal(faceUp: boolean): Card {
    if (this.deck.length === 0) {
      this.refresh();
    }
    const topCard = this._deck.pop();
    if (topCard) {
      topCard.faceUp = faceUp;
      return topCard;
    }
    throw new Error(INVALID_SHUFFLER_STATE_MESSAGE);
  }

  public refresh() {
    this._deck = this._assembleCards();
    this._shuffle();
  }

  private _assembleCards(): Card[] {
    const newDeck: Card[] = [];

    const suits: Suit[] = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
    const faceVals: FaceValue[] = ['J', 'Q', 'K', 'A'];

    suits.forEach(suit => {
      for (let numVal = 2; numVal <= 10; numVal++) {
        newDeck.push({ type: suit, value: numVal as NumberValue, faceUp: true });
      }
      faceVals.forEach(faceVal => {
        newDeck.push({ type: suit, value: faceVal, faceUp: true });
      });
    });

    return newDeck;
  }

  private _shuffle(): void {
    const shuffledDeck = this.deck.slice();
    for (let i = shuffledDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledDeck[i], shuffledDeck[j]] = [shuffledDeck[j], shuffledDeck[i]]; // Swap elements
    }
    this._deck = shuffledDeck;
  }
}
