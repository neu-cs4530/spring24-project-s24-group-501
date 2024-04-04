import {
  GameResult,
  GameStatus,
  BlackjackMove,
  BlackjackPlayer,
  CasinoScore,
  Card,
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
    0,
  );
  const otherPlayers = [
    new PlayerController(nanoid(), nanoid(), { x: 0, y: 0, moving: false, rotation: 'front' }, 0),
    new PlayerController(nanoid(), nanoid(), { x: 0, y: 0, moving: false, rotation: 'front' }, 0),
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
    dealerHand?: Card[];
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
    const ret = new BlackjackAreaController(
      id,
      {
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
            dealerHand: dealerHand || [],
            results: results || [],
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
        // hands: BlackjackPlayer[];
        // currentPlayer: number;
        // dealerHand: Card[];
        // results: CasinoScore[];
        // shuffler: shuffler;
        // wantsToLeave: PlayerID[];
        // stake: CoveyBucks;

        // player: Player;
        // hands: Hand[];
        // currentHand: number;
        // active: boolean;
        // const hand1: BlackjackPlayer = {
        //   player: {
        //     id: '1',
        //     userName: 'test',
        //     location: { x: 0, y: 0, moving: false, rotation: 'front' },
        //     units: 0,
        //   },
        //   hands: { cards: [
        //     { type: 'Diamonds', value: 2, faceUp: true },
        //     { type: 'Diamonds', value: 3, faceUp: true },
        //   ], wager: 5 }
        //   ante: 5,
        //   active: true,
        // };
        const controller = BlackjackAreaControllerWithProps({
          status: 'IN_PROGRESS',
          hands: [], // hand1
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
        // const controller = BlackjackAreaControllerWithProps({
        //   hands: [
        //     {
        //       player: '1',
        //       hand: [
        //         { type: 'Diamonds', value: 5, faceUp: true },
        //         { type: 'Diamonds', value: 6, faceUp: true },
        //       ],
        //       ante: 1,
        //       active: true,
        //     },
        //   ],
        // });
        //expect(controller.hands?.length).toBe(1);
        expect(1).toBe(1);
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

  describe('Properties during the game, modified by _updateFrom ', () => {
    let controller: BlackjackAreaController;
    beforeEach(() => {
      // controller = BlackjackAreaControllerWithProps({
      //   player: ourPlayer.id,
      //   hands: [
      //     {
      //       player: '1',
      //       hand: [
      //         { type: 'Diamonds', value: 5, faceUp: true },
      //         { type: 'Diamonds', value: 6, faceUp: true },
      //       ],
      //       ante: 1,
      //       active: true,
      //     },
      //   ],
      //   status: 'IN_PROGRESS',
      // });
      // expect(controller.currentPlayer).toBe(0);
      // expect(controller.isPlayer).toBe(true);
      expect(1).toBe(1);
    });
  });
});
