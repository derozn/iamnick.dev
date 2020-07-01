import React from 'react';
import { render } from '@testing-library/react';

import TimelineItem from './TimelineItem';

describe('components/TimelineItem', () => {
  it('renders', () => {
    render(<TimelineItem />);
  });
});
