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
            server.onDisconnect(connection);
        });

        // data = { invited: false, idNewLobby: 1, gameMode: 1, gameMapa: 1 }
        socket.on('JoinGame', function(data){
            connection.player = data.player;
            server.onAttemptToJoinGame(connection, data);
            console.log("Connected To Lobby");
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