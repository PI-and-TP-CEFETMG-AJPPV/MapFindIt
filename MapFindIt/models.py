# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey has `on_delete` set to the desired behavior.
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from __future__ import unicode_literals

from django.db import models


class Amizade(models.Model):
    datamizade = models.DateField(db_column='datAmizade')  # Field name made lowercase.
    idusuario1 = models.ForeignKey('Usuario', models.DO_NOTHING, db_column='idUsuario1', primary_key=True)  # Field name made lowercase.
    idusuario2 = models.ForeignKey('Usuario', models.DO_NOTHING, db_column='idUsuario2', related_name="id2")  # Field name made lowercase.

    class Meta:
        db_table = 'amizade'
        unique_together = (('idusuario1', 'idusuario2'),)


class Comentario(models.Model):
    titulocomentario = models.CharField(db_column='tituloComentario', max_length=20)  # Field name made lowercase.
    txtcomentario = models.TextField(db_column='txtComentario')  # Field name made lowercase.
    datacomentario = models.DateField(db_column='dataComentario')  # Field name made lowercase.
    horacomentario = models.TimeField(db_column='horaComentario')  # Field name made lowercase.
    idusuario = models.ForeignKey('Usuario', models.DO_NOTHING, db_column='idUsuario', primary_key=True)  # Field name made lowercase.
    idpostagem = models.ForeignKey('Postagem', models.DO_NOTHING, db_column='idPostagem')  # Field name made lowercase.

    def __str__(self):
        return self.titulocomentario

    class Meta:
        db_table = 'comentario'
        unique_together = (('idusuario', 'idpostagem'),)


class Cor(models.Model):
    codcor = models.IntegerField(db_column='codCor', primary_key=True)  # Field name made lowercase.
    nomecor = models.CharField(db_column='nomeCor', max_length=20)  # Field name made lowercase.
    r = models.IntegerField(db_column='R')  # Field name made lowercase.
    g = models.IntegerField(db_column='G')  # Field name made lowercase.
    b = models.IntegerField(db_column='B')  # Field name made lowercase.

    def natural_key(self):
        return (self.r, self.g, self.b)

    def __str__(self):
        return self.nomecor

    class Meta:
        db_table = 'cor'


class Grupo(models.Model):
    idgrupo = models.IntegerField(db_column='idGrupo', primary_key=True)  # Field name made lowercase.
    nomegrupo = models.CharField(db_column='nomeGrupo', max_length=20, blank=True, null=True)  # Field name made lowercase.
    idusuario = models.ForeignKey('Usuario', models.DO_NOTHING, db_column='idUsuario', blank=True, null=True)  # Field name made lowercase.
    codcor = models.ForeignKey(Cor, models.DO_NOTHING, db_column='codCor', blank=True, null=True)  # Field name made lowercase.

    def __str__(self):
        return self.nomegrupo

    class Meta:
        db_table = 'grupo'

class Iconespontos(models.Model):
    codicone = models.AutoField(db_column='codIcone', primary_key=True)  # Field name made lowercase.
    imgicone =  models.ImageField(upload_to='MapFindIt/static/MapFindIt/imagemIcones/', null=True, blank=True)  # Field name made lowercase.
    nomeicone = models.CharField(db_column='nomeIcone', max_length=20)  # Field name made lowercase.

    def __str__(self):
        return self.nomeicone

    class Meta:
        db_table = 'iconespontos'


class Interesseusuariotema(models.Model):
    codtema = models.ForeignKey('Tema', models.DO_NOTHING, db_column='codTema', primary_key=True)  # Field name made lowercase.
    valvisualizacoes = models.IntegerField(db_column='valVisualizacoes')  # Field name made lowercase.
    idusuario = models.ForeignKey('Usuario', models.DO_NOTHING, db_column='idUsuario')  # Field name made lowercase.

    class Meta:
        db_table = 'interesseusuariotema'
        unique_together = (('codtema', 'idusuario'),)


class Legenda(models.Model):
    txtlegenda = models.TextField(db_column='txtLegenda')  # Field name made lowercase.
    idmapa = models.ForeignKey('Mapa', models.DO_NOTHING, db_column='idMapa', primary_key=True)  # Field name made lowercase.
    codicone = models.ForeignKey(Iconespontos, models.DO_NOTHING, db_column='codIcone')  # Field name made lowercase.

    def __str__(self):
        return self.txtlegenda

    class Meta:
        db_table = 'legenda'
        unique_together = (('idmapa', 'codicone'),)


