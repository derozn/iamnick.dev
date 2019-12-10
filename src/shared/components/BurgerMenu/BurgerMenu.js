import React from 'react';
import PropTypes from 'prop-types';
import { Wrapper, TopBun, Patty, BottomBun } from './BurgerMenu.styles';

const BurgerMenu = ({ isActive }) => (
  <Wrapper isActive={isActive}>
    <TopBun />
    <Patty />
    <BottomBun />
  </Wrapper>
);

BurgerMenu.defaultProps = {
  isActive: false,
};

BurgerMenu.propTypes = {
  isActive: PropTypes.bool,
};

export default BurgerMenu;
