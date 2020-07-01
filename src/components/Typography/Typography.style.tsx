/* eslint-disable complexity */
import styled, { css } from 'styled-components';
import { TextProps } from './types';

export const Text = styled.span<TextProps>(
  (props) => css`
  margin: 0;
  position: relative;

  ${props.displayAs === 'block' && `display: block;`}
  ${props.displayAs === 'inline' && `display: inline-block;`}

  ${props.variant === 'h1' && props.theme.typography.h1}
  ${props.variant === 'h2' && props.theme.typography.h2}
  ${props.variant === 'h3' && props.theme.typography.h3}
  ${props.variant === 'body' && props.theme.typography.body}

  ${props.textColor === 'primary' && `color: ${props.theme.palette.text.primary};`}
  ${props.textColor === 'secondary' && `color: ${props.theme.palette.text.secondary};`}
  ${props.textColor === 'accent' && `color: ${props.theme.palette.text.accent};`}
  
  ${props.textAlign && `text-align: ${props.textAlign};`}
`,
);
