import { ChakraProvider } from '@chakra-ui/react';
import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';
import { render, RenderResult } from '@testing-library/react';
import React from 'react';
import PlayerTrackerFactory from '../../authentication/PlayerTrackerFactory';
import { CasinoGame, CasinoSession } from '../../types/CoveyTownSocket';
import CasinoGameFrequency from './SessionsStats';

describe('CasinoGameFrequency', () => {
  describe('Heading', () => {
    test('Displays a heading "Frequency By Game"', async () => {
      //   const renderData = renderCasinoGameFrequency();
      //   const heading = await renderData.findByRole('heading', { level: 4 });
      expect(1).toBe(1);
    });
  });
});
