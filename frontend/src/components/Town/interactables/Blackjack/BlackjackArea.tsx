import React, { useEffect, useState } from 'react';
import BlackjackAreaController from '../../../../classes/interactable/BlackjackAreaController';
import PlayerController from '../../../../classes/PlayerController';
import { useInteractableAreaController } from '../../../../classes/TownController';
import useTownController from '../../../../hooks/useTownController';
import {
  GameStatus,
  BlackjackPlayer,
  InteractableID,
  BlackjackDealer,
} from '../../../../types/CoveyTownSocket';
import BlackjackBetSetter from './BlackjackBetSetter';
import BlackjackUser from './BlackjackUser';

import styles from './blackjack.module.css';
import BlackjackCard from './BlackjackCard';
import { nanoid } from 'nanoid';

/**
 * The BlackjackArea component renders the Blackjack game area.
 * It renders the current state of the area, optionally allowing the player to join the game.
 * 
 * It uses the BlackjackAreaController to get the current state of the game.
 * It listens for the 'casinoUpdated' event on the controller, and re-renders accordingly.
 * It subscribes to these events when the component mounts, and unsubscribes when the component unmounts. It also unsubscribes when the gameAreaController changes.
 * 
 * It renders the following:
 * - A message indicating the current game status:
 *  - If the game is in progress, the message is 'Game in progress'
 *  - If the game is in status WAITING_FOR_PLAYERS, the message is 'BETTING STAGE.'
 *  - If the game is in status OVER, the message is 'Dealer's turn'
 * - If the game is in status WAITING_TO_START, a button to join the game is displayed, with the text 'Join casino'
 * - If the game is in status WAITING_TO_START and the player has not placed a bet, a BlackjackBetSetter component is displayed
 * - If the game is in status IN_PROGRESS and it is the player's turn, a set of buttons to make a move is displayed
 *   - The buttons are 'Stand', 'Hit', 'Double Down', and 'Split'
 *   - The buttons call the applyMove method on the CasinoAreaController with the appropriate action
 *   - The buttons are disabled if the player cannot make that move
 *   - The buttons are hidden if it is not the player's turn
 * - If the game is in status WAITING_TO_START and the player has joined, a button to leave the game is displayed, with the text 'Leave casino'
 * - Animations for different game states
 * 
 * For each player in the game, a BlackjackUser component is displayed, showing the player's username, cash, and hands.
 * 
 * Components were tested manually to avoid token errors with css modules.
 *
 */
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
  const [leavingGame, setLeavingGame] = useState(false);
  const [players, setPlayers] = useState<PlayerController[]>([]);
  const [hands, setHands] = useState<BlackjackPlayer[]>([]);
  const [dealerHand, setDealerHand] = useState<BlackjackDealer | undefined>(
    casinoAreaController.dealerHand,
  );
  const [gameStatus, setGameStatus] = useState<GameStatus>(casinoAreaController.status);
  const [activePlayer, setActivePlayer] = useState<number>(-1);

  useEffect(() => {
    const updateGameState = () => {
      setGameStatus(casinoAreaController.status || 'WAITING_FOR_PLAYERS');
      setHands(casinoAreaController.hands || []);
      setDealerHand(casinoAreaController.dealerHand);
      setPlayers(casinoAreaController.players);
      setActivePlayer(
        typeof casinoAreaController.currentPlayer === 'number'
          ? casinoAreaController.currentPlayer
          : -1,
      );
    };

    console.log('BlackjackAreaController', casinoAreaController);
    casinoAreaController.addListener('casinoUpdated', updateGameState);
    return () => {
      casinoAreaController.removeListener('casinoUpdated', updateGameState);
    };
  }, [casinoAreaController]);

  const captureWebcamScreenshot = async () => {
    const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
    const videoElement = document.createElement('video');
    videoElement.srcObject = mediaStream;
    await videoElement.play();

    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
      const base64Data = canvas.toDataURL('image/jpeg');
      return base64Data;
    }
    return null;
  };

  let gameStatusText = <></>;

  if (gameStatus === 'IN_PROGRESS') {
    gameStatusText = <>Game in progress</>;
  } else if (
    gameStatus === 'WAITING_TO_START' &&
    hands.find(hand => hand.player === townController.ourPlayer.id)
  ) {
    gameStatusText = <b>BETTING STAGE.</b>;
  } else if (gameStatus === 'OVER') {
    gameStatusText = <b>Dealer&apos;s turn</b>;
  } else {
    gameStatusText = (
      <button
        onClick={async () => {
          setJoiningGame(true);
          let webcamScreenshot: string | null;
          try {
            webcamScreenshot = await captureWebcamScreenshot();
          } catch (e) {
            console.error('Failed to capture webcam screenshot', e);
          }
          casinoAreaController.joinCasino().then(() => {
            casinoAreaController.setPlayerPhoto(webcamScreenshot ?? '');
            setJoiningGame(false);
          });
        }}
        disabled={joiningGame}>
        Join casino
      </button>
    );
  }

  let leaveStatusText = <></>;
  if (
    hands.find(hand => hand.player === townController.ourPlayer.id) &&
    gameStatus === 'WAITING_TO_START'
  ) {
    leaveStatusText = (
      <button
        onClick={() => {
          setLeavingGame(true);
          casinoAreaController.leaveCasino();
          setLeavingGame(false);
        }}
        disabled={leavingGame}>
        Leave casino
      </button>
    );
  }

  return (
    <>
      <div className={styles.board}>
        <div>
          <div style={{ position: 'fixed', top: '20px', left: '190px' }}>{leaveStatusText}</div>
          <div style={{ position: 'fixed' }}>{gameStatusText}</div>

          <div className={styles.dealer}>
            {casinoAreaController.currentPlayer === -1 && (
              <div
                className={styles.dealerCounter}
                style={{ background: dealerHand?.bust ? '#F20C43' : 'white' }}>
                {dealerHand?.text}
              </div>
            )}
            {dealerHand?.cards &&
              dealerHand?.cards.map((card, i) => (
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
          players[activePlayer]?.id === townController.ourPlayer.id && (
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
              isCurrentTurn={(gameStatus === 'IN_PROGRESS' && activePlayer === i) || false}
              username={player.userName}
              cash={player.units}
              left={players.length > 1 && i + 1 > Math.ceil(players.length / 2)}
              hands={
                hands.find(hand => hand.player === player.id) || {
                  player: nanoid(),
                  hands: [],
                  currentHand: 0,
                  active: false,
                }
              }
              photo={hands.find(hand => hand.player === player.id)?.photo}
              changePhoto={() => {
                try {
                  captureWebcamScreenshot().then(photo => {
                    casinoAreaController.setPlayerPhoto(photo || '');
                  });
                } catch (e) {
                  console.error('Failed to capture webcam screenshot', e);
                }
              }}
            />
          ))}
        </div>
      </div>
    </>
  );
}
