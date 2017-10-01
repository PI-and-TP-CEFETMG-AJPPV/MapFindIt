var gruposCarregados=0;

function initMap() {
	let div=$("#divMapas");
	gruposCarregados++;
	for(let i=0; i<10; i++){
		$.ajax({
	    	url: '/ajax/carregarMapasHome/',
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
				if(i==9){
					$(`linha${10*(gruposCarregados-1)+i}`).scroll(function(){
						alert('oi');
					});
				}
			}
		});
	}
}