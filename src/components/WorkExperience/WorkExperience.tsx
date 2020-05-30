import React, { FunctionComponent } from 'react';

import Typography from '#components/Typography';
import useParallax from '#hooks/useParallax';

import { Props } from './types';
import { Container, Image, Paragraph } from './WorkExperience.style';

const WorkExperience: FunctionComponent<Props> = (props) => {
  const [ref] = useParallax();

  return (
    <Container {...props} ref={ref}>
      <Typography component="h1" variant="h1" color="primary">
        YOTI
      </Typography>
      <Image
        src="https://rawcdn.githack.com/drcmda/the-substance/501e0500867b3dddc913fc88a9d9bc583d097ed4/public/photo-1533577116850-9cc66cad8a9b.jpeg"
        alt="Yoti - Your digital identity"
        loading="lazy"
      />
      <Paragraph>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Magni nihil dolores accusantium
        minima, vel ea. Sapiente architecto consectetur, accusantium suscipit vel ut! Voluptatem,
        eveniet sit ipsa est pariatur quas nihil. Lorem ipsum dolor sit amet consectetur adipisicing
        elit. Enim, molestias ducimus ut beatae velit omnis praesentium quia nihil aperiam ex
        deserunt, pariatur consectetur voluptatum explicabo, minima veniam? Ipsum, enim cum.
      </Paragraph>
    </Container>
  );
};

export default WorkExperience;
