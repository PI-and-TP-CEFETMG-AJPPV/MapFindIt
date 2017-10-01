var gruposCarregados=0;
function initMap() {
	$('#back').attr("disabled", true);
	carregarMapas();
}

//Variáveis globais
//Os itens são carregados em grupos de 10 em 10
var mapasLoaded = 1;

//Busca mapas segundo a pesquisa passada
function carregarMapas() {
	let div=$("#divMapas");
	for(let i=0; i<10; i++){
		$.ajax({
			url: '/ajax/mapasFeed/',
			data: {
				'num': ((Number(mapasLoaded)-1)*10)+Number(i)
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

//Avança uma página no paginamento
$("#next").on('click', function(e) {
	$('#back').removeAttr("disabled");
	//Retira os dados atuais
	$("#divMapas").html("");
	mapasLoaded++;
	carregarMapas();
});

//Retorna uma página no paginamento
$("#back").on('click', function(e) {
	//Retira os dados atuais
	$('#next').removeAttr("disabled");
	$("#divMapas").html("");
	mapasLoaded--;
	if(mapasLoaded==1){
		$('#back').attr("disabled", true);
	}
	carregarMapas();
});