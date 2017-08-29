//Variáveis globais
//Os itens são carregados em grupos de 10 em 10
var mapasLoaded = 0;
var gruposLoaded = 0;
var pessoasLoaded = 0;

//Busca mapas segundo a pesquisa passada
function carregarMapas() {
	//Definição de valores
	mapasLoaded++;
	pesquisa = get('pesquisa');

	for(let i=0; i<10; i++){
		$.ajax({
			url: '/ajax/carregarMapasPesquisa/',
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

//Busca grupos segundo a pesquisa passada
function carregarGrupos() {
	//Definição de valores
	gruposLoaded++;
	pesquisa = get('pesquisa');

	for(let i=0; i<10; i++){
		$.ajax({
			url: '/ajax/carregarGruposPesquisa/',
			data: {
				'num': 10*(gruposLoaded-1)+i,
				'pesquisa': pesquisa
			},
			dataType: 'json',
			success: function (data) {
				//Se todas as postagens tiverem sido carregas
				if(data.erro){
					return;
				}
				//Prepara o grupo para ser exibido
				prepararGrupo(data);
			}
		});
	}
}

function prepararGrupo(data) {
	//Define o nível de acesso do grupo
	if(data.privado)
		data.privado = "Privado";
	else
		data.privado = "Público";
	//Caso não haja descrição
	if(data.descgrupo==="")
		data.descgrupo = "Não há descrição";

	contentString =`
	<div class="row">
		<div class="col-md-offset-2 col-md-8 col-md-offset-2">
			<div style="background-color: rgb(${data.r},${data.g},${data.b}); border: 2px solid black; color:white">
				<div style="text-align:center">
					<h3>${data.nomegrupo}</h3><h4>Acesso: ${data.privado}</h4>
				</div>
				<h4>Descrição: ${data.descgrupo}</h4>
			</div>
		</div>
	</div><br><br>`;

	$("#divFiltro").append(contentString);
}

//Busca pessoas segundo a pesquisa passada
function carregarPessoas() {
}

//Detecta o filtro escolhido no clique
$('input:radio').on('click', function(e) {
	//Escolha
	value = e.currentTarget.value;
	//Retira o conteúdo anterior
	$("#divFiltro").html("");
	//Reseta a quantidade carregada
	mapasLoaded = 0;
	gruposLoaded = 0;
	pessoasLoaded = 0;
	//Chama o carregamento segundo a escolha
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

//Inicializa os mapas
function initMap() {
	carregarMapas();
}

//Função para pegar o valor de um parâmetro request
function get(name){
	if(name=(new RegExp('[?&]'+encodeURIComponent(name)+'=([^&]*)')).exec(location.search))
	return decodeURIComponent(name[1]);
}
