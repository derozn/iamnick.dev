import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';

import { theme } from '#styles';

import Typography from './Typography';

describe('components/Typography', () => {
  it('renders as span', () => {
    const { container } = render(<Typography />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders children', () => {
    const { getByText } = render(<Typography>hello i am nick</Typography>);

    expect(getByText('hello i am nick')).toBeTruthy();
  });

  it('renders as h1', () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <Typography component="h1" />
      </ThemeProvider>,
    );

    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders as h2', () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <Typography component="h2" />
      </ThemeProvider>,
    );

    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders as h1 styles when variant is h1', () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <Typography component="h2" variant="h1" />
      </ThemeProvider>,
    );

    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders with primary text color when color is primary', () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <Typography color="primary" />
      </ThemeProvider>,
    );

    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders with secondary text color when color is secondary', () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <Typography color="secondary" />
      </ThemeProvider>,
    );

    expect(container.firstChild).toMatchSnapshot();
  });
});
