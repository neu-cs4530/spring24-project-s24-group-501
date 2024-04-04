import React, { useEffect, useState } from 'react';
import { Box, Heading, ListItem, OrderedList } from '@chakra-ui/react';
import { CasinoRankScore } from '../../../../shared/types/CoveyTownSocket';
import PlayerRank from './PlayerRank';
import PlayerTrackerFactory from '../../authentication/PlayerTrackerFactory';

/**
 * Lists the currency rankings of the top 10 players across towns
 * @returns the top 10 rankings component
 */
export default function Top10PlayerRanks(): JSX.Element {
  const [players, setPlayers] = useState<CasinoRankScore[]>([]);

  useEffect(() => {
    PlayerTrackerFactory.instance()
      .getPlayersCurrency()
      .then(scores => {
        setPlayers(scores.slice(0, 10));
      });
  }, [players]);

  return (
    <Box>
      <Heading as='h2' fontSize='l'>
        Currency Leaderboard
      </Heading>
      {players.length === 0 ? (
        <span>No player data to display.</span>
      ) : (
        <OrderedList>
          {players.map(player => (
            <ListItem key={player.player}>
              <PlayerRank player={player} />
            </ListItem>
          ))}
        </OrderedList>
      )}
    </Box>
  );
}
