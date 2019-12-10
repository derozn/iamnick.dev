import React from 'react';
import BurgerMenu from '@shared/components/BurgerMenu';
import { FixedHeader } from './Header.styles';

const Header = () => (
  <FixedHeader>
    <BurgerMenu />
  </FixedHeader>
);

export default Header;
