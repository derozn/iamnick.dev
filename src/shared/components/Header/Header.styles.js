import styled from 'styled-components';
import { getThemeVariable } from '@shared/styles/helpers';

export const FixedHeader = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: 100%;
  padding: 2rem;
  z-index: ${getThemeVariable('zIndex', 'header')};
`;
