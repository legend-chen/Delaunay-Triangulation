
function Edge (a, b)
{
    var _this = this;

    _this.a = a;

    _this.b = b;

    _this.id = a.id + "_" + b.id;

    _this.opposite;
}

var __proto__  = Edge.prototype;

__proto__._direction = function (c)
{
    var _this = this;

    var a = _this.a;
    var b = _this.b;

    return (b.x - a.x) * (c.y - b.y) - (b.y - a.y) * (c.x - b.x) < 0;
};

__proto__._computeDistanceSq = function ()
{
    var _this = this;

    var dx = _this.a.x - _this.b.x;
    var dy = _this.a.y - _this.b.y;

    _this._distanceSq = dx*dx+dy*dy;
};

__proto__.toString = function ()
{
    var _this = this;

    return _this.id;
};


function Triangle ()
{
    var _this = this;

    // _this.vertexes = new Array(3);
    _this.edges = new Array(3);
}


var __proto__  = Triangle.prototype;

var EPSILON = 1e-12;

__proto__._circumcircle = function ()
{
    var _this = this;
    var ab = _this.edges[0];
    var bc = _this.edges[1];
    
    var a = ab.a;
    var b = ab.b;
    var c = bc.b;

    var x1 = a.x,
        y1 = a.y,
        x2 = b.x,
        y2 = b.y,
        x3 = c.x,
        y3 = c.y,
        fabsy1y2 = Math.abs(y1 - y2),
        fabsy2y3 = Math.abs(y2 - y3),
        xc, yc, m1, m2, mx1, mx2, my1, my2, dx, dy;

    /* Check for coincident points */
    if(fabsy1y2 < EPSILON && fabsy2y3 < EPSILON)
        throw new Error("Eek! Coincident points!");

    if(fabsy1y2 < EPSILON) {
        m2  = -((x3 - x2) / (y3 - y2));
        mx2 = (x2 + x3) / 2.0;
        my2 = (y2 + y3) / 2.0;
        xc  = (x2 + x1) / 2.0;
        yc  = m2 * (xc - mx2) + my2;
    }

    else if(fabsy2y3 < EPSILON) {
        m1  = -((x2 - x1) / (y2 - y1));
        mx1 = (x1 + x2) / 2.0;
        my1 = (y1 + y2) / 2.0;
        xc  = (x3 + x2) / 2.0;
        yc  = m1 * (xc - mx1) + my1;
    }

    else {
        m1  = -((x2 - x1) / (y2 - y1));
        m2  = -((x3 - x2) / (y3 - y2));
        mx1 = (x1 + x2) / 2.0;
        mx2 = (x2 + x3) / 2.0;
        my1 = (y1 + y2) / 2.0;
        my2 = (y2 + y3) / 2.0;
        xc  = (m1 * mx1 - m2 * mx2 + my2 - my1) / (m1 - m2);
        yc  = (fabsy1y2 > fabsy2y3) ?
            m1 * (xc - mx1) + my1 :
            m2 * (xc - mx2) + my2;
    }

    dx = x2 - xc;
    dy = y2 - yc;

    _this._radius2 = dx*dx+dy*dy;
    _this._centerX = xc;
    _this._centerY = yc;
}

__proto__.toString = function ()
{
    return "[ " + this.edges.toString() + " ]";
}

