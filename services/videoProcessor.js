const { execFile } = require("child_process");
const path = require("path");
const fs = require("fs");

const outputsDir = path.join(__dirname, "..", "outputs");

if (!fs.existsSync(outputsDir)) {
    fs.mkdirSync(outputsDir, { recursive: true });
}

function createShort(inputPath, jobId, clipNumber, startTime, duration) {
    return new Promise((resolve, reject) => {

        const outputPath = path.join(
            outputsDir,
            `${jobId}-clip-${clipNumber}.mp4`
        );

        const args = [
            "-y",

            "-ss",
            String(startTime),

            "-i",
            inputPath,

            "-t",
            String(duration),

            "-vf",
            "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920",

            "-c:v",
            "libx264",

            "-preset",
            "veryfast",

            "-crf",
            "23",

            "-c:a",
            "aac",

            "-b:a",
            "128k",

            "-movflags",
            "+faststart",

            outputPath
        ];

        console.log(`Creating Clip ${clipNumber}...`);
        console.log(`Start: ${startTime}s`);
        console.log(`Duration: ${duration}s`);

        execFile("ffmpeg", args, (error, stdout, stderr) => {

            if (error) {
                console.error(stderr);

                return reject(
                    new Error(`Clip ${clipNumber} processing failed`)
                );
            }

            if (!fs.existsSync(outputPath)) {
                return reject(
                    new Error(`Clip ${clipNumber} was not created`)
                );
            }

            console.log(`Clip ${clipNumber} created successfully!`);

            resolve({
                clipNumber,
                startTime,
                duration,
                filePath: outputPath
            });
        });
    });
}


async function createMultipleShorts(inputPath, jobId, moments) {

    const results = [];

    for (let i = 0; i < moments.length; i++) {

        const moment = moments[i];

        const clip = await createShort(
            inputPath,
            jobId,
            i + 1,
            moment.start,
            moment.duration
        );

        results.push(clip);
    }

    return results;
}


module.exports = {
    createShort,
    createMultipleShorts
};