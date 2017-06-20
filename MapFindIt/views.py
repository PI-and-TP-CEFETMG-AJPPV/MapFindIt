from __future__ import unicode_literals
from django.shortcuts import render, redirect, get_object_or_404
from .models import *
from django.http import JsonResponse, HttpResponseForbidden, HttpResponse
from django.forms.models import model_to_dict
from django.core.files.base import ContentFile
from django.core import serializers
import io, os
import base64
import hashlib
import datetime
import json

def home(request):
    if request.method=="POST":
        if request.POST.__contains__("primNome"): # O request é de cadastro
            #Cria objeto do novo usuario
            usuario = Usuario.objects.create(primnomeusuario=request.POST.get('primNome'),
            ultnomeusuario=request.POST.get('ultimoNome'), emailusuario=request.POST.get('email'),
            senhausuario=hashlib.md5((request.POST.get('password')+'cockles').encode()).hexdigest(),
            datanascimento=datetime.datetime.strptime(request.POST.get('nascimento'),
            "%d/%m/%Y").strftime("%Y-%m-%d"), idtsexo=request.POST.get('gender')[:1])
            usuario.save() #Salva no BD
            return render(request, 'MapFindIt/cadastro.html', {})
        else:
            if request.POST.__contains__("email"): #O request é de login
                #Realiza o login
                usuarios = Usuario.objects.filter(emailusuario=request.POST.get('email')
                ).filter(senhausuario=hashlib.md5((request.POST.get('senha')+'cockles'
                ).encode()).hexdigest()).first()
                request.session['usuarioLogado']=usuarios.idusuario
                return redirect("/perfil/"+str(usuarios.idusuario))
            else: #O request é padrão
                return render(request, 'MapFindIt/home.html', {})
    else:
        #Request é padrão
        return render(request, 'MapFindIt/home.html', {})

#Pesquisa mapas pela String passada
def pesquisar(pesquisa):
    #Busca mapas pelo título
    result = Mapa.objects.filter(titulomapa__icontains=pesquisa).order_by('valvisualizacoes')
    #Contabiliza a quantidade de mapas encontrados pelo titulo
    controle = 0
    for n in result:
        controle += 1
    #Se for menor do que 10
    if controle < 10:
        tema = Tema.objects.filter(nomtema__icontains=pesquisa)
        for n in tema:
            result = result | Mapa.objects.filter(codtema=n.codtema)
        result = result.order_by('valvisualizacoes')
        #Contabiliza a quantidade de mapas encontrados pelo titulo + tema
        controle = 0
        for n in result:
            controle += 1
        #Se for menor do que 10 busca mapas pela descrição
        if controle < 10:
            result = result | Mapa.objects.filter(descmapa__icontains=pesquisa)
            result = result.order_by('valvisualizacoes')
    #Retorna os mapas encontrados segundo os parâmetros da pesquisa
    return result

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
def salvarGrupo(request):
    # cria o novo objecto do tipo grupo
    grupo= Grupo.objects.create(nomegrupo=request.POST.get('nmdGrupo'), descgrupo=request.POST.get('descGrupo'), idusuario=request.session.get('usuarioLogado'))
    #Salva o grupo no banco de dados
    grupo.save()
    #redireciona para a pagina do grupo criado
    return redirect('grupo/grupo.idgrupo', permanent=True)
