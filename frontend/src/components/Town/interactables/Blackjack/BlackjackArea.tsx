import React, { useEffect, useState } from 'react';
import BlackjackAreaController from '../../../../classes/interactable/BlackjackAreaController';
import PlayerController from '../../../../classes/PlayerController';
import { useInteractableAreaController } from '../../../../classes/TownController';
import useTownController from '../../../../hooks/useTownController';
import {
  GameStatus,
  BlackjackPlayer,
  InteractableID,
  Card,
} from '../../../../types/CoveyTownSocket';
import BlackjackBetSetter from './BlackjackBetSetter';
import BlackjackUser from './BlackjackUser';

import styles from './blackjack.module.css';
import BlackjackCard from './BlackjackCard';

export default function BlackjackArea({
  interactableID,
}: {
  interactableID: InteractableID;
}): JSX.Element {
  const casinoAreaController =
    useInteractableAreaController<BlackjackAreaController>(interactableID);
  const townController = useTownController();
  console.log(townController);

  const [joiningGame, setJoiningGame] = useState(false);
  const [players, setPlayers] = useState<PlayerController[]>([]);
  const [hands, setHands] = useState<BlackjackPlayer[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);

  const [gameStatus, setGameStatus] = useState<GameStatus>(casinoAreaController.status);

  useEffect(() => {
    const updateGameState = () => {
      setGameStatus(casinoAreaController.status || 'WAITING_FOR_PLAYERS');
      setHands(casinoAreaController.hands || []);
      console.log(casinoAreaController);
      console.log(hands);
      setDealerHand(casinoAreaController.dealerHand || []);
      setPlayers(casinoAreaController.players);
      console.log(players);
    };

    console.log(casinoAreaController);

    casinoAreaController.addListener('gameUpdated', updateGameState);
    return () => {
      casinoAreaController.removeListener('gameUpdated', updateGameState);
    };
  }, [casinoAreaController]);

  let gameStatusText = <></>;

  if (gameStatus === 'IN_PROGRESS') {
    gameStatusText = <>Game in progress</>;
  } else if (gameStatus === 'WAITING_TO_START') {
    gameStatusText = <b>BETTING STAGE.</b>;
  } else {
    const joinCasinoButton = (
      <button
        onClick={async () => {
          setJoiningGame(true);
          casinoAreaController.joinCasino();
          setJoiningGame(false);
        }}
        disabled={joiningGame}>
        Join casino
      </button>
    );
    let gameStatusStr;
    if (gameStatus === 'OVER') gameStatusStr = 'over';
    else if (gameStatus === 'WAITING_FOR_PLAYERS') gameStatusStr = 'waiting for players to join';
    gameStatusText = joinCasinoButton;
  }

  return (
    <>
      <div className={styles.board}>
        <div>
          <div style={{ position: 'fixed' }}>{gameStatusText}</div>

          <div className={styles.dealer}>
            {/*      {dealerHand.length > 0 && dealerHand[0].faceUp &&  (
                     <p
                     className={styles.countIndicator}
                     style={{
                       transform: `rotate(${left ? 30 : -30}deg)`,
                       background: hand.bust ? '#F20C43' : 'white',
                     }}>
                     {hand.text}
                   </p>
            )} */}
            {dealerHand.map((card, i) => (
              <BlackjackCard key={i} type={card.type} faceUp={card.faceUp} value={card.value} />
            ))}
          </div>
        </div>

        {gameStatus === 'WAITING_TO_START' &&
          hands.find(hand => hand.player === townController.ourPlayer.id)?.hands[0]?.wager ===
            0 && (
            <BlackjackBetSetter
              stake={casinoAreaController.stake}
              placeBet={bet => {
                casinoAreaController.placeBet(bet);
              }}
            />
          )}

        {gameStatus === 'IN_PROGRESS' &&
          casinoAreaController.currentPlayer !== -1 &&
          hands.find(hand => hand.player === townController.ourPlayer.id)?.active && (
            <div className={styles.selectors}>
              <button
                onClick={() => {
                  casinoAreaController.applyMove({
                    player: townController.ourPlayer.id,
                    action: 'Stand',
                  });
                }}>
                Stand
              </button>
              <button
                onClick={() => {
                  casinoAreaController.applyMove({
                    player: townController.ourPlayer.id,
                    action: 'Hit',
                  });
                }}>
                Hit
              </button>
              {casinoAreaController.canDoubleDown && (
                <button
                  onClick={() => {
                    casinoAreaController.applyMove({
                      player: townController.ourPlayer.id,
                      action: 'Double Down',
                    });
                  }}>
                  Double Down
                </button>
              )}
              {casinoAreaController.canSplit && (
                <button
                  onClick={() => {
                    casinoAreaController.applyMove({
                      player: townController.ourPlayer.id,
                      action: 'Split',
                    });
                  }}>
                  Split
                </button>
              )}
            </div>
          )}

        <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px' }}>
          {players.map((player, i) => (
            <BlackjackUser
              key={i}
              isCurrentTurn={
                (gameStatus === 'IN_PROGRESS' &&
                  hands.find(hand => hand.player === townController.ourPlayer.id)?.active) ||
                false
              }
              username={player.userName}
              cash={player.units}
              left={players.length > 1 && i === players.length - 1}
              hands={hands.find(hand => hand.player === townController.ourPlayer.id)}
            />
          ))}
        </div>
      </div>
    </>
  );
}
