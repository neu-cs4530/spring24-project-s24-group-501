import React from 'react';
import PlayerController from '../../classes/PlayerController';
import { playerRank } from './Scores';
import { HStack, Text } from '@chakra-ui/react';

type PlayerRankProps = {
  player: PlayerController;
};
export default function PlayerRank({ player }: PlayerRankProps): JSX.Element {
  return (
    <HStack>
      <Text>Rank: {playerRank(player.id)}</Text>
      <Text>User: {player.userName}</Text>
    </HStack>
  );
}
