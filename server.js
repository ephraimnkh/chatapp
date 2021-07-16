let express = require("express");
let path = require("path");
let app = express();
let server = require("http").Server(app);
let io = require("socket.io")(server);
let port = 8080;
app.use("/", express.static(path.join(__dirname, "dist/chatApp")));

// Speech code
const fs = require("fs");
// Imports the Google Cloud client library
const textToSpeech = require("@google-cloud/text-to-speech");
// Creates a client
const client = new textToSpeech.TextToSpeechClient();

let text;
let fileName;
let user;

function convert() {
    let fileChanged = false;
    // Construct the request
    const request = {
        input: { text: text },
        // Select the language and SSML Voice Gender (optional)
        voice: { languageCode: "en-US", ssmlGender: "NEUTRAL" },
        // Select the type of audio encoding
        audioConfig: { audioEncoding: "MP3" },
    };
    // Clears text of current user
    text = "";
    // set up filename
    fileName = user + ".mp3";
    // Performs the Text-to-Speech request
    client.synthesizeSpeech(request, (err, response) => {
        if (err) {
            console.error("ERROR:", err);
            return;
        }
        if (fs.existsSync("src/assets/" + fileName))
            fileChanged = true;
        fs.writeFileSync("src/assets/" + fileName, response.audioContent, "binary");
        if (!fileChanged)
            // Delay setup to allow for file creation since PC takes time.
            setTimeout(setUpAudio, 3000);
        else
            // Delay setup to allow for file creation since PC takes time.
            setTimeout(setUpAudio, 10000);
    });
}

io.on("connection", socket => {
    console.log("new connection made from client with ID=" + socket.id);
    socket.on("newMsg", data => {
        io.sockets.emit("msg", { messenger: data[0], msg: data[1], timeStamp: getCurrentDate(), id: data[2] });
    });
    socket.on("convertMsg", data => {
        text = data;
        user = socket.id;
        convert();
    });
});
server.listen(port, () => {
    console.log("Listening on http://localhost:" + port);
});
function getCurrentDate() {
    let d = new Date();
    return d.toLocaleString();
}
function setUpAudio() {
    io.to(user).emit("reloadAudio", fileName);
    io.to(user).emit("alertUser", "Audio is ready to be played");
}