class Mapa(models.Model):
    titulomapa = models.CharField(db_column='tituloMapa', max_length=30)  # Field name made lowercase.
    descmapa = models.TextField(db_column='descMapa')  # Field name made lowercase.
    idmapa = models.AutoField(db_column='idMapa', primary_key=True)  # Field name made lowercase.
    idtvisibilidade = models.CharField(db_column='idtVisibilidade', max_length=1)  # Field name made lowercase.
    codtema = models.ForeignKey('Tema', models.DO_NOTHING, db_column='codTema')  # Field name made lowercase.
    valvisualizacoes = models.IntegerField(db_column='valVisualizacoes')  # Field name made lowercase.
    datamapa = models.DateField(db_column='dataMapa')  # Field name made lowercase.
    coordxinicial = models.FloatField(db_column='coordXInicial')  # Field name made lowercase.
    coordyinicial = models.FloatField(db_column='coordYInicial')  # Field name made lowercase.
    valaprovados = models.IntegerField(db_column='valAprovados')  # Field name made lowercase.
    valreprovados = models.IntegerField(db_column='valReprovados')  # Field name made lowercase.
    idusuario = models.ForeignKey('Usuario', models.DO_NOTHING, db_column='idUsuario', blank=True, null=True)  # Field name made lowercase.

    def __str__(self):
        return self.titulomapa

    class Meta:
        db_table = 'mapa'


class Membrosgrupo(models.Model):
    idgrupo = models.ForeignKey(Grupo, models.DO_NOTHING, db_column='idGrupo', primary_key=True)  # Field name made lowercase.
    idusuario = models.ForeignKey('Usuario', models.DO_NOTHING, db_column='idUsuario')  # Field name made lowercase.

    class Meta:
        db_table = 'membrosgrupo'
        unique_together = (('idgrupo', 'idusuario'),)


class Permissaocolaboracao(models.Model):
    idmapa = models.ForeignKey(Mapa, models.DO_NOTHING, db_column='idMapa', primary_key=True)  # Field name made lowercase.
    idusuario = models.ForeignKey('Usuario', models.DO_NOTHING, db_column='idUsuario')  # Field name made lowercase.

    class Meta:
        db_table = 'permissaocolaboracao'
        unique_together = (('idmapa', 'idusuario'),)


class Ponto(models.Model):
    idponto = models.AutoField(db_column='idPonto', primary_key=True)  # Field name made lowercase.
    coordx = models.FloatField(db_column='coordX')  # Field name made lowercase.
    coordy = models.FloatField(db_column='coordY')  # Field name made lowercase.
    idmapa = models.ForeignKey(Mapa, models.DO_NOTHING, db_column='idMapa')  # Field name made lowercase.
    nomponto = models.CharField(db_column='nomPonto', max_length=30, blank=True, null=True)  # Field name made lowercase.
    descponto = models.TextField(db_column='descPonto', blank=True, null=True)  # Field name made lowercase.
    fotoponto = models.ImageField(upload_to='MapFindIt/static/MapFindIt/imagemPonto/', null=True, blank=True)  # Field name made lowercase.
    codicone = models.ForeignKey(Iconespontos, models.DO_NOTHING, db_column='codIcone', blank=True, null=True)  # Field name made lowercase.
    idusuario = models.ForeignKey('Usuario', models.DO_NOTHING, db_column='idUsuario', blank=True, null=True)  # Field name made lowercase.
    idtponto = models.CharField(db_column='idtPonto', max_length=1, blank=True, null=False)
    #codcor = models.ForeignKey(Cor, models.DO_NOTHING, db_column='codCor', blank=True, null=True)  # Field name made lowercase.

    def natural_key(self):
        return (self.coordy, self.coordx)

    def __str__(self):
        if(self.nomponto):
            return self.nomponto
        else:
            return str(self.coordx)+str(self.coordy);


    class Meta:
        db_table = 'ponto'


class Pontoarea(models.Model):
    idmapaarea = models.ForeignKey('Area', models.DO_NOTHING, db_column='idMapaArea', primary_key=True)  # Field name made lowercase.
    idarea = models.ForeignKey('Area', models.DO_NOTHING, db_column='idArea', related_name="id2")  # Field name made lowercase.
    idponto = models.ForeignKey(Ponto, models.DO_NOTHING, db_column='idPonto')  # Field name made lowercase.

    class Meta:
        db_table = 'pontoarea'
        unique_together = (('idmapaarea', 'idarea', 'idponto'),)


class Postagem(models.Model):
    datapostagem = models.DateField(db_column='dataPostagem')  # Field name made lowercase.
    horapostagem = models.TimeField(db_column='horaPostagem')  # Field name made lowercase.
    idmapa = models.ForeignKey(Mapa, models.DO_NOTHING, db_column='idMapa', blank=True, null=True)  # Field name made lowercase.
    idpostagem = models.AutoField(db_column='idPostagem', primary_key=True)  # Field name made lowercase.
    idusuario = models.ForeignKey('Usuario', models.DO_NOTHING, db_column='idUsuario')  # Field name made lowercase.

    class Meta:
        db_table = 'postagem'


