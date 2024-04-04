import { CasinoGame } from '../../../../shared/types/CoveyTownSocket';

/**
 * Fetches the casino games available in CoveyTown
 * @returns a list of games offered in the casino
 */
export default function offeredGames(): CasinoGame[] {
  return ['Blackjack'];
}
