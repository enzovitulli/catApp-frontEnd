import PropTypes from 'prop-types';
import { Edit, Trash2, Eye, Calendar, MapPin } from 'lucide-react';
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

  // Get status color
  const getStatusColor = () => {
    switch (pet.estado) {
      case 'No adoptado':
        return 'bg-green-100 text-green-800';
      case 'En proceso':
        return 'bg-yellow-100 text-yellow-800';
      case 'Adoptado':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get species and gender display
  const getSpeciesDisplay = () => {
    const species = pet.especie === 'perro' ? 'Perro' : 'Gato';
    const gender = pet.genero === 'macho' ? '♂' : '♀';
    return `${species} ${gender}`;
  };

  const mainImage = getMainImage();

  return (
    <div 
      className={`bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-200 hover:shadow-xl border-2 ${
        isSelected ? 'border-aquamarine-400 ring-2 ring-aquamarine-200' : 'border-transparent'
      }`}
    >
      {/* Image Section */}
      <div className="relative h-48 bg-gray-200">
        {mainImage ? (
          <img
            src={mainImage}
            alt={pet.nombre}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-6xl text-gray-300">🐾</span>
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <Pill className={`text-xs np-bold ${getStatusColor()}`}>
            {pet.estado}
          </Pill>
        </div>

        {/* Action Buttons */}
        <div className="absolute top-3 right-3 flex space-x-2">          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(pet);
            }}
            className="p-2 bg-white/90 hover:bg-white text-gray-700 hover:text-blue-600 rounded-full shadow-lg transition-colors cursor-pointer"
            title="Editar mascota"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(pet);
            }}
            className="p-2 bg-white/90 hover:bg-white text-gray-700 hover:text-red-600 rounded-full shadow-lg transition-colors cursor-pointer"
            title="Eliminar mascota"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div 
        className="p-4 cursor-pointer"
        onClick={() => onSelect(pet)}
      >
        {/* Name and Species */}
        <div className="mb-3">
          <h3 className="text-lg np-bold text-gray-900 mb-1">{pet.nombre}</h3>
          <p className="text-sm text-gray-600">{getSpeciesDisplay()} • {pet.raza}</p>
        </div>

        {/* Age and Size */}
        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
          <div className="flex items-center">
            <Calendar size={14} className="mr-1" />
            {getAgeDisplay()}
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-gray-300 mr-1"></span>
            {pet.tamano === 'pequeño' ? 'Pequeño' : pet.tamano === 'mediano' ? 'Mediano' : 'Grande'}
          </div>
        </div>

        {/* Health Status */}
        <div className="flex items-center space-x-2 mb-3">
          {pet.esterilizado && (
            <Pill className="text-xs bg-blue-100 text-blue-800">
              Esterilizado
            </Pill>
          )}
          {pet.problema_salud && (
            <Pill className="text-xs bg-orange-100 text-orange-800">
              Cuidados especiales
            </Pill>
          )}
        </div>

        {/* Temperament Preview */}
        {pet.temperamento && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {pet.temperamento.substring(0, 100)}
            {pet.temperamento.length > 100 ? '...' : ''}
          </p>
        )}        {/* View Details */}
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onSelect(pet);
          }}
          variant="secondary"
          className="w-auto bg-aquamarine-100 text-aquamarine-800 hover:bg-aquamarine-200 border-0"
          leftIcon={<Eye size={16} />}
        >
          Ver peticiones
        </Button>
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
