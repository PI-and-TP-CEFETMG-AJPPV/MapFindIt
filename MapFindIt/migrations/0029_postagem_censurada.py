# -*- coding: utf-8 -*-
# Generated by Django 1.11.3 on 2017-09-03 22:30
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('MapFindIt', '0028_codigorecuperarsenha'),
    ]

    operations = [
        migrations.AddField(
            model_name='postagem',
            name='censurada',
            field=models.BooleanField(db_column='censurada', default='False'),
        ),
    ]
