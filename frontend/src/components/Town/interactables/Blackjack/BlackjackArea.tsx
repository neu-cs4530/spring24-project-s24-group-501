import { useToast } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import BlackjackAreaController from '../../../../classes/interactable/BlackjackAreaController';
import PlayerController from '../../../../classes/PlayerController';
import { useInteractableAreaController } from '../../../../classes/TownController';
import useTownController from '../../../../hooks/useTownController';
import { Card, GameStatus, InteractableID, PlayerHand } from '../../../../types/CoveyTownSocket';
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

  const [hands, setHands] = useState<PlayerHand[] | undefined>(casinoAreaController.hands);
  const [dealerHand, setDealerHand] = useState<Card[] | undefined>(casinoAreaController.dealerHand);
  const [joiningGame, setJoiningGame] = useState(false);

  const [gameStatus, setGameStatus] = useState<GameStatus>(casinoAreaController.status);
  const toast = useToast();

  useEffect(() => {
    const updateGameState = () => {
      setHands(casinoAreaController.hands);
      setDealerHand(casinoAreaController.dealerHand);
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
    const joinGameButton = <div>join game</div>;
    let gameStatusStr;
    if (gameStatus === 'OVER') gameStatusStr = 'over';
    else if (gameStatus === 'WAITING_FOR_PLAYERS') gameStatusStr = 'waiting for players to join';
    gameStatusText = (
      <b>
        Game {gameStatusStr}. {joinGameButton}
      </b>
    );
  }

  return (
    <>
      <div className={styles.board}>
        <p>DEALER</p>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
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
        </div>
      </div>
    </>
  );
}
