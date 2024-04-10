// Necessary imports
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import BlackjackBetSetter from './BlackjackBetSetter';

describe('BlackjackBetSetter Component', () => {
  it('renders correctly with initial stake', () => {
    const { getByText } = render(<BlackjackBetSetter stake={10} placeBet={() => {}} />);
    expect(getByText('Bet $10')).toBeInTheDocument();
  });

  it('calls placeBet with correct amount on button click', () => {
    const mockPlaceBet = jest.fn();
    render(<BlackjackBetSetter stake={10} placeBet={mockPlaceBet} />);

    fireEvent.click(screen.getByText('Bet $10'));
    expect(mockPlaceBet).toHaveBeenCalledWith(10);
  });

  it('updates the bet amount based on slider input', () => {
    const { getByText, getByRole } = render(<BlackjackBetSetter stake={10} placeBet={() => {}} />);
    const slider = getByRole('slider');

    fireEvent.change(slider, { target: { value: '50' } });
    expect(getByText('Bet $50')).toBeInTheDocument();
  });

  it('does not allow bets lower than the stake', () => {
    const mockPlaceBet = jest.fn();
    render(<BlackjackBetSetter stake={10} placeBet={mockPlaceBet} />);
    const slider = screen.getByRole('slider');

    fireEvent.change(slider, { target: { value: '5' } });
    fireEvent.click(screen.getByText('Bet $10'));
    expect(mockPlaceBet).toHaveBeenCalledWith(10);
  });

  it('allows bets up to ten times the stake', () => {
    render(<BlackjackBetSetter stake={10} placeBet={() => {}} />);
    const slider = screen.getByRole('slider');

    fireEvent.change(slider, { target: { value: '100' } });
    expect(screen.getByText('Bet $100')).toBeInTheDocument();
  });

  it('does not allow bets over ten times the stake', () => {
    const mockPlaceBet = jest.fn();
    render(<BlackjackBetSetter stake={10} placeBet={mockPlaceBet} />);
    const slider = screen.getByRole('slider');

    fireEvent.change(slider, { target: { value: '101' } });
    fireEvent.click(screen.getByText('Bet $100'));
  });
});
