import React, { useEffect, useState } from 'react';
import { CasinoRankScore } from '../../../../shared/types/CoveyTownSocket';
import PlayerTrackerFactory from '../../authentication/PlayerTrackerFactory';
import { numberComma } from '../Town/interactables/Blackjack/BlackjackUser';

type PlayerRankProps = {
  player: CasinoRankScore;
};
export default function PlayerRank({ player }: PlayerRankProps): JSX.Element {
  const [rank, setRank] = useState<string>('#');

  useEffect(() => {
    PlayerTrackerFactory.instance()
      .getPlayersCurrency()
      .then(scores => {
        for (let i = 0; i < scores.length; i++) {
          if (scores[i].player === player.player) {
            setRank((i + 1).toString());
            break;
          }
        }
      });
  });

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <span>{rank}.</span>
      <span>{player.username}</span>-<span>${numberComma(player.netCurrency)}</span>
    </div>
  );
}
