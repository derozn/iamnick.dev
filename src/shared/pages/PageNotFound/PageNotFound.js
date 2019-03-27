import React from 'react';
import PropTypes from 'prop-types';

const PageNotFound = ({ children }) => (
  <section>
    Could not find the page!!
    {children}
  </section>
);

PageNotFound.propTypes = {
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.node]),
};

export default PageNotFound;
