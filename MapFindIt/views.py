from __future__ import unicode_literals

from django.shortcuts import render, redirect, get_object_or_404
import hashlib
from .models import *
import datetime
from django.http import JsonResponse, HttpResponseForbidden, HttpResponse
from django.forms.models import model_to_dict
import io, os
import base64
from django.core.files.base import ContentFile
from django.core import serializers
import json


def home(request):
	if request.method=="POST":
		if request.POST.__contains__("primNome"):
			usuario = Usuario.objects.create(primnomeusuario=request.POST.get('primNome'), ultnomeusuario=request.POST.get('ultimoNome'), emailusuario=request.POST.get('email'), senhausuario=hashlib.md5((request.POST.get('password')+'cockles').encode()).hexdigest(), datanascimento=datetime.datetime.strptime(request.POST.get('nascimento'), "%d/%m/%Y").strftime("%Y-%m-%d"), idtsexo=request.POST.get('gender')[:1])
			usuario.save()
			return render(request, 'MapFindIt/cadastro.html', {})
		else:
			if request.POST.__contains__("email"):
				usuarios = Usuario.objects.filter(emailusuario=request.POST.get('email')).filter(senhausuario=hashlib.md5((request.POST.get('senha')+'cockles').encode()).hexdigest()).first()
				request.session['usuarioLogado']=usuarios.idusuario
				return redirect("/perfil/"+str(usuarios.idusuario))
			else:
				return render(request, 'MapFindIt/home.html', {})
	else:
		if request.method=="GET" and request.GET.get('pesquisa'):
			return HttpResponse(request.GET.get('pesquisa'));
		else:
			return render(request, 'MapFindIt/home.html', {})

def checkarEmail(request):
	email = request.GET.get('email', None)
	data = {
    	'existe': Usuario.objects.filter(emailusuario=email).exists()
	}
	return JsonResponse(data)

def checkarLogin(request):
	email = request.GET.get('email', None)
	senha = request.GET.get('senha', None)
	data = {
    	'existe': Usuario.objects.filter(emailusuario=email).filter(senhausuario=hashlib.md5((senha+'cockles').encode()).hexdigest()).exists()
	}
	return JsonResponse(data)

def checkarSenha(request):
	senha = request.GET.get('senha', None)
	id = request.GET.get('id', None)
	data = {
    	'incorreta': (Usuario.objects.filter(idusuario=id).first().senhausuario)!=(hashlib.md5((senha+'cockles').encode()).hexdigest())
	}
	return JsonResponse(data)

