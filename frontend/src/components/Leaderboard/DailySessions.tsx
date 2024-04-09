import React from 'react';
import { CasinoGame } from '../../../../shared/types/CoveyTownSocket';
import offeredGames from './Games';
import { Box } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import PlayerTrackerFactory from '../../authentication/PlayerTrackerFactory';
import SessionStats from './SessionStats';
import styles from './PlayerRanks.module.css';

/**
 * Assembles a component to display the total number of casino sessions played today
 * @returns the daily sessions component
 */
export default function DailyCasinoSessions(): JSX.Element {
  const games: CasinoGame[] = offeredGames();
  const [totalSessions, setTotalSessions] = useState<number>(0);

  useEffect(() => {
    const fetchDailySessions = async () => {
      let totalSessionsToday = 0;
      const today = new Date();

      const sessionsPromises = games.map(async game => {
        const sessions = await PlayerTrackerFactory.instance().getCasinoSessions(game);
        return sessions.filter(session => {
          const sessionDate = new Date(session.date);
          return (
            sessionDate.getFullYear() === today.getFullYear() &&
            sessionDate.getMonth() === today.getMonth() &&
            sessionDate.getDate() === today.getDate()
          );
        }).length;
      });

      const sessionsCounts = await Promise.all(sessionsPromises);
      totalSessionsToday = sessionsCounts.reduce((acc, count) => acc + count, 0);
      setTotalSessions(totalSessionsToday);
    };

    fetchDailySessions();
  }, [games]);

  return (
    <Box className={styles.casinoRank}>
      <p>Games Played Today</p>
      {totalSessions === 0 ? (
        <span>No game data to display.</span>
      ) : (
        <SessionStats game={undefined} gamesPlayed={totalSessions} />
      )}
    </Box>
  );
}
