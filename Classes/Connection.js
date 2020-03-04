module.exports = class Connection{
    constructor(){
        this.socket;
        this.player;
        this.server;
        this.lobby;
    }

    // Handles all our to events and where we should route then to the handled
    createEvents(){
        let connection = this;
        let socket = connection.socket;
        let server = connection.server;
        let player = connection.player;

        socket.on('disconnect', function(){
            server.lobbys[player.lobby].connections.forEach(c => {
                c.socket.emit('LeftGameLobby', { playerId: player.id } );
            });
            server.onDisconnect(connection);
        });

        // data = { invited: false, idNewLobby: 1, gameMode: 1, gameMapa: 1 }
        socket.on('JoinGame', function(data){
            connection.player = data.player;
            server.onAttemptToJoinGame(connection, data);
            console.log("Connected To Lobby with " + connection.lobby.connections.length + " players");
        });
        socket.on('LobbySettingsChanged', function(data){
            server.lobbys[player.lobby].connections.forEach(c => {
                c.socket.emit('ChangeSettingsLobby', { gameMode: data.gameMode, gameMapa: data.gameMapa } );
            });
        });
        socket.on('PlayerReady', function(data){
            let idPlayer = data.id;
            let ready = data.ready;
            server.lobbys[player.lobby].connections.forEach(c => {
                c.socket.emit('PlayerReady', { IdPlayer: idPlayer, Ready: ready } );
            });
        });
        socket.on('PlayGame', function(){
            var p = {};
            var i = 0;
            server.lobbys[player.lobby].connections.forEach(c => {
                p.players[i] = c.player;
                i++;
            });
            server.lobbys[player.lobby].connections.forEach(c => {
                c.socket.emit('spawn', p);
            });
        });

        //Positional Data from client
        socket.on('updatePosition', function(data){
            player.h = data.h;
            player.v = data.v;
            player.position.x = data.position.x;
            player.position.y = data.position.y;
            player.position.z = data.position.z;
            socket.broadcast.to(connection.lobby.id).emit('updatePosition', player);
        });
        socket.on('updateLife', function(data){
            player.Life = data.Life;
            socket.broadcast.to(connection.lobby.id).emit('updateLife', player);
        });
        socket.on('updateReviving', function(data){
            player.isReviving = data.isReviving;
            socket.broadcast.to(connection.lobby.id).emit('updateReviving', player);
        });
        socket.on('Shoot', function(data){
            player.shoot = data.shoot;
            socket.broadcast.to(connection.lobby.id).emit('Shoot', player);
        });
    }
}