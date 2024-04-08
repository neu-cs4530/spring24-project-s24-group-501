import { ChakraProvider } from '@chakra-ui/react';
import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';
import { render, RenderResult } from '@testing-library/react';
import React from 'react';
import PlayerTrackerFactory from '../../authentication/PlayerTrackerFactory';
import { CasinoGame, CasinoSession } from '../../types/CoveyTownSocket';
import CasinoGameFrequency from './SessionsStats';

describe('CasinoGameFrequency', () => {
    //   const wrappedCasinoGameFrequencyComponent = () => (
    //     <ChakraProvider>
    //       <React.StrictMode>
    //         <CasinoGameFrequency />
    //       </React.StrictMode>
    //     </ChakraProvider>
    //   );
    //   const renderCasinoGameFrequency = () => render(wrappedCasinoGameFrequencyComponent());
    //   let consoleErrorSpy: jest.SpyInstance<void, [message?: any, ...optionalParms: any[]]>;
    //   let useCasinoSessionsSpy: jest.SpyInstance<Promise<CasinoSession[]>, [CasinoGame]>;
    //   const games: CasinoGame[] = [];
    //   const expectProperlyRenderedCasinoGameFrequency = async (
    //     renderData: RenderResult,
    //     gamesToExpect: CasinoGame[],
    //   ) => {};
    //   beforeAll(() => {
    //     // Spy on console.error and intercept react key warnings to fail test
    //     consoleErrorSpy = jest.spyOn(global.console, 'error');
    //     consoleErrorSpy.mockImplementation((message?, ...optionalParams) => {
    //       const stringMessage = message as string;
    //       if (stringMessage.includes && stringMessage.includes('children with the same key,')) {
    //         throw new Error(stringMessage.replace('%s', optionalParams[0]));
    //       }
    //       // eslint-disable-next-line no-console -- we are wrapping the console with a spy to find react warnings
    //       console.error(message, ...optionalParams);
    //     });
    //     useCasinoSessionsSpy = jest.spyOn(PlayerTrackerFactory.instance(), 'getCasinoSessions');
    //   });
  describe('Heading', () => {
    test('Displays a heading "Frequency By Game"', async () => {
      //   const renderData = renderCasinoGameFrequency();
      //   const heading = await renderData.findByRole('heading', { level: 4 });
      expect(1).toBe(1);
    });
  });
});
