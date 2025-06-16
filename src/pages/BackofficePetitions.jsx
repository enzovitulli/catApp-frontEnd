import { useState, useEffect, useCallback } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'motion/react';
import { Mail, Clock, CheckCircle, XCircle, ArrowUpDown } from 'lucide-react';
import PetitionMailbox from '../components/PetitionMailbox';
import Dropdown from '../components/Dropdown';
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
  const [petitionsLoading, setPetitionsLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('total'); // 'total', 'pending', 'accepted', 'rejected'
  const [orderBy, setOrderBy] = useState('fecha_peticion');
  const [orderDirection, setOrderDirection] = useState('desc');
  const { showError } = useAlert();

  const loadPetitions = useCallback(async (filter = 'total', isInitialLoad = false, customOrderBy = null, customOrderDirection = null) => {
    try {
      // Use different loading states for initial load vs filter changes
      if (isInitialLoad) {
        setLoading(true);
      } else {
        setPetitionsLoading(true);
      }
      
      // Prepare ordering parameters
      const orderParams = {
        order_by: customOrderBy || orderBy,
        order_direction: customOrderDirection || orderDirection
      };
      
      // Get filtered petitions based on the active filter
      let petitionsResponse;
      switch (filter) {
        case 'pending':
          petitionsResponse = await backofficeApi.getCompanyPendingPetitions(orderParams);
          break;
        case 'accepted':
          petitionsResponse = await backofficeApi.getCompanyAcceptedPetitions(orderParams);
          break;
        case 'rejected':
          petitionsResponse = await backofficeApi.getCompanyRejectedPetitions(orderParams);
          break;
        case 'total':
        default:
          // Use the original endpoint that shows all petitions (pending, accepted, rejected)
          petitionsResponse = await backofficeApi.getCompanyPetitions(orderParams);
          break;
      }
      
      const petitionsData = petitionsResponse.data || [];
      setPetitions(petitionsData);
      
      // Only load all petitions for stats if it's the initial load or if we're not already showing all petitions
      if (isInitialLoad || filter !== 'total') {
        const allPetitionsResponse = await backofficeApi.getCompanyPetitions();
        const allPetitionsData = allPetitionsResponse.data || [];
        
        // Calculate stats from all petitions
        const pendingCount = allPetitionsData.filter(p => p.estado === 'Pendiente').length;
        const acceptedCount = allPetitionsData.filter(p => p.estado === 'Aceptada').length;
        const rejectedCount = allPetitionsData.filter(p => p.estado === 'Rechazada').length;
        
        setStats({
          total: allPetitionsData.length,
          pending: pendingCount,
          accepted: acceptedCount,
          rejected: rejectedCount
        });
      } else {
        // If we're showing all petitions, calculate stats from the current data
        const pendingCount = petitionsData.filter(p => p.estado === 'Pendiente').length;
        const acceptedCount = petitionsData.filter(p => p.estado === 'Aceptada').length;
        const rejectedCount = petitionsData.filter(p => p.estado === 'Rechazada').length;
        
        setStats({
          total: petitionsData.length,
          pending: pendingCount,
          accepted: acceptedCount,
          rejected: rejectedCount
        });
      }
    } catch (error) {
      console.error('Error loading petitions:', error);
      showError('Error al cargar las peticiones');
    } finally {
      if (isInitialLoad) {
        setLoading(false);
      } else {
        setPetitionsLoading(false);
      }
    }
  }, [showError, orderBy, orderDirection]);

  useEffect(() => {
    loadPetitions(activeFilter, true);
  }, [loadPetitions]);

  // Handle filter changes
  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    loadPetitions(filter, false);
  };

  // Handle ordering changes - only update the mailbox, not the entire page
  const handleOrderChange = async (newOrderValue) => {
    // Parse the order value correctly
    let newOrderBy, newOrderDirection;
    if (newOrderValue === 'fecha_peticion_desc' || newOrderValue === 'fecha_peticion_asc') {
      newOrderBy = 'fecha_peticion';
      newOrderDirection = newOrderValue.split('_')[2];
    } else if (newOrderValue.startsWith('animal__nombre_')) {
      newOrderBy = 'animal__nombre';
      newOrderDirection = newOrderValue.split('_')[2];
    } else if (newOrderValue.startsWith('animal__fecha_nacimiento_')) {
      newOrderBy = 'animal__fecha_nacimiento';
      newOrderDirection = newOrderValue.split('_')[3];
    }
    
    // Update order state
    setOrderBy(newOrderBy);
    setOrderDirection(newOrderDirection);
    
    // Only reload petitions without affecting the entire page state
    setPetitionsLoading(true);
    try {
      const orderParams = { order_by: newOrderBy, order_direction: newOrderDirection };
      let petitionsResponse;
      
      switch (activeFilter) {
        case 'pending':
          petitionsResponse = await backofficeApi.getCompanyPendingPetitions(orderParams);
          break;
        case 'accepted':
          petitionsResponse = await backofficeApi.getCompanyAcceptedPetitions(orderParams);
          break;
        case 'rejected':
          petitionsResponse = await backofficeApi.getCompanyRejectedPetitions(orderParams);
          break;
        case 'default':
          petitionsResponse = await backofficeApi.getCompanyDefaultPetitions(orderParams);
          break;
        case 'total':
        default:
          petitionsResponse = await backofficeApi.getCompanyPetitions(orderParams);
          break;
      }
      
      const petitionsData = petitionsResponse.data || [];
      setPetitions(petitionsData);
    } catch (error) {
      console.error('Error reordering petitions:', error);
      showError('Error al ordenar las peticiones');
    } finally {
      setPetitionsLoading(false);
    }
  };

  // Ordering options based on documentation

  // Handle petition status updates
  const handlePetitionUpdate = async (petitionId, updateData) => {
    try {
      const response = await backofficeApi.updatePetition(petitionId, updateData);
      
      // If it's a status change (accept/reject), reload the filtered petitions and stats
      if (updateData.estado !== undefined) {
        // Reload petitions with current filter to reflect the change
        await loadPetitions(activeFilter);
      } else {
        // If it's just marking as read, update the petition in the current list
        setPetitions(prevPetitions =>
          prevPetitions.map(petition =>
            petition.id === petitionId ? response.data : petition
          )
        );
      }
      
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
      color: 'bg-blue-500',
      filter: 'total',
      description: 'Todas las peticiones (pendientes, aceptadas y rechazadas)'
    },
    {
      title: 'Pendientes',
      value: stats.pending,
      icon: Clock,
      color: 'bg-yellow-500',
      filter: 'pending',
      description: 'Peticiones esperando respuesta'
    },
    {
      title: 'Aceptadas',
      value: stats.accepted,
      icon: CheckCircle,
      color: 'bg-green-500',
      filter: 'accepted',
      description: 'Peticiones aprobadas'
    },
    {
      title: 'Rechazadas',
      value: stats.rejected,
      icon: XCircle,
      color: 'bg-red-500',
      filter: 'rejected',
      description: 'Peticiones rechazadas'
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
  }  return (
    <motion.div 
      className="space-y-6 h-fit w-full"
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
        <div className="flex-1">          <h1 className="text-2xl xl:text-3xl font-bold text-gray-900 np-bold">
            Peticiones de Adopción
          </h1>
          <p className="text-gray-600 np-regular">
            {activeFilter === 'total' && 'Mostrando todas las peticiones'}
            {activeFilter === 'pending' && 'Mostrando peticiones pendientes'}
            {activeFilter === 'accepted' && 'Mostrando peticiones aceptadas'}
            {activeFilter === 'rejected' && 'Mostrando peticiones rechazadas'}
          </p>
        </div>
      </motion.div>      {/* Stats Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 auto-rows-fr">
        {statsCards.map((stat, index) => (
          <motion.button
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
            onClick={() => handleFilterChange(stat.filter)}
            className={`bg-white rounded-xl p-3 sm:p-4 xl:p-6 shadow-sm border transition-all duration-200 flex flex-col h-full text-left cursor-pointer group ${
              activeFilter === stat.filter 
                ? 'border-aquamarine-500 shadow-lg ring-2 ring-aquamarine-100' 
                : 'border-gray-100 hover:shadow-lg hover:border-gray-200'
            }`}
            title={stat.description}
          >
            <div className="flex items-start justify-between flex-1">
              <div className="min-w-0 flex-1 pr-2 sm:pr-3 flex flex-col justify-between h-full">
                <p className={`text-xs sm:text-sm np-regular leading-tight mb-1 sm:mb-2 flex-shrink-0 transition-colors ${
                  activeFilter === stat.filter ? 'text-aquamarine-700' : 'text-gray-600 group-hover:text-gray-700'
                }`}>
                  {stat.title}
                </p>
                <p className={`text-lg sm:text-xl xl:text-2xl font-bold np-bold leading-tight flex-1 flex items-end transition-colors ${
                  activeFilter === stat.filter ? 'text-aquamarine-900' : 'text-gray-900'
                }`}>
                  {stat.value}
                </p>
              </div>              <div className={`p-2 sm:p-2.5 xl:p-3 rounded-lg ${stat.color} flex-shrink-0 self-start transition-transform group-hover:scale-105`}>
                <stat.icon size={16} className="text-white sm:w-5 sm:h-5 xl:w-6 xl:h-6" />
              </div>
            </div>
          </motion.button>
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
            loading={petitionsLoading}
            orderBy={orderBy}
            orderDirection={orderDirection}
            onOrderChange={handleOrderChange}
            showOrderingDropdown={true}
          />
        )}
      </motion.div>
    </motion.div>
  );
}
