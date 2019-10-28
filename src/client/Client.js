import { hot } from 'react-hot-loader/root';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import App from '@shared/containers/App';

const Client = () => (
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

export default hot(Client);
