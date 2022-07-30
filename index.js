const fs = require("fs");
const download = require("download");
const axios = require("axios").default;
const { zip } = require("zip-a-folder");

// If you're downloading a lot of maps, you will want a higher cooldown
let cooldown = 3000;

(async () => {
	// Only read files with .txt extension
	let files = fs.readdirSync("./in").filter((x) => x.endsWith(".txt"));

	for (const file of files) {
		console.log(`Generating a mappack from ${file}`);

		let folderName = file.replace(".txt", "");
		while (fs.existsSync(folderName)) {
			folderName += " - Copy";
		}

		let ids = fs
			.readFileSync(`./in/${file}`)
			.toString()
			.split("\n")
			.filter((x) => x.match(/\d+/g));

		for (const id of ids) {
			await downloadMap(id, folderName);
		}

		await zip(`./out/${folderName}`, `./out/${folderName}.zip`);
	}
})();

async function downloadMap(mapId, folderName) {
	let setReq = await axios({
		baseURL: `https://api.chimu.moe/v1/map/${mapId}`,
	});

	let setId = setReq.data.ParentSetId;
	let downloadUrl = `https://api.chimu.moe/v1/download/${setId}`;

	let filePath = `${__dirname}/out/${folderName}`;

	await new Promise((resolve) => setTimeout(resolve, cooldown));

	console.log(`Downloading ${setReq.data.OsuFile}...`);
	await download(downloadUrl, filePath);
}
