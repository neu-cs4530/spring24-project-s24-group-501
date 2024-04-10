import { ChakraProvider } from '@chakra-ui/react';
import { render, screen } from '@testing-library/react';
import { mock, mockReset } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import { act } from 'react-dom/test-utils';
import React from 'react';
import { BlackjackCasinoState, CasinoArea, GameResult, InteractableType } from '../../../../types/CoveyTownSocket';
import CasinoAreaController, { CasinoEventTypes } from '../../../../classes/interactable/CasinoAreaController';
import CasinosArea, { INVALID_GAME_AREA_TYPE_MESSAGE } from './CasinosArea';
import TownControllerContext from '../../../../contexts/TownControllerContext';
import { randomLocation } from '../../../../TestUtils';
import PlayerController from '../../../../classes/PlayerController';
import BlackjackArea from '../Blackjack/BlackjackArea';
import ChatChannel from '../ChatChannel';
import ConnectFourArea from '../ConnectFour/ConnectFourArea';
import Leaderboard from '../Leaderboard';
import PhaserCasinoArea from './CasinoArea';
import TownController, * as TownControllerHooks from '../../../../classes/TownController';

const mockToast = jest.fn();
jest.mock('@chakra-ui/react', () => {
  const ui = jest.requireActual('@chakra-ui/react');
  const mockUseToast = () => mockToast;
  return {
    ...ui,
    useToast: mockUseToast,
  };
});
const mockCasinoArea = mock<PhaserCasinoArea>({
  id: nanoid(),
});
mockCasinoArea.name = 'Blackjack';
mockCasinoArea.getData.mockReturnValue('Blackjack');
jest.spyOn(TownControllerHooks, 'useInteractable').mockReturnValue(mockCasinoArea);

const useInteractableAreaControllerSpy = jest.spyOn(
  TownControllerHooks,
  'useInteractableAreaController',
);

const BLACK_JACK_ARE_TEST_ID = 'blackjackArea';
const connectFourAreaSpy = jest.spyOn(ConnectFourArea, 'default');
connectFourAreaSpy.mockReturnValue(<div data-testid={BLACK_JACK_ARE_TEST_ID} />);

const leaderboardComponentSpy = jest.spyOn(Leaderboard, 'default');
leaderboardComponentSpy.mockReturnValue(<div data-testid='leaderboard' />);

class MockCasinoAreaController extends CasinoAreaController<BlackjackCasinoState, CasinoEventTypes> {
  private _type: InteractableType = 'BlackjackArea';

  private _mockID: string;

  public constructor() {
    const id = nanoid();
    super(id, mock<CasinoArea<BlackjackCasinoState>>(), mock<TownController>());
    this._mockID = id;
  }

  public get id() {
    return this._mockID;
  }

  public set id(newID: string) {
    this._mockID = newID;
  }

  public set type(type: InteractableType) {
    this._type = type;
  }

  toInteractableAreaModel(): CasinoArea<BlackjackCasinoState> {
    if (!this._type) throw new Error('Type not set');
    const ret = mock<CasinoArea<BlackjackCasinoState>>();
    ret.type = this._type;
    return ret;
  }

  mockHistory: GameResult[] = [];

  mockObservers: PlayerController[] = [];

  get observers(): PlayerController[] {
    return this.mockObservers;
  }

  get history(): GameResult[] {
    return this.mockHistory;
  }

