import React, { useState } from 'react';
import styles from './blackjack.module.css';

export default function BlackjackBetSetter() {
  const [betAmount, setBetAmount] = useState(10); // State to hold the value of the slider

  const handleSliderChange = event => {
    setBetAmount(parseInt(event.target.value)); // Update the state with the slider value
  };

  return (
    <div className={styles.selectorHolder}>
      <p>Place Your Bets</p>
      <div className={styles.slider}>
        <input
          type='range'
          min='10'
          step='10'
          max='100'
          value='10'
          value={betAmount}
          onChange={handleSliderChange}
        />
      </div>
      <button>Bet ${betAmount}</button> {/* Display the current bet amount */}
    </div>
  );
}
