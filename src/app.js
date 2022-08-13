import Alpine from "alpinejs";
import persist from "@alpinejs/persist";

Alpine.plugin(persist);

Alpine.data("snake", function () {
	return {
		/**
		 * Set the game defaults
		 */
		points: 0,
		highScore: this.$persist(0),
		gameOver: false,
		settingsOpen: false,
		leader_board: false,
		usernamePrompt: false,
		leaderboardNote: false,
		username: this.$persist(null),
		errors: {
			username: "",
		},
		social: this.$persist("twitter"),
		snakeParts: [
			{
				top: "200px",
				left: "200px",
				prevTop: null,
				prevLeft: null,
			},
		],
		food: {
			top: null,
			left: null,
		},
		currentDir: "up",
		speed: this.$persist(300),
		// End game defaults

		/**
		 * Methods to move the snake
		 */
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

		snakeMove() {
			if (this.gameOver) {
				return;
			}
			this.snakeParts.forEach((snake, index) => {
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
					snake.top = this.snakeParts[index - 1].prevTop;
					snake.left = this.snakeParts[index - 1].prevLeft;
				}
			});
		},
		// End snake move methods

		/**
		 * Helper Methods
		 */
		roundToNearestTen(num) {
			return Math.ceil(num / 10) * 10;
		},
		getRandomNumber() {
			return Math.floor(Math.random() * (280 - 20 + 1) + 20);
		},
		// End helper methods

		/**
		 * Methods to check if the snake has hit itself or the wall
		 */
		boxLeft() {
			if (parseInt(this.snakeParts[0].top) == 0 || parseInt(this.snakeParts[0].top) == 300 || parseInt(this.snakeParts[0].left) == 0 || parseInt(this.snakeParts[0].left) == 300) {
				this.setGameOver();
			}
		},
		touchedTail() {
			this.snakeParts.forEach((snake, index) => {
				if (index != 0) {
					if (parseInt(this.snakeParts[0].top) == parseInt(snake.top) && parseInt(this.snakeParts[0].left) == parseInt(snake.left)) {
						this.setGameOver();
					}
				}
			});
		},
		setGameOver() {
			this.clearInterval();

			if (this.points > 20 && this.points > this.highScore) {
				if (!this.validateUsername()) {
					this.usernamePrompt = true;
				} else {
					this.saveScore();
					this.runGame();
				}
			} else {
				this.gameOver = true;
			}

			// Set the highscore
			this.highScore = this.points > this.highScore ? this.points : this.highScore;
		},
		// End game over methods

		/**
		 * Methods for the snake's food
		 */
		foodEaten() {
			if (this.snakeParts[0].top == this.food.top && this.snakeParts[0].left == this.food.left) {
				this.points++;
				this.randomizeFood();
				this.growSnake();
			}
		},
		randomizeFood() {
			this.food.top = `${this.roundToNearestTen(this.getRandomNumber())}px`;
			this.food.left = `${this.roundToNearestTen(this.getRandomNumber())}px`;
		},
		growSnake() {
			let lastSnakePart = this.snakeParts[this.snakeParts.length - 1];
			this.snakeParts.push({
				top: lastSnakePart.top,
				left: lastSnakePart.left,
			});
		},
		// End food methods

		// Reset the game
		reset() {
			this.gameOver = false;
			this.leaderboardNote = false;
			this.usernamePrompt = false;
			this.points = 0;
			this.snakeParts = [
				{
					top: "100px",
					left: "100px",
					prevTop: null,
					prevLeft: null,
				},
			];
			this.runGame();
		},

		runMethods() {
			this.touchedTail();
			this.boxLeft();
			this.foodEaten();
			this.snakeMove();
		},

		/**
		 * Interval methods
		 */
		intervalID: null,
		setInterval() {
			// Run methods on an interval
			let myInterval = setInterval(() => this.runMethods(), this.speed);
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
		// End interval methods

		/**
		 * Settings menu
		 */
		openSettings() {
			if (!this.settingsOpen) {
				this.clearInterval();
				this.settingsOpen = true;
			} else {
				this.runGame();
				this.settingsOpen = false;
			}
		},
		// End settings menu

		/**
		 * Username Methods
		 */
		getUsername(username, social) {
			if (username.startsWith("@")) {
				let domain = social == "twitter" ? "https://twitter.com" : "https://instagram.com";
				return `<a href="${domain}/${username.substring(1)}" target="_blank" class="underline">${username}</a>`;
			} else {
				return username;
			}
		},

		usernameTouched: false,
		validateUsername() {
			if (this.username != null && this.username != "@" && this.username.length > 0) {
				this.errors.username = false;
				return true;
			}

			this.errors.username = "Please enter a username";
			return false;
		},

		hasSocial() {
			return this.username && this.username.startsWith("@");
		},
		// End username methods

		/**
		 * Save score to the database
		 */
		saveScore() {
			// Minimum score of 20 points
			if (this.points > 20) {
				Alpine.store("leaderboard").saveScore(this.username, this.points, this.social);
				this.usernamePrompt = false;
				this.leaderboardNote = true;
			}
		},

		// Initialize the game
		init() {
			this.randomizeFood();
			this.runGame();
		},
	};
});

const domain = "https://snake-api.netlify.app";

Alpine.store("leaderboard", {
	entries: [],

	async getleaderboard() {
		fetch(`${domain}/.netlify/functions/get`)
			.then((response) => response.json())
			.then((data) => (this.entries = data));
	},

	async saveScore(username, points, social) {
		fetch(`${domain}/.netlify/functions/post?username=${username}&points=${points}&social=${social}`);
	},

	init() {
		this.getleaderboard();
	},
});

window.Alpine = Alpine;

Alpine.start();
