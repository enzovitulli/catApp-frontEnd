# Estructura de la Base de Datos de la Plataforma de Adopción de Mascotas

Este documento detalla la estructura requerida de la base de datos para el backend de la aplicación de Adopción de Mascotas. El frontend espera que la API siga estos modelos y endpoints.

## Modelos

### Usuario

Representa a un usuario de la aplicación.

```python
class Usuario(AbstractUser):
    nombre_usuario = models.CharField(max_length=150, unique=True)
    email = models.EmailField(unique=True)
    foto_perfil = models.ImageField(upload_to='fotos_perfil/', null=True, blank=True)
    biografia = models.TextField(max_length=500, blank=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)
    
    # Campos de dirección para propósitos de adopción
    direccion = models.CharField(max_length=200, blank=True)
    ciudad = models.CharField(max_length=100, blank=True)
    estado_provincia = models.CharField(max_length=100, blank=True)
    codigo_postal = models.CharField(max_length=20, blank=True)
    telefono = models.CharField(max_length=20, blank=True)
```

### Mascota

Representa un animal disponible para adopción.

```python
class Mascota(models.Model):
    OPCIONES_ESPECIE = (
        ('gato', 'Gato'),
        ('perro', 'Perro'),
    )
    
    OPCIONES_TAMAÑO = (
        ('pequeno', 'Pequeño'),
        ('mediano', 'Mediano'),
        ('grande', 'Grande'),
    )
    
    OPCIONES_GENERO = (
        ('macho', 'Macho'),
        ('hembra', 'Hembra'),
    )
    
    # Opciones de compatibilidad con niños
    COMPATIBILIDAD_NINOS = (
        ('excelente', 'Excelente con niños de todas las edades'),
        ('bueno', 'Bueno con niños mayores y respetuosos'),
        ('precaucion', 'Puede estar con niños bajo supervisión'),
        ('noRecomendado', 'No recomendado para hogares con niños'),
        ('desconocido', 'No se ha probado con niños'),
    )
    
    # Opciones de compatibilidad con otras mascotas
    COMPATIBILIDAD_MASCOTAS = (
        ('excelente', 'Se lleva bien con todo tipo de mascotas'),
        ('bienConPerros', 'Se lleva bien con perros'),
        ('bienConGatos', 'Se lleva bien con gatos'),
        ('selectivo', 'Selectivo con otras mascotas'),
        ('prefiereSolo', 'Prefiere ser la única mascota'),
        ('desconocido', 'No se ha probado con otras mascotas'),
    )
    
    # Opciones de adaptabilidad a apartamentos
    ADAPTABILIDAD_APARTAMENTO = (
        ('ideal', 'Ideal para apartamento, tranquilo'),
        ('bueno', 'Adecuado para apartamento con ejercicio regular'),
        ('requiereEspacio', 'Necesita espacio y salidas diarias'),
        ('soloConJardin', 'Requiere casa con jardín'),
        ('desconocido', 'No se ha probado en apartamento'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nombre = models.CharField(max_length=100)
    especie = models.CharField(max_length=20, choices=OPCIONES_ESPECIE)
    raza = models.CharField(max_length=100)
    edad = models.PositiveIntegerField(help_text="Edad en años")
    tamano = models.CharField(max_length=10, choices=OPCIONES_TAMAÑO)
    genero = models.CharField(max_length=10, choices=OPCIONES_GENERO)
    foto = models.ImageField(upload_to='fotos_mascotas/')
    
    # Campos de descripción detallada
    temperamento = models.TextField(blank=True, null=True, 
        help_text="Descripción del comportamiento y personalidad de la mascota")
    historia = models.TextField(blank=True, null=True,
        help_text="Historia y antecedentes de la mascota")
        
    # Características de compatibilidad - ahora usando opciones VARCHAR detalladas en lugar de booleanos
    bueno_con_ninos = models.CharField(max_length=20, choices=COMPATIBILIDAD_NINOS, null=True, blank=True) 
    nota_ninos = models.TextField(blank=True, null=True,
        help_text="Notas adicionales sobre comportamiento con niños")
        
    bueno_con_mascotas = models.CharField(max_length=20, choices=COMPATIBILIDAD_MASCOTAS, null=True, blank=True)
    nota_mascotas = models.TextField(blank=True, null=True,
        help_text="Notas adicionales sobre comportamiento con otras mascotas")
        
    bueno_para_apartamento = models.CharField(max_length=20, choices=ADAPTABILIDAD_APARTAMENTO, null=True, blank=True)
    nota_apartamento = models.TextField(blank=True, null=True,
        help_text="Notas adicionales sobre adaptabilidad a apartamentos")
    
    # Estado de salud
    tiene_chip = models.BooleanField(default=False)
    esta_vacunado = models.BooleanField(default=False)
    esta_desparasitado = models.BooleanField(default=False)
    esta_esterilizado = models.BooleanField(default=False)
    
    # Estado de adopción
    esta_adoptado = models.BooleanField(default=False)
    fecha_adopcion = models.DateField(null=True, blank=True)
    adoptador = models.ForeignKey(Usuario, on_delete=models.SET_NULL, null=True, blank=True, related_name='mascotas_adoptadas')
    
    # Información de refugio/organización
    refugio = models.ForeignKey('Refugio', on_delete=models.CASCADE, related_name='mascotas')
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-fecha_creacion']
```

