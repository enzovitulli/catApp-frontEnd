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
import BackofficeLayout from '../layouts/BackofficeLayout';
import BackofficePetCard from '../components/BackofficePetCard';
import PetitionMailbox from '../components/PetitionMailbox';
import { backofficeApi } from '../services/api';
import { useAlert } from '../hooks/useAlert';

export default function BackofficeDashboard() {
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
  const [activeTab, setActiveTab] = useState('overview');  const { showError } = useAlert();

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
      showError('Error al cargar los datos del dashboard');    } finally {
      setLoading(false);
    }
  }, [showError]);
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Handle pet deletion
  const handlePetDelete = (petId) => {
    setPets(prevPets => prevPets.filter(pet => pet.id !== petId));
    loadDashboardData(); // Reload to update stats
  };
  // Handle pet edit
  const handlePetEdit = (pet) => {
    // Navigate to edit page
    navigate(`/backoffice/pets/${pet.id}/edit`);
  };

  // Handle pet selection (for viewing petitions)
  const handlePetSelect = (pet) => {
    // For now, just log or show petitions for this pet
    console.log('Selected pet:', pet);
    // You could implement a modal or navigate to petitions view
  };

  // Handle petition status updates
  const handlePetitionUpdate = async (petitionId, updateData) => {
    try {
      const response = await backofficeApi.updatePetition(petitionId, updateData);
      setPetitions(prevPetitions =>
        prevPetitions.map(petition =>
          petition.id === petitionId ? response.data : petition
        )
      );
      loadDashboardData(); // Reload to update stats
      return response.data;
    } catch (error) {
      showError('Error al actualizar la petición');
      throw error;
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
      <BackofficeLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando dashboard...</p>
          </div>
        </div>
      </BackofficeLayout>
    );
  }

  return (
    <BackofficeLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>            <h1 className="text-2xl xl:text-3xl font-bold text-gray-900 np-bold">
              Dashboard
            </h1>
            <p className="text-gray-600 np-regular">
              Gestiona tus mascotas y peticiones de adopción
            </p>
          </div>
            <Link 
            to="/backoffice/pets/new"
            className="inline-flex items-center gap-2 bg-aquamarine-600 hover:bg-aquamarine-700 
                       text-white px-4 py-2 rounded-lg transition-colors np-medium cursor-pointer"
          >
            <PlusCircle size={20} />
            Nueva Mascota
          </Link>
        </div>        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {statsCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
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

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer ${
                activeTab === 'overview'
                  ? 'border-aquamarine-500 text-aquamarine-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Vista General
            </button>
            <button
              onClick={() => setActiveTab('pets')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer ${
                activeTab === 'pets'
                  ? 'border-aquamarine-500 text-aquamarine-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Mis Mascotas ({pets.length})
            </button>
            <button
              onClick={() => setActiveTab('petitions')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer relative ${
                activeTab === 'petitions'
                  ? 'border-aquamarine-500 text-aquamarine-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Peticiones
              {stats.pendingPetitions > 0 && (
                <span className="inline-flex items-center justify-center px-2 py-1 ml-2 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                  {stats.pendingPetitions}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Recent Petitions */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 np-bold">
                    Peticiones Recientes
                  </h3>                  <Link 
                    to="#" 
                    onClick={() => setActiveTab('petitions')}
                    className="text-aquamarine-600 hover:text-aquamarine-700 text-sm np-medium cursor-pointer"
                  >
                    Ver todas
                  </Link>
                </div>
                
                {petitions.length === 0 ? (
                  <div className="text-center py-8">
                    <Mail size={48} className="text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 np-regular">No hay peticiones aún</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {petitions.slice(0, 3).map((petition) => (
                      <div 
                        key={petition.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            petition.estado === 'Pendiente' ? 'bg-yellow-400' :
                            petition.estado === 'Aceptada' ? 'bg-green-400' :
                            'bg-red-400'
                          }`} />
                          <div>
                            <p className="font-medium text-gray-900 np-medium">
                              {petition.usuario?.email || 'Usuario desconocido'}
                            </p>
                            <p className="text-sm text-gray-500 np-regular">
                              Quiere adoptar a {petition.animal?.nombre || 'mascota desconocida'}
                            </p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          petition.estado === 'Pendiente' ? 'bg-yellow-100 text-yellow-800' :
                          petition.estado === 'Aceptada' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {petition.estado}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Pets */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 np-bold">
                    Mascotas Recientes
                  </h3>
                  <Link 
                    to="#" 
                    onClick={() => setActiveTab('pets')}
                    className="text-aquamarine-600 hover:text-aquamarine-700 text-sm np-medium cursor-pointer"
                  >
                    Ver todas
                  </Link>
                </div>
                
                {pets.length === 0 ? (
                  <div className="text-center py-8">
                    <PawPrint size={48} className="text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 np-regular mb-4">
                      Aún no tienes mascotas registradas
                    </p>
                    <Link
                      to="/backoffice/pets/new"
                      className="inline-flex items-center gap-2 bg-aquamarine-600 hover:bg-aquamarine-700 
                                 text-white px-4 py-2 rounded-lg transition-colors np-medium cursor-pointer"
                    >
                      <PlusCircle size={16} />
                      Agregar primera mascota
                    </Link>
                  </div>
                ) : (                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 grid-uniform-rows">
                    {pets.slice(0, 6).map((pet) => (
                      <div key={pet.id} className="h-full">
                        <BackofficePetCard
                          pet={pet}
                          onEdit={handlePetEdit}
                          onDelete={handlePetDelete}
                          onSelect={handlePetSelect}
                          compact={true}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'pets' && (
            <div>
              {pets.length === 0 ? (
                <div className="text-center py-12">
                  <PawPrint size={64} className="text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 np-bold">
                    No tienes mascotas aún
                  </h3>
                  <p className="text-gray-500 mb-6 np-regular">
                    Comienza agregando tu primera mascota para adopción
                  </p>
                  <Link
                    to="/backoffice/pets/new"
                    className="inline-flex items-center gap-2 bg-aquamarine-600 hover:bg-aquamarine-700 
                               text-white px-6 py-3 rounded-lg transition-colors np-medium cursor-pointer"
                  >
                    <PlusCircle size={20} />
                    Agregar primera mascota
                  </Link>
                </div>
              ) : (                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 grid-uniform-rows">
                  {pets.map((pet) => (
                    <div key={pet.id} className="h-full">
                      <BackofficePetCard
                        pet={pet}
                        onEdit={handlePetEdit}
                        onDelete={handlePetDelete}
                        onSelect={handlePetSelect}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}          {activeTab === 'petitions' && (
            <PetitionMailbox 
              petitions={petitions}
              onUpdatePetition={handlePetitionUpdate}
            />
          )}
        </div>
      </div>
    </BackofficeLayout>
  );
}
