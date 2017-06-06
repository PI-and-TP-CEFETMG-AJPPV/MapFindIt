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
$('#filtrarAmigos').keyup(function(event) {
    $(".amigo").each(function(i, item){
      item=$(item);
      let anchor = item.children(":first").children(":first");
      if(anchor.attr('title').indexOf($("#filtrarAmigos").val())!==-1){
        item.show();
      }else{
        item.hide();
      }
    });
});
