const { downloadVideo } = require("./services/downloader");

const url = process.argv[2];

if (!url) {
    console.log("Please provide a YouTube URL");
    process.exit(1);
}

downloadVideo(url, "test-video")
    .then(filePath => {
        console.log("\nSUCCESS!");
        console.log("Downloaded file:");
        console.log(filePath);
    })
    .catch(error => {
        console.error("\nFAILED!");
        console.error(error.message);
    });