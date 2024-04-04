import Shuffler from './Shuffler';

describe('Shuffler', () => {
  let casinoShuffler: Shuffler;

  beforeEach(() => {
    casinoShuffler = new Shuffler([
      { type: 'Clubs', value: 9, faceUp: true },
      { type: 'Hearts', value: 'A', faceUp: false },
    ]);
  });

  describe('deal', () => {
    test('Should deal the top card of the deck', () => {
      expect(casinoShuffler.deck.length).toBe(2);
      expect(casinoShuffler.deal(true)).toEqual({ type: 'Hearts', value: 'A', faceUp: true });
      expect(casinoShuffler.deck.length).toBe(1);
      expect(casinoShuffler.deal(false)).toEqual({ type: 'Clubs', value: 9, faceUp: false });
    });
    test('Dealing the entire deck causes a reshuffle', () => {
      casinoShuffler.deal(true);
      casinoShuffler.deal(true);
      expect(casinoShuffler.deck.length).toBe(0);
      casinoShuffler.deal(true);
      expect(casinoShuffler.deck.length).toBe(51);
    });
  });

  describe('refresh', () => {
    test('reshuffling a deck should assemble 52 unique cards', () => {
      casinoShuffler.deal(true);
      casinoShuffler.deal(false);
      expect(casinoShuffler.deck.length).not.toBe(52);
      casinoShuffler.refresh();
      expect(casinoShuffler.deck.length).toBe(52);

      const setDeck = new Set(casinoShuffler.deck);
      expect(setDeck.size).toBe(52);
    });
    test('refreshing a deck causes the cards to be shuffled differently', () => {
      const shuffledDeck1 = casinoShuffler.deck;
      casinoShuffler.refresh();
      expect(shuffledDeck1).not.toEqual(casinoShuffler.deck);
    });
  });
});
