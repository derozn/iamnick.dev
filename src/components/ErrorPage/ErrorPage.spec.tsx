import React from 'react';
import { render } from '@testing-library/react';

import ErrorPage from './ErrorPage';

describe('components/ErrorPage', () => {
  it('renders error text', () => {
    const { getByText } = render(<ErrorPage />);

    expect(getByText('Oops! Something went wrong...')).toBeTruthy();
  });
});
