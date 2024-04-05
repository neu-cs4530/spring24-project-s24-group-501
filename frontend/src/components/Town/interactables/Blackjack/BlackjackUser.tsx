/* eslint-disable @next/next/no-img-element */
import React, { useRef } from 'react';
import BlackjackCard from './BlackjackCard';
import styles from './blackjack.module.css';
import { BlackjackPlayer, Card } from '../../../../types/CoveyTownSocket';

interface PlayerProps {
  username: string;
  cash: number;
  isCurrentTurn: boolean;
  hands: BlackjackPlayer;
  left?: boolean;
}

function numberComma(number: number) {
  let formattedNumber = number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  // Check if the number has exactly one decimal place
  const hasOneDecimalPlace = /\.\d$/.test(formattedNumber);

  // If it does, add a trailing zero
  if (hasOneDecimalPlace) {
    formattedNumber += '0';
  }

  return formattedNumber.replace('.00', '');
}

const BlackjackUser: React.FC<PlayerProps> = ({ username, cash, isCurrentTurn, hands, left }) => {
  const totalarc = 120;

  return (
    <div className={styles.player + (left ? ' left ' : '')}>
      <img alt='player' src='https://source.unsplash.com/random/?face' />
      <div className={styles.info + ' ' + (left ? styles.leftInfo : '')}>
        <div style={{ background: isCurrentTurn ? '#F1F105' : 'white' }}>{username}</div>
        <div style={{ background: isCurrentTurn ? '#F1F105' : 'white' }}>${numberComma(cash)}</div>
      </div>
      <div
        className={styles.cardHolder + ' ' + (left ? styles.leftCardHolder : '')}
        style={{ transform: `rotate(${left ? -30 : 30}deg)` }}>
        {hands?.hands.map((hand, handIndex) => {
          const numcards = hand.cards.length;

          const angles =
            numcards === 1
              ? [-20]
              : Array(numcards)
                  .fill('')
                  .map(
                    (a, i) =>
                      (totalarc / numcards) * (i + 1) - (totalarc / 2 + totalarc / numcards / 2),
                  );
          return (
            <>
              {hand.cards.map((card, cardIndex) => (
                <div
                  key={cardIndex}
                  style={{
                    transform: `rotate(${
                      angles[cardIndex] + (left && numcards === 1 ? 30 : 0)
                    }deg)`,
                    marginLeft: `${cardIndex === 0 ? 0 : Math.max(-numcards * 7 - 30, -70)}px`,
                    transformOrigin: 'bottom center',
                    marginTop: `${hands.hands.length > 1 && handIndex === 0 ? -50 : 0}px`,
                  }}>
                  <BlackjackCard type={card.type} value={card.value} faceUp={card.faceUp} />
                </div>
              ))}
            </>
          );
        })}
      </div>
    </div>
  );
};

export default BlackjackUser;
