import styled from 'styled-components';
import posed from 'react-pose';
import { getThemeVariable } from '@shared/styles/helpers';

export const Container = styled.div`
  position: relative;
  display: inline-block;
  overflow: hidden;
`;

const AnimatedBlock = posed.div({
  enter: {
    x: '-100%',
    transition: {
      default: { duration: 800, ease: 'easeInOut' },
    },
  },
  exit: {
    x: '100%',
  },
});

const AnimatedText = posed.h1({
  enter: {
    opacity: 1,
    delay: 400,
    transition: {
      duration: 0,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0,
    },
  },
});

export const Text = styled(AnimatedText)`
  position: relative;
  margin: 0;
  font-family: ${getThemeVariable('fontFamily', 'primary')};
  font-size: ${getThemeVariable('fontSize', 'heading')};
  color: ${getThemeVariable('color', 'text')};
  letter-spacing: ${getThemeVariable('letterSpace', 'heading')};
  text-transform: uppercase;
`;

export const Block = styled(AnimatedBlock)`
  display: inline-block;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: ${getThemeVariable('color', 'text')};
`;
