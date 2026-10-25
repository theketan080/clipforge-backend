const express = require("express");
const cors = require("cors");
const path = require("path");
const crypto = require("crypto");
require("dotenv").config();

const { downloadVideo } = require("./services/downloader");
const { createMultipleShorts } = require("./services/videoProcessor");

const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

/*
|--------------------------------------------------------------------------
| Static files
|--------------------------------------------------------------------------
*/

app.use(
    "/outputs",
    express.static(path.join(__dirname, "outputs"))
);


/*
|--------------------------------------------------------------------------
| Temporary in-memory jobs
|--------------------------------------------------------------------------
*/

const jobs = new Map();


/*
|--------------------------------------------------------------------------
| Health
|--------------------------------------------------------------------------
*/

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "ClipForge backend is running 🚀"
    });
});

app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        status: "healthy"
    });
});


/*
|--------------------------------------------------------------------------
| Create Job
|--------------------------------------------------------------------------
*/

app.post("/api/jobs", async (req, res) => {

    try {

        const { url } = req.body;

        if (!url) {
            return res.status(400).json({
                success: false,
                message: "YouTube URL is required"
            });
        }

        if (!/youtube\.com|youtu\.be/i.test(url)) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid YouTube URL"
            });
        }

        const jobId = crypto.randomUUID();

        jobs.set(jobId, {
            id: jobId,
            status: "processing",
            progress: 0,
            clips: [],
            error: null
        });

        /*
        Send response immediately.
        Processing continues in background.
        */

        res.status(202).json({
            success: true,
            jobId,
            status: "processing"
        });

        processJob(jobId, url);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to create job"
        });
    }
});


/*
|--------------------------------------------------------------------------
| Process Job
|--------------------------------------------------------------------------
*/

async function processJob(jobId, url) {

    try {

        const job = jobs.get(jobId);

        /*
        STEP 1
        Download video
        */

        job.status = "downloading";
        job.progress = 10;

        const videoPath = await downloadVideo(
            url,
            jobId
        );

        /*
        STEP 2
        Temporary moments
        */

        job.status = "processing";
        job.progress = 45;

        const moments = [
            {
                start: 10,
                duration: 32
            },
            {
                start: 60,
                duration: 35
            },
            {
                start: 120,
                duration: 31
            },
            {
                start: 180,
                duration: 34
            }
        ];

        /*
        STEP 3
        Create Shorts
        */

        const clips = await createMultipleShorts(
            videoPath,
            jobId,
            moments
        );

        /*
        STEP 4
        Prepare response data
        */

        job.clips = clips.map(clip => ({
            id: `${jobId}-clip-${clip.clipNumber}`,
            clipNumber: clip.clipNumber,
            duration: clip.duration,
            startTime: clip.startTime,
            downloadUrl:
                `/outputs/${jobId}-clip-${clip.clipNumber}.mp4`
        }));

        job.progress = 100;
        job.status = "completed";

        console.log(`Job ${jobId} completed successfully!`);

    } catch (error) {

        console.error(`Job ${jobId} failed:`, error);

        const job = jobs.get(jobId);

        if (job) {
            job.status = "failed";
            job.error = error.message;
        }
    }
}


/*
|--------------------------------------------------------------------------
| Get Job Status
|--------------------------------------------------------------------------
*/

app.get("/api/jobs/:id", (req, res) => {

    const job = jobs.get(req.params.id);

    if (!job) {
        return res.status(404).json({
            success: false,
            message: "Job not found"
        });
    }

    res.json({
        success: true,
        job
    });
});


/*
|--------------------------------------------------------------------------
| Get Clips
|--------------------------------------------------------------------------
*/

app.get("/api/jobs/:id/clips", (req, res) => {

    const job = jobs.get(req.params.id);

    if (!job) {
        return res.status(404).json({
            success: false,
            message: "Job not found"
        });
    }

    res.json({
        success: true,
        clips: job.clips
    });
});


/*
|--------------------------------------------------------------------------
| Start Server
|--------------------------------------------------------------------------
*/

app.listen(PORT, "0.0.0.0", () => {

    console.log(
        `ClipForge backend running on port ${PORT}`
    );

});