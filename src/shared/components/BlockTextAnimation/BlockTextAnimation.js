import React from 'react';
import PropTypes from 'prop-types';
import { PoseGroup } from 'react-pose';
import useIsMounted from '@shared/hooks/useIsMounted';
import * as Styles from './BlockTextAnimation.styles';

const BlockTextAnimation = ({ children }) => {
  const { isMounted } = useIsMounted();

  return (
    <Styles.Container>
      <PoseGroup>
        {isMounted && [
          <Styles.Text key="text">{children}</Styles.Text>,
          <Styles.Block key="block" />,
        ]}
      </PoseGroup>
    </Styles.Container>
  );
};

BlockTextAnimation.propTypes = {
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.element]),
};

export default BlockTextAnimation;
