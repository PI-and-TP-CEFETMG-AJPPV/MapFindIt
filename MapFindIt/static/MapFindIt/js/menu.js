$("#menu-toggle").click(function(e) {
    e.preventDefault();
    $("#wrapper").toggleClass("toggled");
});
var selec=false;
$('#menu-toggle').on('click', function(e){
  if(selec){
    selec=false;
    $('#menu-icon').css('color', 'dimgray');
    //Para o edge
    $('#sidebar-wrapper').css('overflow-y','hide');
  }else{
      selec=true;
      $('#menu-icon').css('color', 'white');
      //Para o edge
      $('#sidebar-wrapper').css('overflow-y','scroll');
  }
});
