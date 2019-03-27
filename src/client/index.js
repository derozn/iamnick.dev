import React from 'react';
import { hydrate } from 'react-dom';
import Client from './Client';

hydrate(<Client />, document.getElementById('app'));
