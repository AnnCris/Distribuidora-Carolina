from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DistribuidoraViewSet, CategoriaViewSet, MarcaViewSet, 
    ProductoViewSet, InventarioViewSet
)

router = DefaultRouter()
router.register(r'distribuidoras', DistribuidoraViewSet)
router.register(r'categorias', CategoriaViewSet)
router.register(r'marcas', MarcaViewSet)
router.register(r'productos', ProductoViewSet)
router.register(r'inventario', InventarioViewSet)

urlpatterns = [
    path('', include(router.urls)),
]