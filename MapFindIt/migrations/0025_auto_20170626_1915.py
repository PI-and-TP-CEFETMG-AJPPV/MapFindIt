# -*- coding: utf-8 -*-
# Generated by Django 1.11.2 on 2017-06-26 22:15
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('MapFindIt', '0024_iconespontos_idusuario'),
    ]

    operations = [
        migrations.AddField(
            model_name='grupo',
            name='descgrupo',
            field=models.TextField(blank=True, db_column='descGrupo', null=True),
        ),
        migrations.AddField(
            model_name='grupo',
            name='privado',
            field=models.BooleanField(db_column='Privacidade', default=False),
        ),
        migrations.AddField(
            model_name='membrosgrupo',
            name='admim',
            field=models.BooleanField(db_column='admimGrup', default='False'),
        ),
        migrations.AddField(
            model_name='membrosgrupo',
            name='ban',
            field=models.BooleanField(db_column='banGrup', default='False'),
        ),
    ]
