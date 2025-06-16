import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'motion/react';
import { PlusCircle, PawPrint, Heart, Clock, Trash2, X } from 'lucide-react';
import BackofficePetCard from '../components/BackofficePetCard';
import BackofficePetModal from '../components/BackofficePetModal';
import Button from '../components/Button';
import { backofficeApi } from '../services/api';
import { useAlert } from '../hooks/useAlert';

export default function BackofficePets() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPet, setSelectedPet] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [petToDelete, setPetToDelete] = useState(null);
  const [deletingPet, setDeletingPet] = useState(false);
  const { showError, showSuccess } = useAlert();

  // Check for section parameter to scroll to adopted pets
  useEffect(() => {
    const sectionParam = searchParams.get('section');
    if (sectionParam === 'adopted' && pets.length > 0) {
      // Wait for the component to render, then scroll to adopted section
      setTimeout(() => {
        const adoptedSection = document.querySelector('[data-section="adopted"]');
        if (adoptedSection) {
          adoptedSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }
      }, 500);
      
      // Clear the URL parameter after scrolling
      setSearchParams(prev => {
        const newParams = new URLSearchParams(prev);
        newParams.delete('section');
        return newParams;
      });
    }
  }, [searchParams, pets, setSearchParams]);

  // Separate pets by adoption status
  const availablePets = pets.filter(pet => 
    pet.estado === 'No adoptado' || pet.estado === 'En proceso'
  );
  const adoptedPets = pets.filter(pet => 
    pet.estado === 'Adoptado'
  );

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
  const handlePetDelete = (pet) => {
    setPetToDelete(pet);
    setIsDeleteModalOpen(true);
  };

  // Handle pet edit
  const handlePetEdit = (pet) => {
    navigate(`/backoffice/pets/${pet.id}/edit`);
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
  const handlePetDeleteFromModal = (pet) => {
    setPetToDelete(pet);
    setIsDeleteModalOpen(true);
  };
  // Confirm pet deletion
  const confirmDeletePet = async () => {
    if (!petToDelete) return;
    
    try {
      setDeletingPet(true);
      await backofficeApi.deleteAnimal(petToDelete.id);
      setPets(prevPets => prevPets.filter(p => p.id !== petToDelete.id));
      
      // Close modal if the deleted pet was selected
      if (selectedPet && selectedPet.id === petToDelete.id) {
        setIsModalOpen(false);
        setSelectedPet(null);
      }
      
      // Show success alert
      showSuccess(`${petToDelete.nombre} ha sido eliminado correctamente`);
      
      setIsDeleteModalOpen(false);
      setPetToDelete(null);
    } catch (error) {
      console.error('Error deleting pet:', error);
      showError('Error al eliminar la mascota');
    } finally {
      setDeletingPet(false);
    }
  };

  // Render pets grid section with responsive grid
  const renderPetsGrid = (petsArray, emptyMessage, emptyIcon) => {
    if (petsArray.length === 0) {
      return (
        <div className="text-center py-8">
          {emptyIcon}
          <p className="text-gray-500 np-regular">{emptyMessage}</p>
        </div>
      );
    }

    return (      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 xl:gap-6 grid-uniform-rows">
        {petsArray.map((pet, index) => (
          <motion.div
            key={pet.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
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
      </div>
    );
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
    <>
      <motion.div 
        className="space-y-6 xl:space-y-8"
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
              Mis Mascotas
            </h1>
            <p className="text-sm sm:text-base text-gray-600 np-regular">
              Gestiona todas tus mascotas registradas ({pets.length} total)
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
        </motion.div>

        {/* Global Empty State - only if no pets at all */}
        {pets.length === 0 && (          <motion.div 
            className="text-center py-8 xl:py-12"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <PawPrint size={48} className="text-gray-300 mx-auto mb-4 xl:mb-6" />
            <h3 className="text-lg xl:text-xl font-semibold text-gray-900 mb-2 np-bold">
              No tienes mascotas aún
            </h3>
            <p className="text-sm xl:text-base text-gray-500 mb-4 xl:mb-6 np-regular">
              Comienza agregando tu primera mascota para adopción
            </p>
            <Link
              to="/backoffice/pets/new"
              className="inline-flex items-center gap-2 bg-aquamarine-600 hover:bg-aquamarine-700 
                         text-white px-4 xl:px-6 py-2 xl:py-3 rounded-lg transition-colors np-medium cursor-pointer w-fit mx-auto"
            >
              <PlusCircle size={18} />
              Agregar primera mascota
            </Link>
          </motion.div>
        )}

        {/* Pets sections - only if there are pets */}
        {pets.length > 0 && (
          <>
            {/* Available for Adoption Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}              className="bg-white rounded-xl p-4 xl:p-6 shadow-sm border border-gray-100"
            >
              <div className="flex items-center gap-3 mb-4 xl:mb-6">
                <div className="w-8 h-8 xl:w-10 xl:h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Clock size={16} className="text-green-600 xl:w-5 xl:h-5" />
                </div>
                <div>
                  <h2 className="text-lg xl:text-xl font-semibold text-gray-900 np-bold">
                    Mascotas en Adopción
                  </h2>
                  <p className="text-sm xl:text-base text-gray-600 np-regular">
                    Disponibles o en proceso de adopción ({availablePets.length})
                  </p>
                </div>
              </div>
              
              {renderPetsGrid(
                availablePets,
                "No tienes mascotas disponibles para adopción en este momento",
                <Clock size={40} className="text-gray-300 mx-auto mb-4 xl:w-12 xl:h-12" />
              )}
            </motion.div>

            {/* Adopted Pets Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white rounded-xl p-4 xl:p-6 shadow-sm border border-gray-100"
              data-section="adopted"
            >
              <div className="flex items-center gap-3 mb-4 xl:mb-6">
                <div className="w-8 h-8 xl:w-10 xl:h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Heart size={16} className="text-blue-600 xl:w-5 xl:h-5" />
                </div>
                <div>
                  <h2 className="text-lg xl:text-xl font-semibold text-gray-900 np-bold">
                    Mascotas Adoptadas
                  </h2>
                  <p className="text-sm xl:text-base text-gray-600 np-regular">
                    Tus mascotas ya adoptadas ({adoptedPets.length})
                  </p>
                </div>
              </div>
              
              {renderPetsGrid(
                adoptedPets,
                "Aún no hay adopciones exitosas registradas",
                <Heart size={40} className="text-gray-300 mx-auto mb-4 xl:w-12 xl:h-12" />
              )}
            </motion.div>
          </>
        )}
      </motion.div>      {/* Pet Details Modal */}
      <BackofficePetModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        pet={selectedPet}
        onEdit={handlePetEditFromModal}
        onDelete={handlePetDeleteFromModal}
      />

      {/* Delete Pet Confirmation Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && petToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsDeleteModalOpen(false)}
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
                    <Trash2 size={24} className="text-red-600" />
                  </div>
                  <h2 className="text-2xl np-bold text-gray-800">
                    Eliminar Mascota
                  </h2>
                </div>
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              {/* Content */}
              <div className="space-y-4 mb-6">
                <p className="text-gray-600 np-regular">
                  ¿Estás seguro de que quieres eliminar a{' '}
                  <span className="np-bold text-gray-900">
                    {petToDelete.nombre}
                  </span>?
                </p>
                <div className="bg-red-50 p-4 rounded-xl">
                  <p className="text-red-800 np-medium text-sm">
                    ⚠️ Esta acción no se puede deshacer. Se eliminará permanentemente 
                    toda la información de la mascota y sus peticiones de adopción asociadas.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={() => setIsDeleteModalOpen(false)}
                  variant="outline"
                  className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={confirmDeletePet}
                  disabled={deletingPet}
                  leftIcon={deletingPet ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Trash2 size={16} />
                  )}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  {deletingPet ? 'Eliminando...' : 'Confirmar'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
