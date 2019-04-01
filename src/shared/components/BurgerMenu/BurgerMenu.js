import React from 'react';
import PropTypes from 'prop-types';
import * as Styles from './BurgerMenu.styles';

const BurgerMenu = ({ isActive }) => (
  <Styles.Wrapper isActive={isActive}>
    <Styles.TopBun />
    <Styles.Patty />
    <Styles.BottomBun />
  </Styles.Wrapper>
);

BurgerMenu.defaultProps = {
  isActive: false,
};

BurgerMenu.propTypes = {
  isActive: PropTypes.bool,
};

export default BurgerMenu;
