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
function modalRemoverMapa(idgrupo){
  $('#modalDinamico').empty();
  $('#modal-container-admim').modal('hide')
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
      'idgrupo': idgrupo
    },
    dataType: 'json',
    success: function (data) {
      $('#modalDinamico').empty();
      let conteudo=`<div class="modal fade" id="modalentrou" aria-hidden="true">
          <div class="modal-dialog">
              <div class="modal-content">
                  <div class="modal-header">
                      <button type="button" class="close" onclick="$('#modalentrou').modal('hide'); $('body').removeClass().removeAttr('style');$('.modal-backdrop').remove();" aria-hidden="true">
                          ×
                      </button>
                      <h4 class="modal-title">
                          Você ingressou no grupo com sucesso
                      </h4>
                  </div>
                  <div class="modal-body">
                      <div class="modal-footer">
                          <button class="btn btn-success" onclick="window.location.reload()" id="ok">Ok</button>
                      </div>
                  </div>
              </div>
          </div>
      </div>`;
        $('#modalDinamico').html(conteudo);
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
                  $("#modalPublicar-mapa").modal("hide");
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
                                        <button class="btn btn-success" onclick="Remover(${id},${idgrupo});" id="confirmarpublicacao">Confirmar</button>
                                        <button class="btn btn-danger" onclick="$('#modalPublicar-mapa').modal('hide');
                                        $('body').removeClass().removeAttr('style');$('.modal-backdrop').remove();">Cancelar</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>`;
                    $('#confirmarMesclaBtn').on('click', function(){
                    });
                    $('#modalDinamico').html(conteudo);
                    $('#modal-confirmar-post').modal('show');
              })
           }
        }
    });
}
function pesquisarMapas(idgrupo){
   let pesquisa = $("#pesquisarMapas").val();
   $.ajax({
        url: '/ajax/mapasPublicar/',
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
                  $("#modalPublicar-mapa").modal("hide");
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
                                    <h4>Você tem certeza que deseja esse mapa?</h4>
                                    <div class="modal-footer">
                                        <button class="btn btn-success" onclick="publicar(${id},${idgrupo});" id="confirmarpublicacao">Confirmar</button>
                                        <button class="btn btn-danger" onclick="$('#modalPublicar-mapa').modal('hide');
                                        $('body').removeClass().removeAttr('style');$('.modal-backdrop').remove();">Cancelar</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>`;
                    $('#confirmarMesclaBtn').on('click', function(){
                    });
                    $('#modalDinamico').empty();
                    $('#modalDinamico').html(conteudo);
                    $('#modal-confirmar-post').modal('show');
              })
           }
        }
    });
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
        $('#modal-container-admim').modal('show')
    }
  });
}
function publicar(id, idgrupo){
  $.ajax({
    url: '/ajax/publicarGrupo/',
    data: {
      'id': id,
      'idgrupo': idgrupo
    },
    dataType: 'json',
    success: function (data) {
        $('#modalDinamico').empty();
    }
  });
}
function initMap(){

}
function pesquisarBar(){
  $('#opcMenu').empty();
  let conteudo=`<div class="row">
    <div class="col-md-8 col-md-offset-2" >
      <br>
      <div class="center">
        <form class="form-group" id="SearchForm"  method="GET" style="order:2;background: white">
          <div class="input-group" style="border:1px solid #444;">
            <input type="text" class="form-control input-lg" placeholder="Digite o que será pesquisado" id="pesquisa" name="pesquisa" value="" style="border: none;">
              <div class="input-group-btn">
                <button type="submit" class="btn button-default" style="background: white; color: black; font-weight: bold;border:none;" onclick="pesquisar()"><span class="glyphicon glyphicon-search" style="color: black; font-size:1.5em;"></span></button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>`;
    $('#opcMenu').html(conteudo);
}

function carregarMapas() {
	//Definição de valores
	mapasLoaded++;

	for(let i=0; i<10; i++){
		$.ajax({
			url: '/ajax/carregarMapasGrupo/',
			data: {
				'num': 10*(mapasLoaded-1)+i,
				'pesquisa': pesquisa
			},
			dataType: 'json',
			success: function (data) {
				//Se todas as 10 postagens tiverem sido carregas
				if(data.erro){
					return;
				}
				//Solução para a utilização do prepararPostagem
				gruposCarregados = mapasLoaded
				//Prepara a postagem carregada
				prepararPostagem($("#divFiltro"), data, i)
			}
		});
	}
}
