/**
 * Created by legend on 17/01/25.
 */
/*
 * Copyright (C) 2012 Legend Chen.  All rights reserved.
 */
function trace()
{
    console.log.apply(null, arguments);
}

(function (){
    var style = document.createElement("style"),
    styleText = "body {position:absolute; top:0; left:0; right:0; bottom:0; cursor:default}";
    style.type = 'text/css';
    style.appendChild(document.createTextNode(styleText));
    document.getElementsByTagName('head')[0].appendChild(style);
    
    function onReady()
    {
        var clientWidth = document.body.offsetWidth;
        var clientHeight = document.body.offsetHeight;

        //initialize a working canvas to draw Graphics
        stage =
        {
            // canvas: canvas, 
            // graphics: context,
            graphics: new Graphics(clientWidth, clientHeight),
            clientWidth: clientWidth,
            clientHeight: clientHeight,
            centerX: clientWidth >> 1,
            centerY: clientHeight >> 1
        };

        var device = stage.graphics;

        document.body.appendChild(device._canvas);

        document.body.insertAdjacentHTML("beforeBegin", "<div style=\"position:absolute\">" + clientWidth + " × " + clientHeight + "<br />devicePixelRatio = " + devicePixelRatio + "<div>");
        var info = document.body.firstChild;

        stage.trace = function ()
        {
            var text = Array.prototype.slice.call(arguments).toString();
            info.insertAdjacentHTML("beforeEnd", 
"<pre style=font-family:'Monaco';line-height:12px;font-size:12px>" + text + "</pre>");
        
        }

        stage.clear = function ()
        {
            var text = Array.prototype.slice.call(arguments).toString();
            info.innerHTML = "";
        }
    }
    
    window.addEventListener("DOMContentLoaded", onReady);

})();


var stage;
var pVectorsArray = [];

