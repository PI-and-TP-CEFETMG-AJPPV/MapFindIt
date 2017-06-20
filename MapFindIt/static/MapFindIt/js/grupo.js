//Carrega o grupo de 10 mapas
function carregarMapas(){
	//Seleciona a div dos mapas
	let div=$("#divMapas");
	gruposCarregados++;
	for(let i=0; i<10; i++){
		$.ajax({
	      url: '/ajax/carregarMapasGrupo/',
	      data: {
	        'num': 10*(gruposCarregados-1)+i,
	        'id': $('#userId').val()
	      },
	      dataType: 'json',
	      success: function (data) {
					//Se todas as postagens tiverem sido carregas
					if(data.erro){
						return;
					}
					//Prepara a postagem carregada
					prepararPostagem(div, data, i)
				}
			}
	  });
	}
