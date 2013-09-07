/*global define, $ */

define(['player', 'platform', 'enemy', 'controls'], function(Player, Platform, Enemy, controls) {

    var VIEWPORT_PADDING = 230;

    /**
     * Main game class.
     * @param {Element} el DOM element containig the game.
     * @constructor
     */
    var Game = function(el) {
        this.el = el;
        this.player = new Player(this.el.find('.player'), this);
        this.entities = [];
        this.platformsEl = el.find('.platforms');
        this.entitiesEl = el.find('.entities');
        this.worldEl = el.find('.world');
        this.gameOvEl = el.find('.gameOver');
        this.isPlaying = false;
        this.gameScore = 0;
        this.level = 1;

        this.sound = new Howl({
            urls: ['/sounds/jump.mp3', '/sounds/jump.ogg']
        })

        // Cache a bound onFrame since we need it each frame.
        this.onFrame = this.onFrame.bind(this);
    };

    Game.prototype.freezeGame = function() {
        this.isPlaying = false;
    };

    Game.prototype.unFreezeGame = function() {
        if (!this.isPlaying) {
            this.isPlaying = true;

            // Restart the onFrame loop
            this.lastFrame = +new Date() / 1000;
            requestAnimFrame(this.onFrame);
        }
    };


    Game.prototype.createWorld = function() {
        // Ground
        for(i=0;i<150-this.level*2;i++){
            //console.log(this.level(this.level));
            this.addPlatform(new Platform({
                x: (Math.random()*1000*423)% 300,
                y: (Math.random()*1000*593)%6200,
                width: 80,
                height: 10
            }));
        }

        for (i=0;i<2+this.level;i++){
            var mod = (Math.random()*1000*423)%400;
            var modY = (Math.random()*1000*423)%6000;
            this.addEnemy(new Enemy({
                start: {x: mod, y: modY},
                end: {x: mod-150, y: modY-100}
            }));
        }

        this.addPlatform(new Platform({
            x: 90,
            y: 5900,
            width: 600,
            height: 10
        }));
    };

    Game.prototype.addPlatform = function(platform) {
        this.entities.push(platform);
        this.platformsEl.append(platform.el);
    };

    Game.prototype.addEnemy = function(enemy) {
        this.entities.push(enemy);
        this.entitiesEl.append(enemy.el);
    };

    Game.prototype.gameOver = function() {
        this.freezeGame();

        if (this.gameScore === 0){
            alert('Game Over! Score: ' + Math.floor(this.player.maxScore));
        }
        else{
            alert('Game Over! Score: ' + (this.gameScore+ Math.floor(this.player.maxScore)));
        }
        this.gameScore = 0;
        this.level = 1;

        var game = this;
        setTimeout(function() {
            game.start();
        }, 0);
    };

    Game.prototype.levelOver = function() {
        this.freezeGame();
        this.gameScore += Math.floor(this.player.maxScore);
        this.level += 1;

        alert('Level Complete! Your Score now : ' + this.gameScore);

        var game = this;
        setTimeout(function() {
            game.start();
        }, 0);
    };

    /**
     * Runs every frame. Calculates a delta and allows each game entity to update itself.
     */
    Game.prototype.onFrame = function() {
        if (!this.isPlaying) {

            return;
        }

        var now = +new Date() / 1000,
            delta = now - this.lastFrame;
        this.lastFrame = now;

        controls.onFrame(delta);
        this.player.onFrame(delta);

        for (var i = 0, e; e = this.entities[i]; i++) {
            e.onFrame(delta);

            if (e.dead) {
                this.entities.splice(i--, 1);
            }
        }

        this.updateViewport();

        // Request next frame.
        requestAnimFrame(this.onFrame);
    };

    Game.prototype.updateViewport = function() {
        var minY = this.viewport.y + VIEWPORT_PADDING;
        var maxY = this.viewport.y + this.viewport.height ;

        //var minX = this.viewport.x + VIEWPORT_PADDING;
        //var maxX = this.viewport.x + this.viewport.width - VIEWPORT_PADDING;

        var playerY = this.player.pos.y;
        var playerX = this.player.pos.x;

        // Update the viewport if needed.
        /*if (playerX < minX) {
            this.viewport.x = playerX - VIEWPORT_PADDING;
        } else if (playerX > maxX) {
            this.viewport.x = playerX - this.viewport.width + VIEWPORT_PADDING;
        }*/


        if (playerY < minY) {
            this.viewport.y = playerY - VIEWPORT_PADDING;
        } else if (playerY > maxY) {
            this.viewport.y = playerY - this.viewport.height ;
        }


        this.worldEl.css({
            left: -this.viewport.x,
            top: -this.viewport.y
        });


    };

    /**
     * Starts the game.
     */
    Game.prototype.start = function() {
        // Cleanup last game.
        this.entities.forEach(function(e) { e.el.remove(); });
        this.entities = [];

        // Set the stage.
        this.createWorld();
        this.player.reset();
        this.viewport = {x: 0, y: 0, width: 400, height: 500};

        // Then start.
        this.unFreezeGame();
    };

    Game.prototype.forEachPlatform = function(handler) {
        for (var i = 0, e; e = this.entities[i]; i++) {
            if (e instanceof Platform) {
                handler(e);
            }
        }
    };

    Game.prototype.forEachEnemy = function(handler) {
        for (var i = 0, e; e = this.entities[i]; i++) {
            if (e instanceof Enemy) {
                handler(e);
            }
        }
    };

    /**
     * Cross browser RequestAnimationFrame
     */
    var requestAnimFrame = (function() {
        return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function(/* function */ callback) {
                window.setTimeout(callback, 1000 / 60);
            };
    })();

    return Game;
});