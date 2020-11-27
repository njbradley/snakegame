

class Level {
	
	constructor(game, canvas, name, subtitle, points, goalpoints, snakes, goalsnake) {
		this.points = points;
		this.goalpoints = goalpoints;
		this.snakes = snakes;
		this.goalsnake = goalsnake;
		this.allsnakes = [...snakes];
		if (goalsnake != null) {
			this.allsnakes.push(goalsnake);
		}
		this.heldsnake = null;
		this.canvas = canvas;
		this.name = name;
		this.subtitle = subtitle;
		this.game = game;
	}
	
	startLevel() {
		this.canvas.onmousedown = (event) => {this.onClick(event)};
		this.canvas.onmouseup = (event) => {this.onUnClick(event)};
		this.canvas.onmousemove = (event) => {this.onMouseMove(event)};
		this.render();
	}
	
	onClick(event) {
		var used = false;
		const [x,y] = screenToWorld(event.offsetX, event.offsetY);
		for (let snake of this.allsnakes) {
			var node = snake.points[0];
			const dist = (x-node.x)*(x-node.x) + (y-node.y)*(y-node.y);
			if (dist < 0.5) {
				this.heldsnake = snake;
				used = true;
			}
		}
		return used;
	}
	
	onUnClick(event) {
		this.heldsnake = null;
	}
	
	onMouseMove(event) {
		if (this.heldsnake != null) {
			const [x,y] = screenToWorld(event.offsetX, event.offsetY);
			var node = this.heldsnake.points[0];
			var backNode = this.heldsnake.points[1];
			const nodeDist = (x-node.x)*(x-node.x) + (y-node.y)*(y-node.y);
			const backDist = (x-backNode.x)*(x-backNode.x) + (y-backNode.y)*(y-backNode.y);
			var closestFrontNode = null;
			var closestDist = 10000;
			for (let n of node.sides) {
				if (n != backNode) {
					const dist = (x-n.x)*(x-n.x) + (y-n.y)*(y-n.y);
					if (closestFrontNode == null || dist < closestDist) {
						closestDist = dist;
						closestFrontNode = n;
					}
				}
			}
			if (backDist < nodeDist && backDist < closestDist) {
				this.heldsnake.moveBack();
				this.render();
				this.checkVictory();
			}
			if (closestDist < nodeDist && closestDist < backDist) {
				this.heldsnake.moveForward(closestFrontNode);
				this.render();
				this.checkVictory();
			}
			return true;
		}
		return false;
	}
	
	render() {
		const ctx = this.canvas.getContext('2d');
		ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		
		ctx.lineWidth = 5;
		
		for (let node of this.goalpoints) {
			ctx.strokeStyle = "#009900";
			node.renderLine(ctx);
		}
		for (let node of this.points) {
			ctx.strokeStyle = "#777777";
			node.renderLine(ctx);
		}
		
		for (let node of this.goalpoints) {
			ctx.fillStyle = "#009900";
			node.render(ctx);
		}
		for (let node of this.points) {
			ctx.fillStyle = "#777777";
			node.render(ctx);
		}
		
		for (let snake of this.snakes) {
			ctx.strokeStyle = "#990000";
			ctx.fillStyle = "#990000";
			snake.render(ctx);
		}
		
		if (this.goalsnake != null) {
			ctx.strokeStyle = "#009900";
			ctx.fillStyle = "#009900";
			this.goalsnake.render(ctx);
		}
	}
	
	checkVictory() {
		if (this.goalsnake != null && this.goalpoints.length > 0) {
			for (let node of this.goalpoints) {
				if (node.snake != this.goalsnake) {
					return;
				}
			}
			this.game.endLevel();
		}
	}
	
	isNodeEmpty(node) {
		for (let snake of this.allsnakes) {
			if (snake.points.includes(node)) {
				return false;
			}
		}
		return true;
	}
}

function levelToString(level) {
	var allpoints = level.points.concat(level.goalpoints)
	var poses = [];
	for (let node of allpoints) {
		poses.push([node.x, node.y]);
	}
	var links = [];
	for (let node of allpoints) {
		let ls = [];
		for (let nextnode of node.sides) {
			ls.push(allpoints.indexOf(nextnode));
		}
		links.push(ls);
	}
	let goalIndex = level.points.length;
	var snakes = []
	for (let snake of level.allsnakes) {
		let poses = [];
		for (let node of snake.points) {
			poses.push(allpoints.indexOf(node));
		}
		snakes.push(poses);
	}
	var obj = {
		name: level.name,
		subtitle: level.subtitle,
		poses: poses,
		links: links,
		goalIndex: goalIndex,
		snakes: snakes,
	};
	return JSON.stringify(obj);
}

function levelFromString(str) {
	var {name, subtitle, poses, links, goalIndex, snakes} = JSON.parse(str);
	
	var points = [];
	for (let pos of poses) {
		points.push(new BoardPoint(pos[0], pos[1]));
	}
	
	for (let [i,j] of links) {
		points[i].addNeighbor(points[j]);
		points[j].addNeighbor(points[i]);
	}
	
	var snakeObjs = [];
	for (let snakePoses of snakes) {
		let snakePoints = [];
		for (let i of snakePoses) {
			snakePoints.push(points[i]);
		}
		snakeObjs.push(new Snake(snakePoints));
	}
	return [name, subtitle, points.slice(0, goalIndex), points.slice(goalIndex), snakeObjs.slice(snakeObjs.length-1), snakeObjs.pop()];
}


function levelToBase64(level) {
	let data = [];
	data.push(level.points.length);
	data.push(level.goalpoints.length);
	let allpoints = level.points.concat(level.goalpoints);
	for (let point of allpoints) {
		data.push(Math.round(point.x*16));
		data.push(Math.round(point.y*16));
		data.push(point.sides.length);
		for (let opoint of point.sides) {
			let index = allpoints.indexOf(opoint);
			data.push(index);
		}
	}
	data.push(level.allsnakes.length);
	for (let snake of level.allsnakes) {
		data.push(snake.points.length);
		for (let point of snake.points) {
			data.push(allpoints.indexOf(point));
		}
	}
	const str = String.fromCharCode(...data);
	const base64 = btoa(str).replaceAll('=','');
	return base64
}

function levelFromBase64(base64) {
	while (base64.length % 3 != 0) {
		base64 += '=';
	}
	console.log(base64);
	const str = atob(base64);
	let data = [];
	for (let i = 0; i < str.length; i ++) {
		data.push(str.charCodeAt(i));
	}
	let pointslen = data[0];
	let goalslen = data[1];
	let points = [];
	let index = 2;
	for (let i = 0; i < pointslen + goalslen; i ++) {
		points.push(new BoardPoint(data[index]/16.0, data[index+1]/16));
		index += 3 + data[index+2];
	}
	
	index = 2;
	for (let i = 0; i < pointslen + goalslen; i ++) {
		let numSides = data[index+2];
		index += 3;
		for (let j = 0; j < numSides; j ++) {
			points[i].addNeighbor(points[data[index]]);
			index ++;
		}
	}
	
	let snakes = [];
	let numSnakes = data[index];
	index ++;
	for (let i = 0; i < numSnakes; i ++) {
		let snakePoints = [];
		let numSnakePoints = data[index];
		index ++;
		for (let j = 0; j < numSnakePoints; j ++) {
			snakePoints.push(points[data[index]]);
			index ++;
		}
		snakes.push(new Snake(snakePoints));
	}
	
	return ["Custom Level", "", points.slice(0,pointslen), points.slice(pointslen), snakes.slice(0,snakes.length-1), snakes.pop()];
}
