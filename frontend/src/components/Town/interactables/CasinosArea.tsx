import {
    Accordion,
    AccordionButton,
    AccordionIcon,
    AccordionItem,
    AccordionPanel,
    Box,
    Flex,
    Heading,
    List,
    ListItem,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
  } from '@chakra-ui/react';
  import React, { useCallback, useEffect, useState } from 'react';
  import { GenericCasinoAreaController } from '../../../classes/interactable/CasinoAreaController';
  import PlayerController from '../../../classes/PlayerController';
  import { useInteractable, useInteractableAreaController } from '../../../classes/TownController';
  import useTownController from '../../../hooks/useTownController';
  import {  InteractableID } from '../../../types/CoveyTownSocket';
  import CasinoAreaInteractable from './CasinoArea';
  import Leaderboard from './Leaderboard';
  
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

      console.log('casinoAreaController', casinoAreaController.toInteractableAreaModel().type)
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
        <Accordion allowToggle>
          <AccordionItem>
            <Heading as='h3'>
              <AccordionButton>
                <Box flex='1' textAlign='left'>
                  Leaderboard
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel>
                ADD LEADERBOARD
              </AccordionPanel>
            </Heading>
          </AccordionItem>
          <AccordionItem>
            <Heading as='h3'>
              <AccordionButton>
                <Box as='span' flex='1' textAlign='left'>
                  Current Observers
                  <AccordionIcon />
                </Box>
              </AccordionButton>
            </Heading>
            <AccordionPanel>
              <List aria-label='list of observers in the casino'>
                {observers.map(player => {
                  return <ListItem key={player.id}>{player.userName}</ListItem>;
                })}
              </List>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
        <Flex>
          <Box>
            {casinoAreaController.toInteractableAreaModel().type === 'BlackjackArea' ? (
              <div>Black Jack Wack</div>
            )  : (
              <>{INVALID_GAME_AREA_TYPE_MESSAGE}</>
            )}
          </Box>
        </Flex>
      </>
    );
  }
  /**
   * A wrapper component for the ConnectFourArea and TicTacToeArea components.
   * Determines if the player is currently in a casino area on the map, and if so,
   * renders the selected casino area component in a modal.
   *
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
    if (casinoArea) {
      return (
        <Modal isOpen={true} onClose={closeModal} closeOnOverlayClick={false} size='xl'>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>{casinoArea.name}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <CasinoArea interactableID={casinoArea.id} />
            </ModalBody>
          </ModalContent>
        </Modal>
      );
    }
    return <></>;
  }
  