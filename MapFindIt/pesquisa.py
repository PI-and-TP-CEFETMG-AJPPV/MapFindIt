from .views import *
from .models import *
from django.http import JsonResponse

#Pesquisa mapas pela String passada
def pesquisarMapas(pesquisa):
    #Busca mapas pelo título
    result = Mapa.objects.filter(titulomapa__icontains=pesquisa)
    #Busca mapas pelo tema
    tema = Tema.objects.filter(nomtema__icontains=pesquisa)
    for n in tema:
        result = result | Mapa.objects.filter(codtema=n.id)
    #Busca mapas pela descrição
    result = result | Mapa.objects.filter(descmapa__icontains=pesquisa)
    #Retira os mapas privados do resultado
    result = result.exclude(idtvisibilidade='P')
    #Ordena a pesquisa
    result = result.order_by('valaprovados', 'valvisualizacoes')
    #Retorna os mapas encontrados segundo os parâmetros da pesquisa
    return result

#Responde ao Ajax de pesquisa de mapas
def mapasPesquisa(request):
    #Número do mapa e da div no qual será carregado
    num = request.GET.get('num', None)
    num = int(num)
    #Texto utilizado para encontrar mapas
    pesquisa = request.GET.get('pesquisa', None)
    #Retorna todos os mapas encontrados para o texto pesquisado
    mapas = pesquisarMapas(pesquisa)
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
        postagem = serializers.serialize('json', postagem)
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

#Pesquisa grupos pela String passada
def pesquisarGrupos(pesquisa):
    #Busca grupos pelo nome
    result1 = Grupo.objects.filter(nomegrupo__icontains=pesquisa)
    #Busca grupos pela descrição
    result2 = Grupo.objects.filter(descgrupo__icontains=pesquisa)
    #Junta os resultados em apenas um
    result = result1 | result2
    #Ordena a pesquisa
    result = result.order_by('nomegrupo', 'idgrupo')
    #Retorna os resultados encontrados
    return result

#Responde ao Ajax de pesquisa de grupos
def gruposPesquisa(request):
    #Número do grupo e da div no qual será carregado
    num = request.GET.get('num', None)
    num = int(num)
    #Texto utilizado para encontrar grupos
    pesquisa = request.GET.get('pesquisa', None)
    #Retorna todos os grupos encontrados para o texto pesquisado
    grupos = pesquisarGrupos(pesquisa)
    #Pega o grupo correspondente ao número da requisição Ajax
    grupo = grupos[num]
    #Se houver grupos
    if grupo is not None:
        #Retorna ao AJAX todos os dados
        data = {
            'idgrupo': grupo.idgrupo,
            'nomegrupo': grupo.nomegrupo,
            'descgrupo': grupo.descgrupo,
            'r': grupo.codcor.r,
            'g': grupo.codcor.g,
            'b': grupo.codcor.b,
            'privado': grupo.privado,
        }
        return JsonResponse(data)
    #Caso já se tenha carregado todas os grupos ou não há correspondentes à pesquisa
    else:
        #Finaliza a requisição Ajax no lado do cliente
        data = {
            'erro': 1,
        }
        return JsonResponse(data)

#Pesquisa pessoas pela String passada
def pesquisarPessoas(pesquisa):
    #Busca pessoas pelo primeiro nome
    result1 = Usuario.objects.filter(primnomeusuario__icontains=pesquisa)
    #Busca pessoas pelo segundo nome
    result2 = Usuario.objects.filter(ultnomeusuario__icontains=pesquisa)
    #Junta os resultados em apenas um
    result = result1 | result2
    #Ordena a pesquisa
    result = result.order_by('ultnomeusuario', 'idusuario')
    #Retorna os resultados encontrados
    return result

#Responde ao Ajax de pesquisa de pessoas
def pessoasPesquisa(request):
    #Número da pessoa e da div no qual será carregada
    num = request.GET.get('num', None)
    num = int(num)
    #Texto utilizado para encontrar pessoas
    pesquisa = request.GET.get('pesquisa', None)
    #Retorna todas as pessoas encontrados para o texto pesquisado
    pessoas = pesquisarPessoas(pesquisa)
    #Pega a pessoa correspondente ao número da requisição Ajax
    pessoa = pessoas[num]
    #Se houver pessoas
    if pessoa is not None:
        #Retorna ao AJAX todos os dados
        data = {
            'idusuario': pessoa.idusuario,
            'primnomeusuario': pessoa.primnomeusuario,
            'emailusuario': pessoa.emailusuario,
            'datanascimento': pessoa.datanascimento,
            'idtsexo': pessoa.idtsexo,
            'ultnomeusuario': pessoa.ultnomeusuario,
            #'foto': pessoa.foto,
        }
        return JsonResponse(data)
    #Caso já se tenha carregado todas as pessoas ou não há correspondentes à pesquisa
    else:
        #Finaliza a requisição Ajax no lado do cliente
        data = {
            'erro': 1,
        }
        return JsonResponse(data)

#Serve apenas para testes 
def debug(request):
    vteste = pesquisarMapas("Teste")
    print("\n\n\n")
    print(vteste)
    print("\n\n\n")
    print(vteste[13])
    print("\n\n\n")
    postagem = Postagem.objects.filter(idmapa=vteste[13]).filter(
    idusuario=vteste[13].idusuario)
    getpostagem = postagem.first()
    print(getpostagem)
    print("\n\n\n")
