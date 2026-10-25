const {
    createMultipleShorts
} = require("./services/videoProcessor");

const inputPath = "./downloads/test-video.mp4";

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

createMultipleShorts(
    inputPath,
    "test",
    moments
)
.then(clips => {

    console.log("\n==============================");
    console.log("ALL CLIPS CREATED SUCCESSFULLY");
    console.log("==============================\n");

    clips.forEach(clip => {
        console.log(
            `Clip ${clip.clipNumber}: ${clip.filePath}`
        );
    });

})
.catch(error => {

    console.error("\nFAILED!");
    console.error(error.message);

});