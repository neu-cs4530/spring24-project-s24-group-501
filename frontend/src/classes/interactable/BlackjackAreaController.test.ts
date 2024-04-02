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
       
      });


});
