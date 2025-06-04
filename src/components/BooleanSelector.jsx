import PropTypes from 'prop-types';

/**
 * BooleanSelector - A reusable component for yes/no questions with icons
 * @param {string} question - The question to display
 * @param {boolean} value - Current selected value
 * @param {function} onChange - Callback when value changes
 * @param {ReactNode} trueIcon - Icon to show for "Yes" option
 * @param {ReactNode} falseIcon - Icon to show for "No" option
 * @param {string} trueLabel - Label for "Yes" option (default: "Sí")
 * @param {string} falseLabel - Label for "No" option (default: "No")
 */
export default function BooleanSelector({ 
  question, 
  value, 
  onChange, 
  trueIcon, 
  falseIcon, 
  trueLabel = "Sí", 
  falseLabel = "No" 
}) {  return (
    <div className="space-y-1 sm:space-y-2">
      <div className="block text-xs sm:text-sm np-medium text-gray-800 text-center leading-tight">
        {question}
      </div>
      <div className="grid grid-cols-2 gap-2">        <button
          type="button"
          onClick={() => onChange(true)}
          className={`p-2 sm:p-2.5 lg:p-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center cursor-pointer 
                      h-[min(8vh,80px)] min-h-[50px] max-h-[80px] sm:h-[min(10vh,100px)] sm:min-h-[60px] sm:max-h-[100px] lg:h-[min(8vh,85px)] lg:min-h-[65px] lg:max-h-[85px]
                      ${
            value === true 
              ? 'border-aquamarine-600 bg-aquamarine-600' 
              : 'border-gray-200 bg-gray-50 hover:border-aquamarine-300'
          }`}
        >
          <div className={`mb-1 ${value === true ? 'text-white' : 'text-gray-500'}`}>
            {trueIcon}
          </div>
          <span className={`np-medium text-xs sm:text-sm leading-tight ${value === true ? 'text-white drop-shadow-sm' : 'text-gray-800'}`}>{trueLabel}</span>
        </button>        <button
          type="button"
          onClick={() => onChange(false)}
          className={`p-2 sm:p-2.5 lg:p-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center cursor-pointer 
                      h-[min(8vh,80px)] min-h-[50px] max-h-[80px] sm:h-[min(10vh,100px)] sm:min-h-[60px] sm:max-h-[100px] lg:h-[min(8vh,85px)] lg:min-h-[65px] lg:max-h-[85px]
                      ${
            value === false 
              ? 'border-aquamarine-600 bg-aquamarine-600' 
              : 'border-gray-200 bg-gray-50 hover:border-aquamarine-300'
          }`}
        >
          <div className={`mb-1 ${value === false ? 'text-white' : 'text-gray-500'}`}>
            {falseIcon}
          </div>
          <span className={`np-medium text-xs sm:text-sm leading-tight ${value === false ? 'text-white drop-shadow-sm' : 'text-gray-800'}`}>{falseLabel}</span>
        </button>
      </div>
    </div>
  );
}

BooleanSelector.propTypes = {
  question: PropTypes.string.isRequired,
  value: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  trueIcon: PropTypes.node.isRequired,
  falseIcon: PropTypes.node.isRequired,
  trueLabel: PropTypes.string,
  falseLabel: PropTypes.string,
};
