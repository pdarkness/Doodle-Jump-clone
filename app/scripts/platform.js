/**
 * Created with JetBrains WebStorm.
 * User: knuturm
 * Date: 29.8.2013
 * Time: 17:29
 * To change this template use File | Settings | File Templates.
 */
/*global define */

define(function(rect) {

    var Platform = function(rect) {
        this.rect = rect;
        this.rect.right = rect.x + rect.width;

        this.el = $('<div class="platform">');
        this.el.css({
            left: rect.x * 0.8,
            top: rect.y,
            width: rect.width,
            height: rect.height
        });
    };

    Platform.prototype.onFrame = function() {}

    return Platform;
});
