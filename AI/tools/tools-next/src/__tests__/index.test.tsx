import React from 'react';
import { render, screen } from '@testing-library/react';
import Home from '../app/page';

describe('Home', () => {
  it('renders homepage', () => {
    render(<Home />);
    expect(screen.getByText(/Get started by editing/i)).toBeInTheDocument();
  });
});
