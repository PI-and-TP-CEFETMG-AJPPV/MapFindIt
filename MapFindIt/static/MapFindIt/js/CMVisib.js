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
    $('#criarMapa').attr('disabled', 'disabled');
    $('#criarMapa').attr('title', 'Selecione um ponto inicial para o mapa');
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

function initAutocomplete() {
        var map = new google.maps.Map(document.getElementById('map'), {
          center: {lat: -19.93, lng: -43.93},
		  zoom: 12,
          mapTypeId: 'roadmap'
        });

        // Create the search box and link it to the UI element.
        var input = document.getElementById('pac-input');
        var searchBox = new google.maps.places.SearchBox(input);

        // Bias the SearchBox results towards current map's viewport.
        map.addListener('bounds_changed', function() {
          searchBox.setBounds(map.getBounds());
        });

        var markers = [];
        // Listen for the event fired when the user selects a prediction and retrieve
        // more details for that place.
        searchBox.addListener('places_changed', function() {
          var places = searchBox.getPlaces();

          if (places.length == 0) {
            return;
          }

          // Clear out the old markers.
          markers.forEach(function(marker) {
            marker.setMap(null);
          });
          markers = [];

          // For each place, get the icon, name and location.
          var bounds = new google.maps.LatLngBounds();
          places.forEach(function(place) {
            if (!place.geometry) {
              console.log("Returned place contains no geometry");
              return;
            }
            // Create a marker for each place.
            markers.push(new google.maps.Marker({
              map: map,
              title: place.name,
              position: place.geometry.location
            }));

            if (place.geometry.viewport) {
              // Only geocodes have viewport.
              bounds.union(place.geometry.viewport);
            } else {
              bounds.extend(place.geometry.location);
            }
            $("#LatIni").val(place.geometry.location.lat());
            $("#LngIni").val(place.geometry.location.lng());
            $('#criarMapa').removeAttr('disabled');
            $('#criarMapa').removeAttr('title');
          });
          map.fitBounds(bounds);
        });
        map.addListener('click', function(e) {
          for(let i=0; i<markers.length; i++){
            markers[i].setMap(null);
          }
          markers.push(new google.maps.Marker({
            map: map,
            position: e.latLng
          }));
          let geocoder = new google.maps.Geocoder();
          geocoder.geocode({'latLng': e.latLng}, function(results, status) {
            if (status === 'OK') {
              if (results[1]) {
                $('#pac-input').val(results[1].formatted_address);
              }else{
                $('#pac-input').val(e.latLng);
              }
            } else {
              alert('Erro: ' + status);
            }
          });
          map.panTo(e.latLng);
          $("#LatIni").val(e.latLng.lat());
          $("#LngIni").val(e.latLng.lng());
          $('#criarMapa').removeAttr('disabled');
          $('#criarMapa').removeAttr('title');
        });
      }

