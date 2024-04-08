import React, { useState } from 'react';
import styles from './blackjack.module.css';

export default function BlackjackBetSetter({
  stake,
  placeBet,
}: {
  stake: number;
  placeBet: (betAmount: number) => void;
}) {
  const [betAmount, setBetAmount] = useState(stake); // State to hold the value of the slider

  const handleSliderChange = (event: { target: { value: string } }) => {
    setBetAmount(parseInt(event.target.value)); // Update the state with the slider value
  };

  return (
    <div className={styles.selectorHolder}>
      <p>Place Your Bets</p>
      <div className={styles.slider}>
        <input
          type='range'
          min={stake}
          step={stake}
          max={stake * 10}
          value={betAmount}
          onChange={handleSliderChange}
        />
      </div>
      <button
        onClick={() => {
          placeBet(betAmount);
        }}>
        Bet ${betAmount}
      </button>
    </div>
  );
}
