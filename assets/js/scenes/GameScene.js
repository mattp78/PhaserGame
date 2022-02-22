//create a scene
let gameScene = new Phaser.Scene('Game');

gameScene.init = function(){

};

//load in assets
gameScene.preload = function(){
    //load images (label, location)
    this.load.image('baseTiles', 'assets/images/background.png');               //tiles
    this.load.tilemapTiledJSON('map', 'assets/images/WorldMap1.json');          //json from Tiled
    this.load.image('player', 'assets/images/player.png');                      //Player
    this.load.image('enemy', 'assets/images/dragon.png');                       //Enemy
};

gameScene.create = function(){
    //add in tiled map, tileset, layers
    this.map = this.make.tilemap({ key: 'map'});                                       //create map: key matches name given in preload
    const tileset = this.map.addTilesetImage('background', 'baseTiles', 32, 32);             //add tilset image: name of tileset used in tiled, key of image in preload, tilewidth, tileheight
    const level = this.map.createStaticLayer('Tile Layer 1', tileset, 0, 0);                 //name of tile layer, tileset used, x&y position
    this.water = this.map.createStaticLayer('water', tileset, 0, 0); 
    this.map.x = this.map.displayWidth;
    this.map.y = this.map.displayHeight;
    this.water.setCollisionByExclusion([-1]);
    

    //prevents player from moving off map
    this.physics.world.bounds.width = this.map.widthInPixles;
    this.physics.world.bounds.height = this.map.heightInPixles;
    
    //player sprite -- add with physics to allow input from keyboard
    this.player = this.physics.add.sprite(0, 1750, 'player');

    //scale player sprite down
    this.player.setScale(.1);
    //sets player on top of background
    this.player.depth = 1;



    //enemy sprite
    this.enemy = this.add.sprite(500, 1750, 'enemy');
    this.enemy.setScale(1);

    //rotate sprite
    this.enemy.flipX = true;

    //set edges of world
    this.player.setCollideWorldBounds(true);

    //prevent player from access blocked areas (ex. water)
    this.physics.add.collider(this.player, this.water);

    this.cursors = this.input.keyboard.createCursorKeys();
};

gameScene.update = function(){
    //stops player from moving
    this.player.setVelocityY(0);
    this.player.setVelocityX(0);

    //checks if key is pressed and moves player on that axis
    if(this.cursors.up.isDown==true){
        this.player.setVelocityY(-100);
    }
    if(this.cursors.down.isDown==true){
        this.player.setVelocityY(100);
    }
    if(this.cursors.right.isDown==true){
        this.player.setVelocityX(100);
    }
    if(this.cursors.left.isDown==true){
        this.player.setVelocityX(-100);
    }
    
    //sets camera to follow player
    this.cameras.main.centerOn(this.player.x, this.player.y);
    this.cameras.main.setBounds(0, 0, this.map.widthInPixles, this.map.heightInPixles);

    //get player and enemy area
    let playerArea = this.player.getBounds();
    let enemyArea = this.enemy.getBounds();

    if(Phaser.Geom.Intersects.RectangleToRectangle(playerArea, enemyArea)){
        //restart game if player overlaps enemy
        this.scene.restart();
    }
    
};

let config = {
    type: Phaser.AUTO,          // lets phaser decide whether or not to use WebGL or Canvas
    width: 640,                 //size of game
    height: 360,
    scene: gameScene,            //this is where you pass in which scene to use
    physics:{
        default:"arcade",
        arcade:{
            debug:true
        }
    },
    pixelArt: true,
    roundPixels: true,
};

// create the game and pass in the configuration
let game = new Phaser.Game(config);