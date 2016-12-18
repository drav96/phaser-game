/* ************************************************
** GAME PLAYER CLASS
************************************************ */
var Player = function (startX, startY) {
  var x = startX
  var y = startY
  var id;
  var x_scale;
  var score = 0;

  // Getters and setters
  var getX = function () {
    return x
  }

  var getY = function () {
    return y
  }

  var get_scale = function () {
    return x_scale;
  }

  var setX = function (newX) {
    x = newX
  }

  var setY = function (newY) {
    y = newY
  }

  var set_scale = function (new_s) {
    x_scale = new_s;
  }


  // Define which variables and methods can be accessed
  return {
    getX: getX,
    getY: getY,
    get_scale: get_scale,
    setX: setX,
    setY: setY,
    set_scale: set_scale,
    id: id
  }
}

// Export the Player class so you can use it in
// other files by using require("Player")
module.exports = Player
