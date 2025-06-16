import AppHeader from '../components/AppHeader';
import Navbar from '../components/Navbar';
import PropTypes from 'prop-types';

export default function MainLayout({ children, activeTab, setActiveTab }) {
  return (
    <div className="min-h-screen flex flex-col hide-scrollbar overflow-x-hidden transition-colors duration-300">
      <AppHeader activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1">
        {children}
      </div>
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

MainLayout.propTypes = {
  children: PropTypes.node.isRequired,
  activeTab: PropTypes.string.isRequired,
  setActiveTab: PropTypes.func.isRequired,
};