  public isActive(): boolean {
    return true;
  }
}
describe('CasinosArea', () => {
  // Spy on console.error and intercept react key warnings to fail test
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
  let gameAreaController = new MockCasinoAreaController();
  function setCasinoAreaControllerID(id: string) {
    gameAreaController.id = id;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    mockCasinoArea.id = id;
  }

  beforeEach(() => {
    ourPlayer = new PlayerController('player x', 'player x', randomLocation());
    mockReset(townController);
    useInteractableAreaControllerSpy.mockReturnValue(gameAreaController);
    setCasinoAreaControllerID(nanoid());
    leaderboardComponentSpy.mockClear();
    mockToast.mockClear();
    chatChannelSpy.mockClear();
  });
  function renderCasinosArea() {
    return render(
      <ChakraProvider>
        <TownControllerContext.Provider value={townController}>
          <CasinosArea />
        </TownControllerContext.Provider>
      </ChakraProvider>,
    );
  }

  describe('[T2.4] Rendering the correct game', () => {
    test('If the interactableID is for a ConnectFour game, the ConnectFourCasinoArea should be rendered', () => {
      gameAreaController.type = 'ConnectFourArea';
      renderCasinosArea();
      expect(screen.getByTestId(CONNECT_FOUR_AREA_TEST_ID)).toBeInTheDocument();
    });
    test('If the interactableID is for a Blackjack game, the BlackjackCasinoArea should be rendered', () => {
      gameAreaController.type = 'BlackjackArea';
      renderCasinosArea();
      expect(screen.getByTestId(TIC_TAC_TOE_AREA_TEST_ID)).toBeInTheDocument();
    });
    test('If the interactableID is NOT for a ConnectFour or Blackjack game, an error should be displayed', () => {
      gameAreaController.type = 'ViewingArea'; //Not a game!
      renderCasinosArea();

      expect(screen.queryByTestId(CONNECT_FOUR_AREA_TEST_ID)).toBeNull();
      expect(screen.queryByTestId(TIC_TAC_TOE_AREA_TEST_ID)).toBeNull();

      expect(screen.getByText(INVALID_GAME_AREA_TYPE_MESSAGE)).toBeInTheDocument();
    });
  });
  describe('[T2.2] Leaderboard', () => {
    it('Renders the leaderboard with the history when the component is mounted', () => {
      gameAreaController.mockHistory = [
        {
          gameID: nanoid(),
          scores: {
            [nanoid()]: 1,
            [nanoid()]: 0,
          },
        },
      ];
      renderCasinosArea();
      expect(leaderboardComponentSpy).toHaveBeenCalledWith(
        {
          results: gameAreaController.mockHistory,
        },
        {},
      );
    });
    it('Renders the leaderboard with the history when the game is updated', () => {
      gameAreaController.mockHistory = [
        {
          gameID: nanoid(),
          scores: {
            [nanoid()]: 1,
            [nanoid()]: 0,
          },
        },
      ];
      renderCasinosArea();
      expect(leaderboardComponentSpy).toHaveBeenCalledWith(
        {
          results: gameAreaController.mockHistory,
        },
        {},
      );

      gameAreaController.mockHistory = [
        {
          gameID: nanoid(),
          scores: {
            [nanoid()]: 1,
            [nanoid()]: 1,
          },
        },
      ];
      act(() => {
        gameAreaController.emit('gameUpdated');
      });
      expect(leaderboardComponentSpy).toHaveBeenCalledWith(
        {
          results: gameAreaController.mockHistory,
        },
        {},
      );
    });
  });
  describe('[T2.3] List of observers', () => {
    beforeEach(() => {
      gameAreaController.mockObservers = [
        new PlayerController('player 1', 'player 1', randomLocation()),
        new PlayerController('player 2', 'player 2', randomLocation()),
        new PlayerController('player 3', 'player 3', randomLocation()),
      ];
    });
    it('Displays the correct observers when the component is mounted', () => {
      renderCasinosArea();
      const observerList = screen.getByLabelText('list of observers in the game');
      const observerItems = observerList.querySelectorAll('li');
      expect(observerItems).toHaveLength(gameAreaController.mockObservers.length);
      for (let i = 0; i < observerItems.length; i++) {
        expect(observerItems[i]).toHaveTextContent(gameAreaController.mockObservers[i].userName);
      }
    });
    it('Displays the correct observers when the game is updated', () => {
      renderCasinosArea();
      act(() => {
        gameAreaController.mockObservers = [
          new PlayerController('player 1', 'player 1', randomLocation()),
          new PlayerController('player 2', 'player 2', randomLocation()),
          new PlayerController('player 3', 'player 3', randomLocation()),
          new PlayerController('player 4', 'player 4', randomLocation()),
        ];
        gameAreaController.emit('gameUpdated');
      });
      const observerList = screen.getByLabelText('list of observers in the game');
      const observerItems = observerList.querySelectorAll('li');
      expect(observerItems).toHaveLength(gameAreaController.mockObservers.length);
      for (let i = 0; i < observerItems.length; i++) {
        expect(observerItems[i]).toHaveTextContent(gameAreaController.mockObservers[i].userName);
      }
    });
  });
  describe('[T2.1] Listeners', () => {
    it('Registers exactly one listeners when mounted: for gameUpdated', () => {
      const addListenerSpy = jest.spyOn(gameAreaController, 'addListener');
      addListenerSpy.mockClear();

      renderCasinosArea();
      expect(addListenerSpy).toBeCalledTimes(1);
      expect(addListenerSpy).toHaveBeenCalledWith('gameUpdated', expect.any(Function));
    });
    it('Does not register listeners on every render', () => {
      const removeListenerSpy = jest.spyOn(gameAreaController, 'removeListener');
      const addListenerSpy = jest.spyOn(gameAreaController, 'addListener');
      addListenerSpy.mockClear();
      removeListenerSpy.mockClear();
      const renderData = renderCasinosArea();
      expect(addListenerSpy).toBeCalledTimes(1);
      addListenerSpy.mockClear();

      renderData.rerender(
        <ChakraProvider>
          <TownControllerContext.Provider value={townController}>
            <CasinosArea />
          </TownControllerContext.Provider>
        </ChakraProvider>,
      );

      expect(addListenerSpy).not.toBeCalled();
      expect(removeListenerSpy).not.toBeCalled();
    });
    it('Removes the listeners when the component is unmounted', () => {
      const removeListenerSpy = jest.spyOn(gameAreaController, 'removeListener');
      const addListenerSpy = jest.spyOn(gameAreaController, 'addListener');
      addListenerSpy.mockClear();
      removeListenerSpy.mockClear();
      const renderData = renderCasinosArea();
      expect(addListenerSpy).toBeCalledTimes(1);
      const addedListeners = addListenerSpy.mock.calls;
      const addedCasinoUpdateListener = addedListeners.find(call => call[0] === 'gameUpdated');
      expect(addedCasinoUpdateListener).toBeDefined();
      renderData.unmount();
      expect(removeListenerSpy).toBeCalledTimes(1);
      const removedListeners = removeListenerSpy.mock.calls;
      const removedCasinoUpdateListener = removedListeners.find(call => call[0] === 'gameUpdated');
      expect(removedCasinoUpdateListener).toEqual(addedCasinoUpdateListener);
    });
    it('Creates new listeners if the gameAreaController changes', () => {
      const removeListenerSpy = jest.spyOn(gameAreaController, 'removeListener');
      const addListenerSpy = jest.spyOn(gameAreaController, 'addListener');
      addListenerSpy.mockClear();
      removeListenerSpy.mockClear();
      const renderData = renderCasinosArea();
      expect(addListenerSpy).toBeCalledTimes(1);

      gameAreaController = new MockCasinoAreaController();
      const removeListenerSpy2 = jest.spyOn(gameAreaController, 'removeListener');
      const addListenerSpy2 = jest.spyOn(gameAreaController, 'addListener');

      useInteractableAreaControllerSpy.mockReturnValue(gameAreaController);
      renderData.rerender(
        <ChakraProvider>
          <TownControllerContext.Provider value={townController}>
            <CasinosArea />
          </TownControllerContext.Provider>
        </ChakraProvider>,
      );
      expect(removeListenerSpy).toBeCalledTimes(1);

      expect(addListenerSpy2).toBeCalledTimes(1);
      expect(removeListenerSpy2).not.toBeCalled();
    });
  });
  describe('[T2.5] Chat', () => {
    it('Renders a ChatChannel with the interactableID', () => {
      renderCasinosArea();
      expect(chatChannelSpy).toHaveBeenCalledWith(
        {
          interactableID: gameAreaController.id,
        },
        {},
      );
    });
    it('Re-renders the ChatChannel when the interactableID changes', () => {
      const renderData = renderCasinosArea();
      expect(chatChannelSpy).toHaveBeenCalledWith(
        {
          interactableID: gameAreaController.id,
        },
        {},
      );
      setCasinoAreaControllerID(nanoid());
      renderData.rerender(
        <ChakraProvider>
          <TownControllerContext.Provider value={townController}>
            <CasinosArea />
          </TownControllerContext.Provider>
        </ChakraProvider>,
      );
      expect(chatChannelSpy).toHaveBeenCalledWith(
        {
          interactableID: gameAreaController.id,
        },
        {},
      );
    });
  });
});