#função para renderizar o template da pagina de grupo
def grupo(request, idgrupo):
        member = False
        admim = False
        ower = False
        #Pega o usuario logado
        usuarioFull=get_object_or_404(Usuario, idusuario=request.session.get('usuarioLogado'))
        #Pega todas as informações do grupo
        try:
            grupoFull=Grupo.objects.get(pk=idgrupo)
        except grupoFull.DoesNotExist:
            raise Http404("Grupo inexistente")
        q1=Membrosgrupo.objects.filter(idusuario=usuarioFull.idusuario,idgrupo=grupoFull.idgrupo)
        #verifica se o usuario e dono do grupo
        if usuarioFull.idusuario == grupoFull.idusuario:
            member=True
            admin=True
            ower=True
        #verifica se o usuario e membro do grupo
        if q1.count() == 1:
            member=True
            #verifica se e adimistrador
            for q in q1:
                if q.admim:
                    q.admim=True
        #Obtem todos os amigos do usuario para o menu
        todosAmigos1=Amizade.objects.filter(idusuario1=request.session.get('usuarioLogado'))
        todosAmigos2=Amizade.objects.filter(idusuario2=request.session.get('usuarioLogado'))
        todosAmigos=[]
        countPendentes=0
        for amigo in todosAmigos1:
          todosAmigos.append(amigo)
        for amigo in todosAmigos2:
          if amigo.aceita:
              #Conta as solicitações pendentes para esse usuário
              #Está no 2 porque o usuário que recebe as solicitações é o 2
              countPendentes+=1
          todosAmigos.append(amigo)
        #Obtem os grupos que o usuario pertence para o menu
        grupoUsuario=Membrosgrupo.objects.filter(idusuario=request.session.get('usuarioLogado'))
        todosGrupos=[]
        for grupo in grupoUsuario:
            todosGrupos.append(grupo.idgrupo)
        #Obtem grupos que o usuario é dono para o menu
        grupoUsuario=Grupo.objects.filter(idusuario=request.session.get('usuarioLogado'))
        for grupo in grupoUsuario:
            todosGrupos.append(grupo)
        #obtem a cor do grupo
        return render(request, 'MapFindIt/grupo.html', {'usuario': usuarioFull, 'grupo': grupoFull, 'member':member, 'admim':admim, 'ower':ower, 'todosAmigos': todosAmigos, 'grupos': todosGrupos, 'solicitacoesPendentes': countPendentes})

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
        amigos=Amizade.objects.filter(idusuario2=idusuario).filter(idusuario1=request.session.get('usuarioLogado')).exists()
        #Obtem todos os amigos do usuario para o menu
        todosAmigos1=Amizade.objects.filter(idusuario1=request.session.get('usuarioLogado'))
        todosAmigos2=Amizade.objects.filter(idusuario2=request.session.get('usuarioLogado'))
        todosAmigos=[]
        countPendentes=0
        for amigo in todosAmigos1:
            todosAmigos.append(amigo)
        for amigo in todosAmigos2:
            if amigo.aceita:
                #Conta as solicitações pendentes para esse usuário
                #Está no 2 porque o usuário que recebe as solicitações é o 2
                countPendentes+=1
            todosAmigos.append(amigo)
        #Obtem os grupos que o usuario pertence para o menu
        grupoUsuario=Membrosgrupo.objects.filter(idusuario=request.session.get('usuarioLogado'))
        todosGrupos=[]
        for grupo in grupoUsuario:
            todosGrupos.append(grupo.idgrupo)
        #Obtem grupos que o usuario é dono para o menu
        grupoUsuario=Grupo.objects.filter(idusuario=request.session.get('usuarioLogado'))
        for grupo in grupoUsuario:
            todosGrupos.append(grupo)
        return render(request, 'MapFindIt/perfil.html', {'usuario': usuarioFull, 'idPag': usuario, 'amigos':amigos, 'todosAmigos': todosAmigos, 'grupos': todosGrupos, 'solicitacoesPendentes': countPendentes})
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
          amigos=Amizade.objects.filter(idusuario2=idusuario).filter(idusuario1=request.session.get('usuarioLogado')).exists()
          #Obtem todos os amigos do usuario para o menu
          todosAmigos1=Amizade.objects.filter(idusuario1=request.session.get('usuarioLogado'))
          todosAmigos2=Amizade.objects.filter(idusuario2=request.session.get('usuarioLogado'))
          todosAmigos=[]
          countPendentes=0
          for amigo in todosAmigos1:
            todosAmigos.append(amigo)
          for amigo in todosAmigos2:
            if amigo.aceita:
                #Conta as solicitações pendentes para esse usuário
                #Está no 2 porque o usuário que recebe as solicitações é o 2
                countPendentes+=1
          todosAmigos.append(amigo)
          #Obtem os grupos que o usuario pertence para o menu
          grupoUsuario=Membrosgrupo.objects.filter(idusuario=request.session.get('usuarioLogado'))
          todosGrupos=[]
          for grupo in grupoUsuario:
              todosGrupos.append(grupo.idgrupo)
          #Obtem grupos que o usuario é dono para o menu
          grupoUsuario=Grupo.objects.filter(idusuario=request.session.get('usuarioLogado'))
          for grupo in grupoUsuario:
              todosGrupos.append(grupo)
          return render(request, 'MapFindIt/perfil.html', {'usuario': usuarioFull, 'idPag': usuario, 'amigos':amigos, 'todosAmigos': todosAmigos, 'grupos': todosGrupos, 'solicitacoesPendentes': countPendentes})
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
              amigos=Amizade.objects.filter(idusuario2=idusuario).filter(idusuario1=request.session.get('usuarioLogado')).exists()
              #Obtem todos os amigos do usuario para o menu
              todosAmigos1=Amizade.objects.filter(idusuario1=request.session.get('usuarioLogado'))
              todosAmigos2=Amizade.objects.filter(idusuario2=request.session.get('usuarioLogado'))
              todosAmigos=[]
              countPendentes=0
              for amigo in todosAmigos1:
                todosAmigos.append(amigo)
              for amigo in todosAmigos2:
                if amigo.aceita:
                    #Conta as solicitações pendentes para esse usuário
                    #Está no 2 porque o usuário que recebe as solicitações é o 2
                    countPendentes+=1
                todosAmigos.append(amigo)
              #Obtem os grupos que o usuario pertence para o menu
              grupoUsuario=Membrosgrupo.objects.filter(idusuario=request.session.get('usuarioLogado'))
              todosGrupos=[]
              for grupo in grupoUsuario:
                  todosGrupos.append(grupo.idgrupo)
              #Obtem grupos que o usuario é dono para o menu
              grupoUsuario=Grupo.objects.filter(idusuario=request.session.get('usuarioLogado'))
              for grupo in grupoUsuario:
                  todosGrupos.append(grupo)
              return render(request, 'MapFindIt/perfil.html', {'usuario': usuarioFull, 'idPag': usuario, 'amigos':amigos, 'todosAmigos': todosAmigos, 'grupos': todosGrupos, 'solicitacoesPendentes': countPendentes})
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
                  amigos=Amizade.objects.filter(idusuario2=idusuario).filter(idusuario1=request.session.get('usuarioLogado')).exists()
                  #Obtem todos os amigos do usuario para o menu
                  todosAmigos1=Amizade.objects.filter(idusuario1=request.session.get('usuarioLogado'))
                  todosAmigos2=Amizade.objects.filter(idusuario2=request.session.get('usuarioLogado'))
                  todosAmigos=[]
                  countPendentes=0
                  for amigo in todosAmigos1:
                    todosAmigos.append(amigo)
                  for amigo in todosAmigos2:
                    if amigo.aceita:
                        #Conta as solicitações pendentes para esse usuário
                        #Está no 2 porque o usuário que recebe as solicitações é o 2
                        countPendentes+=1
                    todosAmigos.append(amigo)
                  #Obtem os grupos que o usuario pertence para o menu
                  grupoUsuario=Membrosgrupo.objects.filter(idusuario=request.session.get('usuarioLogado'))
                  todosGrupos=[]
                  for grupo in grupoUsuario:
                      todosGrupos.append(grupo.idgrupo)
                  #Obtem grupos que o usuario é dono para o menu
                  grupoUsuario=Grupo.objects.filter(idusuario=request.session.get('usuarioLogado'))
                  for grupo in grupoUsuario:
                      todosGrupos.append(grupo)
                  return render(request, 'MapFindIt/perfil.html', {'usuario': usuarioFull, 'idPag': usuario, 'amigos':amigos, 'todosAmigos': todosAmigos, 'grupos': todosGrupos, 'solicitacoesPendentes': countPendentes})
              else: #Request padrão da pagina
                  #Obtem o dono do perfil
                  usuario = get_object_or_404(Usuario, idusuario=idusuario)
                  #Obtem o usuario logado
                  usuarioFull=get_object_or_404(Usuario, idusuario=request.session.get('usuarioLogado'))
                  #Verifica se o usuario logado e o dono do perfil sao amigos, para enviar à página
                  amigos=Amizade.objects.filter(idusuario1=idusuario).filter(idusuario2=request.session.get('usuarioLogado')).exists()
                  amigos=Amizade.objects.filter(idusuario2=idusuario).filter(idusuario1=request.session.get('usuarioLogado')).exists()
                  #Obtem todos os amigos do usuario para o menu
                  todosAmigos1=Amizade.objects.filter(idusuario1=request.session.get('usuarioLogado'))
                  todosAmigos2=Amizade.objects.filter(idusuario2=request.session.get('usuarioLogado'))
                  todosAmigos=[]
                  countPendentes=0
                  for amigo in todosAmigos1:
                    todosAmigos.append(amigo)
                  for amigo in todosAmigos2:
                    if amigo.aceita:
                        #Conta as solicitações pendentes para esse usuário
                        #Está no 2 porque o usuário que recebe as solicitações é o 2
                        countPendentes+=1
                    todosAmigos.append(amigo)
                  #Obtem os grupos que o usuario pertence para o menu
                  grupoUsuario=Membrosgrupo.objects.filter(idusuario=request.session.get('usuarioLogado'))
                  todosGrupos=[]
                  for grupo in grupoUsuario:
                      todosGrupos.append(grupo.idgrupo)
                  #Obtem grupos que o usuario é dono para o menu
                  grupoUsuario=Grupo.objects.filter(idusuario=request.session.get('usuarioLogado'))
                  for grupo in grupoUsuario:
                      todosGrupos.append(grupo)
                  return render(request, 'MapFindIt/perfil.html', {'usuario': usuarioFull, 'idPag': usuario, 'amigos':amigos, 'todosAmigos': todosAmigos, 'grupos': todosGrupos, 'solicitacoesPendentes': countPendentes})

