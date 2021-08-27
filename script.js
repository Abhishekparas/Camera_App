let video = document.querySelector("video");
let recordBtn = document.querySelector("#record");
let capBtn = document.querySelector("#capture");
let filters = document.querySelectorAll(".filters");
let body = document.querySelector("body");
let zoomIn = document.querySelector(".zoom-in");
let zoomOut = document.querySelector(".zoom-out");
let galleryBtn = document.querySelector("button#gallery");

let mediaRecorder;
let constraints = {
    video: true,
    audio: true,
};

let isRecording = false;
let chunks = [];

recordBtn.addEventListener("click", () => {
    if (isRecording) {
        mediaRecorder.stop();
        alert("recording stopped");
        isRecording = false;
    } else {
        mediaRecorder.start();
        filterToBeApplied = "";
        removeFilter();
        alert("recording started");
        isRecording = true;
    }
});

let filterToBeApplied = "";

for (let i = 0; i < filters.length; i++) {
    filters[i].addEventListener("click", function (e) {
        filterToBeApplied = e.target.style.backgroundColor;
        removeFilter();
        applyFilter(filterToBeApplied);
    });
}

function applyFilter(filterColor) {
    let filterDiv = document.createElement("div");
    filterDiv.classList.add("filter-div");
    filterDiv.style.backgroundColor = filterColor;
    body.append(filterDiv);
}

function removeFilter() {
    let filterDiv = document.querySelector(".filter-div");
    if (filterDiv) {
        filterDiv.remove();
    }
}

navigator.mediaDevices.getUserMedia(constraints).then(function (mediaStream) {
    video.srcObject = mediaStream;
    mediaRecorder = new MediaRecorder(mediaStream);

    mediaRecorder.addEventListener("dataavailable", (e) => {
        chunks.push(e.data);
    });

    mediaRecorder.addEventListener("stop", () => {
        let blob = new Blob(chunks, { type: "video/mp4" });
        addMedia("video", blob);
        chunks = [];
    });
});

capBtn.addEventListener("click", function () {
    capture();
});

function capture() {
    let c = document.createElement("canvas");
    c.width = video.videoWidth;
    c.height = video.videoHeight;

    let ctx = c.getContext("2d");
    ctx.translate(c.width / 2, c.height / 2);
    ctx.scale(currZoom, currZoom);
    ctx.translate(-c.width / 2, -c.height / 2);
    ctx.drawImage(video, 0, 0);

    if (filterToBeApplied != "") {
        ctx.fillStyle = filterToBeApplied;
        ctx.fillRect(0, 0, c.width, c.height);
    }
    addMedia("img", c.toDataURL());
}

let minZoom = 1;
let maxZoom = 3;
let currZoom = 1;

zoomIn.addEventListener("click", function () {
    if (currZoom < maxZoom) {
        currZoom += 0.1;
        video.style.transform = `scale(${currZoom})`;
    }
});

zoomOut.addEventListener("click", function () {
    if (currZoom > minZoom) {
        currZoom -= 0.1;
        video.style.transform = `scale(${currZoom})`;
    }
});

galleryBtn.addEventListener("click", function () {
    window.location.href = "gallery.html";
});
