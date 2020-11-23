import React from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from 'styled-components';

import useMedia from '#hooks/useMedia';
import Typography from '#components/Typography';
import BlockReveal from '#components/BlockReveal';
import Timeline from '#components/Timeline';

import { Header, CanvasWrapper, Section, FeedLayout, Layout, FeedTitle } from './HomePage.style';

import useOnScreen from '#hooks/useOnScreen';

const Scene = dynamic(() => import('#components/Interactive/Scene'), { ssr: false });

const HomePage = ({ workContent }: any) => {
  const { mediaQuery, palette } = useTheme();

  const [sectionTitleRef, sectionTitleInView] = useOnScreen<HTMLSpanElement>();

  const showInteractiveScene = useMedia(mediaQuery.sm, false);

  return (
    <Layout>
      <Header>
        <CanvasWrapper>{showInteractiveScene && <Scene />}</CanvasWrapper>
        <Section>
          <BlockReveal backgroundColor={palette.primary.main}>
            <Typography component="h1" color="primary" align="center">
              <Typography color="accent">I</Typography> AM NICK
            </Typography>
          </BlockReveal>
        </Section>

        <Section>
          <BlockReveal backgroundColor={palette.primary.main} delay={0.3}>
            <Typography component="h2" variant="h3" color="primary" align="center">
              <Typography color="accent">Creative</Typography> Full Stack Developer
            </Typography>
          </BlockReveal>
        </Section>
      </Header>
      <FeedLayout>
        <FeedTitle>
          <Typography component="h2" variant="h1" color="primary" display="inline">
            <BlockReveal backgroundColor={palette.primary.main} show={sectionTitleInView}>
              <span ref={sectionTitleRef}>Work Experience</span>
            </BlockReveal>
          </Typography>
        </FeedTitle>
        <Timeline items={workContent} />
      </FeedLayout>
    </Layout>
  );
};

export const getStaticProps = async () => {
  const workContent = (await import('#content/work.json')).default;

  return {
    props: {
      workContent,
    },
  };
};

export default HomePage;
