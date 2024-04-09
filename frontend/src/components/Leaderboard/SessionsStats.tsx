import React, { useEffect, useState } from 'react';
import { Box } from '@chakra-ui/react';
import { CasinoGame } from '../../../../shared/types/CoveyTownSocket';
import offeredGames from './Games';
import SessionStats from './SessionStats';
import PlayerTrackerFactory from '../../authentication/PlayerTrackerFactory';
import styles from './PlayerRanks.module.css';

type GameSessions = {
  game: CasinoGame;
  gamesPlayed: number;
};

/**
 * Lists how many sessions of each casino game have been played across towns
 * @returns the frequency of games component
 */
export default function CasinoGameFrequency(): JSX.Element {
  const games: CasinoGame[] = offeredGames();
  const [sessions, setSessions] = useState<GameSessions[]>([]);

  useEffect(() => {
    const fetchGameSessions = async () => {
      const updatedSessions: GameSessions[] = [];
      for (const game of games) {
        const casinoSessions = await PlayerTrackerFactory.instance().getCasinoSessions(game);
        updatedSessions.push({ game, gamesPlayed: casinoSessions.length });
      }
      setSessions(updatedSessions);
    };

    fetchGameSessions();
  }, [games]);

  return (
    <Box className={styles.casinoRank}>
      <p>Games Played All-time</p>
      {sessions.length === 0 ? (
        <span>No game data to display.</span>
      ) : (
        <>
          {sessions.map((session, i) => (
            <SessionStats key={i} game={session.game} gamesPlayed={session.gamesPlayed} />
          ))}
        </>
      )}
    </Box>
  );
}
