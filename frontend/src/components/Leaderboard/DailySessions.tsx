import { CasinoGame } from "../../../../shared/types/CoveyTownSocket";
import offeredGames from "./Games";
import { Box, Heading } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import PlayerTrackerFactory from "../../authentication/PlayerTrackerFactory";

/**
 * Assembles a component to display the total number of casino sessions played today
 * @returns the daily sessions component
 */
export default function DailyCasinoSessions(): JSX.Element {
  const games: CasinoGame[] = offeredGames();
  const [totalSessions, setTotalSessions] = useState<number>(0);

  useEffect(() => {
    let totalSessionsToday = 0;
    const today = new Date();
    games.forEach(game => {
      PlayerTrackerFactory.instance().getCasinoSessions(game).then(sessions => {
        sessions.filter(session => {
          session.date.getFullYear() === today.getFullYear() &&
          session.date.getMonth() === today.getMonth() &&
          session.date.getDate() === today.getDate();
        });
        totalSessionsToday += sessions.length;
        setTotalSessions(totalSessionsToday);
      });
    });
  }, [totalSessions, games]);

return (
  <Box>
    <Heading as='h4' fontSize='l'>Daily Casino Tables Started</Heading>
    {totalSessions === 0 ? 
      <span>No casino games played today.</span> 
      : 
      <span>{totalSessions} casino games played today!</span>}
  </Box>
);
}