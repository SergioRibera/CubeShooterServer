var shortID = require('shortid');

module.exports = class Lobby{
    constructor(){
        this.id = shortID.generate();
        this.players = [ ];
        this.level = 0;
    }
}