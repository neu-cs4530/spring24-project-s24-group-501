import React from 'react';
import { playerRank } from './Scores';
import { HStack, Text } from '@chakra-ui/react';
import { CasinoScore } from '../../../../shared/types/CoveyTownSocket';

type PlayerRankProps = {
  player: CasinoScore;
};
export default function PlayerRank({ player }: PlayerRankProps): JSX.Element {
  return (
    <HStack>
      <Text>Rank: {playerRank(player.player)}</Text>
      <Text>Units: {player.netCurrency}</Text>
    </HStack>
  );
}
