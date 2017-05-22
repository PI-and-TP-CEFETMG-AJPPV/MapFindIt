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
		if request.POST.__contains__("primNome"): # O request é de cadastro
			#Cria objeto do novo usuario
			usuario = Usuario.objects.create(primnomeusuario=request.POST.get('primNome'), ultnomeusuario=request.POST.get('ultimoNome'), emailusuario=request.POST.get('email'), senhausuario=hashlib.md5((request.POST.get('password')+'cockles').encode()).hexdigest(), datanascimento=datetime.datetime.strptime(request.POST.get('nascimento'), "%d/%m/%Y").strftime("%Y-%m-%d"), idtsexo=request.POST.get('gender')[:1])
			usuario.save() #Salva no bd
			return render(request, 'MapFindIt/cadastro.html', {})
		else:
			if request.POST.__contains__("email"): #O request é de login
				#Realiza o login
				usuarios = Usuario.objects.filter(emailusuario=request.POST.get('email')).filter(senhausuario=hashlib.md5((request.POST.get('senha')+'cockles').encode()).hexdigest()).first()
				request.session['usuarioLogado']=usuarios.idusuario
				return redirect("/perfil/"+str(usuarios.idusuario))
			else: #O request é padrão
				return render(request, 'MapFindIt/home.html', {})
	else:
		#Método de Pesquisa
		if request.method=="GET" and request.GET.get('pesquisa'):
			#Pesquisa do usuário
			strPesquisa = request.GET.get('pesquisa')
			#Busca mapas pelo título
			result = Mapa.objects.filter(titulomapa__icontains=strPesquisa)
			#Contabiliza a quantidade de mapas encontrados pelo titulo
			controle = 0
			for n in result:
				controle += 1
			#Se for menor do que 10 busca mapas pelo tema
			if controle < 10:
				tema = Tema.objects.filter(nomtema__icontains=strPesquisa)
				for n in tema:
					result = result | Mapa.objects.filter(codtema=n.codtema)
			#Contabiliza a quantidade de mapas encontrados pelo titulo + tema
			controle = 0
			for n in result:
				controle += 1
			#Se for menor do que 10 busca mapas pela descrição
			if controle < 10:
				result = result | Mapa.objects.filter(descmapa__icontains=strPesquisa)

			return HttpResponse(result);
		else:
			#Request é padrão
			return render(request, 'MapFindIt/home.html', {})

def checkarEmail(request):
	#Retorna um JSON dizendo se o email escolhido existe
	email = request.GET.get('email', None)
	data = {
    	'existe': Usuario.objects.filter(emailusuario=email).exists()
	}
	return JsonResponse(data)

def checkarLogin(request):
	#Retorna um JSON dizendo se o email e senha digitados estão corretos
	email = request.GET.get('email', None)
	senha = request.GET.get('senha', None)
	data = {
    	'existe': Usuario.objects.filter(emailusuario=email).filter(senhausuario=hashlib.md5((senha+'cockles').encode()).hexdigest()).exists()
	}
	return JsonResponse(data)

def checkarSenha(request):
	#Retorna um JSON dizendo se a senha atual digitada está correta
	senha = request.GET.get('senha', None)
	id = request.GET.get('id', None)
	data = {
    	'incorreta': (Usuario.objects.filter(idusuario=id).first().senhausuario)!=(hashlib.md5((senha+'cockles').encode()).hexdigest())
	}
	return JsonResponse(data)

