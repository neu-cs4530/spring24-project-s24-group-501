import { CasinoScore, PlayerID } from '../../../../shared/types/CoveyTownSocket';
import CasinoTracker from '../../../../townService/src/town/games/Blackjack/CasinoTracker';

export default function playerScores(): CasinoScore[] {
  // TODO: use Singleton
  new CasinoTracker().getPlayersCurrency().then(scores => {
    return scores;
  });
  return [];
}

export function playerRank(player: PlayerID): number {
  const scores = playerScores();
  for (let i = 0; i < scores.length; i++) {
    if (scores[i].player === player) {
      return i + 1;
    }
  }
  throw new Error('Player not registered in database');
}
