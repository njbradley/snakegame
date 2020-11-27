/// Copywright Nicholas Bradley 2020 All right reservded
// made for the OMG Game Jam

function linkline(points) {
	for (let i = 0; i < points.length; i ++) {
		if (i < points.length - 1) {
			points[i].addNeighbor(points[i+1]);
		}
		if (i > 0) {
			points[i].addNeighbor(points[i-1]);
		}
	}
}

function link(node1, node2) {
	node1.addNeighbor(node2);
	node2.addNeighbor(node1);
}

function makePoints(poses) {
	var result = [];
	for (let pos of poses) {
		result.push(new BoardPoint(...pos));
	}
	linkline(result);
	return result;
}

function levelFuncFrom64(base64) {
	return () => levelFromBase64(base64);
}

function loadLevelTextbox() {
	game.from64(levelinput.value);
}

function saveLevelTextbox() {
	let txt = levelToBase64(game.level);
	levelinput.value = txt;
	url_p.value = window.location.href + '?lvl=' + encodeURIComponent(txt);
}


var canvas = document.getElementById("screen");
var title = document.getElementById("title");
var subtitle = document.getElementById("subtitle");
var nextbutton = document.getElementById("next");
var resetbutton = document.getElementById("reset");
var editbar = document.getElementById("editbar");
var levelinput = document.getElementById("levelinput");
var url_p = document.getElementById("url_p");



var level1 = () => {
	var points = makePoints([[5.25,5.25],[5,6],[5,7],[5,8]]);
	var goalpoints = makePoints([[6,5],[7,5],[8,5]]);
	
	link(points[0], goalpoints[0]);
	
	return [
		"Easy peasy",
		"Hello there! Thanks for playing my game! Lets get right into it. " +
		"The green circles are a snake. Click the bigger circle (the head) " +
		"to move it. Drag it onto the green section of track to win!",
		points,
		goalpoints,
		[],
		new Snake(points.slice(1)),
	];
}
	
var loopde = () => {
	var points = makePoints([[3.45,7.5],[4.3,7],[5.15,6.5],[6,6],[6.85,5.5],[7.35,4.65],[6.85,3.8],
		[6,3.3],[5.15,3.8],[4.65,4.65],[5.15,5.5]
	]);
	var goal = makePoints([[6.85,6.5],[7.7,7],[8.55,7.5]]);
	
	link(points[3], points[10]);
	link(points[3], goal[0]);
	
	return [
		"Loop de loop",
		"When you are pushing the snake backwards, you don't have any control over " +
		"where it goes. It's kinda like driving in reverse with a trailer. " +
		"Luckily this level works out in your favor!",
		points,
		goal,
		[],
		new Snake(points.slice(0,3)),
	];
}

var loopde2 = () => {
	var points = makePoints([[3.45,7.5],[4.3,7],[5.15,6.5],[6,6],[6.85,5.5],[7.35,4.65],[6.85,3.8],
		[6,3.3],[5.15,3.8],[4.65,4.65],[5.15,5.5]
	]);
	var goal = makePoints([[6.85,6.5],[7.7,7],[8.55,7.5]]);
	
	link(points[3], points[10]);
	link(points[3], goal[0]);
	
	return [
		"Loop de loop",
		"Now try it again, but with another snake in your way! " +
		"Notice that when the red snake blocks the path, the green " +
		"one goes the other way.",
		points,
		goal,
		[new Snake(points.slice(4,7).reverse())],
		new Snake(points.slice(0,3)),
	];
}


var tintersection = () => {
	var points = makePoints([[4,3],[4,4],[4,5],[4,6],[4.25,6.75],[5,6],[5.75,5.25],[6.5,4.5]]);
	var goalpoints = makePoints([[5,7],[6,7],[7,7]]);
	

	link(points[4], goalpoints[0]);
	return ["T troubles",
		"Now lets make things more complicated. Use what you learned last level and " +
		"use this red snake to direct the green one the right way",
		points,
		goalpoints,
		[new Snake(goalpoints.slice(1))],
		new Snake(points.slice(5).reverse())
	];
}

var loopy = () => {
	var points = makePoints([[5.25,4.25],[5,5],[5.25,5.75],[6,6],[6.75,5.75],[7,5],[6.75,4.25],[6,4]]);
	var goalpoints = makePoints([[3,3],[3,4],[3.25,4.75],[4,5]]);
	
	
	link(goalpoints[3], points[1]);
	link(points[0], points[7]);
	
	return [
		"Loopy",
		"Lets add in another loop for you to have fun. Remember, there is a reset button " +
		"in the bottom if you mess up.",
		points,
		goalpoints,
		[new Snake(goalpoints.slice(0,2))],
		new Snake(points.slice(4)),
	];
}

var lottasnakes = () => {
	var bottom = makePoints([[5,1],[4,1],[3,1],[2.15,1.5],[2.15,2.5],[3,3],[4,3],[5,3],
		[6,3],[7,3],[8,3],[8.85,3.3],[9.15,4.15],[8.85,4.9],[8,5.1],[7.2,4.9],[7,4]]);
	var top = makePoints([[5,4],[5,5],[5,6],[5,7],[5,8]]);
	var goalstrech = makePoints([[1,5],[2,5],[3,5],[4,5]]);
	
	link(bottom[16], bottom[9]);
	link(bottom[7], top[0]);
	link(goalstrech[3], top[1]);
	
	var points = bottom.concat(top);
	points.push(goalstrech[3]);
	
	return [
		"Lots of Snakes",
		"Now this is where things get hard. There's a lot going on, so if you are stuck, " +
		"try to take it one step at a time.",
		points,
		goalstrech.slice(0,3),
		[new Snake(bottom.slice(0,6)), new Snake(top.slice(1)), new Snake(goalstrech)],
		new Snake(bottom.slice(14)),
	];
}
	
var nine = () => {
	var points = makePoints([[7,2],[8,2],[8.85,2.5],[8.85,3.5],[8.85,4.5],[8.85,5.5],
		[8.85,6.5],[8.85,7.5],[8,8],[7,8],[6,8],[5,8],[4,8],[3.15,7.5],[3.15,6.5],[3.15,5.5],
		[3.15,4.5],[4,4],[5,4],[6,4],[7,4],[8,4]
	]);
	var inner = makePoints([[5,5],[5,6],[5,7]]);
	var goal = makePoints([[4,2],[5,2],[6,2]]);
	
	link(goal[2], points[0]);
	link(points[21], points[4]);
	link(inner[0], points[18]);
	link(inner[2], points[11]);
	
	return [
		"Big 9",
		"Thats it for my tips, you're on your own now!",
		points.concat(inner),
		goal,
		[new Snake(points.slice(5))],
		new Snake(inner.reverse()),
	];
}


console.log(window.location.search.length);

if (window.location.search.length == 0) {
	var levels = [
		level1,
		loopde,
		loopde2,
		tintersection,
		loopy,
		lottasnakes,
		nine,
	];
} else {
	const urlParams = new URLSearchParams(window.location.search);
	var levels = [levelFuncFrom64(decodeURIComponent(urlParams.get("lvl")))];
}

var game = new Game(canvas, title, subtitle, nextbutton, resetbutton, editbar, levels);
