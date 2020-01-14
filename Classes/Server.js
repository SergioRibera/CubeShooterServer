let Connection = require('./Connection');
let Player = require('./Player');

//Lobbies
let LobbyBase = require('./Lobbies/LobbyBase');
let GameLobby = require('./Lobbies/GameLobby');
let GameLobbySettings = require('./Lobbies/GameLobbySettings');

module.exports = class Server{
    constructor(){
        this.connections = [];
        this.lobbys = [];

        this.lobbys[0] = new LobbyBase(0);
    }
    //Interaval update 100 millisegundos
    onUpdate(){
        let server = this;

        // Update each lobby
        for(let id in server.lobbys){
            server.lobbys[id].onUpdate();
        }
    }

    // Handle a new connection to the server
    onConnected(socket){
        let server = this;
        let connection = new Connection();
        connection.socket = socket;
        connection.player = new Player();
        connection.server = this;

        let player = connection.player;
        let lobbys = this.lobbys;

        console.log('Added new player to the server (' + player.id + ')');
        server.connections[player.id] = connection;

        socket.join(player.lobby);
        connection.lobby = lobbys[player.lobby];
        connection.lobby.onEnterLobby(connection);

        return connection;
    }

    onDisconnect(connection = Connection){
        let server = this;
        let id = connection.player.id;

        delete server.connections[id];
        //console.log('Player ' + connection.player.displayerPlayerInformation() + ' has discpnnected');

        connection.socket.broadcast.to(connection.lobby.id).emit('disconnected', {
            id: id
        });

        // Preform lobby clean up
        server.lobbys[connection.player.lobby].onLeaveLobby(connection);
    }

    onAttemptToJoinGame(connection = Connection, data){
        let server = this;
        let lobbyFound = false;
        var returnData = {};
        let gameLobbies = server.lobbys.filter(item => {
            return item instanceof GameLobby;
        });

        console.log('Found (' + gameLobbies.length + ') lobbies on the server');

        if(data.invited){
            // If invited to lobby a friend
            gameLobbies.forEach(lobby => {
                if(!lobbyFound){
                    if(lobby.id === data.idNewLobby){
                        let canJoin = lobby.canEnterLobby(connection);
                        if(canJoin){
                            lobbyFound = true;
                            server.onSwitchLobby(connection, lobby.id);
                            returnData = {
                                idLobby: lobby.id,
                                gameLobbySettings: {
                                    gameMode: data.gameMode,
                                    gameMapa: data.gameMapa,
                                    maxPlayers: 4
                                }
                            }
                        }else{
                            // Server Message ( Lobby has not found )
                        }
                    }
                }
            });
        }

        let gamelobby = new GameLobby(gameLobbies.length + 1, new GameLobbySettings(data.gameMode, data.gameMapa, 4));
        // Create new lobby per player
        if(!lobbyFound){
            console.log('Making new game Lobby');
            server.lobbys.push(gamelobby);
            server.onSwitchLobby(connection, gamelobby.id);

            returnData = {
                idLobby: gamelobby.id,
                gameLobbySettings: {
                    gameMode: data.gameMode,
                    gameMapa: data.gameMapa,
                    maxPlayers: 4
                }
            };
        }
        console.log(connection.lobby.id);
        connection.socket.to(gamelobby.id).emit('JoinGameLobby', returnData);
        console.log("Connection to lobby");
    }

    onSwitchLobby(connection = Connection, lobbyID){
        let server = this;
        let lobbys = server.lobbys;

        connection.socket.join(lobbyID);
        connection.lobby = lobbys[lobbyID];
        connection.lobby.id = lobbyID;

        lobbys[connection.player.lobby].onLeaveLobby();
        lobbys[lobbyID].onEnterLobby(connection);
    }
}