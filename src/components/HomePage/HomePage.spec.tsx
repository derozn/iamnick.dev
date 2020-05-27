import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';

import { getByNestedText } from 'test/helpers/getByNestedText';
import { createMatchMedia } from 'test/helpers/createMatchMedia';
import { theme } from '#styles/theme';

import HomePage from './HomePage';

jest.mock('next/dynamic', () => () => () => 'Scene');

const renderComponent = () => {
  return render(
    <ThemeProvider theme={theme}>
      <HomePage />
    </ThemeProvider>,
  );
};

describe('components/HomePage', () => {
  it('does not render <Scene /> when window width is smaller than 600px', () => {
    Object.assign(window, { matchMedia: createMatchMedia(500) });

    const { queryByText } = renderComponent();

    expect(queryByText('Scene')).toBe(null);
  });

  it('renders <Scene /> when window width is greater than 600px', () => {
    Object.assign(window, { matchMedia: createMatchMedia(700) });

    const { getByText } = renderComponent();

    expect(getByText('Scene')).toBeTruthy();
  });

  it('renders title', () => {
    const { getByText } = renderComponent();

    expect(getByNestedText(getByText, 'I AM NICK')).toBeTruthy();
  });

  it('renders subtitle', () => {
    const { getByText } = renderComponent();

    expect(getByNestedText(getByText, 'Creative Front End Developer')).toBeTruthy();
  });
});
