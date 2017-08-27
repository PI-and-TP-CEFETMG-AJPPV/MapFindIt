//Form e Campo com a pesquisa do Usuário
/*var form = document.getElementById('navBarSearchForm');
var campo = document.getElementById('pesquisa');

//Inicia os mapas - padrão da Google
function initMap() {
	let div=$("#divMapas");
	for(let i=0; i<10; i++){
		$.ajax({
	    url: '/ajax/carregarMapasHome/',
	    data: {
	      'num': i
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
	  });
	}
}

//Carrega Mapas com Pesquisa
function pesquisa() {
	$("#divMapas").html("");
	let div=$("#divMapas");
	for(let i=0; i<10; i++){
		$.ajax({
			url: '/ajax/carregarMapasHomePesquisa/',
			data: {
				'num': i,
				'pesquisa': campo.value
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
		});
	}
}

//Verifica se o usuário fez alguma pesquisa
form.addEventListener('submit', function(e) {
	// impede o envio do form
	e.preventDefault();
	//Chama o carregamento dos Mapas com a pesquisa
	pesquisa();
});