(function(){
        
    var PerfCountFreq   = 30
    var TimeScale       = 1 / PerfCountFreq

    var dBoundarySize       = 200;
    var dDataNumber = 25;


    function Line2Intersection(VertexA, VertexB, VertexC, VertexD)
    {
        var AB = VertexB.Clone().minus(VertexA).Perp();

        var CA = VertexA.Clone().minus(VertexC);

        var CD = VertexD.Clone().minus(VertexC);
        
        //console.log(VertexC, VertexD)
        return CD.multiply(AB.dot(CA) / AB.dot(CD)).plus(VertexC);
    }
    
    // var data = [[175.52188762428705, -90.73999257909352],[-51.779749739335124, -139.92877100445068],[33, 34],[-144.39896820704485, 73.59129219842],[-61.51028642255456, 195.74520438742863],[-9.587089529974246, -53.78889361661621],[-3.5152605782547752, 122.6301823369484],[-30.849419790496402, -149.22702770664563],[118.64728583140965, 58.2693542423927],[-39.923932449343, 9.625782097308377]]
    // dDataNumber = data.length;
    for (var i = 0; i < dDataNumber; i++)
    {
        var pData = new Vector2D((Math.random()*2-1) * dBoundarySize,
            (Math.random()*2-1) * dBoundarySize);
        // pData = new Vector2D(data[i][0], data[i][1]);
        pData.id = i;
        pVectorsArray.push(pData);
    }

    var pBoundaryShape = [new Vector2D(-1, -1),
        new Vector2D(-1, 1),
        new Vector2D(1, 1),
        new Vector2D(1, -1)];
    
    
    pBoundaryShape.forEach(function (vertex)
        {
            vertex.x *= dBoundarySize;
            vertex.y *= dBoundarySize;
        });
    
    var delaunay = new DelaunayTriangulation();

    function onRender (time_elapsed)
    {
        var gdi = stage.graphics;

        var minimum_index = 0;
        pVectorsArray.forEach(function (vertex)
        {
            vertex._spanning = minimum_index++;
            vertex._contour = false;
        });

        delaunay._computeBoundaries(pVectorsArray);
        delaunay._minimumSpanningTree(pVectorsArray);

        gdi.clear();

        // gdi.begin();
        // gdi.drawClosedShape(pBoundaryShape);
        // gdi.stroke("rgb(0,0,0)", 1);
        // gdi.fill("#dad8f9");
        
        // 底色
        gdi.begin();
        gdi.drawClosedShape(delaunay._boundaries.map(function (edge){return edge.a}));
        gdi.fill("#ffd8d8");


        // 边
        delaunay._triangles.forEach(function (tri)
        {
            gdi.begin();
            gdi.drawClosedShape(tri.edges.map(function (edge){return edge.a}));
            gdi.stroke("#fff", 1);

            // gdi.begin();
            // gdi.drawCircle(tri._centerX, tri._centerY, Math.sqrt(tri._radius2));
            // gdi.stroke("#fff", 1);
        });

        // 树形边
        delaunay._tree_edges.forEach(function (edge)
        {
            gdi.begin();
            gdi.drawClosedShape([edge.a, edge.b]);
            gdi.stroke("#f00", 1);
        });

        pVectorsArray.forEach(function (point)
        {
            gdi.begin();
            gdi.drawCircle(point.x, point.y, 3);
            gdi.fill("#fff");
            gdi.stroke("#f00", 1);
        });

        gdi._context.font = "13px Georgia";
        gdi._context.fillStyle = "#ff0000";

        pVectorsArray.forEach(function (point, index)
        {
            gdi.begin();
            gdi.fill("#666", 1);
            gdi._context.fillText(index, point.x + gdi._centerX + 2, -point.y + gdi._centerY - 4);
        });


        
    }
    
    window.addEventListener("load", onReady);
    
    function onReady(stage)
    {
        var last_timestamp;
        isNeedRedrawing = true;

        function draw(timestamp)
        {
            var time_elapsed = (timestamp - last_timestamp) * TimeScale || 0;
            last_timestamp = timestamp;

            if (isNeedRedrawing)
            {
                onRender(time_elapsed);
                isNeedRedrawing = false;
            }
        
            requestAnimationFrame(draw);
        }
        
        requestAnimationFrame(draw);
    }

    var isCaptured;
    var isNeedRedrawing = true;

    var pMouse = new Vector2D();

    var pSelection;


    function convertToCoordinates(point)
    {
        point.x -= stage.centerX;
        point.y -= stage.centerY;
        point.y = -point.y;
    }

    function onMouseDown(event)
    {
        var clientX = event.clientX;
        var clientY = event.clientY;
        var clientRect = document.body.getBoundingClientRect();

        isCaptured = true;

        pMouse.x = clientX - clientRect.left;
        pMouse.y = clientY - clientRect.top;

        convertToCoordinates(pMouse);

        var isSelected = false;

        for (var i=0; i<pVectorsArray.length; i++)
        {
            var point = pVectorsArray[i];

            var x = point.x - pMouse.x;
            var y = point.y - pMouse.y;
            
            if (x*x+y*y<30)
            {
                isSelected = true;
                pSelection = point;
                break;
            }
        }

        if (!isSelected)
        {
            pSelection = pMouse.Clone();
            pVectorsArray.push(pSelection);
        }
        
        isNeedRedrawing = true;

        event.preventDefault();
    }

    function onMouseMove(event)
    {
        if (isCaptured)
        {
            var clientX = event.clientX;
            var clientY = event.clientY;
            var clientRect = document.body.getBoundingClientRect();

            isCaptured = true;

            pMouse.x = clientX - clientRect.left;
            pMouse.y = clientY - clientRect.top;

            convertToCoordinates(pMouse);

            if (pSelection)
            {
                pSelection.x = pMouse.x;
                pSelection.y = pMouse.y;
                isNeedRedrawing = true;
            }
            event.preventDefault();
        }
    }

    function onMouseUp()
    {
        isCaptured = false;
        pSelection = undefined;
        //vOriginalStagePosition.Copy(pStagePosition);
    }

    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("keydown", function (event)
        {
            if (event.keyCode == 68 && event.metaKey)
            {
                disableDefault(event)
//                println("cmd + shirt+ d");
                saveCvs("demo.png", stage.graphics._canvas);
            }
           
        });

    function disableDefault(event)
    {
        event.stopPropagation();
        event.preventDefault();
    };

    function saveCvs (fName, canvas)
    {   
        var url = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");   
        // var url = URL.createObjectURL(new Blob([fBlob], {type:'application/x-download'}));
        var link = document.createElement('a');
        link.href = url;
        link.download = fName;

        var event = document.createEvent('MouseEvents');
        event.initMouseEvent('click');
        link.dispatchEvent(event);
        //URL.revokeObjectURL(url);
    };

})();

// 2015-11-20 foundation of graphics