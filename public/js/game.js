/* global Phaser RemotePlayer io */
var screen_w = 1200;
var screen_h = 800;

var game = new Phaser.Game(screen_w, screen_h, Phaser.AUTO, '', { preload: preload, create: create, update: update, render: render })



function preload () {
  game.load.image('sky', 'assets/sky.png');
  game.load.image('ground', 'assets/platform.png');
    game.load.image('star', 'assets/star.png');
    game.load.spritesheet('santa', 'assets/santa.png', 186.76923, 128, 85);
    game.load.spritesheet('enemy', 'assets/santa.png', 186.76923, 128, 85);
}

var socket // Socket connection

var player;
var platforms;
var cursors;
var currentSpeed = 0
var score = 0;
var scoreText;
var person = prompt("Please enter your name");
function create () {
  socket = io.connect();

  // Resize our game world to be a 2000 x 2000 square
    game.physics.startSystem(Phaser.Physics.ARCADE);
    // Our tiled scrolling background
    var sky_sprite = game.add.sprite(0, 0, 'sky');
    sky_sprite.width = 3000;
    sky_sprite.height=1500;

    create_ground();
    //create_stars();

    // The player and its settings
    var startX = 30
    var startY = 0

    player = game.add.sprite(startX, startY, 'santa')
    player.anchor.setTo(0.5, 0.5)
    player.animations.add('move', [17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29], 20, true)
    player.animations.add('stop', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], 20, true)

    game.physics.arcade.enable(player)
    player.body.gravity.y = 1000 ;
    player.body.collideWorldBounds = true;
    player.body.setSize(50, 64, 0, 10);
    player.scale.x *= 0.5;
    player.scale.y *= 0.5;


  // Create some baddies to waste :)
    enemies = []

    stars = []

    scoreText = game.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000' });
    personText = game.add.text(16, 58, 'Name: 0', { fontSize: '32px', fill: '#000' });
    cursors = game.input.keyboard.createCursorKeys()

  // Start listening for events
  setEventHandlers()
}

var setEventHandlers = function () {
  // Socket connection successful
  socket.on('connect', onSocketConnected)

  // Socket disconnection
  socket.on('disconnect', onSocketDisconnect)

  // New player message received
  socket.on('new player', onNewPlayer)

  // Player move message received
  socket.on('move player', onMovePlayer)

  // Player removed message received
  socket.on('remove player', onRemovePlayer);

  socket.on('star created', on_star_create);

  socket.on('collected star', on_enemy_collected_star);

  socket.on('reset game', reset_game);
}

function reset_game (data) {
  for (var i = 0; i < stars.length; i++)
  {
    if (stars[i] != null)
    {
      stars[i].kill();
      score = 0;
      update_score();
    }
  }
}

function update_score() {
  scoreText.text = "Score: " + score;
}

function on_enemy_collected_star (star) {
  console.log(star);
  stars[star.id].kill();
}

function on_star_create (data) {
  var star = game.add.sprite(data.x, data.y, 'star');
  star.scale.x = data.x / 600;
  star.scale.y = star.scale.x;

  stars[data.id] = star;
    game.physics.arcade.enable(star);
    star.body.gravity.y = 800;
}

// Socket connected
function onSocketConnected () {
  console.log('Connected to socket server')

  // Reset enemies on reconnect
  enemies.forEach(function (enemy) {
    enemy.player.kill()
  })
  enemies = []

  // Send local player data to the game server
  socket.emit('new player', { x: player.x, y: player.y })
}

// Socket disconnected
function onSocketDisconnect () {
  console.log('Disconnected from socket server');
}

// New player
function onNewPlayer (data) {

  // Avoid possible duplicate players
  var duplicate = playerById(data.id)
  if (duplicate) {
    return
  }

  // Add new player to the remote players array
  enemies.push(new RemotePlayer(data.id, game, player, data.x, data.y))
}

// Move player
function onMovePlayer (data) {
  var movePlayer = playerById(data.id)

  // Player not found
  if (!movePlayer) {
    return
  }

  // Update player position
  movePlayer.player.x = data.x
  movePlayer.player.y = data.y;
  movePlayer.player.x_scale = data.x_scale;
  movePlayer.player.scale.x = data.x_scale;

}

// Remove player
function onRemovePlayer (data) {
  var removePlayer = playerById(data.id)

  // Player not found
  if (!removePlayer) {
    console.log('Player not found: ', data.id)
    return
  }

  removePlayer.player.kill()

  // Remove player from array
  enemies.splice(enemies.indexOf(removePlayer), 1)
}

function update () {
  for (var i = 0; i < enemies.length; i++) {
    if (enemies[i].alive) {
      enemies[i].update()
      game.physics.arcade.collide(player, enemies[i].player)
    }
  }
  /*
    scoreText.position.x = player.position.x - 60;
    scoreText.position.y = player.position.y - 60;
    */
    game.physics.arcade.collide(player, platforms);
    game.physics.arcade.collide(stars, platforms);
    game.physics.arcade.overlap(player, stars, collectStar, null, this);


    currentSpeed = 0;
    var n = 5;
    if (cursors.left.isDown) {
        player.body.x-=n;
        player.scale.x = -Math.abs(player.scale.x);
        player.x_scale = -Math.abs(player.scale.x);
        currentSpeed = 300
    } else if (cursors.right.isDown) {
        player.scale.x = Math.abs(player.scale.x);
        currentSpeed = 300
        player.x_scale = -Math.abs(player.scale.x);
        player.body.x+=n;

    }
    if (cursors.up.isDown) {// && player.body.blocked.down) {
        player.body.velocity.y = -800;
    }

    game.physics.arcade.velocityFromRotation(player.rotation)

    if (currentSpeed > 0) {
        player.animations.play('move')
    } else {
        player.animations.play('stop')
    }
    if (person == null || person == "")
      personText.kill();
    else
      personText.text = 'Name: ' + person;
  socket.emit('move player', { x: player.x, y: player.y, x_scale: player.scale.x})
}

function render () {

}
function collectStar (player, star) {
    var id = stars.indexOf(star);
    socket.emit('collect star', {id: id});

    // Removes the star from the screen
    star.kill();
    //  Add and update the score
    score += Math.round(10 * star.scale.x / 0.6);
    scoreText.text = 'Score: ' + score;
}

// Find player by ID
function playerById (id) {
  for (var i = 0; i < enemies.length; i++) {
    if (enemies[i].player.name === id) {
      return enemies[i]
    }
  }

  return false
}

function create_ground () {
    platforms = game.add.group();
    platforms.enableBody = true;
    var ground = platforms.create(0, game.world.height - 64, 'ground');
    //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
    ground.scale.setTo(2, 2);
    ground.body.immovable = true;
    var ledge = platforms.create(0,120,'ground');
    ledge.body.immovable = true;
    ledge.width*=0.8;
    ledge = platforms.create(800, 120, 'ground');
    ledge.body.immovable = true;
    ledge = platforms.create(800, 400, 'ground');
    ledge.body.immovable = true;
    ledge = platforms.create(250, 250, 'ground');
    ledge.body.immovable = true;
    ledge = platforms.create(50, 400, 'ground');
    ledge.body.immovable = true;
    ledge = platforms.create(500, 550, 'ground');
    ledge.body.immovable = true;
    ledge = platforms.create(50, 650, 'ground');
    ledge.body.immovable = true;
    ledge = platforms.create(750, 650, 'ground');
    ledge.body.immovable = true;
}

