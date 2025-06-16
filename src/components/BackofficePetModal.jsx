import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Edit, 
  Trash2, 
  Calendar, 
  Weight, 
  Heart, 
  Shield, 
  Stethoscope, 
  Users, 
  Home, 
  Baby,
  Mars,
  Venus,
  Clock,
  MapPin,
  Eye,
  FileText,
  Mail
} from 'lucide-react';
import { calculateAge } from './Card';
import Pill from './Pill';
import Button from './Button';
import ImageModal from './ImageModal';
import IndividualPetInbox from './IndividualPetInbox';
import { backofficeApi } from '../services/api';
import { useAlert } from '../hooks/useAlert';

const BackofficePetModal = ({ 
  isOpen, 
  onClose, 
  pet, 
  onEdit, 
  onDelete 
}) => {  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [modalImages, setModalImages] = useState([]);
  const [activeTab, setActiveTab] = useState('info'); // 'info' or 'petitions'
  const [petitions, setPetitions] = useState([]);
  const [petitionsLoading, setPetitionsLoading] = useState(false);
  const { showError } = useAlert();

  // Close modal when ESC is pressed
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);
  // Reset active tab when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab('info');
    }
  }, [isOpen]);
  // Load petitions for this pet
  const loadPetitions = useCallback(async () => {
    if (!pet?.id) return;
    
    try {
      setPetitionsLoading(true);
      const response = await backofficeApi.getAnimalDefaultPetitions(pet.id);
      setPetitions(response.data || []);
    } catch (error) {
      console.error('Error loading petitions:', error);
      showError('Error al cargar las peticiones');
      setPetitions([]);
    } finally {
      setPetitionsLoading(false);
    }
  }, [pet?.id, showError]);

  // Load petitions when modal opens and tab is petitions (mobile) or always on desktop
  useEffect(() => {
    if (isOpen) {
      // On desktop (xl+), always load petitions since they're always visible
      // On mobile, only load when petitions tab is active
      const isDesktop = window.innerWidth >= 1280; // xl breakpoint
      if (isDesktop || activeTab === 'petitions') {
        loadPetitions();
      }
    }
  }, [isOpen, activeTab, loadPetitions]);

  // Handle petition updates
  const handlePetitionUpdate = async (petitionId, updateData) => {
    try {
      await backofficeApi.updatePetition(petitionId, updateData);
      // Reload petitions after update
      loadPetitions();
    } catch (error) {
      console.error('Error updating petition:', error);
      showError('Error al actualizar la petición');
    }
  };

  if (!isOpen || !pet) return null;

  // Get all available images
  const getImages = () => {
    const images = [];
    if (pet.imagen1) images.push(pet.imagen1);
    if (pet.imagen2) images.push(pet.imagen2);
    if (pet.imagen3) images.push(pet.imagen3);
    if (pet.imagen4) images.push(pet.imagen4);
    return images;
  };

  // Handle image click to open image modal
  const handleImageClick = (imageIndex) => {
    const images = getImages();
    setModalImages(images);
    setSelectedImageIndex(imageIndex);
    setIsImageModalOpen(true);
  };

  // Format the age display
  const getAgeDisplay = () => {
    if (!pet.fecha_nacimiento) return 'Edad desconocida';
    const age = calculateAge(pet.fecha_nacimiento);
    return age === 1 ? '1 año' : `${age} años`;
  };

  // Format the availability date display
  const getAvailabilityDate = () => {
    if (!pet.fecha_registro && !pet.created_at && !pet.fecha_creacion) {
      return 'Fecha no disponible';
    }
    
    const availabilityDate = pet.fecha_registro || pet.created_at || pet.fecha_creacion;
    const date = new Date(availabilityDate);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Get status color
  const getStatusColor = () => {
    switch (pet.estado) {
      case 'No adoptado':
        return 'bg-green-500 text-white';
      case 'En proceso':
        return 'bg-yellow-500 text-white';
      case 'Adoptado':
        return 'bg-blue-600 text-white';
      default:
        return 'bg-blue-600 text-white';
    }
  };

  // Get species display
  const getSpeciesDisplay = () => {
    return pet.especie === 'perro' ? 'Perro' : 'Gato';
  };

  // Get gender icon and color
  const GenderIcon = pet.genero === 'hembra' ? Venus : Mars;
  const getGenderIconColor = () => {
    return pet.genero === 'hembra' ? 'text-pink-500' : 'text-blue-500';
  };

  // Get aptitude labels
  const getAptitudeLabel = (field, value) => {
    const labels = {
      apto_ninos: {
        'excelente': 'Excelente con niños',
        'bueno': 'Bueno con niños',
        'precaucion': 'Requiere precaución',
        'noRecomendado': 'No recomendado',
        'desconocido': 'No se sabe aún'
      },
      compatibilidad_mascotas: {
        'excelente': 'Excelente con otros animales',
        'bienConPerros': 'Solo con perros',
        'bienConGatos': 'Solo con gatos',
        'selectivo': 'Selectivo',
        'prefiereSolo': 'Prefiere estar solo',
        'desconocido': 'No se sabe aún'
      },
      apto_piso_pequeno: {
        'ideal': 'Perfecto para cualquier hogar',
        'bueno': 'Se adapta bien',
        'requiereEspacio': 'Necesita espacio',
        'soloConJardin': 'Solo con jardín',
        'desconocido': 'No se sabe aún'
      }
    };

    return labels[field]?.[value] || value;
  };

  // Render pet information content
  const renderPetInfo = () => (
    <div className="space-y-6">
      {/* Images Section */}
      {images.length > 0 && (
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
          <h3 className="text-lg np-bold text-gray-900 mb-4 flex items-center gap-2">
            <Heart size={20} className="text-aquamarine-600" />
            Fotos
          </h3>
          <div className="space-y-3">
            {/* Main image (first image) */}
            {images[0] && (
              <div className="relative group cursor-pointer" onClick={() => handleImageClick(0)}>
                <img
                  src={images[0]}
                  alt={`${pet.nombre} - Imagen principal`}
                  className="w-full h-48 object-cover rounded-lg border border-gray-200 
                           hover:shadow-lg transition-all duration-200 group-hover:scale-[1.02]"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 
                              rounded-lg transition-all duration-200 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center">
                      <Eye size={20} className="text-gray-700" />
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Thumbnail images (remaining images) */}
            {images.length > 1 && (
              <div className="grid grid-cols-3 gap-3">
                {images.slice(1, 4).map((image, index) => (
                  <div
                    key={index + 1}
                    className="relative group cursor-pointer"
                    onClick={() => handleImageClick(index + 1)}
                  >
                    <img
                      src={image}
                      alt={`${pet.nombre} - Imagen ${index + 2}`}
                      className="w-full h-20 object-cover rounded-lg border border-gray-200 
                               hover:shadow-lg transition-all duration-200 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 
                                  rounded-lg transition-all duration-200 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-6 h-6 bg-white/90 rounded-full flex items-center justify-center">
                          <Eye size={12} className="text-gray-700" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Basic Information */}
      <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
        <h3 className="text-lg np-bold text-gray-900 mb-4 flex items-center gap-2">
          <Shield size={20} className="text-aquamarine-600" />
          Información Básica
        </h3>
        <div className="space-y-4">
          {/* Availability date first */}
          <div className="w-full">
            <span className="text-sm text-gray-500 np-regular flex items-center gap-1">
              <Clock size={14} />
              Disponible desde
            </span>
            <p className="text-gray-900 np-medium">{getAvailabilityDate()}</p>
          </div>
          
          {/* Other info in a more compact grid */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
            <div>
              <span className="text-sm text-gray-500 np-regular">Especie</span>
              <p className="text-gray-900 np-medium">{getSpeciesDisplay()}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500 np-regular">Raza</span>
              <p className="text-gray-900 np-medium">{pet.raza}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500 np-regular flex items-center gap-1">
                <Calendar size={14} />
                Edad
              </span>
              <p className="text-gray-900 np-medium">{getAgeDisplay()}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500 np-regular flex items-center gap-1">
                <Weight size={14} />
                Tamaño
              </span>
              <p className="text-gray-900 np-medium capitalize">
                {pet.tamano === 'pequeño' ? 'Pequeño' : pet.tamano === 'mediano' ? 'Mediano' : 'Grande'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Health Information */}
      <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
        <h3 className="text-lg np-bold text-gray-900 mb-4 flex items-center gap-2">
          <Stethoscope size={20} className="text-aquamarine-600" />
          Información de Salud
        </h3>
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          <div>
            <span className="text-sm text-gray-500 np-regular">¿Esterilizado?</span>
            <p className={`np-medium ${pet.esterilizado ? 'text-green-600' : 'text-red-600'}`}>
              {pet.esterilizado ? 'Sí' : 'No'}
            </p>
          </div>
          <div>
            <span className="text-sm text-gray-500 np-regular">¿Tiene problemas de salud?</span>
            <p className={`np-medium ${pet.problema_salud ? 'text-red-600' : 'text-green-600'}`}>
              {pet.problema_salud ? 'Sí' : 'No'}
            </p>
          </div>
          {pet.problema_salud && pet.descripcion_salud && (
            <div className="col-span-2">
              <span className="text-sm text-gray-500 np-regular">Descripción:</span>
              <p className="text-gray-900 np-regular mt-1">{pet.descripcion_salud}</p>
            </div>
          )}
        </div>
      </div>

      {/* Personality and History */}
      <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
        <h3 className="text-lg np-bold text-gray-900 mb-4 flex items-center gap-2">
          <Heart size={20} className="text-aquamarine-600" />
          Personalidad e Historia
        </h3>
        <div className="space-y-4">
          {pet.temperamento && (
            <div>
              <span className="text-sm text-gray-500 np-regular">Temperamento:</span>
              <p className="text-gray-900 np-regular mt-1">{pet.temperamento}</p>
            </div>
          )}
          {pet.historia && (
            <div>
              <span className="text-sm text-gray-500 np-regular">Historia:</span>
              <p className="text-gray-900 np-regular mt-1">{pet.historia}</p>
            </div>
          )}
        </div>
      </div>

      {/* Social Characteristics */}
      <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
        <h3 className="text-lg np-bold text-gray-900 mb-4 flex items-center gap-2">
          <Users size={20} className="text-aquamarine-600" />
          Características Sociales
        </h3>
        <div className="space-y-4">
          <div>
            <span className="text-sm text-gray-500 np-regular">Con niños:</span>
            <p className="text-gray-900 np-medium">
              {getAptitudeLabel('apto_ninos', pet.apto_ninos)}
            </p>
          </div>
          <div>
            <span className="text-sm text-gray-500 np-regular">Con otros animales:</span>
            <p className="text-gray-900 np-medium">
              {getAptitudeLabel('compatibilidad_mascotas', pet.compatibilidad_mascotas)}
            </p>
          </div>
          <div>
            <span className="text-sm text-gray-500 np-regular">Tipo de hogar:</span>
            <p className="text-gray-900 np-medium">
              {getAptitudeLabel('apto_piso_pequeno', pet.apto_piso_pequeno)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );  // Render petitions content - individual pet inbox
  const renderPetitions = () => (
    <div className="h-full">
      <IndividualPetInbox
        petitions={petitions}
        onUpdatePetition={handlePetitionUpdate}
        loading={petitionsLoading}
        petName={pet.nombre}
      />
    </div>
  );

  const images = getImages();

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full max-w-7xl h-[95vh] sm:max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >            {/* Desktop Layout - Two separate floating containers */}
            <div className="hidden xl:flex gap-4 2xl:gap-6 h-full">
              {/* Left Container - Pet Information (50% width) */}
              <div className="flex-[1] bg-white rounded-2xl shadow-lg overflow-hidden">
                {/* Header inside left container */}                <div className="bg-oxford-900 text-white p-4 xl:p-6 flex items-center justify-between">
                  <div className="flex items-center gap-3 xl:gap-4 min-w-0">
                    <div className="flex items-center gap-2 xl:gap-3 min-w-0">
                      <h2 className="text-lg xl:text-2xl np-bold truncate">{pet.nombre}</h2>
                      <GenderIcon size={16} className={`${getGenderIconColor()} flex-shrink-0`} />
                    </div>
                    <Pill className={`text-xs xl:text-sm np-bold ${getStatusColor()} flex-shrink-0`}>
                      {pet.estado}
                    </Pill>
                  </div>
                    <div className="flex items-center gap-2 flex-shrink-0">                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (pet.estado !== 'Adoptado') {
                          onEdit(pet);
                        }
                      }}
                      disabled={pet.estado === 'Adoptado'}
                      variant="outline"
                      size="sm"                      leftIcon={<Edit size={16} />}
                      className={`text-xs xl:text-sm px-2 xl:px-3 py-1.5 xl:py-2 ${
                        pet.estado === 'Adoptado'
                          ? 'text-gray-400 border-gray-400 cursor-not-allowed opacity-50'
                          : 'text-white border-white hover:bg-blue-600 hover:text-white hover:border-blue-600'
                      }`}
                      title={pet.estado === 'Adoptado' ? 'No se puede editar una mascota adoptada' : 'Editar mascota'}
                    >
                      <span className="hidden xl:inline">Editar</span>
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (pet.estado !== 'Adoptado') {
                          onDelete(pet);
                        }
                      }}
                      disabled={pet.estado === 'Adoptado'}
                      variant="outline"
                      size="sm"                      leftIcon={<Trash2 size={16} />}
                      className={`text-xs xl:text-sm px-2 xl:px-3 py-1.5 xl:py-2 ${
                        pet.estado === 'Adoptado'
                          ? 'text-gray-400 border-gray-400 cursor-not-allowed opacity-50'
                          : 'text-red-400 border-red-400 hover:bg-red-400 hover:text-white'
                      }`}
                      title={pet.estado === 'Adoptado' ? 'No se puede eliminar una mascota adoptada' : 'Eliminar mascota'}
                    >
                      <span className="hidden xl:inline">Eliminar</span>
                    </Button>
                    <button
                      onClick={onClose}
                      className="p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer flex-shrink-0"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>                {/* Pet information content */}
                <div className="max-h-[calc(95vh-120px)] sm:max-h-[calc(90vh-120px)] overflow-y-auto p-4 xl:p-6">
                  {renderPetInfo()}
                </div>
              </div>

              {/* Right Container - Petitions (50% width) */}
              <div className="flex-[1] bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="h-full p-4 xl:p-6">
                  {renderPetitions()}
                </div>
              </div>
            </div>

            {/* Mobile Layout - Single container with tabs */}
            <div className="xl:hidden bg-white rounded-xl xl:rounded-2xl shadow-lg overflow-hidden h-full flex flex-col">
              {/* Shared Header */}
              <div className="bg-oxford-900 text-white p-3 sm:p-4 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <div className="flex items-center gap-1 sm:gap-2 min-w-0">
                    <h2 className="text-base sm:text-xl np-bold truncate">{pet.nombre}</h2>
                    <GenderIcon size={14} className={`${getGenderIconColor()} flex-shrink-0`} />
                  </div>
                  <Pill className={`text-xs np-bold ${getStatusColor()} flex-shrink-0`}>
                    {pet.estado}
                  </Pill>
                </div>                <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (pet.estado !== 'Adoptado') {
                        onEdit(pet);
                      }
                    }}
                    disabled={pet.estado === 'Adoptado'}
                    variant="outline"
                    size="sm"
                    leftIcon={<Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                    className={`text-xs px-2 sm:px-3 py-1.5 sm:py-1 ${
                      pet.estado === 'Adoptado'
                        ? 'text-gray-400 border-gray-400 cursor-not-allowed opacity-50'
                        : 'text-white border-white hover:bg-blue-600 hover:text-white hover:border-blue-600'
                    }`}
                    title={pet.estado === 'Adoptado' ? 'No se puede editar una mascota adoptada' : 'Editar mascota'}
                  >
                    <span className="hidden sm:inline">Editar</span>
                  </Button>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (pet.estado !== 'Adoptado') {
                        onDelete(pet);
                      }
                    }}
                    disabled={pet.estado === 'Adoptado'}
                    variant="outline"
                    size="sm"
                    leftIcon={<Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                    className={`text-xs px-2 sm:px-3 py-1.5 sm:py-1 ${
                      pet.estado === 'Adoptado'
                        ? 'text-gray-400 border-gray-400 cursor-not-allowed opacity-50'
                        : 'text-red-400 border-red-400 hover:bg-red-400 hover:text-white'
                    }`}
                    title={pet.estado === 'Adoptado' ? 'No se puede eliminar una mascota adoptada' : 'Eliminar mascota'}
                  >
                    <span className="hidden sm:inline">Eliminar</span>
                  </Button>
                  <button
                    onClick={onClose}
                    className="p-1.5 sm:p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer flex-shrink-0"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="border-b border-gray-200 bg-white flex-shrink-0">
                <nav className="flex">
                  <button
                    onClick={() => setActiveTab('info')}
                    className={`flex-1 py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm np-medium border-b-2 transition-colors ${
                      activeTab === 'info'
                        ? 'border-aquamarine-500 text-aquamarine-600 bg-aquamarine-50'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1 sm:gap-2">
                      <FileText size={14} />
                      <span>Información</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('petitions')}
                    className={`flex-1 py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm np-medium border-b-2 transition-colors ${
                      activeTab === 'petitions'
                        ? 'border-aquamarine-500 text-aquamarine-600 bg-aquamarine-50'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1 sm:gap-2">
                      <Mail size={14} />
                      <span className="truncate">Peticiones</span>
                    </div>
                  </button>
                </nav>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-4">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {activeTab === 'info' ? renderPetInfo() : renderPetitions()}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Image Modal */}
      <ImageModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        images={modalImages}
        initialIndex={selectedImageIndex}
        petName={pet.nombre}
      />
    </>
  );
};

BackofficePetModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  pet: PropTypes.object,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default BackofficePetModal;
