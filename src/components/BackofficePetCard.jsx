import PropTypes from 'prop-types';
import { Edit, Trash2, Eye, Calendar, MapPin, Mars, Venus, Clock, Weight } from 'lucide-react';
import { calculateAge } from './Card';
import Pill from './Pill';
import Button from './Button';

const BackofficePetCard = ({ pet, onEdit, onDelete, onSelect, isSelected }) => {
  // Get the first available image
  const getMainImage = () => {
    if (pet.imagen1) return pet.imagen1;
    if (pet.imagen2) return pet.imagen2;
    if (pet.imagen3) return pet.imagen3;
    if (pet.imagen4) return pet.imagen4;
    return null;
  };

  // Format the age display
  const getAgeDisplay = () => {
    if (!pet.fecha_nacimiento) return 'Edad desconocida';
    const age = calculateAge(pet.fecha_nacimiento);
    return age === 1 ? '1 año' : `${age} años`;
  };

  // Format the availability date display
  const getAvailabilityDate = () => {
    if (!pet.fecha_registro && !pet.created_at && !pet.fecha_creacion) {
      return 'Fecha no disponible';
    }
    
    // Try different possible field names for the registration/creation date
    const availabilityDate = pet.fecha_registro || pet.created_at || pet.fecha_creacion;
    
    const date = new Date(availabilityDate);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Get status color
  const getStatusColor = () => {
    switch (pet.estado) {
      case 'No adoptado':
        return 'bg-green-500 text-white';
      case 'En proceso':
        return 'bg-yellow-500 text-white';
      case 'Adoptado':
        return 'bg-blue-600 text-white';
      default:
        return 'bg-blue-600 text-white';
    }
  };

  // Get species display without gender
  const getSpeciesDisplay = () => {
    return pet.especie === 'perro' ? 'Perro' : 'Gato';
  };

  // Get gender icon component and color
  const GenderIcon = pet.genero === 'hembra' ? Venus : Mars;
  const getGenderIconColor = () => {
    return pet.genero === 'hembra' ? 'text-pink-500' : 'text-blue-500';
  };

  const mainImage = getMainImage();

  return (    <div 
      className={`pet-card-uniform bg-white rounded-xl xl:rounded-2xl shadow-lg overflow-hidden transition-all duration-200 hover:shadow-xl border-2 ${
        isSelected ? 'border-aquamarine-400 ring-2 ring-aquamarine-200' : 'border-transparent'
      }`}
    >
      {/* Image Section */}
      <div 
        className="relative h-40 sm:h-44 xl:h-48 bg-gray-200 flex-shrink-0 cursor-pointer"
        onClick={() => onSelect(pet)}
      >
        {mainImage ? (
          <img
            src={mainImage}
            alt={pet.nombre}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl lg:text-6xl text-gray-300">🐾</span>
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-2 sm:top-3 left-2 sm:left-3">
          <Pill className={`text-xs np-bold ${getStatusColor()}`}>
            {pet.estado}
          </Pill>
        </div>        {/* Action Buttons */}
        <div className="absolute top-2 sm:top-3 right-2 sm:right-3 flex space-x-1 sm:space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (pet.estado !== 'Adoptado') {
                onEdit(pet);
              }
            }}
            disabled={pet.estado === 'Adoptado'}
            className={`p-1.5 sm:p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-colors ${
              pet.estado === 'Adoptado' 
                ? 'text-gray-400 cursor-not-allowed opacity-50' 
                : 'text-gray-700 hover:text-blue-600 cursor-pointer'
            }`}
            title={pet.estado === 'Adoptado' ? 'No se puede editar una mascota adoptada' : 'Editar mascota'}
          >
            <Edit size={14} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (pet.estado !== 'Adoptado') {
                onDelete(pet);
              }
            }}
            disabled={pet.estado === 'Adoptado'}
            className={`p-1.5 sm:p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-colors ${
              pet.estado === 'Adoptado' 
                ? 'text-gray-400 cursor-not-allowed opacity-50' 
                : 'text-gray-700 hover:text-red-600 cursor-pointer'
            }`}
            title={pet.estado === 'Adoptado' ? 'No se puede eliminar una mascota adoptada' : 'Eliminar mascota'}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div 
        className="pet-card-content p-3 sm:p-4 cursor-pointer"
        onClick={() => onSelect(pet)}
      >
        {/* Name, Gender and Availability Date */}
        <div className="mb-2 sm:mb-3">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1 sm:gap-2 min-w-0">
              <h3 className="text-base sm:text-lg np-bold text-gray-900 truncate">{pet.nombre}</h3>
              <GenderIcon size={14} className={`${getGenderIconColor()} flex-shrink-0`} />
            </div>            <div className="flex items-center text-xs text-gray-500 np-regular flex-shrink-0">
              <Clock size={10} className="mr-1" />
              <span className="truncate">{getAvailabilityDate()}</span>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 np-regular truncate">{getSpeciesDisplay()} • {pet.raza}</p>
        </div>        {/* Age and Size */}
        <div className="flex items-center space-x-3 sm:space-x-4 text-xs sm:text-sm text-gray-500 np-regular mb-2 sm:mb-3">
          <div className="flex items-center min-w-0">
            <Calendar size={12} className="mr-1 flex-shrink-0" />
            <span className="truncate">{getAgeDisplay()}</span>
          </div>
          <div className="flex items-center min-w-0">
            <Weight size={12} className="mr-1 flex-shrink-0" />
            <span className="truncate">
              {pet.tamano === 'pequeño' ? 'Pequeño' : pet.tamano === 'mediano' ? 'Mediano' : 'Grande'}
            </span>
          </div>
        </div>

        {/* Health Status */}
        <div className="flex items-center space-x-1 sm:space-x-2 mb-2 sm:mb-3 flex-wrap gap-1">
          {pet.esterilizado && (
            <Pill className="text-xs np-bold bg-gray-300 text-gray-600">
              Esterilizado
            </Pill>
          )}
          {!pet.esterilizado && (
            <Pill className="text-xs np-bold bg-red-400 text-white">
              No esterilizado
            </Pill>
          )}
          {pet.problema_salud && (
            <Pill className="text-xs np-bold bg-orchid-500 text-white">
              Cuidados especiales
            </Pill>
          )}
        </div>

        {/* View Details - Always at bottom */}
        <div className="pet-card-actions flex justify-center">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(pet);
            }}            variant="primary"
            size="sm"
            className="w-auto text-xs sm:text-sm np-medium bg-aquamarine-600"
            leftIcon={<Eye size={14} />}
          >
            Ver detalles
          </Button>
        </div>
      </div>
    </div>
  );
};

BackofficePetCard.propTypes = {
  pet: PropTypes.object.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onSelect: PropTypes.func.isRequired,
  isSelected: PropTypes.bool,
};

BackofficePetCard.defaultProps = {
  isSelected: false,
};

export default BackofficePetCard;
