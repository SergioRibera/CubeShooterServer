let Connection = require('../Connection');

module.exports = class LobbyBase{
    constructor(id, idMaster){
        this.id = id;
        this.idPlayerMaster = idMaster;
        this.connections = [];
        this.serverItems = [];
    }

    onUpdate(){
    }

    onEnterLobby(connection = Connection){
        let lobby = this;
        let player = connection.player;

        //console.log('Player ' + player.displayerPlayerInformation() + ' has entered the lobby (' + lobby.id + ')');

        let index = lobby.connections.indexOf(connection);
        if(index == -1){
            lobby.connections.push(connection);
        }

        player.lobby = lobby.id;
        connection.lobby = lobby;
    }

    onLeaveLobby(connection = Connection){
        let lobby = this;
        let player = connection.player;
        let connections = lobby.connections;

        //console.log('Player ' + player.displayerPlayerInformation() + ' has leave the lobby (' + lobby.id + ')');

        connection.lobby = undefined;

        let index = lobby.connections.indexOf(connection);
        if(index > -1){
            lobby.connections.splice(index, 1);
        }
        if(connections.length != 0 && connections.length != 1){
            connections.forEach(c => {
                console.log('Sacando Jugador del lobby 0');
                c.socket.emit('LeftGameLobby', { playerId: connection.player.id } );
                console.log('Sacando Jugador del lobby');
            });
            console.log('Sacando Jugador del lobby');
            /*connections.forEach(c => {
                var rd = {
                    id: player.id
                };
                c.socket.emit('disconnect', rd );
                console.log('Sacando Jugador del lobby');
            });*/
        }
    }

    onServerSpawn(item = ServerItem, location = Vector2) {
        let lobby = this;
        let serverItems = lobby.serverItems;
        let connections = lobby.connections;

        //Set Position
        item.position = location;
        //Set item into the array
        serverItems.push(item);
        //Tell everyone in the room
        connections.forEach(connection => {
            connection.socket.emit('serverSpawn', {
                id: item.id,
                name: item.username,
                position: item.position.JSONData()
            });
        });
    }

    onServerUnspawn(item = ServerItem) {
        let lobby = this;
        let connections = lobby.connections;

        //Remove item from array
        lobby.deleteServerItem(item);
        //Tell everyone in the room
        connections.forEach(connection => {
            connection.socket.emit('serverUnspawn', {
                id: item.id
            });
        });
    }

    deleteServerItem(item = ServerItem) {
        let lobby = this;
        let serverItems = lobby.serverItems;
        let index = serverItems.indexOf(item);

        //Remove our item out the array
        if (index > -1) {
            serverItems.splice(index, 1);
        }
    }
}