# -*- coding: utf-8 -*-
# Generated by Django 1.11 on 2017-06-21 23:01
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('MapFindIt', '0022_grupo_privado'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='grupo',
            name='descgrupo',
        ),
        migrations.RemoveField(
            model_name='grupo',
            name='privado',
        ),
        migrations.RemoveField(
            model_name='membrosgrupo',
            name='admim',
        ),
        migrations.RemoveField(
            model_name='membrosgrupo',
            name='ban',
        ),
        migrations.RemoveField(
            model_name='tema',
            name='codtema',
        ),
        migrations.AddField(
            model_name='tema',
            name='id',
            field=models.AutoField(auto_created=True, default=0, primary_key=True, serialize=False, verbose_name='ID'),
            preserve_default=False,
        ),
    ]
