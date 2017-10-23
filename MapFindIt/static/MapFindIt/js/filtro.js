//Variáveis globais
//Os itens são carregados em grupos de 10 em 10
var mapasLoaded = 1;
var gruposLoaded = 1;
var pessoasLoaded = 1;

//Busca mapas segundo a pesquisa passada
function carregarMapas() {
	//Definição de valores
	pesquisa = get('pesquisa');
	fim = false;

	for(let i=0; i<10  && fim==false; i++){
		$.ajax({
			url: '/ajax/carregarMapasPesquisa/',
			data: {
				'num': ((Number(mapasLoaded)-1)*10)+Number(i),
				'pesquisa': pesquisa
			},
			dataType: 'json',
			success: function (data) {
				//Se não houver mais mapas
				if(data.erro){
					if(i==0) {
						contentString =`
							<div class="row" style="order:10; padding-bottom:20px; text-align:center">
								<h3>Nenhum resultado encontrado...</h3>
							</div>`;
						$("#divFiltro").append(contentString);
					}
					$('#next').attr("disabled", true);
					fim = true;
					return;
				}
				//Solução para a utilização do prepararPostagem
				gruposCarregados = (mapasLoaded-1)
				//Prepara a postagem carregada
				prepararPostagem($("#divFiltro"), data, i)
			}
		});
	}
}

//Busca grupos segundo a pesquisa passada
function carregarGrupos() {
	//Definição de valores
	pesquisa = get('pesquisa');
	fim = false;

	for(let i=0; i<10 && fim==false; i++){
		$.ajax({
			url: '/ajax/carregarGruposPesquisa/',
			data: {
				'num': ((Number(gruposLoaded)-1)*10)+Number(i),
				'pesquisa': pesquisa
			},
			dataType: 'json',
			success: function (data) {
				//Se todas as postagens tiverem sido carregas
				if(data.erro){
					if(i==0) {
						contentString =`
							<div class="row" style="order:10; padding-bottom:20px; text-align:center">
								<h3>Nenhum resultado encontrado...</h3>
							</div>`;
						$("#divFiltro").append(contentString);
					}
					$('#next').attr("disabled", true);
					fim = true;
					return;
				}
				//Prepara o grupo para ser exibido
				prepararGrupo(data);
			}
		});
	}
}

//Prepara o HTML para a exibição do grupo
function prepararGrupo(data) {
	//Define o nível de acesso do grupo
	if(data.privado)
		data.privado = "Privado";
	else
		data.privado = "Público";
	//Caso não haja descrição
	if(data.descgrupo==="")
		data.descgrupo = "Não há descrição";

	//HTML
	contentString =`
	<div class="row">
			<div class="col-md-offset-2 col-md-8 col-md-offset-2">
				<a href="/grupo/${data.idgrupo}/">
					<div style="background-color: white; border: 2vh solid rgb(${data.r},${data.g},${data.b}); box-shadow:  0 0 0 2px black;">
							<div style="text-align:center">
								<h3>${data.nomegrupo}</h3><h4>Acesso: ${data.privado}</h4>
							</div>
							<h4>Descrição: ${data.descgrupo}</h4>
					</div>
				</a>
			</div>
	</div><br><br>`;

	//Inserer o HTML
	$("#divFiltro").append(contentString);
}

//Busca pessoas segundo a pesquisa passada
function carregarPessoas() {
	//Definição de valores
	pesquisa = get('pesquisa');
	fim = false;

	for(let i=0; i<10 && fim==false; i++){
		$.ajax({
			url: '/ajax/carregarPessoasPesquisa/',
			data: {
				'num': ((Number(pessoasLoaded)-1)*10)+Number(i),
				'pesquisa': pesquisa
			},
			dataType: 'json',
			success: function (data) {
				//Se todas as postagens tiverem sido carregas
				if(data.erro){
					if(i==0) {
						contentString =`
							<div class="row" style="order:10; padding-bottom:20px; text-align:center">
								<h3>Nenhum resultado encontrado...</h3>
							</div>`;
						$("#divFiltro").append(contentString);
					}
					$('#next').attr("disabled", true);
					fim = true;
					return;
				}
				//Prepara o grupo para ser exibido
				prepararPessoa(data);
			}
		});
	}
}

//Prepara o HTML para a exibição da pessoa
function prepararPessoa(data) {
  //HTML
	contentString =`
	<div class="row">
			<div class="col-md-offset-2 col-md-8 col-md-offset-2">
				<a href="/perfil/${data.idusuario}/">
					<div style="background-color: white; border: 2vh solid skyblue; box-shadow:  0 0 0 2px black;">
						<div style="text-align: center">
							<h2>${data.primnomeusuario} ${data.ultnomeusuario}</h2>
							<h4>${data.emailusuario}</h4>
						</div>
					</div>
				</a>
			</div>
	</div><br><br>`;

	//Insere o HTML
	$("#divFiltro").append(contentString);
}

//Detecta o filtro escolhido no clique
$('input:radio').on('click', function(e) {
	//Escolha
	value = e.currentTarget.value;
	$('#back').attr("disabled", true);
	$('#next').attr("disabled", false);
	//Retira o conteúdo anterior
	$("#divFiltro").html("");
	//Reseta a quantidade carregada
	mapasLoaded = 1;
	gruposLoaded = 1;
	pessoasLoaded = 1;
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

//Avança uma página no paginamento
$("#next").on('click', function(e) {
	$('#back').removeAttr("disabled");
	//Capta o opção escolhida no filtro
	op = $( "input[type=radio][name=escolha]:checked" ).val();
	//Retira os dados atuais
	$("#divFiltro").html("");
	//Chama o carregamento segundo a opção
	if(op=="mapas") {
		mapasLoaded++;
		carregarMapas();
	} else {
		if(op=="pessoas") {
			pessoasLoaded++;
			carregarPessoas();
		} else {
			if(op=="grupos") {
				gruposLoaded++;
				carregarGrupos();
			}
		}
	}
});

//Retorna uma página no paginamento
$("#back").on('click', function(e) {
	$('#next').removeAttr("disabled");
	//Capta o opção escolhida no filtro
	op = $( "input[type=radio][name=escolha]:checked" ).val();
	//Retira os dados atuais
	$("#divFiltro").html("");
	//Chama o carregamento segundo a opção
	if(op=="mapas") {
		mapasLoaded--;
		if(mapasLoaded==1){
			$('#back').attr("disabled", true);
		}
		carregarMapas();
	} else {
		if(op=="pessoas") {
			pessoasLoaded--;
			if(pessoasLoaded==1){
				$('#back').attr("disabled", true);
			}
			carregarPessoas();
		} else {
			if(op=="grupos") {
				gruposLoaded--;
				if(gruposLoaded==1){
					$('#back').attr("disabled", true);
				}
				carregarGrupos();
			}
		}
	}
});

//Inicializa os mapas
function initMap() {
	$('#back').attr("disabled", true);
	carregarMapas();
}

//Função para pegar o valor de um parâmetro request
function get(name){
	if(name=(new RegExp('[?&]'+encodeURIComponent(name)+'=([^&]*)')).exec(location.search))
	return decodeURIComponent(name[1]);
}
