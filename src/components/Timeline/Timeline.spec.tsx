import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { theme } from '#styles';

import Timeline from './Timeline';
import { Props } from './types';

const testItemOne = {
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

const testItemTwo = {
  title: 'Test-two',
  date: '2021',
  image: {
    src: '/images/test-two.jpg',
    alt: 'test-two-alt',
    width: '1140',
    height: '960',
    source: [
      { srcSet: '/images/test-two.webp', type: 'image/webp' },
      { srcSet: '/images/test-two.jpg', type: 'image/jpeg' },
    ],
  },
  summary: 'test-two-summary',
  reverse: false,
};

const initialProps = {
  items: [testItemOne],
};

const renderComponent = (props: Props = initialProps) =>
  render(
    <ThemeProvider theme={theme}>
      <Timeline {...props} />
    </ThemeProvider>,
  );

describe('components/Timeline', () => {
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

  describe('When there are multiple items', () => {
    it('alternates timeline items left and right', () => {
      const { getByTestId } = renderComponent({ items: [testItemOne, testItemTwo] });

      expect(getByTestId('reverse-false')).toBeTruthy();
      expect(getByTestId('reverse-true')).toBeTruthy();
    });
  });
});
