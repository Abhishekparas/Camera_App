let request = indexedDB.open("Camera", 1);
let container = document.querySelector(".container");
let dbAccess;

request.addEventListener("upgradeneeded", function () {
    let db = request.result;
    db.createObjectStore("gallery", { keyPath: "mID" });
});

request.addEventListener("success", function () {
    dbAccess = request.result;
});

request.addEventListener("error", function () {
    alert("some error occured");
});

function addMedia(type, media) {
    let tx = dbAccess.transaction("gallery", "readwrite");
    let galleryObjectStore = tx.objectStore("gallery");

    let data = {
        mID: Date.now(),
        type,
        media,
    };
    galleryObjectStore.add(data);
}

function viewMedia() {
    let tx = dbAccess.transaction("gallery", "readonly");
    let galleryObjectStore = tx.objectStore("gallery");
    let req = galleryObjectStore.openCursor();

    req.addEventListener("success", function () {
        let cursor = req.result;
        if (cursor) {
            let div = document.createElement("div");
            div.classList.add("media-card");
            div.innerHTML = `<div class="media-container"></div>
			<div class="action-container">
				<button class="media-download" data-id="${cursor.value.mID}">Download</button>
				<button class="media-delete" data-id="${cursor.value.mID}">Delete</button>
			</div>`;

            let downloadBtn = div.querySelector(".media-download");
            let deleteBtn = div.querySelector(".media-delete");

            deleteBtn.addEventListener("click", function (e) {
                let mID = e.currentTarget.getAttribute("data-id");
                e.currentTarget.parentElement.parentElement.remove();

                deleteMediaFromDB(mID);
            });

            if (cursor.value.type == "img") {
                let img = document.createElement("img");
                img.classList.add("media-gallery");
                img.src = cursor.value.media;
                let mediaContainer = div.querySelector(".media-container");
                mediaContainer.appendChild(img);

                downloadBtn.addEventListener("click", function (e) {
                    let a = document.createElement("a");
                    a.download = "image.png";
                    a.href = img.src;
                    a.click();
                    a.remove();
                });
            } else {
                let video = document.createElement("video");
                video.classList.add("media-gallery");
                video.src = window.URL.createObjectURL(cursor.value.media);

                video.autoplay = true;
                video.controls = true;
                video.loop = true;

                let mediaContainer = div.querySelector(".media-container");
                mediaContainer.appendChild(video);

                downloadBtn.addEventListener("click", function (e) {
                    let a = document.createElement("a");
                    a.download = "video.mp4";
                    a.href = video.src;
                    a.click();
                    a.remove();
                });
            }

            container.appendChild(div);
            cursor.continue();
        }
    });
}

function deleteMediaFromDB(mID) {
    let tx = dbAccess.transaction("gallery", "readwrite");
    let galleryObjectStore = tx.objectStore("gallery");
    galleryObjectStore.delete(Number(mID));
}