var DelaunayTriangulation = (function()
{
    function DelaunayTriangulation()
    {
        
    }

    var __proto__ = DelaunayTriangulation.prototype;

    __proto__._minimumSpanningTree = function (points)
    {
        var _this = this;

        var spanning_edges = [];

        _this._triangles.forEach(function (tri)
        {
            tri.edges.forEach(function (edge)
            {
                edge._computeDistanceSq();
                spanning_edges.push(edge);
            });
        });

        spanning_edges.sort(function (a, b)
        {
            if (a._distanceSq > b._distanceSq)
            {
                return 1;
            }
            else (a._distanceSq < b._distanceSq)
            {
                return -1
            }

            return 0;
        });

        var vertexes = points;

        var minimum_edges = [];
        
        spanning_edges.forEach(function (edge)
        {
            if (edge.a._spanning != edge.b._spanning)
            {
                var target_spanning = edge.a._spanning;
                var current_spanning = edge.b._spanning;
                vertexes.forEach(function (vertex)
                {
                    if (vertex._spanning == current_spanning)
                    {
                        vertex._spanning = target_spanning;
                    }
                });
                minimum_edges.push(edge);
            }
        });
                    
        _this._tree_edges = minimum_edges;

    } 

    __proto__._computeBoundaries = function (points)
    {
        var _this = this;

        var contour_edges;
        
        var a = points[0];
        var b = points[1];
        var c = points[2];

        // a._contour = false;
        // b._contour = false;
        // c._contour = false;

        if ((b.x - a.x) * (c.y - b.y) - (b.y - a.y) * (c.x - b.x) < 0)
        {
            contour_edges = [new Edge(c, b), new Edge(b, a), new Edge(a, c)];
        }
        else
        {
            contour_edges = [new Edge(a, b), new Edge(b, c), new Edge(c, a)];
        
        }
        
        for (var j = 3, nVertexNum = points.length; j < nVertexNum; j++)
        {
            var vPoint = points[j];

            // vPoint._contour = false;

            var nContourNum = 0;

            var tmp_contour_edges = [];

            contour_edges.forEach(function (pEdge)
            {
                //在有向线的右边嘛？
                if (pEdge._direction(vPoint))
                {
                    nContourNum++;
                }
                else
                {
                    tmp_contour_edges.push(pEdge);
                }
            });


            if (nContourNum > 0)
            {
                contour_edges = tmp_contour_edges;

                for (var i = 0, nEdgeNum = contour_edges.length; i < nEdgeNum; i++)
                {
                    var pEdgeStart = contour_edges[i];
                    var pEdgeEnd = contour_edges[(i+1)%nEdgeNum];

                    if (pEdgeStart.b != pEdgeEnd.a)
                    {
                        contour_edges.splice(i+1, 0, new Edge(pEdgeStart.b, vPoint), new Edge(vPoint, pEdgeEnd.a));
                        break;
                    }
                }
            }
        }

        _this._boundaries = contour_edges;
        
        var ref_vertexes = [];
        var ref_triangles = [];
        var ref_edges = [];

        contour_edges.forEach(function (edge)
        {
            edge.a._contour = true;
            edge.b._contour = true;
        });
        
        points.forEach(function (point)
        {
            if (!point._contour) ref_vertexes.push(point);
        });
        
        var last_edge = contour_edges[0];
        for (var i = 1, nEdgeNum = contour_edges.length-2; i < nEdgeNum; i++)
        {
            var index_edge = contour_edges[i];
            var new_edge = new Edge(index_edge.b, last_edge.a);
            var opposite_edge = new Edge(last_edge.a, index_edge.b);
            
            new_edge.opposite = opposite_edge;
            opposite_edge.opposite = new_edge;

            var tri1 = new Triangle();
            // triangle.vertexes[0] = new_edge.a;
            // triangle.vertexes[1] = new_edge.b;
            // triangle.vertexes[2] = last_edge.b;

            tri1.edges[0] = new_edge;
            tri1.edges[1] = last_edge;
            tri1.edges[2] = index_edge;

            new_edge.triangle = tri1;
            last_edge.triangle = tri1;
            
            tri1._circumcircle();
            ref_edges.push(new_edge);
            ref_triangles.push(tri1);
            last_edge = opposite_edge;
        }

        if (nEdgeNum > 1)
        {
            var index_edge = contour_edges[i];
            var new_edge = contour_edges[i+1];
            var tri2 = new Triangle();
            // triangle.vertexes[0] = new_edge.a;
            // triangle.vertexes[1] = new_edge.b;
            // triangle.vertexes[2] = last_edge.b;

            tri2.edges[0] = new_edge;
            tri2.edges[1] = last_edge;
            tri2.edges[2] = index_edge;

            last_edge.triangle = tri2;
            new_edge.triangle = tri2;
            tri2._circumcircle();
            ref_triangles.push(tri2);
        }
        
        _this._triangles = ref_triangles;
        
        
        ref_vertexes.forEach(function (point)
        {
            for (var i = 0, nTriNum = ref_triangles.length; i < nTriNum; i++)
            {
                var tri1 = ref_triangles[i];

                if (contain(tri1, point))
                {
                    var ab = tri1.edges[0];
                    var bc = tri1.edges[1];
                    var ca = tri1.edges[2];
                    
                    var a = ab.a;
                    var b = ab.b;
                    var c = ca.a;
                    
                    var tri2 = new Triangle();
                    var tri3 = new Triangle();
                    
                    var da = new Edge(point, a);
                    var ad = new Edge(a, point);
                    da.opposite = ad;
                    ad.opposite = da;

                    var db = new Edge(point, b);
                    var bd = new Edge(b, point);
                    db.opposite = bd;
                    bd.opposite = db;
                    
                    var dc = new Edge(point, c);
                    var cd = new Edge(c, point);
                    dc.opposite = cd;
                    cd.opposite = dc;
                    
                    tri1.edges[0] = dc;
                    tri1.edges[1] = ca;
                    tri1.edges[2] = ad;
                    ca.triangle = tri1;
                    dc.triangle = tri1;
                    ad.triangle = tri1;
                    
                    tri2.edges[0] = da;
                    tri2.edges[1] = ab;
                    tri2.edges[2] = bd;
                    ab.triangle = tri2;
                    da.triangle = tri2;
                    bd.triangle = tri2;
                    
                    tri3.edges[0] = db;
                    tri3.edges[1] = bc;
                    tri3.edges[2] = cd;
                    bc.triangle = tri3;
                    db.triangle = tri3;
                    cd.triangle = tri3;

                    ref_edges.push(bd);
                    ref_edges.push(ad);
                    ref_edges.push(cd);

                    tri1._circumcircle();
                    tri2._circumcircle();
                    tri3._circumcircle();
                    
                    ref_triangles.push(tri2);
                    ref_triangles.push(tri3);

                    break;
                }
            }
        });

        flag = true;
        var count = 0;
        while(flag)
        {
            flag = false;
            ref_edges.forEach(optimise);
            count++;
        }
        trace(count)
        // ref_edges.forEach(optimise);
        // ref_edges.forEach(optimise);
    }

    function contain(triangle, point)
    {
        for (var i = 0, nEdgeNum = triangle.edges.length; i < nEdgeNum; i++)
        {
            var edge = triangle.edges[i];
            if (edge._direction(point)) 
                return false;
        }
        return true;
    }
    
    var flag = 0; 

    function optimise(edge)
    {
        var opposite_edge = edge.opposite;
        if (opposite_edge == undefined) return;
        var tri1 = edge.triangle;
        var tri2 = opposite_edge.triangle;

        var a, b, c, d;

        if (tri1.edges[0] == edge)
        {
            a = tri1.edges[1]; b = tri1.edges[2];
        }
        else if (tri1.edges[1] == edge)
        {
            a = tri1.edges[2]; b = tri1.edges[0];
        }
        else if (tri1.edges[2] == edge)
        {
            a = tri1.edges[0]; b = tri1.edges[1];
        }

        if (tri2.edges[0] == opposite_edge)
        {
            c = tri2.edges[1]; d = tri2.edges[2];
        }
        else if (tri2.edges[1] == opposite_edge)
        {
            c = tri2.edges[2]; d = tri2.edges[0];
        }
        else if (tri2.edges[2] == opposite_edge)
        {
            c = tri2.edges[0]; d = tri2.edges[1];
        }
        
        if (tri1._radius2 > (c.b.x - tri1._centerX)*(c.b.x - tri1._centerX)+(c.b.y - tri1._centerY)*(c.b.y - tri1._centerY) || 
            tri2._radius2 > (a.b.x - tri2._centerX)*(a.b.x - tri2._centerX)+(a.b.y - tri2._centerY)*(a.b.y - tri2._centerY))
        {
            flag = true
            edge.a = a.b;
            edge.b = c.b;
            
            a.triangle = tri1;
            d.triangle = tri1;
            c.triangle = tri2;
            b.triangle = tri2;
            
            opposite_edge.a = c.b;
            opposite_edge.b = a.b;

            // tri1.vertexes[0] = edge.a;
            // tri1.vertexes[1] = edge.b;
            // tri1.vertexes[2] = a.a;

            tri1.edges[0] = edge;
            tri1.edges[1] = d;
            tri1.edges[2] = a;
            tri1._circumcircle();

            // tri2.vertexes[0] = opposite_edge.a;
            // tri2.vertexes[1] = opposite_edge.b;
            // tri2.vertexes[2] = c.a;

            tri2.edges[0] = opposite_edge;
            tri2.edges[1] = b;
            tri2.edges[2] = c;
            tri2._circumcircle();
        }

    }
    return DelaunayTriangulation;

})();
