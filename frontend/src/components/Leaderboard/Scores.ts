import { CasinoScore, PlayerID } from '../../../../shared/types/CoveyTownSocket';
import CasinoTracker from '../../../../townService/src/town/casino/CasinoTracker';

/**
 * Fetches all player balances from the database
 * @returns a list of player scores
 */
export default function playerScores(): CasinoScore[] {
  // TODO: use Singleton
  new CasinoTracker().getPlayersCurrency().then(scores => {
    return scores;
  });
  return [];
}

/**
 * Determines the rank of a player based on their currency balance
 * @param player the player to be compared
 * @returns the player's rank in the leaderboard
 */
export function playerRank(player: PlayerID): number {
  const scores = playerScores();
  for (let i = 0; i < scores.length; i++) {
    if (scores[i].player === player) {
      return i + 1;
    }
  }
  throw new Error('Player not registered in database');
}
