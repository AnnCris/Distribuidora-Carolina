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
    logo_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Marca
        fields = ['marca_id', 'nombre', 'descripcion', 'logo', 'logo_url', 'estado']
        read_only_fields = ['marca_id', 'logo_url']
    
    def get_logo_url(self, obj):
        """Retorna la URL completa del logo"""
        if obj.logo and hasattr(obj.logo, 'url'):
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.logo.url)
            return obj.logo.url
        return None
    
    def validate_logo(self, value):
        """Valida el archivo de logo"""
        if value:
            # Validar tamaño del archivo (máximo 5MB)
            if value.size > 5 * 1024 * 1024:
                raise serializers.ValidationError("El archivo no puede ser mayor a 5MB")
            
            # Validar tipo de archivo
            allowed_extensions = ['jpg', 'jpeg', 'png', 'gif', 'webp']
            file_extension = value.name.split('.')[-1].lower()
            if file_extension not in allowed_extensions:
                raise serializers.ValidationError(
                    f"Tipo de archivo no permitido. Use: {', '.join(allowed_extensions)}"
                )
        
        return value

class ProductoSerializer(serializers.ModelSerializer):
    categoria_nombre = serializers.ReadOnlyField(source='categoria.nombre')
    marca_nombre = serializers.ReadOnlyField(source='marca.nombre')
    distribuidora_nombre = serializers.ReadOnlyField(source='distribuidora.nombre')
    imagen_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Producto
        fields = [
            'producto_id', 'categoria', 'categoria_nombre', 'marca', 'marca_nombre',
            'distribuidora', 'distribuidora_nombre', 'nombre', 'descripcion',
            'fecha_vencimiento', 'peso', 'imagen', 'imagen_url', 'estado'
        ]
        read_only_fields = ['producto_id', 'categoria_nombre', 'marca_nombre', 'distribuidora_nombre', 'imagen_url']
    
    def get_imagen_url(self, obj):
        """Retorna la URL completa de la imagen"""
        if obj.imagen and hasattr(obj.imagen, 'url'):
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.imagen.url)
            return obj.imagen.url
        return None
    
    def validate_imagen(self, value):
        """Valida el archivo de imagen"""
        if value:
            # Validar tamaño del archivo (máximo 5MB)
            if value.size > 5 * 1024 * 1024:
                raise serializers.ValidationError("El archivo no puede ser mayor a 5MB")
            
            # Validar tipo de archivo
            allowed_extensions = ['jpg', 'jpeg', 'png', 'gif', 'webp']
            file_extension = value.name.split('.')[-1].lower()
            if file_extension not in allowed_extensions:
                raise serializers.ValidationError(
                    f"Tipo de archivo no permitido. Use: {', '.join(allowed_extensions)}"
                )
        
        return value

class ProductoDetalleSerializer(serializers.ModelSerializer):
    categoria = CategoriaSerializer(read_only=True)
    marca = MarcaSerializer(read_only=True)
    distribuidora = DistribuidoraSerializer(read_only=True)
    imagen_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Producto
        fields = [
            'producto_id', 'categoria', 'marca', 'distribuidora', 'nombre', 
            'descripcion', 'fecha_vencimiento', 'peso', 'imagen', 'imagen_url', 'estado'
        ]
        read_only_fields = ['producto_id', 'imagen_url']
    
    def get_imagen_url(self, obj):
        """Retorna la URL completa de la imagen"""
        if obj.imagen and hasattr(obj.imagen, 'url'):
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.imagen.url)
            return obj.imagen.url
        return None

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