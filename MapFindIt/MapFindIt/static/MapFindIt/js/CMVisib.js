function opcContext(contexto) {
    var normal = '<div id="contextual"></div>';
    var extra = '<div id="contextual"><div class="form-group"><label class="checkbox-inline"><input type="checkbox" name="opcEdicao" id="edicao">Outros podem editar</label></div></div>';
    
    switch (contexto) {
        case 'Privado':
            $('#contextual').replaceWith(normal);
            break;
        case 'Publico':
            $('#contextual').replaceWith(extra);
            break;
        case 'Amigos':
            $('#contextual').replaceWith(extra);
            break;
    }
}
