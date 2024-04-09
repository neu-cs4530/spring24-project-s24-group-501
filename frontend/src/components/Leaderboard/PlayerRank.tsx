import React, { useEffect, useState } from 'react';
import { CasinoRankScore } from '../../../../shared/types/CoveyTownSocket';
import PlayerTrackerFactory from '../../authentication/PlayerTrackerFactory';
import { numberComma } from '../Town/interactables/Blackjack/BlackjackUser';

type PlayerRankProps = {
  player: CasinoRankScore;
  index: number;
};
export default function PlayerRank({ player, index }: PlayerRankProps): JSX.Element {
  const [rank, setRank] = useState<string>('#');

  useEffect(() => {
    PlayerTrackerFactory.instance()
      .getPlayersCurrency()
      .then(scores => {
        for (let i = 0; i < scores.length; i++) {
          if (scores[i].player === player.player) {
            setRank((i + 1).toString());
          }
        }
      });
  });

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <span>{index}.</span>
      <span>{player.username}</span>-<span>${numberComma(player.netCurrency)}</span>
    </div>
  );
}
