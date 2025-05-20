from django.db import models

class DistribuidoraManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset()

class Distribuidora(models.Model):
    distribuidora_id = models.AutoField(primary_key=True, db_column='distribuidora_id', verbose_name='ID de Distribuidora')
    nombre = models.CharField(max_length=50, verbose_name='Nombre')
    nit = models.CharField(max_length=50, verbose_name='NIT')
    direccion = models.CharField(max_length=255, verbose_name='Dirección')
    telefono = models.CharField(max_length=8, verbose_name='Teléfono')
    email = models.CharField(max_length=255, verbose_name='Email')
    logo_url = models.CharField(max_length=255, verbose_name='URL del Logo', null=True, blank=True)
    descripcion = models.CharField(max_length=255, verbose_name='Descripción')
    
    objects = DistribuidoraManager()
    
    class Meta:
        verbose_name = 'Distribuidora'
        verbose_name_plural = 'Distribuidoras'
        db_table = 'distribuidora'
    
    def __str__(self):
        return self.nombre

class CategoriaManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(estado=True)

class Categoria(models.Model):
    categoria_id = models.AutoField(primary_key=True, db_column='categoria_id', verbose_name='ID de Categoría')
    nombre = models.CharField(max_length=50, verbose_name='Nombre de la Categoría')
    descripcion = models.CharField(max_length=255, verbose_name='Descripción')
    estado = models.BooleanField(default=True, verbose_name='Estado Activo')
    
    objects = CategoriaManager()
    
    class Meta:
        verbose_name = 'Categoría'
        verbose_name_plural = 'Categorías'
        db_table = 'categorias'
    
    def __str__(self):
        return self.nombre

class MarcaManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(estado=True)

class Marca(models.Model):
    marca_id = models.AutoField(primary_key=True, db_column='marca_id', verbose_name='ID de Marca')
    nombre = models.CharField(max_length=50, verbose_name='Nombre de la Marca')
    descripcion = models.CharField(max_length=255, verbose_name='Descripción')
    logo_url = models.CharField(max_length=255, verbose_name='URL del Logo', null=True, blank=True)
    estado = models.BooleanField(default=True, verbose_name='Estado Activo')
    
    objects = MarcaManager()
    
    class Meta:
        verbose_name = 'Marca'
        verbose_name_plural = 'Marcas'
        db_table = 'marcas'
    
    def __str__(self):
        return self.nombre

class ProductoManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(estado=True)

class Producto(models.Model):
    producto_id = models.AutoField(primary_key=True, db_column='producto_id', verbose_name='ID de Producto')
    categoria = models.ForeignKey(Categoria, on_delete=models.CASCADE, related_name='productos', db_column='categoria_id')
    marca = models.ForeignKey(Marca, on_delete=models.CASCADE, related_name='productos', db_column='marca_id')
    distribuidora = models.ForeignKey(Distribuidora, on_delete=models.CASCADE, related_name='productos', db_column='distribuidora_id')
    nombre = models.CharField(max_length=100, verbose_name='Nombre del Producto')
    descripcion = models.CharField(max_length=255, verbose_name='Descripción')
    fecha_vencimiento = models.DateTimeField(null=True, blank=True, verbose_name='Fecha de Vencimiento')
    peso = models.CharField(max_length=50, verbose_name='Peso/Volumen')
    imagen_url = models.CharField(max_length=255, verbose_name='URL de la Imagen', null=True, blank=True)
    estado = models.BooleanField(default=True, verbose_name='Estado Activo')
    
    objects = ProductoManager()
    
    class Meta:
        verbose_name = 'Producto'
        verbose_name_plural = 'Productos'
        db_table = 'productos'
    
    def __str__(self):
        return self.nombre

class InventarioManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset()

class Inventario(models.Model):
    inventario_id = models.AutoField(primary_key=True, db_column='inventario_id', verbose_name='ID de Inventario')
    producto = models.OneToOneField(Producto, on_delete=models.CASCADE, related_name='inventario', db_column='producto_id')
    stock_actual = models.IntegerField(default=0, verbose_name='Stock Actual')
    stock_minimo = models.IntegerField(default=0, verbose_name='Stock Mínimo')
    ultima_actualizacion = models.DateTimeField(auto_now=True, verbose_name='Última Actualización')
    
    objects = InventarioManager()
    
    class Meta:
        verbose_name = 'Inventario'
        verbose_name_plural = 'Inventarios'
        db_table = 'inventario'
    
    def __str__(self):
        return f"Inventario de {self.producto.nombre}"