module.exports = class GameLobbySettings{
    constructor(gameMode, mapa, maxPlayers){
        this.gameMode = gameMode;
        this.mapa = mapa;
        this.maxPlayers = maxPlayers;
    }
}