import React from 'react';
import { Box, Heading, ListItem, OrderedList } from '@chakra-ui/react';
import { CasinoScore } from '../../../../shared/types/CoveyTownSocket';
import PlayerRank from './PlayerRank';
import playerScores from './Scores';

/**
 * Lists the currency rankings of the top 10 players across towns
 * @returns the top 10 rankings component
 */
export default function Top10PlayerRanks(): JSX.Element {
  const players: CasinoScore[] = playerScores().splice(10);

  return (
    <Box>
      <Heading as='h2' fontSize='l'>
        Currency Leaderboard
      </Heading>
      <OrderedList>
        {players.map(player => (
          <ListItem key={player.player}>
            <PlayerRank player={player} />
          </ListItem>
        ))}
      </OrderedList>
    </Box>
  );
}
