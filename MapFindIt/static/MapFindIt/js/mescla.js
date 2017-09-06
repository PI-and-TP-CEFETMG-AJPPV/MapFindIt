function modalMesclar(){
  $('#modalDinamico').empty();
	let conteudo=`<div class="modal fade" id="modal-mesclar-mapa" aria-hidden="true">
		<div class="modal-dialog">
			<div class="modal-content">
				<div class="modal-header">
					<button type="button" class="close" onclick='$("#modal-mesclar-mapa").modal("hide");' aria-hidden="true">
						×
					</button>
					<h4 class="modal-title">
						Mesclar um mapa
					</h4>
				</div>
				<div class="modal-body">
                    <form id="searchForm"  method="GET" action="javascript:pesquisarMapas()" style="order:2;">
                        <div class="input-group">
                                    <input type="text" class="form-control" placeholder="Pesquise o mapa a ser mesclado" id="pesquisaMescla" name="pesquisaMescla" value="">
                        <div class="input-group-btn">
                            <button type="submit" class="btn btn-default">Pesquisar</button>
                        </div>
                            </div>
                    </form>
                    <br>
                    <div id="mapasMesclar" style="height: 70vh; overflow-y: scroll;">

                    </div>
                </div>
            </div>
        </div>
    </div>`
		$('#modalDinamico').html(conteudo);
		$('#modal-mesclar-mapa').modal('show');
}

function pesquisarMapas(){
   let pesquisa = $("#pesquisaMescla").val();
   $.ajax({
        url: '/ajax/mapasMesclar/',
        data: {
          'pesquisa': pesquisa 
        },
        dataType: 'json',
        success: function (data) {
           mapas=JSON.parse(data.mapas);
           $('#mapasMesclar').empty();
           for(let i=0; i<mapas.length; i++){
               if(mapas[i][0]==idMapa){
                   continue;
               }
               $('#mapasMesclar').append(`<div class="col-md-12">
              <div class="card-container mapaMesclar" id="mapaMesclar${mapas[i][0]}">
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
              $('#mapaMesclar'+mapas[i][0]).on('click', function(){
                  let id = $(this).attr('id').substring(11);
                  $("#modal-mesclar-mapa").modal("hide");
                  $('#modalDinamico').empty();
                    let conteudo=`<div class="modal fade" id="modal-confirmar-mescla" aria-hidden="true">
                        <div class="modal-dialog">
                            <div class="modal-content">
                                <div class="modal-header">
                                    <button type="button" class="close" onclick="$('#modal-confirmar-mescla').modal('hide'); $('body').removeClass().removeAttr('style');$('.modal-backdrop').remove();" aria-hidden="true">
                                        ×
                                    </button>
                                    <h4 class="modal-title">
                                        Confirmar Mescla
                                    </h4>
                                </div>
                                <div class="modal-body">
                                    <h4>Você tem certeza que deseja mesclar esses mapas? A ação não poderá ser desfeita</h4>
                                    <div class="modal-footer">
                                        <button class="btn btn-success" onclick="mesclar(${id});" id="confirmarMesclaBtn">Confirmar</button>
                                        <button class="btn btn-danger" onclick="$('#modal-confirmar-mescla').modal('hide'); $('body').removeClass().removeAttr('style');$('.modal-backdrop').remove();">Cancelar</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>`;
                    $('#confirmarMesclaBtn').on('click', function(){
                        mesclar(id);
                    });
                    $('#modalDinamico').html(conteudo);
                    $('#modal-confirmar-mescla').modal('show');
              })
           }
        }
    });

    
}

function mesclar(id){
        window.location.href = "/fazerMescla?id="+id+"&idEditando="+idMapa;
    }