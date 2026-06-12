import { render, screen } from '@testing-library/react';

import { PageAnimation } from './Page';

describe(PageAnimation.name, () => {
  it('renders Page Animation', () => {
    render(<PageAnimation childKey="1">hello</PageAnimation>);

    expect(screen.getByText('hello')).toBeInTheDocument();
  });
});
