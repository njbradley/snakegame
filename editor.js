

class LevelEditor {
	constructor(level, editbar) {
		this.level = level;
		this.editbar = editbar;
		this.level.canvas.onmousedown = (event) => {this.onEditClick(event)};
		this.level.canvas.onmousemove = (event) => {this.onEditMouseMove(event)};
		this.level.canvas.onmouseup = (event) => {this.onEditUnClick(event)};
		this.editmode = "none";
		
		if (editbar.childNodes.length <= 1) {
			var modes = ["none", "move", "addpoint", "addgoal", "del", "linkpoints", "addsnake", "goalsnake"];
			for (let mode of modes) {
				let button = document.createElement("button");
				button.innerText = mode;
				button.onclick = () => {
					console.log(mode);
					this.editmode = mode;
				};
				this.editbar.appendChild(button)
				this.editbar.appendChild(document.createElement("br"));
			}
		} else {
			this.editbar.hidden = false;
		}
	}
	
	onEditClick(event) {
		if (this.editmode != "del" && this.editmode != "goalsnake" && this.level.onClick(event)) {
			return true;
		}
		if (this.editmode == "none") {
			return false;
		}
		const [x,y] = screenToWorld(event.offsetX, event.offsetY);
		
		let allpoints = this.level.points.concat(this.level.goalpoints);
		
		if (this.editmode != "del") {
			for (let point of allpoints) {
				if ((point.x-x)*(point.x-x) + (point.y-y)*(point.y-y) < 0.1) {
					this.heldPoint = point;
				}
			}
		}
		
		console.log(this.editmode);
		
		if (this.editmode == "addpoint") {
			if (this.heldPoint == null) {
				
				this.heldPoint = new BoardPoint(Math.round(x*16)/16.0,Math.round(y*16)/16.0)
				this.level.points.push(this.heldPoint);
				this.level.render();
			}
		} else if (this.editmode == "addgoal") {
			if (this.heldPoint != null) {
				for (let i = 0; i < this.level.points.length; i ++) {
					if (this.level.points[i] == this.heldPoint) {
						this.level.points.splice(i,1);
						this.level.goalpoints.push(this.heldPoint);
						this.level.render();
						return true;
					}
				}
				
				for (let i = 0; i < this.level.goalpoints.length; i ++) {
					if (this.level.goalpoints[i] == this.heldPoint) {
						this.level.goalpoints.splice(i,1);
						this.level.points.push(this.heldPoint);
						this.level.render();
						return true;
					}
				}
			}
		} else if (this.editmode == "addsnake") {
			if (this.heldPoint != null) {
				let snake = new Snake([this.heldPoint])
				this.level.snakes.splice(0,0,snake);
				this.level.allsnakes.splice(0,0,snake);
				this.level.render();
				return true;
			}
		} else if (this.editmode == "delsnake") {
			if (this.heldPoint != null) {
				
			}
		} else if (this.editmode == "goalsnake") {
			console.log(this.heldPoint);
			if (this.heldPoint != null) {
				let snake = this.heldPoint.snake;
				console.log(snake);
				if (snake != null) {
					for (let i = 0; i < this.level.snakes.length; i ++) {
						if (this.level.snakes[i] == snake) {
							this.level.snakes.splice(i,1);
							this.level.allsnakes.splice(i,1);
							if (this.level.goalsnake != null) {
								this.level.snakes.push(this.level.goalsnake);
							}
							console.log(this.level.goalsnake);
							this.level.goalsnake = snake;
							console.log(this.level.goalsnake);
							this.level.allsnakes.push(snake);
							this.level.render();
							return true;
						}
					}
				}
			}
		} else if (this.editmode == "del") {
			for (let i = 0; i < allpoints.length; i ++) {
				let node = allpoints[i];
				
				if ((node.x-x)*(node.x-x) + (node.y-y)*(node.y-y) < 0.1) {
					
					if (node.snake != null) {
						let snake = node.snake;
						if (snake != null) {
							if (snake == this.level.goalsnake) {
								this.level.goalsnake = null;
								this.level.allsnakes.pop();
								this.level.render();
								return true;
							}
							for (let i = 0; i < this.level.snakes.length; i ++) {
								if (this.level.snakes[i] == snake) {
									this.level.snakes.splice(i,1);
									this.level.allsnakes.splice(i,1);
									this.level.render();
									return true;
								}
							}
						}
					}
					
					if (i >= this.level.points.length) {
						this.level.goalpoints.splice(i - this.level.points.length, 1);
					} else {
						this.level.points.splice(i,1);
					}
					
					for (let onode of node.sides) {
						for (let j = 0; j < onode.sides.length; j ++) {
							if (onode.sides[j] == node) {
								onode.sides.splice(j,1);
								break;
							}
						}
					}
					
					this.level.render();
					return true;
				}
			}
			
			for (let node1 of allpoints) {
				for (let node2 of node1.sides) {
					let nodeToNode = [node2.x-node1.x, node2.y-node1.y];
					let nodeToMouse = [x-node1.x, y-node1.y];
					
					let nodeDist2 = nodeToNode[0]*nodeToNode[0] + nodeToNode[1]*nodeToNode[1];
					
					let dotProd = (nodeToNode[0]*nodeToMouse[0] + nodeToNode[1]*nodeToMouse[1]);
					let projVec = [nodeToNode[0]*dotProd/nodeDist2, nodeToNode[1]*dotProd/nodeDist2];
					
					let offVec = [nodeToMouse[0]-projVec[0], nodeToMouse[1]-projVec[1]];
					let distFromLine = Math.sqrt(offVec[0]*offVec[0] + offVec[1]*offVec[1]);
					
					if (distFromLine < 0.1) {
						for (let i = 0; i < node1.sides.length; i ++) {
							if (node1.sides[i] == node2) {
								node1.sides.splice(i,1);
								break;
							}
						}
						for (let i = 0; i < node2.sides.length; i ++) {
							if (node2.sides[i] == node1) {
								node2.sides.splice(i,1);
								break;
							}
						}
						this.level.render();
						return true;
					}
				}
			}
		}
	}
	
