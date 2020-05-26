import styled from 'styled-components';
import { TextProps } from './types';

// This needs sorting out.
export const Text = styled.span<TextProps>`
  margin: 0;
  position: relative;

  ${(props) => props.displayAs === 'block' && `display: block;`}
  ${(props) => props.displayAs === 'inline' && `display: inline-block;`}

  ${(props) => props.variant === 'h1' && props.theme.typography.h1}
  ${(props) => props.variant === 'h2' && props.theme.typography.h2}
  ${(props) => props.variant === 'h3' && props.theme.typography.h3}

  ${(props) => props.textColor === 'primary' && `color: ${props.theme.palette.text.primary};`}
  ${(props) => props.textColor === 'secondary' && `color: ${props.theme.palette.text.secondary};`}
  ${(props) => props.textColor === 'accent' && `color: ${props.theme.palette.text.accent};`}
  
  ${(props) => props.textAlign && `text-align: ${props.textAlign};`}
`;
