/*
	Para usar esse script é necessário usar a tag
	<script>
		var imgUrl='{{baseUrl}}';
		var idUsuarioLogado='{{usuario.idusuario}}'
	</script>
	Para que se tenha o diretorio dos caminhos estáticos e o id do usuário que está logado
*/

//Quantidade de grupos de 10 mapas carregados
var gruposCarregados=0;

//Função para exibir o mapa
function setMapa(mapa, pontos, icones, rotas, pontoRotas, areas, pontoAreas, mapId){
		let inicio = {lat: mapa.coordyinicial, lng: mapa.coordxinicial};
    //Cria o mapa em suas coordenadas iniciais
		let map = new google.maps.Map(document.getElementById(mapId), {
			zoom: 12,
			center: inicio
		});
    //Para cada ponto do mapa
		pontos.forEach(function(item, index){
      //Verifica se o ponto é uma marcação e não parte de uma área ou rota
      if(item.fields.idtponto=='P'){
        let iconePonto=null;
				let codIcone=item.fields.codicone;
				for(let i=0; i<icones.length; i++){
          //Salva o icone do ponto
					if(icones[i].pk==codIcone){
						iconePonto=icones[i];
					}
				}
				//Coordenadas do ponto
				let pos = {lat: item.fields.coordy, lng: item.fields.coordx};
				//Cria o marcador no ponto
				let marker = new google.maps.Marker({
					 position: pos,
					 map: map,
				});
				//Se o ponto possui um icone, define esse icone ao marcador
        if(iconePonto!=null)
				    marker.setIcon(imgUrl+'MapFindIt/ImagemIcones/'+iconePonto.pk+'.png');
				let contentString;
				if(item.fields.fotoponto!=""){
					//Se o ponto possui foto
					contentString =
					`<div id="content">
		            	<h1 id="firstHeading" class="firstHeading">${item.fields.nomponto}</h1>
		            	<div id="bodyContent">
		            		<img class="img-responsive" style="margin: 0 auto;" src="${imgUrl}MapFindIt/ImagemPonto/${item.pk}.png">
		            		<p>${item.fields.descponto}</p>
		            	</div>
		            </div>`;
				}else{
					//Se o ponto não possui foto
					contentString =
					`<div id="content">
		            	<h1 id="firstHeading" class="firstHeading">${item.fields.nomponto}</h1>
		            	<div id="bodyContent">
		            		<p>${item.fields.descponto}</p>
		            	</div>
		            </div>`;
				}
				//Cria a janela de informações do ponto
		    let infowindow = new google.maps.InfoWindow({
		       content: contentString
		    });
				//Evento de exibir a janela ao clicar no ponto
				marker.addListener('click', function() {
		          infowindow.open(map, marker);
		    });
			}
		});
		//Para cada rota
		rotas.forEach(function(item, index){
			//Pontos que compõe essa rota
			let pontosRota=pontoRotas[index];
			//Serviço de direções do google
			let directionsService = new google.maps.DirectionsService();
			//Serviço de exibição das rotas
			let directionsDisplay = new google.maps.DirectionsRenderer({
			  polylineOptions: {
					//Cor da rota
			    strokeColor: `rgb(${item.fields.codcor[0]}, ${item.fields.codcor[1]}, ${item.fields.codcor[2]})`,
					//Grossura do traçado
					strokeWeight: 5
				},
				//Remove o indicador de pontos padrão da google
				suppressMarkers: true
			});
			//Cor dos pontos de uma rota
			let pinColor = `rgb(${item.fields.codcor[0]},${item.fields.codcor[1]},${item.fields.codcor[2]})`;
			//Para cada ponto cria uma marcacao com a cor da rota, e cria um evento de click para as marcacoes
			for(let x=0; x<pontosRota.length; x++){
				let marker = new google.maps.Marker({
					 position: new google.maps.LatLng(pontosRota[x].fields.idponto[0], pontosRota[x].fields.idponto[1]),
					 map: map,
					 icon: pinSymbol(pinColor)
				});
				let contentString=
					`<div id="content">
		          <h2 id="firstHeading" class="firstHeading">${item.fields.nomerota}</h2>
		          <div id="bodyContent">
		             <p>${item.fields.descrota}</p>
		          </div>
		       </div>`;
		    let infowindow = new google.maps.InfoWindow({
		       content: contentString
		    });
				marker.addListener('click', function() {
		      infowindow.open(map, marker);
		    });
			}
			//Array para os pontos do "meio" da rota, sem incluir o primeiro e ultimo
			let waypts=Array();
			for(let x=1; x<pontosRota.length-1; x++){
				waypts.push({location:{lat: pontosRota[x].fields.idponto[0], lng: pontosRota[x].fields.idponto[1]}, stopover:false});
			}
			//Define o mapa da rota
			directionsDisplay.setMap(map);
			let request;
			if(waypts.length>0){
				//Se existem mais de dois pontos
				request = {
					origin: {lat: pontosRota[0].fields.idponto[0], lng: pontosRota[0].fields.idponto[1]},
					destination: {lat: pontosRota[pontosRota.length-1].fields.idponto[0], lng: pontosRota[pontosRota.length-1].fields.idponto[1]},
					waypoints: waypts,
					travelMode: 'DRIVING'
				};
			}else{
				//Se existem apenas dois pontos
				request = {
					origin: {lat: pontosRota[0].fields.idponto[0], lng: pontosRota[0].fields.idponto[1]},
					destination: {lat: pontosRota[pontosRota.length-1].fields.idponto[0], lng: pontosRota[pontosRota.length-1].fields.idponto[1]},
					travelMode: 'DRIVING'
				};
			}
			//Requisita a rota ao servidor da google
			directionsService.route(request, function(response, status) {
			  if (status == 'OK') {
			    directionsDisplay.setDirections(response);
			  }
			});
		});
		//Para cada uma das areas criadas
		areas.forEach(function(item, index){
			//Todos os pontos que compoe uma area
			let pontosArea=pontoAreas[index];
			//Array com as posicoes de todos os pontos
			let coords=Array();
			for(let x=0; x<pontosArea.length; x++){
				coords.push({lat: pontosArea[x].fields.idponto[0], lng: pontosArea[x].fields.idponto[1]});
			}
			//Cria um poligono com a cor da area, e seus pontos
			let areaPoligono = new google.maps.Polygon({
          paths: coords,
          strokeColor: `rgb(${item.fields.codcor[0]}, ${item.fields.codcor[1]}, ${item.fields.codcor[2]})`,
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: `rgb(${item.fields.codcor[0]}, ${item.fields.codcor[1]}, ${item.fields.codcor[2]})`,
          fillOpacity: 0.5
      });
			//Define o mapa do poligono
      areaPoligono.setMap(map);
			let contentString=
				`<div id="content">
						<h2 id="firstHeading" class="firstHeading">${item.fields.nomarea}</h2>
						<div id="bodyContent">
							 <p>${item.fields.descarea}</p>
						</div>
				 </div>`;
		  //Cria a janela de informacao da area
			let infowindow = new google.maps.InfoWindow({
				 content: contentString
			});
			//Adiciona o evento de click à area para exibir a janela de informacao
			google.maps.event.addListener(areaPoligono, 'click', function (event) {
				infowindow.setPosition(event.latLng);
				infowindow.open(map);
		  });
		});
		//Obtem a div da legenda
		var legend = document.getElementById(mapId+'legend');
		//Se a div existir, ou seja se for um mapa expandido
		if(legend){
			//Para cada icone
			for (let i=0; i<icones.length; i++) {
				let icon=icones[i];
				let name = icon.fields.nomeicone;
	      let icone = imgUrl+'MapFindIt/ImagemIcones/'+icon.pk+'.png';
	      let div = document.createElement('div');
				//Cria uma div com a imagem do icone e o seu nome
	      div.innerHTML =
				`<div style="display:flex; flex-direction: row; justify-content: space-between;">
					<img src="${icone}">&nbsp;&nbsp;
					<p>${name}</p>
				</div>
				`;
				//Adiciona essa div à div de legenda
	      legend.appendChild(div);
				//Adiciona uma quebra de linha
				let br = document.createElement('br');
				legend.appendChild(br);
			}
			//Caso não exista legendas esconde a div de legenda
			if(icones.length==0){
				legend.innerHTML="";
				legend.className="";
			}
			//Adiciona a div de legendas ao mapa
			map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(legend);
		}

}

