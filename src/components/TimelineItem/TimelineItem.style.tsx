import styled, { css } from 'styled-components';

import Typography from '#components/Typography';

import { ArticleProps } from './types';

export const Title = styled.div`
  position: relative;
  text-align: center;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 1px;
    height: 100%;
    background: ${({ theme }) => theme.palette.background.primary};
  }
`;

export const Group = styled.div`
  position: relative;
  width: 100%;
  flex-shrink: 0; /* IE-11 doesnt like shrinking images. */
`;

export const DateTypography = styled(Typography)`
  text-align: center;
  margin-top: 10px;
`;

export const ImageWrapper = styled.div`
  position: relative;
  width: 100%;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: ${({ theme }) => theme.palette.background.primary};
    opacity: 0.4;
  }
`;

export const Paragraph = styled(Typography)`
  width: 100%;
  margin-top: 30px;

  color: ${({ theme }) => theme.palette.text.primary};
`;

export const Separator = styled.div`
  position: relative;
  width: 100%;
  height: 60px;
  margin: 30px 0px;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    width: 1px;
    height: 100%;
    background: ${({ theme }) => theme.palette.text.primary};
  }

  ${({ theme }) => theme.mediaQuery.sm} {
    display: none;
  }
`;

const leftArticleStyles = css`
  ${({ theme }) => theme.mediaQuery.sm} {
    align-self: flex-start;

    ${Title} {
      position: absolute;
      top: 50%;
      right: -8px;
      transform: translateY(-50%);
      z-index: 1;
      padding: 10px 0;

      &::before {
        left: auto;
        right: 7px;
      }
    }

    ${Group}, ${Paragraph} {
      padding-right: 40px;
    }

    ${DateTypography} {
      text-align: right;
    }
  }

  ${({ theme }) => theme.mediaQuery.md} {
    ${Group}, ${Paragraph} {
      padding-right: 80px;
    }
  }

  ${({ theme }) => theme.mediaQuery.lg} {
    ${Group}, ${Paragraph} {
      padding-right: 120px;
    }
  }
`;

const rightArticleStyles = css`
  ${({ theme }) => theme.mediaQuery.sm} {
    align-self: flex-end;

    ${Title} {
      position: absolute;
      top: 50%;
      left: -8px;
      transform: translateY(-50%);
      z-index: 1;
      padding: 10px 0;

      &::before {
        left: 8px;
      }
    }

    ${Group}, ${Paragraph} {
      padding-left: 40px;
    }

    ${DateTypography} {
      text-align: left;
    }
  }

  ${({ theme }) => theme.mediaQuery.md} {
    ${Group}, ${Paragraph} {
      padding-left: 80px;
    }
  }

  ${({ theme }) => theme.mediaQuery.lg} {
    ${Group}, ${Paragraph} {
      padding-left: 120px;
    }
  }
`;

export const Article = styled.article<ArticleProps>`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0; /* IE-11 column height bug. */

  width: 100%;

  ${({ theme }) => theme.mediaQuery.sm} {
    max-width: 50%;
  }

  ${({ reverse }) => (reverse ? rightArticleStyles : leftArticleStyles)}
`;
