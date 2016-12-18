var util = require('util')
var http = require('http')
var path = require('path')
var ecstatic = require('ecstatic')
var io = require('socket.io')

var Player = require('./Player')

var port = process.env.PORT || 3002

/* ************************************************
** GAME VARIABLES
************************************************ */
var socket	// Socket controller
var players	// Array of connected players
var stars = [];
/* ************************************************
** GAME INITIALISATION
************************************************ */

// Create and start the http server
var server = http.createServer(
  ecstatic({ root: path.resolve(__dirname, '../public') })
).listen(port, function (err) {
  if (err) {
    throw err
  }

  init();
})

function init () {
  // Create an empty array to store players
  players = []

  // Attach Socket.IO to server
  socket = io.listen(server)
    create_stars();
  // Start listening for events
  setEventHandlers();
}

/* ************************************************
** GAME EVENT HANDLERS
************************************************ */
var setEventHandlers = function () {
  // Socket.IO
  socket.sockets.on('connection', onSocketConnection)
}

var Player_score = function (id) {
  return {id: id, score: 0};
}

var Star = function (id, x, y, scale)
{
  return {id: id, x: x, y: y, scale: scale};
}

// New socket connection
function onSocketConnection (client) {
  util.log('New player has connected: ' + client.id)

  // Listen for client disconnected
  client.on('disconnect', onClientDisconnect)

  // Listen for new player message
  client.on('new player', onNewPlayer)

  // Listen for move player message
  client.on('move player', onMovePlayer);

  client.on('collect star', on_collect_star);
}

function on_collect_star (data) {
  this.broadcast.emit('collected star', stars[data.id]);
}

// Socket client has disconnected
function onClientDisconnect () {
  util.log('Player has disconnected: ' + this.id)

  var removePlayer = playerById(this.id)

  // Player not found
  if (!removePlayer) {
    util.log('Player not found: ' + this.id)
    return
  }

  // Remove player from players array
  players.splice(players.indexOf(removePlayer), 1)

  // Broadcast removed player to connected socket clients
  this.broadcast.emit('remove player', {id: this.id})
}

// New player has joined
function onNewPlayer (data) {
  // Create a new player
  var newPlayer = new Player(data.x, data.y)
  newPlayer.id = this.id

  // Broadcast new player to connected socket clients
  this.broadcast.emit('new player', {id: newPlayer.id, x: newPlayer.getX(), y: newPlayer.getY()})

  // Send existing players to the new player
  var i, existingPlayer
  for (i = 0; i < players.length; i++) {
    existingPlayer = players[i];
    this.emit('new player', {id: existingPlayer.id, x: existingPlayer.getX(), y: existingPlayer.getY()})
  }

  // Add new player to the players array
  players.push(newPlayer);

  this.broadcast.emit('reset game', {data: null});
}

// Player has moved
function onMovePlayer (data) {
  // Find player in array
  var movePlayer = playerById(this.id)

  // Player not found
  if (!movePlayer) {
    util.log('Player not found: ' + this.id)
    return
  }

  // Update player position
  movePlayer.setX(data.x)
  movePlayer.setY(data.y);
  movePlayer.set_scale(data.x_scale);

  // Broadcast updated position to connected socket clients

  this.broadcast.emit('move player', {id: movePlayer.id, x: movePlayer.getX(), y: movePlayer.getY(), x_scale: movePlayer.get_scale ()})
}


function create_stars () {
    //stars.enableBody = true;
    for (var i = 0; i < 20; i++)
    {
        star_random_create();
    }
    setInterval(star_random_create, 2000);
    ///game.time.events.repeat(Phaser.Timer.SECOND * 2, 100000, star_random_create, this);
}

function random_size(center, chance) {
    if (Math.random() * 100 < chance)
        return (2 * center - Math.random() * (center / 4))
    else
    {
        center *= 0.6;
        return (1.3 * center - Math.random() * (center / 3  ))
    }

}

var star_index = 0;

function star_random_create () {
    var chance = 80;
    if (Math.random() * 100 < chance)
    {
      star_index++;
        //  Let gravity do its thing
       // star.body.gravity.y = 800;

        //  This just gives each star a slightly random bounce value
        //star.body.bounce.y = 0.7 + 0.5 * Math.random() * 0.2 * 0.6 / star.scale.x;
//        stars.push(star);
        star = new Star(star_index, Math.random() * (1200 - 100), Math.random() * (800 - 100), random_size(0.6, 10));
        stars[star_index] = star;
        socket.emit('star created', star);
        //socket.emit('star created',{x: Math.random() * (1200 - 100), y: Math.random() * (800 - 100), x_s:  random_size(0.6, 10), id: dex});
    }
}

/* ************************************************
** GAME HELPER FUNCTIONS
************************************************ */
// Find player by ID
function playerById (id) {
  var i
  for (i = 0; i < players.length; i++) {
    if (players[i].id === id) {
      return players[i]
    }
  }

  return false
}