class Postagemgrupo(models.Model):
    idgrupo = models.ForeignKey(Grupo, models.DO_NOTHING, db_column='idGrupo')  # Field name made lowercase.
    datapostagem = models.DateField(db_column='dataPostagem')  # Field name made lowercase.
    horapostagem = models.TimeField(db_column='horaPostagem')  # Field name made lowercase.
    idmapa = models.ForeignKey(Mapa, models.DO_NOTHING, db_column='idMapa')  # Field name made lowercase.
    idpostagem = models.AutoField(db_column='idPostagem', primary_key=True)  # Field name made lowercase.
    idusuario = models.ForeignKey('Usuario', models.DO_NOTHING, db_column='idUsuario')  # Field name made lowercase.

    class Meta:
        db_table = 'postagemgrupo'
        unique_together = (('idpostagem', 'idgrupo'),)


class Rota(models.Model):
    idrota = models.AutoField(db_column='idRota', primary_key=True)  # Field name made lowercase.
    idtevitar = models.IntegerField(db_column='idtEvitar', blank=True, null=True)  # Field name made lowercase.
    idmapaevitado = models.ForeignKey('Mapa', models.DO_NOTHING, db_column='idMapaEvitado', blank=True, null=True, related_name='evitado')  # Field name made lowercase.
    nomerota = models.CharField(db_column='nomeRota', max_length=30)  # Field name made lowercase.
    descrota = models.TextField(db_column='descRota')  # Field name made lowercase.
    codcor = models.ForeignKey(Cor, models.DO_NOTHING, db_column='codCor')  # Field name made lowercase.
    idusuario = models.ForeignKey('Usuario', models.DO_NOTHING, db_column='idUsuario', blank=True, null=True)  # Field name made lowercase.
    idmapa = models.ForeignKey('Mapa', models.DO_NOTHING, db_column='idMapa', blank=True, null=True)
    def __str__(self):
        return self.nomerota

    class Meta:
        db_table = 'rota'


class RotaPonto(models.Model):
    idrota = models.ForeignKey(Rota, models.DO_NOTHING, db_column='idRota')  # Field name made lowercase.
    idponto = models.ForeignKey(Ponto, models.DO_NOTHING, db_column='idPonto')  # Field name made lowercase.
    seqponto = models.IntegerField(db_column='seqPonto', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        db_table = 'rota_ponto'
        unique_together = (('idrota', 'idponto'),)


class Tema(models.Model):
    codtema = models.IntegerField(db_column='codTema', primary_key=True)  # Field name made lowercase.
    nomtema = models.CharField(db_column='nomTema', max_length=20)  # Field name made lowercase.

    def __str__(self):
        return self.nomtema

    class Meta:
        db_table = 'tema'


class Usuario(models.Model):
    idusuario = models.AutoField(db_column='idUsuario', primary_key=True)  # Field name made lowercase.
    primnomeusuario = models.CharField(db_column='primNomeUsuario', max_length=25)  # Field name made lowercase.
    emailusuario = models.CharField(db_column='emailUsuario', max_length=50)  # Field name made lowercase.
    senhausuario = models.CharField(db_column='senhaUsuario', max_length=32)  # Field name made lowercase.
    datanascimento = models.DateField(db_column='dataNascimento')  # Field name made lowercase.
    idtsexo = models.CharField(db_column='idtSexo', max_length=1)  # Field name made lowercase.
    ultnomeusuario = models.CharField(db_column='ultNomeUsuario', max_length=50)  # Field name made lowercase.
    txtfrase = models.CharField(db_column="txtFrase", max_length=100, default="No que você está pensando?") #Field name made lowercase
    foto = models.ImageField(upload_to='MapFindIt/static/MapFindIt/imagemUsers/', null=True, blank=True)

    def __str__(self):
        return self.emailusuario

    class Meta:
        db_table = 'usuario'


class Area(models.Model):
    idmapa = models.ForeignKey(Mapa, models.DO_NOTHING, db_column='idMapa', primary_key=True)  # Field name made lowercase.
    idarea = models.CharField(db_column='idArea', max_length=20)  # Field name made lowercase.
    nomarea = models.CharField(db_column='nomArea', max_length=20)  # Field name made lowercase.
    descarea = models.TextField(db_column='descArea')  # Field name made lowercase.
    codcor = models.ForeignKey(Cor, models.DO_NOTHING, db_column='codCor')  # Field name made lowercase.
    idusuario = models.ForeignKey('Usuario', models.DO_NOTHING, db_column='idUsuario')  # Field name made lowercase.


    def __str__(self):
        return self.nomarea

    class Meta:
        db_table = 'Area'
        unique_together = (('idmapa', 'idarea'),)
