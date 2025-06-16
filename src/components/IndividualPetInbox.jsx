import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mail, 
  MailOpen, 
  Calendar, 
  User, 
  Check, 
  X,   
  Clock,
  PawPrint,
  FileText,
  ChevronRight,
  CheckCircle,
  XCircle,
  Home,
  Baby,
  Phone,
  Heart
} from 'lucide-react';
import Button from './Button';
import Pill from './Pill';
import { cardsApi, backofficeApi } from '../services/api';
import WalkDog from '../icons/WalkDog';
import WithDog from '../icons/WithDog';
import RestingDog from '../icons/RestingDog';
import MovingDog from '../icons/MovingDog';
import PawOff from '../icons/PawOff';
import SmolDog from '../icons/SmolDog';
import HealthDog from '../icons/HealthDog';
import HoldDog from '../icons/HoldDog';
import RunningDog from '../icons/RunningDog';

const IndividualPetInbox = ({ petitions, onUpdatePetition, loading, petName }) => {
  const [processingPetition, setProcessingPetition] = useState(null);
  const [petitionPets, setPetitionPets] = useState({});
  const [selectedPetition, setSelectedPetition] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [petitionDetails, setPetitionDetails] = useState({});
  const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);
  const [petitionToAccept, setPetitionToAccept] = useState(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [petitionToReject, setPetitionToReject] = useState(null);

  // Fetch pet details for each petition
  useEffect(() => {
    const fetchPetDetails = async () => {
      const petDetailsMap = {};
      for (const petition of petitions) {
        if (petition.animal && !petDetailsMap[petition.animal]) {
          try {
            const petResponse = await cardsApi.getCardById(petition.animal);
            petDetailsMap[petition.animal] = petResponse.data;
          } catch (error) {
            console.error(`Error fetching pet ${petition.animal}:`, error);
            // Create a fallback pet object
            petDetailsMap[petition.animal] = {
              id: petition.animal,
              nombre: 'Mascota',
              especie: 'perro',
              imagen1: null
            };
          }
        }
      }
      setPetitionPets(petDetailsMap);
    };

    if (petitions.length > 0) {
      fetchPetDetails();
    }
  }, [petitions]);

  // Fetch detailed petition data
  const fetchPetitionDetails = async (petitionId) => {
    try {
      const response = await backofficeApi.getPetitionById(petitionId);
      setPetitionDetails(prev => ({
        ...prev,
        [petitionId]: response.data
      }));
      return response.data;
    } catch (error) {
      console.error(`Error fetching petition ${petitionId} details:`, error);
      return null;
    }
  };

  // Handle accept petition button click
  const handleAcceptPetition = (petition) => {
    setPetitionToAccept(petition);
    setIsAcceptModalOpen(true);
  };

  // Handle reject petition button click
  const handleRejectPetition = (petition) => {
    setPetitionToReject(petition);
    setIsRejectModalOpen(true);
  };

  // Confirm accept petition
  const confirmAcceptPetition = async () => {
    if (!petitionToAccept) return;
    
    try {
      setProcessingPetition(petitionToAccept.id);
      await onUpdatePetition(petitionToAccept.id, { estado: 'Aceptada' });
    } catch (error) {
      console.error('Error accepting petition:', error);
    } finally {
      setProcessingPetition(null);
      setIsAcceptModalOpen(false);
      setPetitionToAccept(null);
    }
  };

  // Confirm reject petition
  const confirmRejectPetition = async () => {
    if (!petitionToReject) return;
    
    try {
      setProcessingPetition(petitionToReject.id);
      await onUpdatePetition(petitionToReject.id, { estado: 'Rechazada' });
    } catch (error) {
      console.error('Error rejecting petition:', error);
    } finally {
      setProcessingPetition(null);
      setIsRejectModalOpen(false);
      setPetitionToReject(null);
    }
  };
  // Calculate pet age from birth date
  const calculatePetAge = (fechaNacimiento) => {
    if (!fechaNacimiento) return 0;
    
    const birthDate = new Date(fechaNacimiento);
    const today = new Date();
    const ageInYears = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return ageInYears - 1;
    }
    
    return ageInYears;
  };

  // Helper function to translate pet values to human-readable text
  const translatePetValue = (field, value) => {
    const translations = {
      tamano: {
        'pequeño': 'Pequeño',
        'mediano': 'Mediano',
        'grande': 'Grande'
      },
      apto_ninos: {
        'excelente': 'Excelente con niños',
        'bueno': 'Bueno con niños',
        'precaucion': 'Requiere precaución con niños',
        'noRecomendado': 'No recomendado para niños',
        'desconocido': 'Compatibilidad con niños desconocida'
      },
      compatibilidad_mascotas: {
        'excelente': 'Excelente con otros animales',
        'bienConPerros': 'Solo compatible con perros',
        'bienConGatos': 'Solo compatible con gatos',
        'selectivo': 'Selectivo con otros animales',
        'prefiereSolo': 'Prefiere estar solo',
        'desconocido': 'Compatibilidad con otros animales desconocida'
      },
      apto_piso_pequeno: {
        'ideal': 'Ideal para cualquier hogar',
        'bueno': 'Se adapta bien a pisos pequeños',
        'requiereEspacio': 'Requiere más espacio',
        'soloConJardin': 'Solo recomendado con jardín',
        'desconocido': 'Necesidades de espacio desconocidas'
      }
    };

    return translations[field]?.[value] || value;
  };

  // Matching algorithm to compare pet characteristics with user preferences
  const calculateCompatibility = (petData, userData) => {
    if (!petData || !userData) return { score: 0, matches: [], mismatches: [] };
      let score = 0;
    const matches = [];
    const mismatches = [];

    // Size preference
    if (userData.tamano_preferido && petData.tamano) {
      if (userData.tamano_preferido === petData.tamano || userData.tamano_preferido === 'indiferente') {
        score += 25;
        matches.push({
          field: 'Tamaño',
          userPref: translatePetValue('tamano', userData.tamano_preferido),
          petValue: translatePetValue('tamano', petData.tamano)
        });
      } else {
        mismatches.push({
          field: 'Tamaño',
          userPref: translatePetValue('tamano', userData.tamano_preferido),
          petValue: translatePetValue('tamano', petData.tamano)
        });
      }
    }

    // Children compatibility
    if (userData.tiene_ninos !== undefined && petData.apto_ninos) {
      const isCompatible = userData.tiene_ninos ? 
        ['excelente', 'bueno'].includes(petData.apto_ninos) :
        true; // If no children, any pet is fine
      
      if (isCompatible) {
        score += 25;
        matches.push({
          field: 'Niños en el hogar',
          userPref: userData.tiene_ninos ? 'Sí' : 'No',
          petValue: translatePetValue('apto_ninos', petData.apto_ninos)
        });
      } else {
        mismatches.push({
          field: 'Niños en el hogar',
          userPref: userData.tiene_ninos ? 'Sí' : 'No',
          petValue: translatePetValue('apto_ninos', petData.apto_ninos)
        });
      }
    }

    // Other pets compatibility
    if (userData.tiene_mascotas !== undefined && petData.compatibilidad_mascotas) {
      const isCompatible = userData.tiene_mascotas ? 
        ['excelente', 'bienConPerros', 'bienConGatos', 'selectivo'].includes(petData.compatibilidad_mascotas) :
        true; // If no pets, any compatibility is fine
      
      if (isCompatible) {
        score += 25;
        matches.push({
          field: 'Otras mascotas',
          userPref: userData.tiene_mascotas ? 'Sí' : 'No',
          petValue: translatePetValue('compatibilidad_mascotas', petData.compatibilidad_mascotas)
        });
      } else {
        mismatches.push({
          field: 'Otras mascotas',
          userPref: userData.tiene_mascotas ? 'Sí' : 'No',
          petValue: translatePetValue('compatibilidad_mascotas', petData.compatibilidad_mascotas)
        });
      }
    }

    // Space requirements
    if (userData.tipo_vivienda && petData.apto_piso_pequeno) {
      const hasGarden = userData.tipo_vivienda === 'casa_con_jardin';
      const isSmallSpace = userData.tipo_vivienda === 'piso_pequeno';
      
      let isCompatible = true;
      if (petData.apto_piso_pequeno === 'soloConJardin' && !hasGarden) {
        isCompatible = false;
      } else if (petData.apto_piso_pequeno === 'requiereEspacio' && isSmallSpace) {
        isCompatible = false;
      }
      
      if (isCompatible) {
        score += 25;
        matches.push({
          field: 'Tipo de vivienda',
          userPref: userData.tipo_vivienda === 'casa_con_jardin' ? 'Casa con jardín' : 
                   userData.tipo_vivienda === 'piso_grande' ? 'Piso grande' : 'Piso pequeño',
          petValue: translatePetValue('apto_piso_pequeno', petData.apto_piso_pequeno)
        });
      } else {
        mismatches.push({
          field: 'Tipo de vivienda',
          userPref: userData.tipo_vivienda === 'casa_con_jardin' ? 'Casa con jardín' : 
                   userData.tipo_vivienda === 'piso_grande' ? 'Piso grande' : 'Piso pequeño',
          petValue: translatePetValue('apto_piso_pequeno', petData.apto_piso_pequeno)
        });
      }
    }

    return { score: Math.round(score), matches, mismatches };
  };
  // Get compatibility icon and color based on score
  const getCompatibilityStatus = (score) => {
    if (score >= 80) {
      return { 
        icon: <Heart size={30} className="text-blue-200" />, 
        color: 'text-blue-200',
        bgColor: 'bg-gradient-to-br from-blue-500 to-blue-700',
        borderColor: '',
        label: 'Excelente compatibilidad',
        textColor: 'text-white'
      };
    } else if (score >= 60) {
      return { 
        icon: <PawPrint size={30} className="text-yellow-200" />, 
        color: 'text-yellow-200',
        bgColor: 'bg-gradient-to-br from-yellow-400 to-yellow-600',
        borderColor: '',
        label: 'Buena compatibilidad',
        textColor: 'text-white'
      };
    } else if (score >= 40) {
      return { 
        icon: <Clock size={30} className="text-orange-200" />, 
        color: 'text-orange-200',
        bgColor: 'bg-gradient-to-br from-orange-400 to-orange-600',
        borderColor: '',
        label: 'Compatibilidad moderada',
        textColor: 'text-white'
      };
    } else {
      return { 
        icon: <XCircle size={30} className="text-red-200" />, 
        color: 'text-red-200',
        bgColor: 'bg-gradient-to-br from-red-500 to-red-700',
        borderColor: '',
        label: 'Baja compatibilidad',
        textColor: 'text-white'
      };
    }
  };
  // Helper function to get user preference information with compatibility status
  const getUserPreferences = (userData, petData) => {
    if (!userData || !petData) return [];

    // Helper function to check individual compatibility
    const isKidsCompatible = () => {
      if (!userData.tiene_ninos) return true; // No kids = always compatible
      return ['excelente', 'bueno'].includes(petData.apto_ninos);
    };

    const isPetsCompatible = () => {
      if (!userData.tiene_otros_animales) return true; // No pets = always compatible
      return ['excelente', 'bienConPerros', 'bienConGatos'].includes(petData.compatibilidad_mascotas);
    };

    const isHousingCompatible = () => {
      if (userData.tipo_vivienda === 'casa_con_jardin') return true; // Casa = always compatible
      return ['ideal', 'bueno'].includes(petData.apto_piso_pequeno);
    };

    const isHealthCompatible = () => {
      if (!petData.problema_salud) return true; // Healthy pet = always compatible
      return userData.acepta_enfermos;
    };

    const isSizeCompatible = () => {
      if (!userData.prefiere_pequenos) return true; // No size preference = always compatible
      return petData.tamano === 'pequeño';
    };

    const isAgeCompatible = () => {
      const petAge = calculatePetAge(petData.fecha_nacimiento);
      const isOldPet = petAge >= 7;
      if (!isOldPet) return true; // Young pet = always compatible
      return userData.acepta_viejos;
    };

    return [
      {
        key: 'tiene_ninos',
        question: '¿Hay niños en casa?',
        value: userData.tiene_ninos,
        trueIcon: <Baby size={20} />,
        falseIcon: <Home size={20} />,
        isMatch: isKidsCompatible()
      },
      {
        key: 'tipo_vivienda',
        question: '¿Vives en casa o apartamento?',
        value: userData.tipo_vivienda === 'casa_con_jardin',
        trueIcon: <Home size={20} />,
        falseIcon: <Home size={20} />,
        trueLabel: 'Casa',
        falseLabel: 'Apartamento',
        isMatch: isHousingCompatible()
      },
      {
        key: 'tiene_otros_animales',
        question: '¿Tienes otras mascotas?',
        value: userData.tiene_otros_animales,
        trueIcon: <PawPrint size={20} />,
        falseIcon: <PawOff size={20} />,
        isMatch: isPetsCompatible()
      },
      {
        key: 'prefiere_pequenos',
        question: '¿Prefieres mascotas pequeñas?',
        value: userData.prefiere_pequenos,
        trueIcon: <SmolDog size={20} />,
        falseIcon: <PawPrint size={20} />,
        isMatch: isSizeCompatible()
      },
      {
        key: 'acepta_enfermos',
        question: '¿Estarías dispuesto a cuidar una mascota con problemas de salud?',
        value: userData.acepta_enfermos,
        trueIcon: <HealthDog size={20} />,
        falseIcon: <PawPrint size={20} />,
        isMatch: isHealthCompatible()
      },
      {
        key: 'acepta_viejos',
        question: '¿Estarías dispuesto a adoptar una mascota vieja?',
        value: userData.acepta_viejos,
        trueIcon: <HoldDog size={20} />,
        falseIcon: <RunningDog size={20} />,
        isMatch: isAgeCompatible()
      }
    ];
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Format time for display
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Mark as read
  const handleMarkAsRead = async (petitionId) => {
    try {
      await backofficeApi.updatePetition(petitionId, { leida: true });
      // The parent component will handle updating the petition in the list
    } catch (error) {
      console.error('Error marking petition as read:', error);
    }
  };

  // Get status config matching BackOfficePetCard style
  const getStatusConfig = (status) => {
    switch (status) {
      case 'Pendiente':        return {
          label: 'Pendiente',
          className: 'bg-yellow-100 text-yellow-800',
          icon: <Clock size={14} />
        };
      case 'Aceptada':
        return {
          label: 'Aceptada',
          className: 'bg-green-100 text-green-800',
          icon: <CheckCircle size={14} />
        };
      case 'Rechazada':
        return {
          label: 'Rechazada',
          className: 'bg-red-100 text-red-800',
          icon: <XCircle size={14} />
        };
      default:        return {
          label: status,
          className: 'bg-gray-100 text-gray-800',
          icon: <FileText size={14} />
        };
    }
  };

  // Get pet image with fallback
  const getPetImage = (petData) => {
    if (!petData) return null;
    return petData.imagen1 || petData.imagen2 || petData.imagen3 || petData.imagen4 || null;
  };

  // Get pet species emoji
  const getPetEmoji = (especie) => {
    return especie === 'gato' ? '🐱' : '🐶';
  };

  // Handle petition selection - always open modal
  const handleSelectPetition = async (petition, event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    setSelectedPetition(petition);
    
    // Fetch detailed petition data if not already cached
    if (!petitionDetails[petition.id]) {
      await fetchPetitionDetails(petition.id);
    }
    
    // Mark as read when selected if not already read
    if (!petition.leida) {
      handleMarkAsRead(petition.id);
    }

    // Always open modal
    setIsModalOpen(true);
  };

  // Render petition details content (copied from PetitionMailbox)
  const renderPetitionDetails = () => {
    if (!selectedPetition) return null;

    const detailedPetition = petitionDetails[selectedPetition.id] || selectedPetition;
    const petData = petitionPets[selectedPetition.animal];
    
    if (!petData) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-aquamarine-600 mx-auto mb-4"></div>
            <p className="text-gray-500 np-regular">Cargando información...</p>
          </div>
        </div>
      );
    }    const compatibility = calculateCompatibility(petData, detailedPetition.usuario);
    const compatibilityStatus = getCompatibilityStatus(compatibility.score);

    return (
      <motion.div 
        key={selectedPetition.id}
        className="w-full space-y-4 pb-4"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 30 }}
        transition={{ 
          duration: 0.4,
          ease: [0.4, 0, 0.2, 1],
          opacity: { duration: 0.3 },
          x: { duration: 0.4, ease: "easeOut" }
        }}
      >
        {/* Petition Header */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl np-bold text-gray-900">
              Petición de Adopción de {selectedPetition.usuario?.nombre || selectedPetition.usuario?.username || 'Usuario'}
            </h3>            <Pill className={`text-sm np-medium w-32 flex items-center justify-center ${getStatusConfig(selectedPetition.estado).className}`}>
              {getStatusConfig(selectedPetition.estado).icon}
              {getStatusConfig(selectedPetition.estado).label}
            </Pill>
          </div>

          <div className="flex items-center text-sm text-gray-600 np-regular">
            <Calendar size={14} className="mr-2" />
            {formatDate(selectedPetition.fecha_peticion)} a las {formatTime(selectedPetition.fecha_peticion)}
          </div>
        </div>

        {/* Pet Information */}
        <div className="mx-6 bg-white rounded-lg shadow-md border border-gray-100 p-6">
          <h4 className="text-lg np-bold text-gray-900 mb-6 flex items-center">
            <PawPrint size={18} className="mr-3 text-aquamarine-600" />
            Información de la mascota
          </h4>

          <div className="flex flex-col sm:flex-row sm:items-start space-y-4 sm:space-y-0">
            <div className="w-24 h-24 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 shadow-sm border border-gray-200 mx-auto sm:mx-0 sm:mr-6">
              {getPetImage(petData) ? (
                <img 
                  src={getPetImage(petData)} 
                  alt={petData.nombre}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl">
                  {getPetEmoji(petData.especie)}
                </div>
              )}
            </div>            <div className="flex-1 text-center sm:text-left">
              <h5 className="text-xl np-bold text-gray-900 mb-4">{petData.nombre}</h5>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <span className="text-gray-500 np-regular text-xs uppercase tracking-wide">Especie</span>
                  <div className="text-gray-900 np-medium text-base capitalize">
                    {petData.especie}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500 np-regular text-xs uppercase tracking-wide">Raza</span>
                  <div className="text-gray-900 np-medium text-base">
                    {petData.raza || 'No especificada'}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500 np-regular text-xs uppercase tracking-wide">Sexo</span>
                  <div className="text-gray-900 np-medium text-base capitalize">
                    {petData.genero}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500 np-regular text-xs uppercase tracking-wide">Tamaño</span>
                  <div className="text-gray-900 np-medium text-base">
                    {translatePetValue('tamano', petData.tamano)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Adopter Profile */}
        <div className="mx-6 bg-white rounded-lg shadow-md border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg np-bold text-gray-900 flex items-center">
              <User size={18} className="mr-3 text-aquamarine-600" />
              Perfil del adoptante
            </h4>            <div className={`flex items-center px-3 py-1.5 rounded-full ${compatibilityStatus.bgColor}`}>
              <compatibilityStatus.icon size={16} className={`mr-2 ${compatibilityStatus.color}`} />
              <span className={`text-sm np-bold ${compatibilityStatus.color}`}>
                {compatibility.score}% compatible
              </span>
            </div>
          </div>          {/* Basic User Info */}
          <div className="space-y-3 mb-6">
            <div>
              <span className="text-gray-500 np-regular text-xs uppercase tracking-wide">Nombre</span>
              <div className="text-gray-900 np-medium text-base">
                {(detailedPetition.usuario?.nombre || detailedPetition.usuario?.username) || 'No especificado'}
              </div>
            </div>
            {detailedPetition.usuario?.provincia && (
              <div>
                <span className="text-gray-500 np-regular text-xs uppercase tracking-wide">Provincia</span>
                <div className="text-gray-900 np-medium text-base">
                  {detailedPetition.usuario.provincia}
                </div>
              </div>
            )}
          </div>

          {/* Biography */}
          {detailedPetition.usuario?.biografia && (
            <div className="mb-6">
              <span className="text-gray-500 np-regular text-xs uppercase tracking-wide">Biografía</span>
              <div className="text-gray-900 np-medium text-base mt-1">
                <p className="text-gray-800 leading-relaxed">
                  {detailedPetition.usuario.biografia}
                </p>
              </div>
            </div>
          )}          {/* User Preferences with Compatibility Analysis */}
          <div>
            <span className="text-gray-500 np-regular text-xs uppercase tracking-wide mb-4 block">Compatibilidad con la mascota</span>
            
            {/* Calculate compatibility */}            {(() => {
              const userData = detailedPetition.usuario;
              const compatibility = calculateCompatibility(petData, userData);
              const compatStatus = getCompatibilityStatus(compatibility.score);
              
              return (
                <div className="space-y-4">

                  {/* Compatibility Score Card */}
                  <div className={`${compatStatus.bgColor} rounded-xl p-6 shadow-lg`}>

                    {/* Mobile/Tablet: Icon and percentage at top center (md and below) */}
                    <div className="flex items-center justify-center space-x-3 mb-4 lg:hidden">
                      {compatStatus.icon}
                      <div className={`text-3xl font-bold np-bold ${compatStatus.color} drop-shadow-md`}>
                        {compatibility.score}%
                      </div>
                    </div>
                    
                    {/* Desktop: Original layout with percentage on right (lg and above) */}
                    <div className="hidden lg:flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        {compatStatus.icon}
                        <div>
                          <p className={`text-lg font-bold np-bold ${compatStatus.textColor} drop-shadow-md`}>
                            {compatStatus.label}
                          </p>
                          <p className={`text-base np-medium ${compatStatus.textColor} drop-shadow-md`}>
                            Puntuación: {compatibility.score}% de compatibilidad
                          </p>
                        </div>
                      </div>
                      <div className={`text-3xl font-bold np-bold ${compatStatus.color} drop-shadow-md`}>
                        {compatibility.score}%
                      </div>
                    </div>
                    
                    {/* Mobile/Tablet: Text below icon and percentage (md and below) */}
                    <div className="text-center mb-4 lg:hidden">
                      <p className={`text-lg font-bold np-bold ${compatStatus.textColor} drop-shadow-md`}>
                        {compatStatus.label}
                      </p>
                      <p className={`text-base np-medium ${compatStatus.textColor} drop-shadow-md`}>
                        Puntuación: {compatibility.score}% de compatibilidad
                      </p>
                    </div>

                      {/* Compatibility Details */}
                    {compatibility.matches.length > 0 && (
                      <div className="mb-4">
                        <p className={`text-sm font-bold np-bold ${compatStatus.textColor} drop-shadow-md mb-3 uppercase tracking-wide flex items-center`}>
                          <CheckCircle size={20} className="mr-2 text-white" />
                          Aspectos compatibles ({compatibility.matches.length})
                        </p>                        <div className="space-y-2">
                          {compatibility.matches.map((match) => (
                            <p key={`match-${match.field}`} className={`text-base np-medium ${compatStatus.textColor} drop-shadow-md`}>
                              • {match.field}: {match.userPref} ↔ {match.petValue}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                      {compatibility.mismatches.length > 0 && (
                      <div>
                        <p className={`text-sm font-bold np-bold ${compatStatus.textColor} drop-shadow-md mb-3 uppercase tracking-wide flex items-center`}>
                          <XCircle size={20} className="mr-2 text-white" />
                          Aspectos a considerar ({compatibility.mismatches.length})
                        </p>
                        <div className="space-y-2">
                          {compatibility.mismatches.map((mismatch) => (
                            <p key={`mismatch-${mismatch.field}`} className={`text-base np-medium ${compatStatus.textColor} drop-shadow-md`}>
                              • {mismatch.field}: {mismatch.userPref} ↔ {mismatch.petValue}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>

                  {/* User Compatibility Preferences Information */}
                  <div>
                    <span className="text-gray-500 np-regular text-xs uppercase tracking-wide mb-4 block">Preferencias del adoptante</span>

                    <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
                      <p className="text-sm font-semibold np-bold text-gray-800 mb-4 uppercase tracking-wide">
                        Información de compatibilidad
                      </p>
                      <div className="space-y-3">
                        {getUserPreferences(userData, petData).map(({ key, question, value, trueIcon, falseIcon, trueLabel, falseLabel, isMatch }) => (
                        <div key={key} className="flex items-start space-x-3">
                          <span className={isMatch ? 'text-green-500' : 'text-red-500'}>
                            {value ? trueIcon : falseIcon}
                          </span>
                          <div className="flex-1">
                            <p className="text-sm np-medium text-gray-700">{question}</p>
                            <p className={`text-sm np-regular ${isMatch ? 'text-green-600' : 'text-red-600'}`}>
                              {value ? trueLabel : falseLabel}
                            </p>
                          </div>
                        </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

        {/* Additional User Lifestyle Information */}
        <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
          <p className="text-sm font-semibold np-bold text-gray-800 mb-4 uppercase tracking-wide">
            Información adicional del adoptante
          </p>
          <div className="space-y-3">
              {(() => {
                const lifestyleInfo = [
                  { 
                    key: 'busca_tranquilo', 
                    question: '¿Busca una mascota tranquila?',
                    value: detailedPetition.usuario?.busca_tranquilo,
                    icon: <RestingDog size={20} />,
                    falseIcon: <MovingDog size={20} />
                  },
                  { 
                    key: 'busca_jugueton', 
                    question: '¿Busca una mascota juguetona?',
                    value: detailedPetition.usuario?.busca_jugueton,
                    icon: <RunningDog size={20} />,
                    falseIcon: <RestingDog size={20} />
                  },
                  { 
                    key: 'busca_guardian', 
                    question: '¿Busca una mascota guardián?',
                    value: detailedPetition.usuario?.busca_guardian,
                    icon: <WithDog size={20} />,
                    falseIcon: <PawOff size={20} />
                  },
                  { 
                    key: 'experiencia_mascotas', 
                    question: '¿Tiene experiencia con mascotas?',
                    value: detailedPetition.usuario?.experiencia_mascotas,
                    icon: <HealthDog size={20} />,
                    falseIcon: <SmolDog size={20} />
                  },
                  { 
                    key: 'tiempo_cuidado', 
                    question: '¿Tiene tiempo suficiente para el cuidado?',
                    value: detailedPetition.usuario?.tiempo_cuidado,
                    icon: <HoldDog size={20} />,
                    falseIcon: <WalkDog size={20} />
                  }
                ];
                
                return lifestyleInfo.map(({ key, question, value, icon, falseIcon }) => (
                  <div key={key} className="flex items-start space-x-3">
                    <span className="text-neutral-600">
                      {value ? icon : falseIcon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm np-bold text-gray-800 leading-tight">
                        {question}
                      </p>
                      <p className="text-sm np-regular text-gray-600 mt-1">
                        {value ? 'Sí' : 'No'}
                      </p>
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>

        {/* Contact Info - Only show after acceptance */}
        {selectedPetition.estado === 'Aceptada' && (
          <div className="mt-4">
            <span className="text-gray-500 np-regular text-xs uppercase tracking-wide mb-3 block">Información de contacto</span>
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg">
              <p className="text-white np-medium text-sm mb-4 drop-shadow-sm text-center">
                Petición aceptada. Puedes contactar con el adoptante:
              </p>

              <div className="space-y-4">
                <div>
                  <span className="text-blue-100 np-semibold text-sm uppercase tracking-wide flex items-center gap-2 mb-1 drop-shadow-sm">
                    <Mail size={16} className="text-blue-100" />
                    Email
                  </span>
                  <div className="text-white np-medium text-base drop-shadow-sm">
                    <button 
                      className="text-white np-medium text-base drop-shadow-sm hover:text-blue-100 transition-colors underline decoration-blue-200 hover:decoration-blue-100 bg-transparent border-none p-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-200 focus:ring-opacity-50 rounded"
                      onClick={() => {
                        const email = detailedPetition.usuario?.username || detailedPetition.usuario?.email;
                        window.open(`mailto:${email}`, '_blank');
                      }}
                      type="button"
                    >
                      {detailedPetition.usuario?.username || detailedPetition.usuario?.email}
                    </button>
                  </div>
                </div>
                {detailedPetition.usuario?.telefono && (
                  <div>
                    <span className="text-blue-100 np-semibold text-sm uppercase tracking-wide flex items-center gap-2 mb-1 drop-shadow-sm">
                      <Phone size={16} className="text-blue-100" />
                      Teléfono
                    </span>
                    <div className="text-white np-medium text-base drop-shadow-sm">
                      {detailedPetition.usuario.telefono}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>        )}

        {/* Action Buttons */}
        <div className="mx-6 flex flex-col sm:flex-row gap-3 sm:gap-4">
          {selectedPetition.estado === 'Pendiente' && (
            <>
              <Button
                onClick={() => handleRejectPetition(selectedPetition)}
                variant="outline"
                size="md"
                leftIcon={<X size={18} />}
                className="flex-1 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                disabled={processingPetition === selectedPetition.id}
              >
                Rechazar Petición
              </Button>
              <Button
                onClick={() => handleAcceptPetition(selectedPetition)}
                variant="cta"
                size="md"
                leftIcon={<Check size={18} />}
                className="flex-1"
                disabled={processingPetition === selectedPetition.id}
              >
                Aceptar Petición
              </Button>
            </>
          )}
          {processingPetition === selectedPetition.id && (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-aquamarine-600 mr-3"></div>
              <span className="text-sm text-gray-500 np-regular">Procesando...</span>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-aquamarine-600 mx-auto mb-4"></div>
          <p className="text-gray-500 np-regular">Cargando peticiones...</p>
        </div>
      </div>
    );
  }

  if (!petitions || petitions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h3 className="text-lg np-bold text-gray-900">
              {petName ? `Peticiones para ${petName}` : 'Peticiones de Adopción'}
            </h3>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <span className="text-sm text-gray-500 np-regular">
                0 peticiones
              </span>
            </div>
          </div>
        </div>
        
        {/* Empty state */}
        <div className="flex items-center justify-center p-8 min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail size={24} className="text-gray-400" />
            </div>
            <h3 className="text-lg np-bold text-gray-900 mb-2">
              {petName ? `No hay peticiones para ${petName}` : 'No hay peticiones'}
            </h3>
            <p className="text-gray-500 np-regular max-w-sm">
              {petName 
                ? `Cuando lleguen nuevas peticiones para ${petName}, aparecerán aquí.`
                : 'Cuando lleguen nuevas peticiones de adopción, aparecerán en esta lista para que puedas gestionarlas.'
              }
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Petition List */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h3 className="text-lg np-bold text-gray-900">
              {petName ? `Peticiones para ${petName}` : 'Peticiones de Adopción'}
            </h3>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <span className="text-sm text-gray-500 np-regular">
                {petitions.length} {petitions.length === 1 ? 'petición' : 'peticiones'}
              </span>
              {petitions.some(p => !p.leida) && (
                <Pill className="bg-red-500 text-white text-xs np-bold w-fit">
                  {petitions.filter(p => !p.leida).length} nuevas
                </Pill>
              )}
            </div>
          </div>
        </div>
        
        {/* Petition List */}
        <div className="divide-y divide-gray-100">          {petitions.map((petition) => {
            const statusConfig = getStatusConfig(petition.estado);
            const petData = petitionPets[petition.animal];
            const petImage = getPetImage(petData);

            const getItemClassName = () => {
              if (petition.leida) {
                // Read petitions - more muted appearance
                return 'bg-gray-50 hover:bg-gray-100';
              }
              // Unread petitions - bright white background for prominence
              return 'bg-white hover:bg-blue-50 border-l-4 border-l-blue-500 shadow-sm';
            };

            return (
              <button
                key={petition.id}
                className={`w-full p-4 text-left cursor-pointer transition-all duration-200 ${getItemClassName()}`}
                onClick={(e) => handleSelectPetition(petition, e)}
                type="button"
              >
                <div className="flex items-center space-x-4">
                  {/* Pet Image */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 border-2 border-white shadow-sm">
                      {petImage ? (
                        <img 
                          src={petImage} 
                          alt={petData?.nombre || 'Mascota'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">
                          {petData ? getPetEmoji(petData.especie) : '🐾'}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Pet & User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-1">
                      {/* Read/Unread indicator */}
                      <div className="flex-shrink-0">
                        {petition.leida ? (
                          <MailOpen size={18} className="text-gray-400" />
                        ) : (
                          <Mail size={18} className="text-blue-600" />
                        )}
                      </div>

                      {/* Pet and User names */}
                      <div className="flex items-center space-x-2 min-w-0">
                        <span className={`text-sm truncate ${petition.leida ? 'text-gray-700 np-medium' : 'text-gray-900 np-bold'}`}>
                          {petData?.nombre || 'Cargando...'}
                        </span>
                        <span className="text-xs text-gray-500 flex-shrink-0">•</span>
                        <span className={`text-sm truncate ${petition.leida ? 'text-gray-600 np-regular' : 'text-gray-800 np-bold'}`}>
                          {petition.usuario?.nombre || petition.usuario?.username || 'Usuario'}
                        </span>
                      </div>
                    </div>

                    {/* Date */}
                    <div className="flex items-center space-x-2">
                      <Calendar size={14} className={`flex-shrink-0 ${petition.leida ? 'text-gray-400' : 'text-gray-500'}`} />
                      <span className={`text-sm np-regular ${petition.leida ? 'text-gray-500' : 'text-gray-600'}`}>
                        {formatDate(petition.fecha_peticion)}
                      </span>
                    </div>
                  </div>

                  {/* Status Pill - Centered */}
                  <div className="flex-shrink-0">                    <Pill className={`text-xs np-bold w-28 flex items-center justify-center ${statusConfig.className}`}>
                      {statusConfig.icon}
                      {statusConfig.label}
                    </Pill>
                  </div>

                  {/* Chevron Arrow */}
                  <div className="flex-shrink-0">
                    <ChevronRight size={16} className="text-gray-400" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>      {/* Petition Details Modal */}
      <AnimatePresence>
        {isModalOpen && selectedPetition && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="bg-white rounded-lg shadow-xl border border-gray-200 w-full max-w-lg max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
                <h3 className="text-lg np-bold text-gray-900">
                  Petición de Adopción de {selectedPetition.usuario?.nombre || selectedPetition.usuario?.username || 'Usuario'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              {/* Modal Content - Scrollable */}
              <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
                {renderPetitionDetails()}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Accept Petition Confirmation Modal */}
      <AnimatePresence>
        {isAcceptModalOpen && petitionToAccept && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsAcceptModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                  <Check size={24} className="text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg np-bold text-gray-900">
                    Aceptar Petición
                  </h3>
                  <p className="text-sm text-gray-600 np-regular">
                    Esta acción no se puede deshacer
                  </p>
                </div>
              </div>
              
              <p className="text-gray-700 np-regular mb-6">
                ¿Estás seguro de que quieres aceptar la petición de adopción de{' '}
                <span className="np-bold">{petitionToAccept.usuario?.nombre || petitionToAccept.usuario?.username || 'este usuario'}</span>?
              </p>
              
              <div className="flex gap-3">
                <Button
                  onClick={() => setIsAcceptModalOpen(false)}
                  variant="outline"
                  size="md"
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={confirmAcceptPetition}
                  variant="cta"
                  size="md"
                  className="flex-1"
                  leftIcon={<Check size={18} />}
                >
                  Aceptar Petición
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reject Petition Confirmation Modal */}
      <AnimatePresence>
        {isRejectModalOpen && petitionToReject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsRejectModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                  <X size={24} className="text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg np-bold text-gray-900">
                    Rechazar Petición
                  </h3>
                  <p className="text-sm text-gray-600 np-regular">
                    Esta acción no se puede deshacer
                  </p>
                </div>
              </div>
              
              <p className="text-gray-700 np-regular mb-6">
                ¿Estás seguro de que quieres rechazar la petición de adopción de{' '}
                <span className="np-bold">{petitionToReject.usuario?.nombre || petitionToReject.usuario?.username || 'este usuario'}</span>?
              </p>
              
              <div className="flex gap-3">
                <Button
                  onClick={() => setIsRejectModalOpen(false)}
                  variant="outline"
                  size="md"
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={confirmRejectPetition}
                  variant="outline"
                  size="md"
                  className="flex-1 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                  leftIcon={<X size={18} />}
                >
                  Rechazar Petición
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

IndividualPetInbox.propTypes = {
  petitions: PropTypes.array.isRequired,
  onUpdatePetition: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  petName: PropTypes.string
};

IndividualPetInbox.defaultProps = {
  loading: false,
  petName: null
};

export default IndividualPetInbox;
