import { CasinoGame, CasinoSession } from "../../../../shared/types/CoveyTownSocket";
import CasinoTracker from "../../../../townService/src/town/games/Blackjack/CasinoTracker";

/**
 * Fetches the casino games available in CoveyTown
 * @returns a list of games offered in the casino
 */
export default function offeredGames(): CasinoGame[] {
    return ['Blackjack'];
}

/**
 * Retrieves all logged sessions for a casino game
 * @param game the casino game
 * @returns all sessions of the given game
 */
export function sessionsByGame(game: CasinoGame): CasinoSession[] {
    // TODO: use Singleton
    new CasinoTracker().getCasinoSessions(game).then(sessions => {
      return sessions;
    });
    return [];
  }
  