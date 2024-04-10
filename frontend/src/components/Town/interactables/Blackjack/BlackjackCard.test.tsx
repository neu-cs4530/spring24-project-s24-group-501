import React from 'react';
import { render } from '@testing-library/react';
import BlackjackCard from './BlackjackCard';
import { Card } from '../../../../types/CoveyTownSocket';

const hearts = (
  <svg viewBox='0 0 60 60' fill='none' xmlns='http://www.w3.org/2000/svg'>
    <path
      d='M44.063 0C37.795 0 32.548 3.598 30.001 8.81C27.452 3.598 22.206 0 15.938 0C7.227 0 0 7.361 0 15.938C0 30.406 30.001 60 30.001 60C30.001 60 60 30.406 60 15.938C60 7.361 52.775 0 44.063 0Z'
      fill='#F20C43'
    />
  </svg>
);

const diamonds = (
  <svg viewBox='0 0 60 70' fill='none' xmlns='http://www.w3.org/2000/svg'>
    <path d='M60 35L29.9995 70L0 35L30.0005 0L60 35Z' fill='#F20C43' />
  </svg>
);

const clubs = (
  <svg viewBox='0 0 60 60' fill='none' xmlns='http://www.w3.org/2000/svg'>
    <path
      d='M45 16.875C44.956 16.875 44.914 16.883 44.87 16.883C44.946 16.264 45 15.639 45 15C45 6.717 38.284 0 30 0C21.714 0 15 6.717 15 15C15 15.639 15.053 16.264 15.13 16.883C15.086 16.883 15.044 16.875 15 16.875C6.714 16.875 0 23.592 0 31.875C0 40.158 6.714 46.875 15 46.875C19.807 46.875 24.075 44.604 26.819 41.087L26.25 45.938C25.745 49.527 23.256 52.81 19.687 53.438L15 54.375V60H45V54.375L40.312 53.437C36.742 52.809 34.252 49.528 33.749 45.937L33.178 41.086C35.922 44.604 40.191 46.874 44.999 46.874C53.283 46.874 59.999 40.157 59.999 31.874C59.999 23.591 53.284 16.875 45 16.875Z'
      fill='black'
    />
  </svg>
);

const spades = (
  <svg viewBox='0 0 60 65' fill='none' xmlns='http://www.w3.org/2000/svg'>
    <path
      d='M26.5029 48.1972C24.5262 50.5589 21.8705 52.255 18.8964 53.055C15.9223 53.855 12.7741 53.7202 9.87935 52.6688C6.98458 51.6174 4.48359 49.7005 2.71611 47.1784C0.948626 44.6563 0.000318863 41.6512 0 38.5714C0 31.7057 4.88571 27.2872 11.4 21.3943C17.0829 16.2514 24.0086 9.98572 30 0C35.9914 9.98572 42.9171 16.2514 48.6 21.3943C55.1143 27.2872 60 31.7057 60 38.5714C59.9997 41.6512 59.0514 44.6563 57.2839 47.1784C55.5164 49.7005 53.0154 51.6174 50.1207 52.6688C47.2259 53.7202 44.0777 53.855 41.1036 53.055C38.1295 52.255 35.4738 50.5589 33.4971 48.1972C35.4091 52.5302 37.6768 56.6973 40.2771 60.6557C41.2671 62.1557 40.1914 64.2857 38.4 64.2857H21.6C19.8043 64.2857 18.7286 62.1557 19.7229 60.6557C22.3232 56.6973 24.5909 52.5302 26.5029 48.1972Z'
      fill='black'
    />
  </svg>
);