### Refugio

Representa un refugio o organización de rescate animal.

```python
class Refugio(models.Model):
    nombre = models.CharField(max_length=200)
    direccion = models.CharField(max_length=200)
    ciudad = models.CharField(max_length=100)
    estado_provincia = models.CharField(max_length=100)
    codigo_postal = models.CharField(max_length=20)
    telefono = models.CharField(max_length=20)
    email = models.EmailField()
    sitio_web = models.URLField(blank=True, null=True)
    descripcion = models.TextField(blank=True)
    
    # El usuario que administra este perfil de refugio
    administrador = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='refugios_administrados')
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)
```

### Favorito

Registra qué usuarios han marcado como favoritas a qué mascotas.

```python
class Favorito(models.Model):
    mascota = models.ForeignKey(Mascota, related_name='favoritos', on_delete=models.CASCADE)
    usuario = models.ForeignKey(Usuario, related_name='favoritos', on_delete=models.CASCADE)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('mascota', 'usuario')
```

### SolicitudAdopcion

Registra las solicitudes de adopción.

```python
class SolicitudAdopcion(models.Model):
    OPCIONES_ESTADO = (
        ('pendiente', 'Pendiente'),
        ('enRevision', 'En Revisión'),
        ('aprobado', 'Aprobado'),
        ('rechazado', 'Rechazado'),
    )
    
    mascota = models.ForeignKey(Mascota, related_name='solicitudes', on_delete=models.CASCADE)
    usuario = models.ForeignKey(Usuario, related_name='solicitudes', on_delete=models.CASCADE)
    estado = models.CharField(max_length=20, choices=OPCIONES_ESTADO, default='pendiente')
    
    # Detalles de la solicitud
    tipo_vivienda = models.CharField(max_length=100, help_text="Tipo de vivienda (apartamento, casa, etc.)")
    tiene_patio = models.BooleanField(default=False)
    tiene_otras_mascotas = models.BooleanField(default=False)
    detalles_otras_mascotas = models.TextField(blank=True, null=True)
    tiene_ninos = models.BooleanField(default=False)
    edades_ninos = models.CharField(max_length=100, blank=True, null=True)
    
    motivo = models.TextField(help_text="Motivo para querer adoptar esta mascota")
    comentarios_adicionales = models.TextField(blank=True, null=True)
    
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-fecha_creacion']
```

## Endpoints de la API

El frontend espera los siguientes endpoints de API:

### Autenticación

- `POST /api/auth/login/` - Iniciar sesión con un usuario existente
- `POST /api/auth/registro/` - Registrar un nuevo usuario
- `POST /api/auth/logout/` - Cerrar sesión del usuario actual
- `GET /api/auth/usuario/` - Obtener el usuario autenticado actual

