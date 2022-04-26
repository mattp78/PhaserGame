//create a scene
let gameScene = new Phaser.Scene('Game');

gameScene.init = function() {
	this.mainPlayerSpeed = 150;
};

//load in assets
gameScene.preload = function() {
	//loading screen
	let progressBar = this.add.graphics();
	let progressBox = this.add.graphics();
	progressBox.fillStyle(0x222222, 0.8);
	progressBox.fillRect(240, 270, 320, 50);

	this.load.image('logo', 'assets/images/logo.png');
	for (var i = 0; i < 500; i++) {
		this.load.image('logo' + i, 'logo.png');
	}

	this.load.on('progress', function(value) {
		console.log(value);
	});

	this.load.on('fileprogress', function(file) {
		console.log(file.src);
	});
	this.load.on('complete', function() {
		console.log('complete');
	});

	this.load.on('progress', function(value) {
		console.log(value);
		progressBar.clear();
		progressBar.fillStyle(0xffffff, 1);
		progressBar.fillRect(250, 280, 300 * value, 30);
	});

	//load images (label, location)
	this.load.image('baseTiles', 'assets/images/background.png'); //tiles
	this.load.tilemapTiledJSON('map', 'assets/images/WorldMap1-2.json'); //json from Tiled
	this.load.spritesheet('enemy', 'assets/images/enemySprite-walk.png', { frameWidth: 73, frameHeight: 92 }); //Enemy
	this.load.spritesheet('mainPlayer', 'assets/images/Character/mainPlayer.png', { frameWidth: 24, frameHeight: 24 });
};

gameScene.create = function() {
	//loading screen
	let logo = this.add.image(400, 300, 'logo');

	//add in tiled map, tileset, layers
	this.map = this.make.tilemap({ key: 'map' }); //create map: key matches name given in preload
	const tileset = this.map.addTilesetImage('background', 'baseTiles', 32, 32); //add tilset image: name of tileset used in tiled, key of image in preload, tilewidth, tileheight
	const level = this.map.createStaticLayer('Tile Layer 1', tileset, 0, 0); //name of tile layer, tileset used, x&y position
	this.water = this.map.createStaticLayer('water', tileset, 0, 0);
	this.map.x = this.map.displayWidth;
	this.map.y = this.map.displayHeight;
	this.water.setCollisionByExclusion([ -1 ]);

	//prevents player from moving off map
	this.physics.world.bounds.width = this.map.widthInPixles;
	this.physics.world.bounds.height = this.map.heightInPixles;

	//player sprite -- add with physics to allow input from keyboard
	this.mainPlayer = this.physics.add.sprite(150, 1750, 'mainPlayer');
	this.enemy = this.physics.add.sprite(500, 1750, 'enemy');

	//this.mainPlayer = gameScene.add.sprite(150, 1750, 'mainPlayer');
	this.mainPlayer.setScale(1.2);
	this.enemy.setScale(0.4);

	//mainPlayer walking animation
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

	//throw knives

	//rotate sprite
	//this.enemy.flipX = true;

	//set edges of world
	this.mainPlayer.setCollideWorldBounds(true);
	this.enemy.setCollideWorldBounds(true);

	//prevent player from access blocked areas (ex. water)
	this.physics.add.collider(this.mainPlayer, this.water);
	this.physics.add.collider(this.mainPlayer, this.enemy);
	this.physics.add.collider(this.enemy, this.mainPlayer);
	this.physics.add.collider(this.enemy, this.water);

	this.cursors = this.input.keyboard.createCursorKeys();

	// console.log(Phaser.Math.distance(this.mainPlayer.x, this.mainPlayer.y, this.enemy.x, this.enemy.y));
	this.enemy.setFrame(4);
	this.enemy.play('enemyWalk');
};

gameScene.update = function() {
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

	if (this.mainPlayer.x - this.enemy.x < 0) {
		this.enemy.flipX = true;
	} else {
		this.enemy.flipX = false;
	}
	this.physics.moveToObject(this.enemy, this.mainPlayer);

	//sets camera to follow player
	this.cameras.main.centerOn(this.mainPlayer.x, this.mainPlayer.y);
	this.cameras.main.setBounds(0, 0, this.map.widthInPixles, this.map.heightInPixles);

	//get player and enemy area
	let playerArea = this.mainPlayer.getBounds();
	let enemyArea = this.enemy.getBounds();

	if (this.mainPlayer.body.touching.right) {
		this.scene.restart();
	}

	if (Phaser.Geom.Intersects.RectangleToRectangle(playerArea, enemyArea)) {
		//restart game if player overlaps enemy
		this.scene.restart();
	}
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
	roundPixels: true
};

// create the game and pass in the configuration
let game = new Phaser.Game(config);
