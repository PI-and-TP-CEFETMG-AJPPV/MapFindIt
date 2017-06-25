//Indica qual ferramenta está sendo usada
var ferramentaSelec=-1;
//Mapa sendo editado
var map;

/*
  Ponto = 0;
  Área = 1;
  Rota = 2;
*/
function selecionar(idt){
   //Ferramenta escolhida e sua categoria
   let pai, elem;
   //Remove uma ferramenta já escolhida
   if(ferramentaSelec!=-1){
     let paiR, elemR;
     switch(ferramentaSelec){
       case 0: paiR=$('#selecInserir');
               elemR=$('#selecPonto');
               break;
       case 1: paiR=$('#selecInserir');
               elemR=$('#selecArea');
               break;
       case 2: paiR=$('#selecInserir');
               elemR=$('#selecRota');
               break;
     }
     paiR.removeClass('selecionado');
     elemR.removeClass('selecionado');
     map.setOptions({ draggableCursor : 'auto' });
   }
   //Estiliza os elementos da ferramenta escolhida, caso ela não estivesse já selecionada
   if(idt!=ferramentaSelec){
     switch(idt){
       case 0: pai=$('#selecInserir');
               elem=$('#selecPonto');
               map.setOptions({ draggableCursor : 'url("'+imgUrl+'MapFindIt/iconesEditar/Ponto.png"), auto' });
               break;
       case 1: pai=$('#selecInserir');
               elem=$('#selecArea');
               map.setOptions({ draggableCursor : 'url("'+imgUrl+'MapFindIt/iconesEditar/Area.png"), auto' });
               break;
       case 2: pai=$('#selecInserir');
               elem=$('#selecRota');
               map.setOptions({ draggableCursor : 'url("'+imgUrl+'MapFindIt/iconesEditar/Rota.png"), auto' });
               break;
     }
     pai.addClass('selecionado');
     elem.addClass('selecionado');
     ferramentaSelec=idt;
   }else{
     ferramentaSelec=-1;
   }
}

//Função para mudar a imagem do Crop do Ponto
function readURLPonto(input) {
		if (input.files && input.files[0]) {
		    var reader = new FileReader();
		    reader.onload = function (e) {
		        $('#novaImgPonto').attr('src', e.target.result);
            $('#novaImgPonto').cropper({
              aspectRatio: 1/1,
              crop: function(e) {

              }
            });
		    }
        reader.readAsDataURL(input.files[0]);
    }
}
//Arquivo de imagem em blob
var blobFinalPonto;
function mudarImagemPonto(){
		//Obtem a imagem cropped em blob
    $("#novaImgPonto").cropper('getCroppedCanvas').toBlob(function (blob) {
		      var reader = new window.FileReader();
		      reader.readAsDataURL(blob);
		      reader.onloadend = function() {
          base64data = reader.result;
          blobFinalPonto=base64data;
      }
    });
}

//Cria o ponto no banco
function criarPonto(lat, lng){
   if($('#imgInp').val() != ''){
     mudarImagemPonto();
   }
   setTimeout(function () {
     $.ajax({
         url: '/ajax/criarPonto/',
         data: {
           'titulo': $('#pontoTitulo').val(),
           'desc': $('#pontoDesc').val(),
           'coordx': lng,
           'coordy': lat,
           'idMapa': idMapa,
           'idUsuario': idUsuarioLogado
         },
         dataType: 'json',
         success: function (data) {
           if(blobFinal){
             $.ajax({
                 url: '/ajax/criarImagemPonto/'+data.id+'/',
                 type: 'POST',
                 data: {
                   'img':blobFinalPonto,
                   'csrfmiddlewaretoken': $('input[name="csrfmiddlewaretoken"]').val()
                 },
                 dataType: 'json',
                 success: function (data) {
                    carregarMapa({'lat': lat, 'lng': lng});
                 }
             });
             blobFinalPonto='';
           }else{
             carregarMapa({'lat': lat, 'lng': lng});
           }
         }
     });
   }, 500);

}

//Para o cropper do icone
$(document).on('change','#imgInpIcone',function(){
  readURLIcone(this);
});

