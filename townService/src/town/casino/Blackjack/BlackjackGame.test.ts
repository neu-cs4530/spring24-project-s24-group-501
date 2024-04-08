import {
  GAME_FULL_MESSAGE,
  GAME_NOT_BETTABLE_MESSAGE,
  GAME_NOT_IN_PROGRESS_MESSAGE,
  INSUFFICIENT_UNITS_MESSAGE,
  INVALID_BET_MESSAGE,
  INVALID_MOVE_MESSAGE,
  MOVE_NOT_YOUR_TURN_MESSAGE,
  PLAYER_ALREADY_IN_GAME_MESSAGE,
  PLAYER_NOT_ACTIVE_MESSAGE,
  PLAYER_NOT_IN_GAME_MESSAGE,
} from '../../../lib/InvalidParametersError';
import { createPlayerForTesting } from '../../../TestUtils';
import {
  BlackjackAction,
  Card,
  FaceValue,
  NumberValue,
  Player,
} from '../../../types/CoveyTownSocket';
import BlackjackGame from './BlackjackGame';
import Shuffler from '../Shuffler';

jest.setTimeout(100000);

function handValue(cards: Card[]): number {
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

describe('BlackjackGame', () => {
  let game: BlackjackGame;
  const player1 = createPlayerForTesting();
  const player2 = createPlayerForTesting();
  const player3 = createPlayerForTesting();
  const player4 = createPlayerForTesting();

  beforeEach(() => {
    game = new BlackjackGame(10);
    player1.units = 1000;
    player2.units = 1000;
    player3.units = 1000;
    player4.units = 1000;
  });

  describe('join', () => {
    it('should throw an error if the player is already in the game', () => {
      game.join(player1);
      expect(() => game.join(player1)).toThrowError(PLAYER_ALREADY_IN_GAME_MESSAGE);
    });
    it('should throw an error if the table is full', () => {
      game.join(player1);
      game.join(player2);
      game.join(player3);
      game.join(player4);
      expect(() => game.join(createPlayerForTesting())).toThrowError(GAME_FULL_MESSAGE);
    });
    it('the state should be updated once the first player joins', () => {
      expect(game.state.hands).toEqual([]);
      expect(game.state.status).toBe('WAITING_FOR_PLAYERS');
      game.join(player1);
      expect(game.state.hands[0]).toEqual({
        player: player1.id,
        currentHand: 0,
        active: true,
        hands: [{ cards: [], outcome: undefined, text: '', wager: 0 }],
      });
      expect(game.state.status).toBe('WAITING_TO_START');
      game.placeBet(player1, 10);
      expect(game.state.status).toBe('IN_PROGRESS');
    });
    it('the state should remain unchanged once it has started', () => {
      game.join(player1);
      expect(game.state.status).toBe('WAITING_TO_START');
      game.join(player2);
      expect(game.state.status).toBe('WAITING_TO_START');
      game.placeBet(player1, 10);
      game.placeBet(player2, 10);
      expect(game.state.status).toBe('IN_PROGRESS');
      game.join(player3);
      expect(game.state.status).toBe('IN_PROGRESS');
      expect(game.state.hands[0]).toEqual({
        player: player3.id,
        currentHand: 0,
        active: false,
        hands: [{ cards: [], outcome: undefined, text: '', wager: 0 }],
      });
    });
    it('when multiple players join, they should be added to the front of the table', () => {
      game.join(player1);
      expect(game.state.hands[0]).toEqual({
        player: player1.id,
        currentHand: 0,
        active: true,
        hands: [{ cards: [], outcome: undefined, text: '', wager: 0 }],
      });
      expect(game.state.hands.length).toBe(1);
      game.join(player2);
      expect(game.state.hands[0]).toEqual({
        player: player2.id,
        currentHand: 0,
        active: true,
        hands: [{ cards: [], outcome: undefined, text: '', wager: 0 }],
      });
      expect(game.state.hands.length).toBe(2);
      game.join(player3);
      expect(game.state.hands[0]).toEqual({
        player: player3.id,
        currentHand: 0,
        active: true,
        hands: [{ cards: [], outcome: undefined, text: '', wager: 0 }],
      });
      expect(game.state.hands.length).toBe(3);
      game.join(player4);
      expect(game.state.hands[0]).toEqual({
        player: player4.id,
        currentHand: 0,
        active: true,
        hands: [{ cards: [], outcome: undefined, text: '', wager: 0 }],
      });
      expect(game.state.hands.length).toBe(4);
    });
  });
  describe('placeBet', () => {
    beforeEach(() => {
      game.join(player1);
      game.join(player2);
    });

    it('should throw an error if the bet is not an increment of the table stake', () => {
      expect(() => game.placeBet(player1, 12)).toThrowError(INVALID_BET_MESSAGE);
    });
    it('should throw an error if the bet is below the minimum table stake', () => {
      expect(() => game.placeBet(player1, 0)).toThrowError(INVALID_BET_MESSAGE);
    });
    it('should throw an error if the bet is above 10x the minimum table stake', () => {
      expect(() => game.placeBet(player1, 110)).toThrowError(INVALID_BET_MESSAGE);
    });
    it('should throw an error if the player is not in the game', () => {
      const player5 = createPlayerForTesting();
      player5.units = 1000;
      expect(() => game.placeBet(player5, 20)).toThrowError(PLAYER_NOT_IN_GAME_MESSAGE);
    });
    it('should throw an error if the player does not have enough units for their ante', () => {
      player1.units = 5;
      expect(() => game.placeBet(player1, 10)).toThrowError(INSUFFICIENT_UNITS_MESSAGE);
    });
    it('should throw an error if the game is not waiting to start', () => {
      const unstartedGame = new BlackjackGame(10);
      expect(unstartedGame.state.status).toBe('WAITING_FOR_PLAYERS');
      expect(() => unstartedGame.placeBet(player1, 20)).toThrowError(GAME_NOT_BETTABLE_MESSAGE);
    });
    it('should update the players ante once a bet has been placed', () => {
      expect(game.state.hands[0].hands[0].wager).toBe(0);
      game.placeBet(player2, 20);
      expect(game.state.hands[0].hands[0].wager).toBe(20);

      expect(game.state.hands[1].hands[0].wager).toBe(0);
      game.placeBet(player1, 30);
      expect(game.state.hands[1].hands[0].wager).toBe(30);
    });
    it('should start the game once all players have placed a bet', () => {
      expect(game.state.status).toBe('WAITING_TO_START');
      expect(game.state.hands[0].hands[0].cards.length).toBe(0);
      expect(game.state.hands[1].hands[0].cards.length).toBe(0);
      expect(game.state.dealerHand.cards.length).toBe(0);
      game.placeBet(player1, 10);
      game.placeBet(player2, 10);
      expect(game.state.hands[0].hands[0].cards.length).toBe(2);
      expect(game.state.hands[1].hands[0].cards.length).toBe(2);
      expect(game.state.dealerHand.cards.length).toBe(2);
      expect(game.state.status).toBe('IN_PROGRESS');
    });
  });

  describe('leave', () => {
    beforeEach(() => {
      game.join(player1);
      game.join(player2);
    });

    it('should throw an error if the player is not in the game', () => {
      expect(() => game.leave(createPlayerForTesting())).toThrowError(PLAYER_NOT_IN_GAME_MESSAGE);
    });
    it('if the game is not in progress, the player should be removed from the game', () => {
      expect(game.state.status).toBe('WAITING_TO_START');
      expect(game.state.hands).toEqual([
        {
          player: player2.id,
          active: true,
          currentHand: 0,
          hands: [{ cards: [], outcome: undefined, text: '', wager: 0 }],
        },
        {
          player: player1.id,
          active: true,
          currentHand: 0,
          hands: [{ cards: [], outcome: undefined, text: '', wager: 0 }],
        },
      ]);
      game.leave(player1);
      expect(game.state.status).toBe('WAITING_TO_START');
      expect(game.state.hands).toEqual([
        {
          player: player2.id,
          active: true,
          currentHand: 0,
          hands: [{ cards: [], outcome: undefined, text: '', wager: 0 }],
        },
      ]);
      game.leave(player2);
      expect(game.state.status).toBe('WAITING_FOR_PLAYERS');
      expect(game.state.hands).toEqual([]);
    });
    it('if the game is in progress, the player should be added to a queue to leave the game', () => {
      game.placeBet(player1, 10);
      game.placeBet(player2, 10);
      expect(game.state.status).toBe('IN_PROGRESS');
      expect(game.state.hands.length).toBe(2);
      expect(game.state.wantsToLeave).toEqual([]);
      game.leave(player2);
      expect(game.state.hands.length).toBe(2);
      expect(game.state.wantsToLeave).toEqual([player2.id]);
      game.leave(player1);
      expect(game.state.hands.length).toBe(2);
      expect(game.state.wantsToLeave).toEqual([player2.id, player1.id]);
      expect(game.state.status).toBe('IN_PROGRESS');
    });
  });

  describe('applyMove', () => {
    beforeEach(() => {
      game.join(player1);
      game.join(player3);
      game.join(player2);
      game.placeBet(player1, 10);
      game.placeBet(player2, 100);
      game.placeBet(player3, 50);
    });
    describe('should throw an error', () => {
      it('if the game is not in progress', () => {
        const unstartedGame = new BlackjackGame(10);
        expect(unstartedGame.state.status).toBe('WAITING_FOR_PLAYERS');
        expect(() =>
          unstartedGame.applyMove({
            playerID: player1.id,
            gameID: game.id,
            move: {
              player: player1.id,
              action: 'Hit',
            },
          }),
        ).toThrowError(GAME_NOT_IN_PROGRESS_MESSAGE);
      });
      it('if the player is not in the game', () => {
        expect(() =>
          game.applyMove({
            playerID: createPlayerForTesting().id,
            gameID: game.id,
            move: {
              player: createPlayerForTesting().id,
              action: 'Hit',
            },
          }),
        ).toThrowError(PLAYER_NOT_IN_GAME_MESSAGE);
      });
      it('if is not the current players turn', () => {
        expect(game.state.currentPlayer).toBe(0);
        expect(() =>
          game.applyMove({
            playerID: player1.id,
            gameID: game.id,
            move: {
              player: player1.id,
              action: 'Hit',
            },
          }),
        ).toThrowError(MOVE_NOT_YOUR_TURN_MESSAGE);
      });
      it('if the player is inactive', () => {
        game.state.hands[0].active = false;
        expect(() =>
          game.applyMove({
            playerID: player2.id,
            gameID: game.id,
            move: {
              player: player2.id,
              action: 'Hit',
            },
          }),
        ).toThrowError(PLAYER_NOT_ACTIVE_MESSAGE);
      });
      it('if the player tries doubling down when they dont have two cards', () => {
        game.state.hands[0].hands[0].cards.push({
          type: 'Hearts',
          value: 'Q' as FaceValue,
          faceUp: true,
        });
        expect(() =>
          game.applyMove({
            playerID: player2.id,
            gameID: game.id,
            move: {
              player: player2.id,
              action: 'Double Down',
            },
          }),
        ).toThrowError(INVALID_MOVE_MESSAGE);
      });
      it('if the player tries doubling down when they dont have enough units', () => {
        player2.units = 150;
        expect(game.state.hands[0].hands[0].wager).toBe(100);
        expect(() =>
          game.applyMove({
            playerID: player2.id,
            gameID: game.id,
            move: {
              player: player2.id,
              action: 'Double Down',
            },
          }),
        ).toThrowError(INSUFFICIENT_UNITS_MESSAGE);
      });
      it('if the player tries splitting when they dont have two of the same valued cards', () => {
        game.state.hands[0].hands[0].cards = [
          { type: 'Hearts', value: 5 as NumberValue, faceUp: true },
          { type: 'Diamonds', value: 9 as NumberValue, faceUp: true },
        ];
        expect(game.state.hands[0].hands[0].cards[0].value).not.toBe(
          game.state.hands[0].hands[0].cards[1].value,
        );
        expect(() =>
          game.applyMove({
            playerID: player2.id,
            gameID: game.id,
            move: {
              player: player2.id,
              action: 'Split',
            },
          }),
        ).toThrowError(INVALID_MOVE_MESSAGE);
      });
      it('if the player tries splitting when they already split', () => {
        const hand = game.state.hands[0].hands[0];
        game.state.hands[0].hands[1] = hand;
        expect(() =>
          game.applyMove({
            playerID: player2.id,
            gameID: game.id,
            move: {
              player: player2.id,
              action: 'Split',
            },
          }),
        ).toThrowError(INVALID_MOVE_MESSAGE);
      });
      it('if the player tries splitting when they dont have enough units', () => {
        const card = game.state.hands[0].hands[0].cards[0];
        game.state.hands[0].hands[0].cards[1] = card;
        player2.units = 150;
        expect(game.state.hands[0].hands[0].wager).toBe(100);
        expect(() =>
          game.applyMove({
            playerID: player2.id,
            gameID: game.id,
            move: {
              player: player2.id,
              action: 'Split',
            },
          }),
        ).toThrowError(INSUFFICIENT_UNITS_MESSAGE);
      });
    });
    describe('for moves that do not end the current round', () => {
      describe('when the player stands', () => {
        beforeEach(() => {});
        const standMove = () => {
          game.applyMove({
            playerID: player2.id,
            gameID: game.id,
            move: {
              player: player2.id,
              action: 'Stand',
            },
          });
        };
        it('should not be dealt any cards', () => {
          expect(game.state.hands[0].hands[0].cards.length).toBe(2);
          standMove();
          expect(game.state.hands[0].hands[0].cards.length).toBe(2);
        });
        it('if the player has another hand, should move to that', () => {
          const hand = game.state.hands[0].hands[0];
          game.state.hands[0].hands[1] = hand;
          expect(game.state.currentPlayer).toBe(0);
          expect(game.state.hands[0].currentHand).toBe(0);
          standMove();
          expect(game.state.currentPlayer).toBe(0);
          expect(game.state.hands[0].currentHand).toBe(1);
        });
        it('if the player has no more active hands, should set their status to inactive and find the next active player', () => {
          expect(game.state.currentPlayer).toBe(0);
          expect(game.state.hands[0].hands.length).toBe(1);
          expect(game.state.hands[0].active).toBe(true);
          standMove();
          expect(game.state.currentPlayer).toBe(1);
          expect(game.state.hands[0].active).toBe(false);
        });
      });
      describe('when the player hits', () => {
        const hitMove = () => {
          game.applyMove({
            playerID: player2.id,
            gameID: game.id,
            move: {
              player: player2.id,
              action: 'Hit',
            },
          });
        };
        beforeEach(() => {
          game.state.hands[0].hands[0].cards = [
            { type: 'Hearts', value: 5 as NumberValue, faceUp: true },
            { type: 'Diamonds', value: 9 as NumberValue, faceUp: true },
          ];
          game.state.hands[0].hands[0].text = '14';
          game.state.shuffler = new Shuffler([
            { type: 'Clubs', value: 'Q' as FaceValue, faceUp: true },
            { type: 'Spades', value: 3 as NumberValue, faceUp: true },
            { type: 'Clubs', value: 3 as NumberValue, faceUp: true },
          ]);
        });
        it('should add a card to the players hand', () => {
          expect(game.state.hands[0].hands[0].cards.length).toBe(2);
          hitMove();
          expect(game.state.hands[0].hands[0].cards.length).toBe(3);
        });
        it('if the players hand value is less than 21, should be able to hit again', () => {
          expect(game.state.hands[0].hands[0].text).toBe('14');
          expect(game.state.hands[0].hands[0].outcome).toBeUndefined();
          expect(game.state.hands[0].active).toBe(true);
          hitMove();
          expect(game.state.hands[0].hands[0].text).toBe('17');
          expect(game.state.hands[0].hands[0].outcome).toBeUndefined();
          expect(game.state.hands[0].active).toBe(true);
          hitMove();
          expect(game.state.hands[0].hands[0].text).toBe('20');
          expect(game.state.hands[0].hands[0].outcome).toBeUndefined();
          expect(game.state.hands[0].active).toBe(true);
        });
        it('if the players hand value exceeds 21, should register a bust', () => {
          hitMove();
          hitMove();
          expect(game.state.hands[0].hands[0].outcome).toBeUndefined();
          expect(handValue(game.state.hands[0].hands[0].cards) <= 21).toBe(true);
          expect(game.state.hands[0].active).toBe(true);
          hitMove();
          expect(game.state.hands[0].hands[0].outcome).toBe('Bust');
          expect(handValue(game.state.hands[0].hands[0].cards) > 21).toBe(true);
          expect(game.state.hands[0].active).toBe(false);
        });
      });
      describe('when the player doubles down', () => {
        const doubleDownMove = () => {
          game.applyMove({
            playerID: player2.id,
            gameID: game.id,
            move: {
              player: player2.id,
              action: 'Double Down',
            },
          });
        };
        beforeEach(() => {
          game.state.hands[0].hands[0].cards = [
            { type: 'Hearts', value: 3 as NumberValue, faceUp: true },
            { type: 'Diamonds', value: 9 as NumberValue, faceUp: true },
          ];
          game.state.shuffler = new Shuffler([
            { type: 'Clubs', value: 'Q' as FaceValue, faceUp: true },
          ]);
        });
        it('should be delt a card and double their wager', () => {
          expect(game.state.hands[0].hands[0].cards.length).toBe(2);
          expect(game.state.hands[0].hands[0].wager).toBe(100);
          doubleDownMove();
          expect(game.state.hands[0].hands[0].cards.length).toBe(3);
          expect(game.state.hands[0].hands[0].wager).toBe(200);
        });
        it('should make the players hand inactive', () => {
          expect(game.state.hands[0].active).toBe(true);
          expect(game.state.hands[0].currentHand).toBe(0);
          doubleDownMove();
          expect(game.state.hands[0].active).toBe(false);
          expect(game.state.hands[0].currentHand).toBe(1);
        });
        it('if the players hand value exceeds 21, should register a bust', () => {
          expect(game.state.hands[0].hands[0].outcome).toBeUndefined();
          expect(handValue(game.state.hands[0].hands[0].cards) > 21).toBe(false);
          doubleDownMove();
          expect(game.state.hands[0].hands[0].outcome).toBe('Bust');
          expect(handValue(game.state.hands[0].hands[0].cards) > 21).toBe(true);
        });
      });
      describe('when the player splits', () => {
        const splitMove = () => {
          game.applyMove({
            playerID: player2.id,
            gameID: game.id,
            move: {
              player: player2.id,
              action: 'Split',
            },
          });
        };
        let jackDiamonds: Card;
        let jackSpades: Card;
        beforeEach(() => {
          jackDiamonds = { type: 'Diamonds', value: 'J' as FaceValue, faceUp: true };
          jackSpades = { type: 'Spades', value: 'J' as FaceValue, faceUp: true };
          game.state.hands[0].hands[0].cards = [jackDiamonds, jackSpades];
          game.state.hands[0].hands[0].text = '20';
          game.state.shuffler = new Shuffler([
            { type: 'Diamonds', value: 'A' as FaceValue, faceUp: true },
            { type: 'Hearts', value: 7 as NumberValue, faceUp: true },
          ]);
        });
        it('should register a second hand', () => {
          expect(game.state.hands[0].hands.length).toBe(1);
          expect(game.state.hands[0].currentHand).toBe(0);
          expect(game.state.hands[0].active).toBe(true);
          splitMove();
          expect(game.state.hands[0].hands.length).toBe(2);
          expect(game.state.hands[0].currentHand).toBe(0);
          expect(game.state.hands[0].active).toBe(true);
        });
        it('should deal a new card to each hand with same wager and updated text', () => {
          expect(game.state.hands[0].hands[0]).toEqual({
            cards: [jackDiamonds, jackSpades],
            wager: 100,
            text: '20',
            outcome: undefined,
          });
          expect(game.state.hands[0].hands[1]).toBeUndefined();
          splitMove();
          expect(game.state.hands[0].hands[0]).toEqual({
            cards: [jackDiamonds, { type: 'Hearts', value: 7 as NumberValue, faceUp: true }],
            wager: 100,
            text: '17',
            outcome: undefined,
          });
          expect(game.state.hands[0].hands[1]).toEqual({
            cards: [jackSpades, { type: 'Diamonds', value: 'A' as FaceValue, faceUp: true }],
            wager: 100,
            text: '21/11',
            outcome: undefined,
          });
        });
      });
    });
    describe('for moves that do end the current round', () => {
      const applyMove = (player: Player, action: BlackjackAction) => {
        game.applyMove({
          playerID: player.id,
          gameID: game.id,
          move: {
            player: player.id,
            action,
          },
        });
      };
      const finalMove = () => {
        applyMove(player1, 'Stand');
      };
      beforeEach(() => {
        // player2
        game.state.hands[0].hands[0].cards = [
          { type: 'Clubs', value: 10 as NumberValue, faceUp: true },
          { type: 'Spades', value: 2 as NumberValue, faceUp: true },
        ];
        // player3
        game.state.hands[1].hands[0].cards = [
          { type: 'Hearts', value: 3 as NumberValue, faceUp: true },
          { type: 'Diamonds', value: 4 as NumberValue, faceUp: true },
        ];
        // player1
        game.state.hands[2].hands[0].cards = [
          { type: 'Hearts', value: 7 as NumberValue, faceUp: true },
          { type: 'Spades', value: 9 as NumberValue, faceUp: true },
        ];
        game.state.hands[2].hands[0].text = '16';
        // dealer
        game.state.dealerHand.cards = [
          { type: 'Clubs', value: 'J' as FaceValue, faceUp: false },
          { type: 'Spades', value: 2 as NumberValue, faceUp: true },
        ];
        game.state.dealerHand.text = '12';
        game.state.shuffler = new Shuffler([
          { type: 'Diamonds', value: 3 as NumberValue, faceUp: true },
          { type: 'Clubs', value: 3 as NumberValue, faceUp: true },
          { type: 'Diamonds', value: 'A' as FaceValue, faceUp: true },
          { type: 'Hearts', value: 'Q' as FaceValue, faceUp: true },
        ]);
        applyMove(player2, 'Hit');
        applyMove(player3, 'Hit');
        applyMove(player3, 'Stand');
      });
      it('should deal cards to the dealer while the hand value is less than 17', async () => {
        expect(game.state.dealerHand).toEqual({
          cards: [
            { type: 'Clubs', value: 'J' as FaceValue, faceUp: false },
            { type: 'Spades', value: 2 as NumberValue, faceUp: true },
          ],
          text: '12',
          bust: false,
        });
        finalMove();
        await new Promise<void>(resolve => {
          setTimeout(() => {
            resolve();
          }, 4000);
        });
        expect(game.state.dealerHand).toEqual({
          cards: [
            { type: 'Clubs', value: 'J' as FaceValue, faceUp: true },
            { type: 'Spades', value: 2 as NumberValue, faceUp: true },
            { type: 'Clubs', value: 3 as NumberValue, faceUp: true },
            { type: 'Diamonds', value: 3 as NumberValue, faceUp: true },
          ],
          text: '18',
          bust: false,
        });
      });
      it('should detract the players wager if they busted', async () => {
        expect(game.state.hands[0].hands[0].outcome).toBe('Bust');
        expect(game.state.hands[0].hands[0].wager).toBe(100);
        expect(player2.units).toBe(1000);
        finalMove();
        await new Promise<void>(resolve => {
          setTimeout(() => {
            resolve();
          }, 4000);
        });
        expect(player2.units).toBe(900);
      });
      it('should detract the players wager if their hand value is less than the dealers', async () => {
        expect(game.state.hands[2].hands[0].wager).toBe(10);
        const playerHandValue = handValue(game.state.hands[2].hands[0].cards);
        expect(player1.units).toBe(1000);
        finalMove();
        await new Promise<void>(resolve => {
          setTimeout(() => {
            resolve();
          }, 4000);
        });
        expect(playerHandValue < handValue(game.state.dealerHand.cards)).toBe(true);
        expect(player1.units).toBe(990);
      });
      it('should add the players wager if their hand value is greater than the dealers', async () => {
        game.state.hands[1].hands[0].cards.push({
          type: 'Spades',
          value: 2 as NumberValue,
          faceUp: true,
        });
        expect(game.state.hands[1].hands[0].wager).toBe(50);
        const playerHandValue = handValue(game.state.hands[0].hands[0].cards);
        expect(game.state.hands[1].hands[0].outcome).toBeUndefined();
        expect(player3.units).toBe(1000);
        finalMove();
        await new Promise<void>(resolve => {
          setTimeout(() => {
            resolve();
          }, 4000);
        });
        expect(playerHandValue > handValue(game.state.dealerHand.cards)).toBe(true);
        expect(player3.units).toBe(1050);
      });
      it('should not change their units if their hand value is the same as the dealers', async () => {
        const playerHandValue = handValue(game.state.hands[1].hands[0].cards);
        expect(game.state.hands[1].hands[0].outcome).toBeUndefined();
        expect(player3.units).toBe(1000);
        finalMove();
        await new Promise<void>(resolve => {
          setTimeout(() => {
            resolve();
          }, 4000);
        });
        expect(playerHandValue === handValue(game.state.dealerHand.cards)).toBe(true);
        expect(player3.units).toBe(1000);
      });
      it('the players currency change should reflect the net of all their hands', async () => {
        const hand1 = game.state.hands[0].hands[0];
        game.state.hands[0].hands.push(hand1);
        expect(game.state.hands[0].hands[0].wager).toBe(100);
        expect(game.state.hands[0].hands[1].wager).toBe(100);
        expect(player2.units).toBe(1000);
        finalMove();
        await new Promise<void>(resolve => {
          setTimeout(() => {
            resolve();
          }, 4000);
        });
        expect(player2.units).toBe(800);
      });
      it('if all players leave, the status should revert to WAITING_FOR_PLAYERS', async () => {
        game.leave(player1);
        game.leave(player2);
        game.leave(player3);
        expect(game.state.status).toBe('IN_PROGRESS');
        expect(game.state.wantsToLeave).toEqual([player1.id, player2.id, player3.id]);
        expect(game.state.hands.length).toBe(3);
        finalMove();
        await new Promise<void>(resolve => {
          setTimeout(() => {
            resolve();
          }, 10000);
        });
        expect(game.state.status).toBe('WAITING_FOR_PLAYERS');
        expect(game.state.wantsToLeave).toEqual([]);
        expect(game.state.hands.length).toBe(0);
      });
      it('if not all players leave, the status should revert to WAITING_TO_START', async () => {
        game.leave(player1);
        expect(game.state.status).toBe('IN_PROGRESS');
        expect(game.state.wantsToLeave).toEqual([player1.id]);
        expect(game.state.hands.length).toBe(3);
        finalMove();
        await new Promise<void>(resolve => {
          setTimeout(() => {
            resolve();
          }, 10000);
        });
        expect(game.state.status).toBe('WAITING_TO_START');
        expect(game.state.wantsToLeave).toEqual([]);
        expect(game.state.hands.length).toBe(2);
      });
      it('state should be OVER while the dealer is dealing', () => {
        expect(game.state.status).toBe('IN_PROGRESS');
        finalMove();
        expect(game.state.status).toBe('OVER');
      });
      it('should reset the information of all remaining players', async () => {
        expect(game.state.hands).toEqual([
          {
            player: player2.id,
            hands: [
              {
                cards: [
                  { type: 'Clubs', value: 10 as NumberValue, faceUp: true },
                  { type: 'Spades', value: 2 as NumberValue, faceUp: true },
                  { type: 'Hearts', value: 'Q' as FaceValue, faceUp: true },
                ],
                outcome: 'Bust',
                wager: 100,
                text: '22',
              },
            ],
            currentHand: 1,
            active: false,
          },
          {
            player: player3.id,
            hands: [
              {
                cards: [
                  { type: 'Hearts', value: 3 as NumberValue, faceUp: true },
                  { type: 'Diamonds', value: 4 as NumberValue, faceUp: true },
                  { type: 'Diamonds', value: 'A' as FaceValue, faceUp: true },
                ],
                outcome: undefined,
                wager: 50,
                text: '18/8',
              },
            ],
            currentHand: 1,
            active: false,
          },
          {
            player: player1.id,
            hands: [
              {
                cards: [
                  { type: 'Hearts', value: 7 as NumberValue, faceUp: true },
                  { type: 'Spades', value: 9 as NumberValue, faceUp: true },
                ],
                outcome: undefined,
                wager: 10,
                text: '16',
              },
            ],
            currentHand: 0,
            active: true,
          },
        ]);
        expect(game.state.dealerHand.cards.length > 0).toBe(true);
        finalMove();
        await new Promise<void>(resolve => {
          setTimeout(() => {
            resolve();
          }, 10000);
        });
        expect(game.state.hands).toEqual([
          {
            player: player2.id,
            hands: [
              {
                cards: [],
                outcome: undefined,
                wager: 0,
                text: '',
              },
            ],
            currentHand: 0,
            active: true,
          },
          {
            player: player3.id,
            hands: [
              {
                cards: [],
                outcome: undefined,
                wager: 0,
                text: '',
              },
            ],
            currentHand: 0,
            active: true,
          },
          {
            player: player1.id,
            hands: [
              {
                cards: [],
                outcome: undefined,
                wager: 0,
                text: '',
              },
            ],
            currentHand: 0,
            active: true,
          },
        ]);
        expect(game.state.dealerHand).toEqual({
          cards: [],
          text: '',
          bust: false,
        });
      });
    });
  });
  describe('setPlayerPhoto', () => {
    it('should update the players photo', () => {
      game.join(player1);
      expect(game.state.hands[0].photo).toBeUndefined();
      game.setPlayerPhoto(player1.id, 'newBase64Photo');
      expect(game.state.hands[0].photo).toBe('newBase64Photo');
    });
  });
});
