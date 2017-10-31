function modalPublicar(idgrupo){
  $('#modalDinamico').empty();
	let conteudo=`<div class="modal fade" id="modalPublicar-mapa" aria-hidden="true">
		<div class="modal-dialog">
			<div class="modal-content">
				<div class="modal-header">
					<button type="button" class="close" onclick='$("#modalPublicar-mapa").modal("hide");' aria-hidden="true">
						×
					</button>
					<h4 class="modal-title">
						Publicar Mapa no grupo
					</h4>
				</div>
				<div class="modal-body">
                    <form id="searchForm"  method="GET" action="javascript:pesquisarMapas(${idgrupo})" style="order:2;">
                        <div class="input-group">
                                    <input type="text" class="form-control" placeholder="Pesquise o mapa a ser postado" id="pesquisarMapas" name="pesquisaMescla" value="">
                        <div class="input-group-btn">
                            <button type="submit" class="btn btn-default" style="border=1px">Pesquisar</button>
                        </div>
                            </div>
                    </form>
                    <br>
                    <div id="mapasPostar" style="height: 70vh; overflow-y: scroll;">
                    </div>
                </div>
            </div>
        </div>
    </div>`
		$('#modalDinamico').html(conteudo);
		$('#modalPublicar-mapa').modal('show');
}
//Função para converter cores
function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function editarGrupo(idgrupo){
let privacidade;
corRGB = hexToRgb($('#corGrupo').val());
  $('#criarIconeForm').click(function () {
    privacidade = $("input[name='Privacidade']:checked").val();
  });
  $.ajax({
      url: '/ajax/editarGrupo/',
      type: 'GET',
      data: {
        'nome': $('#nomeGrupo').val(),
        'desc': $('#desc').val(),
        'r': corRGB.r,
        'b': corRGB.b,
        'g': corRGB.g,
        'Privacidade': privacidade,
        'id': idgrupo,
        'csrfmiddlewaretoken': $('input[name="csrfmiddlewaretoken"]').val()
      },
      dataType: 'json',
      success: function (data) {
        $('#modalGrupos').modal('hide');

      }
  });
}
function modalRemoverMapa(idgrupo){
  $('#modalDinamico').empty();
	let conteudo=`<div class="modal fade" id="modalPublicar-mapa" aria-hidden="true">
		<div class="modal-dialog">
			<div class="modal-content">
				<div class="modal-header">
					<button type="button" class="close" onclick='$("#modalPublicar-mapa").modal("hide");' aria-hidden="true">
						×
					</button>
					<h4 class="modal-title">
						Remover Mapa do grupo
					</h4>
				</div>
				<div class="modal-body">
                    <form id="searchForm"  method="GET" action="javascript:pesquisarMapasRemover(${idgrupo})" style="order:2;">
                        <div class="input-group">
                                    <input type="text" class="form-control" placeholder="Pesquise o mapa a ser postado" id="pesquisarMapas" name="pesquisaMescla" value="">
                        <div class="input-group-btn">
                            <button type="submit" class="btn btn-primary">Pesquisar</button>
                        </div>
                            </div>
                    </form>
                    <br>
                    <div id="mapasPostar" style="height: 70vh; overflow-y: scroll;">
                    </div>
                </div>
            </div>
        </div>
    </div>`
		$('#modalDinamico').html(conteudo);
		$('#modalPublicar-mapa').modal('show');
}
function entrar(id, idgrupo){
  $.ajax({
    url: '/ajax/entrarGrupo/',
    data: {
      'id': id,
      'idGrupo': idgrupo
    },
    dataType: 'json',
    success: function (data) {
    }
  });
}
function pesquisarMapasRemover(idgrupo){
   let pesquisa = $("#pesquisarMapas").val();
   $.ajax({
        url: '/ajax/mapasRemover/',
        data: {
          'pesquisa': pesquisa
        },
        dataType: 'json',
        success: function (data) {
           mapas=JSON.parse(data.mapas);
           $('#mapasPostar').empty();
           for(let i=0; i<mapas.length; i++){
               $('#mapasPostar').append(`<div class="col-md-12">
              <div class="card-container mapaMesclar" id="mapaMesclar${mapas[i][0]}">
                <div class="card">
                  <div class="content">
                      <div class="main">
                          <h4>${mapas[i][1]}</h4>
                          <p style="text-align: left">${mapas[i][2]}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>`);
              $('#mapaMesclar'+mapas[i][0]).on('click', function(){
                  let id = $(this).attr('id').substring(11);
                  $('#modalDinamico').empty();
                    let conteudo=`<div class="modal fade" id="modal-confirmar-post" aria-hidden="true">
                        <div class="modal-dialog">
                            <div class="modal-content">
                                <div class="modal-header">
                                    <button type="button" class="close" onclick="$('#modal-confirmar-post').modal('hide'); $('body').removeClass().removeAttr('style');$('.modal-backdrop').remove();" aria-hidden="true">
                                        ×
                                    </button>
                                    <h4 class="modal-title">
                                        Confirmar Postagen
                                    </h4>
                                </div>
                                <div class="modal-body">
                                    <h4>Você tem certeza que deseja remover esse mapa?</h4>
                                    <div class="modal-footer">
                                        <button class="btn btn-success" onclick="Remover(${id},${idgrupo});$('#modalPublicar-mapa').modal('hide');
                                        $('body').removeClass().removeAttr('style');$('.modal-backdrop').remove();$('#modal-confirmar-post').modal('hide')" id="confirmarpublicacao">Confirmar</button>
                                        <button class="btn btn-danger" onclick="$('#modalPublicar-mapa').modal('hide');
                                        $('body').removeClass().removeAttr('style');$('.modal-backdrop').remove();$('#modal-confirmar-post').modal('hide')">Cancelar</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>`;
                    $('#modalDinamico').html(conteudo);
                    $('#modal-confirmar-post').modal('show');
              })
           }
        }
    });
}
function definirCorFonte(r, g,b){
  let cor;
  //Algoritmo para detectar melhor cor da fonte
  let a = 1 - ( 0.299 * Number(r) + 0.587 * Number(g) + 0.114 * Number(b)/255);
  if (a < 0.5)
    $("#texto").css('color', 'white');
  else
    $("#texto").css('color', 'black');

}
function pesquisarMapas(idgrupo){
   let pesquisa = $('#pesquisarMapas').val();
   $.ajax({
        url: '/ajax/mapasPublicar/',
        data: {
          'pesquisa': pesquisa
        },
        dataType: 'json',
        success: function (data) {
          mapas=JSON.parse(data.mapas);
          $('#mapasMesclar').empty();
          for(let i=0; i<mapas.length; i++){
              $('#mapasPostar').append(`<div class="col-md-12">
             <div class="card-container mapaMesclar" id="mapasPostar${mapas[i][0]}">
               <div class="card">
                 <div class="content">
                     <div class="main">
                         <h4>${mapas[i][1]}</h4>
                         <p style="text-align: left">${mapas[i][2]}</p>
                         <a class="small" style="text-align: left" href="/exibirMapa/${mapas[i][0]}">Ver Mapa</a>
                     </div>
                   </div>
                 </div>
               </div>
             </div>`);
             $('#mapasPostar'+mapas[i][0]).on('click', function(){
                 let id = $(this).attr('id').substring(11);
                 $("#modalPublicar-mapa").modal("hide");
                 $('#modalDinamico').empty();
                   let conteudo=`<div class="modal fade" id="modal-confirmar-post" aria-hidden="true">
                       <div class="modal-dialog">
                           <div class="modal-content">
                               <div class="modal-header">
                                   <button type="button" class="close" onclick="$('#modalPublicar-mapa').modal('hide'); $('body').removeClass().removeAttr('style');$('.modal-backdrop').remove();" aria-hidden="true">
                                       ×
                                   </button>
                                   <h4 class="modal-title">
                                       Confirmar Mescla
                                   </h4>
                               </div>
                               <div class="modal-body">
                                   <h4>Você tem certeza que deseja publicar esse mapa?</h4>
                                   <div class="modal-footer">
                                       <button class="btn btn-success" onclick="publicar(${id});" id="confirmarMesclaBtn">Confirmar</button>
                                       <button class="btn btn-danger" onclick="$('#modalPublicar-mapa').modal('hide'); $('body').removeClass().removeAttr('style');$('.modal-backdrop').remove();$('#modal-confirmar-post').modal('hide');">Cancelar</button>
                                   </div>
                               </div>
                           </div>
                       </div>
                   </div>`;
                    $('#modalDinamico').html(conteudo);
                    $('#modal-confirmar-post').modal('show');
              })
           }
        }
    });
}
//lista os usuarios
function getMembro(idgrupo){
  $.ajax({
      url: 'ajax/getMembrosGrupo/',
      data: {
        'idgrupo': idgrupo
      },
      dataType: 'json',
      success: function (data) {
         if(data.icones){
             $('#modalDinamico').empty();
             let conteudo=`
             <div class="modal fade" style="top:-5%;" id="modal-membros" aria-hidden="true">
               <div class="modal-dialog" style="width: 80vw;">
                 <div class="modal-content">
                   <div class="modal-header">
                     <button type="button" class="close" onclick='$("#modal-membros").modal("hide");' aria-hidden="true">
                       ×
                     </button>
                     <h4 class="modal-title">
                       Membros Grupo
                     </h4>
                   </div>
                   <div class="modal-body" style="overflow: scroll; overflow-x: hidden; height: 80vh;">
                     <div class="centerDiv">
                        <input id="filtrarMembros" type="text" placeholder="Filtrar Membros" style="width:96%; height:90%;">
                        <br>
                        <br>
                        <br>
                     </div>
                     <div id="container-membros" style="display: flex; flex-direction: row; flex-wrap: wrap;">

                     </div>
                   </div>
                   <div class="modal-footer">
                     <button type="button" id="btn" class="btn btn-primary"> fechar </button>
                   </div>
                 </div>
               </div>
             </div>
             `;
             $('#modalDinamico').html(conteudo);
             let icones=JSON.parse(data.membros);
             let container=$("#container-membros");
             for(let i=0; i<membros.length; i++){
                item=membros[i].fields;
                $('#container-membros').append(`
                  <div id='membro${membros[i].pk}' class="imagemIcone centerDiv">
                    <img src='${imgUrl}MapFindIt/imagemUsers/${membros[i].foto}.png'>
                    <p>${item.primnomeusuario}</p>
                  </div>
                  `);
             }
             /*$('.imagemIcone').on('click', function(){
                 $('.imagemIcone').removeClass('iconeEscolhido');
                 $(this).addClass('iconeEscolhido');
                 //Salva o id do icone (id do elemento retirando-se a palavra icone)
                 iconeEscolhido=$(this).attr('id').substring(5);
								 $('#btnDeletar').on('click', function(){
									 deletarIcone(iconeEscolhido);
								 });
             });*/
             $('#filtrarIcones').keyup(function(event) {
                 //Para cada icone carregado
                 $(".imagemIcone").each(function(i, item){
                   //Pega o objeto JQuery da div do icone
                   item=$(item);
                   //Pega o titulo do icone para identifica-lo
                   let parag = item.children('p');
                   //Se o nome conter a string pesquisada
                   if(parag.text().indexOf($("#filtrarMembros").val())!==-1){
                     //Mostra o icone
                     item.show();
                   }else{
                     //Esconde o icone
                     item.hide();
                   }
                 });
             });
             $('#modal-membros').modal('show');
          }
      }
    });
}
function Remover(id, idgrupo){
  $.ajax({
    url: '/ajax/removerGrupo/',
    data: {
      'id': id,
      'idgrupo': idgrupo
    },
    dataType: 'json',
    success: function (data) {
        $('#modal-confirmar-post').modal('hide');
        $('#modalDinamico').empty();
        carregarMapas(idGrupo);
    }
  });
}
function publicar(id){

  $.ajax({
    url: '/ajax/publicarGrupo/',
    data: {
      'id': id,
      'idgrupo': idGrupo
    },
    dataType: 'json',
    success: function (data) {
      $('body').removeClass().removeAttr('style');$('.modal-backdrop').remove();
      $('#modal-confirmar-post').modal('hide');
      $('#modalDinamico').empty();
      carregarMapas(idGrupo);
    }
  });
}
function pesquisarBar2(){
  $('#divMapas').empty();
  let conteudo=`<div class="row">
    <div class="col-md-8 col-md-offset-2 white" >
      <div class="center">
        <h1 id="texto">{{grupo.nomegrupo}}</h1>
        <br>
        <h4>{{grupo.descgrupo}}</h1>
      </div>
    </div>
  </div>`;
    $('#opcMenu').html(conteudo);
}
function pesquisarBar(){
  $('#opcMenu').empty();
  let conteudo=`<div class="row">
    <div class="col-md-8 col-md-offset-2" >
      <br>
      <div class="center">
        <form class="form-group" id="SearchForm" action="javascript:pesquisarMapasGrupo()"  method="GET" style="order:2;background: white">
          <div class="input-group" style="border:1px solid #444;">
            <input type="text" class="form-control input-lg" placeholder="Digite o que será pesquisado" id="pesquisa" name="pesquisa" value="" style="border: none;">
              <div class="input-group-btn">
                <button type="submit" class="btn button-default" style="background: white; color: black; font-weight: bold;border:none;"><span class="glyphicon glyphicon-search" style="color: black; font-size:1.5em;"></span></button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>`;
    $('#opcMenu').html(conteudo);
}
//Variáveis globais
//Os itens são carregados em grupos de 10 em 10
var mapasLoaded = 1;

