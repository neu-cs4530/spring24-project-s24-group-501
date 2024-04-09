import { Modal, ModalContent, ModalOverlay, HStack, VStack } from '@chakra-ui/react';
import React, { useCallback, useEffect, useState } from 'react';
import { GenericCasinoAreaController } from '../../../../classes/interactable/CasinoAreaController';
import PlayerController from '../../../../classes/PlayerController';
import { useInteractable, useInteractableAreaController } from '../../../../classes/TownController';
import useTownController from '../../../../hooks/useTownController';
import { InteractableID } from '../../../../types/CoveyTownSocket';
import CasinoAreaInteractable from './CasinoArea';
import BlackjackArea from '../Blackjack/BlackjackArea';
import styles from './casino.module.css';
import Top10PlayerRanks from '../../../Leaderboard/PlayerRanks';
import YourRank from '../../../Leaderboard/YourRank';
import DailyCasinoSessions from '../../../Leaderboard/DailySessions';
import CasinoGameFrequency from '../../../Leaderboard/SessionsStats';

export const INVALID_GAME_AREA_TYPE_MESSAGE = 'Invalid casino area type';

/**
 * A generic component that renders a casino area.
 *
 * It uses Chakra-UI components (does not use other GUI widgets)
 *
 * It uses the CasinoAreaController corresponding to the provided interactableID to get the current state of the casino. (@see useInteractableAreaController)
 *
 * It renders the following:
 *  - A leaderboard of the casino results
 *  - A list of observers' usernames (in a list with the aria-label 'list of observers in the casino')
 *  - The casino area component (either ConnectFourArea or TicTacToeArea). If the casino area is NOT a ConnectFourArea or TicTacToeArea, then the message INVALID_GAME_AREA_TYPE_MESSAGE appears within the component
 *  - A chat channel for the casino area (@see ChatChannel.tsx), with the property interactableID set to the interactableID of the casino area
 *
 */
function CasinoArea({ interactableID }: { interactableID: InteractableID }): JSX.Element {
  const casinoAreaController =
    useInteractableAreaController<GenericCasinoAreaController>(interactableID);
  const townController = useTownController();
  const [observers, setObservers] = useState<PlayerController[]>(casinoAreaController.observers);
  useEffect(() => {
    console.log('casinoAreaController', casinoAreaController.toInteractableAreaModel().type);
    const updateCasinoState = () => {
      setObservers(casinoAreaController.observers);
    };
    casinoAreaController.addListener('casinoUpdated', updateCasinoState);
    return () => {
      casinoAreaController.removeListener('casinoUpdated', updateCasinoState);
    };
  }, [townController, casinoAreaController]);

  return (
    <>
      {casinoAreaController.toInteractableAreaModel().type === 'BlackjackArea' ? (
        <BlackjackArea interactableID={interactableID} />
      ) : (
        <>{INVALID_GAME_AREA_TYPE_MESSAGE}</>
      )}
    </>
  );
}
/**
 * A wrapper component for the CasinoArea components.
 * Determines if the player is currently in a casino area on the map, and if so,
 * renders the selected casino area component in a modal.
 */
export default function CasinoAreaWrapper(): JSX.Element {
  const casinoArea = useInteractable<CasinoAreaInteractable>('casinoArea');
  const townController = useTownController();
  const closeModal = useCallback(() => {
    if (casinoArea) {
      townController.interactEnd(casinoArea);
      const controller = townController.getCasinoAreaController(casinoArea);
      controller.leaveCasino();
    }
  }, [townController, casinoArea]);

  const [showLeaderboard, setShowLeaderboard] = useState(false);

  if (casinoArea) {
    return (
      <Modal isOpen={true} onClose={closeModal} closeOnOverlayClick={false} size='full'>
        <ModalOverlay />
        <ModalContent>
          <div className={styles.casino}>
            <ModalCloseButton />
            <div className={styles.interactHolder}>
              <button
                onClick={() => {
                  setShowLeaderboard(true);
                }}>
                Leaderboard
              </button>
              <Modal
                size='xl'
                isOpen={showLeaderboard}
                onClose={() => {
                  setShowLeaderboard(false);
                }}>
                <ModalOverlay />
                <ModalContent padding={'15px'}>
                  <HStack>
                    <Top10PlayerRanks />
                    <VStack>
                      <YourRank />
                      <DailyCasinoSessions />
                      <CasinoGameFrequency />
                    </VStack>
                  </HStack>
                </ModalContent>
              </Modal>
            </div>
            <CasinoArea interactableID={casinoArea.id} />
          </div>
        </ModalContent>
      </Modal>
    );
  }
  return <></>;
}
