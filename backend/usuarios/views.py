from rest_framework import viewsets, status, generics
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone
from django.contrib.auth import authenticate
from .models import Usuario, Persona, Rol, SistemaLog
from .serializers import (
    RegistroUsuarioSerializer, UsuarioDetalleSerializer, UsuarioActualizarSerializer,
    CambioContraseñaSerializer, LoginSerializer, RolSerializer
)

def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip

class RolViewSet(viewsets.ModelViewSet):
    queryset = Rol.objects.all()
    serializer_class = RolSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_destroy(self, instance):
        instance.estado = False
        instance.save()

class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.filter(estado=True)
    serializer_class = UsuarioDetalleSerializer
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return RegistroUsuarioSerializer
        elif self.action == 'update' or self.action == 'partial_update':
            return UsuarioActualizarSerializer
        return UsuarioDetalleSerializer
    
    def get_permissions(self):
        if self.action == 'create':
            return [AllowAny()]
        return [IsAuthenticated()]
    
    def perform_destroy(self, instance):
        instance.estado = False
        instance.save()
        
        # Registro en los logs del sistema
        SistemaLog.objects.create(
            usuario=self.request.user,
            accion=f"Desactivación de usuario: {instance.username}",
            tabla="usuarios",
            ip=get_client_ip(self.request)
        )
    
    def update(self, request, *args, **kwargs):
        """Sobrescribir el método update para mejor manejo de errores"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        
        try:
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            
            # Registro en los logs del sistema
            SistemaLog.objects.create(
                usuario=request.user,
                accion=f"Actualización de usuario: {instance.username}",
                tabla="usuarios",
                ip=get_client_ip(request)
            )
            
            if getattr(instance, '_prefetched_objects_cache', None):
                instance._prefetched_objects_cache = {}
            
            # Recargar la instancia para obtener datos actualizados
            instance.refresh_from_db()
            
            # Usar el serializer de detalle para la respuesta
            response_serializer = UsuarioDetalleSerializer(instance)
            return Response(response_serializer.data)
            
        except serializers.ValidationError as e:
            print(f"Error de validación: {e.detail}")
            print(f"Datos recibidos: {request.data}")
            return Response(e.detail, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(f"Error inesperado en actualización de usuario: {str(e)}")
            print(f"Datos recibidos: {request.data}")
            return Response(
                {'error': 'Error interno del servidor'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def partial_update(self, request, *args, **kwargs):
        """Manejo de actualizaciones parciales"""
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)
    
    @action(detail=True, methods=['post'], serializer_class=CambioContraseñaSerializer)
    def cambiar_password(self, request, pk=None):
        usuario = self.get_object()
        serializer = self.get_serializer(data=request.data)
        
        if serializer.is_valid():
            usuario.set_password(serializer.validated_data['password_nueva'])
            usuario.save()
            
            # Registro en los logs del sistema
            SistemaLog.objects.create(
                usuario=request.user,
                accion=f"Cambio de contraseña para: {usuario.username}",
                tabla="usuarios",
                ip=get_client_ip(request)
            )
            
            return Response({'mensaje': 'Contraseña actualizada correctamente'}, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def perfil(self, request):
        serializer = UsuarioDetalleSerializer(request.user)
        return Response(serializer.data)
class RegistroUsuarioView(generics.CreateAPIView):
    queryset = Usuario.objects.all()
    serializer_class = RegistroUsuarioSerializer
    permission_classes = [AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        usuario = serializer.save()
        
        # Generar tokens JWT
        refresh = RefreshToken.for_user(usuario)
        
        # Actualizar último login
        usuario.ultimo_login = timezone.now()
        usuario.save()
        
        # Registro en los logs del sistema
        SistemaLog.objects.create(
            usuario=usuario,
            accion="Registro de nuevo usuario",
            tabla="usuarios",
            ip=get_client_ip(request)
        )
        
        return Response({
            'usuario': UsuarioDetalleSerializer(usuario).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'mensaje': 'Usuario registrado exitosamente'
        }, status=status.HTTP_201_CREATED)

class LoginView(generics.GenericAPIView):
    serializer_class = LoginSerializer
    permission_classes = [AllowAny]
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Autenticar usuario
        username = serializer.validated_data['username']
        password = serializer.validated_data['password']
        
        user = authenticate(username=username, password=password)
        
        if user is None:
            return Response({'error': 'Credenciales inválidas'}, status=status.HTTP_401_UNAUTHORIZED)
        
        if not user.estado:
            return Response({'error': 'Este usuario ha sido desactivado'}, status=status.HTTP_401_UNAUTHORIZED)
        
        # Actualizar último login
        user.ultimo_login = timezone.now()
        user.save()
        
        # Generar tokens JWT
        refresh = RefreshToken.for_user(user)
        
        # Registro en los logs del sistema
        SistemaLog.objects.create(
            usuario=user,
            accion="Inicio de sesión",
            tabla="usuarios",
            ip=get_client_ip(request)
        )
        
        return Response({
            'usuario': UsuarioDetalleSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'mensaje': 'Inicio de sesión exitoso'
        }, status=status.HTTP_200_OK)

class LogoutView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        # Registro en los logs del sistema
        SistemaLog.objects.create(
            usuario=request.user,
            accion="Cierre de sesión",
            tabla="usuarios",
            ip=get_client_ip(request)
        )
        
        return Response({'mensaje': 'Sesión cerrada exitosamente'}, status=status.HTTP_200_OK)