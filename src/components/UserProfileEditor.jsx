import { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'motion/react';
import { User, Phone, MapPin, FileText, Heart, Home, Users, Briefcase, X, Save, Loader2 } from 'lucide-react';
import PropTypes from 'prop-types';
import InputField from './InputField';
import ProvinceSelector from './ProvinceSelector';
import TextField from './TextField';
import ToggleSwitch from './ToggleSwitch';
import Button from './Button';
import { useAlert } from '../hooks/useAlert';
import { authApi } from '../services/api';

const UserProfileEditor = ({ isOpen, onClose, user, onUserUpdate }) => {
  const [formData, setFormData] = useState({
    telefono: '',
    provincia: '',
    nombre: '',
    biografia: '',
    tiene_ninos: false,
    tiene_otros_animales: false,
    tipo_vivienda: false,
    prefiere_pequenos: false,
    disponible_para_paseos: false,
    acepta_enfermos: false,
    acepta_viejos: false,
    busca_tranquilo: false,
    tiene_trabajo: false,
    animal_estara_solo: false
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const { showError, showSuccess } = useAlert();

  // Initialize form data when user prop changes
  useEffect(() => {
    if (user) {
      setFormData({
        telefono: user.telefono || '',
        provincia: user.provincia || '',
        nombre: user.nombre || '',
        biografia: user.biografia || '',
        tiene_ninos: user.tiene_ninos || false,
        tiene_otros_animales: user.tiene_otros_animales || false,
        tipo_vivienda: user.tipo_vivienda || false,
        prefiere_pequenos: user.prefiere_pequenos || false,
        disponible_para_paseos: user.disponible_para_paseos || false,
        acepta_enfermos: user.acepta_enfermos || false,
        acepta_viejos: user.acepta_viejos || false,
        busca_tranquilo: user.busca_tranquilo || false,
        tiene_trabajo: user.tiene_trabajo || false,
        animal_estara_solo: user.animal_estara_solo || false
      });
      setHasChanges(false);
    }
  }, [user]);

  // Check for changes
  useEffect(() => {
    if (user) {
      const hasChanged = Object.keys(formData).some(key => {
        return formData[key] !== (user[key] || (typeof formData[key] === 'boolean' ? false : ''));
      });
      setHasChanges(hasChanged);
    }
  }, [formData, user]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hasChanges) return;

    setIsLoading(true);
    try {
      const response = await authApi.updateProfile(formData);
      console.log('Profile updated successfully:', response.data);
      
      showSuccess('Perfil actualizado correctamente');
      
      // Update the user data in parent component
      if (onUserUpdate) {
        onUserUpdate(response.data);
      }
      
      // Close the modal after successful update
      setTimeout(() => {
        onClose();
      }, 1000);
      
    } catch (err) {
      console.error('Error updating profile:', err);
      
      if (err.response?.data) {
        const errorData = err.response.data;
        // Handle field-specific errors
        if (typeof errorData === 'object') {
          const firstError = Object.values(errorData)[0];
          showError(Array.isArray(firstError) ? firstError[0] : firstError);
        } else {
          showError('Error al actualizar el perfil. Inténtalo de nuevo.');
        }
      } else {
        showError('Error de conexión. Inténtalo de nuevo.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (hasChanges) {
      if (window.confirm('¿Estás seguro de que quieres cerrar? Se perderán los cambios no guardados.')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-marine-800 rounded-3xl w-full max-w-2xl max-h-[calc(90vh-6rem)] md:max-h-[90vh] overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-marine-600">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orchid-100 dark:bg-orchid-900/50 rounded-2xl">
                <User size={24} className="text-orchid-600 dark:text-orchid-400" />
              </div>
              <div>
                <h2 className="text-2xl np-bold text-gray-900 dark:text-white">
                  Editar Perfil
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Actualiza tu información personal y preferencias
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-marine-700 rounded-xl transition-colors"
            >
              <X size={20} className="text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Form Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-6rem-140px)] md:max-h-[calc(90vh-140px)]">
            <form onSubmit={handleSubmit} className="p-6 space-y-8">
              {/* Personal Information Section */}
              <div>
                <h3 className="text-lg np-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <User size={20} className="text-orchid-500" />
                  Información Personal
                </h3>
                <div className="space-y-4">
                  <InputField
                    id="nombre"
                    label="Nombre completo"
                    type="text"
                    value={formData.nombre}
                    onChange={(value) => handleInputChange('nombre', value)}
                    placeholder="Tu nombre completo"
                    leftIcon={<User size={20} />}
                  />
                  
                  <InputField
                    id="telefono"
                    label="Teléfono"
                    type="tel"
                    value={formData.telefono}
                    onChange={(value) => handleInputChange('telefono', value)}
                    placeholder="600 123 456"
                    leftIcon={<Phone size={20} />}
                  />
                  
                  <ProvinceSelector
                    value={formData.provincia}
                    onChange={(value) => handleInputChange('provincia', value)}
                    label="Provincia"
                    placeholder="Selecciona tu provincia"
                    labelSize="base"
                  />
                  
                  <TextField
                    id="biografia"
                    label="Biografía"
                    value={formData.biografia}
                    onChange={(value) => handleInputChange('biografia', value)}
                    placeholder="Cuéntanos un poco sobre ti y tu experiencia con mascotas..."
                    leftIcon={<FileText size={20} />}
                    maxLength={500}
                    rows={3}
                  />
                </div>
              </div>

              {/* Living Situation Section */}
              <div>
                <h3 className="text-lg np-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Home size={20} className="text-aquamarine-500" />
                  Situación de Vivienda
                </h3>
                <div className="space-y-4">
                  <ToggleSwitch
                    checked={formData.tiene_ninos}
                    onChange={(value) => handleInputChange('tiene_ninos', value)}
                    label="Tengo niños en casa"
                    description="¿Hay niños viviendo en tu hogar?"
                  />
                  
                  <ToggleSwitch
                    checked={formData.tiene_otros_animales}
                    onChange={(value) => handleInputChange('tiene_otros_animales', value)}
                    label="Tengo otras mascotas"
                    description="¿Ya tienes otros animales en casa?"
                  />
                  
                  <ToggleSwitch
                    checked={formData.tipo_vivienda}
                    onChange={(value) => handleInputChange('tipo_vivienda', value)}
                    label="Vivo en casa con jardín"
                    description="¿Tu vivienda tiene espacio exterior?"
                  />
                </div>
              </div>

              {/* Pet Preferences Section */}
              <div>
                <h3 className="text-lg np-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Heart size={20} className="text-pink-500" />
                  Preferencias de Mascotas
                </h3>
                <div className="space-y-4">
                  <ToggleSwitch
                    checked={formData.prefiere_pequenos}
                    onChange={(value) => handleInputChange('prefiere_pequenos', value)}
                    label="Prefiero animales pequeños"
                    description="¿Te interesan más los animales de tamaño pequeño?"
                  />
                  
                  <ToggleSwitch
                    checked={formData.acepta_enfermos}
                    onChange={(value) => handleInputChange('acepta_enfermos', value)}
                    label="Acepto animales con problemas de salud"
                    description="¿Estarías dispuesto/a a cuidar animales que necesiten tratamiento médico?"
                  />
                  
                  <ToggleSwitch
                    checked={formData.acepta_viejos}
                    onChange={(value) => handleInputChange('acepta_viejos', value)}
                    label="Acepto animales mayores"
                    description="¿Te interesan los animales de edad avanzada?"
                  />
                  
                  <ToggleSwitch
                    checked={formData.busca_tranquilo}
                    onChange={(value) => handleInputChange('busca_tranquilo', value)}
                    label="Busco un animal tranquilo"
                    description="¿Prefieres animales con temperamento calmado?"
                  />
                </div>
              </div>

              {/* Availability Section */}
              <div>
                <h3 className="text-lg np-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Briefcase size={20} className="text-blue-500" />
                  Disponibilidad y Trabajo
                </h3>
                <div className="space-y-4">
                  <ToggleSwitch
                    checked={formData.disponible_para_paseos}
                    onChange={(value) => handleInputChange('disponible_para_paseos', value)}
                    label="Disponible para paseos"
                    description="¿Puedes sacar a pasear al animal regularmente?"
                  />
                  
                  <ToggleSwitch
                    checked={formData.tiene_trabajo}
                    onChange={(value) => handleInputChange('tiene_trabajo', value)}
                    label="Tengo trabajo"
                    description="¿Trabajas fuera de casa?"
                  />
                  
                  <ToggleSwitch
                    checked={formData.animal_estara_solo}
                    onChange={(value) => handleInputChange('animal_estara_solo', value)}
                    label="El animal estará solo durante el día"
                    description="¿El animal pasará tiempo solo en casa?"
                  />
                </div>
              </div>

              {/* Form Footer - Inside the scrollable area */}
              <div className="flex items-center justify-between pt-6 mt-8 border-t border-gray-200 dark:border-marine-600">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {hasChanges ? 'Tienes cambios sin guardar' : 'No hay cambios'}
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="ghost"
                    onClick={handleClose}
                    disabled={isLoading}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    onClick={handleSubmit}
                    disabled={!hasChanges || isLoading}
                    leftIcon={isLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  >
                    {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

UserProfileEditor.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  user: PropTypes.object,
  onUserUpdate: PropTypes.func
};

export default UserProfileEditor; 