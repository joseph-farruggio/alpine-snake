import { roundToNearestTen, getRandomNumber } from "./utilities";

export default function() {
	return {
		snake: {
			currentDir: "up",
			speed: Alpine.$persist(300),
			parts: [
				{
					top: "200px",
					left: "200px",
					prevTop: null,
					prevLeft: null,
				},
			],

			firstPart() {
				return this.parts[0];
			},

			lastPart() {
				return this.parts[this.parts.length - 1];
			},
			
			changeDir(dir) {
				if (dir == "up" && this.currentDir != "down") {
					this.currentDir = dir;
					return;
				}

				if (dir == "down" && this.currentDir != "up") {
					this.currentDir = dir;
					return;
				}

				if (dir == "left" && this.currentDir != "right") {
					this.currentDir = dir;
					return;
				}

				if (dir == "right" && this.currentDir != "left") {
					this.currentDir = dir;
					return;
				}
			},

			move() {
				// if (this.$data.gameOver) {
				// 	return;
				// }
				this.parts.forEach((snake, index) => {
					// Save the current position
					snake.prevTop = snake.top;
					snake.prevLeft = snake.left;

					if (index == 0) {
						// Move the first snake part
						if (this.currentDir == "up") {
							snake.top = `${parseInt(snake.top) - 10}px`;
						}

						if (this.currentDir == "down") {
							snake.top = `${parseInt(snake.top) + 10}px`;
						}

						if (this.currentDir == "left") {
							snake.left = `${parseInt(snake.left) - 10}px`;
						}

						if (this.currentDir == "right") {
							snake.left = `${parseInt(snake.left) + 10}px`;
						}
					} else {
						/**
						 * Every other snake part takes the
						 * previous position of the part before it
						 */
						snake.top = this.parts[index - 1].prevTop;
						snake.left = this.parts[index - 1].prevLeft;
					}
				});
			},

			ateFood: () => {
				if (this.$data.snake.firstPart().top == this.$data.food.position.top && this.$data.snake.firstPart().left == this.$data.food.position.left) {
					this.$data.points++;
					this.$data.food.randomize();
					this.$data.snake.grow();

					// Set the highscore
					this.$data.highScore = this.$data.points > this.$data.highScore ? this.$data.points : this.$data.highScore;
				}
			},

			grow() {
				this.parts.push({
					top: this.lastPart().top,
					left: this.lastPart().left,
				});
			},

			leftBox: () => {
				if (parseInt(this.$data.snake.firstPart().top) == 0 || parseInt(this.$data.snake.firstPart().top) == 300 || parseInt(this.$data.snake.firstPart().left) == 0 || parseInt(this.$data.snake.firstPart().left) == 300) {
					this.$data.setGameOver();
				}
			},

			touchedTail: () => {
				this.$data.snake.parts.forEach((snake, index) => {
					if (index != 0) {
						if (parseInt(this.$data.snake.firstPart().top) == parseInt(snake.top) && parseInt(this.$data.snake.firstPart().left) == parseInt(snake.left)) {
							this.$data.setGameOver();
						}
					}
				});
			},
		},

		food: {
			position: {
				top: null,
				left: null,
			},
			eat() {
				this.$data.points++;
			},

			randomize() {
				this.position.top = `${roundToNearestTen(getRandomNumber())}px`;
				this.position.left = `${roundToNearestTen(getRandomNumber())}px`;
			},
		},

		player: {
			name: Alpine.$persist(null),
			social: Alpine.$persist("twitter"),

			hasSocial: () => {
				return this.$data.form.validateName() && this.$data.player.name.startsWith("@");
			},
		},

		

		form: {
			nameTouched: false,
			errors: {
				name: "",
			},
			validateName: () =>  {
				let name = this.$data.player.name;
				
				if (name != null) {
					name = name.trim();
				}
				
				if (!!name && name != "@") {
					this.$data.form.errors.name = false;
					return true;
				}

				this.$data.form.errors.name = "Please enter a name";
				return false;
			},	
		},

		/**
		 * Set the game defaults
		 */
		points: 0,
		highScore: Alpine.$persist(0),
		gameOver: false,
		settingsOpen: false,
		leaderboardOpen: false,
		playerNamePrompt: false,
		leaderboardNote: false,
		

		setGameOver() {
			this.clearInterval();

			if (this.points > 20 && this.points > this.highScore) {
				if (!this.form.validateName()) {
					this.playerNamePrompt = true;
				} else {
					this.saveScore();
					this.runGame();
				}
			} else {
				this.gameOver = true;
			}
		},
		reset() {
			this.gameOver = false;
			this.leaderboardNote = false;
			this.playerNamePrompt = false;
			this.points = 0;
			this.snake.parts = [
				{
					top: "100px",
					left: "100px",
					prevTop: null,
					prevLeft: null,
				},
			];
			this.runGame();
		},

		

		/**
		 * Interval methods
		 */
		intervalID: null,
		setInterval() {
			// Run methods on an interval
			let myInterval = setInterval(() => this.runMethods(), this.snake.speed);
			this.intervalID = myInterval;
		},
		clearInterval() {
			window.clearInterval(this.intervalID);
		},
		runGame() {
			if (this.intervalID) {
				clearInterval(this.intervalID);
			}
			this.setInterval();
		},

		runMethods() {
			this.snake.touchedTail();
			this.snake.leftBox();
			this.snake.ateFood();
			this.snake.move();
		},
		// End interval methods

		/**
		 * Open Settings menu / Leaderboard
		 */
		openSettings() {
			this.leaderboardOpen = false;

			if (!this.settingsOpen) {
				this.clearInterval();
				this.settingsOpen = true;
			} else {
				this.runGame();
				this.settingsOpen = false;
			}
		},

		openLeaderboard() {
			this.settingsOpen = false;

			if (!this.leaderboardOpen) {
				this.clearInterval();
				this.leaderboardOpen = true;
			} else {
				this.runGame();
				this.leaderboardOpen = false;
			}
		},

		saveScore() {
			// Minimum score of 20 points
			if (this.points > 20) {
				Alpine.store("leaderboard").saveScore(this.name, this.points, this.social);
				this.playerNamePrompt = false;
				this.leaderboardNote = true;
			}
		},

		getPlayerName(name, social) {
			if (name.startsWith("@")) {
				let domain = social == "twitter" ? "https://twitter.com" : "https://instagram.com";
				return `<a href="${domain}/${name.substring(1)}" target="_blank" class="underline">${name}</a>`;
			} else {
				return name;
			}
		},

		/**
		 * Methods for Cypress Testing
		 */
		test_moveToFood() {
			this.snake.firstPart().top = this.food.position.top;
			this.snake.firstPart().left = this.food.position.left;
		},
		test_moveToWall() {
			this.snake.firstPart().top = "0px";
			this.snake.firstPart().left = "0px";
		},
		test_touchTail() {
			this.snake.grow();
			this.snake.firstPart().top = this.snake.parts[1].top;
			this.snake.firstPart().left = this.snake.parts[1].left;
		},

		// Initialize the game
		init() {
			this.food.randomize();
			this.runGame();
		},
	}
};
