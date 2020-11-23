import React from 'react';
import { render } from '@testing-library/react';

import {{pascalCase name}} from './{{pascalCase name}}';
import { Props } from './types';

const renderComponent = (props: Props) => render(<{{pascalCase name}} {...props} />);

describe('components/{{pascalCase name}}', () => {
  it('renders', () => {
    const { queryByText } = renderComponent({})
  });
});
