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
          <BlackjackArea.default interactableID={nanoid()} />
        </TownControllerContext.Provider>
      </ChakraProvider>,
    );
  }

  test('renders BlackjackArea correctly', async () => {
    const { getByText } = renderBlackjackArea();

    // Ensure game status is displayed correctly
    expect(getByText('Game in progress')).toBeInTheDocument();

    // Ensure player info is displayed correctly
    expect(getByText('player1')).toBeInTheDocument();
    expect(getByText('100')).toBeInTheDocument();
    expect(getByText('player2')).toBeInTheDocument();
    expect(getByText('200')).toBeInTheDocument();

    // Ensure dealer's hand is displayed correctly
    expect(getByText('15')).toBeInTheDocument();
    expect(document.querySelectorAll('img')).toHaveLength(2); // Two cards

    // Ensure player actions are displayed correctly
    const standButton = getByText('Stand');
    const hitButton = getByText('Hit');
    const doubleDownButton = getByText('Double Down');
    const splitButton = getByText('Split');
    expect(standButton).toBeInTheDocument();
    expect(hitButton).toBeInTheDocument();
    expect(doubleDownButton).toBeInTheDocument();
    expect(splitButton).toBeInTheDocument();
  });

  test('renders BlackjackArea correctly when player is not active', async () => {
    casinoAreaController.mockPlayerActive = false;
    const { getByText } = renderBlackjackArea();

    // Ensure player actions are not displayed when player is not active
    expect(document.querySelectorAll('button')).toHaveLength(0);
  });

  test('renders BlackjackArea correctly when player can split', async () => {
    casinoAreaController.mockCanSplit = true;
    const { getByText } = renderBlackjackArea();

    // Ensure player can split
    const splitButton = getByText('Split');
    expect(splitButton).toBeInTheDocument();
  });

  test('renders BlackjackArea correctly when player can double down', async () => {
    casinoAreaController.mockCanDoubleDown = true;
    const { getByText } = renderBlackjackArea();

    // Ensure player can double down
    const doubleDownButton = getByText('Double Down');
    expect(doubleDownButton).toBeInTheDocument();
  });

  test('renders BlackjackArea correctly when player is not in game', async () => {
    casinoAreaController.mockIsPlayer = false;
    const { getByText } = renderBlackjackArea();

    // Ensure player actions are not displayed when player is not in game
    expect(document.querySelectorAll('button')).toHaveLength(0);
  });

  test('renders BlackjackArea correctly when game is waiting to start', async () => {
    casinoAreaController.mockStatus = 'WAITING_TO_START';
    const { getByText } = renderBlackjackArea();

    // Ensure game status is displayed correctly
    expect(getByText('Waiting for players to join...')).toBeInTheDocument();

    // Ensure player info is displayed correctly
    expect(getByText('player1')).toBeInTheDocument();
    expect(getByText('100')).toBeInTheDocument();
    expect(getByText('player2')).toBeInTheDocument();
    expect(getByText('200')).toBeInTheDocument();
  });

  test('renders BlackjackArea correctly when player wants to leave', async () => {
    casinoAreaController.mockWhoWantsToLeave = ['player1'];
    const { getByText } = renderBlackjackArea();

    // Ensure player wants to leave message is displayed correctly
    expect(getByText('player1 wants to leave the game')).toBeInTheDocument();
  });

  test('renders BlackjackArea correctly when player has not placed a bet', async () => {
    casinoAreaController.mockStake = 0;
    const { getByText } = renderBlackjackArea();

    // Ensure bet setter is displayed correctly
    expect(getByText('Place your bet:')).toBeInTheDocument();
  });

  test('renders BlackjackArea correctly when player has placed a bet', async () => {
    casinoAreaController.mockStake = 100;
    const { getByText } = renderBlackjackArea();

    // Ensure bet setter is not displayed when player has placed a bet
    expect(document.querySelectorAll('button')).toHaveLength(0);
  });

  test('renders BlackjackArea correctly when game is inactive', async () => {
    casinoAreaController.mockIsActive = false;
    const { getByText } = renderBlackjackArea();

    // Ensure game area is not displayed when game is inactive
    expect(document.querySelectorAll('button')).toHaveLength(0);
  });

  test('renders BlackjackArea correctly when game is active', async () => {
    casinoAreaController.mockIsActive = true;
    const { getByText } = renderBlackjackArea();

    // Ensure game area is displayed when game is active
    expect(getByText('Game in progress')).toBeInTheDocument();
  });

  test('renders BlackjackArea correctly when player joins game', async () => {
    const { getByText } = renderBlackjackArea();

    // Ensure player can join game
    const joinButton = getByText('Join casino');
    expect(joinButton).toBeInTheDocument();
  });

  test('renders BlackjackArea correctly when player leaves game', async () => {
    const { getByText } = renderBlackjackArea();

    // Ensure player can leave game
    const leaveButton = getByText('Leave casino');
    expect(leaveButton).toBeInTheDocument();
  });

  test('renders BlackjackArea correctly when player is leaving game', async () => {
    casinoAreaController.mockWhoWantsToLeave = ['player1'];
    const { getByText } = renderBlackjackArea();

    // Ensure player is leaving game message is displayed correctly
    expect(getByText('Leaving after the hand finishes.')).toBeInTheDocument();
  });

  test('renders BlackjackArea correctly when player is joining game', async () => {
    casinoAreaController.mockIsActive = false;
    const { getByText } = renderBlackjackArea();

    // Ensure player is joining game message is displayed correctly
    expect(getByText('Joining game...')).toBeInTheDocument();
  });

  test('renders BlackjackArea correctly when player is leaving game', async () => {
    casinoAreaController.mockIsActive = false;
    const { getByText } = renderBlackjackArea();

    // Ensure player is leaving game message is displayed correctly
    expect(getByText('Leaving game...')).toBeInTheDocument();
  });

  test('renders BlackjackArea correctly when player takes a screenshot', async () => {
    casinoAreaController.mockIsActive = false;
    const { getByText } = renderBlackjackArea();

    // Ensure player takes a screenshot message is displayed correctly
    expect(getByText('Taking a screenshot...')).toBeInTheDocument();
  });

  test('renders BlackjackArea correctly when player is waiting for dealer', async () => {
    casinoAreaController.mockStatus = 'OVER';
    const { getByText } = renderBlackjackArea();

    // Ensure player is waiting for dealer message is displayed correctly
    expect(getByText("Dealer's turn")).toBeInTheDocument();
  });

  test('renders BlackjackArea correctly when game is waiting to start and player is in game', async () => {
    casinoAreaController.mockStatus = 'WAITING_TO_START';
    casinoAreaController.mockIsPlayer = true;
    const { getByText } = renderBlackjackArea();

    // Ensure player can join game
    const joinButton = getByText('Join casino');
    expect(joinButton).toBeInTheDocument();
  });

  test('renders BlackjackArea correctly when player wants to leave and player is in game', async () => {
    casinoAreaController.mockWhoWantsToLeave = ['player1'];
    casinoAreaController.mockIsPlayer = true;
    const { getByText } = renderBlackjackArea();

    // Ensure player can join game
    const joinButton = getByText('Join casino');
    expect(joinButton).toBeInTheDocument();
  });

  test('renders BlackjackArea correctly when player has not placed a bet and player is in game', async () => {
    casinoAreaController.mockStake = 0;
    casinoAreaController.mockIsPlayer = true;
    const { getByText } = renderBlackjackArea();

    // Ensure player can join game
    const joinButton = getByText('Join casino');
    expect(joinButton).toBeInTheDocument();
  });

  test('renders BlackjackArea correctly when player has placed a bet and player is in game', async () => {
    casinoAreaController.mockStake = 100;
    casinoAreaController.mockIsPlayer = true;
    const { getByText } = renderBlackjackArea();

    // Ensure player can join game
    const joinButton = getByText('Join casino');
    expect(joinButton).toBeInTheDocument();
  });

  test('renders BlackjackArea correctly when game is inactive and player is in game', async () => {
    casinoAreaController.mockIsActive = false;
    casinoAreaController.mockIsPlayer = true;
    const { getByText } = renderBlackjackArea();

    // Ensure player can join game
    const joinButton = getByText('Join casino');
    expect(joinButton).toBeInTheDocument();
  });

  test('renders BlackjackArea correctly when game is active and player is in game', async () => {
    casinoAreaController.mockIsActive = true;
    casinoAreaController.mockIsPlayer = true;
    const { getByText } = renderBlackjackArea();

    // Ensure player can join game
    const joinButton = getByText('Join casino');
    expect(joinButton).toBeInTheDocument();
  });
});
