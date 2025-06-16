import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Upload,
  X,
  Heart,
  Calendar,
  Info,
  Stethoscope,
  Users,
  Home,
  Activity,
  Camera,
  Baby,
  Dog,
  Cat,
  Shield,
  PawPrint
} from 'lucide-react';
import BackofficeLayout from '../layouts/BackofficeLayout';
import Button from '../components/Button';
import InputField from '../components/InputField';
import TextField from '../components/TextField';
import Dropdown from '../components/Dropdown';
import ToggleSwitch from '../components/ToggleSwitch';
import { backofficeApi } from '../services/api';
import { useAlert } from '../hooks/useAlert';

// Updated choices to match the Django model exactly
const ESPECIES_CHOICES = [
  { value: 'perro', label: 'Perro' },
  { value: 'gato', label: 'Gato' }
];

const TAMANO_CHOICES = [
  { value: 'pequeño', label: 'Pequeño' },
  { value: 'mediano', label: 'Mediano' },
  { value: 'grande', label: 'Grande' }
];

const GENERO_CHOICES = [
  { value: 'macho', label: 'Macho' },
  { value: 'hembra', label: 'Hembra' }
];

const APTITUD_NINOS_CHOICES = [
  { value: 'excelente', label: 'Excelente con niños' },
  { value: 'bueno', label: 'Bueno con niños' },
  { value: 'precaucion', label: 'Requiere precaución' },
  { value: 'noRecomendado', label: 'No recomendado' },
  { value: 'desconocido', label: 'No se sabe aún' }
];

const COMPATIBILIDAD_CHOICES = [
  { value: 'excelente', label: 'Excelente con otros animales' },
  { value: 'bienConPerros', label: 'Solo con perros' },
  { value: 'bienConGatos', label: 'Solo con gatos' },
  { value: 'selectivo', label: 'Selectivo' },
  { value: 'prefiereSolo', label: 'Prefiere estar solo' },
  { value: 'desconocido', label: 'No se sabe aún' }
];

const APTITUD_ESPACIO_CHOICES = [
  { value: 'ideal', label: 'Perfecto para cualquier hogar' },
  { value: 'bueno', label: 'Se adapta bien' },
  { value: 'requiereEspacio', label: 'Necesita espacio' },
  { value: 'soloConJardin', label: 'Solo con jardín' },
  { value: 'desconocido', label: 'No se sabe aún' }
];

const ESTADO_CHOICES = [
  { value: 'No adoptado', label: 'Disponible para adopción' },
  { value: 'En proceso', label: 'En proceso de adopción' },
  { value: 'Adoptado', label: 'Adoptado' }
];

