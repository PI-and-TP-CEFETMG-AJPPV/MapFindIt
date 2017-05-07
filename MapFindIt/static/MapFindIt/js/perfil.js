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
					console.log(mapa);
					console.log(data.icones);
					console.log(data.pontos)
					div.append(`
						<div class='row'>
					  	<div class='col-md-8 col-md-offset-2 white'>
					     <div class='center'>
					      <a href='#modal_mapa${10*(gruposCarregados-1)+i}' class='tituloMapa' data-toggle='modal' id='titulo_mapa${10*(gruposCarregados-1)+i}'><h4>${mapa.titulomapa}</h4></a>
					     </div>
					     <div class="mapa" name='map${10*(gruposCarregados-1)+i}' id='map${10*(gruposCarregados-1)+i}'></div>
					     <div class='modal fade' id='modal_mapa${10*(gruposCarregados-1)+i}' role='dialog' aria-labelledby='myModalLabel' aria-hidden='true'>
					        <div class='modal-dialog'>
					          <div class='modal-content'>
					            <div class='modal-header'>
					              <button type='button' class='close' data-dismiss='modal' aria-hidden='true'>
					                ×
					              </button>
					              <h4 class='modal-title'>
					                ${mapa.titulomapa}
					              </h4>
					            </div>
					            <div class='modal-body'>
					              <div class="mapa" name='mapExp${10*(gruposCarregados-1)+i}' id='mapExpandido${10*(gruposCarregados-1)+i}'></div>
					            </div>
					          </div>
					        </div>
					     </div>
					  </div>
					</div>`);
					setMapa(mapa, JSON.parse(data.pontos); JSON.parse(data.icones), 10*(gruposCarregados-1)+i);
	      },
				error: function(jqXHR, exception){

				}
	  });
	}
}

function setMapa(mapa, pontos, icones, id){
		let inicio = {lat: mapa.coordyinicial, lng: mapa.coordxinicial};
		let map = new google.maps.Map(document.getElementById("map"+id), {
			zoom: 4,
			center: inicio
		});
		pontos.forEach(function(item, index){
			let codIcone=item.codicone;
			let iconePonto;
			for(icon in icones){
				if(icon.codicone==codicone){
					iconePonto=icon;
				}
			}
			let marker = new google.maps.Marker({
				 position: {lat:item.coordy, lng:item.coordx},
				 map: map,
				 icon: iconePonto.imgicone.url
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
/*
<div class="row">
  <div class="col-md-8 col-md-offset-2 white">
     <div class="center">
      <a href="#modal-container-mapa" class="tituloMapa" data-toggle="modal" id="modal_mapa"><h4>Titulo</h4></a>
     </div>
     <div name="map" id="map"></div>
      <div class="modal fade" id="modal-container-mapa" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <button type="button" class="close" data-dismiss="modal" aria-hidden="true">
                ×
              </button>
              <h4 class="modal-title" id="myModalLabel">
                Titulo
              </h4>
            </div>
            <div class="modal-body">
              <div name="mapExp" id="mapExpandido"></div>
            </div>
          </div>
        </div>
      </div>
  </div>
</div>
*/
