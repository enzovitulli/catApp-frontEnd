import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { Mail, Clock, CheckCircle, XCircle } from 'lucide-react';
import PetitionMailbox from '../components/PetitionMailbox';
import { backofficeApi } from '../services/api';
import { useAlert } from '../hooks/useAlert';

export default function BackofficePetitions() {
  const [petitions, setPetitions] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0
  });
  const [loading, setLoading] = useState(true);
  const { showError } = useAlert();

  const loadPetitions = useCallback(async () => {
    try {
      setLoading(true);
      const petitionsResponse = await backofficeApi.getCompanyPetitions();
      const petitionsData = petitionsResponse.data || [];
      
      setPetitions(petitionsData);
      
      // Calculate stats
      const pendingCount = petitionsData.filter(p => p.estado === 'Pendiente').length;
      const acceptedCount = petitionsData.filter(p => p.estado === 'Aceptada').length;
      const rejectedCount = petitionsData.filter(p => p.estado === 'Rechazada').length;
      
      setStats({
        total: petitionsData.length,
        pending: pendingCount,
        accepted: acceptedCount,
        rejected: rejectedCount
      });
    } catch (error) {
      console.error('Error loading petitions:', error);
      showError('Error al cargar las peticiones');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    loadPetitions();
  }, [loadPetitions]);

  // Handle petition status updates
  const handlePetitionUpdate = async (petitionId, updateData) => {
    try {
      const response = await backofficeApi.updatePetition(petitionId, updateData);
      setPetitions(prevPetitions =>
        prevPetitions.map(petition =>
          petition.id === petitionId ? response.data : petition
        )
      );
      loadPetitions(); // Reload to update stats
      return response.data;
    } catch (error) {
      showError('Error al actualizar la petición');
      throw error;
    }
  };

  // Stats cards configuration
  const statsCards = [
    {
      title: 'Total de Peticiones',
      value: stats.total,
      icon: Mail,
      color: 'bg-blue-500'
    },
    {
      title: 'Pendientes',
      value: stats.pending,
      icon: Clock,
      color: 'bg-yellow-500'
    },
    {
      title: 'Aceptadas',
      value: stats.accepted,
      icon: CheckCircle,
      color: 'bg-green-500'
    },
    {
      title: 'Rechazadas',
      value: stats.rejected,
      icon: XCircle,
      color: 'bg-red-500'
    }
  ];

  if (loading) {
    return (
      <motion.div 
        className="flex items-center justify-center h-64"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-aquamarine-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando peticiones...</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <motion.div 
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 np-bold">
            Peticiones de Adopción
          </h1>
          <p className="text-gray-600 np-regular">
            Gestiona todas las solicitudes de adopción
          </p>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 np-regular">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 np-bold">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon size={24} className="text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Petitions Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        {petitions.length === 0 ? (
          <motion.div 
            className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.7 }}
          >
            <Mail size={64} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2 np-bold">
              No hay peticiones aún
            </h3>
            <p className="text-gray-500 np-regular">
              Las solicitudes de adopción aparecerán aquí cuando los usuarios estén interesados en tus mascotas
            </p>
          </motion.div>
        ) : (
          <PetitionMailbox 
            petitions={petitions}
            onUpdatePetition={handlePetitionUpdate}
          />
        )}
      </motion.div>
    </motion.div>
  );
}
