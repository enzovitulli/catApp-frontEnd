import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useAuth } from '../hooks/useAuth';
import HomePageLayout from '../layouts/HomePageLayout';
import { UserPlus, ArrowLeft } from 'lucide-react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    try {
      const result = await register(formData);
      
      if (result.success) {
        navigate('/app');
      } else {
        setError(result.error || 'Failed to register');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <HomePageLayout>
      <div className="flex min-h-[calc(100vh-64px)] flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Link to="/" className="flex items-center text-white mb-6 hover:text-orchid-300">
            <ArrowLeft size={18} className="mr-1" />
            <span>Volver</span>
          </Link>
          
          <h2 className="text-center text-2xl font-bold leading-9 tracking-tight text-white">
            Crea una nueva cuenta
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-oxford-800 px-6 py-8 shadow rounded-lg">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-white">
                  Nombre completo
                </label>
                <div className="mt-2">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="bg-oxford-700 block w-full rounded-md border-0 py-2.5 px-3 text-white shadow-sm ring-1 ring-inset ring-oxford-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-orchid-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white">
                  Email
                </label>
                <div className="mt-2">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="bg-oxford-700 block w-full rounded-md border-0 py-2.5 px-3 text-white shadow-sm ring-1 ring-inset ring-oxford-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-orchid-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-white">
                  Contraseña
                </label>
                <div className="mt-2">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="bg-oxford-700 block w-full rounded-md border-0 py-2.5 px-3 text-white shadow-sm ring-1 ring-inset ring-oxford-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-orchid-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-white">
                  Confirmar contraseña
                </label>
                <div className="mt-2">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="bg-oxford-700 block w-full rounded-md border-0 py-2.5 px-3 text-white shadow-sm ring-1 ring-inset ring-oxford-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-orchid-500"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-md p-3 text-sm text-red-200">
                  {error}
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full justify-center items-center rounded-md bg-orchid-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-orchid-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orchid-600 disabled:opacity-75"
                >
                  {loading ? (
                    <>
                      <span className="animate-spin h-4 w-4 mr-2 border-2 border-t-transparent border-white rounded-full"></span>
                      Creando cuenta...
                    </>
                  ) : (
                    <>
                      <UserPlus size={18} className="mr-2" />
                      Registrarse
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6 text-center text-sm text-gray-400">
              ¿Ya tienes una cuenta?{' '}
              <Link to="/login" className="font-medium text-orchid-400 hover:text-orchid-300">
                Inicia sesión
              </Link>
            </div>
          </div>
        </div>
      </div>
    </HomePageLayout>
  );
}
