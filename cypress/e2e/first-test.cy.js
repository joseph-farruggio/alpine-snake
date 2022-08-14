// -- Start: Our Cypress Tests --
describe("When snake eats food", () => {
	beforeEach(() => {
		cy.visit("http://localhost:8000?dev");
	});

	it("Point increments by one", () => {
		cy.window().then((win) => {
			let app = win.document.querySelector("[x-data]")._x_dataStack[0];
			app.test_moveToFood();
			cy.get("#points").should("have.text", "Points: 1");
		});
	});

	it("Snake grows by one", () => {
		cy.window().then((win) => {
			let app = win.document.querySelector("[x-data]")._x_dataStack[0];
			app.test_moveToFood();
			cy.get(".snake-part").should("have.length", 2);
		});
	});

	it("High Score is set", () => {
		cy.window().then((win) => {
			let app = win.document.querySelector("[x-data]")._x_dataStack[0];
			app.test_moveToFood();
			cy.get("#high-score").should("have.text", "High Score: 1");
		});
	});
});

describe("When snake hits wall", () => {
	beforeEach(() => {
		cy.visit("http://localhost:8000?dev");
	});

	it("Game over prompt visible", () => {
		cy.window().then((win) => {
			let app = win.document.querySelector("[x-data]")._x_dataStack[0];
			app.test_moveToWall();
			cy.get("#game-over").should("be.visible");
		});
	});
});

describe("When snake hits itself", () => {
	beforeEach(() => {
		cy.visit("http://localhost:8000?dev");
	});

	it("Game over prompt visible", () => {
		cy.window().then((win) => {
			let app = win.document.querySelector("[x-data]")._x_dataStack[0];
			app.test_touchTail();
			cy.get("#game-over").should("be.visible");
		});
	});
});

describe("When new game starts", () => {
	beforeEach(() => {
		cy.visit("http://localhost:8000?dev");
	});

	it("Points reset", () => {
		cy.window().then((win) => {
			let app = win.document.querySelector("[x-data]")._x_dataStack[0];
			app.points = 12;
			cy.wait(500);
			app.test_moveToWall();
			cy.wait(500);
			cy.get("#play-again").click();
			cy.get("#points").should("have.text", "Points: 0");
		});
	});
});

describe("Validating username", () => {
	beforeEach(() => {
		cy.visit("http://localhost:8000?dev");
	});

	it("Valid username given", () => {
		cy.window().then((win) => {
			let app = win.document.querySelector("[x-data]")._x_dataStack[0];
			cy.get("#openSettings").click();
			cy.get("#settings-username").type("This is a valid username");
			cy.get("#settings-username-error").should("not.be.visible");
			cy.get("#settings-social-picker").should("not.be.visible");
		});
	});

	it("Empty username given", () => {
		cy.window().then((win) => {
			let app = win.document.querySelector("[x-data]")._x_dataStack[0];
			cy.get("#openSettings").click();
			cy.get("#settings-username").type("abc");
			cy.get("#settings-username").clear();
			cy.get("#settings-username-error").should("be.visible");
		});
	});

	it("Just spaces given", () => {
		cy.window().then((win) => {
			let app = win.document.querySelector("[x-data]")._x_dataStack[0];
			cy.get("#openSettings").click();
			cy.get("#settings-username").type("   ");
			cy.get("#settings-username-error").should("be.visible");
		});
	});

	it("Just an @ given", () => {
		cy.window().then((win) => {
			let app = win.document.querySelector("[x-data]")._x_dataStack[0];
			cy.get("#openSettings").click();
			cy.get("#settings-username").type("@");
			cy.get("#settings-username-error").should("be.visible");
		});
	});

	it("Social Given", () => {
		cy.window().then((win) => {
			let app = win.document.querySelector("[x-data]")._x_dataStack[0];
			cy.get("#openSettings").click();
			cy.get("#settings-username").type("@John_Doe");
			cy.get("#settings-social-picker").should("be.visible");
		});
	});

	it("Is Twitter", () => {
		cy.window().then((win) => {
			let app = win.document.querySelector("[x-data]")._x_dataStack[0];
			cy.get("#openSettings").click();
			cy.get("#settings-username").type("@John_Doe");
			cy.get("#settings-twitter")
				.click()
				.should(() => {
					expect(app.social).to.equal("twitter");
				});
		});
	});

	it("Is Instagram", () => {
		cy.window().then((win) => {
			let app = win.document.querySelector("[x-data]")._x_dataStack[0];
			cy.get("#openSettings").click();
			cy.get("#settings-username").type("@John_Doe");
			cy.get("#settings-instagram")
				.click()
				.should(() => {
					expect(app.social).to.equal("instagram");
				});
		});
	});
});

// To Do: Hit dev leaderboard during tests

describe("Leaderboard", () => {
	beforeEach(() => {
		cy.visit("http://localhost:8000?dev");
	});

	// it("Can retrieve leaderboard", () => {
	// 	cy.window().then((win) => {
	// 		// Set a random username
	// 		let username = (Math.random() + 1).toString(36).substring(7);

	// 		// Save to dev leaderboard
	// 		win.Alpine.store("leaderboard").test_getleaderboard();

	// 	});
	// });

	it("Can save to leaderboard", () => {
		cy.window().then((win) => {
			// Set a random username
			let username = (Math.random() + 1).toString(36).substring(7);
			// Save to dev leaderboard
			win.Alpine.store("leaderboard").test_saveScore(username, 50, "twitter");

			cy.visit("http://localhost:8000?dev");

			cy.get("#openLeaderboard").click();

			// Check if username is set
			cy.contains(".leaderboard-entry", username);
		});
	});
});
