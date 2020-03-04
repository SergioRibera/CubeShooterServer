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
            if(id > 0){
                if(server.lobbys[id].connections.length == 0){
                    console.log('Closing down lobby (' + id + ')');
                    server.lobbys.splice(id, 1);
                }
            }
        }
    }

    // Handle a new connection to the server
    onConnected(socket){
        let server = this;
        let connection = new Connection();
        connection.socket = socket;
        connection.player = new Player();
        connection.server = server;

        let player = connection.player;
        let lobbys = server.lobbys;

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

        connection.socket.broadcast.to(connection.player.lobby).emit('disconnected', {
            id: id
        });

        // Preform lobby clean up
        let currentLobbyIndex = connection.player.lobby;
        if(currentLobbyIndex > -1){
            if(server.lobbys[currentLobbyIndex] != null){
                server.lobbys[currentLobbyIndex].onLeaveLobby(connection);
            }
        }

        if (currentLobbyIndex != 0 && server.lobbys[currentLobbyIndex].connections.length == 0) {
            console.log('Closing down lobby (' + currentLobbyIndex + ')');
            server.lobbys.splice(currentLobbyIndex, 1);
        }
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
                                idPlayer: '',
                                username: '',
                                color: '',
                                idLobby: lobby.id,
                                idPlayerMaster: lobby.idPlayerMaster,
                                playersInGame: lobby.connections.length,
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

        // Create new lobby per player
        if(!lobbyFound){
            console.log('Making new game Lobby');
            let gamelobby = new GameLobby(gameLobbies.length + 1, connection.player.id, new GameLobbySettings(data.gameMode, data.gameMapa, 4));
            server.lobbys.push(gamelobby);
            server.onSwitchLobby(connection, gamelobby.id);

            returnData = {
                idPlayer: '',
                username: '',
                color: '',
                idLobby: gamelobby.id,
                idPlayerMaster: gamelobby.idPlayerMaster, 
                playersInGame: gamelobby.connections.length,
                gameLobbySettings: {
                    gameMode: data.gameMode,
                    gameMapa: data.gameMapa,
                    maxPlayers: 4
                }
            };
        }
        returnData.players = [];
        let i = 0;
        server.lobbys[returnData.idLobby].connections.forEach(c => {
            returnData.idPlayer = c.player.id;
            returnData.username = c.player.username;
            returnData.color = c.player.playerColor;
            returnData.players[i] = c.player;
            i++;
        });
        server.lobbys[returnData.idLobby].connections.forEach(c => {
            c.socket.emit('JoinGameLobby', returnData);
        });
        console.log('Player Join a Rom');
        //connection.socket.to('' + connection.player.lobby).emit('JoinGameLobby', returnData);
    }

    onSwitchLobby(connection = Connection, lobbyID){
        let server = this;
        let lobbys = server.lobbys;

        connection.socket.join('' + lobbyID);
        connection.lobby = lobbys[lobbyID];
        
        lobbys[connection.player.lobby].onLeaveLobby(connection);
        lobbys[lobbyID].onEnterLobby(connection);

        console.log('Jugadores eliminados del lobby 1');
    }
}