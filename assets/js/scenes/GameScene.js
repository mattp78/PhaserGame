//create a scene
let gameScene = new Phaser.Scene('Game');

gameScene.init = function() {
	this.mainPlayerSpeed = 150;
	this.coinScore = 0;
	this.scoreText;
};

//load in assets
gameScene.preload = function() {
	//load images (label, location)
	this.load.image('baseTiles', 'assets/images/background.png'); //tiles
	this.load.tilemapTiledJSON('map', 'assets/images/WorldMap1-2.json'); //json from Tiled
	this.load.spritesheet('enemy', 'assets/images/enemySprite-walk.png', { frameWidth: 73, frameHeight: 92 }); //Enemy
	this.load.spritesheet('mainPlayer', 'assets/images/Character/mainPlayer.png', {
		frameWidth: 24,
		frameHeight: 24
	});
	this.load.spritesheet('coin', 'assets/images/coin.png', { frameWidth: 16, frameHeight: 16 });

	this.coinScore = 0;
	this.scoreText;
};

gameScene.create = function() {
	//tiled map, tileset, layers
	this.map = this.make.tilemap({ key: 'map' }); //create map: key matches name given in preload
	const tileset = this.map.addTilesetImage('background', 'baseTiles', 32, 32); //add tilset image: name of tileset used in tiled, key of image in preload, tilewidth, tileheight
	const level = this.map.createDynamicLayer('Tile Layer 1', tileset, 0, 0); //name of tile layer, tileset used, x&y position
	this.water = this.map.createDynamicLayer('water', tileset, 0, 0);
	this.map.x = this.map.displayWidth;
	this.map.y = this.map.displayHeight;
	this.water.setCollisionByExclusion([ -1 ]);

	//coins
	this.CoinLayer = this.map.getObjectLayer('coins')['objects'];
	coins = this.physics.add.staticGroup();
	this.CoinLayer.forEach((object) => {
		let obj = coins.create(object.x, object.y, 'coin');
		obj.setScale(object.width / 16, object.height / 16);
		obj.setOrigin(0);
		obj.body.width = object.width;
		obj.body.height = object.height;
	});

	//sprites -- add with physics to allow input from keyboard
	this.mainPlayer = this.physics.add.sprite(150, 1750, 'mainPlayer');
	this.enemy = this.physics.add.sprite(500, 1750, 'enemy');

	//collisons
	this.physics.add.overlap(this.mainPlayer, coins, collectCoin, null, this);
	this.physics.add.overlap(this.mainPlayer, this.enemy, enemyOverlap, null, this);

	//prevents player from moving off map
	this.physics.world.bounds.width = this.map.widthInPixles;
	this.physics.world.bounds.height = this.map.heightInPixles;

	//set sprite sizes
	this.mainPlayer.setScale(1.2);
	this.enemy.setScale(0.4);

	//walking animations
	this.anims.create({
		key: 'walk',
		frames: this.anims.generateFrameNames('mainPlayer', { frames: [ 1, 2, 3, 4, 5, 6 ] }),
		frameRate: 12,
		yoyo: true,
		repeat: -1
	});

	this.anims.create({
		key: 'enemyWalk',
		frames: this.anims.generateFrameNames('enemy', { frames: [ 1, 2, 3, 4, 5, 6 ] }),
		frameRate: 10,
		yoyo: true,
		repeat: -1
	});

	//sets player on top of background
	this.mainPlayer.depth = 1;

	this.scoreText = gameScene.add.text(0, 0, `score: ` + this.coinScore, { fontSize: '18px', fill: '#000000' });

	//set edges of world
	this.mainPlayer.setCollideWorldBounds(true);
	this.enemy.setCollideWorldBounds(true);

	//prevent player from access blocked areas (ex. water)
	this.physics.add.collider(this.mainPlayer, this.water);
	this.physics.add.collider(this.mainPlayer, this.enemy);
	this.physics.add.collider(this.enemy, this.mainPlayer);
	this.physics.add.collider(this.enemy, this.water);

	//get keyboard input for movement
	this.cursors = this.input.keyboard.createCursorKeys();

	this.enemy.setFrame(4);
	this.enemy.play('enemyWalk');
	this.scoreText.setScrollFactor(0, 0);
	this.scoreText.fixedToCamera = true;
};

function collectCoin(player, coin) {
	coin.destroy(coin.x, coin.y); // remove the tile/coin
	this.mainPlayerSpeed += 10;
	this.coinScore++;
	console.log(this.coinScore);
}

function enemyOverlap(player, enemy) {
	this.scene.restart();
	return false;
}

gameScene.update = function() {
	this.scoreText = (gameScene, 0, 0, `score: ${this.coinScore}`);

	//stops player from moving
	this.mainPlayer.setVelocityX(0);
	this.mainPlayer.setVelocityY(0);

	//checks if key is pressed and moves player on that axis
	if (this.cursors.up.isDown == true) {
		this.mainPlayer.setVelocityY(-this.mainPlayerSpeed);
		if (!this.mainPlayer.anims.isPlaying) {
			this.mainPlayer.play('walk');
		}
	} else if (this.cursors.down.isDown == true) {
		this.mainPlayer.setVelocityY(this.mainPlayerSpeed);
		if (!this.mainPlayer.anims.isPlaying) {
			this.mainPlayer.play('walk');
		}
	} else if (this.cursors.right.isDown == true) {
		this.mainPlayer.setVelocityX(this.mainPlayerSpeed);

		this.mainPlayer.flipX = false;
		if (!this.mainPlayer.anims.isPlaying) {
			this.mainPlayer.play('walk');
		}
	} else if (this.cursors.left.isDown == true) {
		this.mainPlayer.setVelocityX(-this.mainPlayerSpeed);

		this.mainPlayer.flipX = true;
		if (!this.mainPlayer.anims.isPlaying) {
			this.mainPlayer.play('walk');
		}
	} else {
		this.mainPlayer.anims.stop('walk');
		this.mainPlayer.setFrame(0);
	}

	//flip enemy to face player
	if (this.mainPlayer.x - this.enemy.x < 0) {
		this.enemy.flipX = true;
	} else {
		this.enemy.flipX = false;
	}

	//moves enemy toward player
	this.physics.moveToObject(this.enemy, this.mainPlayer);

	//sets camera to follow player
	this.cameras.main.centerOn(this.mainPlayer.x, this.mainPlayer.y);
	this.cameras.main.setBounds(0, 0, this.map.widthInPixles, this.map.heightInPixles);
};

let config = {
	type: Phaser.AUTO, // lets phaser decide whether or not to use WebGL or Canvas
	width: 640, //size of game
	height: 360,
	scene: gameScene, //this is where you pass in which scene to use
	physics: {
		default: 'arcade',
		arcade: {
			debug: true
		}
	},
	pixelArt: true,
	roundPixels: true,
	title: 'My Final Project'
};

// create the game and pass in the configuration
let game = new Phaser.Game(config);
