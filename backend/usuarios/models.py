from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone

class RolManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(estado=True)

class Rol(models.Model):
    rol_id = models.AutoField(primary_key=True, db_column='rol_id', verbose_name='ID del Rol')
    nombre = models.CharField(max_length=20, verbose_name='Nombre del Rol')
    descripcion = models.CharField(max_length=100, verbose_name='Descripción del Rol')
    estado = models.BooleanField(default=True, verbose_name='Estado Activo')
    
    objects = RolManager()
    
    class Meta:
        verbose_name = 'Rol'
        verbose_name_plural = 'Roles'
        db_table = 'roles'
    
    def __str__(self):
        return self.nombre

class PersonaManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(estado=True)

class Persona(models.Model):
    persona_id = models.AutoField(primary_key=True, db_column='persona_id', verbose_name='ID de Persona')
    nombres = models.CharField(max_length=255, verbose_name='Nombres')
    apellido_paterno = models.CharField(max_length=255, verbose_name='Apellido Paterno')
    apellido_materno = models.CharField(max_length=255, blank=True, null=True, verbose_name='Apellido Materno')
    telefono = models.CharField(max_length=8, verbose_name='Teléfono')
    direccion = models.CharField(max_length=255, verbose_name='Dirección')
    email = models.EmailField(max_length=255, unique=True, verbose_name='Correo Electrónico')
    ci = models.CharField(max_length=20, unique=True, verbose_name='Carnet de Identidad')
    fecha_registro = models.DateTimeField(default=timezone.now, verbose_name='Fecha de Registro')
    estado = models.BooleanField(default=True, verbose_name='Estado Activo')
    
    objects = PersonaManager()
    
    class Meta:
        verbose_name = 'Persona'
        verbose_name_plural = 'Personas'
        db_table = 'persona'
    
    def __str__(self):
        return f"{self.nombres} {self.apellido_paterno} {self.apellido_materno}"
    
    def nombre_completo(self):
        return f"{self.nombres} {self.apellido_paterno} {self.apellido_materno if self.apellido_materno else ''}".strip()

class UsuarioManager(BaseUserManager):
    def create_user(self, username, password=None, **extra_fields):
        if not username:
            raise ValueError('El nombre de usuario es obligatorio')
        
        user = self.model(
            username=username,
            **extra_fields
        )
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, username, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser debe tener is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser debe tener is_superuser=True.')
        
        return self.create_user(username, password, **extra_fields)
    
    def get_queryset(self):
        return super().get_queryset().filter(estado=True)

class Usuario(AbstractBaseUser, PermissionsMixin):
    usuario_id = models.AutoField(primary_key=True, db_column='usuario_id', verbose_name='ID de Usuario')
    persona = models.OneToOneField(Persona, on_delete=models.CASCADE, related_name='usuario', verbose_name='Persona')
    rol = models.ForeignKey(Rol, on_delete=models.CASCADE, related_name='usuarios', verbose_name='Rol')
    username = models.CharField(max_length=20, unique=True, verbose_name='Nombre de Usuario')
    password = models.CharField(max_length=128, verbose_name='Contraseña')
    ultimo_login = models.DateTimeField(blank=True, null=True, verbose_name='Último Acceso')
    estado = models.BooleanField(default=True, verbose_name='Estado Activo')
    is_staff = models.BooleanField(default=False, verbose_name='Es Staff')
    is_superuser = models.BooleanField(default=False, verbose_name='Es Superusuario')
    
    objects = UsuarioManager()
    
    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = []
    
    class Meta:
        verbose_name = 'Usuario'
        verbose_name_plural = 'Usuarios'
        db_table = 'usuarios'
    
    def __str__(self):
        return self.username
    
    def get_full_name(self):
        return self.persona.nombre_completo()
    
    def get_short_name(self):
        return self.username

class SistemaLog(models.Model):
    log_id = models.AutoField(primary_key=True, db_column='log_id', verbose_name='ID de Log')
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='logs', verbose_name='Usuario')
    accion = models.CharField(max_length=255, verbose_name='Acción Realizada')
    tabla = models.CharField(max_length=100, verbose_name='Tabla Afectada')
    fecha = models.DateTimeField(auto_now_add=True, verbose_name='Fecha y Hora')
    ip = models.GenericIPAddressField(verbose_name='Dirección IP')
    
    class Meta:
        verbose_name = 'Log del Sistema'
        verbose_name_plural = 'Logs del Sistema'
        db_table = 'sistema_logs'
    
    def __str__(self):
        return f"{self.usuario.username} - {self.accion} - {self.fecha}"