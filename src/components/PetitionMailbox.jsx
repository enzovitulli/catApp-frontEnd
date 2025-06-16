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
  Briefcase,
  Heart,
  CheckCircle,
  XCircle,
  Home,
  Ban,
  Building,
  Baby,
  Users,
  Phone
} from 'lucide-react';
import Button from './Button';
import Pill from './Pill';
import Dropdown from './Dropdown';
import { cardsApi, backofficeApi } from '../services/api';
import WalkDog from '../icons/WalkDog';
import WithDog from '../icons/WithDog';
import RestingDog from '../icons/RestingDog';
import MovingDog from '../icons/MovingDog';
import PawOff from '../icons/PawOff';
import SmolDog from '../icons/SmolDog';
import BigDog from '../icons/BigDog';
import HealthDog from '../icons/HealthDog';
import HoldDog from '../icons/HoldDog';
import RunningDog from '../icons/RunningDog';

const PetitionMailbox = ({ 
  petitions, 
  onUpdatePetition, 
  loading,
  // Ordering props
  orderBy = 'fecha_peticion',
  orderDirection = 'desc',
  onOrderChange,
  showOrderingDropdown = true
}) => {
  const [processingPetition, setProcessingPetition] = useState(null);
  const [petitionPets, setPetitionPets] = useState({});
  const [selectedPetition, setSelectedPetition] = useState(null);
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);  const [petitionDetails, setPetitionDetails] = useState({});
  const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);
  const [petitionToAccept, setPetitionToAccept] = useState(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [petitionToReject, setPetitionToReject] = useState(null);

  // Ordering options
  const orderingOptions = [
    { value: 'fecha_peticion_desc', label: 'Fecha de petición (más reciente primero)' },
    { value: 'fecha_peticion_asc', label: 'Fecha de petición (más antigua primero)' },
    { value: 'animal__nombre_asc', label: 'Nombre del animal (A-Z)' },
    { value: 'animal__nombre_desc', label: 'Nombre del animal (Z-A)' },
    { value: 'animal__fecha_nacimiento_desc', label: 'Edad del animal (más joven primero)' },
    { value: 'animal__fecha_nacimiento_asc', label: 'Edad del animal (más viejo primero)' }
  ];

  // Get current order value for dropdown
  const getCurrentOrderValue = () => {
    return `${orderBy}_${orderDirection}`;
  };

  // Handle order change
  const handleOrderChange = (newOrderValue) => {
    if (!onOrderChange) return;
    
    // Parse the order value correctly
    let parsedField, parsedDirection;
    if (newOrderValue === 'fecha_peticion_desc' || newOrderValue === 'fecha_peticion_asc') {
      parsedField = 'fecha_peticion';
      parsedDirection = newOrderValue.split('_')[2];
    } else if (newOrderValue.startsWith('animal__nombre_')) {
      parsedField = 'animal__nombre';
      parsedDirection = newOrderValue.split('_')[2];
    } else if (newOrderValue.startsWith('animal__fecha_nacimiento_')) {
      parsedField = 'animal__fecha_nacimiento';
      parsedDirection = newOrderValue.split('_')[3];
    }
    
    onOrderChange(parsedField, parsedDirection);
  };

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

  // Auto-select first petition when petitions change
  useEffect(() => {
    if (petitions.length > 0 && !selectedPetition) {
      setSelectedPetition(petitions[0]);
    }  }, [petitions, selectedPetition]);
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
    
    setProcessingPetition(petitionToAccept.id);
    try {
      await onUpdatePetition(petitionToAccept.id, { 
        estado: 'Aceptada',
        leida: true 
      });
      
      // Update the selected petition state
      if (selectedPetition && selectedPetition.id === petitionToAccept.id) {
        setSelectedPetition(prev => ({ 
          ...prev, 
          estado: 'Aceptada',
          leida: true 
        }));
      }
      
      // Update petition details cache
      setPetitionDetails(prev => ({
        ...prev,
        [petitionToAccept.id]: {
          ...prev[petitionToAccept.id],
          estado: 'Aceptada',
          leida: true
        }
      }));
      
      // Close modal
      setIsAcceptModalOpen(false);
      setPetitionToAccept(null);
    } catch (error) {
      console.error('Error accepting petition:', error);
    } finally {
      setProcessingPetition(null);
    }
  };

  // Confirm reject petition
  const confirmRejectPetition = async () => {
    if (!petitionToReject) return;
    
    setProcessingPetition(petitionToReject.id);
    try {
      await onUpdatePetition(petitionToReject.id, { 
        estado: 'Rechazada',
        leida: true 
      });
      
      // Update the selected petition state
      if (selectedPetition && selectedPetition.id === petitionToReject.id) {
        setSelectedPetition(prev => ({ 
          ...prev, 
          estado: 'Rechazada',
          leida: true 
        }));
      }
      
      // Update petition details cache
      setPetitionDetails(prev => ({
        ...prev,
        [petitionToReject.id]: {
          ...prev[petitionToReject.id],
          estado: 'Rechazada',
          leida: true
        }
      }));
      
      // Close modal
      setIsRejectModalOpen(false);
      setPetitionToReject(null);
    } catch (error) {
      console.error('Error rejecting petition:', error);
    } finally {
      setProcessingPetition(null);
    }
  };

  // Calculate pet age from birth date
  const calculatePetAge = (fechaNacimiento) => {
    if (!fechaNacimiento) return 0;
    const birthDate = new Date(fechaNacimiento);
    const today = new Date();
    const ageInYears = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    // Adjust if birthday hasn't occurred this year
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return ageInYears - 1;
    }
    return ageInYears;
  };  // Helper function to translate pet values to human-readable text
  const translatePetValue = (field, value) => {
    const translations = {
      apto_ninos: {
        'excelente': 'ideal con niños',
        'bueno': 'compatible',
        'precaucion': 'supervisión',
        'noRecomendado': 'no apto',
        'desconocido': 'sin evaluar'
      },
      compatibilidad_mascotas: {
        'excelente': 'sociable',
        'bienConPerros': 'solo perros',
        'bienConGatos': 'solo gatos',
        'selectivo': 'selectivo',
        'prefiereSolo': 'independiente',
        'desconocido': 'sin evaluar'
      },
      apto_piso_pequeno: {
        'ideal': 'apto',
        'bueno': 'adaptable',
        'requiereEspacio': 'necesita espacio',
        'soloConJardin': 'solo con jardín',
        'desconocido': 'sin evaluar'
      }
    };
    
    return translations[field]?.[value] || value;
  };

  // Matching algorithm to compare pet characteristics with user preferences
  const calculateCompatibility = (petData, userData) => {
    if (!petData || !userData) return { matches: [], nonMatches: [], score: 0 };
    
    const matches = [];
    const nonMatches = [];
    
    // Calculate pet age to determine if it's "old" (7+ years)
    const petAge = calculatePetAge(petData.fecha_nacimiento);
    const isOldPet = petAge >= 7;
    
    // 1. Kids compatibility (apto_ninos vs tiene_ninos)
    const kidsMatch = !userData.tiene_ninos || 
      ['excelente', 'bueno'].includes(petData.apto_ninos);
    
    if (kidsMatch) {
      matches.push({
        category: 'kids',
        petValue: petData.apto_ninos,
        userValue: userData.tiene_ninos,
        reason: userData.tiene_ninos 
          ? `Buena compatibilidad con niños (${translatePetValue('apto_ninos', petData.apto_ninos)})` 
          : 'No hay niños en casa'
      });
    } else {
      nonMatches.push({
        category: 'kids',
        petValue: petData.apto_ninos,
        userValue: userData.tiene_ninos,
        reason: `Puede requerir precaución con niños (${translatePetValue('apto_ninos', petData.apto_ninos)})`
      });
    }
    
    // 2. Other pets compatibility (compatibilidad_mascotas vs tiene_otros_animales)
    const petsMatch = !userData.tiene_otros_animales || 
      ['excelente', 'bienConPerros', 'bienConGatos'].includes(petData.compatibilidad_mascotas);
    
    if (petsMatch) {
      matches.push({
        category: 'pets',
        petValue: petData.compatibilidad_mascotas,
        userValue: userData.tiene_otros_animales,
        reason: userData.tiene_otros_animales 
          ? `Compatible con otras mascotas (${translatePetValue('compatibilidad_mascotas', petData.compatibilidad_mascotas)})` 
          : 'No hay otras mascotas'
      });
    } else {
      nonMatches.push({
        category: 'pets',
        petValue: petData.compatibilidad_mascotas,
        userValue: userData.tiene_otros_animales,
        reason: `Podría tener dificultades con otras mascotas (${translatePetValue('compatibilidad_mascotas', petData.compatibilidad_mascotas)})`
      });
    }
    
    // 3. Housing compatibility (apto_piso_pequeno vs tipo_vivienda)
    // tipo_vivienda: true = casa, false = apartamento
    const housingMatch = userData.tipo_vivienda || 
      ['ideal', 'bueno'].includes(petData.apto_piso_pequeno);
    
    if (housingMatch) {
      matches.push({
        category: 'housing',
        petValue: petData.apto_piso_pequeno,
        userValue: userData.tipo_vivienda,
        reason: userData.tipo_vivienda 
          ? 'Compatible con casa con espacio' 
          : `Se adapta bien a apartamentos (${translatePetValue('apto_piso_pequeno', petData.apto_piso_pequeno)})`
      });
    } else {
      nonMatches.push({
        category: 'housing',
        petValue: petData.apto_piso_pequeno,
        userValue: userData.tipo_vivienda,
        reason: `Podría necesitar más espacio (${translatePetValue('apto_piso_pequeno', petData.apto_piso_pequeno)})`
      });
    }
    
    // 4. Health issues compatibility (problema_salud vs acepta_enfermos)
    const healthMatch = !petData.problema_salud || userData.acepta_enfermos;
    
    if (healthMatch) {
      matches.push({
        category: 'health',
        petValue: petData.problema_salud,
        userValue: userData.acepta_enfermos,
        reason: petData.problema_salud 
          ? 'Dispuesto a cuidar mascotas con problemas de salud' 
          : 'Mascota saludable'
      });
    } else {
      nonMatches.push({
        category: 'health',
        petValue: petData.problema_salud,
        userValue: userData.acepta_enfermos,
        reason: 'Mascota con problemas de salud, adoptante prefiere mascotas sanas'
      });
    }
    
    // 5. Size preference (tamano vs prefiere_pequenos)
    const sizeMatch = !userData.prefiere_pequenos || petData.tamano === 'pequeño';
    
    if (sizeMatch) {
      matches.push({
        category: 'size',
        petValue: petData.tamano,
        userValue: userData.prefiere_pequenos,
        reason: userData.prefiere_pequenos 
          ? `Mascota pequeña como prefiere (${petData.tamano})` 
          : `Compatible con tamaño ${petData.tamano}`
      });
    } else {
      nonMatches.push({
        category: 'size',
        petValue: petData.tamano,
        userValue: userData.prefiere_pequenos,
        reason: `Mascota ${petData.tamano}, adoptante prefiere pequeñas`
      });
    }
    
    // 6. Age compatibility (calculated age vs acepta_viejos)
    const ageMatch = !isOldPet || userData.acepta_viejos;
    
    if (ageMatch) {
      matches.push({
        category: 'age',
        petValue: petAge,
        userValue: userData.acepta_viejos,
        reason: isOldPet 
          ? `Dispuesto a adoptar mascotas mayores (${petAge} años)` 
          : `Mascota joven (${petAge} años)`
      });
    } else {
      nonMatches.push({
        category: 'age',
        petValue: petAge,
        userValue: userData.acepta_viejos,
        reason: `Mascota mayor (${petAge} años), adoptante prefiere mascotas jóvenes`
      });
    }
    
    // Calculate compatibility score (percentage)
    const totalChecks = matches.length + nonMatches.length;
    const score = totalChecks > 0 ? Math.round((matches.length / totalChecks) * 100) : 0;
    
    return { matches, nonMatches, score };
  };// Get compatibility icon and color based on score
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
    } else {
      return { 
        icon: <XCircle size={30} className="text-red-200" />, 
        color: 'text-red-200',
        bgColor: 'bg-gradient-to-br from-red-500 to-red-700',
        borderColor: '',
        label: 'Compatibilidad limitada',
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
      if (userData.tipo_vivienda) return true; // Casa = always compatible
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
        falseIcon: <Users size={20} />,
        isMatch: isKidsCompatible()
      },
      {
        key: 'tipo_vivienda',
        question: '¿Vives en casa o apartamento?',
        value: userData.tipo_vivienda,
        trueIcon: <Home size={20} />,
        falseIcon: <Building size={20} />,
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
        falseIcon: <BigDog size={20} />,
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
  };  // Mark as read
  const handleMarkAsRead = async (petitionId) => {
    if (processingPetition) return;
    
    setProcessingPetition(petitionId);
    try {
      await onUpdatePetition(petitionId, { leida: true });
      // The parent component will handle updating the petition list
      // Update selected petition if it's the one being processed
      if (selectedPetition && selectedPetition.id === petitionId) {
        setSelectedPetition(prev => ({ ...prev, leida: true }));
      }
    } catch (error) {
      console.error('Error marking petition as read:', error);
    } finally {
      setProcessingPetition(null);
    }
  };

  // Get status config matching BackOfficePetCard style
  const getStatusConfig = (status) => {
    switch (status) {
      case 'Pendiente':
        return {
          className: 'bg-yellow-500 text-white',
          icon: Clock,
          label: 'Pendiente'
        };
      case 'Aceptada':
        return {
          className: 'bg-blue-500 text-white',
          icon: Check,
          label: 'Aceptada'
        };
      case 'Rechazada':
        return {
          className: 'bg-red-500 text-white',
          icon: X,
          label: 'Rechazada'
        };
      default:
        return {
          className: 'bg-gray-500 text-white',
          icon: Clock,
          label: status
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

  // Handle petition selection
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
    }    // Check if we're on mobile and open modal
    const isMobile = window.innerWidth < 1280; // xl breakpoint
    if (isMobile) {
      setIsMobileModalOpen(true);
    }
  };
  // Handle mobile modal close
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-aquamarine-600 mx-auto mb-3"></div>
          <p className="text-gray-500 text-sm np-regular">Cargando peticiones...</p>
        </div>
      </div>
    );
  }
  if (!petitions || petitions.length === 0) {
    return (
      <div className="text-center py-12">
        <Mail size={48} className="mx-auto text-gray-300 mb-4" />
        <h3 className="text-lg np-bold text-gray-900 mb-2">No hay peticiones</h3>
        <p className="text-gray-500 np-regular">
          No se han recibido peticiones de adopción aún.
        </p>
      </div>
    );  }

  // Render petition details content (used for both desktop right panel and mobile modal)
  const renderPetitionDetails = () => {
    if (!selectedPetition) {
      return (
        <motion.div
          key="empty-state"
          className="flex items-center justify-center text-center p-6 min-h-[400px]"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ 
            duration: 0.4,
            ease: [0.4, 0, 0.2, 1],
            x: { ease: "easeOut" }
          }}
        >
          <div>
            <FileText size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg np-bold text-gray-900 mb-2">
              Selecciona una petición
            </h3>
            <p className="text-gray-500 np-regular">
              Elige una petición de la lista para ver los detalles
            </p>
          </div>
        </motion.div>
      );
    }

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
              {(() => {
                const StatusIcon = getStatusConfig(selectedPetition.estado).icon;
                return <StatusIcon size={14} className="mr-2" />;
              })()}
              {getStatusConfig(selectedPetition.estado).label}
            </Pill>
          </div>          <div className="flex items-center text-sm text-gray-600 np-regular">
            <Calendar size={14} className="mr-2" />
            {formatDate(selectedPetition.fecha_peticion)} a las {formatTime(selectedPetition.fecha_peticion)}
          </div>
        </div>

        {/* Pet Information */}
        {petitionPets[selectedPetition.animal] && (
          <div className="mx-6 bg-white rounded-lg shadow-md border border-gray-100 p-6">
            <h4 className="text-lg np-bold text-gray-900 mb-6 flex items-center">
              <PawPrint size={18} className="mr-3 text-aquamarine-600" />
              Información de la mascota
            </h4>            <div className="flex flex-col sm:flex-row sm:items-start space-y-4 sm:space-y-0">
              <div className="w-24 h-24 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 shadow-sm border border-gray-200 mx-auto sm:mx-0 sm:mr-6">
                {getPetImage(petitionPets[selectedPetition.animal]) ? (
                  <img 
                    src={getPetImage(petitionPets[selectedPetition.animal])} 
                    alt={petitionPets[selectedPetition.animal].nombre}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl">
                    {getPetEmoji(petitionPets[selectedPetition.animal].especie)}
                  </div>
                )}
              </div>
              <div className="flex-1 w-full sm:mt-0">
                <h5 className="text-xl np-bold text-gray-900 mb-4 text-center sm:text-left">
                  {petitionPets[selectedPetition.animal].nombre}
                </h5>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <span className="text-gray-500 np-regular text-xs uppercase tracking-wide">Especie</span>
                    <div className="text-gray-900 np-medium text-base capitalize">
                      {petitionPets[selectedPetition.animal].especie}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500 np-regular text-xs uppercase tracking-wide">Raza</span>
                    <div className="text-gray-900 np-medium text-base">
                      {petitionPets[selectedPetition.animal].raza || 'No especificada'}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500 np-regular text-xs uppercase tracking-wide">Sexo</span>
                    <div className="text-gray-900 np-medium text-base capitalize">
                      {petitionPets[selectedPetition.animal].genero}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500 np-regular text-xs uppercase tracking-wide">Tamaño</span>
                    <div className="text-gray-900 np-medium text-base capitalize">
                      {petitionPets[selectedPetition.animal].tamano}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}        {/* User Information */}
        <div className="mx-6 bg-white rounded-lg shadow-md border border-gray-100 p-6">
          <h4 className="text-lg np-bold text-gray-900 mb-6 flex items-center">
            <User size={18} className="mr-3 text-aquamarine-600" />
            Información del solicitante
          </h4>
          
          {/* Always show basic user info and preferences */}
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-3">
              <div>
                <span className="text-gray-500 np-regular text-xs uppercase tracking-wide">Nombre</span>
                <div className="text-gray-900 np-medium text-base">
                  {(petitionDetails[selectedPetition.id]?.usuario?.nombre || selectedPetition.usuario?.nombre) || 
                   (petitionDetails[selectedPetition.id]?.usuario?.username || selectedPetition.usuario?.username)}
                </div>
              </div>
                {(petitionDetails[selectedPetition.id]?.usuario?.provincia || selectedPetition.usuario?.provincia) && (
                <div>
                  <span className="text-gray-500 np-regular text-xs uppercase tracking-wide">Provincia</span>
                  <div className="text-gray-900 np-medium text-base">
                    {petitionDetails[selectedPetition.id]?.usuario?.provincia || selectedPetition.usuario?.provincia}
                  </div>
                </div>
              )}
            </div>

            {/* Biography */}
            <div>
              <span className="text-gray-500 np-regular text-xs uppercase tracking-wide">Biografía</span>
              <div className="text-gray-900 np-medium text-base mt-1">
                {(petitionDetails[selectedPetition.id]?.usuario?.biografia || selectedPetition.usuario?.biografia) ? (
                  <p className="text-gray-800 leading-relaxed">
                    {petitionDetails[selectedPetition.id]?.usuario?.biografia || selectedPetition.usuario?.biografia}
                  </p>
                ) : (
                  <p className="text-gray-500 italic">
                    El usuario no ha añadido una biografía.
                  </p>
                )}
              </div>
            </div>            {/* User Preferences with Compatibility Analysis */}
            <div>
              <span className="text-gray-500 np-regular text-xs uppercase tracking-wide mb-4 block">Compatibilidad con la mascota</span>
              
              {/* Calculate compatibility */}
              {(() => {
                const userData = petitionDetails[selectedPetition.id]?.usuario || selectedPetition.usuario;
                const petData = petitionPets[selectedPetition.animal];
                const compatibility = calculateCompatibility(petData, userData);
                const compatStatus = getCompatibilityStatus(compatibility.score);
                
                return (
                  <div className="space-y-4">                    {/* Compatibility Score Card */}
                    <div className={`${compatStatus.bgColor} rounded-xl p-6 shadow-lg`}>                      {/* Mobile/Tablet: Icon and percentage at top center (md and below) */}
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
                          </p>
                          <div className="space-y-2">
                            {compatibility.matches.map((match) => (
                              <p key={`match-${match.category}`} className={`text-base np-medium ${compatStatus.textColor} drop-shadow-md`}>
                                • {match.reason}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {compatibility.nonMatches.length > 0 && (
                        <div>
                          <p className={`text-sm font-bold np-bold ${compatStatus.textColor} drop-shadow-md mb-3 uppercase tracking-wide flex items-center`}>
                            <XCircle size={20} className="mr-2 text-white" />
                            Aspectos a considerar ({compatibility.nonMatches.length})
                          </p>
                          <div className="space-y-2">
                            {compatibility.nonMatches.map((nonMatch) => (
                              <p key={`nonmatch-${nonMatch.category}`} className={`text-base np-medium ${compatStatus.textColor} drop-shadow-md`}>
                                • {nonMatch.reason}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}                    </div>

                    {/* User Compatibility Preferences Information */}
                    <div>
                      <span className="text-gray-500 np-regular text-xs uppercase tracking-wide mb-4 block">Preferencias del adoptante</span>                      <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
                        <p className="text-sm font-semibold np-bold text-gray-800 mb-4 uppercase tracking-wide">
                          Información de compatibilidad
                        </p>
                        <div className="space-y-3">
                          {getUserPreferences(userData, petData).map(({ key, question, value, trueIcon, falseIcon, trueLabel, falseLabel, isMatch }) => (
                          <div key={key} className="flex items-start space-x-3">
                            <span className={isMatch ? 'text-green-500' : 'text-red-500'}>
                              {value ? trueIcon : falseIcon}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm np-bold text-gray-800 leading-tight">
                                {question}
                              </p>
                              <p className="text-sm np-regular text-gray-600 mt-1">
                                {value 
                                  ? (trueLabel || 'Sí') 
                                  : (falseLabel || 'No')
                                }
                              </p>
                            </div>
                          </div>                        ))}
                      </div>
                    </div>
                    </div>

                    {/* Additional User Lifestyle Information */}
                    <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
                      <p className="text-sm font-semibold np-bold text-gray-800 mb-4 uppercase tracking-wide">
                        Información adicional del adoptante
                      </p>
                      <div className="space-y-3">
                        {[
                          { 
                            key: 'busca_tranquilo', 
                            question: '¿Busca una mascota tranquila?',
                            value: userData?.busca_tranquilo,
                            icon: <RestingDog size={20} />,
                            falseIcon: <MovingDog size={20} />
                          },
                          { 
                            key: 'tiene_trabajo', 
                            question: '¿Tiene empleo estable?',
                            value: userData?.tiene_trabajo,
                            icon: <Briefcase size={20} />,
                            falseIcon: <Ban size={20} />
                          },
                          { 
                            key: 'animal_estara_solo', 
                            question: '¿La mascota estaría sola muchas horas?',
                            value: userData?.animal_estara_solo,
                            icon: <Clock size={20} />,
                            falseIcon: <WithDog size={20} />
                          },
                          { 
                            key: 'disponible_para_paseos', 
                            question: '¿Está disponible para paseos?',
                            value: userData?.disponible_para_paseos,
                            icon: <WalkDog size={20} />,
                            falseIcon: <Home size={20} />
                          }                        ].map(({ key, question, value, icon, falseIcon }) => (
                          <div key={key} className="flex items-start space-x-3">
                            <span className="text-gray-500">
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
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>            {/* Contact Info - Only show after acceptance */}
            {selectedPetition.estado === 'Aceptada' && (
              <div className="mt-4">
                <span className="text-gray-500 np-regular text-xs uppercase tracking-wide mb-3 block">Información de contacto</span>
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg">                  <p className="text-white np-medium text-sm mb-4 drop-shadow-sm text-center">
                    Petición aceptada. Puedes contactar con el adoptante:
                  </p><div className="space-y-4">
                    <div>
                      <span className="text-blue-100 np-semibold text-sm uppercase tracking-wide flex items-center gap-2 mb-1 drop-shadow-sm">
                        <Mail size={16} className="text-blue-100" />
                        Email
                      </span>                      <div className="text-white np-medium text-base drop-shadow-sm">
                        <button 
                          className="text-white np-medium text-base drop-shadow-sm hover:text-blue-100 transition-colors underline decoration-blue-200 hover:decoration-blue-100 bg-transparent border-none p-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-200 focus:ring-opacity-50 rounded"
                          onClick={() => {
                            const email = petitionDetails[selectedPetition.id]?.usuario?.username || selectedPetition.usuario?.username;
                            window.open(`mailto:${email}`, '_blank');
                          }}
                          type="button"
                        >
                          {petitionDetails[selectedPetition.id]?.usuario?.username || selectedPetition.usuario?.username}
                        </button>
                      </div>
                    </div>
                    {(petitionDetails[selectedPetition.id]?.usuario?.telefono || selectedPetition.usuario?.telefono) && (
                      <div>
                        <span className="text-blue-100 np-semibold text-sm uppercase tracking-wide flex items-center gap-2 mb-1 drop-shadow-sm">
                          <Phone size={16} className="text-blue-100" />
                          Teléfono
                        </span>
                        <div className="text-white np-medium text-base drop-shadow-sm">
                          {petitionDetails[selectedPetition.id]?.usuario?.telefono || selectedPetition.usuario?.telefono}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>        {/* Action Buttons */}        <div className="flex items-center justify-center space-x-4 pt-6 px-6">
          {selectedPetition.estado === 'Pendiente' && (
            <>
              <Button 
                onClick={() => handleRejectPetition(selectedPetition)}
                disabled={processingPetition === selectedPetition.id}
                variant="outline"
                leftIcon={<X size={16} />}
                className="border-red-500 text-red-600 hover:bg-red-50 np-medium"
              >
                Rechazar
              </Button>
              <Button 
                onClick={() => handleAcceptPetition(selectedPetition)}
                disabled={processingPetition === selectedPetition.id}
                leftIcon={<Check size={16} />}
                className="bg-blue-600 hover:bg-blue-700 text-white np-medium"
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

  return (<div>      {/* Desktop Split Layout */}
      <div className="hidden lg:flex gap-4 h-fit p-4 w-full">
        {/* Left Panel - Petition List */}
        <div className="w-1/2 bg-white rounded-lg shadow-lg border border-gray-100 flex flex-col overflow-hidden h-fit">
          {/* Header - Now inside left container */}
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h3 className="text-lg np-bold text-gray-900">
                  Peticiones de Adopción
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
              
              {/* Ordering Dropdown */}
              {showOrderingDropdown && onOrderChange && (
                <div className="flex justify-end">
                  <div className="w-full sm:w-80">
                    <Dropdown
                      value={getCurrentOrderValue()}
                      onChange={handleOrderChange}
                      options={orderingOptions}
                      placeholder="Ordenar por..."
                      className="text-sm"
                      displayValue={(value) => {
                        const option = orderingOptions.find(opt => opt.value === value);
                        return option ? option.label : 'Ordenar por...';
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>          
          <div className="divide-y divide-gray-100 flex-1">
            {petitions.length > 0 ? (
              petitions.map((petition) => {
                const statusConfig = getStatusConfig(petition.estado);
                const StatusIcon = statusConfig.icon;
                const petData = petitionPets[petition.animal];
                const petImage = getPetImage(petData);
                const isSelected = selectedPetition && selectedPetition.id === petition.id;              const getItemClassName = () => {
                  if (isSelected) {
                    return 'bg-aquamarine-50 border-r-4 border-aquamarine-500 border-b-gray-100';
                  }
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
                  >                    <div className="flex items-center space-x-4">
                      {/* Pet Image */}
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 border border-white shadow-sm">
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
                        <div className="flex items-center space-x-3 mb-1">                          {/* Read/Unread indicator */}
                          <div className="flex-shrink-0">
                            {petition.leida ? (
                              <MailOpen size={18} className="text-gray-400" />
                            ) : (
                              <Mail size={18} className="text-blue-600" />
                            )}
                          </div>{/* Pet and User names */}
                          <div className="flex items-center space-x-2 min-w-0">
                            <span className={`text-sm truncate ${petition.leida ? 'text-gray-700 np-medium' : 'text-gray-900 np-bold'}`}>
                              {petData?.nombre || 'Cargando...'}
                            </span>                            <span className="text-xs text-gray-500 flex-shrink-0">•</span>
                            <span className={`text-sm truncate ${petition.leida ? 'text-gray-600 np-regular' : 'text-gray-800 np-bold'}`}>
                              {petition.usuario?.nombre || petition.usuario?.username || 'Usuario'}
                            </span>
                          </div>
                        </div>                        {/* Date */}
                        <div className="flex items-center space-x-2">
                          <Calendar size={14} className={`flex-shrink-0 ${petition.leida ? 'text-gray-400' : 'text-gray-500'}`} />                          <span className={`text-sm np-regular ${petition.leida ? 'text-gray-500' : 'text-gray-600'}`}>
                            {formatDate(petition.fecha_peticion)}
                          </span>
                        </div>
                      </div>

                      {/* Status Pill - Centered */}
                      <div className="flex-shrink-0">                        <Pill className={`text-xs np-bold w-28 flex items-center justify-center ${statusConfig.className}`}>
                          <StatusIcon size={10} className="mr-1" />
                          {statusConfig.label}
                        </Pill>
                      </div>

                      {/* Animated Chevron Arrow */}
                      <motion.div
                        className="flex-shrink-0"
                        animate={{ 
                          rotate: isSelected ? -90 : 0,
                          x: isSelected ? -2 : 0
                        }}
                        transition={{ 
                          duration: 0.2,
                          ease: "easeInOut"
                        }}
                      >
                        <ChevronRight size={16} className="text-gray-400" />
                      </motion.div>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="flex items-center justify-center p-8 min-h-[400px]">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail size={24} className="text-gray-400" />
                  </div>
                  <h3 className="text-lg np-bold text-gray-900 mb-2">
                    No hay peticiones
                  </h3>
                  <p className="text-gray-500 np-regular max-w-sm">
                    Cuando lleguen nuevas peticiones de adopción, aparecerán en esta lista para que puedas gestionarlas.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>        {/* Right Panel - Petition Details */}
        <div className="w-1/2 bg-white rounded-lg shadow-lg border border-gray-100 h-fit">
          <AnimatePresence mode="wait">            {selectedPetition ? (              <motion.div 
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
              {renderPetitionDetails()}
            </motion.div>
          ) : (            <motion.div
              key="empty-state"
              className="flex items-center justify-center text-center p-6 min-h-[400px]"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ 
                duration: 0.4,
                ease: [0.4, 0, 0.2, 1],
                x: { ease: "easeOut" }
              }}
            >
              <div>
                <FileText size={48} className="text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg np-bold text-gray-900 mb-2">
                  Selecciona una petición
                </h3>
                <p className="text-gray-500 np-regular">
                  Elige una petición de la lista para ver los detalles
                </p>
              </div>
            </motion.div>
          )}
          </AnimatePresence>
        </div>
      </div>      {/* Mobile Layout */}
      <div className="lg:hidden bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden">
        {/* Header for mobile */}
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h3 className="text-lg np-bold text-gray-900">
                Peticiones de Adopción
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
            
            {/* Ordering Dropdown */}
            {showOrderingDropdown && onOrderChange && (
                              <div className="w-full">
                  <Dropdown
                    value={getCurrentOrderValue()}
                    onChange={handleOrderChange}
                    options={orderingOptions}
                    placeholder="Ordenar por..."
                    className="text-sm"
                    displayValue={(value) => {
                      const option = orderingOptions.find(opt => opt.value === value);
                      return option ? option.label : 'Ordenar por...';
                    }}
                  />
                </div>
            )}
          </div>
        </div>
        
        <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
        {petitions.map((petition) => {
          const statusConfig = getStatusConfig(petition.estado);
          const StatusIcon = statusConfig.icon;
          const isProcessing = processingPetition === petition.id;
          const petData = petitionPets[petition.animal];
          const petImage = getPetImage(petData);          return (
            <button
              key={petition.id}
              className={`w-full p-4 text-left transition-all duration-200 hover:bg-gray-50 cursor-pointer ${
                petition.leida 
                  ? 'bg-white' 
                  : 'bg-blue-50'
              }`}              onClick={(e) => handleSelectPetition(petition, e)}
              type="button"
            >
              {/* Mobile Layout - Keep existing structure */}
              <div className="space-y-3">
                {/* Top Row - Pet Info & Status */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    {/* Pet Image */}
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0">
                      {petImage ? (
                        <img 
                          src={petImage} 
                          alt={petData?.nombre || 'Mascota'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-lg">
                          {petData ? getPetEmoji(petData.especie) : '🐾'}
                        </div>
                      )}
                    </div>

                    {/* Pet & User Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        {/* Read/Unread indicator */}
                        {petition.leida ? (
                          <MailOpen size={14} className="text-gray-400 flex-shrink-0" />
                        ) : (
                          <Mail size={14} className="text-blue-600 flex-shrink-0" />
                        )}

                        <span className={`text-sm np-bold truncate ${petition.leida ? 'text-gray-700' : 'text-gray-900'}`}>
                          {petData?.nombre || 'Cargando...'}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <User size={12} className="text-gray-400 flex-shrink-0" />
                        <span className={`text-sm truncate ${petition.leida ? 'text-gray-600' : 'text-gray-800'}`}>
                          {petition.usuario?.nombre || petition.usuario?.username || 'Usuario'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status Pill */}                  <Pill className={`text-xs np-bold w-28 flex items-center justify-center ${statusConfig.className} flex-shrink-0`}>
                    <StatusIcon size={10} className="mr-1" />
                    {statusConfig.label}
                  </Pill>
                </div>

                {/* Middle Row - Date */}
                <div className="flex items-center space-x-2 px-1">
                  <Calendar size={12} className="text-gray-400" />
                  <span className="text-xs text-gray-500">
                    {formatDate(petition.fecha_peticion)} • {formatTime(petition.fecha_peticion)}
                  </span>
                </div>

                {/* Bottom Row - Only for non-pending or unread petitions */}
                {petition.estado !== 'Pendiente' && !petition.leida && (
                  <div className="flex justify-end pt-2 border-t border-gray-100">
                    <Button
                      onClick={() => handleMarkAsRead(petition.id)}
                      disabled={isProcessing}
                      variant="outline"
                      size="sm"
                      className="text-xs px-3 py-1"
                    >
                      Marcar como leída
                    </Button>
                  </div>
                )}                {isProcessing && (
                  <div className="flex justify-center pt-2">
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span className="text-sm text-gray-500">Procesando...</span>
                    </div>
                  </div>                )}
              </div>
            </button>
          );
        })}
        </div>
      </div>

      {/* Mobile Petition Details Modal */}
      <AnimatePresence>
        {isMobileModalOpen && selectedPetition && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 lg:hidden"
            onClick={() => setIsMobileModalOpen(false)}
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
                  onClick={() => setIsMobileModalOpen(false)}
                  className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              {/* Modal Content - Scrollable */}
              <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
                {renderPetitionDetails()}
              </div>            </motion.div>
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
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-2xl">
                    <Check size={24} className="text-green-600" />
                  </div>
                  <h2 className="text-2xl np-bold text-gray-800">
                    Aceptar Petición
                  </h2>
                </div>
                <button
                  onClick={() => setIsAcceptModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              {/* Content */}
              <div className="space-y-4 mb-6">
                <p className="text-gray-600 np-regular">
                  ¿Estás seguro de que quieres aceptar la petición de adopción de{' '}
                  <span className="np-bold text-gray-900">
                    {petitionToAccept.usuario?.nombre || petitionToAccept.usuario?.username || 'este usuario'}
                  </span>{' '}
                  para{' '}
                  <span className="np-bold text-gray-900">
                    {petitionPets[petitionToAccept.animal]?.nombre || 'esta mascota'}
                  </span>?
                </p>
                <div className="bg-blue-50 p-4 rounded-xl">
                  <p className="text-blue-800 np-medium text-sm">
                    💡 Al aceptar la petición, se mostrará la información de contacto del adoptante 
                    y podrás comunicarte directamente con él.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={() => setIsAcceptModalOpen(false)}
                  variant="outline"
                  className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={confirmAcceptPetition}
                  disabled={processingPetition === petitionToAccept.id}
                  leftIcon={processingPetition === petitionToAccept.id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Check size={16} />
                  )}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  {processingPetition === petitionToAccept.id ? 'Aceptando...' : 'Confirmar'}
                </Button>              </div>
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
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-2xl">
                    <X size={24} className="text-red-600" />
                  </div>
                  <h2 className="text-2xl np-bold text-gray-800">
                    Rechazar Petición
                  </h2>
                </div>
                <button
                  onClick={() => setIsRejectModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              {/* Content */}
              <div className="space-y-4 mb-6">
                <p className="text-gray-600 np-regular">
                  ¿Estás seguro de que quieres rechazar la petición de adopción de{' '}
                  <span className="np-bold text-gray-900">
                    {petitionToReject.usuario?.nombre || petitionToReject.usuario?.username || 'este usuario'}
                  </span>{' '}
                  para{' '}
                  <span className="np-bold text-gray-900">
                    {petitionPets[petitionToReject.animal]?.nombre || 'esta mascota'}
                  </span>?
                </p>
                <div className="bg-red-50 p-4 rounded-xl">
                  <p className="text-red-800 np-medium text-sm">
                    ⚠️ Esta acción marcará la petición como rechazada. 
                    El usuario será notificado de la decisión.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={() => setIsRejectModalOpen(false)}
                  variant="outline"
                  className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={confirmRejectPetition}
                  disabled={processingPetition === petitionToReject.id}
                  leftIcon={processingPetition === petitionToReject.id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <X size={16} />
                  )}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  {processingPetition === petitionToReject.id ? 'Rechazando...' : 'Confirmar'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

PetitionMailbox.propTypes = {
  petitions: PropTypes.array,
  onUpdatePetition: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  orderBy: PropTypes.string,
  orderDirection: PropTypes.string,
  onOrderChange: PropTypes.func,
  showOrderingDropdown: PropTypes.bool,
};

PetitionMailbox.defaultProps = {
  petitions: [],
  loading: false,
  orderBy: 'fecha_peticion',
  orderDirection: 'desc',
  showOrderingDropdown: true,
};

export default PetitionMailbox;