def perfil(request, idusuario):
	if request.method=="POST" and request.POST.__contains__('primNome'): #Usuario alterou um dos dados de cadastro
		#Pega o usuario logado
		usuarioFull=get_object_or_404(Usuario, idusuario=request.session.get('usuarioLogado'))
		#Altera os dados do usario logado para os novos dados
		usuarioFull.datanascimento=datetime.datetime.strptime(request.POST.get('nascimento'), "%d/%m/%Y").strftime("%Y-%m-%d")
		usuarioFull.primnomeusuario=request.POST.get('primNome')
		usuarioFull.ultnomeusuario=request.POST.get('ultimoNome')
		usuarioFull.idtsexo=request.POST.get('gender')[:1]
		#Salva as alteracoes
		usuarioFull.save()
		#Usando a variavel idusuario, indicada pela url do perfil, pega o usuario dono do perfil
		usuario = get_object_or_404(Usuario, idusuario=idusuario)
		#Verifica se o usuario logado e o dono do perfil sao amigos, para enviar à página
		amigos=Amizade.objects.filter(idusuario1=idusuario).filter(idusuario2=request.session.get('usuarioLogado')).exists()
		return render(request, 'MapFindIt/perfil.html', {'usuario': usuarioFull, 'idPag': usuario, 'amigos':amigos})
	else:
	  if request.method=="GET" and request.GET.__contains__('fraseUsuario'): #Se a frase do usuario foi alterada
	  	  #Pega o usuario logado
		  usuarioFull=get_object_or_404(Usuario, idusuario=request.session.get('usuarioLogado'))
		  #Salva no usuario a nova frase
		  usuarioFull.txtfrase=request.GET.get('fraseUsuario')
		  usuarioFull.save()
		  #Obtem o dono do perfil
		  usuario = get_object_or_404(Usuario, idusuario=idusuario)
		  #Verifica se o usuario logado e o dono do perfil sao amigos, para enviar à página
		  amigos=Amizade.objects.filter(idusuario1=idusuario).filter(idusuario2=request.session.get('usuarioLogado')).exists()
		  return render(request, 'MapFindIt/perfil.html', {'usuario': usuarioFull, 'idPag': usuario, 'amigos':amigos})
	  else:
		  if request.method=="POST" and request.POST.__contains__('senhaAtual'): #Se a senha do usuario foi alterada
			  #Pega o usuario logado
			  usuarioFull=get_object_or_404(Usuario, idusuario=request.session.get('usuarioLogado'))
			  #Troca a senha do usuario
			  usuarioFull.senhausuario=hashlib.md5((request.POST.get('password')+'cockles').encode()).hexdigest()
			  usuarioFull.save()
			  #Obtem o dono do perfil
			  usuario = get_object_or_404(Usuario, idusuario=idusuario)
			  #Verifica se o usuario logado e o dono do perfil sao amigos, para enviar à página
			  amigos=Amizade.objects.filter(idusuario1=idusuario).filter(idusuario2=request.session.get('usuarioLogado')).exists()
			  return render(request, 'MapFindIt/perfil.html', {'usuario': usuarioFull, 'idPag': usuario, 'amigos':amigos})
		  else:
			  if request.method=="POST" and request.POST.__contains__('blob'): #A foto do usuario foi alterada
			  	  #Obtem a string blob da foto
				  blobStr=request.POST.get('blob')
				  #Define o caminho e o arquivo da foto, com o nome id_do_usuario.png
				  format, imgstr = blobStr.split(';base64,')
				  ext = format.split('/')[-1]
				  #Deleta a foto se ela existir
				  if os.path.exists("MapFindIt/static/MapFindIt/imagemUsers/"+str(request.session.get('usuarioLogado'))+"."+ext):
					  os.remove("MapFindIt/static/MapFindIt/imagemUsers/"+str(request.session.get('usuarioLogado'))+"."+ext)
				  data = ContentFile(base64.b64decode(imgstr), name=str(request.session.get('usuarioLogado')) + "." + ext)
				  #Obtem o usuario Logado
				  usuarioFull=get_object_or_404(Usuario, idusuario=request.session.get('usuarioLogado'))
				  #Salva o caminho da foto no bd, criando o arquivo
				  usuarioFull.foto=data
				  usuarioFull.save()
				  #Obtem o dono do perfil
				  usuario = get_object_or_404(Usuario, idusuario=idusuario)
				  #Verifica se o usuario logado e o dono do perfil sao amigos, para enviar à página
				  amigos=Amizade.objects.filter(idusuario1=idusuario).filter(idusuario2=request.session.get('usuarioLogado')).exists()
				  return render(request, 'MapFindIt/perfil.html', {'usuario': usuarioFull, 'idPag': usuario, 'amigos':amigos})
			  else: #Request padrão da pagina
			      #Obtem o dono do perfil
				  usuario = get_object_or_404(Usuario, idusuario=idusuario)
				  #Obtem o usuario logado
				  usuarioFull=get_object_or_404(Usuario, idusuario=request.session.get('usuarioLogado'))
				  #Verifica se o usuario logado e o dono do perfil sao amigos, para enviar à página
				  amigos=Amizade.objects.filter(idusuario1=idusuario).filter(idusuario2=request.session.get('usuarioLogado')).exists()
				  return render(request, 'MapFindIt/perfil.html', {'usuario': usuarioFull, 'idPag': usuario, 'amigos':amigos})

