from __future__ import unicode_literals

from django.shortcuts import render, redirect, get_object_or_404
import hashlib
from .models import Usuario
from .models import Amizade
import datetime
from django.http import JsonResponse, HttpResponseForbidden
from django.forms.models import model_to_dict

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

def perfil(request, idusuario):
	usuario = get_object_or_404(Usuario, idusuario=idusuario)
	usuarioFull=get_object_or_404(Usuario, idusuario=request.session['usuarioLogado'])
	amigos=Amizade.objects.filter(idusuario1=idusuario).filter(idusuario2=request.session['usuarioLogado']).exists()
	return render(request, 'MapFindIt/perfil.html', {'usuario': usuarioFull, 'idPag': usuario, 'amigos':amigos})
