import React from 'react';
import { render } from '@testing-library/react';

import ErrorPage from './Error';

describe('pages/error', () => {
  it('renders error message', () => {
    const { getByText } = render(<ErrorPage />);

    expect(getByText('Something went wrong...')).toBeTruthy();
  });
});
