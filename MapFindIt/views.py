
from django.http import JsonResponse, HttpResponseForbidden, HttpResponse
from django.shortcuts import render, redirect, get_object_or_404
from django.core.exceptions import ObjectDoesNotExist
from django.core.files.base import ContentFile
from django.forms.models import model_to_dict
from django.core.mail import send_mail
from django.core import serializers
from django.utils import timezone
from django.db.models import Q
from PIL import Image
from .models import *
import binascii
import datetime
import hashlib
import io, os
import base64
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
            request.session['usuarioLogado']=usuario.idusuario
            return redirect("/home/")
        else:
            if request.POST.__contains__("email"): #O request é de login
                #Realiza o login
                usuarios = Usuario.objects.filter(emailusuario=request.POST.get('email')
                ).filter(senhausuario=hashlib.md5((request.POST.get('senha')+'cockles'
                ).encode()).hexdigest()).first()
                request.session['usuarioLogado']=usuarios.idusuario
                return redirect("/home/")
            else: #O request é padrão
                return render(request, 'MapFindIt/home.html', {})
    else:
        #Request é padrão
        #O usuário já está logado
        if request.session.__contains__('usuarioLogado'):
            return feed(request)
        return render(request, 'MapFindIt/home.html', {})

def feed(request):
    resultado=getDadosMenu(request)
    return render(request, 'MapFindIt/feed.html', {'usuario': resultado[0], 'todosAmigos': resultado[1], 'grupos': resultado[2], 'solicitacoesPendentes': resultado[3]})

#Pesquisa mapas pela String passada
def pesquisar(pesquisa):
    #Busca mapas pelo título
    result = Mapa.objects.filter(titulomapa__icontains=pesquisa).order_by('valaprovados', 'valvisualizacoes')
    #Contabiliza a quantidade de mapas encontrados pelo titulo
    controle = 0
    for n in result:
        controle += 1
    #Se for menor do que 10
    if controle < 10:
        tema = Tema.objects.filter(nomtema__icontains=pesquisa)
        for n in tema:
            result = result | Mapa.objects.filter(codtema=n.id)
        result = result.order_by('valaprovados', 'valvisualizacoes')
        #Contabiliza a quantidade de mapas encontrados pelo titulo + tema
        controle = 0
        for n in result:
            controle += 1
        #Se for menor do que 10 busca mapas pela descrição
        if controle < 10:
            result = result | Mapa.objects.filter(descmapa__icontains=pesquisa)
            result = result.order_by('valaprovados', 'valvisualizacoes')
    #Retorna os mapas encontrados segundo os parâmetros da pesquisa
    return result

#Pesquisa com Filtro
def filtro(request):
    resultado=getDadosMenu(request)
    return render(request, 'MapFindIt/filtro.html', {'usuario': resultado[0], 'todosAmigos': resultado[1], 'grupos': resultado[2], 'solicitacoesPendentes': resultado[3]})

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

def getDadosMenu(request):
    #Pega o usuario logado
    usuarioFull=get_object_or_404(Usuario, idusuario=request.session.get('usuarioLogado'))
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
    return [usuarioFull, todosAmigos, todosGrupos, countPendentes]

