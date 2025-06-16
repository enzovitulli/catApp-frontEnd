import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { 
  PlusCircle, 
  PawPrint, 
  Mail,
  Clock,
  CheckCircle,
  Check,
  X
} from 'lucide-react';
import BackofficePetCard from '../components/BackofficePetCard';
import BackofficePetModal from '../components/BackofficePetModal';
import Pill from '../components/Pill';
import { backofficeApi } from '../services/api';
import { useAlert } from '../hooks/useAlert';

export default function BackofficeOverview() {
  const navigate = useNavigate();
  const [pets, setPets] = useState([]);
  const [petitions, setPetitions] = useState([]);
  const [stats, setStats] = useState({
    totalPets: 0,
    totalPetitions: 0,
    pendingPetitions: 0,
    acceptedPetitions: 0,
    adoptedPets: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedPet, setSelectedPet] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { showError } = useAlert();

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Load pets and petitions in parallel
      const [petsResponse, petitionsResponse] = await Promise.all([
        backofficeApi.getCompanyPets(),
        backofficeApi.getCompanyPetitions()
      ]);

      const petsData = petsResponse.data || [];
      const petitionsData = petitionsResponse.data || [];

      // Sort petitions by date (most recent first) and take only the first 3
      const sortedPetitions = petitionsData
        .sort((a, b) => new Date(b.fecha_peticion) - new Date(a.fecha_peticion))
        .slice(0, 3);

      setPets(petsData);
      setPetitions(sortedPetitions);

      // Calculate stats using all petitions data
      const pendingCount = petitionsData.filter(p => p.estado === 'Pendiente').length;
      const acceptedCount = petitionsData.filter(p => p.estado === 'Aceptada').length;
      const adoptedCount = petsData.filter(p => p.estado === 'Adoptado').length;

      setStats({
        totalPets: petsData.length,
        totalPetitions: petitionsData.length,
        pendingPetitions: pendingCount,
        acceptedPetitions: acceptedCount,
        adoptedPets: adoptedCount
      });

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      showError('Error al cargar los datos del dashboard');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);
  // Handle pet actions
  const handlePetEdit = (pet) => {
    navigate(`/backoffice/pets/${pet.id}/edit`);
  };

  const handlePetDelete = async (pet) => {
    if (confirm(`¿Estás seguro de que quieres eliminar a ${pet.nombre}?`)) {
      try {
        await backofficeApi.deleteAnimal(pet.id);
        setPets(prevPets => prevPets.filter(p => p.id !== pet.id));
        loadDashboardData();
      } catch (error) {
        showError('Error al eliminar la mascota');
      }
    }
  };

  // Handle pet selection to open modal
  const handlePetSelect = (pet) => {
    setSelectedPet(pet);
    setIsModalOpen(true);
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedPet(null);
  };

  // Handle pet edit from modal
  const handlePetEditFromModal = (pet) => {
    setIsModalOpen(false);
    setSelectedPet(null);
    navigate(`/backoffice/pets/${pet.id}/edit`);
  };

  // Handle pet delete from modal
  const handlePetDeleteFromModal = async (pet) => {
    if (confirm(`¿Estás seguro de que quieres eliminar a ${pet.nombre}?`)) {
      try {
        await backofficeApi.deleteAnimal(pet.id);
        setPets(prevPets => prevPets.filter(p => p.id !== pet.id));
        setIsModalOpen(false);
        setSelectedPet(null);
        loadDashboardData();
      } catch (error) {
        showError('Error al eliminar la mascota');
      }
    }
  };

  // Handle stats card clicks
  const handleStatsCardClick = (cardType) => {
    switch (cardType) {
      case 'totalPets':
        // Navigate to pets page
        navigate('/backoffice/pets');
        break;
      case 'totalPetitions':
        // Navigate to petitions page (all petitions)
        navigate('/backoffice/petitions');
        break;
      case 'pendingPetitions':
        // Navigate to petitions page with pending filter
        navigate('/backoffice/petitions?filter=pending');
        break;
      case 'adoptedPets':
        // Navigate to pets page and scroll to adopted section
        navigate('/backoffice/pets?section=adopted');
        break;
      default:
        break;
    }
  };

  // Get status config matching PetitionMailbox style
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

  // Get status color classes for petitions (deprecated - keeping for compatibility)
  const getPetitionStatusColor = (status) => {
    switch (status) {
      case 'Pendiente':
        return 'bg-yellow-400';
      case 'Aceptada':
        return 'bg-green-400';
      default:
        return 'bg-red-400';
    }
  };

  const getPetitionBadgeColor = (status) => {
    switch (status) {
      case 'Pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'Aceptada':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-red-100 text-red-800';
    }
  };

  // Stats cards configuration
  const statsCards = [
    {
      title: 'Total de Mascotas',
      value: stats.totalPets,
      icon: PawPrint,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      action: 'totalPets',
      description: 'Ver todas las mascotas'
    },
    {
      title: 'Peticiones Totales',
      value: stats.totalPetitions,
      icon: Mail,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
      action: 'totalPetitions',
      description: 'Ver todas las peticiones'
    },
    {
      title: 'Peticiones Pendientes',
      value: stats.pendingPetitions,
      icon: Clock,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600',
      action: 'pendingPetitions',
      description: 'Ver peticiones pendientes'
    },
    {
      title: 'Adopciones Exitosas',
      value: stats.adoptedPets,
      icon: CheckCircle,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      action: 'adoptedPets',
      description: 'Ver mascotas adoptadas'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-aquamarine-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando vista general...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <>
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
          <div>            <h1 className="text-xl sm:text-2xl xl:text-3xl font-bold text-gray-900 np-bold">
              Vista General
            </h1>
            <p className="text-sm sm:text-base text-gray-600 np-regular">
              Resumen de tu refugio y actividad reciente
            </p>
          </div>
          <Link 
            to="/backoffice/pets/new"
            className="inline-flex items-center gap-2 bg-aquamarine-600 hover:bg-aquamarine-700 
                       text-white px-3 sm:px-4 py-2 rounded-lg transition-colors np-medium cursor-pointer text-sm sm:text-base w-fit"
          >
            <PlusCircle size={18} />
            Nueva Mascota
          </Link>
        </motion.div>        {/* Stats Cards */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 auto-rows-fr">
          {statsCards.map((stat, index) => (
            <motion.button
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
              onClick={() => handleStatsCardClick(stat.action)}
              className="bg-white rounded-xl p-3 sm:p-4 xl:p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-200 flex flex-col h-full cursor-pointer group text-left"
              title={stat.description}
            >
              <div className="flex items-start justify-between flex-1">
                <div className="min-w-0 flex-1 pr-2 sm:pr-3 flex flex-col justify-between h-full">
                  <p className="text-xs sm:text-sm text-gray-600 group-hover:text-gray-700 np-regular leading-tight mb-1 sm:mb-2 flex-shrink-0 transition-colors">
                    {stat.title}
                  </p>
                  <p className="text-lg sm:text-xl xl:text-2xl font-bold text-gray-900 group-hover:text-gray-800 np-bold leading-tight flex-1 flex items-end transition-colors">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-2 sm:p-2.5 xl:p-3 rounded-lg ${stat.color} flex-shrink-0 self-start group-hover:scale-105 transition-transform`}>
                  <stat.icon size={16} className="text-white sm:w-5 sm:h-5 xl:w-6 xl:h-6" />
                </div>
              </div>
            </motion.button>
          ))}
        </div>        {/* Recent Petitions */}
        <motion.div 
          className="bg-white rounded-xl p-4 xl:p-6 shadow-sm border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 np-bold">
              Peticiones Recientes
            </h3>
            <Link 
              to="/backoffice/petitions"
              className="text-aquamarine-600 hover:text-aquamarine-700 text-xs sm:text-sm np-medium cursor-pointer"
            >
              Ver todas
            </Link>
          </div>
          
          {petitions.length === 0 ? (
            <motion.div 
              className="text-center py-6 sm:py-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <Mail size={40} className="text-gray-300 mx-auto mb-4 sm:w-12 sm:h-12" />
              <p className="text-sm sm:text-base text-gray-500 np-regular">No hay peticiones aún</p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {petitions.map((petition, index) => {
                const statusConfig = getStatusConfig(petition.estado);
                const StatusIcon = statusConfig.icon;
                
                return (
                  <motion.div 
                    key={petition.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    onClick={() => navigate(`/backoffice/petitions?petition=${petition.id}`)}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-3 h-3 rounded-full ${getPetitionStatusColor(petition.estado)} flex-shrink-0`} />
                      <div className="min-w-0">
                        <p className="text-sm sm:text-base font-medium text-gray-900 np-medium truncate">
                          {petition.usuario?.nombre || petition.usuario?.username || 'Usuario desconocido'}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500 np-regular truncate">
                          Quiere adoptar a {petition.nombre_animal || 'mascota desconocida'}
                        </p>
                      </div>
                    </div>
                    <Pill className={`text-xs np-bold w-24 flex items-center justify-center ${statusConfig.className} flex-shrink-0`}>
                      <StatusIcon size={10} className="mr-1" />
                      {statusConfig.label}
                    </Pill>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>        {/* Recent Pets */}
        <motion.div 
          className="bg-white rounded-xl p-4 xl:p-6 shadow-sm border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 np-bold">
              Mascotas Recientes
            </h3>
            <Link 
              to="/backoffice/pets"
              className="text-aquamarine-600 hover:text-aquamarine-700 text-xs sm:text-sm np-medium cursor-pointer"
            >
              Ver todas
            </Link>
          </div>
          
          {pets.length === 0 ? (
            <motion.div 
              className="text-center py-6 sm:py-8 xl:py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              <PawPrint size={48} className="text-gray-300 mx-auto mb-4 xl:mb-6" />
              <h3 className="text-lg xl:text-xl font-semibold text-gray-900 mb-2 np-bold">
                Aún no tienes mascotas registradas
              </h3>
              <p className="text-sm xl:text-base text-gray-500 np-regular mb-4 xl:mb-6">
                Las mascotas aparecerán aquí una vez que las agregues
              </p>
              <Link
                to="/backoffice/pets/new"
                className="inline-flex items-center gap-2 bg-aquamarine-600 hover:bg-aquamarine-700 
                           text-white px-4 py-2 xl:px-6 xl:py-3 rounded-lg transition-colors np-medium cursor-pointer"
              >
                <PlusCircle size={16} />
                Agregar primera mascota
              </Link>
            </motion.div>
          ) : (
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 grid-uniform-rows"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              {pets.slice(0, 6).map((pet, index) => (
                <motion.div
                  key={pet.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 + index * 0.1 }}
                  className="h-full"
                >
                  <BackofficePetCard
                    pet={pet}
                    onEdit={handlePetEdit}
                    onDelete={handlePetDelete}
                    onSelect={handlePetSelect}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </motion.div>

      {/* Pet Details Modal */}
      <BackofficePetModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        pet={selectedPet}
        onEdit={handlePetEditFromModal}
        onDelete={handlePetDeleteFromModal}
      />
    </>
  );
}
