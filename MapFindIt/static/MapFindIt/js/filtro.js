function get(name){
   if(name=(new RegExp('[?&]'+encodeURIComponent(name)+'=([^&]*)')).exec(location.search))
      return decodeURIComponent(name[1]);
}

function carregarMapas() {
	let div=$("#divMapas");
	gruposCarregados++;
	pesquisa = get('pesquisa');
	for(let i=0; i<10; i++){
		$.ajax({
			url: '/ajax/carregarMapasPesquisa/',
			data: {
				'num': 10*(gruposCarregados-1)+i,
				'pesquisa': pesquisa
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

function carregarGrupos() {
	alert("Grupos");
}

function carregarPessoas() {
	alert("Pessoas");
}

$('input:radio').on('click', function(e) {
	value = e.currentTarget.value;

	if(value=="mapas")
		carregarMapas();
	else {
		if(value=="pessoas")
			carregarPessoas();
		else {
			if(value=="grupos")
				carregarGrupos();
		}
	}
});

function initMap() {
	carregarMapas();
}
