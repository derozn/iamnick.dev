import styled, { css } from 'styled-components';
import { getThemeVariable } from '@shared/styles/helpers';

export const Section = styled.section`
  position: relative;
  width: 100%;
  height: 100vh;
  padding: 2rem;
`;

export const BackgroundContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`;

export const Content = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  position: relative;
  max-width: 120rem;
  margin: 0 auto;
  width: 100%;
  height: 100%;
`;

export const Title = styled.h1`
  position: relative;
  margin: 0;
  font-family: ${getThemeVariable('fontFamily', 'primary')};
  font-size: 7.2rem;
  color: ${getThemeVariable('color', 'text')};
  letter-spacing: 1rem;
  text-transform: uppercase;
`;

export const Subtitle = styled.h3`
  position: relative;
  margin: 0;
  font-family: ${getThemeVariable('fontFamily', 'secondary')};
  font-size: 2.8rem;
  color: ${getThemeVariable('color', 'text')};
  letter-spacing: 1rem;
  text-transform: uppercase;
`;

export const contentSpacing = css`
  margin-top: 1rem;
`;
