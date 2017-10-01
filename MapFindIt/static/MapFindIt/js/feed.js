var gruposCarregados=0;

$(window).scroll(function(){
	//Menu = 56 px
	//Postagem = 627 px
	if($(window).scrollTop()>=56+(627*gruposCarregados*9)){
		initMap();
	}
});

function initMap() {
	let div=$("#divMapas");
	gruposCarregados++;
	for(let i=0; i<10; i++){
		$.ajax({
	    	url: '/ajax/mapasFeed/',
	    	data: {
	      		'num': ((Number(gruposCarregados)-1)*10)+Number(i)
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

function carregaMapa(pos){

}