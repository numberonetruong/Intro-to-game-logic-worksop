/*
* Name: IEEE tech committee
*
* File: gamelogic.js
*
* Description: program contains the logic of our two player pong
  game using javascript. The below functions include how the pong
  objects and variables interact through collisions, movement, and
  animations.
*/

window.requestAnimFrame = (function(callback) {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
    function(callback) {
        window.setTimeout(callback, 1000 / 60);
    };
})();

var cvs_width = 400, cvs_height = 500;
var ball = {x:cvs_width / 2, y:cvs_height / 2 , radius:20, dir_x:1, dir_y:1, speed:3};
var obs_1 = {
    x:      100,
    y:      150,
    left:   0, // update later
    right:  0, // update later
    top:    0, // update later
    bottom: 0, // update later
    width:  105,
    height: 30,
    dir:    1, // up down direction
    speed:  2
    };
var obs_2 = {
    x:      300,
    y:      350,
    left:   0, // update later
    right:  0, // update later
    top:    0, // update later
    bottom: 0, // update later
    width:  105,
    height: 30,
    dir:    -1, // up down direction
    speed:  2
    };
var obstacles = [obs_1, obs_2];
var keeper_1 = {
    x:      cvs_width / 2,
    y:      15,
    left:   0, // update later
    right:  0, // update later
    top:    0, // update later
    bottom: 0, // update later
    width:  105,
    height: 30,
    dir:    0, // left right direction
    speed:  8
    };
var keeper_2 = {
    x:      cvs_width / 2,
    y:      cvs_height - 15,
    left:   0, // update later
    right:  0, // update later
    top:    0, // update later
    bottom: 0, // update later
    width:  105,
    height: 30,
    dir:    0, // left right direction
    speed:  8
    };
var keepers = [keeper_1, keeper_2];
var score = [0, 0];
var delay = 100;

var ws = null;
var ctx = null;

