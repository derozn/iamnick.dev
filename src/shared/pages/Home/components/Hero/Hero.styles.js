import styled, { css } from 'styled-components';
import { getThemeVariable } from '@shared/styles/helpers';

export const Section = styled.section`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  width: 100%;
  height: 100vh;
  padding: 2rem;
`;

export const Title = styled.h1`
  position: relative;
  margin: 0;
  font-family: ${getThemeVariable('fontFamily', 'primary')};
  font-size: ${getThemeVariable('fontSize', 'heading')};
  color: ${getThemeVariable('color', 'text')};
  letter-spacing: ${getThemeVariable('letterSpace', 'title')};
  text-transform: uppercase;
`;

export const Subtitle = styled.h3`
  position: relative;
  margin: 0;
  font-family: ${getThemeVariable('fontFamily', 'secondary')};
  font-size: ${getThemeVariable('fontSize', 'subTitle')};
  color: ${getThemeVariable('color', 'text')};
  letter-spacing: ${getThemeVariable('letterSpace', 'title')};
  text-transform: uppercase;
`;

export const contentSpacing = css`
  margin-top: 1rem;
`;
