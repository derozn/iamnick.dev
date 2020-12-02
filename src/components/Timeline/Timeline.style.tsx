import styled from 'styled-components';

import TimelineItem from '#components/TimelineItem';

export const Container = styled.section`
  position: relative;
  display: flex;
  flex-direction: column;

  width: 100%;

  ${({ theme }) => theme.mediaQuery.sm} {
    padding: 20px 0;
  }
`;

export const Separator = styled.div`
  display: none;
  position: absolute;
  top: 0;
  left: 50%;
  right: 1px;
  width: 1px;
  height: 100%;
  background: ${({ theme }) => theme.palette.primary.main};

  ${({ theme }) => theme.mediaQuery.sm} {
    display: block;
  }
`;

export const SpacedTimelineItem = styled(TimelineItem)`
  margin-bottom: 80px;

  ${({ theme }) => theme.mediaQuery.sm} {
    margin: 0;
    margin-bottom: 50vh;
  }

  :last-child {
    ${({ theme }) => theme.mediaQuery.sm} {
      margin: 0;
    }
  }
`;
