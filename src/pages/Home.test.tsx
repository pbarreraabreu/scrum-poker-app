import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import Home from './Home';

describe('Home', () => {
  it('renders the main call to action links', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: /plan faster with scrum poker/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /create room/i })).toHaveAttribute('href', '/create');
    expect(screen.getByRole('link', { name: /join room/i })).toHaveAttribute('href', '/join');
  });
});
