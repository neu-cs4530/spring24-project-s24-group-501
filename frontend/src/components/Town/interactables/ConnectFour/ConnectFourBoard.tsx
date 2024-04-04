import BlackjackAreaController from '../../../../classes/interactable/BlackjackAreaController';
import { Button, chakra, Container, useToast } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { Card } from '../../../../types/CoveyTownSocket';

export type BlackjackBoardProps = {
  gameAreaController: BlackjackAreaController;
};

/**
 * A component that renders the Blackjack board
 *
 * Renders the Blackjack board as a "StyledBlackjackBoard", which consists of "StyledBlackjackCard"s
 * (one for each card in the dealer's hand).
 *
 * Each StyledBlackjackCard has an aria-label property that describes the card's value.
 *
 * The board is re-rendered whenever the dealer's hand changes, and each card is re-rendered whenever the value
 * of that card changes.
 *
 * @param gameAreaController the controller for the Blackjack game
 */
export default function BlackjackBoard({ gameAreaController }: BlackjackBoardProps): JSX.Element {
  useEffect(() => {
    console.log(gameAreaController);
  }, [gameAreaController]);

  return <div>hey</div>;
}
