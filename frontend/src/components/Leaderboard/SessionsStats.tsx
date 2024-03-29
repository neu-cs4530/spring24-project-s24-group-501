import React from 'react';
import { Box, Heading, ListItem, OrderedList } from '@chakra-ui/react';
import { CasinoGame } from '../../../../shared/types/CoveyTownSocket';
import offeredGames, { sessionsByGame } from './Games';
import SessionStats from './SessionStats';

/**
 * Lists how many sessions of each casino game have been played across towns
 * @returns the frequency of games component
 */
export default function CasinoGameFrequency(): JSX.Element {
  const games: CasinoGame[] = offeredGames();

  return (
    <Box>
      <Heading as='h4' fontSize='l'>
        Frequency By Game
      </Heading>
      <OrderedList>
        {games.map(game => (
          <ListItem key={game}>
            <SessionStats game={game} gamesPlayed={sessionsByGame(game).length} />
          </ListItem>
        ))}
      </OrderedList>
    </Box>
  );
}
