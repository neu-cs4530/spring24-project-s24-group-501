import React from 'react';
import { Box } from '@chakra-ui/react';
import PlayerRank from './PlayerRank';
import styles from './PlayerRanks.module.css';
import useTownController from '../../hooks/useTownController';

/**
 * Lists the currency ranking for the player
 * @returns the individual players rank component
 */
export default function YourRank(): JSX.Element {
  const townController = useTownController();

  return (
    <Box className={styles.casinoRank}>
      <p>Your Casino Rank</p>
      <PlayerRank
        player={{
          netCurrency: townController.ourPlayer.units,
          player: townController.ourPlayer.id,
          username: 'Me',
        }}
      />
    </Box>
  );
}