function readURLIcone(input) {
		if (input.files && input.files[0]) {
		    var reader = new FileReader();
		    reader.onload = function (e) {
		        $('#novaImgIcone').attr('src', e.target.result);
            $('#novaImgIcone').cropper({
              aspectRatio: 1/1,
              crop: function(e) {

              }
            });
		    }
        reader.readAsDataURL(input.files[0]);
    }
}
//Arquivo de imagem em blob
var blobFinalIcone="";
function mudarImagemIcone(){
		//Obtem a imagem cropped em blob
    $("#novaImgIcone").cropper('getCroppedCanvas').toBlob(function (blob) {
		      var reader = new window.FileReader();
		      reader.readAsDataURL(blob);
		      reader.onloadend = function() {
          base64data = reader.result;
          blobFinalIcone=base64data;
      }
    });
}

//Para criar o icone
function criarIcone(){
    mudarImagemIcone();
    //Timeout para tempo de gerar a imagem
    setTimeout(function () {
      if(blobFinalIcone!=""){
        $.ajax({
            url: '/ajax/criarIcone/',
            type: 'POST',
            data: {
              'nome': $('#legendaIcone').val(),
              'icone': blobFinalIcone,
              'usuario': idUsuarioLogado,
              'csrfmiddlewaretoken': $('input[name="csrfmiddlewaretoken"]').val()
            },
            dataType: 'json',
            success: function (data) {
              $('#modal-criar-icone').modal('hide');
            }
        });
        blobFinalIcone='';
      }
    }, 500);
}
//Para inserir ponto no mapa
function inserirPonto(evento){
  var contentString =
      `<div id="content">
         <form id="pontoForm" action="javascript:criarPonto(${evento.latLng.lat()}, ${evento.latLng.lng()})">
            <div class="form-group">
               <input id="pontoTitulo" required type="text" class="form-control" placeholder="Titulo do Ponto">
            </div>
            <div class="form-group">
               <textarea id="pontoDesc" class="form-control" placeholder="Descrição do Ponto" rows=2></textarea>
            </div>
            <div class="form-group" height="150px">
              <div class="input-group">
                  <span class="input-group-btn center">
                      <span class="btn btn-default btn-file">
                          Escolher Imagem do Ponto... <input accept="image/*" type="file" id="imgInpPonto">
                      </span>
                  </span>
              </div>
              <br>
              <img id='novaImgPonto'/>
            </div>
            <div class="form-group">
               <button type="submit" class="btn btn-default">Criar Ponto</button>
            </div>
         </form>
      </div>`;
  var infowindow = new google.maps.InfoWindow({
    content: contentString
  });
  //Para o upload de imagens
  $(document).on('change','#imgInpPonto',function(){
    readURLPonto(this);
  });
  var marker = new google.maps.Marker({
    position: evento.latLng,
    map: map
  });
  infowindow.open(map, marker);
  google.maps.event.addListener(infowindow,'closeclick', function(){
     marker.setMap(null); //Remove marker
  });

}

//Icone escolhido pelo usuário
var iconeEscolhido;

function salvarIcone(id){
  $.ajax({
      url: '/ajax/salvarIcone/',
      data: {
        'id': id,
        'idIcone': iconeEscolhido
      },
      dataType: 'json',
      success: function (data) {
        if(data.sucesso){
          carregarMapa(map.getCenter());
          $('#modal-icone').modal('hide');
        }
      }
   });
}

