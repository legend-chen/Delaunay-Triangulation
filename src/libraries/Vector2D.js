/*
 * Copyright (C) 2012 Legend Chen.  All rights reserved.
 */

//var Vector2D = (function(){
    
    var numeric_limits_epsilon = 1E-12;
    
    function Vector2D (a, b)
    {
        var _this = this;
        _this.x = a || 0;
        _this.y = b || 0;
    }
    
    var __proto__  = Vector2D.prototype;

    __proto__.plus = function (v2)
    {
        var _this = this;

        _this.x += v2.x;
        _this.y += v2.y;

        return _this;
    },

    __proto__.minus = function (v2)
    {
        var _this = this;

        _this.x -= v2.x;
        _this.y -= v2.y;

        return _this;
    },
        
    __proto__.multiply = function (n)
    {
        var _this = this;

        _this.x *= n;
        _this.y *= n;

        return _this;
    },
    
    __proto__.divide = function (n)
    {
        var _this = this;
        _this.x /= n;
        _this.y /= n;

        return _this;
    },

    __proto__.dot = function (v2)
    {
        return this.x * v2.x + this.y * v2.y;
    },

    __proto__.cross = function (v2)
    {
        return this.x * v2.y - this.y * v2.x;
    }

    // returns the length of a 2D vector
    __proto__.Length = function ()
    {
        var _this = this;
        return Math.sqrt(_this.x * _this.x + _this.y * _this.y);
    }

    // returns the squared length of a 2D vector
    __proto__.LengthSq = function ()
    {
        var _this = this;
        return _this.x * _this.x + _this.y * _this.y;
    }

    __proto__.Sign = function(v1, v2)
    {
        return v1.x * v2.y > v1.y * v2.x;
    }
    // sets x and y to zero
    __proto__.Zero = function ()
    {
        var _this = this;
        _this.x = 0;
        _this.y = 0;
        return _this;
    }

    __proto__.Clone = function ()
    {
        return new Vector2D(this.x, this.y);
    }

    __proto__.Copy = function (v2)
    {
        var _this = this;
        _this.x = v2.x;
        _this.y = v2.y;
        return _this;
    }

    // normalizes a 2D Vector
    __proto__.Normalize = function()
    {
        var _this = this;
        var vector_length = _this.Length();
    
        if (vector_length > numeric_limits_epsilon)
        {
            _this.x /= vector_length;
            _this.y /= vector_length;
        }
        
        return _this;
    }

    // truncates a vector so that its length does not exceed max
    __proto__.Truncate = function (max)
    {
        var _this = this;
        if (_this.Length() > max)
        {
            _this.Normalize();
            _this.multiply(max);
        }
        
        return _this;
    }

    __proto__.Perp = function ()
    {
        return new Vector2D(-this.y, this.x);
    }

    __proto__.toString = function ()
    {
        return "[" + this.x + ", " + this.y + "]";
    }
    
//    return Vector2D;
//    
//})();
//Vector2D.prototype.__proto__ = Vector.prototype

function Vec2DNormalize (vec)
{
	var vector_length = vec.Length();
	
	if (vector_length > numeric_limits_epsilon)
	{
		vec.x /= vector_length;
		vec.y /= vector_length;
	}
	
	return vec;
}

function Vec2DDistance (v1, v2)
{
	var ySeparation = v2.y - v1.y;
	var xSeparation = v2.x - v1.x;
	
	return Math.sqrt(ySeparation*ySeparation + xSeparation*xSeparation);
}

function Vec2DDistanceSq (v1, v2)
{
	var ySeparation = v2.y - v1.y;
	var xSeparation = v2.x - v1.x;
	
	return ySeparation*ySeparation + xSeparation*xSeparation;
}

function Vec2DSign (v1, v2)
{
    return v1.x * v2.y > v1.y * v2.x;
}