#função para renderizar o template da pagina de grupo
def grupo(request, idgrupo):
        member = False
        admim = False
        #Pega o usuario logado
        usuarioFull=get_object_or_404(Usuario, pk=request.session.get('usuarioLogado'))
        #Pega todas as informações do grupo
        try:
            grupoFull=Grupo.objects.get(pk=idgrupo)
        except grupoFull.DoesNotExist:
            raise Http404("Grupo inexistente")
        q1=Membrosgrupo.objects.filter(idusuario=usuarioFull.idusuario).filter(idgrupo=grupoFull.idgrupo).first()
        #verifica se o usuario e dono do grupo
        if usuarioFull.idusuario == grupoFull.idusuario.idusuario:
            member=True
            admim=True
        #verifica se o usuario e membro do grupo
        if q1 is not None:
            member=True
            #verifica se e adimistrador
            if q1.admim:
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
        return render(request, 'MapFindIt/grupo.html', {'usuario': usuarioFull, 'grupo': grupoFull, 'member':member, 'admim':admim, 'todosAmigos': todosAmigos, 'grupos': todosGrupos, 'solicitacoesPendentes': countPendentes})

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
        resultado=getDadosMenu(request)
        return render(request, 'MapFindIt/perfil.html', {'usuario': resultado[0], 'idPag': usuario, 'amigos':amigos, 'todosAmigos': resultado[1], 'grupos': resultado[2], 'solicitacoesPendentes': resultado[3]})
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
          resultado=getDadosMenu(request)
          return render(request, 'MapFindIt/perfil.html', {'usuario': resultado[0], 'idPag': usuario, 'amigos':amigos, 'todosAmigos': resultado[1], 'grupos': resultado[2], 'solicitacoesPendentes': resultado[3]})
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
              resultado=getDadosMenu(request)
              return render(request, 'MapFindIt/perfil.html', {'usuario': resultado[0], 'idPag': usuario, 'amigos':amigos, 'todosAmigos': resultado[1], 'grupos': resultado[2], 'solicitacoesPendentes': resultado[3]})
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
                  resultado=getDadosMenu(request)
                  return render(request, 'MapFindIt/perfil.html', {'usuario': resultado[0], 'idPag': usuario, 'amigos':amigos, 'todosAmigos': resultado[1], 'grupos': resultado[2], 'solicitacoesPendentes': resultado[3]})
              else: #Request padrão da pagina
                  #Obtem o dono do perfil
                  usuario = get_object_or_404(Usuario, idusuario=idusuario)
                  #Obtem o usuario logado
                  usuarioFull=get_object_or_404(Usuario, idusuario=request.session.get('usuarioLogado'))
                  #Verifica se o usuario logado e o dono do perfil sao amigos, para enviar à página
                  amigos=Amizade.objects.filter(idusuario1=idusuario).filter(idusuario2=request.session.get('usuarioLogado')).exists()
                  amigos=Amizade.objects.filter(idusuario2=idusuario).filter(idusuario1=request.session.get('usuarioLogado')).exists()
                  resultado=getDadosMenu(request)
                  return render(request, 'MapFindIt/perfil.html', {'usuario': resultado[0], 'idPag': usuario, 'amigos':amigos, 'todosAmigos': resultado[1], 'grupos': resultado[2], 'solicitacoesPendentes': resultado[3]})

def getDadosMapa(mapa):
    #Obtem os pontos do mapa
    todosPontos=Ponto.objects.filter(idmapa=mapa.idmapa)
    #Serializa eles em JSON
    pontos = serializers.serialize("json", todosPontos)
    #Cria queryset vazia
    qset = []
    #Itera pelos pontos e caso o ponto possua icone, é adicionado a "qset" o seu objeto
    for pt in todosPontos:
        #Caso esteja vazio o campo codicone exceção é lançada
        try:
            if pt.codicone:
                qset.append(pt.codicone)
        except ObjectDoesNotExist:
            #Continua o loop
            pass
    #Serializa os icones em JSON
    icones = serializers.serialize("json", qset)
    #Obtem todas as rotas do mapa
    todasRotas = Rota.objects.filter(idmapa=mapa.idmapa)
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
    todasAreas = Area.objects.filter(idmapa=mapa.idmapa)
    #Serializa as areas em JSON, utilizando a chave natural para a cor
    areas=serializers.serialize("json", todasAreas, use_natural_foreign_keys=True, use_natural_primary_keys=True)
    #Cria array para guardar todos os pontos das areas
    pontosAreasArr=[]
    for area in todasAreas:
        #Para cada area, adiciona ao array os seus pontos já serlializados em JSON
        pontosAreasArr.append(serializers.serialize("json", Pontoarea.objects.filter(idarea=area.idarea), use_natural_foreign_keys=True))
    #Serializa o array em JSON
    pontoAreas=json.dumps(pontosAreasArr)
    return [pontos, icones, rotas, pontoRotas, areas, pontoAreas,]

def getDadosPostagem(postagem):
    #Método para obter os dados de uma postagem
    #Obtem o mapa da postagem
    mapaObj = postagem.idmapa;
    #Serializa ele em JSON
    mapa=serializers.serialize("json", [mapaObj,]);
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
    res=getDadosMapa(mapaObj)
    #Retorna um array com todos os dados
    return [mapa, res[0], res[1], comentario, autores, res[2], res[3], res[4], res[5],]

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

