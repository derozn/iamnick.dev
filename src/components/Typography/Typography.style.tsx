import styled from 'styled-components';
import { Props } from './types';

export const Text = styled.span<Props>`
  margin: 0;

  ${(props) => (props.variant === 'h1' ? props.theme.typography.h1 : undefined)}
  ${(props) => (props.variant === 'h2' ? props.theme.typography.h2 : undefined)}
`;
