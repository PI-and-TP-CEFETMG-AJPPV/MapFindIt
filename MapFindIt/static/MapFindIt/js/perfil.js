//Função para tratar a solicitação de amizade
function solicitacaoAmizade(){
		$('#solicitarAmizade').click(function(){
			$.ajax({
		      url: '/ajax/criarAmizade/',
		      data: {
		        'usuario': idUsuarioLogado,
		        'alvo': idUsuarioPagina
		      },
		      dataType: 'json',
		      success: function (data) {
		      }
		  });
		});
}

//Variaveis para guardar os erros
var erroData;
var erroSenhaConf;
var erroSenha;
var erroSenhaAtual;

function validateAlteracao(){
		let data = $('#dataNascimento');
		let sexoM = $('#masc');
		let sexoF= $('#femin');
		let retorno=true;
		//Transforma data em Date String
    let newdate = data.val().split("/").reverse().join("-");
		//Cria um objeto date com a data
		let dataValidacao = new Date(newdate);
		//Caso a ano seja invalido ou a data inserida seja invalida falha
    if(dataValidacao.toString()=="Invalid Date" || dataValidacao.getFullYear()<1900 ){
    	data.parent().addClass('has-error');
    	if($("#erroData").length === 0){
    		erroData=$('<span id="erroData" class="help-block">Data Inválida</span>').appendTo(data.parent());
    	}
    	retorno =false;
    }else{
			//Se está correto remove o erro
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
	//Checa se a senha corresponde aos requisitos minimos de senha
	return senha.match(/[a-zA-Z]/g) && senha.match(/[0-9]/g);
}

function validateNovaSenha(){
  let senha = $('#password');
  let senhaConf = $('#password_confirmation');
  let senhaAtual = $('#senhaAtual');
  let retorno=true;
	//Checa se as senhas batem
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
	//Checa o tamanho e os requisitos minimos da senha
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
	//Checa se a senha digitada está correta
  $.ajax({
      url: '/ajax/checkarSenha/',
      data: {
        'senha': senhaAtual.val(),
        'id': idUsuarioLogado
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

//Função para mudar a imagem do Crop
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
		//Obtem a imagem cropped em blob
    $("#novaImg").cropper('getCroppedCanvas').toBlob(function (blob) {
					//Envia o blob para o back-end
		      var reader = new window.FileReader();
		      reader.readAsDataURL(blob);
		      reader.onloadend = function() {
          base64data = reader.result;
          $("#blob").val(base64data);
          $('#formImagem').submit();
      }
    });

}

//Formata a data do input
function formatarData(input) {
    var ptrn = /(\d{4})\-(\d{2})\-(\d{2})/;
    if(!input || !input.match(ptrn)) {
        return null;
    }
    return input.replace(ptrn, '$3/$2/$1');
};

//Carrega o grupo de 10 mapas
function carregarMapas(){
	//Seleciona a div dos mapas
	let div=$("#divMapas");
	gruposCarregados++;
	for(let i=0; i<10; i++){
		$.ajax({
	      url: '/ajax/carregarMapasPerfil/',
	      data: {
	        'num': 10*(gruposCarregados-1)+i,
	        'id': idUsuarioPagina
	      },
	      dataType: 'json',
	      success: function (data) {
					//Se todas as postagens tiverem sido carregas
					if(data.erro){
						return;
					}
					//Prepara a postagem carregada
					prepararPostagem(div, data, i)
				}
	  });
	}
}

function initMap(){
		//Carrega o primeiro grupo de postagens
		carregarMapas();
		//Cria o evento de clica em solicitar amizade (deve estar aqui devido ao Jquery.ui necessitar dos objetos da google carregados)
		solicitacaoAmizade();
}

$(window).on('scroll', function(){
    if( $(window).scrollTop() > $(document).height() - $(window).height() ) {
			//Carrega mais dez mapas
			carregarMapas();
    }
});

function aceitarAmizade(id){
  $.ajax({
    url: '/ajax/aceitarAmizade/',
    data: {
      'usuario': idUsuarioLogado,
      'alvo':  id
    },
    dataType: 'json',
    sucess: function(data){

    }

  });
  $('#solicitacao'+id).remove();
  let valor=parseInt($("#labelSolicitacoes").html());
  if(valor==1){
    $("#labelSolicitacoes").remove();
    $("#containerSolicitacoes").html("<h3>Não Existe Nenhuma Solicitação de Amizade Pendente</h3>");
  }else{
    $("#labelSolicitacoes").html(str(valor-1))
  }
}

function recusarAmizade(id){
  $.ajax({
    url: '/ajax/recusarAmizade/',
    data: {
      'usuario': idUsuarioLogado,
      'alvo':  id
    },
    dataType: 'json',
    sucess: function(data){

    }

  });
  $('#solicitacao'+id).remove();
  let valor=parseInt($("#labelSolicitacoes").html());
  if(valor==1){
    $("#labelSolicitacoes").remove();
    $("#containerSolicitacoes").html("<h3>Não Existe Nenhuma Solicitação de Amizade Pendente</h3>");
  }else{
    $("#labelSolicitacoes").html(str(valor-1))
  }
}