def adicionarAvaliacao(request):
    #O usuario deve estar logado
    try:
        usuario = Usuario.objects.get(idusuario=int(request.GET.get('usuario')))
    except Usuario.DoesNotExist:
        #Usuario nao logado é proibido de avaliar
        return HttpResponseForbidden()
    #Pega o id do mapa
    mapaId = int(request.GET.get('mapa', None))
    #Obtem o objeto do mapa
    mapa=get_object_or_404(Mapa, idmapa=mapaId)
    #Pega a avaliacao
    iav = int(request.GET.get('aval', None))
    #Tenta obter o objeto da avaliação
    try:
        aval = Avaliacao.objects.get(idmapa=mapa,idusuario=usuario)
        if aval.valavaliacao == 0:
            aval.valavaliacao = iav
            if iav == 1:
                mapa.valaprovados+=1
            else:
                if iav == -1:
                    mapa.valreprovados+=1
        else:
            if aval.valavaliacao == 1:
                mapa.valaprovados-=1
                if iav == 1:
                    aval.valavaliacao = 0
                else:
                    if iav == -1:
                        aval.valavaliacao = -1
                        mapa.valreprovados+=1
            else:
                if aval.valavaliacao == -1:
                    mapa.valreprovados-=1
                if iav == 1:
                    aval.valavaliacao = 1
                    mapa.valaprovados+=1
                else:
                    if iav == -1:
                        aval.valavaliacao = 0
    except Avaliacao.DoesNotExist:
        aval = Avaliacao.objects.create(valavaliacao=iav,idmapa=mapa,idusuario=usuario)
        if iav == 1:
            mapa.valaprovados+=1
        else:
            if iav == -1:
                mapa.valreprovados+=1
    #Atualiza tabelas
    mapa.save()
    aval.save()
    return JsonResponse({})

def mapasGrupo(request, idgrupo):
    #Pega a posicao do mapa que deve ser carregado
    num = request.GET.get('num', None)
    num = int(num)
    #Pega o ID do usuario
    grupoFull=get_object_or_404(Grupo, pk=idgrupo)
    #Carrega todas as postagens do usuario logado, ordenando pela datada postagem
    todasPostagens=Postagemgrupo.objects.filter(fk=grupoFull.idgrupo).order_by('-datapostagem')
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

#Carrega os mapas da Home
def mapasHome(request):
    #Número do mapa e da div no qual será carregado
    num = request.GET.get('num', None)
    num = int(num)
    #Pega os dez primeiros mapas no BD, com maior quantidade de aprovações e visualizações
    mapas = Mapa.objects.all().order_by('valaprovados', 'valvisualizacoes')[:10]
    #Pega o mapa correspondente ao número da requisição Ajax
    mapa = mapas[num]
    #Inicializa postagem
    postagem = Postagem.objects.none()
    #Pega a postagem do autor do mapa correspondente
    postagem = Postagem.objects.filter(idmapa=mapa).filter(
    idusuario=mapa.idusuario)
    getpostagem = postagem.first()

    #Se houver mapas
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
    #Caso já se tenha carregado todas as postagens
    else:
        #Finaliza a requisição Ajax no lado do cliente
        data = {
            'erro': 1,
        }
        return JsonResponse(data)

#Responde ao Ajax de pesquisa de mapas
def mapasPesquisa(request):
    #Número do mapa e da div no qual será carregado
    num = request.GET.get('num', None)
    num = int(num)
    #Texto utilizado para encontrar mapas
    pesquisa = request.GET.get('pesquisa', None)
    #Retorna todos os mapas encontrados para o texto pesquisado
    mapas = pesquisar(pesquisa)
    #Pega o mapa correspondente ao número da requisição Ajax
    mapa = mapas[num]
    #Inicializa postagem
    postagem = Postagem.objects.none()
    #Pega a postagem do autor do mapa correspondente
    postagem = Postagem.objects.filter(idmapa=mapa).filter(
    idusuario=mapa.idusuario)
    getpostagem = postagem.first()

    #Se houver mapas
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
    #Caso já se tenha carregado todas as postagens ou não há mapas correspondentes
    else:
        #Finaliza a requisição Ajax no lado do cliente
        data = {
            'erro': 1,
        }
        return JsonResponse(data)

