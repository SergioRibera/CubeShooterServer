let Connection = require('../Connection');

module.exports = class LobbyBase{
    constructor(id){
        this.id = id;
        this.connections = [];
    }

    onUpdate(){
    }

    onEnterLobby(connection = Connection){
        let lobby = this;

        //console.log('Player ' + connection.player.displayerPlayerInformation() + ' has enter the lobby (' + lobby.id + ')');

        lobby.connections.push(connection);

        connection.player.lobby = lobby.id;
        connection.lobby = lobby;
    }

    onLeaveLobby(connection = Connection){
        let lobby = this;
        let player = connection.player;

        //console.log('Player ' + player.displayerPlayerInformation() + ' has leave the lobby (' + lobby.id + ')');

        connection.lobby = undefined;

        let index = lobby.connections.indexOf(connection);
        if(index > -1){
            lobby.connections.splice(index, 1);
        }
    }
}