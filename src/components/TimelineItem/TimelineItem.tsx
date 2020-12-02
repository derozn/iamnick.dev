import React, { FunctionComponent } from 'react';
import { useTheme } from 'styled-components';
import useMedia from '#hooks/useMedia';
import { useParallax } from '#hooks/useSmoothScroll';
import Typography from '#components/Typography';
import Image from '#components/Image';
import BlockReveal from '#components/BlockReveal';
import useOnScreen from '#hooks/useOnScreen';

import { Props } from './types';
import {
  Wrapper,
  Article,
  Group,
  Title,
  Paragraph,
  ImageWrapper,
  Separator,
  DateTypography,
  ChildArticle,
} from './TimelineItem.style';

const TimelineItem: FunctionComponent<Props> = ({
  title,
  date,
  image,
  summary,
  reverse,
  children,
  ...rest
}) => {
  const { mediaQuery, palette } = useTheme();
  const [ref, inView] = useOnScreen<HTMLSpanElement>({ persist: true });
  const showInteractiveScene = useMedia(mediaQuery.sm, false);

  const { anchorRef: parallaxRef } = useParallax({ maxValue: showInteractiveScene ? 80 : 0 });
  const { anchorRef: textRef } = useParallax({ maxValue: showInteractiveScene ? 30 : 0 });
  const { anchorRef: contentRef } = useParallax({ maxValue: showInteractiveScene ? 200 : 0 });

  return (
    <Wrapper {...rest} reverse={reverse}>
      {showInteractiveScene && (
        <ChildArticle reverse={!reverse} ref={parallaxRef}>
          {inView && children}
        </ChildArticle>
      )}
      <Article reverse={reverse} data-testid={`reverse-${reverse}`} ref={contentRef}>
        <Group>
          {/* @ts-ignore */}
          <Title ref={textRef}>
            <Typography display="inline" component="h1" variant="h2" color="primary">
              <BlockReveal backgroundColor={palette.primary.main} show={inView} reverse={reverse}>
                <span ref={ref}>{title}</span>
                <DateTypography component="h2" variant="h3" color="primary">
                  {date}
                </DateTypography>
              </BlockReveal>
            </Typography>
          </Title>

          <Separator />

          <ImageWrapper>
            <Image {...image} loading="lazy" />
          </ImageWrapper>
        </Group>

        <Paragraph component="p" variant="body" color="primary">
          {summary}
        </Paragraph>
      </Article>
    </Wrapper>
  );
};

export default TimelineItem;
