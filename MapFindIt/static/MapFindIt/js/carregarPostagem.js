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

function comentar(id){

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
         <a href='#modal_mapa${10*(gruposCarregados-1)+i}' class='tituloMapa' data-toggle='modal' id='titulo_mapa${10*(gruposCarregados-1)+i}'><h4>${mapa.titulomapa}</h4></a>
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
                      <div class="col-md-2" id="comentarios${10*(gruposCarregados-1)+i}" style="overflow-y:scroll; margin:0px; background-color: #E5E9ED; max-height: 83vh;">
                        <p style="margin: 0px; padding: 0px;">&nbsp</p>
                      </div>
                      <div class="col-md-10" style="display: block;" id="divMapa${10*(gruposCarregados-1)+i}">
                        <div class="mapaExp" name='mapExp${10*(gruposCarregados-1)+i}' id='mapExp${10*(gruposCarregados-1)+i}'></div>
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
          <div class="row">
            <div class="col-md-12">
              <p style="text-align: left;">Ainda não existem comentários</p>
              </div>
            </div>
        `);
     }
		 //Adiciona os comentários ao div do mapa expandido
    comentarios.forEach(function(comentario, index){
      $('#comentarios'+(10*(gruposCarregados-1)+i)).append(`
          <div class="row">
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
        <button id="comentar${10*(gruposCarregados-1)+i}" href='#modal_comentar${10*(gruposCarregados-1)+i}' data-toggle="modal" class="btn btn-default">Comentar</button>
        <p style="padding:0px; margin:0px">&nbsp</p>
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
											 <input type="text" name="titulo" class="form-control input-lg" placeholder="Titulo do Comentario" required>
										 </div>
										 <div class="form-group">
										 	 <textarea name="fraseUsuario" class="form-control" rows="2">Comentario...</textarea>
										 </div>
										 <div class="form-group">
										 	  <button type="button" onclick="comentar(${10*(gruposCarregados-1)+i});">Comentar</button>
										 </div>
									 </form>
								 </div>
							 </div>
						</div>
				 </div>
			 </div>
    `);
		//Ao se abrir o mapa expandido seta o mapa
    $("#titulo_mapa"+(10*(gruposCarregados-1)+i)).on("click", function(){
       setTimeout(function(){
         setMapa(mapa, JSON.parse(data.pontos), JSON.parse(data.icones), rotas, pontoRotas, areas, pontoAreas, "mapExp"+(10*(gruposCarregados-1)+i));
       }, 1000);
    });
		//Seta o mapa do feed
    setMapa(mapa, JSON.parse(data.pontos), JSON.parse(data.icones), rotas, pontoRotas, areas, pontoAreas, "map"+(10*(gruposCarregados-1)+i));
}
