import {
  GameResult,
  GameStatus,
  BlackjackMove,
  BlackjackPlayer,
  CasinoScore,
  Card,
  BlackjackDealer,
} from '../../types/CoveyTownSocket';
import PlayerController from '../PlayerController';
import TownController from '../TownController';
import BlackjackAreaController from './BlackjackAreaController';
import { nanoid } from 'nanoid';
import { mock } from 'jest-mock-extended';
import assert from 'assert';
import Shuffler from '../../../../townService/src/town/casino/Shuffler';

describe('BlackjackAreaController', () => {
  const ourPlayer = new PlayerController(
    '1',
    '1',
    {
      x: 0,
      y: 0,
      moving: false,
      rotation: 'front',
    },
    1000,
  );
  const otherPlayers = [
    new PlayerController('2', '2', { x: 0, y: 0, moving: false, rotation: 'front' }, 1000),
    new PlayerController('3', '3', { x: 0, y: 0, moving: false, rotation: 'front' }, 1000),
  ];

  const deck = new Shuffler();

  const mockTownController = mock<TownController>();
  Object.defineProperty(mockTownController, 'ourPlayer', {
    get: () => ourPlayer,
  });
  Object.defineProperty(mockTownController, 'players', {
    get: () => [ourPlayer, ...otherPlayers],
  });
  mockTownController.getPlayer.mockImplementation((playerID: any) => {
    const p = mockTownController.players.find((player: { id: any }) => player.id === playerID);
    assert(p);
    return p;
  });

  function updateGameWithMove(controller: BlackjackAreaController, nextMove: BlackjackMove): void {
    const nextState = Object.assign({}, controller.toInteractableAreaModel());
    const nextGame = Object.assign({}, nextState.game);
    nextState.game = nextGame;
    const newState = Object.assign({}, nextGame.state);
    nextGame.state = newState;
    if (nextMove.action === 'Stand' && controller.hands) {
      for (const hand of controller.hands) {
        hand.active = false;
      }
    }
    if (nextMove.action === 'Hit' && controller.hands) {
      for (const hand of controller.hands) {
        hand.active = false;
        // hand.hands[].push(deck.deal(true));
      }
    }
    controller.updateFrom(nextState, controller.occupants);
  }
  function BlackjackAreaControllerWithProps({
    _id,
    gameInstanceID,
    hands,
    status,
    currentPlayer,
    dealerHand,
    player,
    results,
    wantsToLeave,
    observers,
  }: {
    hands?: BlackjackPlayer[];
    currentPlayer?: number;
    dealerHand?: BlackjackDealer;
    results?: [];
    player?: string;
    wantsToLeave?: [];
    status?: GameStatus;
    gameInstanceID?: string;
    _id?: string;
    observers?: string[];
  }) {
    const id = _id || `INTERACTABLE-ID-${nanoid()}`;
    const instanceID = gameInstanceID || `GAME-INSTANCE-ID-${nanoid()}`;
    const players = [];
    if (player) {
      players.push(player);
    }
    if (observers) players.push(...observers);
    if (!dealerHand) {
      dealerHand = {
        cards: [],
        text: '',
        bust: true,
      };
    }
    const casino = {
      state: {
        hands: hands || [],
        currentPlayer: currentPlayer || 0,
        dealerHand: dealerHand,
        results: results || [],
        wantsToLeave: wantsToLeave || [],
        shuffler: new Shuffler(),
        stake: 0,
        status: status || 'WAITING_FOR_PLAYERS',
      },
      id: id,
      players: players,
    };
    const ret = new BlackjackAreaController(
      id,
      {
        casino: casino,
        id,
        occupants: players,
        history: [],
        type: 'BlackjackArea',
        game: {
          id: instanceID,
          players: players,
          state: {
            hands: hands || [],
            status: status || 'WAITING_FOR_PLAYERS',
            currentPlayer: currentPlayer || 0,
            results: results || [],
            dealerHand: dealerHand,
            shuffler: new Shuffler(),
            wantsToLeave: wantsToLeave || [],
            stake: 10,
          },
        },
      },
      mockTownController,
    );
    if (players) {
      ret.occupants = players
        .map(eachID =>
          mockTownController.players.find((eachPlayer: { id: string }) => eachPlayer.id === eachID),
        )
        .filter(eachPlayer => eachPlayer) as PlayerController[];
    }
    return ret;
  }

  describe('Properties at the start of the game', () => {
    describe('Player', () => {
      it('returns an empty hand if there are no players yet', () => {
        const controller = BlackjackAreaControllerWithProps({ status: 'IN_PROGRESS', hands: [] });
        //Expect correct number of hands
        expect(controller?.hands?.length).toBe(0);
        expect(controller?.isActive()).toBe(false);
      });

      it('returns a list of a single hand if there is a hand', () => {
        const controller = BlackjackAreaControllerWithProps({
          status: 'IN_PROGRESS',
          hands: [{ player: '1', hands: [], currentHand: 1, active: true }], // hand1
        });
        //Expect correct number of hands
        expect(controller?.hands?.length).toBe(1);
        expect(controller?.isActive()).toBe(true);
      });

      it('returns the player if there is a single player', () => {
        const controller = BlackjackAreaControllerWithProps({ player: ourPlayer.id });
        expect(controller.players[0]).toBe(ourPlayer);
      });

      it('returns undefined if there is no player', () => {
        const controller = BlackjackAreaControllerWithProps({ player: undefined });
        expect(controller.players[0]).toBeUndefined();
      });
    });

    describe('hands', () => {
      it('returns the number of hands from the game state', () => {
        const controller = BlackjackAreaControllerWithProps({
          hands: [
            {
              player: '1',
              hands: [],
              currentHand: 0,
              active: true,
            },
          ],
        });
        expect(controller.hands?.length).toBe(1);
      });
    });
  });

  describe('isOurTurn', () => {
    it('returns true if it is our turn', () => {
      const controller = BlackjackAreaControllerWithProps({
        player: ourPlayer.id,
        status: 'IN_PROGRESS',
      });
      expect(controller.currentPlayer).toBe(0);
      expect(controller.isPlayer).toBe(true);
    });
  });

  describe('Status', () => {
    it('returns Waiting for Players if undefined', () => {
      const controller = BlackjackAreaControllerWithProps({
        player: ourPlayer.id,
        status: undefined,
      });
      expect(controller.status).toEqual('WAITING_FOR_PLAYERS');
    });

    it('returns status if defined', () => {
      const stat = 'IN_PROGRESS';
      const controller = BlackjackAreaControllerWithProps({
        player: ourPlayer.id,
        status: stat,
      });
      expect(controller.status).toEqual(stat);
    });
  });

  describe('Booleans and Game applications', () => {
    let controller: BlackjackAreaController;
    function player2Turn() {
      controller = BlackjackAreaControllerWithProps({
        player: ourPlayer.id,
        currentPlayer: 1,
        hands: [
          {
            player: '1',
            currentHand: 0,
            hands: [
              {
                cards: [
                  { type: 'Diamonds', value: 6, faceUp: true },
                  { type: 'Hearts', value: 6, faceUp: true },
                ],
                wager: 5,
                text: '12',
                outcome: undefined,
              },
            ],
            active: true,
          },
          {
            player: '2',
            currentHand: 0,
            hands: [
              {
                cards: [
                  { type: 'Spades', value: 6, faceUp: true },
                  { type: 'Clubs', value: 7, faceUp: true },
                  { type: 'Clubs', value: 8, faceUp: true },
                ],
                wager: 5,
                text: '21',
                outcome: undefined,
              },
            ],
            active: true,
          },
        ],
        status: 'IN_PROGRESS',
      });
    }
    beforeEach(() => {
      controller = BlackjackAreaControllerWithProps({
        player: ourPlayer.id,
        currentPlayer: 0,
        gameInstanceID: '1',
        hands: [
          {
            player: '1',
            currentHand: 0,
            hands: [
              {
                cards: [
                  { type: 'Diamonds', value: 6, faceUp: true },
                  { type: 'Hearts', value: 6, faceUp: true },
                ],
                wager: 5,
                text: '12',
                outcome: undefined,
              },
            ],
            active: true,
          },
          {
            player: '2',
            currentHand: 0,
            hands: [
              {
                cards: [
                  { type: 'Spades', value: 6, faceUp: true },
                  { type: 'Clubs', value: 7, faceUp: true },
                  { type: 'Clubs', value: 8, faceUp: true },
                ],
                wager: 5,
                text: '21',
                outcome: undefined,
              },
            ],
            active: true,
          },
        ],
        status: 'IN_PROGRESS',
      });
      expect(controller.currentPlayer).toBe(0);
      expect(controller.isPlayer).toBe(true);
    });
    it('returns true if user can split', () => {
      expect(controller.canSplit).toBe(true);
    });
    it('returns false if user cant split', () => {
      player2Turn();
      expect(controller.canSplit).toBe(false);
    });
    it('returns true if user can Double Down', () => {
      expect(controller.canDoubleDown).toBe(true);
    });
    it('returns false if user cant Double Down', () => {
      player2Turn();
      expect(controller.canDoubleDown).toBe(false);
    });

    describe('Active Methods', () => {
      beforeEach(() => {
        controller = BlackjackAreaControllerWithProps({
          player: ourPlayer.id,
          currentPlayer: 0,
          gameInstanceID: '1',
          hands: [
            {
              player: '1',
              currentHand: 0,
              hands: [
                {
                  cards: [
                    { type: 'Diamonds', value: 6, faceUp: true },
                    { type: 'Hearts', value: 6, faceUp: true },
                  ],
                  wager: 5,
                  text: '12',
                  outcome: undefined,
                },
              ],
              active: true,
            },
          ],
          status: 'WAITING_TO_START',
        });
        expect(controller.currentPlayer).toBe(0);
        expect(controller.isPlayer).toBe(true);
      });
      it('sends a PlaceBet and SetPhoto command to the server', async () => {
        const instanceID = nanoid();
        const bet = 5;
        const photo = 'photo';
        const move: BlackjackMove = { player: '1', action: 'Hit' };
        mockTownController.sendInteractableCommand.mockImplementationOnce(async () => {
          return { gameID: instanceID };
        });
        await controller.joinCasino();
        mockTownController.sendInteractableCommand.mockClear();
        mockTownController.sendInteractableCommand.mockImplementationOnce(async () => {});
        await controller.placeBet(bet);
        expect(mockTownController.sendInteractableCommand).toHaveBeenCalledWith(controller.id, {
          type: 'PlaceBet',
          gameID: instanceID,
          bet,
        });
        await controller.setPlayerPhoto(photo);
        expect(mockTownController.sendInteractableCommand).toHaveBeenCalledWith(controller.id, {
          type: 'SetPlayerPhoto',
          gameID: instanceID,
          photo,
        });
      });
      it('Fails to send a PlaceBet command to the server if no instance or not started', async () => {
        await expect(controller.placeBet(5)).rejects.toThrowError();
      });
      it('Fails to send a applyMove command to the server if no instance or not started', async () => {
        const move: BlackjackMove = { player: '1', action: 'Hit' };
        await expect(controller.applyMove(move)).rejects.toThrowError();
      });
    });
    describe('With a game in progress', () => {
      let instanceID: string;
      beforeEach(async () => {
        instanceID = `GameInstanceID.makeMove.${nanoid()}`;
        controller = BlackjackAreaControllerWithProps({
          player: ourPlayer.id,
          currentPlayer: 0,
          gameInstanceID: '1',
          hands: [
            {
              player: '1',
              currentHand: 0,
              hands: [
                {
                  cards: [
                    { type: 'Diamonds', value: 6, faceUp: true },
                    { type: 'Hearts', value: 6, faceUp: true },
                  ],
                  wager: 5,
                  text: '12',
                  outcome: undefined,
                },
              ],
              active: true,
            },
          ],
          status: 'IN_PROGRESS',
        });
        mockTownController.sendInteractableCommand.mockImplementationOnce(async () => {
          return { gameID: instanceID };
        });
        await controller.joinCasino();
      });
      describe('ApplyMove', () => {
        async function makeMoveAndExpectHandPlacement(move: BlackjackMove) {
          mockTownController.sendInteractableCommand.mockClear();
          await controller.applyMove(move);
          expect(mockTownController.sendInteractableCommand).toHaveBeenCalledWith(controller.id, {
            type: 'GameMove',
            gameID: instanceID,
            move,
          });
          //Update the controller with the new move
          updateGameWithMove(controller, move);
        }
        it('Sends applyMove signal to server', async () => {
          await makeMoveAndExpectHandPlacement({ player: '1', action: 'Hit' });
        });
      });
    });
  });
});
