import React from 'react';
import BurgerMenu from '@shared/components/BurgerMenu';
import * as Styles from './Header.styles';

const Header = () => (
  <Styles.FixedHeader>
    <BurgerMenu />
  </Styles.FixedHeader>
);

export default Header;
