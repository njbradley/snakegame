/// Copywright Nicholas Bradley 2020 All right reservded
// made for the OMG Game Jam

function screenToWorld(x, y) {
	return [x/40, (500-y)/40];
}

function worldToScreen(x, y) {
	return [x*40, 500-y*40];
}



class BoardPoint {
	
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.sides = [];
		this.snake = null;
	}
	
	addNeighbor(node) {
		this.sides.push(node);
	}
	
	nextPoint(lastnode) {
		var dirx = this.x - lastnode.x;
		var diry = this.y - lastnode.y;
		const len = Math.sqrt(dirx*dirx + diry*diry);
		dirx /= len;
		diry /= len;
		var maxDot;
		var bestNode = null;
		var secondNode = null;
		var secondDot;
		for (let node of this.sides) {
			if (node != lastnode && node.snake == null) {
				var odirx = node.x - this.x;
				var odiry = node.y - this.y;
				const olen = Math.sqrt(odirx*odirx + odiry*odiry);
				odirx /= olen;
				odiry /= olen;
				const dotprod = dirx * odirx + diry * odiry;
				if (bestNode == null || dotprod > maxDot) {
					secondNode = bestNode;
					secondDot = maxDot;
					bestNode = node;
					maxDot = dotprod;
				} else if (bestNode == null || dotprod == maxDot) {
					bestNode = secondNode;
					maxDot = secondDot;
				}
			}
		}
		return bestNode;
	}
	
	renderLine(ctx) {
		const [x,y] = worldToScreen(this.x, this.y);
		for (let other of this.sides) {
			const [ox,oy] = worldToScreen(other.x, other.y);
			ctx.beginPath();
			ctx.moveTo(x,y);
			ctx.lineTo(ox,oy);
			ctx.stroke();
		}
	}
	
	render(ctx) {
		const [x,y] = worldToScreen(this.x, this.y);
		ctx.beginPath();
		ctx.arc(x, y, 7, 0, 2 * Math.PI);
		ctx.fill();
	}
}


class Snake {
	
	constructor(points) {
		this.points = points;
		for (let node of points) {
			node.snake = this;
		}
	}
	
	moveForward(nextnode) {
		if (nextnode.snake == null) {
			this.points.unshift(nextnode);
			this.points.pop().snake = null;
			nextnode.snake = this;
		}
	}
	
	moveBack() {
		let nextpoint = this.points[this.points.length - 1].nextPoint(this.points[this.points.length - 2]);
		if (nextpoint != null && nextpoint.snake == null) {
			this.points.push(nextpoint);
			this.points.shift().snake = null;
			nextpoint.snake = this;
		}
	}
	
	render(ctx) {
		let first = true;
		var lastPos = null;
		for (let point of this.points) {
			const [x,y] = worldToScreen(point.x, point.y);
			if (first) {
				ctx.beginPath();
				ctx.arc(x, y, 12, 0, 2 * Math.PI);
				ctx.lineWidth = 10;
				ctx.stroke();
				first = false;
			} else {
				ctx.beginPath();
				ctx.arc(x, y, 8, 0, 2 * Math.PI);
				ctx.lineWidth = 4;
				ctx.stroke();
				ctx.beginPath();
				var [dirx, diry] = [x - lastPos[0], y - lastPos[1]];
				var dist = Math.sqrt(dirx*dirx + diry*diry);
				dirx /= dist;
				diry /= dist;
				const off = 8;
				ctx.moveTo(lastPos[0] + dirx * off, lastPos[1] + diry * off);
				ctx.lineTo(x - dirx * off, y - diry * off);
				ctx.lineWidth = 12;
				ctx.stroke();
			}
			lastPos = [x,y];
		}
	}
}


class Level {
	
	constructor(game, canvas, name, subtitle, points, goalpoints, snakes, goalsnake) {
		this.points = points;
		this.goalpoints = goalpoints;
		this.snakes = snakes;
		this.goalsnake = goalsnake;
		this.allsnakes = [...snakes];
		this.allsnakes.push(goalsnake);
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
		const [x,y] = screenToWorld(event.offsetX, event.offsetY);
		for (let snake of this.allsnakes) {
			var node = snake.points[0];
			const dist = (x-node.x)*(x-node.x) + (y-node.y)*(y-node.y);
			if (dist < 0.5) {
				this.heldsnake = snake;
			}
		}
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
		}
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
		
		ctx.strokeStyle = "#009900";
		ctx.fillStyle = "#009900";
		this.goalsnake.render(ctx);
	}
	
	checkVictory() {
		for (let node of this.goalpoints) {
			if (node.snake != this.goalsnake) {
				return;
			}
		}
		this.game.endLevel();
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

class Game {
	
	constructor(canvas, title, subtitle, nextbutton, resetbutton, levels) {
		this.nextbutton = nextbutton;
		nextbutton.onclick = () => {this.nextLevel()};
		resetbutton.onclick = () => {this.startLevel()};
		this.title = title;
		this.subtitle = subtitle;
		this.levels = levels;
		this.levelindex = 0;
		this.canvas = canvas;
		this.startLevel();
	}
	
	startLevel() {
		this.level = new Level(this, this.canvas, ...( this.levels[this.levelindex]() ));
		this.title.innerText = this.level.name;
		this.subtitle.innerText = this.level.subtitle;
		nextbutton.disabled = true;
		this.level.startLevel();
	}
	
	endLevel() {
		nextbutton.disabled = false;
		this.title.innerText = "Level Complete!";
		this.subtitle.innerText = "Well done!";
	}
	
	nextLevel() {
		if (this.levelindex >= this.levels.length-1) {
			this.title.innerText = "Well Done!";
			this.subtitle.innerText = "You beat the game! I only was able to made a couple levels. I hope you enjoyed them!";
		} else {
			this.levelindex ++;
			this.startLevel();
		}
	}
	
	closeLevel() {
		this.canvas.onmousedown = null;
		this.canvas.onmouseup = null;
		this.canvas.onmousemove = null;
		this.level = null;
	}
	
	editLevel() {
		this.level = new Level(this, this.canvas, "Level", "", [], [], [], new Snake([]));
		this.canvas.onmousedown = (event) => {this.onClick(event)};
		this.editmode = 1;
		this.level.startLevel();
	}
	
	onClick(event) {
		const [x,y] = screenToWorld(event.offsetX, event.offsetY);
		if (this.editmode == 1) {
			this.level.points.push(new BoardPoint(x,y));
		} else if (this.editmode == 2) {
			this.level.goalpoints.push(new BoardPoint(x,y));
		} else if (this.editmode == 3) {
			let allpoints = this.level.points.concat(this.level.goalpoints);
			for (let i = 0; i < allpoints.length; i ++) {
				let node = allpoints[i];
				if ((node.x-x)*(node.x-x) + (node.y-y)*(node.y-y) < 0.5) {
					if (i >= this.level.points.length) {
						this.level.goalpoints.splice(i - this.level.points.length, 1);
					} else {
						this.level.points.splice(i,1);
					}
					
					for (let onode of allpoints) {
						for (let j = 0; j < onode.sides.length; j ++) {
							if (onode.sides[j] == node) {
								onode.sides.splice(j,1);
							}
						}
					}
					
					break;
				}
			}
		}
	}
	
	fromTxt(txt) {
		this.level = new Level(this, this.canvas, ...( levelFromString(txt) ));
		this.title.innerText = this.level.name;
		this.subtitle.innerText = this.level.subtitle;
		nextbutton.disabled = true;
		this.level.startLevel();
	}
}