def novoMapa(request):
    if request.method=="POST" and request.POST.__contains__("temas"):
        #Se voltou do formulário de finalizar o mapa
        mapa=Mapa.objects.create(titulomapa = request.POST.get('nomeMapa'), descmapa = request.POST.get('descMapa'),
                                 idtvisibilidade = request.POST.get('opcVisib'), codtema = get_object_or_404(Tema, pk=request.POST.get('temas')),
                                 valvisualizacoes = 0, datamapa = timezone.now(), coordxinicial = request.POST.get('Lng'),
                                 coordyinicial = request.POST.get('Lat'), valaprovados = 0,
                                 valreprovados = 0, idusuario=get_object_or_404(Usuario, idusuario=request.session.get('usuarioLogado')))
        mapa.save()
        if mapa.idtvisibilidade=='A' or mapa.idtvisibilidade=='U':
            #Cria postagem do usuário autor do mapa, caso seja publico
            postagem=Postagem.objects.create(datapostagem = timezone.now(), horapostagem = datetime.datetime.now().replace(microsecond=0), idmapa=mapa, idusuario=get_object_or_404(Usuario, idusuario=request.session.get('usuarioLogado')))
            postagem.save()
        request.session['primeira']='1'
        return redirect("/editarMapa/"+str(mapa.pk))
    else:
        return render(request, 'MapFindIt/CMVisib.html', {})

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

def getTemas(request):
    #Pega todos os temas e retorna ao javascript
    temas = Tema.objects.all()
    temas = serializers.serialize('json', temas)
    data = {
        'temas': temas,
    }
    return JsonResponse(data)

def adicionarTema(request):
    #Pega o nome do tema criado
    nomeTema = request.GET.get('nomeTema')
    #Verifica se o tema já existe
    if not Tema.objects.filter(nomtema=nomeTema):
        #Se não existir cria um tema com o nome
        tema=Tema.objects.create(nomtema=nomeTema)
        tema.save()
        data = {
            'erro': 0,
        }
    else:
        #Se existir retorna erro
        data = {
            'erro': 1,
        }
    return JsonResponse(data)

def editarMapa(request, idmapa):
    #Identifica primeiro acesso para criar ponto em ponto inicial do mapa
    primeira=False
    if request.session.__contains__('primeira') and request.session['primeira']=='1':
        primeira=True
        request.session['primeira']=None
    mapa = get_object_or_404(Mapa, idmapa=idmapa)
    resultado=getDadosMenu(request)
    return render(request, 'MapFindIt/editar.html', {'mapa': mapa, 'usuario': resultado[0], 'todosAmigos': resultado[1], 'grupos': resultado[2], 'prim':primeira})

def carregarMapaEditar(request):
    #Pega o ID do mapa
    id = request.GET.get('id', None)
    #Carrega o mapa
    mapa = get_object_or_404(Mapa, idmapa=id)
    #Chama a função de obter os dados do mapa
    dados = getDadosMapa(mapa)
    #Retorna ao AJAX todos os dados
    data = {
        'mapa': serializers.serialize("json", [mapa,]),
        'pontos': dados[0],
        'icones': dados[1],
        'rotas': dados[2],
        'pontoRotas': dados[3],
        'areas': dados[4],
        'pontoAreas': dados[5],
    }
    return JsonResponse(data)

def criarPonto(request):
    #Pega o ID do mapa
    idMapa=int(request.GET.get('idMapa', None))
    #Titulo do Ponto
    titulo = request.GET.get('titulo', None)
    #Descrição do Ponto
    desc = request.GET.get('desc', None)
    #Coordenadas do Ponto
    coordx = request.GET.get('coordx', None)
    coordy = request.GET.get('coordy', None)
    #Carrega o mapa
    mapa = get_object_or_404(Mapa, idmapa=idMapa)
    #Carrega o usuario
    idUsuario = int(request.GET.get('idUsuario', None))
    usuario = get_object_or_404(Usuario, idusuario=idUsuario)
    #Cria o ponto
    ponto = Ponto.objects.create(coordx = coordx,
    coordy=coordy,
    idmapa=mapa,
    nomponto=titulo,
    descponto=desc,
    idusuario=usuario,
    idtponto='P')
    #Salva o ponto
    ponto.save()
    data = {
        'id': ponto.idponto
    }
    return JsonResponse(data)

