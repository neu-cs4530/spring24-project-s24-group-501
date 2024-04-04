import { Heading, StackDivider, VStack } from '@chakra-ui/react';
import React from 'react';
import Leaderboard from '../Leaderboard/Leaderboard';
import Top10PlayerRanks from '../Leaderboard/PlayerRanks';
import PlayerRanks from '../Leaderboard/PlayerRanks';
import InteractableAreasList from './InteractableAreasList';
import PlayersList from './PlayersList';

export default function SocialSidebar(): JSX.Element {
  return (
    <VStack
      align='left'
      spacing={2}
      border='2px'
      padding={2}
      marginLeft={2}
      borderColor='gray.500'
      height='100%'
      divider={<StackDivider borderColor='gray.200' />}
      borderRadius='4px'>
      <Heading fontSize='xl' as='h1'>
        Players In This Town
      </Heading>
      <PlayersList />
      <InteractableAreasList />
    </VStack>
  );
}