### Mascotas

- `GET /api/mascotas/` - Listar todas las mascotas (con paginación y filtros)
- `GET /api/mascotas/:id/` - Obtener una mascota específica por ID
- `POST /api/mascotas/:id/favorito/` - Marcar/desmarcar una mascota como favorita (alternar)
- `GET /api/refugios/:refugioID/mascotas/` - Obtener mascotas de un refugio específico

### Solicitudes de Adopción

- `POST /api/mascotas/:mascotaId/solicitar/` - Enviar una solicitud de adopción
- `GET /api/usuarios/me/solicitudes/` - Obtener las solicitudes del usuario actual
- `GET /api/refugios/:refugioID/solicitudes/` - Obtener solicitudes para las mascotas de un refugio (solo administradores de refugio)

### Refugios

- `GET /api/refugios/` - Listar todos los refugios
- `GET /api/refugios/:id/` - Obtener un refugio específico por ID

### Usuarios

- `GET /api/usuarios/me/` - Obtener el perfil del usuario actual
- `GET /api/usuarios/me/favoritos/` - Obtener las mascotas favoritas del usuario actual

## Detalles de Opciones de Compatibilidad

La aplicación ahora admite opciones detalladas de compatibilidad para una mejor conexión de mascotas con hogares apropiados:

### Bueno con Niños (`bueno_con_ninos`)

| Valor | Significado | Interfaz de Usuario |
|-------|-------------|------------|
| `excelente` | Excelente con niños de todas las edades | ✅ con "Excelente con niños de todas las edades" |
| `bueno` | Bueno con niños mayores y respetuosos | ✅ con "Bueno con niños mayores y respetuosos" |
| `precaucion` | Puede estar con niños pero necesita supervisión | ⚠️ con "Puede estar con niños bajo supervisión" |
| `noRecomendado` | No recomendado para hogares con niños | ❌ con "No recomendado para hogares con niños" |
| `desconocido` | No ha sido probado con niños | ❓ con "No hay datos sobre compatibilidad con niños" |
| `null` | No hay información disponible | ❓ con "No hay datos" |

### Bueno con Otras Mascotas (`bueno_con_mascotas`)

| Valor | Significado | Interfaz de Usuario |
|-------|-------------|------------|
| `excelente` | Se lleva bien con todo tipo de mascotas | ✅ con "Se lleva bien con todo tipo de mascotas" |
| `bienConPerros` | Se lleva bien con perros pero no probado con otros animales | ✅ con "Se lleva bien con perros" |
| `bienConGatos` | Se lleva bien con gatos pero no probado con otros animales | ✅ con "Se lleva bien con gatos" |
| `selectivo` | Se lleva bien con algunas mascotas pero no todas | ⚠️ con "Selectivo con otras mascotas" |
| `prefiereSolo` | Prefiere ser la única mascota | ❌ con "Prefiere ser la única mascota" |
| `desconocido` | No ha sido probado con otras mascotas | ❓ con "No hay datos sobre compatibilidad con mascotas" |
| `null` | No hay información disponible | ❓ con "No hay datos" |

### Bueno para Apartamento (`bueno_para_apartamento`)

| Valor | Significado | Interfaz de Usuario |
|-------|-------------|------------|
| `ideal` | Perfecto para vivir en apartamento, tranquilo y no necesita mucho espacio | ✅ con "Ideal para apartamentos" |
| `bueno` | Adecuado para vivir en apartamento con ejercicio regular | ✅ con "Adecuado para apartamentos con ejercicio regular" |
| `requiereEspacio` | Puede vivir en un apartamento grande pero necesita salidas diarias | ⚠️ con "Necesita espacio y salidas diarias" |
| `soloConJardin` | Necesita una casa con jardín/patio | ❌ con "Requiere casa con jardín" |
| `desconocido` | No ha sido probado en entornos de apartamento | ❓ con "No hay datos sobre compatibilidad con apartamentos" |
| `null` | No hay información disponible | ❓ con "No hay datos" |
