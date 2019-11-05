import React from 'react';
import PropTypes from 'prop-types';
import { Container, Content, Block } from './BlockContentAnimation.styles';

const BlockContentAnimation = ({ children, ...rest }) => (
  <Container {...rest}>
    <Content>{children}</Content>
    <Block />
  </Container>
);

BlockContentAnimation.defaultProps = {
  delay: 0,
};

BlockContentAnimation.propTypes = {
  delay: PropTypes.number,
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.element]),
};

export default BlockContentAnimation;
