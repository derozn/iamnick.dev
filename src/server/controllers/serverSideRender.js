import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import { ServerStyleSheet } from 'styled-components';

import App from '@shared/containers/App';

const serverSideRender = (req, res, next) => {
  const context = {};
  const { url } = req;

  try {
    const sheet = new ServerStyleSheet();

    const html = renderToString(
      sheet.collectStyles(
        <StaticRouter location={url} context={context}>
          <App />
        </StaticRouter>
      )
    );

    // Handle redirect.
    if (context.status === 302) {
      return res.redirect(302, context.url);
    }

    const styleTags = sheet.getStyleTags();

    const templateData = {
      title: 'iamnick.dev',
      initialHtml: html,
      description: 'Nick de Rozarieux portfolio',
      initialCSS: styleTags,
    };

    res.render('index', templateData);
  } catch (err) {
    next(err);
  }
};

export default serverSideRender;
