/*
** Player scripts.
** Handles animations: idle, walk, jump, die and slide.
**
** You must call load_assets in preload and create_anims in create
*/

var anims = {
		idle:	"idle",
		walk:	"walk",
		jump:	"jump",
		die:	"die",
		slide:	"slide"
	}

var	player = {

	frame_rate: 20,
	run_velocity: 100,
	cursors: null,
	profile_img: null,
	correction_pixels: 150,
	walk_velocity: 600,
	jump_key: null,

	load_assets: function () {
		game.load.spritesheet('santa', 'assets/santa.png', 186.76923, 128, 85);
	},

	create: function () {
		this.create_anims ();
		this.set_physics ();

		this.cursors = game.input.keyboard.createCursorKeys();
		this.jump_key = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
	},

	play_anim: function (anim) {
		this.profile_img.animations.play(anim);
	},

	update: function () {
		this.walk_controll ();
		this.jump_controller ();
	},

	jump_controller: player_jump_controll,
	walk: player_walk,
	walk_controll: walk_controller,
	rotate_left: image_rotate_left,
	is_walking: is_walking,
	set_physics: player_set_physics,
	create_anims: create_animations
}

function walk_controller() {
	if (!this.is_walking())
	{
		this.profile_img.body.velocity.x = 0;
		this.play_anim(anims.idle);
	}
	else
	{
		this.play_anim(anims.walk);
		if (this.cursors.left.isDown)
			this.walk(-this.walk_velocity);
		if (this.cursors.right.isDown)
			this.walk(this.walk_velocity);
	}
}

function player_jump_controll() {
	if (this.jump_key.isDown && this.profile_img.body.blocked.down)
	{
		this.profile_img.body.velocity.y = -1000;
	}
}

function player_set_physics () {
	this.profile_img.enableBody = true;
	game.physics.enable(this.profile_img, Phaser.Physics.ARCADE);
	this.profile_img.body.setSize(-90, 0, 186.76923, 128);
	this.profile_img.body.bounce.y = 0.1;
	this.profile_img.body.gravity.y = 3000;
	this.profile_img.body.collideWorldBounds = true;
}

function create_animations () {
	this.profile_img = game.add.sprite(0, 0, "santa");
	this.profile_img.animations.add('idle', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], this.frame_rate, true); // 16
	this.profile_img.animations.add('walk', [17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29], this.frame_rate, true); // 13
	this.profile_img.animations.add('jump', [34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48], this.frame_rate, false); // 16
	this.profile_img.animations.add('die', [51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67], this.frame_rate, false); // 17
	this.profile_img.animations.add('slide', [68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78], this.frame_rate, true); // 17
	this.profile_img.animations.play(anims.idle);
}