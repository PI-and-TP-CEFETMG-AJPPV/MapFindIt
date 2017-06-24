function initMap(){
  $.ajax({
      url: '/ajax/carregarMapaEditar/',
      data: {
        'id': idMapa
      },
      dataType: 'json',
      success: function (data) {
        //Prepara a postagem carregada
        console.log(JSON.parse(data.pontos));
        setMapa(JSON.parse(data.mapa)[0].fields, JSON.parse(data.pontos), JSON.parse(data.icones), JSON.parse(data.rotas),
                JSON.parse(data.pontoRotas), JSON.parse(data.areas), JSON.parse(data.pontoAreas), 'divMapa');
      }
  });
}
