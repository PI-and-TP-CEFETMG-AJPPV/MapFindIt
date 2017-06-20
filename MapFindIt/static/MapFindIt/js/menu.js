//Valida o form de cadastro de grupo
function validateCadastro(){
	let nomeGrupo = $('#nmdGrupo');
	let descGrupo = $('#descGrupo');
	let cor = $('#corGrupo');
	let privado = $('#private');
	let publico= $('#public');
	let retorno=true;
		//Verifica se uma das opcões esta selecionada
    if(!privado.is(':checked') && !publico.is(':checked')){
    	if($("#erroPrivacidade").length === 0){
    		erroPrivacidade=$('<div class="has-error"><span id="erroPrivacidade" class="help-block">Nada Selecionado</span></div>').appendTo(publico.parent().parent());
    	}
    	retorno=false;
    }
		else{
			if(erroPrivacidade){
				erroPrivacidade.remove();
			}
		}
    $.ajax({
         url: '/ajax/salvarGrupo/',
		    //Se não ocorreu nenhum erro em nenhum campo submite o formulario
		      if(retorno){
		   	      $('#formCadastrogrupo').submit();
		      }
        });
    	}

    $("#menu-toggle").click(function(e) {
    //Exibe o menu ao ser clickado
    e.preventDefault();
    $("#wrapper").toggleClass("toggled");
});
var selec=false;

$('#menu-toggle').on('click', function(e){
  //Se o menu estiver aberto
  if(selec){
    selec=false;
    $('#menu-icon').css('color', 'dimgray');
    //Para o edge
    $('#sidebar-wrapper').css('overflow-y','hide');
  }else{
      //Se o menu estiver fechado
      selec=true;
      $('#menu-icon').css('color', 'white');
      //Para o edge
      $('#sidebar-wrapper').css('overflow-y','scroll');
  }
});
//Para cada letra digitada na filtragem de amigos
$('#filtrarAmigos').keyup(function(event) {
    //Para cada amigo carregado
    $(".amigo").each(function(i, item){
      //Pega o objeto JQuery da div do amigo
      item=$(item);
      //Pega o atributo title para identificar o nome do amigo
      let anchor = item.children(":first").children(":first");
      //Se o nome conter a string pesquisada
      if(anchor.attr('title').indexOf($("#filtrarAmigos").val())!==-1){
        //Mostra o amigo
        item.show();
      }else{
        //Esconde o amigo
        item.hide();
      }
    });
});
//Carrega o grupo de 10 mapas
function salvarGrupo(){
	let
	$.ajax({
      url: '/ajax/salvarGrupo/',
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
