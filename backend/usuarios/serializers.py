from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.core import exceptions
from .models import Persona, Rol, Usuario
import re

class RolSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rol
        fields = ['rol_id', 'nombre', 'descripcion', 'estado']
        read_only_fields = ['rol_id']

class PersonaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Persona
        fields = [
            'persona_id', 'nombres', 'apellido_paterno', 'apellido_materno',
            'telefono', 'direccion', 'email', 'ci', 'fecha_registro', 'estado'
        ]
        read_only_fields = ['persona_id', 'fecha_registro']
    
    def validate_nombres(self, value):
        if not value.strip():
            raise serializers.ValidationError("El nombre no puede estar vacío")
        return value
    
    def validate_apellido_paterno(self, value):
        if not value.strip():
            raise serializers.ValidationError("El apellido paterno no puede estar vacío")
        return value
    
    def validate_telefono(self, value):
        if not re.match(r'^\d{8}$', value):
            raise serializers.ValidationError("El teléfono debe tener 8 dígitos")
        return value
    
    def validate_ci(self, value):
        if not re.match(r'^[0-9]+-[0-9A-Z]{2}$|^[0-9]+$', value):
            raise serializers.ValidationError("El CI debe tener un formato válido (ej: 12345678 o 12345678-LP)")
        return value
    
    def validate_email(self, value):
        # Solo validar unicidad durante creación, no durante actualización
        if self.instance is None:  # Creación
            if Usuario.objects.filter(persona__email=value).exists():
                raise serializers.ValidationError("Este correo electrónico ya está registrado")
        else:  # Actualización
            # Verificar que el email no exista en otros usuarios (excluir el actual)
            existing_user = Usuario.objects.filter(persona__email=value).exclude(persona=self.instance).first()
            if existing_user:
                raise serializers.ValidationError("Este correo electrónico ya está registrado")
        return value

class RegistroUsuarioSerializer(serializers.ModelSerializer):
    persona = PersonaSerializer()
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    password2 = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    rol = serializers.PrimaryKeyRelatedField(queryset=Rol.objects.all())
    
    class Meta:
        model = Usuario
        fields = ['usuario_id', 'username', 'password', 'password2', 'persona', 'rol', 'estado']
        read_only_fields = ['usuario_id']
    
    def validate_username(self, value):
        if not re.match(r'^[a-zA-Z0-9_]{4,20}$', value):
            raise serializers.ValidationError(
                "El nombre de usuario debe tener entre 4 y 20 caracteres y solo puede contener letras, números y guiones bajos"
            )
        return value
    
    def validate_password(self, value):
        if len(value) < 8:
            raise serializers.ValidationError("La contraseña debe tener al menos 8 caracteres")
        
        if not re.search(r'[A-Z]', value):
            raise serializers.ValidationError("La contraseña debe contener al menos una letra mayúscula")
        
        if not re.search(r'[a-z]', value):
            raise serializers.ValidationError("La contraseña debe contener al menos una letra minúscula")
        
        if not re.search(r'[0-9]', value):
            raise serializers.ValidationError("La contraseña debe contener al menos un número")
        
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', value):
            raise serializers.ValidationError("La contraseña debe contener al menos un carácter especial")
        
        try:
            validate_password(value)
        except exceptions.ValidationError as e:
            raise serializers.ValidationError(list(e.messages))
        
        return value
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Las contraseñas no coinciden"})
        
        return attrs
    
    def create(self, validated_data):
        persona_data = validated_data.pop('persona')
        password = validated_data.pop('password')
        validated_data.pop('password2')
        
        # Crear la persona
        persona = Persona.objects.create(**persona_data)
        
        # Crear el usuario
        usuario = Usuario.objects.create(
            persona=persona,
            **validated_data
        )
        
        usuario.set_password(password)
        usuario.save()
        
        return usuario

class UsuarioDetalleSerializer(serializers.ModelSerializer):
    persona = PersonaSerializer(read_only=True)
    rol = RolSerializer(read_only=True)
    
    class Meta:
        model = Usuario
        fields = ['usuario_id', 'username', 'persona', 'rol', 'ultimo_login', 'estado']
        read_only_fields = ['usuario_id', 'username', 'ultimo_login']

