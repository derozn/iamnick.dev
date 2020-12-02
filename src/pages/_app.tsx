import React from 'react';
import NextApp from 'next/app';
import Head from 'next/head';
import { ThemeProvider } from 'styled-components';
import { ParallaxProvider } from 'react-scroll-parallax';

import { GlobalStyle, theme } from '#styles';

class App extends NextApp {
  render() {
    const { Component, pageProps } = this.props;

    return (
      <>
        <Head>
          <title>iamnick.dev</title>
          <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
          <meta name="description" content="A Creative Full Stack Developers personal portfolio" />

          <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
          <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
          <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
          <link rel="manifest" href="/site.webmanifest" />
          <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
          <meta name="msapplication-TileColor" content="#2b5797" />
          <meta name="theme-color" content="#ffffff" />

          <meta itemProp="name" content="iamnick.dev" />
          <meta
            itemProp="description"
            content="A Creative Full Stack Developers personal portfolio"
          />
          <meta itemProp="image" content="https://iamnick.dev/social-icon-260.jpg" />

          <meta name="twitter:card" content="summary" />
          <meta name="twitter:site" content="@dr_182" />
          <meta name="twitter:title" content="iamnick.dev" />
          <meta
            name="twitter:description"
            content="A Creative Full Stack Developers personal portfolio"
          />
          <meta name="twitter:creator" content="@dr_182" />
          <meta name="twitter:image" content="https://iamnick.dev/social-icon-260.jpg" />
        </Head>
        <ThemeProvider theme={theme}>
          <GlobalStyle />
          <ParallaxProvider>
            <Component {...pageProps} />
          </ParallaxProvider>
        </ThemeProvider>
      </>
    );
  }
}

export default App;
