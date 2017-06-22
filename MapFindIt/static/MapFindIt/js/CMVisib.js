function carregarTemas(){
  $.ajax({
    url: '/ajax/getTemas/',
    data: {

    },
    dataType: 'json',
    success: function (data) {
       let temas=JSON.parse(data.temas);
       let select = $('#temas');
       for(let i=0; i<temas.length; i++){
         select.append(`<option value=${temas[i].pk}>${temas[i].fields.nomtema}</option>`);
       }
    }
  });
}

$(document).ready(function(){
    $('#temas').select2({
      "language": {
       "noResults": function(){
           return "Nenhum Tema Encontrado";
       }
     }
    });
    carregarTemas();
});

function validateTema(){
  $.ajax({
    url: '/ajax/adicionarTema/',
    data: {
      'nomeTema': $('#nomeTema').val()
    },
    dataType: 'json',
    success: function (data) {

      if(data.erro=='0'){
        $('#temas').empty();
        carregarTemas();
      }
    }
  });
  $("#modal-tema .close").click()
}
