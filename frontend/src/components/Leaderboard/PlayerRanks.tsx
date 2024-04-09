import React, { useEffect, useState } from 'react';
import { Box } from '@chakra-ui/react';
import { CasinoRankScore } from '../../../../shared/types/CoveyTownSocket';
import PlayerRank from './PlayerRank';
import PlayerTrackerFactory from '../../authentication/PlayerTrackerFactory';
import styles from './PlayerRanks.module.css';

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
    <Box className={styles.casinoRank}>
      <p>Biggest Casino Winners </p>
      {players.length === 0 ? (
        <span>No player data to display.</span>
      ) : (
        <>
          {players.map((player, i) => (
            <PlayerRank key={i} player={player} />
          ))}
        </>
      )}
    </Box>
  );
}
