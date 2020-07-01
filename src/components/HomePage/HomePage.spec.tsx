import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';

import { getByNestedText } from 'test/react-testing-library-addons/getByNestedText';
import { createMatchMedia } from 'test/helpers/createMatchMedia';
import { theme } from '#styles/theme';

import workContent from '#content/work.json';

import HomePage from './HomePage';

jest.mock('next/dynamic', () => () => () => 'Scene');

const renderComponent = () => {
  return render(
    <ThemeProvider theme={theme}>
      <HomePage workContent={workContent} />
    </ThemeProvider>,
  );
};

describe('components/HomePage', () => {
  it('does not render <Scene /> when window width is smaller than 600px', () => {
    createMatchMedia({ width: 500 });

    const { queryByText } = renderComponent();

    expect(queryByText('Scene')).toBe(null);
  });

  it('renders <Scene /> when window width is greater than 600px', () => {
    createMatchMedia({ width: 700 });

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

  it('renders work experience title', () => {
    const { getByText } = renderComponent();

    expect(getByNestedText(getByText, 'Work Experience')).toBeTruthy();
  });

  it('renders timeline', () => {
    const { getByText } = renderComponent();

    expect(getByNestedText(getByText, 'Lyvly')).toBeTruthy();
    expect(getByNestedText(getByText, 'Arcadia')).toBeTruthy();
    expect(getByNestedText(getByText, 'YOTI')).toBeTruthy();
    expect(getByNestedText(getByText, 'Vitamin')).toBeTruthy();
  });
});
