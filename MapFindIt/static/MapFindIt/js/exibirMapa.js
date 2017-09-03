var map;

function pinSymbol(color) {
		//Retorna o desenho de um ponto de determinada cor
		if(color=='#000' || color=='#000000' || color=='rgb(0,0,0)'){
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

function carregarMapaInicial(){
  $('#divMapa').empty();
  $.ajax({
      url: '/ajax/carregarMapa/',
      data: {
        'id': idMapa
      },
      dataType: 'json',
      success: function (data) {
        //Define o mapa
        let mapa=JSON.parse(data.mapa)[0].fields;
        let inicio={lat: mapa.coordyinicial, lng: mapa.coordxinicial}
        let pontoAreas = JSON.parse(data.pontoAreas);
        for(let i=0; i<pontoAreas.length; i++){
          pontoAreas[i]=JSON.parse(pontoAreas[i]);
        }
        let pontoRotas = JSON.parse(data.pontoRotas);
        for(let i=0; i<pontoRotas.length; i++){
          pontoRotas[i]=JSON.parse(pontoRotas[i]);
        }
        setMapa(mapa, JSON.parse(data.pontos), JSON.parse(data.icones), JSON.parse(data.rotas),
                pontoRotas, JSON.parse(data.areas), pontoAreas, 'divMapa', inicio);
      }
  });
}

function initMap(){
   carregarMapaInicial();
}

function setMapa(mapa, pontos, icones, rotas, pontoRotas, areas, pontoAreas, mapId, inicio, reset){
    //Cria estilo sem Pontos de Interesse
    let removerPOI =[{
        featureType: "poi",
        elementType: "labels",
        stylers: [{ visibility: "off" }]
    },
    {
        featureType: "transit.station.bus",
        stylers: [{ visibility: "off" }]
    }];
    //Cria o mapa em suas coordenadas iniciais
    map = new google.maps.Map(document.getElementById(mapId), {
        zoom: 16,
        center: inicio
    });
    map.setOptions({styles: removerPOI});
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
                   <button class="btn btn-default" onClick="escolherIcone(${item.pk});">Escolher Icone</button>
		           	</div>
		           </div>`;
			}else{
				//Se o ponto não possui foto
				contentString =
				`<div id="content">
		           	<h1 id="firstHeading" class="firstHeading">${item.fields.nomponto}</h1>
		           	<div id="bodyContent">
		           		<p>${item.fields.descponto}</p>
                   <div class="centerDiv">
                     <button class="btn btn-default" onClick="escolherIcone(${item.pk});">Escolher Icone</button>
                   </div>
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
			suppressMarkers: true,
            preserveViewport: true
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