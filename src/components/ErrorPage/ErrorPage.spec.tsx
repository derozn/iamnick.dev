import React from 'react';
import { render } from '@testing-library/react';

import ErrorPage from './ErrorPage';

describe('components/ErrorPage', () => {
  it('renders error message', () => {
    const { getByText } = render(<ErrorPage />);

    expect(getByText('Something went wrong...')).toBeTruthy();
  });
});
