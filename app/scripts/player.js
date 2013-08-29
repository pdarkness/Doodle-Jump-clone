/*global define */

define(['controls'], function(controls) {

  var PLAYER_SPEED = 350;

  var Player = function(el) {
    this.el = el;
    this.pos = { x: 0, y: 0 };
    this.vel = { x: 0, y: 0 };
  };

  Player.prototype.onFrame = function(delta) {
    // Player input
    if (controls.keys.right) {
      this.vel.x = PLAYER_SPEED;
    } else if (controls.keys.left) {
      this.vel.x = -PLAYER_SPEED;
    } else {
      this.vel.x = 0;
    }
    if (controls.keys.up) {
        this.vel.y = -PLAYER_SPEED
    } else if (controls.keys.down) {
        this.vel.y = PLAYER_SPEED
    } else {
        this.vel.y = 0;
    }

    this.pos.x += delta * this.vel.x;
    this.pos.y += delta * this.vel.y;


    // Update UI
    this.el.css('transform', 'translate3d(' + this.pos.x + 'px,' + this.pos.y + 'px,0)');
  };
  return Player;
});
