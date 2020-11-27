


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