function pinSymbol(color) {
		//Retorna o desenho de um ponto de determinada cor
		if(color=='rgb(0,0,0)'){
			//Se o ponto for preto o contorno é branco
			return {
	        path: 'M 0,0 C -2,-20 -10,-22 -10,-30 A 10,10 0 1,1 10,-30 C 10,-22 2,-20 0,0 z M -2,-30 a 2,2 0 1,1 4,0 2,2 0 1,1 -4,0',
	        fillColor: color,
	        fillOpacity: 1,
	        strokeColor: '#FFF',
	        strokeWeight: 1,
	        scale: 1,
	   };
		}else{
			//Para outras cores o contorno é preto
			return {
	        path: 'M 0,0 C -2,-20 -10,-22 -10,-30 A 10,10 0 1,1 10,-30 C 10,-22 2,-20 0,0 z M -2,-30 a 2,2 0 1,1 4,0 2,2 0 1,1 -4,0',
	        fillColor: color,
	        fillOpacity: 1,
	        strokeColor: '#000',
	        strokeWeight: 2,
	        scale: 1,
	   };
		}
}

//Formata a data do input
function formatarData(input) {
    var ptrn = /(\d{4})\-(\d{2})\-(\d{2})/;
    if(!input || !input.match(ptrn)) {
        return null;
    }
    return input.replace(ptrn, '$3/$2/$1');
};

