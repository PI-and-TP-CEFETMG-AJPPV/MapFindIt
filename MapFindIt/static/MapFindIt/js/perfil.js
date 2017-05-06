$("#menu-toggle").click(function(e) {
    e.preventDefault();
    $("#wrapper").toggleClass("toggled");
});
var selec=false;
$('#menu-toggle').on('click', function(e){
  if(selec){
    selec=false;
    $('#menu-icon').css('color', 'dimgray');
  }else{
      selec=true;
      $('#menu-icon').css('color', 'white');
  }
});

$('document').ready(function(){

});

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