def criarImagemPonto(request, idPonto):
    #Blob da Imagem
    blob = request.POST.get('img', None)
    #Cria a foto a partir do blob se ele existir
    format, imgstr = blob.split(';base64,')
    ext = format.split('/')[-1]
    #Deleta a foto se ela existir
    if os.path.exists("MapFindIt/static/MapFindIt/imagemPonto/"+str(idPonto)+"."+ext):
        os.remove("MapFindIt/static/MapFindIt/imagemPonto/"+str(idPonto)+"."+ext)
    data = ContentFile(base64.b64decode(imgstr), name=str(idPonto) + "." + ext)
    ponto= get_object_or_404(Ponto, idponto=idPonto)
    #Adiciona a foto ao objeto Ponto
    ponto.fotoponto=data
    #Salva o ponto
    ponto.save()
    #Obtem a imagem do ponto
    image = Image.open(ponto.fotoponto)
    #Muda o tamanho da imagem para 170X170
    size = (170, 170)
    image=image.resize(size, Image.ANTIALIAS)
    #Salva a nova imagem
    image.save(ponto.fotoponto.path)
    return JsonResponse({'sucesso': 1})

def getTodosIcones(request):
    idUser=int(request.GET.get('id', None))
    usuario=get_object_or_404(Usuario, idusuario=idUser)
    queryset=Iconespontos.objects.filter(idusuario=usuario)
    queryset=queryset | Iconespontos.objects.filter(~Q(idusuario = usuario))
    return JsonResponse({'icones': serializers.serialize("json", queryset)})

def salvarIcone(request):
    idPonto=int(request.GET.get('id', None))
    idIcone=int(request.GET.get('idIcone', None))
    ponto=get_object_or_404(Ponto, idponto=idPonto)
    icone=get_object_or_404(Iconespontos, codicone=idIcone)
    ponto.codicone=icone
    ponto.save()
    return JsonResponse({'sucesso': 1})

def criarIcone(request):
    idUsuario=int(request.POST.get('usuario', None))
    nome=request.POST.get('nome', None)
    icone=Iconespontos.objects.create(nomeicone=nome, idusuario=get_object_or_404(Usuario, idusuario=idUsuario))
    #Blob da Imagem
    blob = request.POST.get('icone', None)
    #Cria a foto a partir do blob se ele existir
    format, imgstr = blob.split(';base64,')
    ext = format.split('/')[-1]
    #Deleta a foto se ela existir
    if os.path.exists("MapFindIt/static/MapFindIt/imagemIcones/"+str(icone.codicone)+"."+ext):
        os.remove("MapFindIt/static/MapFindIt/imagemIcones/"+str(icone.codicone)+"."+ext)
    data = ContentFile(base64.b64decode(imgstr), name=str(icone.codicone) + "." + ext)
    icone.imgicone=data
    #Salva o icone
    icone.save()
    #Obtem a imagem do icone
    image = Image.open(icone.imgicone)
    #Muda o tamanho da imagem para 32X32
    size = (32, 32)
    image=image.resize(size, Image.ANTIALIAS)
    #Salva a nova imagem
    image.save(icone.imgicone.path)
    return JsonResponse({'sucesso': 1})

def deletarIcone(request):
    idIcone=int(request.GET.get('id', None))
    iconeDeletar=get_object_or_404(Iconespontos, codicone=idIcone)
    pontos = Ponto.objects.filter(codicone=iconeDeletar)
    for ponto in pontos:
        ponto.codicone=None
        ponto.save()
    iconeDeletar.delete()
    return JsonResponse({'sucesso': 1})

def criarArea(request):
    nome = request.POST.get('nome')
    desc = request.POST.get('desc')
    idUsuario = request.POST.get('usuario')
    idMapa = request.POST.get('mapa')
    pontosX = json.loads(request.POST.get('pontosX'))
    pontosY = json.loads(request.POST.get('pontosY'))
    usuario = get_object_or_404(Usuario, idusuario=idUsuario)
    mapa = get_object_or_404(Mapa, idmapa=idMapa)
    cor=None
    if 'nomeCor' in request.POST:
        cor = Cor.objects.create(nomecor=request.POST.get('nomeCor'), r=request.POST.get('r'), g=request.POST.get('g'), b=request.POST.get('b'))
        cor.save()
    else:
        cor = get_object_or_404(Cor, codcor=int(request.POST.get('idCor')))
    area = Area.objects.create(idmapa = mapa, nomarea=nome, descarea=desc, codcor=cor, idusuario=usuario)
    area.save()
    for x, y in zip(pontosX, pontosY):
        ponto = Ponto.objects.create(coordx=x, coordy=y, idusuario=usuario, idmapa=mapa, idtponto='A')
        ponto.save()
        pontoarea = Pontoarea.objects.create(idarea=area, idponto=ponto)
        pontoarea.save()
    return JsonResponse({'sucesso': 1})

