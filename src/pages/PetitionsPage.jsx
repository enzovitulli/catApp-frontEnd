import { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'motion/react';
import { MessageCircle, Clock, CheckCircle, XCircle, Eye, EyeOff, Trash2, Mars, Venus } from 'lucide-react';
import { petitionApi } from '../services/api';
import { useAlert } from '../hooks/useAlert';
import Button from '../components/Button';

export default function PetitionsPage() {
  const [petitions, setPetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingPetition, setCancellingPetition] = useState(null);
  const { showError, showSuccess } = useAlert();

  // Calculate age from fecha_nacimiento_animal
  const calculateAge = (fechaNacimiento) => {
    if (!fechaNacimiento) return 0;
    
    const birthDate = new Date(fechaNacimiento);
    const today = new Date();
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    // If birthday hasn't occurred this year yet, subtract 1
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  // Fetch user petitions with animal data included
  useEffect(() => {
    const fetchPetitions = async () => {
      try {
        setLoading(true);
        
        // Fetch the petitions with animal data included
        const petitionsResponse = await petitionApi.getUserPetitions();
        console.log('User petitions fetched:', petitionsResponse.data);
        
        const petitionsData = petitionsResponse.data || [];
        setPetitions(petitionsData);
        
      } catch (err) {
        console.error('Error fetching petitions:', err);
        if (err.response?.status === 401) {
          showError('Tu sesión ha expirado. Por favor, inicia sesión de nuevo.');
        } else {
          showError('Error al cargar las peticiones. Inténtalo de nuevo.');
        }
        setPetitions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPetitions();
  }, [showError]);

  // Handle petition cancellation
  const handleCancelPetition = async (petitionId, animalName) => {
    if (cancellingPetition) return;
    
    setCancellingPetition(petitionId);
    
    try {
      await petitionApi.cancelPetition(petitionId);
      console.log('Petition canceled:', petitionId);
      
      // Remove the petition from the state
      setPetitions(prevPetitions => 
        prevPetitions.filter(petition => petition.id !== petitionId)
      );
      
      showSuccess(`Solicitud para ${animalName} cancelada correctamente.`);
    } catch (err) {
      console.error('Error canceling petition:', err);
      
      if (err.response?.data) {
        const errorData = err.response.data;
        if (errorData.detail) {
          showError(errorData.detail);
        } else {
          showError('No se pudo cancelar la solicitud. Inténtalo de nuevo.');
        }
      } else {
        showError('Error de conexión. Inténtalo de nuevo.');
      }
    } finally {
      setCancellingPetition(null);
    }
  };

  const getStatusConfig = (estado, leida) => {
    // Handle the 4 different states based on estado and leida
    if (estado === 'Pendiente') {
      if (leida === false) {
        // Pendiente + not read = En revisión
        return {
          icon: Clock,
          color: 'text-amber-600 dark:text-amber-400',
          bgColor: 'bg-amber-50 dark:bg-amber-900/20',
          borderColor: 'border-amber-100 dark:border-amber-800/50',
          label: 'En revisión'
        };
      } else {
        // Pendiente + read = Petición leída
        return {
          icon: EyeOff,
          color: 'text-blue-600 dark:text-blue-400',
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          borderColor: 'border-blue-100 dark:border-blue-800/50',
          label: 'Petición leída'
        };
      }
    } else if (estado === 'Aceptada') {
      return {
        icon: CheckCircle,
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-50 dark:bg-green-900/20',
        borderColor: 'border-green-100 dark:border-green-800/50',
        label: 'Aceptada'
      };
    } else if (estado === 'Rechazada') {
      return {
        icon: XCircle,
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        borderColor: 'border-red-100 dark:border-red-800/50',
        label: 'Rechazada'
      };
    } else {
      // Default fallback
      return {
        icon: Eye,
        color: 'text-gray-600 dark:text-gray-400',
        bgColor: 'bg-gray-50 dark:bg-gray-900/20',
        borderColor: 'border-gray-100 dark:border-gray-800/50',
        label: estado
      };
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-oxford-900 dark:to-marine-900 transition-colors duration-300 pt-20">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orchid-500 dark:border-aquamarine-400 mx-auto mb-3"></div>
            <p className="text-gray-600 dark:text-gray-300 text-sm">Cargando peticiones...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-oxford-900 dark:to-marine-900 transition-colors duration-300 pt-20">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center gap-3 mb-2">
            <MessageCircle className="text-orchid-500 dark:text-aquamarine-400" size={28} />
            <h1 className="text-2xl np-bold text-gray-900 dark:text-white">
              Mis Peticiones
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Aquí puedes ver el estado de tus solicitudes de adopción
          </p>
        </motion.div>

        {/* Petitions List */}
        <div className="max-w-2xl mx-auto space-y-3">
          {petitions.length === 0 ? (
            <motion.div 
              className="text-center py-12"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <MessageCircle className="mx-auto text-gray-400 dark:text-gray-600 mb-4" size={48} />
              <h3 className="text-lg np-bold text-gray-700 dark:text-gray-300 mb-2">
                Sin peticiones
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Tus solicitudes de adopción aparecerán aquí cuando deslices a la derecha en el feed
              </p>
            </motion.div>
          ) : (
            petitions.map((petition, index) => {
              const statusConfig = getStatusConfig(petition.estado, petition.leida);
              const StatusIcon = statusConfig.icon;
              const canCancel = petition.estado === 'Pendiente';
              
              return (
                <motion.div
                  key={petition.id}
                  className="bg-white dark:bg-marine-800/50 rounded-xl p-5 transition-all duration-300 hover:shadow-lg border border-gray-100 dark:border-marine-700/50"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <div className="flex items-center gap-4">
                    {/* Pet Image Circle */}
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 dark:bg-marine-700">
                        {petition.imagen1_animal ? (
                          <img
                            src={petition.imagen1_animal}
                            alt={petition.nombre_animal || 'Mascota'}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div 
                          className={`w-full h-full 
                            ${petition.imagen1_animal ? 'hidden' : 'flex'} 
                            items-center justify-center text-gray-400 text-xs
                          `}
                        >
                          🐾
                        </div>
                      </div>
                    </div>
                    
                    {/* Pet Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg np-bold text-gray-900 dark:text-white">
                          {petition.nombre_animal || 'Mascota'}
                        </h3>
                        {petition.genero_animal && (
                          <div className="flex items-center">
                            {petition.genero_animal === 'macho' ? (
                              <Mars size={16} className="text-blue-500" />
                            ) : petition.genero_animal === 'hembra' ? (
                              <Venus size={16} className="text-pink-500" />
                            ) : null}
                          </div>
                        )}
                      </div>
                      
                      {petition.fecha_nacimiento_animal && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                          {calculateAge(petition.fecha_nacimiento_animal)} {calculateAge(petition.fecha_nacimiento_animal) === 1 ? 'año' : 'años'}
                        </p>
                      )}
                      
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Solicitud enviada: {formatDate(petition.fecha_peticion)}
                      </p>
                    </div>
                    
                    {/* Status Badge and Actions */}
                    <div className="flex items-center gap-2">
                      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${statusConfig.bgColor} border ${statusConfig.borderColor}`}>
                        <StatusIcon size={14} className={statusConfig.color} />
                        <span className={`text-xs np-medium ${statusConfig.color}`}>
                          {statusConfig.label}
                        </span>
                      </div>
                      
                      {/* Cancel button for pending petitions */}
                      {canCancel && (
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={cancellingPetition === petition.id}
                          onClick={() => handleCancelPetition(petition.id, petition.nombre_animal || 'esta mascota')}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          leftIcon={cancellingPetition === petition.id ? (
                            <div className="animate-spin h-3 w-3 border border-t-transparent border-red-600 rounded-full" />
                          ) : (
                            <Trash2 size={14} />
                          )}
                        >
                          {cancellingPetition === petition.id ? 'Cancelando...' : 'Cancelar'}
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
