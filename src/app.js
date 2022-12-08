import Alpine from "alpinejs";
import persist from "@alpinejs/persist";
Alpine.plugin(persist);

import snake from "./snake";
Alpine.data("snake", snake);

const urlParams = new URLSearchParams(location.search);
const domain = window.location.href.includes("localhost") ? "http://localhost:8888" : "https://snake-api.netlify.app";

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

	async test_getleaderboard() {
		fetch(`${domain}/.netlify/functions/get?dev=true`)
			.then((response) => response.json())
			.then((data) => (this.entries = data));
	},

	async test_saveScore(username, points, social) {
		fetch(`${domain}/.netlify/functions/post?dev=true&username=${username}&points=${points}&social=${social}`);
	},

	init() {
		if (urlParams.has("dev")) {
			this.test_getleaderboard();
		} else {
			this.getleaderboard();
		}
	},
});

// import demo from "./demo";
// Alpine.data('demo', demo)

// Alpine.data('demo', function () {
// 	return {
// 		value_a: 'value A',
// 		someObj: {
// 			value_b: 'value B',
// 			someMethod: () => {
// 				console.log(this.$data.value_a);
// 				console.log(this.$data.someObj.value_b);
// 			}
// 		},
// 		init() {
// 			this.someObj.someMethod();
// 		}
// 	}	
// });

window.Alpine = Alpine;

Alpine.start();
