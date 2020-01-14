var shortID = require('shortid');
var vector3 = require('./Vector3.js');

module.exports = class Player{
    constructor(){
        this.username = '';
        this.lobby = 0;
        this.Life = 100;
        this.playerColor = '';
        this.id = shortID.generate();
        this.indexPlayerMesh = 0;
        this.position = new vector3(0.0, 0.0, 0.0);
        this.h = 0.0;
        this.v = 0.0;
        this.shoot = false;
        this.isReviving = false;
    }

    displayerPlayerInformation(){
        let player = this;
        return '(' + player.username + ' : ' + player.id + ')';
    }
}