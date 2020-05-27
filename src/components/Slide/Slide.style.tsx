import styled, { keyframes } from 'styled-components';
import { Props } from './types';

const slide = keyframes`
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

const show = keyframes`
  from {
    transform: translate3d(2%, 0, 0);
  }
  to {
    visibility: visible;
    transform: translate3d(0, 0, 0);
  }
`;

export const Container = styled.div<Props>`
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: ${({ backgroundColor }) => backgroundColor};
    transform: scale3d(0, 1, 1);
    animation: ${slide} 1s ${({ delay }) => (delay ? delay + 0.5 : 0.5)}s ease-in-out forwards;
  }

  > span {
    display: inherit;
    visibility: hidden;
    animation: ${show} 0.5s ${({ delay }) => (delay ? delay + 1 : 1)}s ease-out forwards;
  }
`;
