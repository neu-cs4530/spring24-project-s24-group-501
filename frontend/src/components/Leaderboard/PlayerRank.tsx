import React, { useEffect, useState } from 'react';
import { CasinoRankScore } from '../../../../shared/types/CoveyTownSocket';
import PlayerTrackerFactory from '../../authentication/PlayerTrackerFactory';

type PlayerRankProps = {
  player: CasinoRankScore;
};
export default function PlayerRank({ player }: PlayerRankProps): JSX.Element {
  const [rank, setRank] = useState<string>('#');

  useEffect(() => {
    PlayerTrackerFactory.instance().getPlayersCurrency().then(scores => {
      for (let i = 0; i < scores.length; i++) {
        if (scores[i].player === player.player) {
          setRank((i + 1).toString());
        }
      }
    });
  })

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <div style={{ marginRight: '10px' }}>
        <span>Rank: </span>
        <span>{rank}</span>
      </div>
      <div style={{ marginRight: '10px' }}>
        <span>User: </span>
        <span>{player.username}</span>
      </div>
      <div>
        <span>Units: </span>
        <span>{player.netCurrency}</span>
      </div>
    </div>
  );
}
