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
                    <div id="mapasMesclar">

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
           console.log(JSON.parse(data.mapas));
        }
    });
}