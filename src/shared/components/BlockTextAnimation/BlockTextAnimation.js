import React from 'react';
import PropTypes from 'prop-types';
import * as Styles from './BlockTextAnimation.styles';

const BlockTextAnimation = ({ children, ...rest }) => (
  <Styles.Container {...rest}>
    <Styles.Content>{children}</Styles.Content>
    <Styles.Block />
  </Styles.Container>
);

BlockTextAnimation.propTypes = {
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.element]),
};

export default BlockTextAnimation;
