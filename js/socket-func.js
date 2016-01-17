//Socket connection
var socket = io.connect('http://192.168.0.16:3001');
//registrieren
$(document).ready(function () {
    console.log('tesdfsd');
    $('#register').click(function () {
        var name = $("#username").val();
        var pw = $("#password").val();
        if (name && pw) {
            console.log('Test');
            socket.emit('user:registration', {
                name: name,
                password: pw
            });

        }
    })
});


//spielfeld
$(document).ready(function () {
    $('#size-submit').click(function () {
        var size = $("#size").val();
        $('#size-container').css('display','none');
    });
    
});
