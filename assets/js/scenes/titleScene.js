class TitleScene extends Phaser.Scene {
	constructor() {
		super({ key: 'titlescene' });
	}

	preload() {
		this.preload.image('titleBackground', 'assets/images/titleBackground.jpg');
	}

	create() {
		let bg = this.add.sprite(0, 0, 'titleBackground');
		bg.setOrigin(0, 0);
		let text = this.add.text(100, 100, 'My Final Project');
	}
}

export default TitleScene;