def getDadosPostagem(postagem):
    #Método para obter os dados de uma postagem
    #Obtem o mapa da postagem
    mapaObj = postagem.idmapa;
    #Serializa ele em JSON
    mapa=serializers.serialize("json", [mapaObj,]);
    #Obtem os pontos do mapa da postagem
    todosPontos=Ponto.objects.filter(idmapa=mapaObj.idmapa)
    #Serializa eles em JSON
    pontos = serializers.serialize("json", todosPontos)
    #Cria queryset vazia
    qset = []
    #Itera pelos pontos e caso o ponto possua icone, é adicionado a "qset" o seu objeto
    for pt in todosPontos:
        if pt.codicone is not None:
            qset.append(pt.codicone)
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
        autoresArr.append(coment.idusuario)
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
    #Obtem os dados
    titulo = request.GET.get('titulo', None)
    texto = request.GET.get('texto', None)
    data = request.GET.get('data', None)
    hora = request.GET.get('hora', None)
    iduser = int(request.GET.get('user', None))
    idpost = int(request.GET.get('postagem', None))
    #Cria o comentario e o salva no banco
    comentario = Comentario.objects.create(titulocomentario=titulo, txtcomentario=texto, datacomentario=data, horacomentario= hora, idusuario=Usuario.objects.filter(idusuario=iduser).first(), idpostagem=Postagem.objects.filter(idpostagem=idpost).first())
    comentario.save()
    #Obtem o autor do comentario
    autor = Usuario.objects.filter(idusuario=iduser)
    jsonAutor = serializers.serialize('json', autor);
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

