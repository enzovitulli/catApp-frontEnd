import PropTypes from 'prop-types';
import { useState } from 'react';
import { 
  Mail, 
  MailOpen, 
  Calendar, 
  User, 
  Phone, 
  MapPin, 
  Check, 
  X, 
  Clock 
} from 'lucide-react';
import Button from './Button';
import Pill from './Pill';

const PetitionMailbox = ({ petitions, onUpdatePetition, loading }) => {
  const [processingPetition, setProcessingPetition] = useState(null);

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

  // Get status color and icon
  const getStatusConfig = (status, isRead) => {
    switch (status) {
      case 'Pendiente':
        return {
          color: 'bg-yellow-100 text-yellow-800',
          icon: Clock,
          label: 'Pendiente'
        };
      case 'Aceptada':
        return {
          color: 'bg-green-100 text-green-800',
          icon: Check,
          label: 'Aceptada'
        };
      case 'Rechazada':
        return {
          color: 'bg-red-100 text-red-800',
          icon: X,
          label: 'Rechazada'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800',
          icon: Clock,
          label: status
        };
    }
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
          No se han recibido peticiones de adopción para esta mascota aún.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg np-bold text-gray-900">
          Peticiones de Adopción ({petitions.length})
        </h3>
        {petitions.some(p => !p.leida) && (
          <Pill className="bg-red-100 text-red-800 text-xs">
            {petitions.filter(p => !p.leida).length} nuevas
          </Pill>
        )}
      </div>

      <div className="max-h-96 overflow-y-auto space-y-3">
        {petitions.map((petition) => {
          const statusConfig = getStatusConfig(petition.estado, petition.leida);
          const StatusIcon = statusConfig.icon;
          const isProcessing = processingPetition === petition.id;

          return (
            <div
              key={petition.id}
              className={`p-4 border rounded-lg transition-all ${
                petition.leida 
                  ? 'bg-gray-50 border-gray-200' 
                  : 'bg-white border-aquamarine-200 shadow-md'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center">
                  {petition.leida ? (
                    <MailOpen size={16} className="text-gray-400 mr-2" />
                  ) : (
                    <Mail size={16} className="text-aquamarine-600 mr-2" />
                  )}
                  <div>
                    <h4 className="text-sm np-bold text-gray-900">
                      {petition.usuario?.nombre || petition.usuario?.username || 'Usuario'}
                    </h4>
                    <div className="flex items-center text-xs text-gray-500">
                      <Calendar size={12} className="mr-1" />
                      {formatDate(petition.fecha_peticion)}
                    </div>
                  </div>
                </div>

                <Pill className={`text-xs np-medium ${statusConfig.color}`}>
                  <StatusIcon size={12} className="mr-1" />
                  {statusConfig.label}
                </Pill>
              </div>

              {/* User Info */}
              <div className="space-y-2 mb-4">
                {petition.usuario?.email && (
                  <div className="flex items-center text-sm text-gray-600">
                    <User size={14} className="mr-2 text-gray-400" />
                    {petition.usuario.email}
                  </div>
                )}
                {petition.usuario?.telefono && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone size={14} className="mr-2 text-gray-400" />
                    {petition.usuario.telefono}
                  </div>
                )}
                {petition.usuario?.provincia && (
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin size={14} className="mr-2 text-gray-400" />
                    {petition.usuario.provincia}
                  </div>
                )}
              </div>

              {/* Actions */}
              {petition.estado === 'Pendiente' && (
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => handleUpdatePetition(petition.id, 'Aceptada')}
                    disabled={isProcessing}
                    variant="primary"
                    size="sm"
                    leftIcon={<Check size={14} />}
                    className="flex-1"
                  >
                    Aceptar
                  </Button>
                  <Button
                    onClick={() => handleUpdatePetition(petition.id, 'Rechazada')}
                    disabled={isProcessing}
                    variant="secondary"
                    size="sm"
                    leftIcon={<X size={14} />}
                    className="flex-1"
                  >
                    Rechazar
                  </Button>
                </div>
              )}

              {petition.estado !== 'Pendiente' && !petition.leida && (
                <Button
                  onClick={() => handleMarkAsRead(petition.id)}
                  disabled={isProcessing}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  Marcar como leída
                </Button>
              )}

              {isProcessing && (
                <div className="flex items-center justify-center mt-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-aquamarine-600"></div>
                  <span className="ml-2 text-sm text-gray-500">Procesando...</span>
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
