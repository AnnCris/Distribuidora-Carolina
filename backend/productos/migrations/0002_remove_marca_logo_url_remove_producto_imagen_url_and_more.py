# Generated by Django 5.2 on 2025-06-05 20:07

import productos.models
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('productos', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='marca',
            name='logo_url',
        ),
        migrations.RemoveField(
            model_name='producto',
            name='imagen_url',
        ),
        migrations.AddField(
            model_name='marca',
            name='logo',
            field=models.ImageField(blank=True, help_text='Sube una imagen para el logo de la marca (JPG, PNG, etc.)', null=True, upload_to=productos.models.marca_logo_path, verbose_name='Logo de la Marca'),
        ),
        migrations.AddField(
            model_name='producto',
            name='imagen',
            field=models.ImageField(blank=True, help_text='Sube una imagen del producto (JPG, PNG, etc.)', null=True, upload_to=productos.models.producto_imagen_path, verbose_name='Imagen del Producto'),
        ),
    ]
