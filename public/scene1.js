class scene1 extends Phaser.Scene{
    constructor(){
        super("mainScene");
    }
    
    // Scene routine
    
    preload(){
        this.load.image('background',"./assets/images/background.png");
        this.load.spritesheet('player1', "./assets/spritesheets/player.png", {
            frameWidth: 16,
            frameHeight: 24
        })

        this.load.spritesheet("power-up", "assets/spritesheets/power-up.png",{
            frameWidth: 16,
            frameHeight: 16
        });
    }

    create(){
        this.background = this.add.tileSprite(0,0,config.width, config.height, 'background').setOrigin(0,0);
        this.background.scale = 4;

        this.anims.create({
            key: "idle",
            frames: this.anims.generateFrameNumbers("player1"),
            frameRate: 4,
            repeat: -1
        })

        this.anims.create({
            key: "powerup-idle",
            frames: this.anims.generateFrameNumbers("power-up", {
                start: 0,
                end: 1
            }),
            frameRate: 2,
            repeat: -1
        })

        this.powerUp = this.physics.add.sprite(100, 100, 'power-up').setOrigin(0,0);
        this.powerUp.play("powerup-idle");

        this.player2 = this.physics.add.sprite(config.width / 2, config.height / 2, "player1").setScale(2).setOrigin(0,0).setTint(0xff00ff);
        this.player2.play("idle");

        this.player3 = this.physics.add.sprite(config.width / 2, config.height / 2, "player1").setScale(2).setOrigin(0,0).setTint(0x0000ff);
        this.player3.play("idle");

        this.player4 = this.physics.add.sprite(config.width / 2, config.height / 2, "player1").setScale(2).setOrigin(0,0).setTint(0xff0000);
        this.player4.play("idle");

        this.player5 = this.physics.add.sprite(config.width / 2, config.height / 2, "player1").setScale(2).setOrigin(0,0).setTint(0xffff00);
        this.player5.play("idle");

        this.player = this.physics.add.sprite(config.width / 2, config.height - 64, "player1").setScale(2).setOrigin(0,0);
        this.player.play("idle");
        this.cursorKeys = this.input.keyboard.createCursorKeys();
        this.player.setCollideWorldBounds(true);

        //disable other players while we are alone
        for(let j = 1; j < positions.length; j++){
            this.activatePlayer(j+1, false);
        }
        

        window.addEventListener("eventPWRup", () => { this.placePowerUp();});
        window.addEventListener("eventNewPlayer", (e) => { 
            this.activatePlayer(e.detail.playerId, true); } );
        window.addEventListener("eventPlayerLeft", (e) => { 
            this.activatePlayer(e.detail.playerId, false); 
        });

        this.input.on('pointerdown', () =>{
            this.dispawnPowerUp()
        }, this);

        // Collisions
        this.physics.add.overlap(this.player, this.powerUp, this.dispawnPowerUp, null, this);
    }

    update(){
        this.movePlayer();
        this.moveOtherPlayers();
    }

    // Methods

    movePlayer(){
        var direction = new Phaser.Math.Vector2(0,0);
        if (this.cursorKeys.left.isDown) {
            direction.x -= 1;
        } 
        if (this.cursorKeys.right.isDown) {
            direction.x += 1;
        }
        if (this.cursorKeys.up.isDown) {
            direction.y -= 1;
        } 
        if (this.cursorKeys.down.isDown) {
            direction.y += 1;
        }
        
        this.player.setVelocity(direction.x * gameSettings.playerSpeed, direction.y * gameSettings.playerSpeed);

        sendMyPosition(this.player.x, this.player.y);
    }

    activatePlayer(number, state){
        switch(number){
            case 1:
                this.player.setActive(state);
                this.player.setVisible(state);
                break;
            case 2:
                this.player2.setActive(state);
                this.player2.setVisible(state);
                break;
            case 3:
                this.player3.setActive(state);
                this.player3.setVisible(state);
                break;
            case 4:
                this.player4.setActive(state);
                this.player4.setVisible(state);
                break;
            case 5:
                this.player5.setActive(state);
                this.player5.setVisible(state);
                break;
        }
    }

    moveOtherPlayers(){
        this.player2.setPosition(positions[1].x, positions[1].y);
        this.player3.setPosition(positions[2].x, positions[2].y);
        this.player4.setPosition(positions[3].x, positions[3].y);
        this.player5.setPosition(positions[4].x, positions[4].y);
    }

    dispawnPowerUp(){
        this.powerUp.disableBody(false, true);
        sendPowerUpNewPosition(Math.random() * (config.width - this.powerUp.displayWidth), Math.random() * (config.height - this.powerUp.displayHeight));
    }

    placePowerUp(){
        this.powerUp.setPosition(powerUpPosition.x, powerUpPosition.y)
        this.powerUp.body.enable = true;
        this.powerUp.setVisible(true);
    }
}