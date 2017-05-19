var erroData;
var erroSenhaConf;
var erroSenha;
var erroSenhaAtual;

function validateAlteracao(){
		let data = $('#dataNascimento');
		let sexoM = $('#masc');
		let sexoF= $('#femin');
		let retorno=true;
    let newdate = data.val().split("/").reverse().join("-");
    let dataValidacao = new Date(newdate);
    if(dataValidacao.toString()=="Invalid Date" || dataValidacao.getFullYear()<1900 ){
    	data.parent().addClass('has-error');
    	if($("#erroData").length === 0){
    		erroData=$('<span id="erroData" class="help-block">Data Inválida</span>').appendTo(data.parent());
    	}
    	retorno =false;
    }else{
			data.parent().removeClass('has-error');
			if(erroData){
				erroData.remove();
			}
		}
    if(retorno){
      $('#formAlteracao').submit();
    }
}

function minCaracSenha(senha){
	return senha.match(/[a-zA-Z]/g) && senha.match(/[0-9]/g);
}

function validateNovaSenha(){
  let senha = $('#password');
  let senhaConf = $('#password_confirmation');
  let senhaAtual = $('#senhaAtual');
  let retorno=true;
  if (senha.val() != senhaConf.val()) {
      senhaConf.parent().addClass('has-error');
      if($('#erroSenhaConf').length === 0) {
        erroSenhaConf=$('<span id="erroSenhaConf" class="help-block">As senhas não correspondem</span>').appendTo(senhaConf.parent());
      }
      retorno=false;
  }else{
    senhaConf.parent().removeClass('has-error');
    if(erroSenhaConf){
      erroSenhaConf.remove();
    }
  }
  if(senha.val().length < 6 || !minCaracSenha(senha.val())){
    senha.parent().addClass('has-error');
    if($('#erroSenha').length === 0) {
      erroSenha=$('<span id="erroSenha" class="help-block">A senha deve ter ao menos 6 caracteres e deve conter números e letras</span>').appendTo(senha.parent());
    }
    retorno=false;
  }else{
    senha.parent().removeClass('has-error');
    if(erroSenha){
      erroSenha.remove();
    }
  }
  $.ajax({
      url: '/ajax/checkarSenha/',
      data: {
        'senha': senhaAtual.val(),
        'id': $('#userId').val()
      },
      dataType: 'json',
      success: function (data) {
        if (data.incorreta) {
           senhaAtual.parent().addClass('has-error');
           if($('#erroSenhaAtual').length === 0) {
             erroSenhaAtual=$('<span id="erroSenhaAtual" class="help-block">Senha incorreta</span>').appendTo(senhaAtual.parent());
           }
           retorno=false;
        }else{
          senhaAtual.parent().removeClass('has-error');
          if(erroSenhaAtual){
            erroSenhaAtual.remove();
          }
        }
        if(retorno){
          $('#formSenha').submit();
        }
      }
  });
}

function readURL(input) {
		if (input.files && input.files[0]) {
		    var reader = new FileReader();
		    reader.onload = function (e) {
		        $('#novaImg').attr('src', e.target.result);
            $('#novaImg').cropper({
              aspectRatio: 1/1,
              crop: function(e) {

              }
            });
		    }
        reader.readAsDataURL(input.files[0]);
    }
}
$("#imgInp").change(function(){
	 readURL(this);
});

function mudarImagem(){
    $("#novaImg").cropper('getCroppedCanvas').toBlob(function (blob) {

      var reader = new window.FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = function() {
          base64data = reader.result;
          $("#blob").val(base64data);
          $('#formImagem').submit();
      }
    });

}
var gruposCarregados=0;
var renderizarMapa;

function formatarData(input) {
    var ptrn = /(\d{4})\-(\d{2})\-(\d{2})/;
    if(!input || !input.match(ptrn)) {
        return null;
    }
    return input.replace(ptrn, '$3/$2/$1');
};

