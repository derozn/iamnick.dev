import React, { FunctionComponent } from 'react';
import { useTheme } from 'styled-components';

import Typography from '#components/Typography';
import Image from '#components/Image';
import BlockReveal from '#components/BlockReveal';
import useOnScreen from '#hooks/useOnScreen';

import { Props } from './types';
import {
  Article,
  Group,
  Title,
  Paragraph,
  ImageWrapper,
  Separator,
  DateTypography,
} from './TimelineItem.style';

const TimelineItem: FunctionComponent<Props> = ({
  title,
  date,
  image,
  summary,
  reverse,
  ...rest
}) => {
  const { palette } = useTheme();
  const [ref, inView] = useOnScreen<HTMLSpanElement>();

  return (
    <Article {...rest} reverse={reverse}>
      <Group>
        <Title>
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
  );
};

export default TimelineItem;
