/* global game */

var RemotePlayer = function (index, game, player, startX, startY) {
  var x = startX
  var y = startY

  this.game = game
  this.player = player
  this.alive = true;
  this.player.id = index;
  this.player = game.add.sprite(x, y, 'enemy')

  this.player.animations.add('move', [17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29], 20, true)
  this.player.animations.add('stop', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], 20, true)

    this.player.scale.x *= 0.5;
    this.player.scale.y *= 0.5;
    this.player.anchor.setTo(0.5, 0.5)
  this.player.name = index.toString()
  game.physics.enable(this.player, Phaser.Physics.ARCADE)
  this.player.body.immovable = true
  this.player.body.collideWorldBounds = true


  this.lastPosition = { x: x, y: y}
}

RemotePlayer.prototype.update = function () {
  if (this.player.x !== this.lastPosition.x || this.player.y !== this.lastPosition.y ) {
    this.player.play('move')
  } else {
    this.player.play('stop')
  }

  this.lastPosition.x = this.player.x
  this.lastPosition.y = this.player.y
}

window.RemotePlayer = RemotePlayer
