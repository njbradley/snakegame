/// Copywright Nicholas Bradley 2020 All right reservded
// made for the OMG Game Jam

class Game {
	
	constructor(canvas, title, subtitle, nextbutton, resetbutton, editbar, levels) {
		this.nextbutton = nextbutton;
		nextbutton.onclick = () => {this.nextLevel()};
		resetbutton.onclick = () => {this.startLevel()};
		this.title = title;
		this.subtitle = subtitle;
		this.levels = levels;
		this.levelindex = 0;
		this.canvas = canvas;
		this.editbar = editbar;
		this.startLevel();
	}
	
	newLevel() {
		this.closeLevel();
		this.level = new Level(this, this.canvas, "Custom Level", "", [], [], [], null);
		
		this.title.innerText = this.level.name;
		this.subtitle.innerText = this.level.subtitle;
		this.nextbutton.style = "visibility: hidden;";
		this.level.startLevel();
	}
	
	startLevel() {
		this.closeLevel();
		console.log(this.levels[this.levelindex]());
		this.level = new Level(this, this.canvas, ...( this.levels[this.levelindex]() ));
		// const dat = levelToBase64(this.level);
		// let level = levelFromBase64(dat);
		// this.level = new Level(this, this.canvas, ...level);
		// console.log(level);
		this.title.innerText = this.level.name;
		this.subtitle.innerText = this.level.subtitle;
		this.nextbutton.style = "visibility: hidden;";
		this.level.startLevel();
	}
	
	endLevel() {
		this.nextbutton.style = "visibility: shown;";
		this.title.innerText = "Level Complete!";
		this.subtitle.innerText = "Well done!";
	}
	
	closeLevel() {
		this.canvas.onmousedown = null;
		this.canvas.onmouseup = null;
		this.canvas.onmousemove = null;
		this.level = null;
		if (this.editor != null) {
			this.editor.closeEditor();
			this.editor = null;
		}
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
	
	editLevel() {
		this.editor = new LevelEditor(this.level, this.editbar);
	}
	
	from64(txt) {
		this.closeLevel();
		this.level = new Level(this, this.canvas, ...( levelFromBase64(txt) ));
		this.title.innerText = this.level.name;
		this.subtitle.innerText = this.level.subtitle;
		this.nextbutton.disabled = true;
		this.level.startLevel();
	}
}