def mapasGrupo(request, idgrupo):
    #Pega a posicao do mapa que deve ser carregado
    num = request.GET.get('num', None)
    num = int(num)
    #Pega o ID do usuario
    id = request.GET.get('id', None)
    #Carrega todas as postagens do grupo, ordenando pela datada postagem
    todasPostagens=Postagemgrupo.objects.filter(fk=idgrupo).order_by('-datapostagem')
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

def mapasHome(request):
    num = request.GET.get('num', None)
    num = int(num)

    mapas = Mapa.objects.all().order_by('valvisualizacoes')[:10]
    mapa = mapas[num]

    postagem = Postagem.objects.none()
    postagem = Postagem.objects.filter(idmapa=mapa).filter(
    idusuario=mapa.idusuario)
    getpostagem = postagem.first()

    if mapa is not None:
        #Chama a função de obter os dados da postagem
        dados = getDadosPostagem(getpostagem)
        #Serializa a postagem em JSON
        postagem = serializers.serialize('json', postagem);
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

def mapasHomePesquisa(request):
    num = request.GET.get('num', None)
    num = int(num)
    pesquisa = request.GET.get('pesquisa', None)

    mapas = pesquisar(pesquisa)
    mapa = mapas[num]

    postagem = Postagem.objects.none()
    postagem = Postagem.objects.filter(idmapa=mapa).filter(
    idusuario=mapa.idusuario)
    getpostagem = postagem.first()

    if mapa is not None:
        #Chama a função de obter os dados da postagem
        dados = getDadosPostagem(getpostagem)
        #Serializa a postagem em JSON
        postagem = serializers.serialize('json', postagem);
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

