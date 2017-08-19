//Form e Campo com a pesquisa do Usuário
var form = document.getElementById('navBarSearchForm');
var campo = document.getElementById('pesquisa');

//DEVE SER ALTERADO
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

//Carrega Mapas com o Filtro de Pesquisa
function filtro() {
	$.ajax({
		url: '/ajax/filtro/',
		data: {
			'pesquisa': campo.value
		},
		dataType: 'json',
	});
}

//Verifica se o usuário fez alguma pesquisa
form.addEventListener('submit', function(e) {
	// Impede o envio do form
	e.preventDefault();
	//Chama a pesquisa com o filtro
	filtro();
});
