import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { 
  Mail, 
  MailOpen, 
  Calendar, 
  User, 
  Phone, 
  MapPin, 
  Check, 
  X, 
  Clock,
  ChevronRight,
  ChevronDown,
  Heart
} from 'lucide-react';
import Button from './Button';
import Pill from './Pill';
import { cardsApi } from '../services/api';

const PetitionMailbox = ({ petitions, onUpdatePetition, loading }) => {
  const [processingPetition, setProcessingPetition] = useState(null);
  const [expandedPetition, setExpandedPetition] = useState(null);
  const [petitionPets, setPetitionPets] = useState({});

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

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle petition status update
  const handleUpdatePetition = async (petitionId, newStatus) => {
    setProcessingPetition(petitionId);
    try {
      await onUpdatePetition(petitionId, { 
        estado: newStatus, 
        leida: true 
      });
    } finally {
      setProcessingPetition(null);
    }
  };

  // Mark as read
  const handleMarkAsRead = async (petitionId) => {
    if (processingPetition) return;
    setProcessingPetition(petitionId);
    try {
      await onUpdatePetition(petitionId, { leida: true });
    } finally {
      setProcessingPetition(null);
    }
  };

  // Toggle petition expansion
  const togglePetitionExpansion = (petitionId) => {
    setExpandedPetition(expandedPetition === petitionId ? null : petitionId);
    
    // Mark as read when expanded if not already read
    const petition = petitions.find(p => p.id === petitionId);
    if (petition && !petition.leida) {
      handleMarkAsRead(petitionId);
    }
  };

  // Get status color and icon
  const getStatusConfig = (status) => {
    switch (status) {
      case 'Pendiente':
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: Clock,
          label: 'Pendiente',
          dotColor: 'bg-yellow-500'
        };
      case 'Aceptada':
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: Check,
          label: 'Aceptada',
          dotColor: 'bg-green-500'
        };
      case 'Rechazada':
        return {
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: X,
          label: 'Rechazada',
          dotColor: 'bg-red-500'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: Clock,
          label: status,
          dotColor: 'bg-gray-500'
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-aquamarine-600 mx-auto mb-3"></div>
          <p className="text-gray-500 text-sm">Cargando peticiones...</p>
        </div>
      </div>
    );
  }

  if (!petitions || petitions.length === 0) {
    return (
      <div className="text-center py-12">
        <Mail size={48} className="mx-auto text-gray-300 mb-4" />
        <h3 className="text-lg np-bold text-gray-900 mb-2">No hay peticiones</h3>
        <p className="text-gray-500">
          No se han recibido peticiones de adopción aún.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <h3 className="text-lg np-bold text-gray-900">
            Peticiones de Adopción
          </h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              {petitions.length} {petitions.length === 1 ? 'petición' : 'peticiones'}
            </span>
            {petitions.some(p => !p.leida) && (
              <Pill className="bg-red-100 text-red-800 text-xs">
                {petitions.filter(p => !p.leida).length} nuevas
              </Pill>
            )}
          </div>
        </div>
      </div>

      {/* Petition List */}
      <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
        {petitions.map((petition) => {
          const statusConfig = getStatusConfig(petition.estado);
          const StatusIcon = statusConfig.icon;
          const isProcessing = processingPetition === petition.id;
          const isExpanded = expandedPetition === petition.id;
          const petData = petitionPets[petition.animal];
          const petImage = getPetImage(petData);

          return (
            <div
              key={petition.id}
              className={`transition-all duration-200 ${
                petition.leida 
                  ? 'bg-white hover:bg-gray-50' 
                  : 'bg-blue-50 hover:bg-blue-100'
              }`}
            >              {/* Main petition row */}
              <button 
                className="w-full px-6 py-4 text-left focus:outline-none focus:ring-2 focus:ring-aquamarine-500 focus:ring-inset"
                onClick={() => togglePetitionExpansion(petition.id)}
                aria-expanded={isExpanded}
                aria-label={`${isExpanded ? 'Contraer' : 'Expandir'} petición de ${petition.usuario?.nombre || 'usuario'} para ${petData?.nombre || 'mascota'}`}
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

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {/* Read/Unread indicator */}
                        <div className="flex items-center">
                          {petition.leida ? (
                            <MailOpen size={16} className="text-gray-400" />
                          ) : (
                            <Mail size={16} className="text-blue-600" />
                          )}
                        </div>

                        {/* Pet and User info */}
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className={`text-sm np-bold ${petition.leida ? 'text-gray-700' : 'text-gray-900'}`}>
                              {petData?.nombre || 'Cargando...'}
                            </span>
                            <span className="text-xs text-gray-500">•</span>
                            <span className={`text-sm ${petition.leida ? 'text-gray-600' : 'text-gray-800'}`}>
                              {petition.usuario?.nombre || petition.usuario?.username || 'Usuario'}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            <Calendar size={12} className="text-gray-400" />
                            <span className="text-xs text-gray-500">
                              {formatDate(petition.fecha_peticion)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Status and Actions */}
                      <div className="flex items-center space-x-3">
                        {/* Status pill */}
                        <Pill className={`text-xs np-medium border ${statusConfig.color}`}>
                          <StatusIcon size={12} className="mr-1" />
                          {statusConfig.label}
                        </Pill>

                        {/* Expansion indicator */}
                        <div className="flex items-center">
                          {isExpanded ? (
                            <ChevronDown size={16} className="text-gray-400" />
                          ) : (
                            <ChevronRight size={16} className="text-gray-400" />
                          )}                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </button>

              {/* Expanded content */}
              {isExpanded && (
                <div className="px-6 pb-4 border-t border-gray-100 bg-gray-50">
                  <div className="pt-4 space-y-4">
                    {/* Pet details */}
                    {petData && (
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <h4 className="text-sm np-bold text-gray-900 mb-3 flex items-center">
                          <Heart size={14} className="mr-2 text-red-500" />
                          Información de la mascota
                        </h4>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-gray-500">Nombre:</span>
                            <span className="ml-2 text-gray-900">{petData.nombre}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Especie:</span>
                            <span className="ml-2 text-gray-900 capitalize">{petData.especie}</span>
                          </div>
                          {petData.raza && (
                            <div>
                              <span className="text-gray-500">Raza:</span>
                              <span className="ml-2 text-gray-900">{petData.raza}</span>
                            </div>
                          )}
                          {petData.genero && (
                            <div>
                              <span className="text-gray-500">Género:</span>
                              <span className="ml-2 text-gray-900 capitalize">{petData.genero}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* User contact info */}
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <h4 className="text-sm np-bold text-gray-900 mb-3 flex items-center">
                        <User size={14} className="mr-2 text-blue-500" />
                        Información de contacto
                      </h4>
                      <div className="space-y-2">
                        {petition.usuario?.email && (
                          <div className="flex items-center text-sm">
                            <Mail size={14} className="mr-3 text-gray-400 flex-shrink-0" />
                            <span className="text-gray-900">{petition.usuario.email}</span>
                          </div>
                        )}
                        {petition.usuario?.telefono && (
                          <div className="flex items-center text-sm">
                            <Phone size={14} className="mr-3 text-gray-400 flex-shrink-0" />
                            <span className="text-gray-900">{petition.usuario.telefono}</span>
                          </div>
                        )}
                        {petition.usuario?.provincia && (
                          <div className="flex items-center text-sm">
                            <MapPin size={14} className="mr-3 text-gray-400 flex-shrink-0" />
                            <span className="text-gray-900">{petition.usuario.provincia}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center justify-end space-x-3">
                      {petition.estado === 'Pendiente' && (
                        <>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdatePetition(petition.id, 'Rechazada');
                            }}
                            disabled={isProcessing}
                            variant="secondary"
                            size="sm"
                            leftIcon={<X size={14} />}
                          >
                            Rechazar
                          </Button>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdatePetition(petition.id, 'Aceptada');
                            }}
                            disabled={isProcessing}
                            variant="primary"
                            size="sm"
                            leftIcon={<Check size={14} />}
                          >
                            Aceptar
                          </Button>
                        </>
                      )}

                      {petition.estado !== 'Pendiente' && !petition.leida && (
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(petition.id);
                          }}
                          disabled={isProcessing}
                          variant="outline"
                          size="sm"
                        >
                          Marcar como leída
                        </Button>
                      )}

                      {isProcessing && (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-aquamarine-600"></div>
                          <span className="ml-2 text-sm text-gray-500">Procesando...</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

PetitionMailbox.propTypes = {
  petitions: PropTypes.array,
  onUpdatePetition: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

PetitionMailbox.defaultProps = {
  petitions: [],
  loading: false,
};

export default PetitionMailbox;
