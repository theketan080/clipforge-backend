const { execFile } = require("child_process");
const path = require("path");
const fs = require("fs");

const downloadsDir = path.join(__dirname, "..", "downloads");

if (!fs.existsSync(downloadsDir)) {
    fs.mkdirSync(downloadsDir, { recursive: true });
}

function downloadVideo(url, jobId) {
    return new Promise((resolve, reject) => {

        const outputTemplate = path.join(
            downloadsDir,
            `${jobId}.%(ext)s`
        );

        const args = [
            "-f",
            "bv*+ba/b",
            "--merge-output-format",
            "mp4",
            "-o",
            outputTemplate,
            url
        ];

        console.log("Starting video download...");
        console.log("URL:", url);

        execFile("yt-dlp", args, (error, stdout, stderr) => {

            if (error) {
                console.error("yt-dlp error:");
                console.error(stderr);

                return reject(
                    new Error("Video download failed")
                );
            }

            console.log(stdout);

            const files = fs.readdirSync(downloadsDir);

            const downloadedFile = files.find(
                file => file.startsWith(`${jobId}.`)
            );

            if (!downloadedFile) {
                return reject(
                    new Error("Downloaded video file not found")
                );
            }

            const filePath = path.join(
                downloadsDir,
                downloadedFile
            );

            console.log("Video downloaded:", filePath);

            resolve(filePath);
        });
    });
}

module.exports = {
    downloadVideo
};