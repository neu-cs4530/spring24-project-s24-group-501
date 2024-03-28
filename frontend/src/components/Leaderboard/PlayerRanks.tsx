import React from 'react';
import playerScores from './Scores';
import { Box, Heading, ListItem, OrderedList } from '@chakra-ui/react';
import { CasinoScore } from '../../../../shared/types/CoveyTownSocket';
import PlayerRank from './PlayerRank';

/**
 * Lists the currency rankings of the top 10 players across towns
 */
export default function PlayersInTownList(): JSX.Element {
  const players: CasinoScore[] = playerScores().splice(10);

  return (
    <Box>
      <Heading as='h2' fontSize='l'>
        $$ Currency Leaderboard $$
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
