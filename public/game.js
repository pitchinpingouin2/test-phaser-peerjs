var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 400,
    parent: "gameContainer",
    scene: [scene1],
    backgroundColor: '#4488aa',
    physics: {
        default: "arcade",
    },
    pixelArt: true,
};

var gameSettings = {
    playerSpeed: 300,
}

var game = new Phaser.Game(config);