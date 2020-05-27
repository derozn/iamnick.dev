import styled from 'styled-components';

export const Header = styled.header`
  position: relative;

  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;

  padding: 10px;
  max-width: ${({ theme }) => theme.sizing.maxWidth}px;
  margin: 0 auto;
  height: 100vh;
  min-height: 512px;
`;

export const CanvasWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
`;

export const Content = styled.section`
  ${({ theme }) => theme.mediaQuery.md} {
    margin-left: -250px;
    margin-top: -65px;
  }
`;

export const Section = styled.div`
  margin-bottom: 10px;

  &:last-of-type {
    margin-bottom: 0;
  }
`;
