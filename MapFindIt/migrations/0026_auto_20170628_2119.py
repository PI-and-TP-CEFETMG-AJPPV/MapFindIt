# -*- coding: utf-8 -*-
# Generated by Django 1.11 on 2017-06-29 00:19
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('MapFindIt', '0025_auto_20170626_1915'),
    ]

    operations = [
        migrations.AlterField(
            model_name='cor',
            name='codcor',
            field=models.AutoField(db_column='codCor', primary_key=True, serialize=False),
        ),
    ]
