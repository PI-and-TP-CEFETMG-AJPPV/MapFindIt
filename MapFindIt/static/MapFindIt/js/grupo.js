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
                    $('#modalDinamico').html(conteudo);
                    $('#modal-confirmar-post').modal('show');
              })
           }
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
        $('#modal-confirmar-post').modal('hide');
    }
  });
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