class UsuarioActualizarSerializer(serializers.ModelSerializer):
    # Campos de persona como campos directos sin source para evitar problemas
    nombres = serializers.CharField(max_length=255)
    apellido_paterno = serializers.CharField(max_length=255)
    apellido_materno = serializers.CharField(max_length=255, required=False, allow_blank=True)
    telefono = serializers.CharField(max_length=8)
    direccion = serializers.CharField(max_length=255)
    email = serializers.EmailField(max_length=255)
    ci = serializers.CharField(max_length=20)
    password = serializers.CharField(write_only=True, required=False, allow_blank=True, style={'input_type': 'password'})
    
    class Meta:
        model = Usuario
        fields = [
            'usuario_id', 'username', 'rol', 'estado', 'password',
            'nombres', 'apellido_paterno', 'apellido_materno', 
            'telefono', 'direccion', 'email', 'ci'
        ]
        read_only_fields = ['usuario_id']
    
    def validate_nombres(self, value):
        if not value.strip():
            raise serializers.ValidationError("El nombre no puede estar vacío")
        return value
    
    def validate_apellido_paterno(self, value):
        if not value.strip():
            raise serializers.ValidationError("El apellido paterno no puede estar vacío")
        return value
    
    def validate_telefono(self, value):
        if not re.match(r'^\d{8}$', value):
            raise serializers.ValidationError("El teléfono debe tener 8 dígitos")
        return value
    
    def validate_ci(self, value):
        if not re.match(r'^[0-9]+-[0-9A-Z]{2}$|^[0-9]+$', value):
            raise serializers.ValidationError("El CI debe tener un formato válido (ej: 12345678 o 12345678-LP)")
        
        # Verificar que el CI no exista en otras personas (excluir la actual)
        if self.instance:
            if Persona.objects.filter(ci=value).exclude(pk=self.instance.persona.pk).exists():
                raise serializers.ValidationError("Este carnet de identidad ya está registrado")
        return value
    
    def validate_email(self, value):
        # Verificar que el email no exista en otros usuarios (excluir el actual)
        if self.instance:
            existing_user = Usuario.objects.filter(persona__email=value).exclude(pk=self.instance.pk).first()
            if existing_user:
                raise serializers.ValidationError("Este correo electrónico ya está registrado")
        return value
    
    def validate_password(self, value):
        # Solo validar si se proporciona una nueva contraseña
        if value and value.strip():
            if len(value) < 8:
                raise serializers.ValidationError("La contraseña debe tener al menos 8 caracteres")
            
            if not re.search(r'[A-Z]', value):
                raise serializers.ValidationError("La contraseña debe contener al menos una letra mayúscula")
            
            if not re.search(r'[a-z]', value):
                raise serializers.ValidationError("La contraseña debe contener al menos una letra minúscula")
            
            if not re.search(r'[0-9]', value):
                raise serializers.ValidationError("La contraseña debe contener al menos un número")
            
            if not re.search(r'[!@#$%^&*(),.?":{}|<>]', value):
                raise serializers.ValidationError("La contraseña debe contener al menos un carácter especial")
            
            try:
                validate_password(value)
            except exceptions.ValidationError as e:
                raise serializers.ValidationError(list(e.messages))
        
        return value
    
    def update(self, instance, validated_data):
        # Extraer contraseña
        password = validated_data.pop('password', None)
        
        # Extraer campos de persona
        persona_fields = ['nombres', 'apellido_paterno', 'apellido_materno', 'telefono', 'direccion', 'email', 'ci']
        persona_data = {}
        
        for field in persona_fields:
            if field in validated_data:
                persona_data[field] = validated_data.pop(field)
        
        # Actualizar datos de la persona
        if persona_data:
            persona_instance = instance.persona
            for attr, value in persona_data.items():
                setattr(persona_instance, attr, value)
            persona_instance.save()
        
        # Actualizar contraseña si se proporciona
        if password and password.strip():
            instance.set_password(password)
        
        # Actualizar otros campos del usuario
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance
    
    def to_representation(self, instance):
        """Personalizar la representación para incluir datos de persona"""
        data = super().to_representation(instance)
        
        # Agregar datos de persona
        if instance.persona:
            data['nombres'] = instance.persona.nombres
            data['apellido_paterno'] = instance.persona.apellido_paterno
            data['apellido_materno'] = instance.persona.apellido_materno
            data['telefono'] = instance.persona.telefono
            data['direccion'] = instance.persona.direccion
            data['email'] = instance.persona.email
            data['ci'] = instance.persona.ci
        
        return data

class CambioContraseñaSerializer(serializers.Serializer):
    password_actual = serializers.CharField(required=True, write_only=True, style={'input_type': 'password'})
    password_nueva = serializers.CharField(required=True, write_only=True, style={'input_type': 'password'})
    password_confirmacion = serializers.CharField(required=True, write_only=True, style={'input_type': 'password'})
    
    def validate_password_nueva(self, value):
        if len(value) < 8:
            raise serializers.ValidationError("La contraseña debe tener al menos 8 caracteres")
        
        if not re.search(r'[A-Z]', value):
            raise serializers.ValidationError("La contraseña debe contener al menos una letra mayúscula")
        
        if not re.search(r'[a-z]', value):
            raise serializers.ValidationError("La contraseña debe contener al menos una letra minúscula")
        
        if not re.search(r'[0-9]', value):
            raise serializers.ValidationError("La contraseña debe contener al menos un número")
        
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', value):
            raise serializers.ValidationError("La contraseña debe contener al menos un carácter especial")
        
        try:
            validate_password(value)
        except exceptions.ValidationError as e:
            raise serializers.ValidationError(list(e.messages))
        
        return value
    
    def validate(self, attrs):
        if attrs['password_nueva'] != attrs['password_confirmacion']:
            raise serializers.ValidationError({"password_confirmacion": "Las contraseñas no coinciden"})
        
        user = self.context['request'].user
        if not user.check_password(attrs['password_actual']):
            raise serializers.ValidationError({"password_actual": "La contraseña actual es incorrecta"})
        
        return attrs

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=20, required=True)
    password = serializers.CharField(max_length=128, required=True, write_only=True, style={'input_type': 'password'})