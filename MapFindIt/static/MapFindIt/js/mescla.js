function modalMesclar(pesquisa){
  console.log(pesquisa);
  $('#modalDinamico').empty();
	let conteudo=`<div class="modal fade" id="modal-mesclar-mapa" aria-hidden="true">
		<div class="modal-dialog">
			<div class="modal-content">
				<div class="modal-header">
					<button type="button" class="close" onclick='$("#modal-mesclar-mapa").modal("hide");' aria-hidden="true">
						×
					</button>
					<h4 class="modal-title">
						Mesclar um mapa
					</h4>
				</div>
				<div class="modal-body">
                    <form id="searchForm"  method="GET" action="javascript:pesquisarMapas()" style="order:2;">
                        <div class="input-group">
                                    <input type="text" class="form-control" placeholder="Pesquise o mapa a ser mesclado" id="pesquisaMescla" name="pesquisaMescla" value="">
                        <div class="input-group-btn">
                            <button type="submit" class="btn btn-default">Pesquisar</button>
                        </div>
                            </div>
                    </form>
                    <br>
                    <div id="mapasMesclar" style="height: 70vh; overflow-y: scroll;">

                    </div>
                </div>
            </div>
        </div>
    </div>`
	$('#modalDinamico').html(conteudo);
    $('#modal-mesclar-mapa').modal('show');
    if(pesquisa!==undefined){
        $('#pesquisaMescla').val(pesquisa);
        pesquisarMapas();
    }
}

function pesquisarMapas(){
   let pesquisa = $("#pesquisaMescla").val();
   $.ajax({
        url: '/ajax/mapasMesclar/',
        data: {
          'pesquisa': pesquisa 
        },
        dataType: 'json',
        success: function (data) {
           mapas=JSON.parse(data.mapas);
           $('#mapasMesclar').empty();
           for(let i=0; i<mapas.length; i++){
               if(mapas[i][0]==idMapa){
                   continue;
               }
               $('#mapasMesclar').append(`<div class="col-md-12">
                <div class="card-container mapaMesclar" id="mapaMesclar${mapas[i][0]}">
                    <div class="card">
                        <div class="content">
                                <div class="main">
                                    <h4>${mapas[i][1]}</h4>
                                    <p style="text-align: left">${mapas[i][2]}</p>
                                    <button id=botaoMapaModal${mapas[i][0]} class="small btn btn-default" style="text-align: left">Ver Mapa</button>
                                </div>
                        </div>
                    </div>
                </div>
                </div>`);
              $('#botaoMapaModal'+mapas[i][0]).on('click', function(e){
                    $('#modalDinamico').html('');
                    $('#modalDinamico').append(`
                        <div class='modal fade' id="modalMapa${mapas[i][0]}" name="modalMap" aria-hidden='true'>
                            <div class='modal-dialog modal-map-dialog' >
                                <div class='modal-content modal-map-content'>
                                    <div class='modal-header'>
                                        <button type='button' class='close' data-dismiss='modal' aria-hidden='true' onclick="$('#modalMapa${mapas[i][0]}').modal('hide'); $('body').removeClass().removeAttr('style');$('.modal-backdrop').remove(); modalMesclar('${pesquisa}');">
                                            <i class="fa fa-arrow-left" aria-hidden="true"></i>
                                        </button>
                                        <h4 class='modal-title'>
                                            ${mapas[i][1]}
                                        </h4>
                                    </div>
                                    <div class='modal-body modal-map-body'>
                                        <div class="container-fluid">
                                            <div class="row">
                                                <div class="col-md-10" style="display: block;" id="divMapa${mapas[i][0]}">
                                                    <div class="mapaExp" id='mapaModal${mapas[i][0]}'>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `);
                    $('#modal-mesclar-mapa').modal('hide');
                    $("#modalMapa"+mapas[i][0]).modal("show");
                    carregarMapaModal(mapas[i][0]);
                    e.stopPropagation();
                    return false;
              });
              $('#mapaMesclar'+mapas[i][0]).on('click', function(){
                  let id = $(this).attr('id').substring(11);
                  $("#modal-mesclar-mapa").modal("hide");
                  $('#modalDinamico').empty();
                    let conteudo=`<div class="modal fade" id="modal-confirmar-mescla" aria-hidden="true">
                        <div class="modal-dialog">
                            <div class="modal-content">
                                <div class="modal-header">
                                    <button type="button" class="close" onclick="$('#modal-confirmar-mescla').modal('hide'); $('body').removeClass().removeAttr('style');$('.modal-backdrop').remove();" aria-hidden="true">
                                        ×
                                    </button>
                                    <h4 class="modal-title">
                                        Confirmar Mescla
                                    </h4>
                                </div>
                                <div class="modal-body">
                                    <h4>Você tem certeza que deseja mesclar esses mapas? A ação não poderá ser desfeita</h4>
                                    <div class="modal-footer">
                                        <button class="btn btn-success" onclick="mesclar(${id});" id="confirmarMesclaBtn">Confirmar</button>
                                        <button class="btn btn-danger" onclick="$('#modal-confirmar-mescla').modal('hide'); $('body').removeClass().removeAttr('style');$('.modal-backdrop').remove();">Cancelar</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>`;
                    $('#confirmarMesclaBtn').on('click', function(){
                        mesclar(id);
                    });
                    $('#modalDinamico').html(conteudo);
                    $('#modal-confirmar-mescla').modal('show');
              })
           }
        }
    });
}

