import React, { useEffect, useState } from 'react';
import BlackjackAreaController from '../../../../classes/interactable/BlackjackAreaController';
import PlayerController from '../../../../classes/PlayerController';
import { useInteractableAreaController } from '../../../../classes/TownController';
import useTownController from '../../../../hooks/useTownController';
import { GameStatus, BlackjackPlayer, InteractableID } from '../../../../types/CoveyTownSocket';
import BlackjackBetSetter from './BlackjackBetSetter';
import BlackjackUser from './BlackjackUser';

import styles from './blackjack.module.css';

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

  const [gameStatus, setGameStatus] = useState<GameStatus>(casinoAreaController.status);

  useEffect(() => {
    const updateGameState = () => {
      setGameStatus(casinoAreaController.status || 'WAITING_FOR_PLAYERS');
      setHands(casinoAreaController.hands || []);
      console.log(casinoAreaController);
      console.log(hands);
      setPlayers(casinoAreaController.players);
      console.log(players);
    };

    setHands(casinoAreaController.hands || []);

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
          <div style={{ position: 'fixed' }}>{gameStatusText}</div>

          <p>DEALER</p>
        </div>

        {gameStatus === 'WAITING_TO_START' &&
          hands.find(hand => hand.player === townController.ourPlayer.id)?.hands[0]?.wager ===
            0 && <BlackjackBetSetter />}

        <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px' }}>
          {players.map((player, i) => (
            <BlackjackUser
              key={i}
              username={player.userName}
              cash={player.units}
              left={players.length > 1 && i === players.length - 1}
              cards={[{ type: 'Hearts', value: 'A', faceUp: true }]}
            />
          ))}
        </div>
      </div>
    </>
  );
}
