import { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'motion/react';
import { MessageCircle, Clock, CheckCircle, XCircle, Eye } from 'lucide-react';

export default function PetitionsPage() {
  const [petitions, setPetitions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock data for now - in real app this would come from API
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {      setPetitions([
        {
          id: 1,
          animal: { 
            nombre: 'Luna', 
            especie: 'gato', 
            raza: 'Siamés',
            imagen1: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&h=400&fit=crop&crop=faces'
          },
          estado: 'Pendiente',
          fecha_peticion: '2024-06-10T10:00:00Z',
          empresa: { nombre_empresa: 'Refugio Esperanza' }
        },
        {
          id: 2,
          animal: { 
            nombre: 'Max', 
            especie: 'perro', 
            raza: 'Labrador',
            imagen1: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=400&fit=crop&crop=faces'
          },
          estado: 'Aceptada',
          fecha_peticion: '2024-06-08T15:30:00Z',
          empresa: { nombre_empresa: 'Protectora Animal Ciudad' }
        },
        {
          id: 3,
          animal: { 
            nombre: 'Michi', 
            especie: 'gato', 
            raza: 'Mestizo',
            imagen1: 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=400&h=400&fit=crop&crop=faces'
          },
          estado: 'Rechazada',
          fecha_peticion: '2024-06-05T09:15:00Z',
          empresa: { nombre_empresa: 'Asociación Patitas' }
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);
  const getStatusConfig = (estado) => {
    switch (estado) {
      case 'Pendiente':
        return {
          icon: Clock,
          color: 'text-amber-600 dark:text-amber-400',
          bgColor: 'bg-amber-50 dark:bg-amber-900/20',
          borderColor: 'border-amber-100 dark:border-amber-800/50',
          label: 'En revisión'
        };
      case 'Aceptada':
        return {
          icon: CheckCircle,
          color: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          borderColor: 'border-green-100 dark:border-green-800/50',
          label: 'Aprobada'
        };
      case 'Rechazada':
        return {
          icon: XCircle,
          color: 'text-red-600 dark:text-red-400',
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          borderColor: 'border-red-100 dark:border-red-800/50',
          label: 'Rechazada'
        };
      default:
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
            <p className="text-gray-600 dark:text-gray-300 text-sm">Cargando...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-oxford-900 dark:to-marine-900 transition-colors duration-300 pt-20">
      <div className="container mx-auto px-4 py-6">        {/* Header */}
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
        </motion.div>        {/* Petitions List */}
        <div className="max-w-2xl mx-auto space-y-3">
          {petitions.length === 0 ? (            <motion.div 
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
                Tus solicitudes de adopción aparecerán aquí
              </p>
            </motion.div>
          ) : (
            petitions.map((petition, index) => {
              const statusConfig = getStatusConfig(petition.estado);
              const StatusIcon = statusConfig.icon;
                return (                <motion.div
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
                        <img
                          src={petition.animal.imagen1}
                          alt={petition.animal.nombre}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        <div 
                          className="w-full h-full hidden items-center justify-center text-gray-400 text-xs"
                          style={{ display: 'none' }}
                        >
                          🐾
                        </div>
                      </div>
                    </div>
                    
                    {/* Pet Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg np-bold text-gray-900 dark:text-white">
                          {petition.animal.nombre}
                        </h3>
                        <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                          {petition.animal.especie}
                        </span>
                      </div>
                      
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(petition.fecha_peticion)}
                      </p>
                    </div>
                    
                    {/* Status Badge */}
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${statusConfig.bgColor} border ${statusConfig.borderColor}`}>
                      <StatusIcon size={14} className={statusConfig.color} />
                      <span className={`text-xs np-medium ${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>
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