function carregarMapaModal(id){
    $.ajax({
      url: '/ajax/carregarMapa/',
      data: {
        'id': id
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
        setTimeout(function(){
            setMapaModal(mapa, JSON.parse(data.pontos), JSON.parse(data.icones), JSON.parse(data.rotas),
                pontoRotas, JSON.parse(data.areas), pontoAreas, 'mapaModal'+id, inicio);
        }, 1000)
      }
  });
}

function mesclar(id){
        window.location.href = "/fazerMescla?id="+id+"&idEditando="+idMapa;
}

//Desenha o icone de marker
function pinSymbol(color) {
		//Retorna o desenho de um ponto de determinada cor
		if(color=='#000' || color=='#000000' || color=='rgb(0,0,0)'){
			//Se o ponto for preto o contorno é branco
			return {
	        path: google.maps.SymbolPath.CIRCLE,
	        fillColor: color,
	        fillOpacity: 1,
	        strokeColor: '#FFF',
	        strokeWeight: 1,
	        scale: 10,
	   };
		}else{
			//Para outras cores o contorno é preto
			return {
	        path: google.maps.SymbolPath.CIRCLE,
	        fillColor: color,
	        fillOpacity: 1,
	        strokeColor: '#000',
	        strokeWeight: 2,
	        scale: 10,
	   };
		}
}

