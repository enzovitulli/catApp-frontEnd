import PropTypes from 'prop-types';

const Pill = ({ children, className = '' }) => {
  return (
    <span
      className={`
        inline-flex items-center justify-center
        px-3 py-1.5
        text-sm
        rounded-full
        whitespace-nowrap
        transition-colors duration-200
        ${className}
      `.trim()}
    >
      {children}
    </span>
  );
};

Pill.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export default Pill;
