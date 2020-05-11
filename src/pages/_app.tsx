import React from 'react';
import NextApp, { AppContext } from 'next/app';
import Head from 'next/head';

class App extends NextApp {
  static async getInitialProps({ Component, ctx }: AppContext) {
    const pageProps = Component.getInitialProps ? await Component.getInitialProps(ctx) : {};

    return { pageProps };
  }

  render() {
    const { Component, pageProps } = this.props;

    return (
      <>
        <Head>
          <title>iamnick.dev</title>
        </Head>
        <Component {...pageProps} />
      </>
    );
  }
}

export default App;
