import React from 'react';
import { CasinoGame } from '../../../../shared/types/CoveyTownSocket';

type CasinoSessionProps = {
  game: CasinoGame;
  gamesPlayed: number;
};
export default function SessionStats({ game, gamesPlayed }: CasinoSessionProps): JSX.Element {
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <div style={{ marginRight: '10px' }}>
        <span>Game: </span>
        <span>{game}</span>
      </div>
      <div>
        <span>Games Played: </span>
        <span>{gamesPlayed}</span>
      </div>
    </div>
  );
}
