import styled from 'styled-components';
import { getVariable, getVariableWithModifications } from '@shared/styles/helpers';

const calculateRatio = ({ width, height }) => (height / width) * 100;

export const Wrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: ${getVariable('colour')};

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.7);
  }
  /* padding-bottom: ${calculateRatio}%; */
`;

export const Thumbnail = styled.img`
  display: block;
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: blur(2px);
`;

export const Image = styled.img`
  display: block;
  position: absolute;
  width: 100%;
  height: 100%;
  transition: opacity 1s linear;
  object-fit: cover;
  opacity: ${getVariableWithModifications(getVariable('loading'), loading => (loading ? 0 : 1))};
`;
