import React from 'react';
import { CasinoGame } from '../../../../shared/types/CoveyTownSocket';

type CasinoSessionProps = {
  game: CasinoGame | undefined;
  gamesPlayed: number;
};
export default function SessionStats({ game, gamesPlayed }: CasinoSessionProps): JSX.Element {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <span>{game ? game : 'Daily'}</span>-<span>{gamesPlayed}</span>
    </div>
  );
}
