import styled, { css } from 'styled-components';
import { getThemeVariable } from '@shared/styles/helpers';

const commonBurgerStyles = css`
  position: absolute;
  left: 0;
  width: 100%;
  height: 0.3rem;
  background: currentColor;
  transform-origin: left center;
`;

export const TopBun = styled.div`
  ${commonBurgerStyles};
  top: 0;
  transition: transform 0.25s ease-out;
`;

export const Patty = styled.div`
  ${commonBurgerStyles};
  top: 50%;
  transform: translateY(-50%);
  transition: transform 0.25s ease-out, opacity 0.25s ease-out;
`;

export const BottomBun = styled.div`
  ${commonBurgerStyles};
  bottom: 0;
  transition: transform 0.25s ease-out;
`;

export const Wrapper = styled.div`
  position: relative;
  width: 4rem;
  height: 3rem;
  color: ${getThemeVariable('color', 'burgerMenu')};

  ${({ isActive }) =>
    isActive &&
    css`
      ${TopBun} {
        transform: rotate(45deg);
      }

      ${Patty} {
        transform: translate3d(-25%, -50%, 0);
        opacity: 0;
      }

      ${BottomBun} {
        transform: rotate(-45deg);
      }
    `}
`;