//Definição de valores
//Função para pegar o valor de um parâmetro request
function get(name){
	if(name=(new RegExp('[?&]'+encodeURIComponent(name)+'=([^&]*)')).exec(location.search))
	return decodeURIComponent(name[1]);
}
//Busca mapas segundo a pesquisa passada
function carregarMapas(idgrupo) {
  $("#divMapas").empty();
  let div=$("#divMapas");
	for(let i=0; i<10; i++){
		$.ajax({
			url: '/ajax/carregarMapasGrupo/',
			data: {
				'num': ((Number(mapasLoaded)-Number(1))*Number(10))+Number(i),
        'id': parseInt(idGrupo)
			},
			dataType: 'json',
			success: function (data) {
				//Se todas as 10 postagens tiverem sido carregas
				if(data.erro){
					if(i==0){
						$('#next').attr("disabled", true);
						$('#back').click();
					}else{
						$('#next').attr("disabled", true);
					}
					return;
				}
				//Solução para a utilização do prepararPostagem
				gruposCarregados = mapasLoaded
				//Prepara a postagem carregada
				prepararPostagem(div, data, i)
				if(i==1){

				}
			}
		});
	}
}
function modalAdicionar(){
  let conteudo=`<div class="modal fade" id="modal-convidar" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <button type="button" class="close" data-dismiss="modal" aria-hidden="true">X</button>
          <h2 class="modal-title" id="myModalLabel" style="text-align: center;">Adicionar Outro Usuario</h2>
        </div>
        <div class="modal-body">
          <form id="formAtualizar" method="GET">
            {% csrf_token %}
            <div class="col-xs-4 col-sm-4 col-md-4" align="center">
              <div class="form-group">
                <input type="text" name="email" id="email" class="form-control input-lg" placeholder="Digite o nome do usuario" tabindex="1">
              </div>
            </div>
          </div>
          <div id="conteudoDinamico"></div>
        </form>
      </div>
      <div class="modal-footer" >
        <div align="center">
          <button type="button" onclick="Adicionar();" class="btn button"data-dismiss="modal"> Confirmar </button>
          <button type="button" data-dismiss="modal" class="btn button"> Cancelar </button>
      </div>
    </div>
  </div>
</div>
</div>`;
$('#modalDinamico').html(conteudo);
}
function rgbToHex(R,G,B) {
  return toHex(R)+toHex(G)+toHex(B);

}
function toHex(n) {
 n = parseInt(n,10);
 if (isNaN(n)) return "00";
 n = Math.max(0,Math.min(n,255));
 return "0123456789ABCDEF".charAt((n-n%16)/16)
      + "0123456789ABCDEF".charAt(n%16);
}
//Carrega o grupo de 10 mapas
function pesquisarMapasGrupo(){
  //Definição de valores
  pesquisa = get('pesquisa');
  fim = false;

  for(let i=0; i<10  && fim==false; i++){
    $.ajax({
      url: '/ajax/pesquisaGrupo/',
      data: {
        'num': ((Number(mapasLoaded)-1)*10)+Number(i),
        'pesquisa': pesquisa
      },
      dataType: 'json',
      success: function (data) {
        //Se não houver mais mapas
        if(data.erro){
          if(i==0) {
            contentString =`
              <div class="row" style="order:10; padding-bottom:20px; text-align:center">
                <h3>Nenhum resultado encontrado...</h3>
              </div>`;
            $("#divFiltro").append(contentString);
          }
          $('#next').attr("disabled", true);
          fim = true;
          return;
        }
        //Solução para a utilização do prepararPostagem
        gruposCarregados = (mapasLoaded-1)
        //Prepara a postagem carregada
        prepararPostagem($("#divFiltro"), data, i)
      }
    });
  }
}
function initMap(){
		//Carrega o primeiro grupo de postagens
		carregarMapas();
}
