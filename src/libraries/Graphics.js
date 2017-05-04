/*
 * Copyright (C) 2012 Legend Chen.  All rights reserved.
 */
var gdi;

var Graphics = (function(){
    
    var style = document.createElement("style"),
    styleText = "body {position:absolute; top:0; left:0; right:0; bottom:0;}";
    style.type = 'text/css';
    style.appendChild(document.createTextNode(styleText));
    document.getElementsByTagName('head')[0].appendChild(style);
    

    function Graphics(clientWidth, clientHeight)
    {
        var _this = this;
        _this.width = clientWidth;
        _this.height = clientHeight;

        var canvas = document.createElement("canvas");
        canvas.width = clientWidth;
        canvas.height = clientHeight;

        var context = canvas.getContext("2d")
        context.imageSmoothingEnabled = false;

        _this._centerX = clientWidth >> 1,
        _this._centerY = clientHeight >> 1

        //initialize a working canvas to draw Graphics
        _this._context = context;
        _this._canvas = canvas;
    };

    var __proto__ = Graphics.prototype;

    /**
     * Specifies an available fill that subsequent calls to other Graphics methods (such as lineTo() or drawCircle()) use when drawing.
     */
    __proto__.begin = function(fill, alpha)
    {
        var _this = this;
        _this._context.beginPath();
        return _this;
    }

    __proto__.end = function(fill, alpha)
    {
        var _this = this;
        _this._context.closePath();
        return _this;
    }

    /**
     * Applies a fill to the lines and curves that were added.
     */
    __proto__.stroke = function(strokeStyle, thickness)
    {
        var _this = this;
        _this._context.strokeStyle = strokeStyle;
        _this._context.lineWidth = thickness;
        //this._context.globalAlpha = fillAlpha || 1;
        _this._context.stroke();
        
        return this;
    }
    
    __proto__.fill = function(fillStyle, thickness)
    {
        var _this = this;
        
        _this._context.fillStyle = fillStyle;
        _this._context.fill();
        return _this;
    }

    __proto__.drawClosedShape = function (points)
    {
        var _this = this;

        _this._context.moveTo(points[0].x + _this._centerX, -points[0].y + _this._centerY);
        
        for (var p = 1; p < points.length; p++)
            _this._context.lineTo(points[p].x + _this._centerX, -points[p].y + _this._centerY);
        
        _this._context.lineTo(points[0].x + _this._centerX, -points[0].y + _this._centerY);
        _this._context.closePath();
    }

    __proto__.clear = function ()
    {
        var _this = this;

        _this._context.clearRect(0, 0, _this._context.canvas.width, _this._context.canvas.height);
        return _this;
    }

    __proto__.drawCircle = function (x, y, size)
    {
        var _this = this;

        // _this._context.beginPath();
        _this._context.arc(x + _this._centerX, -y + _this._centerY, size, 0, Math.PI * 2, false);
        // _this._context.stroke();

        return _this;
    }

    __proto__.drawLine = function (a, b)
    {
        var _this = this;

        // _this._context.beginPath();
        _this._context.moveTo(a.x + _this._centerX, -a.y + _this._centerY);
        _this._context.lineTo(b.x + _this._centerX, -b.y + _this._centerY);
        // _this._context.stroke();

        return _this;
    }

    // {
    //     var _this = this;

    //     var minX = maxX = points[0].x, minY = maxY = points[0].y;
    //     for (var p = 1; p < points.length; p++)
    //     {
    //         if (points[p].x < minX) minX = points[p].x;
    //         else if (points[p].x > maxX) maxX = points[p].x;
            
    //         if (points[p].y < minY) minY = points[p].y;
    //         else if (points[p].y > maxY) maxY = points[p].y;
    //     }
    //     _this._context.clearRect(minX, minY, maxX - minX, maxY - minY);
    //     return _this;
    // }

    return Graphics;
})();