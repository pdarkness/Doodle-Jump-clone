/**
 * Created with JetBrains WebStorm.
 * User: knuturm
 * Date: 10.9.2013
 * Time: 14:29
 * To change this template use File | Settings | File Templates.
 */
define(function(rect) {

    var Coin = function(rect) {
        this.rect = rect;
        this.rect.right = rect.x + rect.width;

        this.el = $('<div class="coin">');
        this.el.css({
            left: rect.x,
            top: rect.y,
            width: rect.width,
            height: rect.height
        });
    };

    Coin.prototype.onFrame = function() {}

    return Coin;
});
