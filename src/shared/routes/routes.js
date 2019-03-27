import Home from '@shared/pages/Home';
import PageNotFound from '@shared/pages/PageNotFound';

export default [
  {
    path: '/',
    component: Home,
    exact: true,
  },
  {
    path: '*',
    component: PageNotFound,
  },
];
