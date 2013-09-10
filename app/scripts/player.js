/*global define */

define(['controls'], function(controls) {

    var PLAYER_SPEED = 350;
    var JUMP_VELOCITY = 1450;
    var GRAVITY = 4000;
    var PLAYER_HALF_WIDTH = 14;
    var PLAYER_RADIUS = 30;



    var Player = function(el, game) {
        this.game = game;
        this.el = el;

        controls.on('super', this.onSuper.bind(this));
    };

    Player.prototype.reset = function() {
        this.pos = { x: 100, y: 0 };
        this.vel = { x: 0, y: 0 };
        this.playerScore = 0;
        this.maxScore = 0;
    }

    Player.prototype.onFrame = function(delta) {
        // Player input
        this.vel.x = controls.inputVec.x * PLAYER_SPEED;

        // Jumping
        if ( this.vel.y === 0) {
            this.vel.y = -JUMP_VELOCITY;
            if(controls.keys.space)
                this.vel.y -= 300;
            if(controls.keys.down)
                this.vel.y += 500;
            this.game.sound.play();
        }
        //console.log(this.pos.y);
        if (this.pos.x < 0)
            this.pos.x = 400;

        if (this.pos.x > 400)
            this.pos.x = 0;

        //console.log(this.pos.y);
        //console.log(HELL_Y - this.maxScore);

        // Gravity
        this.vel.y += GRAVITY * delta;

        var oldY = this.pos.y;
        this.pos.x += delta * this.vel.x;
        this.pos.y += delta * this.vel.y;



        this.playerScore = Math.abs(oldY);
        this.checkCoins(oldY);
        if (this.playerScore > this.maxScore)
            this.maxScore = this.playerScore;

        // Collision detection
        this.checkPlatforms(oldY);

        this.checkEnemies();
        this.checkGameOver();

        // Update UI
        this.el.css('transform', 'translate3d(' + this.pos.x + 'px,' + this.pos.y + 'px,0)');
        this.el.toggleClass('left', this.vel.x < 0);
        this.el.toggleClass('right', this.vel.x > 0);
        this.el.toggleClass('jumping', this.vel.y < 0);
    };

    Player.prototype.onSuper = function () {
        this.vel.y -= 300;
    }

    Player.prototype.checkGameOver = function() {
        /*if (this.pos.y > HELL_Y - Math.floor(this.maxScore)) {
            this.game.gameOver();
        }*/

        if (this.game.viewport.y != 0 && (this.pos.y- this.game.viewport.y)>this.game.viewport.height){
            this.game.gameOver();
        }
        /*if (this.pos.y < 0) {
            this.game.levelOver();
        }*/
    };

    Player.prototype.checkPlatforms = function(oldY) {
        var that = this;

        this.game.forEachPlatform(function(p) {
            // Are we crossing Y.
            if (p.rect.y >= oldY && p.rect.y < that.pos.y) {

                // Are inside X bounds.
                if (that.pos.x + PLAYER_HALF_WIDTH >= p.rect.x && that.pos.x - PLAYER_HALF_WIDTH <= p.rect.right) {
                    // COLLISION. Let's stop gravity.
                    that.pos.y = p.rect.y;
                    that.vel.y = 0;
                }
            }
        });
    };

    Player.prototype.checkCoins = function(oldY) {
        var that = this;
        this.game.forEachCoin(function(p) {
            // Are we crossing Y.
            if (p.rect.y >= oldY && p.rect.y < that.pos.y) {

                // Are inside X bounds.
                if (that.pos.x + PLAYER_HALF_WIDTH >= p.rect.x && that.pos.x - PLAYER_HALF_WIDTH <= p.rect.right) {
                    that.playerScore += 5000;
                }
            }
        });
    };

    Player.prototype.checkEnemies = function() {
        var centerX = this.pos.x;
        var centerY = this.pos.y - 40;
        var that = this;
        this.game.forEachEnemy(function(enemy) {
            // Distance squared
            var distanceX = enemy.pos.x - centerX;
            var distanceY = enemy.pos.y - centerY;

            // Minimum distance squared
            var distanceSq = distanceX * distanceX + distanceY * distanceY;
            var minDistanceSq = (enemy.radius + PLAYER_RADIUS) * (enemy.radius + PLAYER_RADIUS);

            // What up?
            if (distanceSq < minDistanceSq) {
                that.game.gameOver();
            }
        });
    };

    return Player;
});
