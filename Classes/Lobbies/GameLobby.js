let LobbyBase = require('./LobbyBase');
let GameLobbySettings = require('./GameLobbySettings');
let Connection = require('../Connection');

module.exports = class GameLobby extends LobbyBase{
    constructor(id, idMaster, settings = GameLobbySettings){
        super(id, idMaster);
        this.settings = settings;
    }

    onUpdate(){
        let lobby = this;
        super.onUpdate();
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
        let socket = connection.socket;
        super.onEnterLobby(connection);

        //lobby.addPlayer(connection);

        if (lobby.connections.length == lobby.settings.maxPlayers) {
            console.log('We have enough players we can start the game');
            //Max players in the lobby
            // on his change lobby states or settings
            lobby.onSpawnAllPlayersIntoGame();
        }

        let returnData = {
            state: 'Lobby'
        };

        socket.emit('loadGame');
        socket.emit('lobbyUpdate', returnData);
        socket.broadcast.to(lobby.id).emit('lobbyUpdate', returnData);

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

    onSpawnAllPlayersIntoGame() {
        let lobby = this;
        let connections = lobby.connections;

        connections.forEach(connection => {
            lobby.addPlayer(connection);
        });
    }


    addPlayer(connection = Connection){
        let lobby = this;
        let connections = lobby.connections;
        let socket = connection.socket;
        var returnData = {
            id: connection.player.id
        }
        socket.emit('spawn', returnData);
        //socket.broadcast.to(lobby.id).emit('spawn', returnData);

        connections.forEach(c => {
            if(c.player.id != connection.player.id){
                socket.emit('spawn', c.player);
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