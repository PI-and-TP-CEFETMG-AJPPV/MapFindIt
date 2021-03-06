from django.conf.urls import include, url
from . import views
from . import pesquisa

urlpatterns = [
    url(r'^$', views.home),
    url(r'^home/$', views.feed, name="feed"),
    url(r'^perfil/(?P<idusuario>[0-9]+)/$', views.perfil, name="perfil"),
    url(r'^grupo/(?P<idgrupo>[0-9]+)/$', views.grupo),
    url(r'^ajax/publicarGrupo/$', views.publicarGrupo),
    url(r'^ajax/removerGrupo/$', views.removerMapasGrupo),
    url(r'^ajax/mapasRemover/$', views.mapasRemover),
    url(r'^ajax/criarGrupo/$', views.criarGrupo),
    url(r'^ajax/pesquisaGrupo/$', views.pesquisaMapasGrupo),
    url(r'^ajax/editarGrupo/$', views.editarGrupo),
    url(r'^ajax/entrarGrupo/$', views.entrarGrupo),
    url(r'^ajax/getMembrosGrupo/$', views.getMembrosGrupo),
    url(r'^ajax/checkarEmail/$', views.checkarEmail),
    url(r'^ajax/checkarLogin/$', views.checkarLogin),
    url(r'^ajax/mapasPublicar/$', views.mapasPublicar),
    url(r'^ajax/checkarSenha/$', views.checkarSenha),
    url(r'^ajax/carregarMapasPerfil/$', views.mapasPerfil),
    url(r'^ajax/carregarMapasGrupo/$', views.mapasGrupo),
    url(r'^ajax/carregarMapasHome/$', views.mapasHome),
    url(r'^ajax/salvarComentario/$', views.salvarComentario),
    url(r'^ajax/deletarComentario/$', views.deletarComentario),
    url(r'^ajax/bloqueioComentarios/$', views.bloqueioComentarios),
    url(r'^ajax/adicionarView/$', views.adicionarView),
    url(r'^ajax/adicionarAvaliacao/$', views.adicionarAvaliacao),
    url(r'^ajax/criarAmizade/$', views.criarAmizade),
    url(r'^ajax/aceitarAmizade/$', views.aceitarAmizade),
    url(r'^ajax/recusarAmizade/$', views.recusarAmizade),
    url(r'^ajax/getIcone/$', views.getIcone),
	url(r'^novoMapa/$', views.novoMapa),
    url(r'^ajax/getTemas/$', views.getTemas),
    url(r'^ajax/getNotif/$', views.getNotif),
    url(r'^ajax/deletarIcone/$', views.deletarIcone),
    url(r'^ajax/adicionarTema/$', views.adicionarTema),
    url(r'^editarMapa/(?P<idmapa>[0-9]+)/$', views.editarMapa, name="editar"),
    url(r'^ajax/carregarMapa/$', views.carregarMapa),
    url(r'^ajax/criarPonto/$', views.criarPonto),
    url(r'^ajax/modalEditarIcone/$', views.editarIcone),
    url(r'^ajax/criarImagemPonto/(?P<idPonto>[0-9]+)/$', views.criarImagemPonto),
    url(r'^ajax/getTodosIcones/$', views.getTodosIcones),
    url(r'^ajax/salvarIcone/$', views.salvarIcone),
    url(r'^ajax/criarIcone/$', views.criarIcone),
    url(r'^ajax/criarArea/$', views.criarArea),
    url(r'^ajax/verificaCor/$', views.verificaCor),
    url(r'^ajax/criarRota/$', views.criarRota),
    url(r'^deslogar/$', views.deslogar),
    url(r'^ajax/compartilhar/$', views.compartilhar),
    url(r'^recuperarSenha/$', views.recuperarSenha),
    url(r'^redefinir/$', views.redefinirSenha, ),
    url(r'^filtro/$', views.filtro),
    url(r'^ajax/mapasMesclar/$', views.mapasMesclar),
    url(r'^fazerMescla/$', views.fazerMescla),
    url(r'^meusMapas/$', views.meusMapas),
    url(r'^exibirMapa/(?P<idmapa>[0-9]+)/$', views.exibirMapa, name="exibir"),
    url(r'^ajax/deletarPonto/$', views.deletarPonto),
    url(r'^ajax/deletarArea/$', views.deletarArea),
    url(r'^ajax/deletarRota/$', views.deletarRota),
    url(r'^ajax/mapasFeed/$', views.mapasFeed),

    url(r'^ajax/carregarMapasPesquisa/$', pesquisa.mapasPesquisa),
    url(r'^ajax/carregarGruposPesquisa/$', pesquisa.gruposPesquisa),
    url(r'^ajax/carregarPessoasPesquisa/$', pesquisa.pessoasPesquisa),
    url(r'^pesquisadebug/$', pesquisa.debug)
]
