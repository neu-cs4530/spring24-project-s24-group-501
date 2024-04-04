import { HStack } from '@chakra-ui/react';
import React from 'react';
import PlayerController from '../../classes/PlayerController';

type PlayerNameProps = {
  player: PlayerController;
};
export default function PlayerName({ player }: PlayerNameProps): JSX.Element {
  return <HStack>
  {player.userName}
  {player.units}
  </HStack>;
}
