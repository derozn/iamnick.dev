import React from 'react';
import BurgerMenu from '@shared/components/BurgerMenu';
import Hero from './components/Hero';

/**
 * @todo Remove burgermenu to be in a header componen
 */
const Home = () => (
  <div>
    <BurgerMenu />
    <Hero />
  </div>
);

export default Home;
