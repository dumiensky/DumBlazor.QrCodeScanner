import ("./jsQR.js");
let videoObject = null;
let videoStopped = false;

let DumBlazorScanner = {
    QRCodeScanned: function (code) {
        DotNet.invokeMethodAsync("DumBlazor.QrCodeScanner", "CodeScannedCallback", code);
    },
    ErrorOccured: function (error) {
        let json = JSON.stringify(error);
        DotNet.invokeMethodAsync("DumBlazor.QrCodeScanner", "ErrorCallback", json);
    },
    Init: function (canvasId, requestedWidth, highlightColor) {
        try {
            videoStopped = false;
            videoObject = document.createElement("video");
            let canvasElement = document.getElementById(canvasId);
            let canvas = canvasElement.getContext("2d");

            function drawLine(begin, end, color) {
                canvas.beginPath();
                canvas.moveTo(begin.x, begin.y);
                canvas.lineTo(end.x, end.y);
                canvas.lineWidth = 4;
                canvas.strokeStyle = color;
                canvas.stroke();
            }

            // Use facingMode: environment to attemt to get the front camera on phones
            navigator.mediaDevices
                .getUserMedia({ video: { facingMode: "environment" } })
                .then(function (stream) {
                    videoObject.srcObject = stream;
                    videoObject.setAttribute("playsinline", true); // required to tell iOS safari we don't want fullscreen
                    videoObject.play();
                    requestAnimationFrame(tick)
                })
                .catch((userMediaError) => {
                    //console.error("mediaDevices " + userMediaError);
                    DumBlazorScanner.ErrorOccured(userMediaError);
                });

            function tick() {
                if (videoStopped === true) // if the video has been stopped we don't have to execute the QR reading
                    return;

                if (videoObject.readyState === videoObject.HAVE_ENOUGH_DATA) {
                    canvasElement.hidden = false;

                    if (!requestedWidth) {
                        //No requested size, original video size is displayed
                        canvasElement.width = videoObject.videoWidth;
                        canvasElement.height = videoObject.videoHeight;
                    }
                    else  {
                        //Width in pixel
                        canvasElement.width = requestedWidth;
                        canvasElement.height = requestedWidth * (videoObject.videoHeight / videoObject.videoWidth);
                    }

                    canvas.drawImage(
                        videoObject,
                        0,
                        0,
                        canvasElement.width,
                        canvasElement.height
                    );
                    let imageData = canvas.getImageData(
                        0,
                        0,
                        canvasElement.width,
                        canvasElement.height
                    );
                    let code = jsQR(imageData.data, imageData.width, imageData.height, {
                        inversionAttempts: "dontInvert",
                    });
                    if (code) {
                        drawLine(
                            code.location.topLeftCorner,
                            code.location.topRightCorner,
                            highlightColor
                        );
                        drawLine(
                            code.location.topRightCorner,
                            code.location.bottomRightCorner,
                            highlightColor
                        );
                        drawLine(
                            code.location.bottomRightCorner,
                            code.location.bottomLeftCorner,
                            highlightColor
                        );
                        drawLine(
                            code.location.bottomLeftCorner,
                            code.location.topLeftCorner,
                            highlightColor
                        );

                        DumBlazorScanner.QRCodeScanned(code.data);
                    }
                }
                requestAnimationFrame(tick);
            }
        } 
        catch (error) {
            DumBlazorScanner.ErrorOccured(error);
        }
    }
};

export { DumBlazorScanner };