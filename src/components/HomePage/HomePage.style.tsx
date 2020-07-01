import styled from 'styled-components';

export const Layout = styled.section`
  display: grid;
  grid-template-columns: 10px auto 10px;
  grid-auto-rows: min-content;
  grid-template-rows: 1fr min-content;
  grid-template-areas: '. header .' '. feed .';

  max-width: ${({ theme }) => theme.sizing.maxWidth}px;
  margin: 0 auto;

  ${({ theme }) => theme.mediaQuery.sm} {
    grid-template-columns: 20px auto 20px;
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

export const Section = styled.div`
  margin-bottom: 10px;

  &:last-of-type {
    margin-bottom: 0;
  }
`;

export const FeedLayout = styled.div`
  grid-area: feed;
`;

export const FeedTitle = styled.div`
  margin: 40vh 0;
  text-align: center;
`;
