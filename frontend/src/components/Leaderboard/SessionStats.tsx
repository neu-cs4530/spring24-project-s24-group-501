import React from 'react';
import { HStack, Text } from '@chakra-ui/react';
import { CasinoGame } from '../../../../shared/types/CoveyTownSocket';

type CasinoSessionProps = {
  game: CasinoGame;
  gamesPlayed: number;
};
export default function SessionStats({ game, gamesPlayed }: CasinoSessionProps): JSX.Element {
  return (
    <HStack>
      <Text>Game: {game}</Text>
      <Text>Games Played: {(gamesPlayed !== 0) ? gamesPlayed : "No Games Logged"}</Text>
    </HStack>
  );
}