def verificaCor(request):
    r = request.GET.get('r');
    g = request.GET.get('g');
    b = request.GET.get('b');
    cor = Cor.objects.filter(r=r, g=g, b=b)
    if cor.exists():
        cor=cor.first()
        return JsonResponse({'existe': 1, 'id': cor.codcor})
    else:
        return JsonResponse({'existe': 0})

def criarRota(request):
    nome = request.POST.get('nome')
    desc = request.POST.get('desc')
    idUsuario = request.POST.get('usuario')
    idMapa = request.POST.get('mapa')
    pontosX = json.loads(request.POST.get('pontosX'))
    pontosY = json.loads(request.POST.get('pontosY'))
    usuario = get_object_or_404(Usuario, idusuario=idUsuario)
    mapa = get_object_or_404(Mapa, idmapa=idMapa)
    cor=None
    if 'nomeCor' in request.POST:
        cor = Cor.objects.create(nomecor=request.POST.get('nomeCor'), r=request.POST.get('r'), g=request.POST.get('g'), b=request.POST.get('b'))
        cor.save()
    else:
        cor = get_object_or_404(Cor, codcor=int(request.POST.get('idCor')))
    rota = Rota.objects.create(idtevitar=1, idmapa=mapa, nomerota=nome, descrota=desc, codcor=cor, idusuario=usuario)
    rota.save()
    cont=0
    for x, y in zip(pontosX, pontosY):
        ponto = Ponto.objects.create(coordx=x, coordy=y, idusuario=usuario, idmapa=mapa, idtponto='R')
        ponto.save()
        pontoarea = RotaPonto.objects.create(idrota=rota, idponto=ponto, seqponto=cont)
        pontoarea.save()
        cont+=1
    return JsonResponse({'sucesso': 1})

def deslogar(request):
    #Remove o objeto de sessão do usuário
    request.session.pop('usuarioLogado', None)
    #Redireciona para a página inicial do sistema
    return redirect('/')

def compartilhar(request):
    #Obtem o usuário
    usuario = Usuario.objects.get(idusuario=int(request.GET.get('usuario')))
    #Pega o id do mapa
    mapaId = int(request.GET.get('mapa', None))
    #Obtem o objeto do mapa
    mapa=get_object_or_404(Mapa, idmapa=mapaId)
    #Cria objeto postagem
    postagem = Postagem.objects.create(datapostagem = timezone.now(), horapostagem = datetime.datetime.now().replace(microsecond=0), idmapa = mapa, idusuario = usuario)
    postagem.save()
    return JsonResponse({'sucesso': 1})

def recuperarSenha(request):
    email = request.POST.get('email')
    if Usuario.objects.filter(emailusuario=email).exists():
        codigo = CodigoRecuperarSenha.objects.create(idusuario=Usuario.objects.get(emailusuario=email), codigo=binascii.hexlify(os.urandom(32)).decode())
        codigo.save()
        send_mail('Recuperar Senha', 'Para recuperar a sua senha entre no link: https://www.mapfindit.com/redefinir?cod='+codigo.codigo, 'mapfindit@gmail.com', [codigo.idusuario.emailusuario], fail_silently=True)
    return redirect('/')

def redefinirSenha(request):
    #Se foi preenchido o formulario
    if request.method=='POST':
        senha = request.POST.get('senha')
        senha = hashlib.md5((senha+'cockles').encode()).hexdigest()
        request.session.pop('cod', None)
        user = CodigoRecuperarSenha.objects.get(codigo=request.POST.get('cod')).idusuario
        user.senhausuario = senha
        user.save()
        return redirect('/')
    else:
        cod = request.GET.get('cod')
        return render(request, 'MapFindIt/redefinirSenha.html', {'cod':cod})
