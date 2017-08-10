//Variaveis para guardar os erros
var erroSenhaConf;
var erroSenha;

//Função para determinar se a senha cumpre com os requisitos minimos
function minCaracSenha(senha){
	return senha.match(/[a-zA-Z]/g) && senha.match(/[0-9]/g);
}

//Valida o form de cadastro
function validateCadastro(){
	let senha = $('#senha');
    let senhaConf = $('#confSenha');
    let retorno=true;
	//Verifica se as senhas são iguais
    if (senha.val() != senhaConf.val()) {
      senhaConf.parent().addClass('has-error');
      if($('#erroSenhaConf').length === 0) {
       	erroSenhaConf=$('<span id="erroSenhaConf" class="help-block">As senhas não correspondem</span>').appendTo(senhaConf.parent());
      }
      retorno=false;
    }
	else{
		senhaConf.parent().removeClass('has-error');
		if(erroSenhaConf){
			erroSenhaConf.remove();
		}
	}
	//Verifica se a senha cumpre o minimo de tamanho e segurança
    if(senha.val().length < 6 || !minCaracSenha(senha.val())){
    	senha.parent().addClass('has-error');
    	if($('#erroSenha').length === 0) {
    		erroSenha=$('<span id="erroSenha" class="help-block">A senha deve ter ao menos 6 caracteres e deve conter números e letras</span>').appendTo(senha.parent());
    	}
    	retorno=false;
    }
    else{
		senha.parent().removeClass('has-error');
		if(erroSenha){
			erroSenha.remove();
		}
    }
    return retorno;
}