//Variaveis para guardar erros de validação do comentario
var erroTitulo;
var erroTexto;

function comentar(id, idPost, idUser){
	let titulo=$(`#tituloComentario${id}`);
	let texto=$(`#txtComentario${id}`);
	//Validações
	//Titulo não está vazio
	if(!titulo.val()){
		titulo.parent().addClass('has-error');
		if($('#erroTitulo').length === 0) {
			erroTitulo=$('<span id="erroTitulo" class="help-block">Titulo Vazio</span>').appendTo(titulo.parent());
		}
	}else{
		titulo.parent().removeClass('has-error');
		if(erroTitulo){
			erroTitulo.remove();
		}
		//Remove o erro da variavel
		erroTitulo=null;
	}
	//Texto não está vazio
	if(!texto.val()){
		texto.parent().addClass('has-error');
		if($('#erroTexto').length === 0) {
			erroTexto=$('<span id="erroTexto" class="help-block">Texto Vazio</span>').appendTo(texto.parent());
		}
	}else{
		texto.parent().removeClass('has-error');
		if(erroTexto){
			erroTexto.remove();
		}
		//Remove o erro da variavel
		erroTexto=null;
	}
	//Caso tenha ocorrido algum erro sai da função
	if(erroTitulo || erroTexto){
		return;
	}
	//Processamento do comentário
	//Remove o aviso de que não há comentários
	$(`#naoComentarios${id}`).remove();
	//Salva data e hora atuais
	let objData = new Date();
	let hora=(objData.getHours()<10?'0':'')+String(objData.getHours())+':'+(objData.getMinutes()<10?'0':'')+String(objData.getMinutes())+":"+(objData.getMinutes()<10?'0':'')+String(objData.getSeconds());
	let dataStr=objData.toISOString().split('T')[0];
	//Salva o comentário na postagem
	$.ajax({
      url: '/ajax/salvarComentario/',
      data: {
        'titulo': titulo.val(),
        'texto': texto.val(),
				'hora': hora,
				'data': dataStr,
				'postagem': idPost,
				'user': idUser,
      },
      dataType: 'json',
      success: function (data) {
				//Pega o autor do comentario
				autor=JSON.parse(data.autor)[0];
				//Caso tenha suceso
				if(JSON.parse(data.sucesso)){
					//Adiciona o comentario
					$('#comentarios'+id).append(`
							<div class="row" style="order: ${$('#comentarios'+id).children().length}">
								<div class="col-md-12">
									<div class="card-container">
										<div class="card">
											<div class="content">
													<div class="main">
															<h4>${titulo.val()}</h4>
															<p style="text-align: left; padding: 0px; margin:0px;"><small><small>${formatarData(dataStr)} às ${hora}</small></small></p>
															<p style="text-align: left; padding: 0px; margin:0px;"><small><a href="/perfil/${autor.pk}">${autor.fields.primnomeusuario} ${autor.fields.ultnomeusuario}</a></small></p>
															<p style="text-align: left">${texto.val()}</p>
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>
						`);
						//Coloca a order do botão correta, para que ele fique no topo
						$('#botao'+id).css('order', $('#comentarios'+id).children().length);
						//Esconde o modal de comentar e esvazia os campos
						$(`#modal_comentar${id}`).modal("hide");
						titulo.val('');
						texto.val("Comentario...");
				}

      }
  });

}

