import React from 'react';
import PropTypes from 'prop-types';
import * as Styles from './BlockContentAnimation.styles';

const BlockContentAnimation = ({ children, ...rest }) => (
  <Styles.Container {...rest}>
    <Styles.Content>{children}</Styles.Content>
    <Styles.Block />
  </Styles.Container>
);

BlockContentAnimation.propTypes = {
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.element]),
};

export default BlockContentAnimation;
