import styled, { keyframes } from 'styled-components';
import { getThemeVariable } from '@shared/styles/helpers';

export const Container = styled.div`
  position: relative;
  display: inline-block;
  overflow: hidden;
`;

const BlockAnimation = keyframes`
  0% {
    transform: scale3d(0, 1, 1);
    transform-origin: 100% 50% 0px;
  }

  35% {
    transform: scale3d(1, 1, 1);
    transform-origin: 100% 50% 0px;
  }

  50% {
    transform: scale3d(1, 1, 1);
    transform-origin: 0% 50% 0px;
  }

  100% {
    transform: scale3d(0, 1, 1);
    transform-origin: 0% 50% 0px;
  }
`;

const ContentAnimation = keyframes`
  from {  opacity: 0; }

  to { opacity: 1;}
`;

export const Content = styled.span`
  display: inline-block;
  opacity: 0;
  animation: ${ContentAnimation} 0s 0.4s linear forwards;
`;

export const Block = styled.div`
  display: inline-block;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: ${getThemeVariable('color', 'text')};
  transform: scale3d(0, 1, 1);
  transform-origin: 100% 50% 0px;
  animation: ${BlockAnimation} 0.8s ease-in-out forwards;
`;
