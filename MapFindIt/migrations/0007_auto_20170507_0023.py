# -*- coding: utf-8 -*-
# Generated by Django 1.11 on 2017-05-07 03:23
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('MapFindIt', '0006_auto_20170506_1813'),
    ]

    operations = [
        migrations.AlterField(
            model_name='iconespontos',
            name='imgicone',
            field=models.ImageField(blank=True, null=True, upload_to='MapFindIt/static/MapFindIt/imagemIcones/'),
        ),
    ]
