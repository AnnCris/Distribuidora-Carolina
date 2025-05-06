from django.contrib import admin
from .models import Distribuidora, Categoria, Marca, Producto, Inventario

class DistribuidoraAdmin(admin.ModelAdmin):
    list_display = ('distribuidora_id', 'nombre', 'nit', 'telefono', 'email')
    search_fields = ('nombre', 'nit', 'email')

class CategoriaAdmin(admin.ModelAdmin):
    list_display = ('categoria_id', 'nombre', 'descripcion', 'estado')
    list_filter = ('estado',)
    search_fields = ('nombre', 'descripcion')

class MarcaAdmin(admin.ModelAdmin):
    list_display = ('marca_id', 'nombre', 'descripcion', 'estado')
    list_filter = ('estado',)
    search_fields = ('nombre', 'descripcion')

class ProductoAdmin(admin.ModelAdmin):
    list_display = ('producto_id', 'nombre', 'get_categoria', 'get_marca', 'get_distribuidora', 'peso', 'fecha_vencimiento', 'estado')
    list_filter = ('categoria', 'marca', 'distribuidora', 'estado')
    search_fields = ('nombre', 'descripcion')
    
    def get_categoria(self, obj):
        return obj.categoria.nombre
    get_categoria.short_description = 'Categoría'
    
    def get_marca(self, obj):
        return obj.marca.nombre
    get_marca.short_description = 'Marca'
    
    def get_distribuidora(self, obj):
        return obj.distribuidora.nombre
    get_distribuidora.short_description = 'Distribuidora'

class InventarioAdmin(admin.ModelAdmin):
    list_display = ('inventario_id', 'get_producto', 'stock_actual', 'stock_minimo', 'ultima_actualizacion')
    list_filter = ('stock_actual', 'stock_minimo')
    search_fields = ('producto__nombre',)
    
    def get_producto(self, obj):
        return obj.producto.nombre
    get_producto.short_description = 'Producto'

# Registrar los modelos en el panel de administración
admin.site.register(Distribuidora, DistribuidoraAdmin)
admin.site.register(Categoria, CategoriaAdmin)
admin.site.register(Marca, MarcaAdmin)
admin.site.register(Producto, ProductoAdmin)
admin.site.register(Inventario, InventarioAdmin)