function init()
{
    var width = window.innerWidth;
    var height = window.innerHeight;

    var ratio_x = (width - 105) / (cvs_width);
    var ratio_y = (height - 200) / cvs_height;
    var ratio = (ratio_x < ratio_y) ? ratio_x : ratio_y;

    cvs_width *= ratio;
    cvs_height *= ratio;

    var canvas = document.getElementById("remote");
    canvas.width = cvs_width + 105;
    canvas.height = cvs_height;

    ctx = canvas.getContext("2d");
    ctx.translate(105, 0);
    ctx.lineWidth = 4;

    for( var i = 0; i < obstacles.length; i++)
    {
        obstacles[i].x *= ratio;
        obstacles[i].y *= ratio;
        obstacles[i].width *= ratio;
        obstacles[i].height *= ratio;
        obstacles[i].speed *= ratio;
        obstacles[i].left = obstacles[i].x - obstacles[i].width / 2;
        obstacles[i].right = obstacles[i].x + obstacles[i].width / 2;
        obstacles[i].top = obstacles[i].y - obstacles[i].height / 2;
        obstacles[i].bottom = obstacles[i].y + obstacles[i].height / 2;
    }

    for( var i = 0; i < keepers.length; i++)
    {
        keepers[i].x *= ratio;
        keepers[i].y *= ratio;
        keepers[i].width *= ratio;
        keepers[i].height *= ratio;
        keepers[i].speed *= ratio;
        keepers[i].left = keepers[i].x - keepers[i].width / 2;
        keepers[i].right = keepers[i].x + keepers[i].width / 2;
        keepers[i].top = keepers[i].y - keepers[i].height / 2;
        keepers[i].bottom = keepers[i].y + keepers[i].height / 2;
    }

    ball.x *= ratio;
    ball.y *= ratio;
    ball.radius *= ratio;
    ball.speed *= ratio;

    update_view(ctx);
}
function connect_onclick()
{
    if(ws == null)
    {
        var ws_host_addr = "<?echo _SERVER("HTTP_HOST")?>";
        ws = new WebSocket("ws://" + ws_host_addr + "/game", "text.phpoc");
        document.getElementById("ws_state").innerHTML = "CONNECTING";
        ws.onopen = ws_onopen;
        ws.onclose = ws_onclose;
        ws.onmessage = ws_onmessage;
    }
    else
        ws.close();
}
function ws_onopen()
{
    document.getElementById("ws_state").innerHTML = "<font color='blue'>CONNECTED</font>";
    document.getElementById("bt_connect").innerHTML = "Disconnect";
    ws.send("dummy\r\n");
}
function ws_onclose()
{
    document.getElementById("ws_state").innerHTML = "<font color='gray'>CLOSED</font>";
    document.getElementById("bt_connect").innerHTML = "Connect";
    ws.onopen = null;
    ws.onclose = null;
    ws.onmessage = null;
    ws = null;
}
function ws_onmessage(e_msg)
{
    e_msg = e_msg || window.event; // MessageEvent

    console.log(e_msg.data);
    var arr = JSON.parse(e_msg.data);
    keepers[0].dir = parseInt(arr[0]);
    keepers[1].dir = parseInt(arr[1]);
}
function update_view(ctx)
{
    ctx.clearRect(-105, 0, cvs_width, cvs_height);

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, cvs_width, cvs_height);

    ctx.beginPath();
    ctx.moveTo(-105, cvs_height / 2);
    ctx.lineTo(0, cvs_height / 2);
    ctx.stroke();
    ctx.font = "120px Georgia";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    var team_1 = score[0];
    var team_2 = score[1];
    ctx.fillStyle = "#00FF00";
    ctx.fillText(team_1.toString(), -50, cvs_height / 2 - 70);
    ctx.fillStyle = "#0000FF";
    ctx.fillText(team_2.toString(), -50, cvs_height / 2 + 50);

    ctx.fillStyle="#FF0000";
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, 2*Math.PI);
    ctx.fill();

    for( var i = 0; i < obstacles.length; i++)
        ctx.fillRect(obstacles[i].left, obstacles[i].top, obstacles[i].width, obstacles[i].height);

    ctx.fillStyle="#00FF00";
    ctx.fillRect(keeper_1.left, keeper_1.top, keeper_1.width, keeper_1.height);

    ctx.fillStyle="#0000FF";
    ctx.fillRect(keeper_2.left, keeper_2.top, keeper_2.width, keeper_2.height);
}
function collision_detect(object) {
/* the purpose of this function is to compare ball.x and ball.y
   to the position of our pong object.
   We also must compare the x,y distance the ball is to the touch
   distance of the ball
   (Hint: simple conditionals would work!) */

    /* local distance variables initalized here */
    var dist_x = Math.abs(ball.x - object.x);
    var dist_y = Math.abs(ball.y - object.y);
    var TOUCH_DIST_X = ball.radius + object.width / 2;
    var TOUCH_DIST_Y = ball.radius + object.height / 2;


    //#TODO


}
function check_edges() {
/* this function accounts for the edges of our canvas,
think about our cvs_width and cvs_height. What might need
to happen so the ball stays on the grid and the store increments */
/*(Hint: Think about the boundaries of our play canvis, how do we make
   the ball stay on the grid when a collision occurs) */

//#TODO

}
function check_keepers() {
/* This function runs through all of our keeper objects,
checking each one if it had a collision with the ball */
// (Hint: remember your keepers objects are stored in an array)

//#TODO

}
function check_obstacles() {
/* This function runs through all of our obstacle objects,
   checking each one if it had a collision with the ball */
// (Hint: very similiar logic to our check_keepers function)

//#TODO

}
function move_ball() {
/* This function moves our ball based on its x,y componenet direction
along with the speed of the ball */
// (Hint: very simple function that includes ball.x and ball.y)

//#TODO

}
function move_obstacles() {
/* This function runs through the obstacle objects, making them
   move left and right continously */
/* (Hint: This is more complex, try to counter the change in direction of our obstacles
    if the initial direction == 1 or -1) */

//#TODO

}

function move_keepers() {
/* this function runs through the keepers objects and assigns them
movement values. Remember that your keeper should stop when it gets to
cvs_width */
/* (Hint: remember to make a keepers[i].left and keepers[i].right statement
and set it equal to the distance traveled - the keeper width/2) */

// #TODO

}
function animate(ctx) {
/* This function puts all your above functions together to make the game!
think about what would happen if no user input was made. What are the only
things moving in this scenario?
(Hint: your !delay conditional would initiate the movements to start your game,
 what are the functions that you need to call to make the game functional? ) */

    if(ws != null)
    {

    //#TODO

        if(!delay)
        {
            //#TODO
        }
        else
            delay--;

        update_view(ctx);
    }

    // request new frame
    requestAnimFrame(function() {
        animate(ctx);
    });
}

setTimeout(function() {
    animate(ctx);
}, 100);

window.onload = init;
