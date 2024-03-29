import { CasinoGame } from "../../../../shared/types/CoveyTownSocket";
import offeredGames, { sessionsByGame } from "./Games";
import { Box, Heading, Text } from "@chakra-ui/react";

/**
 * Assembles a component to display the total number of casino sessions played today
 * @returns the daily sessions component
 */
export default function DailyCasinoSessions(): JSX.Element {
  const games: CasinoGame[] = offeredGames();
  const today = new Date();
  let totalSessionsToday = 0;
  games.forEach(game => {
    const gameSessionsToday = sessionsByGame(game).filter(session => {
        session.date.getFullYear() === today.getFullYear() &&
        session.date.getMonth() === today.getMonth() &&
        session.date.getDate() === today.getDate();
    });
    totalSessionsToday += gameSessionsToday.length;
  })

return (
    <Box>
        <Heading as='h4' fontSize='l'>
            Daily Casino Sessions
        </Heading>
        <Text>Total Sessions Today: {totalSessionsToday}</Text>
    </Box>
);
}