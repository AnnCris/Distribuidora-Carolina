from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from django.db import models
from .models import Distribuidora, Categoria, Marca, Producto, Inventario
from .serializers import (
    DistribuidoraSerializer, CategoriaSerializer, MarcaSerializer, 
    ProductoSerializer, ProductoDetalleSerializer,
    InventarioSerializer, InventarioDetalleSerializer
)
from usuarios.models import SistemaLog

def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip

class DistribuidoraViewSet(viewsets.ModelViewSet):
    queryset = Distribuidora.objects.all()
    serializer_class = DistribuidoraSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        distribuidora = serializer.save()
        # Registrar en el log del sistema
        SistemaLog.objects.create(
            usuario=self.request.user,
            accion=f"Creación de distribuidora: {distribuidora.nombre}",
            tabla="distribuidora",
            ip=get_client_ip(self.request)
        )
    
    def perform_update(self, serializer):
        distribuidora = serializer.save()
        # Registrar en el log del sistema
        SistemaLog.objects.create(
            usuario=self.request.user,
            accion=f"Actualización de distribuidora: {distribuidora.nombre}",
            tabla="distribuidora",
            ip=get_client_ip(self.request)
        )

class CategoriaViewSet(viewsets.ModelViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        categoria = serializer.save()
        # Registrar en el log del sistema
        SistemaLog.objects.create(
            usuario=self.request.user,
            accion=f"Creación de categoría: {categoria.nombre}",
            tabla="categorias",
            ip=get_client_ip(self.request)
        )
    
    def perform_update(self, serializer):
        categoria = serializer.save()
        # Registrar en el log del sistema
        SistemaLog.objects.create(
            usuario=self.request.user,
            accion=f"Actualización de categoría: {categoria.nombre}",
            tabla="categorias",
            ip=get_client_ip(self.request)
        )
    
    def perform_destroy(self, instance):
        nombre = instance.nombre
        instance.estado = False
        instance.save()
        # Registrar en el log del sistema
        SistemaLog.objects.create(
            usuario=self.request.user,
            accion=f"Desactivación de categoría: {nombre}",
            tabla="categorias",
            ip=get_client_ip(self.request)
        )

class MarcaViewSet(viewsets.ModelViewSet):
    queryset = Marca.objects.all()
    serializer_class = MarcaSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        marca = serializer.save()
        # Registrar en el log del sistema
        SistemaLog.objects.create(
            usuario=self.request.user,
            accion=f"Creación de marca: {marca.nombre}",
            tabla="marcas",
            ip=get_client_ip(self.request)
        )
    
    def perform_update(self, serializer):
        marca = serializer.save()
        # Registrar en el log del sistema
        SistemaLog.objects.create(
            usuario=self.request.user,
            accion=f"Actualización de marca: {marca.nombre}",
            tabla="marcas",
            ip=get_client_ip(self.request)
        )
    
    def perform_destroy(self, instance):
        nombre = instance.nombre
        instance.estado = False
        instance.save()
        # Registrar en el log del sistema
        SistemaLog.objects.create(
            usuario=self.request.user,
            accion=f"Desactivación de marca: {nombre}",
            tabla="marcas",
            ip=get_client_ip(self.request)
        )

class ProductoViewSet(viewsets.ModelViewSet):
    queryset = Producto.objects.all()
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ProductoDetalleSerializer
        return ProductoSerializer
    
    def perform_create(self, serializer):
        producto = serializer.save()
        # Crear entrada en inventario automáticamente
        Inventario.objects.create(
            producto=producto,
            stock_actual=0,
            stock_minimo=0
        )
        # Registrar en el log del sistema
        SistemaLog.objects.create(
            usuario=self.request.user,
            accion=f"Creación de producto: {producto.nombre}",
            tabla="productos",
            ip=get_client_ip(self.request)
        )
    
    def perform_update(self, serializer):
        producto = serializer.save()
        # Registrar en el log del sistema
        SistemaLog.objects.create(
            usuario=self.request.user,
            accion=f"Actualización de producto: {producto.nombre}",
            tabla="productos",
            ip=get_client_ip(self.request)
        )
    
    def perform_destroy(self, instance):
        nombre = instance.nombre
        instance.estado = False
        instance.save()
        # Registrar en el log del sistema
        SistemaLog.objects.create(
            usuario=self.request.user,
            accion=f"Desactivación de producto: {nombre}",
            tabla="productos",
            ip=get_client_ip(self.request)
        )
    
    @action(detail=False, methods=['get'])
    def por_categoria(self, request):
        categoria_id = request.query_params.get('categoria_id')
        if categoria_id:
            productos = self.queryset.filter(categoria_id=categoria_id)
            serializer = self.get_serializer(productos, many=True)
            return Response(serializer.data)
        return Response({"error": "Debe proporcionar un ID de categoría"}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def por_marca(self, request):
        marca_id = request.query_params.get('marca_id')
        if marca_id:
            productos = self.queryset.filter(marca_id=marca_id)
            serializer = self.get_serializer(productos, many=True)
            return Response(serializer.data)
        return Response({"error": "Debe proporcionar un ID de marca"}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def buscar(self, request):
        query = request.query_params.get('q', '')
        if query:
            productos = self.queryset.filter(
                models.Q(nombre__icontains=query) | 
                models.Q(descripcion__icontains=query)
            )
            serializer = self.get_serializer(productos, many=True)
            return Response(serializer.data)
        return Response({"error": "Debe proporcionar un término de búsqueda"}, status=status.HTTP_400_BAD_REQUEST)

class InventarioViewSet(viewsets.ModelViewSet):
    queryset = Inventario.objects.all()
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return InventarioDetalleSerializer
        return InventarioSerializer
    
    def perform_update(self, serializer):
        inventario = serializer.save()
        # Registrar en el log del sistema
        SistemaLog.objects.create(
            usuario=self.request.user,
            accion=f"Actualización de inventario para producto: {inventario.producto.nombre}",
            tabla="inventario",
            ip=get_client_ip(self.request)
        )
    
    @action(detail=False, methods=['get'])
    def stock_bajo(self, request):
        """Obtener productos con stock por debajo del mínimo"""
        inventarios = self.queryset.filter(stock_actual__lt=models.F('stock_minimo'))
        serializer = self.get_serializer(inventarios, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def ajustar_stock(self, request, pk=None):
        """Ajustar el stock de un producto"""
        inventario = self.get_object()
        
        cantidad = request.data.get('cantidad', None)
        if cantidad is None:
            return Response(
                {"error": "Debe proporcionar una cantidad"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            cantidad = int(cantidad)
        except ValueError:
            return Response(
                {"error": "La cantidad debe ser un número entero"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        inventario.stock_actual += cantidad
        if inventario.stock_actual < 0:
            inventario.stock_actual = 0
            
        inventario.save()
        
        # Registrar en el log del sistema
        accion = "incremento" if cantidad > 0 else "decremento"
        SistemaLog.objects.create(
            usuario=self.request.user,
            accion=f"{accion.capitalize()} de stock ({abs(cantidad)}) para producto: {inventario.producto.nombre}",
            tabla="inventario",
            ip=get_client_ip(self.request)
        )
        
        return Response({
            "mensaje": f"Stock ajustado correctamente. Nuevo stock: {inventario.stock_actual}",
            "stock_actual": inventario.stock_actual
        })