def perfil(request, idusuario):
	if request.method=="POST" and request.POST.__contains__('primNome'):
		usuarioFull=get_object_or_404(Usuario, idusuario=request.session['usuarioLogado'])
		usuarioFull.datanascimento=datetime.datetime.strptime(request.POST.get('nascimento'), "%d/%m/%Y").strftime("%Y-%m-%d")
		usuarioFull.primnomeusuario=request.POST.get('primNome')
		usuarioFull.ultnomeusuario=request.POST.get('ultimoNome')
		usuarioFull.idtsexo=request.POST.get('gender')[:1]
		usuarioFull.save()
		usuario = get_object_or_404(Usuario, idusuario=idusuario)
		amigos=Amizade.objects.filter(idusuario1=idusuario).filter(idusuario2=request.session['usuarioLogado']).exists()
		return render(request, 'MapFindIt/perfil.html', {'usuario': usuarioFull, 'idPag': usuario, 'amigos':amigos})
	else:
	  if request.method=="GET" and request.GET.__contains__('fraseUsuario'):
		  usuarioFull=get_object_or_404(Usuario, idusuario=request.session['usuarioLogado'])
		  usuarioFull.txtfrase=request.GET.get('fraseUsuario')
		  usuarioFull.save()
		  usuario = get_object_or_404(Usuario, idusuario=idusuario)
		  amigos=Amizade.objects.filter(idusuario1=idusuario).filter(idusuario2=request.session['usuarioLogado']).exists()
		  return render(request, 'MapFindIt/perfil.html', {'usuario': usuarioFull, 'idPag': usuario, 'amigos':amigos})
	  else:
		  if request.method=="POST" and request.POST.__contains__('senhaAtual'):
			  usuarioFull=get_object_or_404(Usuario, idusuario=request.session['usuarioLogado'])
			  usuarioFull.senhausuario=hashlib.md5((request.POST.get('password')+'cockles').encode()).hexdigest()
			  usuarioFull.save()
			  usuario = get_object_or_404(Usuario, idusuario=idusuario)
			  amigos=Amizade.objects.filter(idusuario1=idusuario).filter(idusuario2=request.session['usuarioLogado']).exists()
			  return render(request, 'MapFindIt/perfil.html', {'usuario': usuarioFull, 'idPag': usuario, 'amigos':amigos})
		  else:
			  if request.method=="POST" and request.POST.__contains__('blob'):
				  blobStr=request.POST.get('blob')
				  format, imgstr = blobStr.split(';base64,')
				  ext = format.split('/')[-1]
				  if os.path.exists("MapFindIt/static/MapFindIt/imagemUsers/"+str(request.session['usuarioLogado'])+"."+ext):
					  os.remove("MapFindIt/static/MapFindIt/imagemUsers/"+str(request.session['usuarioLogado'])+"."+ext)
				  data = ContentFile(base64.b64decode(imgstr), name=str(request.session['usuarioLogado']) + "." + ext)
				  usuarioFull=get_object_or_404(Usuario, idusuario=request.session['usuarioLogado'])
				  usuarioFull.foto=data
				  usuarioFull.save()
				  usuario = get_object_or_404(Usuario, idusuario=idusuario)
				  amigos=Amizade.objects.filter(idusuario1=idusuario).filter(idusuario2=request.session['usuarioLogado']).exists()
				  return render(request, 'MapFindIt/perfil.html', {'usuario': usuarioFull, 'idPag': usuario, 'amigos':amigos})
			  else:
				  usuario = get_object_or_404(Usuario, idusuario=idusuario)
				  usuarioFull=get_object_or_404(Usuario, idusuario=request.session['usuarioLogado'])
				  amigos=Amizade.objects.filter(idusuario1=idusuario).filter(idusuario2=request.session['usuarioLogado']).exists()
				  return render(request, 'MapFindIt/perfil.html', {'usuario': usuarioFull, 'idPag': usuario, 'amigos':amigos})

def mapasPerfil(request):
	num = request.GET.get('num', None)
	num = int(num)
	id = request.GET.get('id', None)
	todasPostagens=Postagem.objects.filter(idusuario=id).order_by('datapostagem')
	if todasPostagens.count()>int(num):
		postagem = serializers.serialize('json', [ todasPostagens[num], ]);
		mapaObj = Mapa.objects.filter(idmapa=todasPostagens[num].idmapa.idmapa).first();
		mapa=serializers.serialize("json", [mapaObj,]);
		todosPontos=Ponto.objects.filter(idmapa=mapaObj.idmapa)
		pontos = serializers.serialize("json", todosPontos)
		qset = Iconespontos.objects.none()
		for pt in todosPontos:
			codPonto=pt.codicone
			tempset=Iconespontos.objects.filter(codicone=codPonto.codicone)
			qset = qset | tempset
		icones = serializers.serialize("json", qset)
		comentarios = Comentario.objects.filter(idpostagem=todasPostagens[num].idpostagem)
		comentario = serializers.serialize("json", comentarios)
		autoresArr=[]
		for coment in comentarios:
			autoresArr.append(Usuario.objects.filter(idusuario=coment.idusuario.idusuario).first())
		autores = serializers.serialize("json", autoresArr)
		data = {
			'postagem': postagem,
			'mapa': mapa,
			'pontos': pontos,
			'icones': icones,
			'comentarios': comentario,
			'autores': autores,
		}
		return JsonResponse(data)
	else:
		data = {
			'erro': 1,
		}
		return JsonResponse(data)