function carregarMapas(){
	let div=$("#divMapas");
	gruposCarregados++;
	for(let i=0; i<10; i++){
		$.ajax({
	      url: '/ajax/carregarMapasPerfil/',
	      data: {
	        'num': 10*(gruposCarregados-1)+i,
	        'id': $('#userId').val()
	      },
	      dataType: 'json',
	      success: function (data) {
					if(data.erro){
						return;
					}
					let mapa=JSON.parse(data.mapa)[0];
					mapa=mapa.fields;
					let postagem=JSON.parse(data.postagem)[0];
					postagem=postagem.fields;
					let autores=JSON.parse(data.autores);
					let comentarios=JSON.parse(data.comentarios);
					let rotas=JSON.parse(data.rotas);
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
					 if(comentarios.length<1){
						 $('#comentarios'+(10*(gruposCarregados-1)+i)).append(`
 								<div class="row">
 									<div class="col-md-12">
 										<p style="text-align: left;">Ainda não existem comentários</p>
 										</div>
 									</div>
 							`);
					 }
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
					$('#comentarios'+(10*(gruposCarregados-1)+i)).append(`
							<button id="comentar${10*(gruposCarregados-1)+i}" class="btn btn-default">Comentar</button>
							<p style="padding:0px; margin:0px">&nbsp</p>
					`);
					$("#titulo_mapa"+(10*(gruposCarregados-1)+i)).on("click", function(){
						 setTimeout(function(){
							 setMapa(mapa, JSON.parse(data.pontos), JSON.parse(data.icones), rotas, "mapExp"+(10*(gruposCarregados-1)+i));
						 }, 1000);
					});
					setMapa(mapa, JSON.parse(data.pontos), JSON.parse(data.icones), rotas, "map"+(10*(gruposCarregados-1)+i));
				}
	  });
	}
}

function setMapa(mapa, pontos, icones, rotas, mapId){
		let inicio = {lat: mapa.coordyinicial, lng: mapa.coordxinicial};
		let map = new google.maps.Map(document.getElementById(mapId), {
			zoom: 12,
			center: inicio
		});
		pontos.forEach(function(item, index){
			if(item.fields.idtponto=='P'){
				let codIcone=item.fields.codicone;
				let iconePonto;
				for(let i=0; i<icones.length; i++){
					if(icones[i].pk==codIcone){
						iconePonto=icones[i];
					}
				}
				let pos = {lat: item.fields.coordy, lng: item.fields.coordx};
				let marker = new google.maps.Marker({
					 position: pos,
					 map: map,
				});
				marker.setIcon(imgUrl+'MapFindIt/ImagemIcones/'+iconePonto.pk+'.png');
				let contentString;
				if(item.fields.fotoponto!=""){
					contentString = 
					`<div id="content">
		            	<h1 id="firstHeading" class="firstHeading">${item.fields.nomponto}</h1>
		            	<div id="bodyContent">
		            		<img class="img-responsive" style="margin: 0 auto;" src="${imgUrl}MapFindIt/ImagemPonto/${item.pk}.png">
		            		<p>${item.fields.descponto}</p>
		            	</div>
		            </div>`;
				}else{
					contentString = 
					`<div id="content">
		            	<h1 id="firstHeading" class="firstHeading">${item.fields.nomponto}</h1>
		            	<div id="bodyContent">
		            		<p>${item.fields.descponto}</p>
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

		});
		rotas.forEach(function(item, index){
			let pontosRota=Array();
			pontos.forEach(function(item, index){
				if(item.fields.idtponto=='R'){
					pontosRota.push(item);
				}
			});
			let directionsService = new google.maps.DirectionsService();
			let directionsDisplay = new google.maps.DirectionsRenderer({
			  polylineOptions: {
			    strokeColor: `rgb(${item.fields.codcor[0]}, ${item.fields.codcor[1]}, ${item.fields.codcor[2]})`
			  }
			});
			let waypts=Array();
			for(let x=1; x<pontosRota.length-1; x++){
				waypts.push({location:{lat: pontosRota[x].fields.coordy, lng: pontosRota[x].fields.coordx}, stopover:false});
			}
			directionsDisplay.setMap(map);
			var request = {
			   origin: {lat: pontosRota[0].fields.coordy, lng: pontosRota[0].fields.coordx},
			   destination: {lat: pontosRota[pontosRota.length-1].fields.coordy, lng: pontosRota[pontosRota.length-1].fields.coordx},
				 waypoints: waypts,
				 travelMode: 'DRIVING'
			};
			directionsService.route(request, function(response, status) {
			  if (status == 'OK') {
			    directionsDisplay.setDirections(response);
			  }
			});
		});
}

function initMap(){
		carregarMapas();
}

$(window).on('scroll', function(){
    if( $(window).scrollTop() > $(document).height() - $(window).height() ) {

    }
});
