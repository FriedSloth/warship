var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');
var UserFilename = 'D:/Programmierung/Projekte/4Wins/data/users.json';

var onlineUser = [];

http.listen(3001, function () {
    console.log('listening on *:3001');
});

function tokenGenerierer() {
return Math.floor((Math.random() * 999999999) + 1);;
}




io.on('connection', function (socket) {
    //User registration in database
    socket.on('user:registration', function (userdata) {
        var registrationResult;
        if (userdata) {
                var  obj = {};
                obj.data = [];
                fs.readFile(UserFilename, 'utf8', function (err, data) {
                    if (err) throw err;
                    obj = JSON.parse(data);
                    var exists = false;
                    for (var i = 0; i < obj.data.length; i++) {
                        if (obj.data[i].name.toUpperCase() === userdata.name.toUpperCase()) { //Check if user exists
                            exists = true;
                            i = obj.data.length;
                        }
                    }
                    if(!exists)
                    {
                        var myData = {
                            name:userdata.name,
                            password:userdata.password,
                            mmr:1200
                        };
                        obj.data.push(myData);
                        var data = {"data":obj.data};
                        fs.writeFile(UserFilename, JSON.stringify(data, null, 4), function(err) {
                            if(err) {
                                console.log(err);
                                registrationResult = {result: false, resultmessage: 'Nothing to register!'};
                            } else {
                                registrationResult = {result: true, resultmessage: 'Success!'};
                                console.log("User registert. Name: " + userdata.name);
                            }
                        });
                    }else{
                        registrationResult = {result: false, resultmessage: 'Username not aviable'};
                    }
                    socket.emit('user:registration:result', registrationResult);
                });
        } else {
            var registrationResult = {result: false, resultmessage: 'Nothing to register!'};
            socket.emit('user:registration:result', registrationResult);
        }
    });

    //User login from database
    socket.on('user:login', function (logindata) {

        var loginResult;
        if(logindata.name&&logindata.password)
        {
            console.log(logindata);
            var username = logindata.name;
            var password = logindata.password;
            var  obj;
            fs.readFile(UserFilename, 'utf8', function (err, data) {
                if (err) throw err;
                obj = JSON.parse(data);
                for (var i = 0; i < obj.data.length; i++)
                {
                        console.log(obj.data[i], username, password);

                        if (obj.data[i].name === username) { //Check if user exists
                            if (obj.data[i].password === password) { //Check if password is correct
                                var token = tokenGenerierer()
                                var activeUser = {
                                    name: username,
                                    token: token
                                }
                                onlineUser.push({name:username,token:token, mmr:obj.data[i].mmr});
                                loginResult = {result: true, resultmessage: token};
                                console.log("User eingeloggt. Name: " + username);
                            }
                            else {
                                loginResult = {result: false, resultmessage: 'password incorrect'};
                            }
                            i = obj.data.length;
                        }
                }
                if(loginResult==null) loginResult = {result: false, resultmessage: 'user 404d'};
                console.log(loginResult);
                socket.emit('user:login:result', loginResult);
            });
        }
        else
        {
            loginResult = {result: false, resultmessage: 'Name or password missing'};
            socket.emit('user:login:result', loginResult);
        }


    });

    //User logout
    socket.on('user:logout', function (data) {
        var disconnectResult;
        try{
            var abs = {
                user: data.name,
                token: data.token
            };
            for(var i = 0; i < onlineUser.length; i++)
            {
                if(onlineUser[i].name === abs.user&&onlineUser[i].token===abs.token)
                {
                    onlineUser.splice(i, 1);
                    i = onlineUser.length;
                    disconnectResult = {result: true, resultmessage: 'disconnect succesfull'};
                    console.log("User ausgeloggt. Name: " + abs.user);
                }
            }
            if(disconnectResult==null) disconnectResult = {result: false, resultmessage: 'disconnect not succesfull'};
        }
        catch(e)
        {
           disconnectResult = {result: false, resultmessage: 'token incorrect'};
        }
        socket.emit('user:logout:result', disconnectResult);

    });

    socket.on('userList:get', function () {
        socket.emit('userList', userOnlineList);
    });



    console.log('a user connected');
    socket.on('disconnect', function () {
        console.log('user disconnected');
    });
});