describe('BlackjackCard', () => {
  const card: Card = {
    type: 'Hearts',
    value: 10,
    faceUp: true,
  };

  it('renders a face-up card correctly', () => {
    const { getByText, container } = render(<BlackjackCard {...card} />);
    const cardValue = getByText(card.value.toString());
    expect(cardValue).toBeInTheDocument();
    const suitIcon = container.querySelector('svg') as unknown as HTMLElement;
    expect(suitIcon).toBeInTheDocument();
    expect(suitIcon.outerHTML).toContain(hearts);
  });

  it('renders a face-down card correctly', () => {
    const faceDownCard: Card = {
      ...card,
      faceUp: false,
    };
    const { container } = render(<BlackjackCard {...faceDownCard} />);
    const cardElement = container.querySelector('div') as HTMLElement;
    expect(cardElement).toBeInTheDocument();
    expect(cardElement.style.background).toBe('rgb(242, 12, 67)');
  });

  it('renders a card with a different suit correctly', () => {
    const differentSuitCard: Card = {
      ...card,
      type: 'Diamonds',
    };
    const { getByText, container } = render(<BlackjackCard {...differentSuitCard} />);
    const cardValue = getByText(differentSuitCard.value.toString());
    expect(cardValue).toBeInTheDocument();
    const suitIcon = container.querySelector('svg') as unknown as HTMLElement;
    expect(suitIcon).toBeInTheDocument();
    expect(suitIcon.outerHTML).toContain(diamonds);
  });

  it('renders a card with a different value correctly', () => {
    const differentValueCard: Card = {
      ...card,
      value: 5,
    };
    const { getByText, container } = render(<BlackjackCard {...differentValueCard} />);
    const cardValue = getByText(differentValueCard.value.toString());
    expect(cardValue).toBeInTheDocument();
    const suitIcon = container.querySelector('svg') as unknown as HTMLElement;
    expect(suitIcon).toBeInTheDocument();
    expect(suitIcon.outerHTML).toContain(hearts);
  });

  it('renders a card with a different suit correctly', () => {
    const differentSuitCard: Card = {
      ...card,
      type: 'Clubs',
    };
    const { getByText, container } = render(<BlackjackCard {...differentSuitCard} />);
    const cardValue = getByText(differentSuitCard.value.toString());
    expect(cardValue).toBeInTheDocument();
    const suitIcon = container.querySelector('svg') as unknown as HTMLElement;
    expect(suitIcon).toBeInTheDocument();
    expect(suitIcon.outerHTML).toContain(clubs);
  });

  it('renders a card with a different suit correctly', () => {
    const differentSuitCard: Card = {
      ...card,
      type: 'Spades',
    };
    const { getByText, container } = render(<BlackjackCard {...differentSuitCard} />);
    const cardValue = getByText(differentSuitCard.value.toString());
    expect(cardValue).toBeInTheDocument();
    const suitIcon = container.querySelector('svg') as unknown as HTMLElement;
    expect(suitIcon).toBeInTheDocument();
    expect(suitIcon.outerHTML).toContain(spades);
  });

  it('renders a jack correctly', () => {
    const jackCard: Card = {
      ...card,
      value: 'J',
    };
    const { getByText, container } = render(<BlackjackCard {...jackCard} />);
    const cardValue = getByText('J');
    expect(cardValue).toBeInTheDocument();
    const suitIcon = container.querySelector('svg') as unknown as HTMLElement;
    expect(suitIcon).toBeInTheDocument();
    expect(suitIcon.outerHTML).toContain(hearts);
  });

  it('renders a queen correctly', () => {
    const queenCard: Card = {
      ...card,
      value: 'Q',
    };
    const { getByText, container } = render(<BlackjackCard {...queenCard} />);
    const cardValue = getByText('Q');
    expect(cardValue).toBeInTheDocument();
    const suitIcon = container.querySelector('svg') as unknown as HTMLElement;
    expect(suitIcon).toBeInTheDocument();
    expect(suitIcon.outerHTML).toContain(hearts);
  });

  it('renders a king correctly', () => {
    const kingCard: Card = {
      ...card,
      value: 'K',
    };
    const { getByText, container } = render(<BlackjackCard {...kingCard} />);
    const cardValue = getByText('K');
    expect(cardValue).toBeInTheDocument();
    const suitIcon = container.querySelector('svg') as unknown as HTMLElement;
    expect(suitIcon).toBeInTheDocument();
    expect(suitIcon.outerHTML).toContain(hearts);
  });

  it('renders an ace correctly', () => {
    const aceCard: Card = {
      ...card,
      value: 'A',
    };
    const { getByText, container } = render(<BlackjackCard {...aceCard} />);
    const cardValue = getByText('A');
    expect(cardValue).toBeInTheDocument();
    const suitIcon = container.querySelector('svg') as unknown as HTMLElement;
    expect(suitIcon).toBeInTheDocument();
    expect(suitIcon.outerHTML).toContain(hearts);
  });
});
