// Necessary imports for testing
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import BlackjackUser, { numberComma } from './BlackjackUser';
import { BlackjackPlayer } from '../../../../types/CoveyTownSocket';

// Mocks for the BlackjackCard component and styles
jest.mock('./BlackjackCard', () => {
  const MockBlackjackCard: React.FC = () => <div>MockBlackjackCard</div>;
  MockBlackjackCard.displayName = 'MockBlackjackCard';
  return MockBlackjackCard;
});
jest.mock('./blackjack.module.css', () => ({
  player: 'player',
  wagerHolder: 'wagerHolder',
  info: 'info',
  leftInfo: 'leftInfo',
  cardHolder: 'cardHolder',
  leftCardHolder: 'leftCardHolder',
  money: 'money',
  countIndicator: 'countIndicator',
}));

describe('BlackjackUser Component', () => {
  const mockChangePhoto = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with minimum props', () => {
    render(
      <BlackjackUser
        username='John Doe'
        cash={1000}
        isCurrentTurn={false}
        hands={{ player: '', currentHand: 0, active: false, hands: [] }}
        changePhoto={mockChangePhoto}
      />,
    );
    expect(screen.getByAltText('player')).toHaveAttribute(
      'src',
      'https://source.unsplash.com/random/?face',
    );
  });

  it('calls changePhoto function on photo click', () => {
    render(
      <BlackjackUser
        username='John Doe'
        cash={1000}
        isCurrentTurn={false}
        hands={{ player: '', currentHand: 0, active: false, hands: [] }}
        changePhoto={mockChangePhoto}
      />,
    );
    fireEvent.click(screen.getByAltText('player'));
    expect(mockChangePhoto).toHaveBeenCalledTimes(1);
  });

  it('displays the wager if it is not 0', () => {
    const hands: BlackjackPlayer = {
      player: '',
      currentHand: 0,
      active: false,
      hands: [{ wager: 500, outcome: undefined, cards: [], text: '' }],
    };
    render(
      <BlackjackUser
        username='John Doe'
        cash={1000}
        isCurrentTurn={false}
        hands={hands}
        changePhoto={mockChangePhoto}
      />,
    );
    expect(screen.getByText('$500')).toBeInTheDocument();
  });

  it('does not display wager if it is 0', () => {
    const hands: BlackjackPlayer = {
      player: '',
      currentHand: 0,
      active: false,
      hands: [{ wager: 0, outcome: undefined, cards: [], text: '' }],
    };
    render(
      <BlackjackUser
        username='John Doe'
        cash={1000}
        isCurrentTurn={false}
        hands={hands}
        changePhoto={mockChangePhoto}
      />,
    );
    expect(screen.queryByText('$0')).not.toBeInTheDocument();
  });

  it('formats cash with commas correctly', () => {
    render(
      <BlackjackUser
        username='John Doe'
        cash={1000000}
        isCurrentTurn={false}
        hands={{ player: '', currentHand: 0, active: false, hands: [] }}
        changePhoto={mockChangePhoto}
      />,
    );
    expect(screen.getByText('$1,000,000')).toBeInTheDocument();
  });

  it('renders money gif if there is a winning hand', () => {
    const hands: BlackjackPlayer = {
      player: '',
      currentHand: 0,
      active: false,
      hands: [{ wager: 500, outcome: 'Win', cards: [], text: '' }],
    };
    render(
      <BlackjackUser
        username='John Doe'
        cash={1000}
        isCurrentTurn={false}
        hands={hands}
        changePhoto={mockChangePhoto}
      />,
    );
    expect(screen.getByAltText('money falling')).toBeInTheDocument();
  });
});

describe('numberComma function', () => {
  it('formats numbers correctly', () => {
    expect(numberComma(1000)).toBe('1,000');
    expect(numberComma(1000000)).toBe('1,000,000');
    expect(numberComma(1234567.89)).toBe('1,234,567.89');
  });

  it('adds a trailing zero if there is exactly one decimal place', () => {
    expect(numberComma(1234.5)).toBe('1,234.50');
  });

  it('does not add a trailing zero if there are two decimal places', () => {
    expect(numberComma(1234.56)).toBe('1,234.56');
  });
});
