import styled, { css, keyframes } from 'styled-components';
import { ContainerProps } from './types';

const scaleInOut = keyframes`
  0% {
    transform-origin: right center;
    transform: scale3d(0, 1, 1);
  }

  50% {
    transform-origin: right center;
    transform: scale3d(1, 1, 1);
  }
  51% {
    transform-origin: left center;
  }

  100% {
    transform-origin: left center;
    transform: scale3d(0, 1, 1);
  }
`;

const slideIn = keyframes`
  from {
    transform: translate3d(2%, 0, 0);
    opacity: 1;
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
`;

export const Container = styled.span<ContainerProps>`
  position: relative;
  display: inherit;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: ${({ backgroundColor }) => backgroundColor};
    transform: scale3d(0, 1, 1);
    ${({ entered, delay, reverse }) =>
      entered &&
      css`
        animation: ${scaleInOut} 1s ${delay ? delay + 0.5 : 0.5}s ease-in-out
          ${reverse && 'reverse'} forwards;
      `}
  }

  > span {
    display: inherit;
    opacity: 0;

    ${({ entered, delay, reverse }) =>
      entered &&
      css`
        animation: ${slideIn} 0.5s ${delay ? delay + 1 : 1}s ease-out ${reverse && 'reverse'}
          forwards;
      `}
  }
`;
