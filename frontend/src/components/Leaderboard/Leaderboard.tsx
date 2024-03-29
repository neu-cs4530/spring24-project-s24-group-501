import React from 'react';
import { Heading, StackDivider, VStack } from '@chakra-ui/react';
import Top10PlayerRanks from './PlayerRanks';
import DailyCasinoSessions from './DailySessions';
import SessionsStats from './SessionsStats';

/**
 * Assembles a leaderboard component that displays the top 10 players, the daily casino sessions, and the statistics of the casino
 * @returns the leaderboard component
 */
export default function Leaderboard(): JSX.Element {
    return (
        <VStack align='left' spacing={2} border='2px' padding={2} borderColor='gray.500' height='100%' divider={<StackDivider borderColor='gray.200' />} borderRadius='4px'>
            <Heading fontSize='xl' as='h1'>
                Casino Statistics
            </Heading>
            <Top10PlayerRanks />
            <SessionsStats />
            <DailyCasinoSessions />
        </VStack>
    );
}
