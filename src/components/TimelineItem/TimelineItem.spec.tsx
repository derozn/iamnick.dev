import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { theme } from '#styles';

import TimelineItem from './TimelineItem';
import { Props } from './types';

const initialProps = {
  title: 'Test',
  date: '2020',
  image: {
    src: '/images/test.jpg',
    alt: 'test-alt',
    width: '1140',
    height: '960',
    source: [
      { srcSet: '/images/test.webp', type: 'image/webp' },
      { srcSet: '/images/test.jpg', type: 'image/jpeg' },
    ],
  },
  summary: 'test-summary',
  reverse: false,
};

const renderComponent = (props: Props = initialProps) =>
  render(
    <ThemeProvider theme={theme}>
      <TimelineItem {...props} />
    </ThemeProvider>,
  );

describe('components/TimelineItem', () => {
  it('renders timeline title', () => {
    const { getByText } = renderComponent();

    expect(getByText('Test')).toBeTruthy();
  });

  it('renders timeline date', () => {
    const { getByText } = renderComponent();

    expect(getByText('2020')).toBeTruthy();
  });

  it('renders timeline image', () => {
    const { getByAltText } = renderComponent();

    expect(getByAltText('test-alt')).toBeTruthy();
  });

  it('renders timeline summary', () => {
    const { getByText } = renderComponent();

    expect(getByText('test-summary')).toBeTruthy();
  });
});
