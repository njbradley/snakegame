
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
				const padding = 0.1
				if (bestNode == null || dotprod-padding > maxDot) {
					secondNode = bestNode;
					secondDot = maxDot;
					bestNode = node;
					maxDot = dotprod;
				} else if (bestNode == null || Math.abs(dotprod - maxDot) < padding) {
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
