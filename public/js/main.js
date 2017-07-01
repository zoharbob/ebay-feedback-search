$(function () {

    $('form').submit(function () {
        $('.alert').hide();
        // $('.loader').fadeIn(500);
        $.LoadingOverlay("show", {
            image: "",
            fontawesome : "fa fa-spinner fa-spin"
        });
    })

})

function show_error() {
    $('.alert').show("shake",500);
}

function inst() {
    swal({
        title: 'How To Use?',
        text: 'Copy the URL from the address bar of the desired item, paste it in the search field and press \'Go!\'',
        imageUrl: 'img/inst.png',
    })
}
