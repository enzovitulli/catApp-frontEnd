import { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'motion/react';
import { UserCog, User, Bell, Shield, Moon, HelpCircle, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/Button';
import ToggleSwitch from '../components/ToggleSwitch';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const settingSections = [
    {
      title: 'Cuenta',
      icon: User,
      items: [
        {
          label: 'Información personal',
          description: 'Edita tu perfil y preferencias',
          action: () => console.log('Editar perfil'),
          type: 'button'
        },
        {
          label: 'Cambiar contraseña',
          description: 'Actualiza tu contraseña de acceso',
          action: () => console.log('Cambiar contraseña'),
          type: 'button'
        }
      ]
    },
    {
      title: 'Notificaciones',
      icon: Bell,
      items: [
        {
          label: 'Notificaciones push',
          description: 'Recibe alertas sobre tus peticiones',
          value: notifications,
          action: setNotifications,
          type: 'toggle'
        },
        {
          label: 'Actualizaciones por email',
          description: 'Recibe noticias y consejos por correo',
          value: emailUpdates,
          action: setEmailUpdates,
          type: 'toggle'
        }
      ]
    },
    {
      title: 'Apariencia',
      icon: Moon,
      items: [
        {
          label: 'Modo oscuro',
          description: 'Cambia entre tema claro y oscuro',
          value: darkMode,
          action: setDarkMode,
          type: 'toggle'
        }
      ]
    },
    {
      title: 'Privacidad',
      icon: Shield,
      items: [
        {
          label: 'Política de privacidad',
          description: 'Lee nuestra política de privacidad',
          action: () => console.log('Política de privacidad'),
          type: 'button'
        },
        {
          label: 'Términos y condiciones',
          description: 'Consulta nuestros términos de servicio',
          action: () => console.log('Términos y condiciones'),
          type: 'button'
        }
      ]
    },
    {
      title: 'Soporte',
      icon: HelpCircle,
      items: [
        {
          label: 'Centro de ayuda',
          description: 'Encuentra respuestas a tus preguntas',
          action: () => console.log('Centro de ayuda'),
          type: 'button'
        },
        {
          label: 'Contactar soporte',
          description: 'Envía un mensaje a nuestro equipo',
          action: () => console.log('Contactar soporte'),
          type: 'button'
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-oxford-900 dark:to-marine-900 transition-colors duration-300 pt-20">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Header */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <UserCog className="text-orchid-500 dark:text-aquamarine-400" size={32} />
            <h1 className="text-3xl np-bold text-gray-900 dark:text-white">
              Configuración
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300 np-light">
            Personaliza tu experiencia y gestiona tu cuenta
          </p>
        </motion.div>

        {/* User Info Card */}
        <motion.div
          className="bg-white dark:bg-marine-800/50 rounded-xl p-6 mb-6 border border-gray-200 dark:border-marine-600/30 transition-all duration-300"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-r from-orchid-500 to-aquamarine-400 rounded-full flex items-center justify-center">
              <User className="text-white" size={24} />
            </div>
            <div>
              <h3 className="text-xl np-bold text-gray-900 dark:text-white">
                {user?.nombre || 'Usuario'}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {user?.email || 'usuario@email.com'}
              </p>
              <span className="inline-block mt-1 px-2 py-1 text-xs bg-orchid-100 dark:bg-orchid-900/50 text-orchid-600 dark:text-orchid-400 rounded-full">
                {user?.tipo || 'USUARIO'}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {settingSections.map((section, sectionIndex) => {
            const SectionIcon = section.icon;
            
            return (
              <motion.div
                key={section.title}
                className="bg-white dark:bg-marine-800/50 rounded-xl p-6 border border-gray-200 dark:border-marine-600/30 transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 + sectionIndex * 0.1 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <SectionIcon className="text-orchid-500 dark:text-aquamarine-400" size={20} />
                  <h3 className="text-lg np-bold text-gray-900 dark:text-white">
                    {section.title}
                  </h3>
                </div>
                  <div className="space-y-4">
                  {section.items.map((item) => (
                    <div key={`${section.title}-${item.label}`} className="flex items-center justify-between py-2">
                      <div className="flex-1">
                        <h4 className="np-medium text-gray-900 dark:text-white">
                          {item.label}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {item.description}
                        </p>
                      </div>
                      
                      <div className="ml-4">
                        {item.type === 'toggle' ? (
                          <ToggleSwitch
                            checked={item.value}
                            onChange={item.action}
                          />
                        ) : (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={item.action}
                            className="np-medium"
                          >
                            Ver
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Logout Section */}
        <motion.div
          className="mt-8 pt-6 border-t border-gray-200 dark:border-marine-600/30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Button
            variant="primary"
            onClick={handleLogout}
            leftIcon={<LogOut size={16} />}
            className="w-full justify-center np-bold"
          >
            Cerrar sesión
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