//Elementos para a escolha do icone
function escolherIcone(id){
  $.ajax({
      url: '/ajax/getTodosIcones/',
      data: {
        'id': idUsuarioLogado
      },
      dataType: 'json',
      success: function (data) {
         if(data.icones){
             $('#modalDinamico').empty();
             let conteudo=`
             <div class="modal fade" style="top:-5%;" id="modal-icone" aria-hidden="true">
               <div class="modal-dialog" style="width: 80vw;">
                 <div class="modal-content">
                   <div class="modal-header">
                     <button type="button" class="close" onclick='$("#modal-icone").modal("hide");' aria-hidden="true">
                       ×
                     </button>
                     <h4 class="modal-title">
                       Escolher icone para o ponto
                     </h4>
                   </div>
                   <div class="modal-body" style="overflow: scroll; overflow-x: hidden; height: 80vh;">
                     <div class="centerDiv">
                        <input id="filtrarIcones" type="text" placeholder="Filtrar icones" style="width:96%; height:90%;">
                        <br>
                        <br>
                        <b
                     </div>
                     <div id="container-icones" style="display: flex; flex-direction: row; flex-wrap: wrap;">

                     </div>
                   </div>
                   <div class="modal-footer">
                     <button type="button" onclick="if(iconeEscolhido){salvarIcone(${id});}" class="btn btn-success"> Escolher Icone </button>
                     <button type="button" data-dismiss="modal" class="btn btn-default"> Cancelar </button>
                   </div>
                 </div>
               </div>
             </div>
             `;
             $('#modalDinamico').html(conteudo);
             let icones=JSON.parse(data.icones);
             let container=$("#container-icones");
             for(let i=0; i<icones.length; i++){
                item=icones[i].fields;
                $('#container-icones').append(`
                  <div id='icone${icones[i].pk}' class="imagemIcone centerDiv">
                    <img src='${imgUrl}MapFindIt/ImagemIcones/${icones[i].pk}.png'>
                    <p>${item.nomeicone}</p>
                  </div>
                  `);
             }
             $('.imagemIcone').on('click', function(){
                 $('.imagemIcone').removeClass('iconeEscolhido');
                 $(this).addClass('iconeEscolhido');
                 //Salva o id do icone (id do elemento retirando-se a palavra icone)
                 iconeEscolhido=$(this).attr('id').substring(5);
             });
             $('#filtrarIcones').keyup(function(event) {
                 //Para cada icone carregado
                 $(".imagemIcone").each(function(i, item){
                   //Pega o objeto JQuery da div do icone
                   item=$(item);
                   //Pega o titulo do icone para identifica-lo
                   let parag = item.children('p');
                   //Se o nome conter a string pesquisada
                   if(parag.text().indexOf($("#filtrarIcones").val())!==-1){
                     //Mostra o icone
                     item.show();
                   }else{
                     //Esconde o icone
                     item.hide();
                   }
                 });
             });
             $('#modal-icone').modal('show');

          }
      }
    });
}

function carregarMapaInicial(){
  map=null;
  $('#divMapa').empty();
  $.ajax({
      url: '/ajax/carregarMapaEditar/',
      data: {
        'id': idMapa
      },
      dataType: 'json',
      success: function (data) {
        //Define o mapa
        let mapa=JSON.parse(data.mapa)[0].fields;
        let inicio={lat: mapa.coordyinicial, lng: mapa.coordxinicial}
        setMapa(mapa, JSON.parse(data.pontos), JSON.parse(data.icones), JSON.parse(data.rotas),
                JSON.parse(data.pontoRotas), JSON.parse(data.areas), JSON.parse(data.pontoAreas), 'divMapa', inicio);
      }
  });
  setTimeout(function(){
    google.maps.event.addListener(map, "click", function (e) {
      if(ferramentaSelec!=-1){
        map.setZoom(16);
        map.setCenter(e.latLng);
        switch(ferramentaSelec){
          case 0: inserirPonto(e)
        }
      }
    });
  }, 1000);
}

function carregarMapa(inicio){
  map=null;
  $('#divMapa').empty();
  $.ajax({
      url: '/ajax/carregarMapaEditar/',
      data: {
        'id': idMapa
      },
      dataType: 'json',
      success: function (data) {
        //Define o mapa
        let mapa=JSON.parse(data.mapa)[0].fields;
        setMapa(mapa, JSON.parse(data.pontos), JSON.parse(data.icones), JSON.parse(data.rotas),
                JSON.parse(data.pontoRotas), JSON.parse(data.areas), JSON.parse(data.pontoAreas), 'divMapa', inicio);
      }
  });
  setTimeout(function(){
    google.maps.event.addListener(map, "click", function (e) {
      if(ferramentaSelec!=-1){
        map.setZoom(16);
        map.setCenter(e.latLng);
        switch(ferramentaSelec){
          case 0: inserirPonto(e)
        }
      }
    });
  }, 1000);
}

function initMap(){
   carregarMapaInicial();
}
//Função para exibir o mapa
function setMapa(mapa, pontos, icones, rotas, pontoRotas, areas, pontoAreas, mapId, inicio){
    //Cria o mapa em suas coordenadas iniciais
		map = new google.maps.Map(document.getElementById(mapId), {
			zoom: 16,
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