export default function PetForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showError, showSuccess } = useAlert();
  const isEditing = Boolean(id);
  const [formData, setFormData] = useState({
    // Basic information
    nombre: '',
    especie: 'perro',
    raza: '',
    fecha_nacimiento: '',
    tamano: 'mediano',
    genero: 'macho',
    estado: 'No adoptado',
    
    // Personality and history
    temperamento: '',
    historia: '',
    
    // Health information
    esterilizado: false,
    problema_salud: false,
    descripcion_salud: '',
    
    // Social characteristics
    apto_ninos: 'desconocido',
    compatibilidad_mascotas: 'desconocido',
    apto_piso_pequeno: 'desconocido'  });
  const [images, setImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]); // Track positions of images to delete
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [isDragOver, setIsDragOver] = useState(false);

  const loadPetData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await backofficeApi.getAnimal(id);
      const petData = response.data;

      setFormData({
        nombre: petData.nombre || '',
        especie: petData.especie || 'perro',
        raza: petData.raza || '',
        fecha_nacimiento: petData.fecha_nacimiento || '',
        tamano: petData.tamano || 'mediano',
        genero: petData.genero || 'macho',
        estado: petData.estado || 'No adoptado',
        temperamento: petData.temperamento || '',
        historia: petData.historia || '',
        esterilizado: petData.esterilizado || false,
        problema_salud: petData.problema_salud || false,
        descripcion_salud: petData.descripcion_salud || '',
        apto_ninos: petData.apto_ninos || 'desconocido',
        compatibilidad_mascotas: petData.compatibilidad_mascotas || 'desconocido',
        apto_piso_pequeno: petData.apto_piso_pequeno || 'desconocido'
      });      // Load existing images with IDs and positions
      const existingImages = [];
      if (petData.imagen1) existingImages.push({ url: petData.imagen1, type: 'existing', id: 'img1', position: 1 });
      if (petData.imagen2) existingImages.push({ url: petData.imagen2, type: 'existing', id: 'img2', position: 2 });
      if (petData.imagen3) existingImages.push({ url: petData.imagen3, type: 'existing', id: 'img3', position: 3 });
      if (petData.imagen4) existingImages.push({ url: petData.imagen4, type: 'existing', id: 'img4', position: 4 });      
      setImages(existingImages);
      setImagesToDelete([]); // Reset any previous deletion marks
    } catch (error) {
      console.error('Error loading pet data:', error);
      showError('Error al cargar los datos de la mascota');
      navigate('/backoffice/pets');
    } finally {
      setLoading(false);
    }
  }, [navigate, showError, id]);
  useEffect(() => {
    if (isEditing) {
      loadPetData();
    }
  }, [id, isEditing, loadPetData]);
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };
  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    processFiles(files);
  };

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    // Filter only image files
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length !== files.length) {
      showError('Solo se permiten archivos de imagen');
    }
    
    if (imageFiles.length > 0) {
      processFiles(imageFiles);
    }
  };

  // Extract file processing logic into a separate function
  const processFiles = (files) => {
    if (images.length + files.length > 4) {
      showError('Máximo 4 imágenes permitidas');
      return;
    }

    const processFile = (file) => {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        showError('Las imágenes deben ser menores a 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const newImage = { 
          url: e.target.result, 
          type: 'new',
          file: file,
          id: `${Date.now()}-${Math.random()}`
        };
        setImages(prev => [...prev, newImage]);
        setImageFiles(prev => [...prev, file]);
      };
      reader.readAsDataURL(file);
    };

    files.forEach(processFile);
  };
  const removeImage = (index) => {
    const imageToRemove = images[index];
    
    // If it's an existing image, mark it for deletion instead of removing immediately
    if (imageToRemove.type === 'existing') {
      setImagesToDelete(prev => [...prev, imageToRemove.position]);
    }
    
    // Remove from UI immediately for better UX
    setImages(prev => prev.filter((_, i) => i !== index));
    
    // If it's a new image, also remove from imageFiles
    if (imageToRemove.type === 'new') {
      // Find the correct index in imageFiles (since they may not match due to existing images)
      const newImageIndex = images.slice(0, index).filter(img => img.type === 'new').length;
      setImageFiles(prev => prev.filter((_, i) => i !== newImageIndex));
    }
  };
  const validateForm = () => {
    const errors = {};

    if (!formData.nombre.trim()) {
      errors.nombre = 'El nombre es obligatorio';
    }

    if (!formData.raza.trim()) {
      errors.raza = 'La raza es obligatoria';
    }

    if (!formData.fecha_nacimiento) {
      errors.fecha_nacimiento = 'La fecha de nacimiento es obligatoria';
    }

    if (!formData.temperamento.trim()) {
      errors.temperamento = 'El temperamento es obligatorio';
    }

    if (!formData.historia.trim()) {
      errors.historia = 'La historia es obligatoria';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showError('Por favor corrige los errores en el formulario');
      return;
    }

    try {
      setLoading(true);

      const submitData = new FormData();
      
      // Add all form fields
      Object.keys(formData).forEach(key => {
        submitData.append(key, formData[key]);
      });

      // Add new image files
      imageFiles.forEach((file, index) => {
        submitData.append(`imagen${index + 1}_file`, file);
      });      if (isEditing) {
        // First, update the animal data
        await backofficeApi.updateAnimal(id, submitData);
        
        // Then, delete marked images
        if (imagesToDelete.length > 0) {
          console.log('Deleting images at positions:', imagesToDelete);
          
          // Delete images in parallel
          const deletePromises = imagesToDelete.map(position => 
            backofficeApi.deleteAnimalImage(id, position)
          );
          
          try {
            await Promise.all(deletePromises);
            console.log('All marked images deleted successfully');
          } catch (deleteError) {
            console.warn('Some image deletions failed:', deleteError);
            // Don't throw here, as the main update was successful
          }
        }
        
        showSuccess('Mascota actualizada exitosamente');
      } else {
        await backofficeApi.createAnimal(submitData);
        showSuccess('Mascota creada exitosamente');
      }

      navigate('/backoffice/pets');
    } catch (error) {
      console.error('Error saving pet:', error);
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.error || 
                          'Error al guardar la mascota';
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditing) {
    return (
      <BackofficeLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando datos de la mascota...</p>
          </div>
        </div>
      </BackofficeLayout>
    );
  }
  return (
    <BackofficeLayout>
      <AnimatePresence mode="wait">
        <motion.div 
          key={isEditing ? `edit-${id}` : 'create'} // Unique key to trigger animations
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ 
            duration: 0.3,
            ease: "easeInOut"
          }}
          className="max-w-4xl mx-auto"
        >        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-6"
        >          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            onClick={() => navigate('/backoffice/pets')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-8 transition-colors cursor-pointer"
            style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)' }}
          >
            <ArrowLeft size={20} />
            <span className="np-medium">Volver a mascotas</span>
          </motion.button>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="text-2xl lg:text-3xl font-bold text-gray-900 np-bold"
          >
            {isEditing ? 'Editar Mascota' : 'Nueva Mascota'}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="text-gray-600 np-regular"
          >
            {isEditing ? 'Actualiza la información de la mascota' : 'Agrega una nueva mascota para adopción'}
          </motion.p>
        </motion.div>        {/* Form */}
        <motion.form 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          onSubmit={handleSubmit} 
          className="space-y-8"
        >
          {/* Status (only for editing) - Show first when editing */}
          {isEditing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.6 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
            >
              <div className="flex items-center gap-2 mb-4">
                <PawPrint size={20} className="text-aquamarine-600" />
                <h2 className="text-lg font-semibold text-gray-900 np-bold">
                  Estado de Adopción
                </h2>
              </div>

              <div className="space-y-2">
                <label htmlFor="estado-dropdown" className="block text-sm sm:text-base font-medium text-gray-700 np-medium">
                  Estado actual
                </label>
                <Dropdown
                  id="estado-dropdown"
                  value={formData.estado}
                  onChange={(value) => handleInputChange('estado', value)}
                  options={ESTADO_CHOICES}
                  placeholder="Selecciona el estado"
                  leftIcon={<Shield size={18} />}
                />
              </div>
            </motion.div>
          )}

          {/* Basic Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: isEditing ? 0.7 : 0.6 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center gap-2 mb-4">
              <Info size={20} className="text-aquamarine-600" />
              <h2 className="text-lg font-semibold text-gray-900 np-bold">
                Información Básica
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Nombre de la mascota"
                value={formData.nombre}
                onChange={(value) => handleInputChange('nombre', value)}
                placeholder="Ej: Max, Luna, Toby..."
                error={!!validationErrors.nombre}
                errorMessage={validationErrors.nombre}
                required
              />              <div className="space-y-2">
                <label htmlFor="especie-dropdown" className="block text-sm sm:text-base font-medium text-gray-700 np-medium">
                  ¿Qué tipo de animal es? <span className="text-red-500">*</span>
                </label>
                <Dropdown
                  id="especie-dropdown"
                  value={formData.especie}
                  onChange={(value) => handleInputChange('especie', value)}
                  options={ESPECIES_CHOICES}
                  placeholder="Selecciona la especie"
                  leftIcon={formData.especie === 'perro' ? <Dog size={18} /> : <Cat size={18} />}
                />
              </div>

              <InputField
                label="Raza"
                value={formData.raza}
                onChange={(value) => handleInputChange('raza', value)}
                placeholder="Ej: Labrador, Siamés, Mestizo..."
                error={!!validationErrors.raza}
                errorMessage={validationErrors.raza}
                required
              />              <InputField
                label="Fecha de nacimiento"
                id="fecha-nacimiento"
                type="date"
                value={formData.fecha_nacimiento}
                onChange={(value) => handleInputChange('fecha_nacimiento', value)}
                error={!!validationErrors.fecha_nacimiento}
                errorMessage={validationErrors.fecha_nacimiento}
                leftIcon={<Calendar size={18} />}
                required
              />

              <div className="space-y-2">
                <label htmlFor="tamano-dropdown" className="block text-sm sm:text-base font-medium text-gray-700 np-medium">
                  ¿Qué tamaño tiene?
                </label>
                <Dropdown
                  id="tamano-dropdown"
                  value={formData.tamano}
                  onChange={(value) => handleInputChange('tamano', value)}
                  options={TAMANO_CHOICES}
                  placeholder="Selecciona el tamaño"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="genero-dropdown" className="block text-sm sm:text-base font-medium text-gray-700 np-medium">
                  ¿Es macho o hembra?
                </label>
                <Dropdown
                  id="genero-dropdown"
                  value={formData.genero}
                  onChange={(value) => handleInputChange('genero', value)}
                  options={GENERO_CHOICES}
                  placeholder="Selecciona el sexo"
                />
              </div>
            </div>
          </motion.div>          {/* Images */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: isEditing ? 0.1 : 0.1 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center gap-2 mb-4">
              <Camera size={20} className="text-aquamarine-600" />
              <h2 className="text-lg font-semibold text-gray-900 np-bold">
                Fotos de la mascota
              </h2>
              <p className="text-sm text-gray-500 np-regular ml-2">
                (Sube hasta 4 fotos para que las familias puedan conocer mejor a la mascota)
              </p>
            </div>            <div className="space-y-4">
              {/* Image Upload */}
              <div 
                className={`border-2 border-dashed rounded-lg p-6 text-center hover:border-aquamarine-400 transition-colors ${
                  isDragOver ? 'border-aquamarine-600 bg-blue-50' : 'border-gray-300'
                }`}
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                  disabled={images.length >= 4}
                />
                <label
                  htmlFor="image-upload"
                  className={`cursor-pointer block ${images.length >= 4 ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Upload size={32} className="text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 np-regular">
                    {images.length >= 4 
                      ? 'Máximo 4 imágenes permitidas'
                      : 'Haz clic para subir imágenes o arrastra aquí'
                    }
                  </p>
                  <p className="text-sm text-gray-500 np-regular">
                    PNG, JPG hasta 5MB cada una
                  </p>
                </label>
              </div>{/* Image Preview */}
              {images.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {images.map((image) => (
                    <div key={image.id} className="relative group">
                      <img
                        src={image.url}
                        alt={`Imagen ${image.id}`}
                        className="w-full h-32 object-cover rounded-lg border border-gray-200"
                      />                      <button
                        type="button"
                        onClick={() => removeImage(images.indexOf(image))}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 
                                 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>          {/* Personality and History */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: isEditing ? 0.2 : 0.2 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center gap-2 mb-4">
              <Heart size={20} className="text-aquamarine-600" />
              <h2 className="text-lg font-semibold text-gray-900 np-bold">
                Personalidad e Historia
              </h2>
            </div>            <div className="space-y-4">
              <TextField
                id="temperamento"
                label="¿Cómo es su temperamento?"
                value={formData.temperamento}
                onChange={(value) => handleInputChange('temperamento', value)}
                placeholder="Ej: Es muy juguetón y cariñoso, le encanta correr y jugar. Es tranquilo en casa pero activo en el parque..."
                required={true}
                error={!!validationErrors.temperamento}
                errorMessage={validationErrors.temperamento}
                rows={4}
                maxLength={800}
                leftIcon={<Heart size={18} className="text-gray-500" />}
              />              <TextField
                id="historia"
                label="Cuéntanos su historia"
                value={formData.historia}
                onChange={(value) => handleInputChange('historia', value)}
                placeholder="Ej: Fue encontrado en la calle cuando era cachorro. Ha estado con nosotros 6 meses y ya está listo para encontrar su familia para siempre..."
                required={true}
                error={!!validationErrors.historia}
                errorMessage={validationErrors.historia}
                rows={4}
                maxLength={1000}
                leftIcon={<Info size={18} className="text-gray-500" />}
              />
            </div></motion.div>          {/* Social Characteristics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: isEditing ? 0.3 : 0.3 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center gap-2 mb-4">
              <Users size={20} className="text-aquamarine-600" />
              <h2 className="text-lg font-semibold text-gray-900 np-bold">
                Características Sociales
              </h2>
            </div><div className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="apto-ninos" className="block text-sm sm:text-base font-medium text-gray-700 np-medium">
                  ¿Cómo se lleva con los niños?
                </label>
                <Dropdown
                  id="apto-ninos"
                  value={formData.apto_ninos}
                  onChange={(value) => handleInputChange('apto_ninos', value)}
                  options={APTITUD_NINOS_CHOICES}
                  placeholder="Selecciona su relación con niños"
                  leftIcon={<Baby size={18} />}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="compatibilidad-mascotas" className="block text-sm sm:text-base font-medium text-gray-700 np-medium">
                  ¿Cómo se lleva con otros animales?
                </label>
                <Dropdown
                  id="compatibilidad-mascotas"
                  value={formData.compatibilidad_mascotas}
                  onChange={(value) => handleInputChange('compatibilidad_mascotas', value)}
                  options={COMPATIBILIDAD_CHOICES}
                  placeholder="Selecciona su compatibilidad"
                  leftIcon={<Heart size={18} />}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="apto-piso" className="block text-sm sm:text-base font-medium text-gray-700 np-medium">
                  ¿Qué tipo de hogar necesita?
                </label>
                <Dropdown
                  id="apto-piso"
                  value={formData.apto_piso_pequeno}
                  onChange={(value) => handleInputChange('apto_piso_pequeno', value)}
                  options={APTITUD_ESPACIO_CHOICES}
                  placeholder="Selecciona el tipo de hogar ideal"
                  leftIcon={<Home size={18} />}
                />
              </div>
            </div>          </motion.div>          {/* Health Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: isEditing ? 0.4 : 0.4 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center gap-2 mb-4">
              <Stethoscope size={20} className="text-aquamarine-600" />
              <h2 className="text-lg font-semibold text-gray-900 np-bold">
                Información de Salud
              </h2>
            </div>

            <div className="space-y-6">
              {/* Health toggles */}
              <div className="space-y-4">
                <ToggleSwitch
                  checked={formData.esterilizado}
                  onChange={(value) => handleInputChange('esterilizado', value)}
                  label="¿Está esterilizado/castrado?"
                  description="Importante para el control de población y salud"
                />

                <ToggleSwitch
                  checked={formData.problema_salud}
                  onChange={(value) => handleInputChange('problema_salud', value)}
                  label="¿Tiene algún problema de salud?"
                  description="Enfermedades crónicas, alergias, limitaciones físicas, etc."
                />
              </div>

              {/* Health description - only show if health problems */}
              {formData.problema_salud && (                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >                  <TextField
                    id="descripcion-salud"
                    label="Describe los cuidados especiales que necesita"
                    value={formData.descripcion_salud}
                    onChange={(value) => handleInputChange('descripcion_salud', value)}
                    placeholder="Ej: Necesita medicación diaria para la artritis, dieta especial sin gluten, revisiones veterinarias cada 3 meses..."
                    rows={3}
                    maxLength={300}
                    leftIcon={<Stethoscope size={18} className="text-gray-500" />}
                  />
                </motion.div>
              )}
            </div>
          </motion.div>          {/* Form Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: isEditing ? 0.5 : 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >            <Button
              type="button"
              variant="outline-orchid"
              size="md"
              onClick={() => navigate('/backoffice/pets')}
              disabled={loading}
              className="w-full sm:w-auto np-semibold"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="cta"
              size="md"
              disabled={loading}
              className="w-full sm:w-auto np-bold"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-t-transparent border-white" />
                  {isEditing ? 'Actualizando...' : 'Guardando...'}
                </div>
              ) : (
                <>
                  {isEditing ? 'Actualizar Mascota' : 'Crear Mascota'}
                </>
              )}            </Button>
          </motion.div>
        </motion.form>
        </motion.div>
      </AnimatePresence>
    </BackofficeLayout>
  );
}
