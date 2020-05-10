import React from 'react';
import App from 'next/app';
import Head from 'next/head';

import ErrorPage from './error';

class MyApp extends App {
  state = {
    error: null,
  };

  static async getInitialProps({ Component, ctx }) {
    try {
      const pageProps = Component.getInitialProps ? await Component.getInitialProps(ctx) : {};
      return { pageProps };
    } catch (error) {
      return {
        error,
      };
    }
  }

  static getDerivedStateFromProps(props, state) {
    return {
      error: props.error || state.error || false,
    };
  }

  componentDidCatch(/* error, errorInfo */) {
    // Log to a service.
  }

  render() {
    const { Component, pageProps } = this.props;
    const { error } = this.state;

    return (
      <>
        <Head>
          <title>iamnick.dev</title>
        </Head>
        {error ? <ErrorPage /> : <Component {...pageProps} />}
      </>
    );
  }
}

export default MyApp;
