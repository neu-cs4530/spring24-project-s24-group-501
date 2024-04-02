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
    }, 0);
    const otherPlayers = [
      new PlayerController(nanoid(), nanoid(), { x: 0, y: 0, moving: false, rotation: 'front' }, 0),
      new PlayerController(nanoid(), nanoid(), { x: 0, y: 0, moving: false, rotation: 'front' }, 0),
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
      player,
      results,
      wantsToLeave,
      observers,
    }: {
        hands?: PlayerHand[];
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
      let players = [];
      if (player) {players.push(player)}
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
        describe('Player', () => {
          it('returns an empty hand if there are no players yet', () => {
            const controller = BlackjackAreaControllerWithProps({ status: 'IN_PROGRESS', hands: [] });
            //Expect correct number of hands
            expect(controller?.hands?.length).toBe(0);
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
                {player: "1", hand: [
                  {type: "Diamonds",value:5, faceUp:true},
                  {type: "Diamonds",value:6, faceUp:true},
                ],
                ante: 1,
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

      describe('status', () => {
        it('Wa', () => {
          const controller = BlackjackAreaControllerWithProps({
            player: ourPlayer.id,
            status: 'IN_PROGRESS',
          });
          expect(controller.currentPlayer).toBe(0);
          expect(controller.isPlayer).toBe(true);
        });
      });


});
