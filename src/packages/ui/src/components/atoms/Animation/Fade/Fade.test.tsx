import { render, screen } from '@testing-library/react';

import { FadeAnimation } from './Fade';
import { FadeItem } from './FadeItem';

describe(FadeAnimation.name, () => {
  it('renders Fade Animation', () => {
    render(
      <FadeAnimation>
        <FadeItem>hello</FadeItem>
      </FadeAnimation>
    );

    expect(screen.getByText('hello')).toBeInTheDocument();
  });
});
