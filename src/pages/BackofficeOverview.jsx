import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { 
  PlusCircle, 
  PawPrint, 
  Mail,
  Clock,
  CheckCircle
} from 'lucide-react';
import BackofficePetCard from '../components/BackofficePetCard';
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

      setPets(petsData);
      setPetitions(petitionsData);

      // Calculate stats
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

  const handlePetSelect = (pet) => {
    navigate(`/backoffice/petitions?pet=${pet.id}`);
  };

  // Get status color classes for petitions
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
      textColor: 'text-blue-600'
    },
    {
      title: 'Peticiones Totales',
      value: stats.totalPetitions,
      icon: Mail,
      color: 'bg-purple-500',
      textColor: 'text-purple-600'
    },
    {
      title: 'Peticiones Pendientes',
      value: stats.pendingPetitions,
      icon: Clock,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600'
    },
    {
      title: 'Adopciones Exitosas',
      value: stats.adoptedPets,
      icon: CheckCircle,
      color: 'bg-green-500',
      textColor: 'text-green-600'
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
            Vista General
          </h1>
          <p className="text-gray-600 np-regular">
            Resumen de tu refugio y actividad reciente
          </p>
        </div>
        <Link 
          to="/backoffice/add-pet"
          className="inline-flex items-center gap-2 bg-aquamarine-600 hover:bg-aquamarine-700 
                     text-white px-4 py-2 rounded-lg transition-colors np-medium cursor-pointer"
        >
          <PlusCircle size={20} />
          Nueva Mascota
        </Link>
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

      {/* Recent Petitions */}
      <motion.div 
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 np-bold">
            Peticiones Recientes
          </h3>
          <Link 
            to="/backoffice/petitions"
            className="text-aquamarine-600 hover:text-aquamarine-700 text-sm np-medium cursor-pointer"
          >
            Ver todas
          </Link>
        </div>
        
        {petitions.length === 0 ? (
          <motion.div 
            className="text-center py-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <Mail size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 np-regular">No hay peticiones aún</p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {petitions.slice(0, 3).map((petition, index) => (
              <motion.div 
                key={petition.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                onClick={() => navigate('/backoffice/petitions')}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${getPetitionStatusColor(petition.estado)}`} />
                  <div>
                    <p className="font-medium text-gray-900 np-medium">
                      {petition.usuario?.email || 'Usuario desconocido'}
                    </p>
                    <p className="text-sm text-gray-500 np-regular">
                      Quiere adoptar a {petition.animal?.nombre || 'mascota desconocida'}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPetitionBadgeColor(petition.estado)}`}>
                  {petition.estado}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Recent Pets */}
      <motion.div 
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 np-bold">
            Mascotas Recientes
          </h3>
          <Link 
            to="/backoffice/pets"
            className="text-aquamarine-600 hover:text-aquamarine-700 text-sm np-medium cursor-pointer"
          >
            Ver todas
          </Link>
        </div>
        
        {pets.length === 0 ? (
          <motion.div 
            className="text-center py-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            <PawPrint size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 np-regular mb-4">
              Aún no tienes mascotas registradas
            </p>
            <Link
              to="/backoffice/add-pet"
              className="inline-flex items-center gap-2 bg-aquamarine-600 hover:bg-aquamarine-700 
                         text-white px-4 py-2 rounded-lg transition-colors np-medium cursor-pointer"
            >
              <PlusCircle size={16} />
              Agregar primera mascota
            </Link>
          </motion.div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
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
  );
}
