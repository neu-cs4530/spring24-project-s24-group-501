import { mock } from 'jest-mock-extended';
import React from 'react';
import TownController, * as TownControllerHooks from '../../../../classes/TownController';
import * as BlackjackArea from './BlackjackArea';
import PhaserGameArea from '../GameArea';
import BlackjackAreaController from '../../../../classes/interactable/BlackjackAreaController';
import { nanoid } from 'nanoid';
import {
  BlackjackCasinoState,
  BlackjackDealer,
  BlackjackPlayer,
  CasinoArea,
  CasinoScore,
  CoveyBucks,
  GameStatus,
} from '../../../../../../shared/types/CoveyTownSocket';
import PlayerController from '../../../../classes/PlayerController';
import { ChakraProvider } from '@chakra-ui/provider';
import TownControllerContext from '../../../../contexts/TownControllerContext';
import { render } from '@testing-library/react';

const mockGameArea = mock<PhaserGameArea>();
mockGameArea.getData.mockReturnValue('Blackjack');
jest.spyOn(TownControllerHooks, 'useInteractable').mockReturnValue(mockGameArea);
const useInteractableAreaControllerSpy = jest.spyOn(
  TownControllerHooks,
  'useInteractableAreaController',
);
class MockBlackjackAreaController extends BlackjackAreaController {
  applyMove = jest.fn();

  placeBet = jest.fn();

  setPlayerPhoto = jest.fn();

  joinGame = jest.fn();

  mockHands: BlackjackPlayer[] | undefined = undefined;

  mockDealerHand: BlackjackDealer | undefined = undefined;

  mockStatus: GameStatus = 'WAITING_TO_START';

  mockCurrentPlayer: number | undefined = 0;

  mockPlayerActive = false;

  mockCanSplit = false;

  mockCanDoubleDown = false;

  mockIsPlayer = false;

  mockResults: CasinoScore[] | undefined = undefined;

  mockWhoWantsToLeave: string[] | undefined = undefined;

  mockStake = 0;

  mockIsActive = false;

  public constructor() {
    super(nanoid(), mock<CasinoArea<BlackjackCasinoState>>(), mock<TownController>());
    this.mockClear();
  }

  get hands() {
    return this.mockHands;
  }

  get dealerHand() {
    return this.mockDealerHand;
  }

  get status() {
    return this.mockStatus;
  }

  get currentPlayer() {
    return this.mockCurrentPlayer;
  }

  get playerActive() {
    return this.mockPlayerActive;
  }

  get canSplit() {
    return this.mockCanSplit;
  }

  get canDoubleDown() {
    return this.mockCanDoubleDown;
  }

  get isPlayer() {
    return this.mockIsPlayer;
  }

  get results() {
    return this.mockResults;
  }

  get whoWantsToLeave() {
    return this.mockWhoWantsToLeave;
  }

  get stake() {
    return this.mockStake;
  }

  public isActive(): boolean {
    return this.mockIsActive;
  }

  public mockClear() {
    this.mockHands = undefined;
    this.mockDealerHand = undefined;
    this.mockStatus = 'WAITING_TO_START';
    this.mockCurrentPlayer = 0;
    this.mockPlayerActive = false;
    this.mockCanSplit = false;
    this.mockCanDoubleDown = false;
    this.mockIsPlayer = false;
    this.mockResults = undefined;
    this.mockWhoWantsToLeave = undefined;
    this.mockStake = 0;
    this.mockIsActive = false;
  }
}
describe('BlackjackArea', () => {
  let consoleErrorSpy: jest.SpyInstance<void, [message?: any, ...optionalParms: any[]]>;
  beforeAll(() => {
    // Spy on console.error and intercept react key warnings to fail test
    consoleErrorSpy = jest.spyOn(global.console, 'error');
    consoleErrorSpy.mockImplementation((message?, ...optionalParams) => {
      const stringMessage = message as string;
      if (stringMessage.includes && stringMessage.includes('children with the same key,')) {
        throw new Error(stringMessage.replace('%s', optionalParams[0]));
      } else if (stringMessage.includes && stringMessage.includes('warning-keys')) {
        throw new Error(stringMessage.replace('%s', optionalParams[0]));
      }
      // eslint-disable-next-line no-console -- we are wrapping the console with a spy to find react warnings
      console.warn(message, ...optionalParams);
    });
  });
  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  let ourPlayer: PlayerController;
  const townController = mock<TownController>();
  Object.defineProperty(townController, 'ourPlayer', { get: () => ourPlayer });
  const casinoAreaController = new MockBlackjackAreaController();
  let joinGameResolve: () => void;
  let joinGameReject: (err: Error) => void;
  let startGameResolve: () => void;
  let startGameReject: (err: Error) => void;

  function renderBlackjackArea() {
    return render(
      <ChakraProvider>
        <TownControllerContext.Provider value={townController}>
          <BlackjackArea interactableID={nanoid()} />
        </TownControllerContext.Provider>
      </ChakraProvider>,
    );
  }
});