	onEditMouseMove(event) {
		if (this.level.onMouseMove(event)) {
			return true;
		}
		const [x,y] = screenToWorld(event.offsetX, event.offsetY);
		if (this.heldPoint != null) {
			let allpoints = this.level.points.concat(this.level.goalpoints);
			if (this.editmode == "linkpoints") {
				for (let point of allpoints) {
					if (point != this.heldPoint && (point.x-x)*(point.x-x) + (point.y-y)*(point.y-y) < 0.1) {
						if (!point.sides.includes(this.heldPoint)) {
							point.addNeighbor(this.heldPoint);
							this.heldPoint.addNeighbor(point);
							this.level.render();
								console.log(point.sides, this.heldPoint.sides);
						} else {
							console.log(point.sides, this.heldPoint.sides);
						}
						this.heldPoint = point;
						return true;
					}
				}
			} else if (this.editmode == "move") {
				this.heldPoint.x = Math.round(x*16)/16.0;
				this.heldPoint.y = Math.round(y*16)/16.0;
				this.level.render();
				return true;
			} else if (this.editmode == "addsnake") {
				for (let point of this.heldPoint.sides) {
					if (point != this.heldPoint && (point.x-x)*(point.x-x) + (point.y-y)*(point.y-y) < 0.1) {
						this.level.snakes[0].points.push(point);
						point.snake = this.level.snakes[0];
						this.heldPoint = point;
						this.level.render();
						return true;
					}
				}
			} else if (this.editmode == "addpoint") {
				let dist = Math.sqrt((this.heldPoint.x-x)*(this.heldPoint.x-x) + (this.heldPoint.y-y)*(this.heldPoint.y-y));
				if (dist > 1) {
					for (let point of allpoints) {
						if (point != this.heldPoint && (point.x-x)*(point.x-x) + (point.y-y)*(point.y-y) < 0.3) {
							this.heldPoint.addNeighbor(point);
							point.addNeighbor(this.heldPoint);
							this.level.render();
							this.heldPoint = point;
							return true;
						}
					}
					let diffx = x-this.heldPoint.x;
					let diffy = y-this.heldPoint.y;
					diffx /= dist;
					diffy /= dist
					let roundedx = Math.round((this.heldPoint.x + diffx)*16)/16.0;
					let roundedy = Math.round((this.heldPoint.y + diffy)*16)/16.0;
					let point = new BoardPoint(roundedx, roundedy);
					point.addNeighbor(this.heldPoint);
					this.heldPoint.addNeighbor(point);
					this.level.points.push(point);
					this.heldPoint = point;
					this.level.render();
					return true;
				}
			}
		}
		return false;
	}
	
	onEditUnClick(event) {
		this.level.onUnClick(event);
		this.heldPoint = null;
	}
	
	closeEditor() {
		this.editbar.hidden = true;
	}
}