function prepararPostagem(div, data, i){
		//Carrega o objeto do mapa
    let mapa=JSON.parse(data.mapa)[0];
    mapa=mapa.fields;
		//Carrega o objeto da postagem
    let postagem=JSON.parse(data.postagem)[0];
    postagem=postagem.fields;
		//Carrega os objetos de autores dos comentarios
    let autores=JSON.parse(data.autores);
		//Carrega os objetos dos comentários
    let comentarios=JSON.parse(data.comentarios);
		//Carrega os objetos das rotas
    let rotas=JSON.parse(data.rotas);
		//Carrega os objetos dos pontos das rotas
    let pontoRotas=JSON.parse(data.pontoRotas);
    for(let i=0; i<pontoRotas.length; i++){
      pontoRotas[i]=JSON.parse(pontoRotas[i]);
    }
		//Carrega os objetos das areas
    let areas=JSON.parse(data.areas);
		//Carrega os objetos dos pontos das areas
		let pontoAreas=JSON.parse(data.pontoAreas);
    for(let i=0; i<pontoAreas.length; i++){
      pontoAreas[i]=JSON.parse(pontoAreas[i]);
    }
		//HTML do mapa
    div.append(`
      <div class='row' style="order:${i}; padding-bottom:20px;">
        <div class='col-md-8 col-md-offset-2 white center centerDiv' style='padding-bottom: 20px; display: block;'>
         <a href='#modal_mapa${10*(gruposCarregados-1)+i}' class='tituloMapa'
				 data-toggle='modal' id='titulo_mapa${10*(gruposCarregados-1)+i}'><h4>${mapa.titulomapa}</h4></a>
         <p class="infoPostagem"><small>Postado em: ${formatarData(postagem.datapostagem)} às ${postagem.horapostagem}</small></p>
         <div class='centerDiv'>
           <div class="mapa" name='map${10*(gruposCarregados-1)+i}' id='map${10*(gruposCarregados-1)+i}'></div>
         </div>
         <div class='modal fade' id='modal_mapa${10*(gruposCarregados-1)+i}' name="modalMap" aria-hidden='true'>
            <div class='modal-dialog modal-map-dialog' >
              <div class='modal-content modal-map-content'>
                <div class='modal-header'>
                  <button type='button' class='close' data-dismiss='modal' aria-hidden='true'>
                    ×
                  </button>
                  <h4 class='modal-title'>
                    ${mapa.titulomapa}
                  </h4>
                </div>
                <div class='modal-body modal-map-body'>
                  <div class="container-fluid">
                    <div class="row">
											<div class="col-md-2" style="overflow-y:scroll; margin:0px; background-color: #E5E9ED; max-height: 83vh;">
	                      <div id="comentarios${10*(gruposCarregados-1)+i}" class="container-comentarios">
	                        <p style="margin: 0px; padding: 0px;">&nbsp</p>
	                      </div>
											</div>
                      <div class="col-md-10" style="display: block;" id="divMapa${10*(gruposCarregados-1)+i}">
                        <div class="mapaExp" name='mapExp${10*(gruposCarregados-1)+i}' id='mapExp${10*(gruposCarregados-1)+i}'></div>
												<div id="mapExp${10*(gruposCarregados-1)+i}legend" class='legend'><h4>Legenda</h4></div>
											</div>
                  </div>
                </div>
             </div>
          </div>
        </div>
       </div>
     </div>
     <br><br><br>`);
		 //Se não existirem comentários cria aviso de que não existem comentários
     if(comentarios.length<1){
       $('#comentarios'+(10*(gruposCarregados-1)+i)).append(`
          <div class="row" id="naoComentarios${10*(gruposCarregados-1)+i}">
            <div class="col-md-12">
              <p style="text-align: left;">Ainda não existem comentários</p>
              </div>
            </div>
        `);
     }
		 //Adiciona os comentários ao div do mapa expandido
    comentarios.forEach(function(comentario, index){
      $('#comentarios'+(10*(gruposCarregados-1)+i)).append(`
          <div class="row" style="order:${index}">
            <div class="col-md-12">
              <div class="card-container">
                <div class="card">
                  <div class="content">
                      <div class="main">
                          <h4>${comentario.fields.titulocomentario}</h4>
                          <p style="text-align: left; padding: 0px; margin:0px;"><small><small>${formatarData(comentario.fields.datacomentario)} às ${comentario.fields.horacomentario}</small></small></p>
                          <p style="text-align: left; padding: 0px; margin:0px;"><small><a href="/perfil/${autores[index].pk}">${autores[index].fields.primnomeusuario} ${autores[index].fields.ultnomeusuario}</a></small></p>
                          <p style="text-align: left">${comentario.fields.txtcomentario}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
        `);
    });
		//Botao para comentar e modal de comentario
    $('#comentarios'+(10*(gruposCarregados-1)+i)).append(`
			  <div id="botao${10*(gruposCarregados-1)+i}" style="order: ${$('#comentarios'+(10*(gruposCarregados-1)+i)).children().length}">
					<br>
					<button id="comentar${10*(gruposCarregados-1)+i}" href='#modal_comentar${10*(gruposCarregados-1)+i}' data-toggle="modal" class="btn btn-default">Comentar</button>
	        <p style="padding:0px; margin:0px">&nbsp</p>
				</div>
				<div class='modal fade' id='modal_comentar${10*(gruposCarregados-1)+i}' name="modalComentarMap" aria-hidden='true'>
					 <div class='modal-dialog' >
						 <div class='modal-content'>
							 <div class='modal-header'>
								 <button type='button' class='close' onclick='$("#modal_comentar${10*(gruposCarregados-1)+i}").modal("hide");' aria-hidden='true'>
									 ×
								 </button>
								 <h4 class='modal-title'>
									 Comentar
								 </h4>
							 </div>
							 <div class='modal-body'>
								 <div class="container-fluid">
									 <form id="formComentario${10*(gruposCarregados-1)+i}">
										 <div class="form-group">
											 <input type="text" name="titulo" id="tituloComentario${10*(gruposCarregados-1)+i}" class="form-control input-lg" placeholder="Titulo do Comentario" required>
										 </div>
										 <div class="form-group">
										 	 <textarea name="fraseUsuario" id="txtComentario${10*(gruposCarregados-1)+i}" class="form-control" rows="2">Comentario...</textarea>
										 </div>
										 <div class="form-group">
										 	  <button type="button" onclick="comentar(${10*(gruposCarregados-1)+i}, ${JSON.parse(data.postagem)[0].pk}, ${idUsuarioLogado});">Comentar</button>
										 </div>
									 </form>
								 </div>
							 </div>
						</div>
				 </div>
			 </div>
    `);
		//Ao se abrir o mapa expandido seta o mapa e adiciona visualizacao
    $("#titulo_mapa"+(10*(gruposCarregados-1)+i)).on("click", function(){
			$.ajax({
					url: '/ajax/adicionarView/',
					data: {
						'mapa': JSON.parse(data.mapa)[0].pk,
						'usuario': idUsuarioLogado
					},
					dataType: 'json',
					success: function (data) {
					}
			 });
       setTimeout(function(){
         setMapa(mapa, JSON.parse(data.pontos), JSON.parse(data.icones), rotas, pontoRotas, areas, pontoAreas, "mapExp"+(10*(gruposCarregados-1)+i));
       }, 1000);
    });
		//Seta o mapa do feed
    setMapa(mapa, JSON.parse(data.pontos), JSON.parse(data.icones), rotas, pontoRotas, areas, pontoAreas, "map"+(10*(gruposCarregados-1)+i));
}

