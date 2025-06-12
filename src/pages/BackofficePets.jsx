import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { PlusCircle, PawPrint } from 'lucide-react';
import BackofficePetCard from '../components/BackofficePetCard';
import { backofficeApi } from '../services/api';
import { useAlert } from '../hooks/useAlert';

export default function BackofficePets() {
  const navigate = useNavigate();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showError } = useAlert();

  const loadPets = useCallback(async () => {
    try {
      setLoading(true);
      const petsResponse = await backofficeApi.getCompanyPets();
      setPets(petsResponse.data || []);
    } catch (error) {
      console.error('Error loading pets:', error);
      showError('Error al cargar las mascotas');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    loadPets();
  }, [loadPets]);

  // Handle pet deletion
  const handlePetDelete = async (pet) => {
    if (confirm(`¿Estás seguro de que quieres eliminar a ${pet.nombre}?`)) {
      try {
        await backofficeApi.deleteAnimal(pet.id);
        setPets(prevPets => prevPets.filter(p => p.id !== pet.id));
      } catch (error) {
        showError('Error al eliminar la mascota');
      }
    }
  };
  // Handle pet edit
  const handlePetEdit = (pet) => {
    navigate(`/backoffice/pets/${pet.id}/edit`);
  };

  // Handle pet selection (for viewing petitions)
  const handlePetSelect = (pet) => {
    navigate(`/backoffice/petitions?pet=${pet.id}`);
  };

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
          <p className="text-gray-600">Cargando mascotas...</p>
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
            Mis Mascotas
          </h1>
          <p className="text-gray-600 np-regular">
            Gestiona todas tus mascotas registradas ({pets.length})
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
      </motion.div>

      {/* Pets Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {pets.length === 0 ? (
          <motion.div 
            className="text-center py-12"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
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
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {pets.map((pet, index) => (
              <motion.div
                key={pet.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + index * 0.05 }}
              >
                <BackofficePetCard
                  pet={pet}
                  onEdit={handlePetEdit}
                  onDelete={handlePetDelete}
                  onSelect={handlePetSelect}
                />
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
