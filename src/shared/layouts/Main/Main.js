import React from 'react';
import PropTypes from 'prop-types';
import Header from '@shared/components/Header';
import * as Styles from './Main.styles';

const Main = ({ children }) => (
  <Styles.Wrapper>
    <Header />
    <Styles.FlexedContent>{children}</Styles.FlexedContent>
  </Styles.Wrapper>
);

Main.defaultProps = {
  children: null,
};

Main.propTypes = {
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.element]),
};

export default Main;
