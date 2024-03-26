import {
  GAME_FULL_MESSAGE,
  GAME_NOT_IN_PROGRESS_MESSAGE,
  INVALID_BET_MESSAGE,
  PLAYER_ALREADY_IN_GAME_MESSAGE,
  PLAYER_NOT_IN_GAME_MESSAGE,
} from '../../../lib/InvalidParametersError';
import { createPlayerForTesting } from '../../../TestUtils';
import { BlackjackMove, Player } from '../../../types/CoveyTownSocket';
import BlackjackGame from './BlackJackGame';
import Shuffler from './Shuffler';

function createGameFromPattern(game: BlackjackGame, moves: BlackjackMove[]) {
  for (const move of moves) {
    try {
      game.applyMove({
        playerID: move.player,
        gameID: game.id,
        move,
      });
    } catch (error) {
      console.error('Unable to apply pattern: ', error);
    }
  }
}

describe('BlackjackGame', () => {
  let game: BlackjackGame;
  const player1 = createPlayerForTesting();
  const player2 = createPlayerForTesting();
  const player3 = createPlayerForTesting();
  const player4 = createPlayerForTesting();

  beforeEach(() => {
    game = new BlackjackGame(10);
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
    it('should throw an error if the bet is above 5x the minimum table stake', () => {
      expect(() => game.placeBet(player1, 60)).toThrowError(INVALID_BET_MESSAGE);
    });
    it('should throw an error if the player is not in the game', () => {
      expect(() => game.placeBet(createPlayerForTesting(), 20)).toThrowError(
        PLAYER_NOT_IN_GAME_MESSAGE,
      );
    });
    it('should update the players ante once a bet has been placed', () => {
      expect(game.state.hands[0].ante).toBe(0);
      game.placeBet(player2, 20);
      expect(game.state.hands[0].ante).toBe(20);

      expect(game.state.hands[1].ante).toBe(0);
      game.placeBet(player1, 30);
      expect(game.state.hands[1].ante).toBe(30);
    });
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
    it('the state should be updated once a player joins', () => {
      expect(game.state.hands).toEqual([]);
      expect(game.state.status).toBe('WAITING_FOR_PLAYERS');
      game.join(player1);
      expect(game.state.hands).toEqual([{ player: player1.id, active: false, ante: 0, hand: [] }]);
      expect(game.state.status).toBe('IN_PROGRESS');
    });
    it('when multiple players join, they should be added to the front of the table', () => {
      game.join(player1);
      expect(game.state.hands).toEqual([{ player: player1.id, active: false, ante: 0, hand: [] }]);
      game.join(player2);
      expect(game.state.hands).toEqual([
        { player: player2.id, active: false, ante: 0, hand: [] },
        { player: player1.id, active: false, ante: 0, hand: [] },
      ]);
      game.join(player3);
      expect(game.state.hands).toEqual([
        { player: player3.id, active: false, ante: 0, hand: [] },
        { player: player2.id, active: false, ante: 0, hand: [] },
        { player: player1.id, active: false, ante: 0, hand: [] },
      ]);
      game.join(player4);
      expect(game.state.hands).toEqual([
        { player: player4.id, active: false, ante: 0, hand: [] },
        { player: player3.id, active: false, ante: 0, hand: [] },
        { player: player2.id, active: false, ante: 0, hand: [] },
        { player: player1.id, active: false, ante: 0, hand: [] },
      ]);
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
    it('leaving adds the player to a queue to leave the game', () => {
      expect(game.state.hands).toEqual([
        { player: player2.id, active: false, ante: 0, hand: [] },
        { player: player1.id, active: false, ante: 0, hand: [] },
      ]);
      expect(game.state.wantsToLeave).toEqual([]);
      game.leave(player2);
      expect(game.state.hands).toEqual([
        { player: player2.id, active: false, ante: 0, hand: [] },
        { player: player1.id, active: false, ante: 0, hand: [] },
      ]);
      expect(game.state.wantsToLeave).toEqual([player2.id]);
    });
    // it('players in queue should leave after the current hand finishes', () => {
    //     game.leave(player1);
    //     expect(game.state.wantsToLeave).toEqual([player1.id]);
    // });
    // it('the state should be WAITING_FOR_PLAYERS if everyone leaves', () => {
    //     game.leave(player1);
    //     game.leave(player2);
    //     expect(game.state.wantsToLeave).toEqual([player1.id, player2.id]);
    // });
  });

  describe('applyMove', () => {
    beforeEach(() => {
      game.state.hands = [
        {
          player: '1',
          active: true,
          ante: 10,
          hand: [
            { type: 'Clubs', value: 10, faceUp: true },
            { type: 'Clubs', value: 'K', faceUp: true },
          ],
        },
        {
          player: '2',
          active: true,
          ante: 10,
          hand: [
            { type: 'Hearts', value: 7, faceUp: true },
            { type: 'Clubs', value: 7, faceUp: true },
          ],
        },
      ];
      game.state.shuffler = new Shuffler([
        { type: 'Diamonds', value: 8, faceUp: true },
        { type: 'Diamonds', value: 7, faceUp: true },
      ]);
    });
    test('Should throw error if game is not in progress', () => {
      game.state.status = 'OVER';
      expect(() =>
        game.applyMove({
          playerID: '',
          gameID: '',
          move: {
            player: '',
            action: 'Hit',
          },
        }),
      ).toThrowError(GAME_NOT_IN_PROGRESS_MESSAGE);
    });
    test('Should throw error if player is not active', () => {
      game.state.status = 'IN_PROGRESS';
      game.state.hands[0].active = false;
      expect(() =>
        game.applyMove({
          playerID: '1',
          gameID: game.id,
          move: {
            player: '1',
            action: 'Hit',
          },
        }),
      ).toThrowError('Player is not active');
    });
    test('Should make the player inactive if they Stand', () => {
      game.state.status = 'IN_PROGRESS';
      expect(game.state.hands[0].active).toBe(true);
      game.applyMove({
        playerID: '1',
        gameID: game.id,
        move: {
          player: '1',
          action: 'Stand',
        },
      });
      expect(game.state.hands[0].active).toBe(false);
    });
    test('Should add a card to the players hand if the player hits', () => {
      game.state.status = 'IN_PROGRESS';
      expect(game.state.hands[0].hand.length).toBe(2);
      game.applyMove({
        playerID: '1',
        gameID: game.id,
        move: {
          player: '1',
          action: 'Hit',
        },
      });
      expect(game.state.hands[0].hand.length).toBe(3);
    });

    test('Should make the player inactive if they hit and bust', () => {
      game.state.status = 'IN_PROGRESS';
      expect(game.state.hands[0].active).toBe(true);
      game.applyMove({
        playerID: '1',
        gameID: game.id,
        move: {
          player: '1',
          action: 'Hit',
        },
      });
      expect(game.handValue(game.state.hands[0].hand)).toBe(27);
      expect(game.state.hands[0].active).toBe(false);
      expect(game.state.currentPlayer).toEqual(1);
    });

    test('Should add a card to the players hand if they double down', () => {
      game.state.status = 'IN_PROGRESS';
      expect(game.state.hands[0].hand.length).toBe(2);
      game.applyMove({
        playerID: '1',
        gameID: game.id,
        move: {
          player: '1',
          action: 'Double Down',
        },
      });
      expect(game.state.hands[0].hand.length).toBe(3);
    });

    test('Should double the ante if a player doubles down', () => {
      game.state.status = 'IN_PROGRESS';
      expect(game.state.hands[0].ante).toBe(10);
      game.applyMove({
        playerID: '1',
        gameID: game.id,
        move: {
          player: '1',
          action: 'Double Down',
        },
      });
      expect(game.state.hands[0].ante).toBe(20);
    });

    test('Should make the player inactive after doubling down', () => {
      game.state.status = 'IN_PROGRESS';
      expect(game.state.hands[0].active).toBe(true);
      game.applyMove({
        playerID: '1',
        gameID: game.id,
        move: {
          player: '1',
          action: 'Double Down',
        },
      });
      expect(game.state.hands[0].active).toBe(false);
    });
    test('Should throw an error if not a valid split 1', () => {
      game.state.status = 'IN_PROGRESS';
      expect(() =>
        game.applyMove({
          playerID: '1',
          gameID: game.id,
          move: {
            player: '1',
            action: 'Split',
          },
        }),
      ).toThrowError('Split is not available here');
    });

    test('Should throw an error if not a valid split 2', () => {
      game.state.status = 'IN_PROGRESS';
      // Hit
      game.applyMove({
        playerID: '2',
        gameID: game.id,
        move: {
          player: '2',
          action: 'Hit',
        },
      });
      expect(() =>
        game.applyMove({
          playerID: '2',
          gameID: game.id,
          move: {
            player: '2',
            action: 'Split',
          },
        }),
      ).toThrowError('Split is not available here');
    });

    test('When split, should then create two hands of the same player and same singular card, one after the other.', () => {
      game.state.status = 'IN_PROGRESS';
      game.applyMove({
        playerID: '2',
        gameID: game.id,
        move: {
          player: '2',
          action: 'Split',
        },
      });
      expect(game.state.hands[1]).toEqual(game.state.hands[2]);
    });
  });
  describe('Overhandler', () => {
    beforeEach(() => {
      game.state.hands = [
        {
          player: '1',
          active: false,
          ante: 10,
          hand: [
            { type: 'Clubs', value: 10, faceUp: true },
            { type: 'Clubs', value: 'A', faceUp: true },
          ],
        },
        {
          player: '2',
          active: false,
          ante: 100,
          hand: [
            { type: 'Hearts', value: 7, faceUp: true },
            { type: 'Clubs', value: 6, faceUp: true },
            { type: 'Clubs', value: 3, faceUp: true },
          ],
        },
        {
          player: '3',
          active: true,
          ante: 1000,
          hand: [
            { type: 'Hearts', value: 7, faceUp: true },
            { type: 'Clubs', value: 7, faceUp: true },
          ],
        },
        {
          player: '4',
          active: false,
          ante: 1000,
          hand: [
            { type: 'Hearts', value: 'J', faceUp: true },
            { type: 'Clubs', value: 'Q', faceUp: true },
          ],
        },
      ];
      game.state.shuffler = new Shuffler([
        { type: 'Diamonds', value: 5, faceUp: true },
        { type: 'Diamonds', value: 6, faceUp: true },
        { type: 'Hearts', value: 10, faceUp: true },
      ]);

      game.state.dealerHand = [
        { type: 'Diamonds', value: 10, faceUp: true },
        { type: 'Diamonds', value: 4, faceUp: true },
      ];

      game.state.results = [
        { player: '1', netCurrency: 100 },
        { player: '2', netCurrency: 500 },
        { player: '3', netCurrency: 5000 },
        { player: '4', netCurrency: 5000 },
      ];

      game.state.wantsToLeave = ['4'];
    });

    test('Should play out the dealer logic (hit until over 17, always stands if value is 17 or higher) 1', () => {
      game.state.shuffler = new Shuffler([
        { type: 'Diamonds', value: 5, faceUp: true },
        { type: 'Diamonds', value: 6, faceUp: true },
      ]);
      expect(game.dealerHandler()).toEqual(20);
    });

    test('Should play out the dealer logic (hit until over 17, always stands if value is 17 or higher) 2', () => {
      game.state.shuffler = new Shuffler([
        { type: 'Diamonds', value: 5, faceUp: true },
        { type: 'Diamonds', value: 6, faceUp: true },
      ]);
      game.state.dealerHand = [
        { type: 'Diamonds', value: 10, faceUp: true },
        { type: 'Diamonds', value: 'A', faceUp: true },
      ];
      expect(game.dealerHandler()).toEqual(21);
    });

    test('Should play out the dealer logic (hit until over 17, always stands if value is 17 or higher) 3', () => {
      game.state.dealerHand = [
        { type: 'Diamonds', value: 10, faceUp: true },
        { type: 'Diamonds', value: 6, faceUp: true },
      ];
      expect(game.dealerHandler()).toEqual(0);
    });

    test('Player should lose ante if they have busted no matter what', () => {
      game.state.status = 'IN_PROGRESS';
      expect(game.state.results[2].netCurrency).toEqual(5000);
      game.state.dealerHand = [
        { type: 'Diamonds', value: 10, faceUp: true },
        { type: 'Diamonds', value: 6, faceUp: true },
      ];
      game.applyMove({
        playerID: '3',
        gameID: game.id,
        move: {
          player: '3',
          action: 'Hit',
        },
      });
      expect(game.state.results[2].netCurrency).toEqual(4000);
      expect(game.state.currentPlayer).toEqual(0);
    });

    test('Everyone at the table who hasn’t busted should be rewarded the value of their ante if the dealer busts', () => {
      game.state.status = 'IN_PROGRESS';
      expect(game.state.results[0].netCurrency).toEqual(100);
      expect(game.state.results[1].netCurrency).toEqual(500);
      game.state.dealerHand = [
        { type: 'Diamonds', value: 10, faceUp: true },
        { type: 'Diamonds', value: 6, faceUp: true },
      ];
      game.applyMove({
        playerID: '3',
        gameID: game.id,
        move: {
          player: '3',
          action: 'Hit',
        },
      });
      expect(game.state.results[0].netCurrency).toEqual(110);
      expect(game.state.results[1].netCurrency).toEqual(600);
    });

    test('Everyone at the table who hasn’t busted should be rewarded the value of their ante if the dealer has a lower value than them', () => {
      game.state.status = 'IN_PROGRESS';
      expect(game.state.results[0].netCurrency).toEqual(100);
      game.applyMove({
        playerID: '3',
        gameID: game.id,
        move: {
          player: '3',
          action: 'Hit',
        },
      });
      expect(game.state.results[0].netCurrency).toEqual(110);
    });

    test('Nothing happens if player and dealer tie', () => {
      game.state.status = 'IN_PROGRESS';
      expect(game.state.results[3].netCurrency).toEqual(5000);
      game.applyMove({
        playerID: '3',
        gameID: game.id,
        move: {
          player: '3',
          action: 'Hit',
        },
      });
      expect(game.state.results[3].netCurrency).toEqual(5000);
    });

    test('Player should lose ante if their card value is less than the dealers card value', () => {
      game.state.status = 'IN_PROGRESS';
      expect(game.state.results[1].netCurrency).toEqual(500);
      game.applyMove({
        playerID: '3',
        gameID: game.id,
        move: {
          player: '3',
          action: 'Hit',
        },
      });
      expect(game.state.results[1].netCurrency).toEqual(400);
    });

    test('Function should update the state to remove all players who wish to leave', () => {
      game.state.status = 'IN_PROGRESS';
      expect(game.state.hands.length).toEqual(4);
      game.applyMove({
        playerID: '3',
        gameID: game.id,
        move: {
          player: '3',
          action: 'Hit',
        },
      });
      expect(game.state.hands.length).toEqual(3);
    });

    test('Should give each player and the dealer two new cards and make them active', () => {
      game.state.status = 'IN_PROGRESS';
      expect(game.state.hands[1].hand.length).toEqual(3);
      const beforeHand = game.state.hands[1].hand;
      const beforeDealerHand = game.state.dealerHand;
      game.applyMove({
        playerID: '3',
        gameID: game.id,
        move: {
          player: '3',
          action: 'Hit',
        },
      });
      expect(game.state.hands[1].hand.length).toEqual(2);
      expect(game.state.hands[1].hand).not.toEqual(beforeHand);
      expect(game.state.dealerHand).not.toEqual(beforeDealerHand);
    });

    test('One dealer card should be hidden', () => {
      game.state.status = 'IN_PROGRESS';
      game.applyMove({
        playerID: '3',
        gameID: game.id,
        move: {
          player: '3',
          action: 'Hit',
        },
      });
      expect(game.state.dealerHand[0].faceUp).toEqual(false);
    });
  });
});
