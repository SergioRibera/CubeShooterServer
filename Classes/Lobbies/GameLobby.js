let LobbyBase = require('./LobbyBase');
let GameLobbySettings = require('./GameLobbySettings');
let Connection = require('../Connection');

module.exports = class GameLobby extends LobbyBase{
    constructor(id, settings = GameLobbySettings){
        super(id);
        this.settings = settings;
    }

    onUpdate(){
        let lobby = this;

        //lobby.updateDeadPlayers();
    }

    canEnterLobby(connection = Connection){
        let lobby = this;
        let maxPlayerCount = lobby.settings.maxPlayers;
        let currentPlayerCount = lobby.connections.length;

        if(currentPlayerCount + 1 > maxPlayerCount){
            return false;
        }
        return true;
    }

    onEnterLobby(connection = Connection){
        let lobby = this;

        super.onEnterLobby(connection);

        lobby.addPlayer(connection);

        // Handle spawning any server spawned objects here
        // Example: Loot, bullets, etc
    }

    onLeaveLobby(connection = Connection){
        let lobby = this;

        super.onLeaveLobby(connection);

        lobby.removePlayer(connection);

        // Handle spawning any server spawned objects here
        // Example: Loot, bullets, etc
    }


    onFireBullet(connection = Connection){

    }


    addPlayer(connection = Connection){
        let lobby = this;
        let connections = lobby.connections;
        let socket = connection.socket;
        var returnData = {
            id: connection.player.id
        }
        socket.emit('spawn', returnData);
        socket.broadcast.to(lobby.id).emit('spawn', returnData);

        connections.forEach(c => {
            if(c.player.id != connection.player.id){
                socket.emit('spawn', {
                    id: c.player.id
                });
            }
        });
    }
    removePlayer(connection = Connection){
        let lobby = this;

        connection.socket.broadcast.to(lobby.id).emit('disconnected', {
            id: connection.player.id
        });
    }
}