def novoMapa(request):
    if request.method=="POST":
        if request.POST.__contains__("LatIni"):
            return render(request, 'MapFindIt/CMVisib.html', {'Lat': request.POST.get('LatIni'), 'Lng': request.POST.get('LngIni')})
    else:
        return render(request, 'MapFindIt/CMPontoIni.html')

def criarAmizade(request):
    idCriador=int(request.GET.get('usuario', None))
    idAlvo=int(request.GET.get('alvo', None))
    #Cria o objeto amizade
    amizade = Amizade.objects.create(idusuario1=Usuario.objects.get(idusuario=idCriador), idusuario2=Usuario.objects.get(idusuario=idAlvo), datamizade=datetime.datetime.now(), aceita=True)
    amizade.save()
    data = {
        'erro': 0,
    }
    return JsonResponse(data)

def aceitarAmizade(request):
    idCriador=int(request.GET.get('usuario', None))
    idAlvo=int(request.GET.get('alvo', None))
    #Obtem o objeto amizade
    amizade = Amizade.objects.filter(idusuario1=idCriador).filter(idusuario2=idAlvo).first()
    if amizade is None:
        amizade = Amizade.objects.filter(idusuario2=idCriador).filter(idusuario1=idAlvo).first()
    #Altera para a amizade aceita
    amizade.aceita=False
    amizade.save()
    data = {
        'erro': 0,
    }
    return JsonResponse(data)

def recusarAmizade(request):
    idCriador=int(request.GET.get('usuario', None))
    idAlvo=int(request.GET.get('alvo', None))
    #Obtem o objeto amizade
    amizade = Amizade.objects.filter(idusuario1=idCriador).filter(idusuario2=idAlvo).first()
    if amizade is None:
        amizade = Amizade.objects.filter(idusuario2=idCriador).filter(idusuario1=idAlvo).first()
    #Remove o objeto amizade
    amizade.delete()
    data = {
        'erro': 0,
    }
    return JsonResponse(data)
