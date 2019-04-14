import React from 'react';
import PropTypes from 'prop-types';
import LazyImage from 'react-lazy-progressive-image';
import * as Styles from './ProgressiveImage.styles';

const ProgressiveImage = ({ src, placeholder, alt, width, height }) => (
  <LazyImage src={src} placeholder={placeholder}>
    {(src, loading) => (
      <Styles.Wrapper width={width} height={height}>
        <Styles.Thumbnail src={placeholder} alt={alt} />
        <Styles.Image src={src} alt={alt} loading={loading} />
      </Styles.Wrapper>
    )}
  </LazyImage>
);

ProgressiveImage.propTypes = {
  src: PropTypes.string.isRequired,
  placeholder: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
};

export default ProgressiveImage;
