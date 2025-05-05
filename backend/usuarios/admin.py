from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Usuario, Persona, Rol, SistemaLog

class PersonaAdmin(admin.ModelAdmin):
    list_display = ('persona_id', 'nombres', 'apellido_paterno', 'apellido_materno', 'ci', 'telefono', 'email', 'estado')
    list_filter = ('estado',)
    search_fields = ('nombres', 'apellido_paterno', 'apellido_materno', 'ci', 'email')
    ordering = ('apellido_paterno', 'nombres')
    fieldsets = (
        ('Información Personal', {
            'fields': ('nombres', 'apellido_paterno', 'apellido_materno', 'ci', 'telefono', 'direccion')
        }),
        ('Información de Contacto', {
            'fields': ('email',)
        }),
        ('Estado', {
            'fields': ('estado',)
        }),
    )

class UsuarioAdmin(UserAdmin):
    list_display = ('username', 'get_full_name', 'rol', 'is_staff', 'is_superuser', 'ultimo_login', 'estado')
    list_filter = ('estado', 'rol', 'is_staff', 'is_superuser')
    search_fields = ('username', 'persona__nombres', 'persona__apellido_paterno', 'persona__ci')
    ordering = ('username',)
    filter_horizontal = ('groups', 'user_permissions',)
    
    fieldsets = (
        (None, {
            'fields': ('username', 'password')
        }),
        ('Información Personal', {
            'fields': ('persona', 'rol')
        }),
        ('Permisos', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
            'classes': ('collapse',)
        }),
        ('Fechas importantes', {
            'fields': ('ultimo_login',),
            'classes': ('collapse',)
        }),
        ('Estado', {
            'fields': ('estado',)
        }),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'password1', 'password2', 'persona', 'rol'),
        }),
    )
    
    def get_full_name(self, obj):
        return obj.persona.nombre_completo()
    get_full_name.short_description = 'Nombre Completo'

class RolAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'descripcion', 'estado')
    list_filter = ('estado',)
    search_fields = ('nombre', 'descripcion')

class SistemaLogAdmin(admin.ModelAdmin):
    list_display = ('usuario', 'accion', 'tabla', 'fecha', 'ip')
    list_filter = ('tabla', 'fecha')
    search_fields = ('usuario__username', 'accion')
    readonly_fields = ('usuario', 'accion', 'tabla', 'fecha', 'ip')
    
    def has_add_permission(self, request):
        return False
    
    def has_change_permission(self, request, obj=None):
        return False

# Registrar los modelos en el panel de administración
admin.site.register(Usuario, UsuarioAdmin)
admin.site.register(Persona, PersonaAdmin)
admin.site.register(Rol, RolAdmin)
admin.site.register(SistemaLog, SistemaLogAdmin)