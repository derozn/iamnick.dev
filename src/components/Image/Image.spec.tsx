import React from 'react';
import { render } from '@testing-library/react';

import Image from './Image';
import { Props } from './types';

const initialProps = {
  src: 'mock-src',
  alt: 'mock-alt',
};

const renderComponent = (props: Props = initialProps) => render(<Image {...props} />);

describe('components/Image', () => {
  it('renders image', () => {
    const { getByAltText } = renderComponent();

    expect(getByAltText('mock-alt')).toBeTruthy();
  });
});
