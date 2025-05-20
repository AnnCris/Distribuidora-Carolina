from rest_framework import serializers
from .models import Distribuidora, Categoria, Marca, Producto, Inventario

class DistribuidoraSerializer(serializers.ModelSerializer):
    class Meta:
        model = Distribuidora
        fields = ['distribuidora_id', 'nombre', 'nit', 'direccion', 'telefono', 'email', 'logo_url', 'descripcion']
        read_only_fields = ['distribuidora_id']

class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = ['categoria_id', 'nombre', 'descripcion', 'estado']
        read_only_fields = ['categoria_id']

class MarcaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Marca
        fields = ['marca_id', 'nombre', 'descripcion', 'logo_url', 'estado']
        read_only_fields = ['marca_id']

class ProductoSerializer(serializers.ModelSerializer):
    categoria_nombre = serializers.ReadOnlyField(source='categoria.nombre')
    marca_nombre = serializers.ReadOnlyField(source='marca.nombre')
    distribuidora_nombre = serializers.ReadOnlyField(source='distribuidora.nombre')
    
    class Meta:
        model = Producto
        fields = [
            'producto_id', 'categoria', 'categoria_nombre', 'marca', 'marca_nombre',
            'distribuidora', 'distribuidora_nombre', 'nombre', 'descripcion',
            'fecha_vencimiento', 'peso', 'imagen_url', 'estado'
        ]
        read_only_fields = ['producto_id', 'categoria_nombre', 'marca_nombre', 'distribuidora_nombre']

class ProductoDetalleSerializer(serializers.ModelSerializer):
    categoria = CategoriaSerializer(read_only=True)
    marca = MarcaSerializer(read_only=True)
    distribuidora = DistribuidoraSerializer(read_only=True)
    
    class Meta:
        model = Producto
        fields = [
            'producto_id', 'categoria', 'marca', 'distribuidora', 'nombre', 
            'descripcion', 'fecha_vencimiento', 'peso', 'imagen_url', 'estado'
        ]
        read_only_fields = ['producto_id']

class InventarioSerializer(serializers.ModelSerializer):
    producto_nombre = serializers.ReadOnlyField(source='producto.nombre')
    
    class Meta:
        model = Inventario
        fields = ['inventario_id', 'producto', 'producto_nombre', 'stock_actual', 'stock_minimo', 'ultima_actualizacion']
        read_only_fields = ['inventario_id', 'producto_nombre', 'ultima_actualizacion']

class InventarioDetalleSerializer(serializers.ModelSerializer):
    producto = ProductoSerializer(read_only=True)
    
    class Meta:
        model = Inventario
        fields = ['inventario_id', 'producto', 'stock_actual', 'stock_minimo', 'ultima_actualizacion']
        read_only_fields = ['inventario_id', 'ultima_actualizacion']