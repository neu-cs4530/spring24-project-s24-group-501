import { GameResult, GameStatus, BlackjackMove, PlayerHand, CasinoScore, Card } from "../../types/CoveyTownSocket";
import PlayerController from "../PlayerController";
import TownController from "../TownController";
import BlackjackAreaController from "./BlackjackAreaController";
import { nanoid } from 'nanoid';
import { mock } from 'jest-mock-extended';
import assert from 'assert';
import Shuffler from "../../../../townService/src/town/games/Blackjack/Shuffler";

describe('BlackjackAreaController'  , () => {
    const ourPlayer = new PlayerController(nanoid(), nanoid(), {
      x: 0,
      y: 0,
      moving: false,
      rotation: 'front',
    });
    const otherPlayers = [
      new PlayerController(nanoid(), nanoid(), { x: 0, y: 0, moving: false, rotation: 'front' }),
      new PlayerController(nanoid(), nanoid(), { x: 0, y: 0, moving: false, rotation: 'front' }),
    ];
  
    const mockTownController = mock<TownController>();
    Object.defineProperty(mockTownController, 'ourPlayer', {
      get: () => ourPlayer,
    });
    Object.defineProperty(mockTownController, 'players', {
      get: () => [ourPlayer, ...otherPlayers],
    });
    mockTownController.getPlayer.mockImplementation((playerID: any) => {
      const p = mockTownController.players.find((player: { id: any; }) => player.id === playerID);
      assert(p);
      return p;
    });
  
    function updateGameWithMove(
      controller: BlackjackAreaController,
      nextMove: BlackjackMove,
    ): void {
      const nextState = Object.assign({}, controller.toInteractableAreaModel());
      const nextGame = Object.assign({}, nextState.game);
      nextState.game = nextGame;
      const newState = Object.assign({}, nextGame.state);
      nextGame.state = newState;
      controller.updateFrom(nextState, controller.occupants);
    }
    function BlackjackAreaControllerWithProps({
      _id,
      gameInstanceID,
      hands,
      status,
      currentPlayer,
      dealerHand,
      results,
      wantsToLeave,
      observers,
    }: {
        hands?: [];
        currentPlayer?: number;
        dealerHand?: Card[];
        results?: [];
        wantsToLeave?: [];
        status?: GameStatus;
        gameInstanceID?: string;
        _id?: string;
        observers?: string[];
        
    }) {
      const id = _id || `INTERACTABLE-ID-${nanoid()}`;
      const instanceID = gameInstanceID || `GAME-INSTANCE-ID-${nanoid()}`;
      const players = [];
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
                    status: status || "WAITING_FOR_PLAYERS",
                    currentPlayer: currentPlayer || 0,
                    dealerHand: dealerHand || [],
                    results: results || [],
                    shuffler: new Shuffler(),
                    wantsToLeave: wantsToLeave || [],
                },
              },
        },
        mockTownController,
      );
      if (players) {
        ret.occupants = players
          .map(eachID => mockTownController.players.find((eachPlayer: { id: string; }) => eachPlayer.id === eachID))
          .filter(eachPlayer => eachPlayer) as PlayerController[];
      }
      return ret;
    }

    describe('[T1.1] Properties at the start of the game', () => {
        describe('hand', () => {
          it('returns an empty hand if there are no players yet', () => {
            const controller = BlackjackAreaControllerWithProps({ status: 'IN_PROGRESS', hands: [] });
            //Expect correct number of hands
            expect(controller?.hands?.length).toBe(0);
            
            
          });
        });
        describe('red', () => {
          it('returns the red player if there is a red player', () => {
            const controller = BlackjackAreaControllerWithProps({ red: ourPlayer.id });
            expect(controller.red).toBe(ourPlayer);
          });
          it('returns undefined if there is no red player', () => {
            const controller = BlackjackAreaControllerWithProps({ red: undefined });
            expect(controller.red).toBeUndefined();
          });
        });
        describe('yellow', () => {
          it('returns the yellow player if there is a yellow player', () => {
            const controller = BlackjackAreaControllerWithProps({ yellow: ourPlayer.id });
            expect(controller.yellow).toBe(ourPlayer);
          });
          it('returns undefined if there is no yellow player', () => {
            const controller = BlackjackAreaControllerWithProps({ yellow: undefined });
            expect(controller.yellow).toBeUndefined();
          });
        });
        describe('winner', () => {
          it('returns the winner if there is a winner', () => {
            const controller = BlackjackAreaControllerWithProps({
              yellow: ourPlayer.id,
              winner: ourPlayer.id,
            });
            expect(controller.winner).toBe(ourPlayer);
          });
          it('returns undefined if there is no winner', () => {
            const controller = BlackjackAreaControllerWithProps({ winner: undefined });
            expect(controller.winner).toBeUndefined();
          });
        });
        describe('moveCount', () => {
          it('returns the number of moves from the game state', () => {
            const controller = BlackjackAreaControllerWithProps({
              moves: [
                { col: 0, gamePiece: 'Red', row: 0 },
                { col: 1, gamePiece: 'Yellow', row: 0 },
              ],
            });
            expect(controller.moveCount).toBe(2);
          });
        });
        describe('isOurTurn', () => {
          it('returns true if it is our turn', () => {
            const controller = BlackjackAreaControllerWithProps({
              red: ourPlayer.id,
              firstPlayer: 'Red',
              status: 'IN_PROGRESS',
              yellow: otherPlayers[0].id,
            });
            expect(controller.isOurTurn).toBe(true);
          });
          it('returns false if it is not our turn', () => {
            const controller = BlackjackAreaControllerWithProps({
              red: ourPlayer.id,
              firstPlayer: 'Yellow',
              status: 'IN_PROGRESS',
              yellow: otherPlayers[0].id,
            });
            expect(controller.isOurTurn).toBe(false);
          });
        });
        describe('whoseTurn', () => {
          it('returns red if the first player is red', () => {
            const controller = BlackjackAreaControllerWithProps({
              red: ourPlayer.id,
              firstPlayer: 'Red',
              status: 'IN_PROGRESS',
              yellow: otherPlayers[0].id,
            });
            expect(controller.whoseTurn).toBe(controller.red);
          });
          it('returns yellow if the first player is yellow', () => {
            const controller = BlackjackAreaControllerWithProps({
              red: ourPlayer.id,
              firstPlayer: 'Yellow',
              status: 'IN_PROGRESS',
              yellow: otherPlayers[0].id,
            });
            expect(controller.whoseTurn).toBe(controller.yellow);
          });
        });
        describe('isPlayer', () => {
          it('returns true if we are a player', () => {
            const controller = BlackjackAreaControllerWithProps({ red: ourPlayer.id });
            expect(controller.isPlayer).toBe(true);
          });
          it('returns false if we are not a player', () => {
            const controller = BlackjackAreaControllerWithProps({ red: undefined });
            expect(controller.isPlayer).toBe(false);
          });
        });
        describe('gamePiece', () => {
          it('returns Red if we are red', () => {
            const controller = BlackjackAreaControllerWithProps({ red: ourPlayer.id });
            expect(controller.gamePiece).toBe('Red');
          });
          it('returns Yellow if we are yellow', () => {
            const controller = BlackjackAreaControllerWithProps({ yellow: ourPlayer.id });
            expect(controller.gamePiece).toBe('Yellow');
          });
          it('throws an error if we are not a player', () => {
            const controller = BlackjackAreaControllerWithProps({ red: undefined });
            expect(() => controller.gamePiece).toThrowError();
          });
        });
        describe('isEmpty', () => {
          it('returns true if there are no players', () => {
            const controller = BlackjackAreaControllerWithProps({ red: undefined });
            expect(controller.isEmpty()).toBe(true);
          });
          it('returns false if there is a single red player', () => {
            const controller = BlackjackAreaControllerWithProps({ red: ourPlayer.id });
            expect(controller.isEmpty()).toBe(false);
          });
          it('returns false if there is a single yellow player', () => {
            const controller = BlackjackAreaControllerWithProps({ yellow: ourPlayer.id });
            expect(controller.isEmpty()).toBe(false);
          });
          it('returns false if there are multiple players', () => {
            const controller = BlackjackAreaControllerWithProps({
              red: ourPlayer.id,
              yellow: otherPlayers[0].id,
            });
            expect(controller.isEmpty()).toBe(false);
          });
          it('returns false if there are no players but there are observers', () => {
            const controller = BlackjackAreaControllerWithProps({ observers: [ourPlayer.id] });
            expect(controller.isEmpty()).toBe(false);
          });
        });
        describe('isActive', () => {
          it('returns true if the game is not empty and it is not waiting for players', () => {
            const controller = BlackjackAreaControllerWithProps({
              red: ourPlayer.id,
              yellow: otherPlayers[0].id,
              status: 'IN_PROGRESS',
            });
            expect(controller.isActive()).toBe(true);
          });
          it('returns false if the game is empty', () => {
            const controller = BlackjackAreaControllerWithProps({
              red: undefined,
              status: 'IN_PROGRESS',
            });
            expect(controller.isActive()).toBe(false);
          });
          it('returns false if the game is waiting for players', () => {
            const controller = BlackjackAreaControllerWithProps({
              red: ourPlayer.id,
              yellow: otherPlayers[0].id,
              status: 'WAITING_FOR_PLAYERS',
            });
            expect(controller.isActive()).toBe(false);
          });
        });
      });


});
