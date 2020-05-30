import styled from 'styled-components';

export const Layout = styled.section`
  display: grid;
  grid-template-columns: 10px auto 10px;
  grid-auto-rows: max-content;
  grid-template-rows: 1fr 1fr;
  grid-template-areas: '. header .' '. feed .';

  max-width: ${({ theme }) => theme.sizing.maxWidth}px;

  ${({ theme }) => theme.mediaQuery.sm} {
    grid-template-columns: 20px auto 20px;
    row-gap: 20px;
  }

  ${({ theme }) => theme.mediaQuery.md} {
    grid-template-columns: 40px auto 40px;
    row-gap: 40px;
  }

  ${({ theme }) => theme.mediaQuery.lg} {
    grid-template-columns: 80px auto 80px;
    row-gap: 80px;
  }
`;

export const Header = styled.header`
  position: relative;

  grid-area: header;

  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;

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

export const Feed = styled.div`
  grid-area: feed;
`;
