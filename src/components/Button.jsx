import { forwardRef } from 'react';
import { Link } from 'react-router';

const Button = forwardRef(({ 
  children, 
  className = '', 
  href, 
  to, 
  variant = 'primary', 
  size = 'md',
  disabled = false, 
  width, 
  leftIcon,
  rightIcon,
  ...props 
}, ref) => {
  // Combine all classes
  const classes = `
    btn 
    ${variant ? `btn-${variant}` : ''} 
    ${size ? `btn-${size}` : ''} 
    ${width ? '' : 'w-auto'} 
    ${disabled ? 'btn-disabled' : ''} 
    ${className}
  `;
  
  const style = width ? { width, ...props.style } : props.style;
  
  // Content with icons if provided
  const content = (
    <>
      {leftIcon && <span className="btn-icon-left">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="btn-icon-right">{rightIcon}</span>}
    </>
  );

  // If "to" prop is provided, use React Router's Link for internal navigation
  if (to && !disabled) {
    return (
      <Link to={to} className={classes} style={style} ref={ref} {...props}>
        {content}
      </Link>
    );
  }
  
  // If "href" prop is provided, use anchor tag for external links
  if (href && !disabled) {
    return (
      <a href={href} className={classes} style={style} ref={ref} {...props}>
        {content}
      </a>
    );
  }

  // If none, default to regular button
  return (
    <button className={classes} disabled={disabled} style={style} ref={ref} {...props}>
      {content}
    </button>
  );
});

// For compatibility with motion components
export const MotionButton = ({ children, ...props }) => {
  return <Button {...props}>{children}</Button>;
};

Button.displayName = 'Button';
export default Button;
