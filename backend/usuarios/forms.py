
from django import forms
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from .models import Usuario, Persona
import re

class PersonaForm(forms.ModelForm):
    class Meta:
        model = Persona
        fields = [
            'nombres', 'apellido_paterno', 'apellido_materno',
            'telefono', 'direccion', 'email', 'ci'
        ]
        widgets = {
            'nombres': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Nombres'}),
            'apellido_paterno': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Apellido Paterno'}),
            'apellido_materno': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Apellido Materno'}),
            'telefono': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Teléfono (8 dígitos)'}),
            'direccion': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Dirección'}),
            'email': forms.EmailInput(attrs={'class': 'form-control', 'placeholder': 'Correo Electrónico'}),
            'ci': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Carnet de Identidad (ej: 12345678 o 12345678-LP)'}),
        }
    
    def clean_nombres(self):
        nombres = self.cleaned_data.get('nombres')
        if not nombres.strip():
            raise forms.ValidationError("El nombre no puede estar vacío")
        return nombres
    
    def clean_apellido_paterno(self):
        apellido = self.cleaned_data.get('apellido_paterno')
        if not apellido.strip():
            raise forms.ValidationError("El apellido paterno no puede estar vacío")
        return apellido
    
    def clean_telefono(self):
        telefono = self.cleaned_data.get('telefono')
        if not re.match(r'^\d{8}$', telefono):
            raise forms.ValidationError("El teléfono debe tener 8 dígitos")
        return telefono
    
    def clean_ci(self):
        ci = self.cleaned_data.get('ci')
        if not re.match(r'^[0-9]+-[0-9A-Z]{2}$|^[0-9]+$', ci):
            raise forms.ValidationError("El CI debe tener un formato válido (ej: 12345678 o 12345678-LP)")
        return ci

class RegistroUsuarioForm(UserCreationForm):
    password1 = forms.CharField(
        label="Contraseña",
        strip=False,
        widget=forms.PasswordInput(attrs={'class': 'form-control', 'placeholder': 'Contraseña'}),
        help_text="La contraseña debe tener al menos 8 caracteres, incluyendo mayúsculas, minúsculas, números y caracteres especiales.",
    )
    password2 = forms.CharField(
        label="Confirmar contraseña",
        widget=forms.PasswordInput(attrs={'class': 'form-control', 'placeholder': 'Confirmar Contraseña'}),
        strip=False,
        help_text="Ingrese la misma contraseña que antes, para verificación.",
    )
    
    class Meta:
        model = Usuario
        fields = ['username', 'rol']
        widgets = {
            'username': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Nombre de Usuario'}),
            'rol': forms.Select(attrs={'class': 'form-select'}),
        }
    
    def clean_username(self):
        username = self.cleaned_data.get('username')
        if not re.match(r'^[a-zA-Z0-9_]{4,20}$', username):
            raise forms.ValidationError(
                "El nombre de usuario debe tener entre 4 y 20 caracteres y solo puede contener letras, números y guiones bajos"
            )
        return username
    
    def clean_password1(self):
        password = self.cleaned_data.get('password1')
        
        if len(password) < 8:
            raise forms.ValidationError("La contraseña debe tener al menos 8 caracteres")
        
        if not re.search(r'[A-Z]', password):
            raise forms.ValidationError("La contraseña debe contener al menos una letra mayúscula")
        
        if not re.search(r'[a-z]', password):
            raise forms.ValidationError("La contraseña debe contener al menos una letra minúscula")
        
        if not re.search(r'[0-9]', password):
            raise forms.ValidationError("La contraseña debe contener al menos un número")
        
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            raise forms.ValidationError("La contraseña debe contener al menos un carácter especial")
        
        return password

class LoginForm(AuthenticationForm):
    username = forms.CharField(
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Nombre de Usuario'})
    )
    password = forms.CharField(
        widget=forms.PasswordInput(attrs={'class': 'form-control', 'placeholder': 'Contraseña'})
    )

class CambioPasswordForm(forms.Form):
    password_actual = forms.CharField(
        label="Contraseña actual",
        strip=False,
        widget=forms.PasswordInput(attrs={'class': 'form-control', 'placeholder': 'Contraseña actual'}),
    )
    password_nueva = forms.CharField(
        label="Nueva contraseña",
        strip=False,
        widget=forms.PasswordInput(attrs={'class': 'form-control', 'placeholder': 'Nueva contraseña'}),
        help_text="La contraseña debe tener al menos 8 caracteres, incluyendo mayúsculas, minúsculas, números y caracteres especiales.",
    )
    password_confirmacion = forms.CharField(
        label="Confirmar nueva contraseña",
        strip=False,
        widget=forms.PasswordInput(attrs={'class': 'form-control', 'placeholder': 'Confirmar nueva contraseña'}),
        help_text="Ingrese la misma contraseña que antes, para verificación.",
    )
    
    def __init__(self, user, *args, **kwargs):
        self.user = user
        super().__init__(*args, **kwargs)
    
    def clean_password_actual(self):
        password_actual = self.cleaned_data.get('password_actual')
        if not self.user.check_password(password_actual):
            raise forms.ValidationError("La contraseña actual es incorrecta")
        return password_actual
    
    def clean_password_nueva(self):
        password = self.cleaned_data.get('password_nueva')
        
        if len(password) < 8:
            raise forms.ValidationError("La contraseña debe tener al menos 8 caracteres")
        
        if not re.search(r'[A-Z]', password):
            raise forms.ValidationError("La contraseña debe contener al menos una letra mayúscula")
        
        if not re.search(r'[a-z]', password):
            raise forms.ValidationError("La contraseña debe contener al menos una letra minúscula")
        
        if not re.search(r'[0-9]', password):
            raise forms.ValidationError("La contraseña debe contener al menos un número")
        
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            raise forms.ValidationError("La contraseña debe contener al menos un carácter especial")
        
        return password
    
    def clean(self):
        cleaned_data = super().clean()
        password_nueva = cleaned_data.get('password_nueva')
        password_confirmacion = cleaned_data.get('password_confirmacion')
        
        if password_nueva and password_confirmacion and password_nueva != password_confirmacion:
            self.add_error('password_confirmacion', "Las contraseñas no coinciden")
        
        return cleaned_data