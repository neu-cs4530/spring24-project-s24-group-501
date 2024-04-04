import React, { useEffect, useState } from 'react';
import { Box, Heading, ListItem, OrderedList } from '@chakra-ui/react';
import { CasinoGame } from '../../../../shared/types/CoveyTownSocket';
import offeredGames from './Games';
import SessionStats from './SessionStats';
import PlayerTrackerFactory from '../../authentication/PlayerTrackerFactory';

type GameSessions = {
  game: CasinoGame;
  gamesPlayed: number;
}

/**
 * Lists how many sessions of each casino game have been played across towns
 * @returns the frequency of games component
 */
export default function CasinoGameFrequency(): JSX.Element {
  const games: CasinoGame[] = offeredGames();
  const [sessions, setSessions] = useState<GameSessions[]>([]);

  useEffect(() => {
    games.forEach(game => {
      PlayerTrackerFactory.instance().getCasinoSessions(game).then(casinoSessions => {
        setSessions([...sessions, { game, gamesPlayed: casinoSessions.length }]);
      });
    });
  }, [])

  return (
    <Box>
      <Heading as='h4' fontSize='l'>
        Frequency By Game
      </Heading>
      <OrderedList>
        {sessions.map(session => (
          <ListItem key={session.game}>
            <SessionStats game={session.game} gamesPlayed={session.gamesPlayed} />
          </ListItem>
        ))}
      </OrderedList>
    </Box>
  );
}
