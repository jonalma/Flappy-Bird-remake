var game;
var SCREEN_W = 288;
var SCREEN_H = 505;

var bootState = {
    preload: function() {
        game.load.image('progressBar', 'assets/progressBar.png');
    },
    create: function() {
        game.stage.backgroundColor = "#000000"; //would change this line to change the color of the background
        game.physics.startSystem(Phaser.Physics.ARCADE); //would change this line if using anything other than ARCADE physics
        game.state.start('load');
    }
};
var loadState = {
    preload: function() {
        var progressBar = game.add.sprite(game.world.centerX, game.world.centerY, 'progressBar');
        progressBar.anchor.setTo(.5, .5);
        game.load.setPreloadSprite(progressBar);
        //game.load.image('flappy', 'assets/flappy.png');
        game.load.spritesheet('flappy', 'assets/flappySS.png', 34, 24);
        game.load.spritesheet('pipes', 'assets/pipes.png', 54, 320)
        game.load.image('start', 'assets/start-button.png');
        game.load.image('getReady', 'assets/get-ready.png');
        game.load.image('instructions', 'assets/instructions.png');
        game.load.image('day', 'assets/flappyDay.png');
        game.load.image('ground', 'assets/ground.png');
        game.load.image('gameover', 'assets/gameover.png');
        game.load.image('score', 'assets/scoreboard.png');
        game.load.image('medals', 'assets/medals.png');
    },
    create: function() {
        game.state.start('menu');
    }
};
var menuState = {
    preload: function() {},
    create: function() {
        //         var text;
        //         //check if desktop
        //         if(game.device.desktop) {
        //             //start game on key is up
        //             text = "Press the Up Arrow Key to Start!"
        //             var upKey = game.input.keyboard.addKey(Phaser.Keyboard.UP);
        //             upKey.onDown.addOnce(this.startGame, this);
        //         } else {
        //             text = "Tap the Screen to Start!"
        //             game.input.onTap.addOnce(this.startGame, this);
        //         }
        //         //create startlabel picture
        //         var startLabel = game.add.text(game.world.centerX, game.world.height - 80, text, {
        //             font: '20px Roboto',
        //             fill: '#FFFFFF'
        //         });
        //         startLabel.anchor.setTo(.5, .5);
        //add day or night background
        this.background = game.add.sprite(0, 0, 'day'); //can optionally use 'night' or have a random selector
        //dad ground
        this.ground = game.add.tileSprite(0, SCREEN_H - 100, SCREEN_W, 110, 'ground');
        this.ground.autoScroll(-200, 0); //auto scrolls the ground forever!
        //add start button
        this.startButton = game.add.button(game.width / 2, 300, 'start', this.startGame, this);
        this.startButton.anchor.setTo(.5, .5);
        //add flappy sprite
        this.flappy = game.add.sprite((SCREEN_W / 2 - 44), SCREEN_H / 2, 'flappy');
        this.flappy.anchor.setTo(.2, .5);
        this.flappy.alive = false; // change from false to true 5/11
        this.flappy.animations.add('flap', [0, 1, 2], 12, true);
        this.flappy.animations.play('flap');
    },
    startGame: function() {
        game.state.start('play');
    }
};
var playState = {
    preload: function() {
        //add day or night background
        this.background = game.add.sprite(0, 0, 'day'); //can optionally use 'night' or have a random selector
        //dad ground
        this.ground = game.add.tileSprite(0, SCREEN_H - 100, SCREEN_W, 110, 'ground');
        this.ground.autoScroll(-200, 0); //auto scrolls the ground forever!  
        //add flappy sprite to game
        this.flappy = game.add.sprite((SCREEN_W / 2 - 44), SCREEN_H / 2, 'flappy');
        this.flappy.anchor.setTo(.2, .5);
        this.flappy.alive = false;
        this.flappy.animations.add('flap', [0, 1, 2], 12, true);
        this.flappy.animations.play('flap');
        //      this.flappy = game.add.sprite((SCREEN_W / 2 - 44), SCREEN_H / 2, 'flappy');
        //      this.flappy.alive = false; //set flappy's alive to be false to start
        //add instructions
        this.instructions = game.add.group();
        var ready = game.add.sprite(game.width / 2, 100, 'getReady');
        var prompt = game.add.sprite(game.width / 2, 325, 'instructions');
        this.instructions.add(ready);
        this.instructions.add(prompt);
        this.instructions.setAll('anchor.x', .5);
        this.instructions.setAll('anchor.y', .5);
        //add score text
        this.score = 0;
        this.scoreText = game.add.text(SCREEN_W / 2, 50, "", {
            font: "28px Roboto",
            fill: "#FFFFFF"
        });
        this.scoreText.anchor.setTo(.5, .5);
    },
    create: function() {
        game.physics.arcade.enable(this.ground);
        this.ground.body.immovable = true;
        //add pipes 
        this.pipes = game.add.group();
        //this.pipes.enableBody = true;
        //this.pipes.createMultiple(10, 'pipes');
        game.time.events.loop(1500, this.spawnPipes, this);
    },
    startGame: function() {
        //destroy instruction png after game starts
        this.instructions.destroy();
        game.physics.arcade.enable(this.flappy); //enable physics for the body component
        this.flappy.alive = true; //set flappy to be alive!      
        this.flappy.body.gravity.y = 1000; //set gravity to flappy's body (positive = down, negative = up)
        this.flappy.anchor.setTo(.2, .5);
    },
    flap: function() {
        //always check to see if flappy is alive if you have knowingly changed it in the past
        if(!this.flappy.alive) return;
        //tween flappy's angle to somewhere up!
        var tween = game.add.tween(this.flappy).to({
            angle: -35
        }, 150).start(); //default angle is 150
        this.flappy.body.velocity.y = -250; //Create an upward velocity like a jump!
    },
    update: function() {
        //COLLISION between flappy and ground
        //game.physics.arcade.collide(this.flappy, this.ground, this.hitPipe, null, this);
        game.physics.arcade.collide(this.flappy, this.ground, this.hitPipe, null, this);
        //COLLISION between flappy and pipes
        this.pipes.forEach(function(pipeGroup) {
            // WHY IS THIS HERE 
            // this.pipeGroup
            this.checkScore(pipeGroup);
            game.physics.arcade.overlap(this.flappy, pipeGroup, this.hitPipe, null, this);
        }, this);
        //mouse down to start game
        game.input.onDown.addOnce(this.startGame, this);
        //mouse down to make flappy flap
        game.input.onDown.add(this.flap, this);
        if(this.flappy.alive) {
            //add to flappy's angle to rotate him clockwise!
            if(this.flappy.angle < 90) this.flappy.angle += 2.5;
        }
        
        if(!this.flappy.inWorld){  
            game.state.add('play', playState);
        }
    },
    hitPipe: function() {
        if(!this.flappy.alive) {
            return;
        }
        this.flappy.alive = false;
        this.flappy.animations.stop();
        this.ground.stopScroll();
        game.time.events.remove(this.timer);
        this.pipes.forEachAlive(function(pipeGroup) {
            pipeGroup.forEachAlive(function(pipe) {
                pipe.body.velocity.x = 0;
            }, this);
        }, this);
        /////////////// MUST CHANGE this.restart to BELOW
        //game.time.events.add(1000, this.restart, this);
        //restart game after 1 second
        //game.time.events.add(1000, game.state.start('menu'), this);
        //ADDED FALLING TWISTING FLAPPY
        var tween = game.add.tween(this.flappy).to({
            angle: -35
        }, -20).start();
        //game over screen
        game.time.events.add(1000, this.gameOver, this);
    },
    gameOver: function() {
        var text = game.add.sprite(game.width / 2, 100, 'gameover');
        text.anchor.setTo(.5, .5);
        var scoreBoard = game.add.sprite(game.width / 2, 200, 'score');
        scoreBoard.anchor.setTo(.5, .5);
        var scoreText = game.add.text(scoreBoard.width, 190, this.score, {
            font: "28px Roboto",
            fill: "#FFFFFF"
        });
        scoreText.anchor.setTo(.5, .5);
        var start = game.add.button(game.width / 2, 300, 'start', this.play, this);
        start.anchor.setTo(.5, .5);
        //ADDING MEDALS
        if(!localStorage.getItem('bestScore')) {
            localStorage.setItem('bestScore', 0);
        }
        if(this.score > localStorage.getItem('bestScore')) {
            localStorage.setItem('bestScore', this.score);
        }
        var highScoreText = game.add.text(scoreBoard.width, 235, localStorage.getItem('bestScore'), {
            font: "28px Roboto",
            fill: "#FFFFFF"
        });
        highScoreText.anchor.setTo(.5, .5);
        //SET HIGH SCORE
        if(this.score >= 10 && this.score < 20) {
            this.medal = game.add.sprite(-65, 7, 'medals', 0);
            this.medal.anchor.setTo(.5, .5);
            scoreBoard.addChild(this.medal);
        } else if(this.score >= 20) {
            this.medal = game.add.sprite(-65, 7, 'medals', 1);
            this.medal.anchor.setTo(.5, .5);
            scoreBoard.addChild(this.medal);
        }
    },
    play: function() {
        game.state.start('play');
    },
    spawnPipes: function() {
        //         var topPipe = game.add.sprite(game.width, 0, 'pipes'); //x = width, y = 0
        //         var botPipe = game.add.sprite(game.width, 440, 'pipes'); //x = width, y = 0
        //         if(!topPipe) return;
        //         if(!botPipe) return;
        //         topPipe.anchor.setTo(.5, .5);
        //         topPipe.frame = 0; //(Frame 0): Top Pipe (Frame 1): Bot Pipe  
        //         botPipe.anchor.setTo(.5, .5);
        //         botPipe.frame = 1; //(Frame 0): Top Pipe (Frame 1): Bot Pipe  
        //         //PIPES MUST BE ADDED TO GROUP
        //         this.pipes.add(topPipe);
        //         this.pipes.add(botPipe);
        //         topPipe.body.velocity.x = -200;
        //         topPipe.checkWorldBounds = true;
        //         topPipe.outOfBoundsKill = true;
        //         botPipe.body.velocity.x = -200;
        //         botPipe.checkWorldBounds = true;
        //         botPipe.outOfBoundsKill = true;
                 
        var pipeCouple = this.pipes.getFirstDead();
        if(!pipeCouple) pipeCouple = game.add.group(this.pipes); //add a group and assign its parent to be `this.pipes`
        //xPos,     yPos, 'key', frame, group
        var topPipe = game.add.sprite(game.width, 0, 'pipes', 0, pipeCouple);
        game.physics.arcade.enable(topPipe);
        var botPipe = game.add.sprite(game.width, 440, 'pipes', 1, pipeCouple);
        game.physics.arcade.enable(botPipe);
        pipeCouple.setAll('checkWorldBounds', true);
        pipeCouple.setAll('outOfBoundsKill', true);
        pipeCouple.setAll('anchor.x', .5);
        pipeCouple.setAll('anchor.y', .5);
        pipeCouple.setAll('body.velocity.x', -200);
        pipeCouple.scored = false; //boolean used to check when flappy has passed these pair of pipes
        var randomY = game.rnd.integerInRange(-100, 100);
        pipeCouple.y = randomY;
    },
    checkScore: function(pipeGroup) {
        if(!pipeGroup.scored && pipeGroup.children[0].x <= this.flappy.x) {
            pipeGroup.scored = true;
            this.score++;
            this.scoreText.text = this.score;
        }
    }
};
game = new Phaser.Game(SCREEN_W, SCREEN_H, Phaser.AUTO, 'game');
game.state.add('boot', bootState);
game.state.add('load', loadState);
game.state.add('menu', menuState);
game.state.add('play', playState);
game.state.start('boot');