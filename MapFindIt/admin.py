# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.contrib import admin

from .models import Amizade
from .models import Comentario
from .models import Cor
from .models import Grupo
from .models import Iconespontos
from .models import Interesseusuariotema
from .models import Legenda
from .models import Mapa
from .models import Membrosgrupo
from .models import Permissaocolaboracao
from .models import Ponto
from .models import Pontoarea
from .models import Postagem
from .models import Postagemgrupo
from .models import Rota
from .models import RotaPonto
from .models import Tema
from .models import Usuario
from .models import Area
from .models import CodigoRecuperarSenha
from .models import Notificacao

# Register your models here.

admin.site.register(Amizade)
admin.site.register(Comentario)
admin.site.register(Cor)
admin.site.register(Grupo)
admin.site.register(Iconespontos)
admin.site.register(Interesseusuariotema)
admin.site.register(Legenda)
admin.site.register(Mapa)
admin.site.register(Membrosgrupo)
admin.site.register(Permissaocolaboracao)
admin.site.register(Ponto)
admin.site.register(Pontoarea)
admin.site.register(Postagem)
admin.site.register(Postagemgrupo)
admin.site.register(Rota)
admin.site.register(RotaPonto)
admin.site.register(Tema)
admin.site.register(Usuario)
admin.site.register(Area)
admin.site.register(CodigoRecuperarSenha)
admin.site.register(Notificacao)