function prepararPostagemVis(div, data, i){
		//Carrega o objeto do mapa
    let mapa=JSON.parse(data.mapa)[0];
    mapa=mapa.fields;
		//Carrega o objeto da postagem
    let postagem=JSON.parse(data.postagem)[0];
    postagem=postagem.fields;
		//Carrega os objetos de autores dos comentarios
    let autores=JSON.parse(data.autores);
		//Carrega os objetos dos comentários
    let comentarios=JSON.parse(data.comentarios);
		//Carrega os objetos das rotas
    let rotas=JSON.parse(data.rotas);
		//Carrega os objetos dos pontos das rotas
    let pontoRotas=JSON.parse(data.pontoRotas);
    for(let i=0; i<pontoRotas.length; i++){
      pontoRotas[i]=JSON.parse(pontoRotas[i]);
    }
		//Carrega os objetos das areas
    let areas=JSON.parse(data.areas);
		//Carrega os objetos dos pontos das areas
		let pontoAreas=JSON.parse(data.pontoAreas);
    for(let i=0; i<pontoAreas.length; i++){
      pontoAreas[i]=JSON.parse(pontoAreas[i]);
    }
		//HTML do mapa
    div.append(`
      <div class='row' style="order:${i}; padding-bottom:20px;">
        <div class='col-md-8 col-md-offset-2 white center centerDiv' style='padding-bottom: 20px; display: block;'>
         <a href='#modal_mapa${10*(gruposCarregados-1)+i}' class='tituloMapa'
				 data-toggle='modal' id='titulo_mapa${10*(gruposCarregados-1)+i}'><h4>${mapa.titulomapa}</h4></a>
         <p class="infoPostagem"><small>Postado em: ${formatarData(postagem.datapostagem)} às ${postagem.horapostagem}</small></p>
         <div class='centerDiv'>
           <div class="mapa" name='map${10*(gruposCarregados-1)+i}' id='map${10*(gruposCarregados-1)+i}'></div>
         </div>
         <div class='modal fade' id='modal_mapa${10*(gruposCarregados-1)+i}' name="modalMap" aria-hidden='true'>
            <div class='modal-dialog modal-map-dialog' >
              <div class='modal-content modal-map-content'>
                <div class='modal-header'>
                  <button type='button' class='close' data-dismiss='modal' aria-hidden='true'>
                    ×
                  </button>
                  <h4 class='modal-title'>
                    ${mapa.titulomapa}
                  </h4>
                </div>
                <div class='modal-body modal-map-body'>
                  <div class="container-fluid">
                    <div class="row">
											<div class="col-md-2" style="overflow-y:scroll; margin:0px; background-color: #E5E9ED; max-height: 83vh;">
	                      <div id="comentarios${10*(gruposCarregados-1)+i}" class="container-comentarios">
	                        <p style="margin: 0px; padding: 0px;">&nbsp</p>
	                      </div>
											</div>
                      <div class="col-md-10" style="display: block;" id="divMapa${10*(gruposCarregados-1)+i}">
                        <div class="mapaExp" name='mapExp${10*(gruposCarregados-1)+i}' id='mapExp${10*(gruposCarregados-1)+i}'></div>
												<div id="mapExp${10*(gruposCarregados-1)+i}legend" class='legend'><h4>Legenda</h4></div>
											</div>
                  </div>
                </div>
             </div>
          </div>
        </div>
       </div>
     </div>
     <br><br><br>`);
		 //Se não existirem comentários cria aviso de que não existem comentários
     if(comentarios.length<1){
       $('#comentarios'+(10*(gruposCarregados-1)+i)).append(`
          <div class="row" id="naoComentarios${10*(gruposCarregados-1)+i}">
            <div class="col-md-12">
              <p style="text-align: left;">Ainda não existem comentários</p>
              </div>
            </div>
        `);
     }
		 //Adiciona os comentários ao div do mapa expandido
    comentarios.forEach(function(comentario, index){
      $('#comentarios'+(10*(gruposCarregados-1)+i)).append(`
          <div class="row" style="order:${index}">
            <div class="col-md-12">
              <div class="card-container">
                <div class="card">
                  <div class="content">
                      <div class="main">
                          <h4>${comentario.fields.titulocomentario}</h4>
                          <p style="text-align: left; padding: 0px; margin:0px;"><small><small>${formatarData(comentario.fields.datacomentario)} às ${comentario.fields.horacomentario}</small></small></p>
                          <p style="text-align: left; padding: 0px; margin:0px;"><small><a href="/perfil/${autores[index].pk}">${autores[index].fields.primnomeusuario} ${autores[index].fields.ultnomeusuario}</a></small></p>
                          <p style="text-align: left">${comentario.fields.txtcomentario}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
        `);
    });
		//Ao se abrir o mapa expandido seta o mapa e adiciona visualizacao
    $("#titulo_mapa"+(10*(gruposCarregados-1)+i)).on("click", function(){
			$.ajax({
					url: '/ajax/adicionarView/',
					data: {
						'mapa': JSON.parse(data.mapa)[0].pk,
						'usuario': idUsuarioLogado
					},
					dataType: 'json',
					success: function (data) {
					}
			 });
       setTimeout(function(){
         setMapa(mapa, JSON.parse(data.pontos), JSON.parse(data.icones), rotas, pontoRotas, areas, pontoAreas, "mapExp"+(10*(gruposCarregados-1)+i));
       }, 1000);
    });
		//Seta o mapa do feed
    setMapa(mapa, JSON.parse(data.pontos), JSON.parse(data.icones), rotas, pontoRotas, areas, pontoAreas, "map"+(10*(gruposCarregados-1)+i));
}
