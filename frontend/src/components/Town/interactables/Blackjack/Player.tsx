/* eslint-disable @next/next/no-img-element */
import React, { useRef } from 'react';
import BlackjackCard from './BlackjackCard';
import styles from './blackjack.module.css';
import { Card } from '../../../../types/CoveyTownSocket';

interface PlayerProps {
  username: string;
  cash: number;
  isCurrentTurn: boolean;
  cards: Card[];
  left?: boolean;
}

const Player: React.FC<PlayerProps> = ({ username, cash, isCurrentTurn, cards, left }) => {
  const totalarc = 120;
  const numcards = cards.length;

  const angles =
    numcards === 1
      ? [-20]
      : Array(numcards)
          .fill('')
          .map(
            (a, i) => (totalarc / numcards) * (i + 1) - (totalarc / 2 + totalarc / numcards / 2),
          );

  return (
    <div className={styles.player + (left && ' left')}>
      <img alt='player' src='https://source.unsplash.com/random/?face' />
      <div className={styles.info}>
        <div>{username}</div>
        <div>${cash}</div>
      </div>
      <div className={styles.cardHolder} style={{ transform: `rotate(${left ? -30 : 30}deg)` }}>
        {cards.map((card, index) => (
          <div
            key={index}
            style={{
              transform: `rotate(${angles[index]}deg)`,
              marginLeft: `${index === 0 ? 0 : Math.max(-cards.length * 7 - 30, -70)}px`,
              transformOrigin: 'bottom center',
            }}>
            <BlackjackCard type={card.type} value={card.value} faceUp={card.faceUp} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Player;
