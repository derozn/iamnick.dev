import styled, { keyframes } from 'styled-components';
import {
  getVariable,
  getThemeVariable,
  getVariableWithModifications,
} from '@shared/styles/helpers';

const defaultDelay = 0.4;

const getContentDelay = getVariableWithModifications(getVariable('delay'), delay =>
  delay ? defaultDelay + delay : defaultDelay
);

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

const ContentFadeAnimation = keyframes`
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
`;

const ContentShiftAnimation = keyframes`
  from {
    transform: translate3d(10px, 0, 0);
  }

  to {
    transform: translate3d(0, 0, 0);
  }
`;

export const Content = styled.span`
  display: inline-block;
  opacity: 0;
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
`;

export const Container = styled.div`
  position: relative;
  display: inline-block;

  ${Block} {
    animation: ${BlockAnimation} 0.8s ${getVariable('delay')}s ease-in-out forwards;
  }

  ${Content} {
    animation: ${ContentFadeAnimation} 0.4s ${getContentDelay}s ease-out forwards,
      ${ContentShiftAnimation} 0.6s ${getContentDelay}s ease-out forwards;
  }
`;
