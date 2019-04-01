import React from 'react';
import BurgerMenu from '@shared/components/BurgerMenu';
import * as Styles from './Header.styles';

const Header = () => (
  <Styles.StickyHeader>
    <BurgerMenu />
  </Styles.StickyHeader>
);

export default Header;
