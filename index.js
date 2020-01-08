//ws://127.0.0.1:25565/socket.io/?EIO=4&transport=websocket
//ws://cubeshooterserver.herokuapp.com:80/socket.io/?EIO=4&transport=websocket

var io = require('socket.io')(process.env.PORT || 25565);
var Player = require('./Classes/Player.js');

var players = [];
var sockets = [];
//https://www.youtube.com/watch?v=ql2Ukq38B_8&list=PL-Cz1YO2-mXHMPQayscAYeR4AdwfC29TQ&index=4
//https://static.vecteezy.com/system/resources/previews/000/481/900/non_2x/vector-death-fear-phobia-anxiety-cartoon-composition.jpg
console.log('Server Cube Shooter has started');
io.on('connection', function(socket){
    var player = new Player();
    var thisPlayerID = player.id;
    
    players[thisPlayerID] = player;
    sockets[thisPlayerID] = socket;

    console.log('Conection made whith !!!' + thisPlayerID);

    socket.emit('register', { id : thisPlayerID });
    socket.on('playerInit', function(data){
        player.username = data.username;
        player.indexPlayerMesh = data.indexPlayerMesh;
        player.playerColor = data.playerColor;
        player.h = data.h;
        player.v = data.v;
        player.position.x = data.position.x;
        player.position.y = data.position.y;
        player.position.z = data.position.z;
        players[thisPlayerID] = player;

        socket.emit('spawn', player);
        socket.broadcast.emit('spawn', player);
        console.log(data.username + '  '+ player.id);
    });

    //Tell myself about everyone else in the game
    for(var playerID in players){
        if(playerID != thisPlayerID){
            socket.emit('spawn', players[playerID]);
        }
    }

    //Positional Data from client
    socket.on('updatePosition', function(data){
        //console.log('Init update position');
        player.h = data.h;
        player.v = data.v;
        //console.log('Player set h & v');
        player.position.x = data.position.x;
        player.position.y = data.position.y;
        player.position.z = data.position.z;
        //console.log('Player set positions value');
        socket.broadcast.emit('updatePosition', player);
        //console.log('Player position Update');
    });
    socket.on('updateLife', function(data){
        player.Life = data.Life;
        socket.broadcast.emit('updateLife', player);
        console.log('Player Life change');
    });
    socket.on('Shoot', function(data){
        player.shoot = data.shoot;
        socket.broadcast.emit('Shoot', player);
        console.log('Player shooting');
    });

    socket.on('disconnect', function(){
        console.log('A Player  ' + players[thisPlayerID].username + '  Diconnect :(');
        delete players[thisPlayerID];
        delete sockets[thisPlayerID];
        socket.broadcast.emit('disconnected', player);
    });
});