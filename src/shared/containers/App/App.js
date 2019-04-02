import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import routes from '@shared/routes';
import MainLayout from '@shared/layouts/Main';
import GlobalStyle from '@shared/styles/global';
import * as theme from '@shared/styles/theme';

const App = () => (
  <ThemeProvider theme={theme}>
    <MainLayout>
      <Switch>
        {routes.map(route => (
          <Route {...route} key={route.path} />
        ))}
      </Switch>
      <GlobalStyle />
    </MainLayout>
  </ThemeProvider>
);

export default App;