//Função para exibir o mapa
function setMapaModal(mapa, pontos, icones, rotas, pontoRotas, areas, pontoAreas, mapId) {
	let inicio = {
		lat: mapa.coordyinicial,
		lng: mapa.coordxinicial
	};
	//Cria o mapa em suas coordenadas iniciais
	let map = new google.maps.Map(document.getElementById(mapId), {
		zoom: 12,
		center: inicio
	});
	//Para cada ponto do mapa
	pontos.forEach(function (item, index) {
		//Verifica se o ponto é uma marcação e não parte de uma área ou rota
		if (item.fields.idtponto == 'P') {
			let iconePonto = null;
			let codIcone = item.fields.codicone;
			for (let i = 0; i < icones.length; i++) {
				//Salva o icone do ponto
				if (icones[i].pk == codIcone) {
					iconePonto = icones[i];
				}
			}
			//Coordenadas do ponto
			let pos = {
				lat: item.fields.coordy,
				lng: item.fields.coordx
			};
			//Cria o marcador no ponto
			let marker = new google.maps.Marker({
				position: pos,
				map: map,
			});
			//Se o ponto possui um icone, define esse icone ao marcador
			if (iconePonto != null)
				marker.setIcon(imgUrl + 'MapFindIt/ImagemIcones/' + iconePonto.pk + '.png');
			let contentString;
			if (item.fields.fotoponto != "") {
				//Se o ponto possui foto
				contentString =
					`<div id="content">
		            	<h1 id="firstHeading" class="firstHeading">${item.fields.nomponto}</h1>
		            	<div id="bodyContent">
		            		<img class="img-responsive" style="margin: 0 auto;" src="${imgUrl}MapFindIt/ImagemPonto/${item.pk}.png">
		            		<p>${item.fields.descponto}</p>
		            	</div>
		            </div>`;
			} else {
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
			marker.addListener('click', function () {
				infowindow.open(map, marker);
			});
		}
	});
	//Para cada rota
	rotas.forEach(function (item, index) {
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
		//Pontos da rota
		let objsPonto=[];
		//Para cada ponto cria uma marcacao com a cor da rota, e cria um evento de click para as marcacoes
		for(let x=0; x<pontosRota.length; x++){
			let ponto;
			pontos.forEach(function(item){
				if(item.pk==pontosRota[x].fields.idponto){
					ponto=item;
					return;
				}
			});
			if(ponto===undefined){
				continue;
			}
			objsPonto.push(ponto);
			let cor;
			//Algoritmo para detectar melhor cor da fonte
			let a = 1 - ( 0.299 * item.fields.codcor[0] + 0.587 * item.fields.codcor[1] + 0.114 * item.fields.codcor[2])/255;
			if (a < 0.5)
				cor='black';
			else
				cor='white';
			let marker = new google.maps.Marker({
				position: new google.maps.LatLng(ponto.fields.coordy, ponto.fields.coordx),
				map: map,
				label: {
					text: (pontosRota[x].fields.seqponto+1).toString(),
					fontWeight: 'bold',
					fontSize: '12px',
					fontFamily: '"Courier New", Courier,Monospace',
					color: cor
				},
				icon: pinSymbol(pinColor)
			});
			if(ponto.fields.fotoponto!=""){
				//Se o ponto possui foto
				contentString =
				`<div id="content">
					<h1 id="firstHeading" class="firstHeading">${ponto.fields.nomponto}</h1>
					<div id="bodyContent">
						<img class="img-responsive" style="margin: 0 auto;" src="${imgUrl}MapFindIt/ImagemPonto/${ponto.pk}.png">
						<p>${ponto.fields.descponto}</p>
						<hr>
						<h2 class="firstHeading">${item.fields.nomerota}</h2>
						<div id="bodyContent">
							<p>${item.fields.descrota}</p>
						</div>
					</div>
				</div>`;
			}else{
				//Se o ponto não possui foto
				contentString =
					`<div id="content">
						<h1 id="firstHeading" class="firstHeading">${ponto.fields.nomponto}</h1>
						<div id="bodyContent">
							<p>${ponto.fields.descponto}</p>
							<hr>
							<h2 class="firstHeading">${item.fields.nomerota}</h2>
							<div id="bodyContent">
								<p>${item.fields.descrota}</p>
							</div>
						</div>
					</div>`;
			}
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
			waypts.push({location:{lat: objsPonto[x].fields.coordy, lng: objsPonto[x].fields.coordx}, stopover:false});
		}
		//Define o mapa da rota
		directionsDisplay.setMap(map);
		let request;
		if(waypts.length>0){
			//Se existem mais de dois pontos
			request = {
				origin: {lat: objsPonto[0].fields.coordy, lng: objsPonto[0].fields.coordx},
				destination: {lat: objsPonto[pontosRota.length-1].fields.coordy, lng: objsPonto[pontosRota.length-1].fields.coordx},
				waypoints: waypts,
				travelMode: 'DRIVING'
			};
		}else{
			//Se existem apenas dois pontos
			request = {
				origin: {lat: objsPonto[0].fields.coordy, lng: objsPonto[0].fields.coordx},
				destination: {lat: objsPonto[pontosRota.length-1].fields.coordy, lng: objsPonto[pontosRota.length-1].fields.coordx},
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
	areas.forEach(function (item, index) {
		//Todos os pontos que compoe uma area
		let pontosArea = pontoAreas[index];
		//Array com as posicoes de todos os pontos
		let coords = Array();
		for (let x = 0; x < pontosArea.length; x++) {
			coords.push({
				lat: pontosArea[x].fields.idponto[0],
				lng: pontosArea[x].fields.idponto[1]
			});
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
		let contentString =
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
	//Se for um mapa expandido
	if (mapId.substring(3, 6)=="Exp") {
		var legend = document.createElement('div');
		$(legend).html("<h4>Legenda</h4>");
		$(legend).addClass("legend");
		//Para cada icone
		for (let i = 0; i < icones.length; i++) {
			let icon = icones[i];
			let name = icon.fields.nomeicone;
			let icone = imgUrl + 'MapFindIt/ImagemIcones/' + icon.pk + '.png';
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
		if (icones.length == 0) {
			legend.innerHTML = "";
			legend.className = "";
		}
		//Adiciona a div de legendas ao mapa
		map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(legend);
		//Adiciona botão de mapa de calor
		div = document.createElement('div');
		//Cria uma div com a imagem do icone e o seu nome
		div.innerHTML =
			`<div style="display:flex; flex-direction: row; justify-content: space-between;">
				<button type="button" id="densidade${mapId}" class="btn btn-default"><small>Densidade</small></button>
			</div>
			`;
		div.addEventListener('click', function() {
			mapa.coordyinicial=map.getCenter().lat();
			mapa.coordxinicial=map.getCenter().lng();
			mapaCalor(mapa, pontos, icones, rotas, pontoRotas, areas, pontoAreas, mapId);
        });
		map.controls[google.maps.ControlPosition.BOTTOM_LEFT].push(div);
	}

}

function mapaCalor(mapa, pontos, icones, rotas, pontoRotas, areas, pontoAreas, mapId){
	let inicio = {
		lat: mapa.coordyinicial,
		lng: mapa.coordxinicial
	};
	//Cria o mapa em suas coordenadas iniciais
	let map = new google.maps.Map(document.getElementById(mapId), {
		zoom: 12,
		center: inicio
	});
	var heatMapData = [];
	//Para cada ponto do mapa
	pontos.forEach(function (item, index) {
		heatMapData.push({location: new google.maps.LatLng(item.fields.coordy, item.fields.coordx), weight: 1});
	});
	var heatmap = new google.maps.visualization.HeatmapLayer({
		data: heatMapData
	});
	heatmap.setMap(map);
	div = document.createElement('div');
	//Cria uma div com a imagem do icone e o seu nome
	div.innerHTML =
		`<div style="display:flex; flex-direction: row; justify-content: space-between;">
			<button type="button" id="densidade${mapId}" class="btn btn-default"><small>Densidade</small></button>
		</div>
		`;
	div.addEventListener('click', function() {
		mapa.coordyinicial=map.getCenter().lat();
		mapa.coordxinicial=map.getCenter().lng();
		setMapa(mapa, pontos, icones, rotas, pontoRotas, areas, pontoAreas, mapId);
    });
	map.controls[google.maps.ControlPosition.BOTTOM_LEFT].push(div);
}