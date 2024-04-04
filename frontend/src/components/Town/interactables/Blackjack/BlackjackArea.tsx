import React, { useEffect, useState } from 'react';
import BlackjackAreaController from '../../../../classes/interactable/BlackjackAreaController';
import { useInteractableAreaController } from '../../../../classes/TownController';
import useTownController from '../../../../hooks/useTownController';
import { GameStatus, InteractableID } from '../../../../types/CoveyTownSocket';
import styles from './blackjack.module.css';
import Player from './Player';

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

  const [gameStatus, setGameStatus] = useState<GameStatus>(casinoAreaController.status);

  useEffect(() => {
    const updateGameState = () => {
      setGameStatus(casinoAreaController.status || 'WAITING_FOR_PLAYERS');
    };

    console.log(casinoAreaController);
    console.log(casinoAreaController.status);
    casinoAreaController.addListener('gameUpdated', updateGameState);
    return () => {
      casinoAreaController.removeListener('gameUpdated', updateGameState);
    };
  }, [casinoAreaController]);

  let gameStatusText = <></>;

  if (gameStatus === 'IN_PROGRESS') {
    gameStatusText = <>Game in progress</>;
  } else if (gameStatus === 'WAITING_TO_START') {
    const startGameButton = <div>waiting to start</div>;
    gameStatusText = <b>Waiting for players to press start. {startGameButton}</b>;
  } else {
    const joinGameButton = (
      <button
        onClick={async () => {
          setJoiningGame(true);
          casinoAreaController.joinGame();
          setJoiningGame(false);
        }}
        disabled={joiningGame}>
        Join GAME
      </button>
    );
    let gameStatusStr;
    if (gameStatus === 'OVER') gameStatusStr = 'over';
    else if (gameStatus === 'WAITING_FOR_PLAYERS') gameStatusStr = 'waiting for players to join';
    gameStatusText = joinGameButton;
  }

  return (
    <>
      <div className={styles.board}>
        <div>
          <div>{gameStatusText}</div>
          <p>DEALER</p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px' }}>
          <div>
            <Player
              username='Tomas'
              cash='1000'
              cards={[{ type: 'Hearts', value: 'A', faceUp: true }]}
            />
          </div>
          <Player
            username='Tomas'
            cash='1000'
            cards={[{ type: 'Hearts', value: 'A', faceUp: true }]}
          />
          <Player
            username='Tomas'
            cash='1000'
            left={true}
            cards={[{ type: 'Hearts', value: 'A', faceUp: true }]}
          />
          <Player
            username='Tomas'
            cash='1000'
            left={true}
            cards={[{ type: 'Hearts', value: 'A', faceUp: true }]}
          />
        </div>
      </div>
    </>
  );
}
