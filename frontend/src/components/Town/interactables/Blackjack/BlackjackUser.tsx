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
  photo?: string;
  changePhoto: () => void;
}

export function numberComma(number: number) {
  let formattedNumber = number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  // Check if the number has exactly one decimal place
  const hasOneDecimalPlace = /\.\d$/.test(formattedNumber);

  // If it does, add a trailing zero
  if (hasOneDecimalPlace) {
    formattedNumber += '0';
  }

  return formattedNumber.replace('.00', '');
}

const BlackjackUser: React.FC<PlayerProps> = ({
  username,
  cash,
  isCurrentTurn,
  hands,
  left,
  photo,
  changePhoto,
}) => {
  const totalarc = 120;

  return (
    <div className={styles.player + (left ? ' left ' : '')}>
      {hands?.hands[0]?.wager !== 0 && (
        <div className={styles.wagerHolder} style={{ marginLeft: left ? '-80px' : '0px' }}>
          <p>${hands?.hands[0]?.wager}</p>
          <img src={'/assets/casino/hand.png'} alt='hand' />
        </div>
      )}
      <img
        onClick={changePhoto}
        alt='player'
        src={photo || 'https://source.unsplash.com/random/?face'}
      />
      <div className={styles.info + ' ' + (left ? styles.leftInfo : '')}>
        <div style={{ background: isCurrentTurn ? '#F1F105' : 'white' }}>{username}</div>
        <div style={{ background: isCurrentTurn ? '#F1F105' : 'white' }}>${numberComma(cash)}</div>
      </div>
      {hands?.hands.some(hand => hand.outcome === 'Win') && (
        <div className={styles.money}>
          <img alt='money falling' src='/assets/casino/money.gif' />
        </div>
      )}

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
          <div
            key={handIndex}
            className={styles.cardHolder + ' ' + (left ? styles.leftCardHolder : '')}
            style={{
              transform: `rotate(${left ? -30 : 30}deg)`,
              marginTop: `${hands.hands.length > 1 && handIndex === 0 ? -50 : 40}px`,
            }}>
            {numcards > 0 && (
              <p
                className={styles.countIndicator}
                style={{
                  transform: `rotate(${left ? 30 : -30}deg)`,
                  background:
                    hand.outcome === 'Bust' || hand.outcome === 'Loss'
                      ? '#F20C43'
                      : hands?.hands.length > 1 && hands.currentHand === handIndex
                      ? '#f1f105'
                      : 'white',
                }}>
                {hand.text}
              </p>
            )}
            {hand.cards.map((card, cardIndex) => (
              <div
                key={cardIndex}
                style={{
                  transform: `rotate(${angles[cardIndex] + (left && numcards === 1 ? 30 : 0)}deg)`,
                  marginLeft: `${cardIndex === 0 ? 0 : Math.max(-numcards * 7 - 30, -70)}px`,
                  transformOrigin: 'bottom center',
                }}>
                <BlackjackCard type={card.type} value={card.value} faceUp={card.faceUp} />
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
};

export default BlackjackUser;