def getDadosPostagem(postagem):
	#Método para obter os dados de uma postagem
	#Obtem o mapa da postagem
	mapaObj = Mapa.objects.filter(idmapa=postagem.idmapa.idmapa).first();
	#Serializa ele em JSON
	mapa=serializers.serialize("json", [mapaObj,]);
	#Obtem os pontos do mapa da postagem
	todosPontos=Ponto.objects.filter(idmapa=mapaObj.idmapa)
	#Serializa eles em JSON
	pontos = serializers.serialize("json", todosPontos)
	#Cria queryset vazia
	qset = Iconespontos.objects.none()
	#Itera pelos pontos e caso o ponto possua icone, é adicionado a "qset" o seu objeto
	for pt in todosPontos:
		if pt.codicone is not None:
			tempset=Iconespontos.objects.filter(codicone=pt.codicone.codicone)
			qset = qset | tempset
	#Serializa os icones em JSON
	icones = serializers.serialize("json", qset)
	#Obtem os comentarios da postagem
	comentarios = Comentario.objects.filter(idpostagem=postagem.idpostagem)
	#Serializa eles em JSON
	comentario = serializers.serialize("json", comentarios)
	#Array dos autores de comentarios no mapa
	autoresArr=[]
	for coment in comentarios:
		#Para cada comentario do mapa, obtem o usuario que o escreveu
		autoresArr.append(Usuario.objects.filter(idusuario=coment.idusuario.idusuario).first())
	#Serializa os autores
	autores = serializers.serialize("json", autoresArr)
	#Obtem todas as rotas do mapa
	todasRotas = Rota.objects.filter(idmapa=mapaObj.idmapa)
	#Serializa elas em JSON, utilizando a chave natural para a cor
	rotas=serializers.serialize("json", todasRotas, use_natural_foreign_keys=True, use_natural_primary_keys=True)
	#Cria array para guardar todos os pontos das rotas
	pontosRotasArr=[]
	for rota in todasRotas:
		#Para cada rota, adiciona ao array os seus pontos já serlializados em JSON
		pontosRotasArr.append(serializers.serialize("json", RotaPonto.objects.filter(idrota=rota.idrota).order_by("seqponto"), use_natural_foreign_keys=True))
	#Serializa o array em JSON
	pontoRotas=json.dumps(pontosRotasArr)
	#Obtem todas as areas do mapa
	todasAreas = Area.objects.filter(idmapa=mapaObj.idmapa)
	#Serializa as areas em JSON, utilizando a chave natural para a cor
	areas=serializers.serialize("json", todasAreas, use_natural_foreign_keys=True, use_natural_primary_keys=True)
	#Cria array para guardar todos os pontos das areas
	pontosAreasArr=[]
	for area in todasAreas:
		#Para cada area, adiciona ao array os seus pontos já serlializados em JSON
		pontosAreasArr.append(serializers.serialize("json", Pontoarea.objects.filter(idarea=area.idarea), use_natural_foreign_keys=True))
	#Serializa o array em JSON
	pontoAreas=json.dumps(pontosAreasArr)
	#Retorna um array com todos os dados
	return [mapa, pontos, icones, comentario, autores, rotas, pontoRotas, areas, pontoAreas,]

def salvarComentario(request):
	titulo = request.GET.get('titulo', None)
	texto = request.GET.get('texto', None)
	data = request.GET.get('data', None)
	hora = request.GET.get('hora', None)
	iduser = int(request.GET.get('user', None))
	idpost = int(request.GET.get('postagem', None))
	comentario = Comentario.objects.create(titulocomentario=titulo, txtcomentario=texto, datacomentario=data, horacomentario= hora, idusuario=Usuario.objects.filter(idusuario=iduser).first(), idpostagem=Postagem.objects.filter(idpostagem=idpost).first())
	comentario.save()
	autor = Usuario.objects.filter(idusuario=iduser)
	jsonAutor = postagem = serializers.serialize('json', autor);
	return JsonResponse({'sucesso': True, 'autor': jsonAutor})

def adicionarView(request):
	#Pega o id do mapa
	mapaId = int(request.GET.get('mapa', None))
	#Obtem o objeto do mapa
	mapa=get_object_or_404(Mapa, idmapa=mapaId)
	#Incrementa visualizacoes
	mapa.valvisualizacoes+=1
	#Atualiza o mapa
	mapa.save()
	#Se o usuario estiver logado
	idUsuario = request.GET.get('usuario', None)
	if idUsuario is not None:
		idUsuario=int(idUsuario)
		#Tenta obter o objeto Interesseusuariotema
		try:
			interesse=Interesseusuariotema.objects.get(codtema=mapa.codtema, idusuario=Usuario.objects.get(idusuario=idUsuario))
		except Interesseusuariotema.DoesNotExist:
			#Caso tenha ocorrido a excecao, cria o objeto já com uma visualizacao
			interesse=Interesseusuariotema.objects.create(codtema=mapa.codtema, idusuario=Usuario.objects.get(idusuario=idUsuario), valvisualizacoes=1)
			interesse.save()
			#Sai da funcao
			return JsonResponse({})
		#Caso o objeto exista, incrementa o valor de visualizacoes e atualiza no banco
		interesse.valvisualizacoes+=1
		interesse.save()
	return JsonResponse({})

def mapasPerfil(request):
	#Pega a posicao do mapa que deve ser carregado
	num = request.GET.get('num', None)
	num = int(num)
	#Pega o ID do usuario
	id = request.GET.get('id', None)
	#Carrega todas as postagens do usuario logado, ordenando pela datada postagem
	todasPostagens=Postagem.objects.filter(idusuario=id).order_by('-datapostagem')
	#Verifica se as postagens já foram todas carregadas
	if todasPostagens.count()>int(num):
		#Caso ainda tenham postagens não carregadas
		#Serializa a postagem em JSON
		postagem = serializers.serialize('json', [ todasPostagens[num], ]);
		#Chama a função de obter os dados da postagem
		dados = getDadosPostagem(todasPostagens[num])
		#Retorna ao AJAX todos os dados
		data = {
			'postagem': postagem,
			'mapa': dados[0],
			'pontos': dados[1],
			'icones': dados[2],
			'comentarios': dados[3],
			'autores': dados[4],
			'rotas': dados[5],
			'pontoRotas': dados[6],
			'areas': dados[7],
			'pontoAreas': dados[8],
		}
		return JsonResponse(data)
	else:
		#Caso já se tenha carregado todas as postagens
		data = {
			'erro': 1,
		}
		return JsonResponse(data)
