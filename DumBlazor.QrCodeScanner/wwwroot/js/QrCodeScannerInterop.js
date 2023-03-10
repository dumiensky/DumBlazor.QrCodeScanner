import ("./jsQR.js");
let videoObject = null;
let dotNetRef = null;

let DumBlazorScanner = {
    QRCodeScanned: function (code) {
        if (!dotNetRef)
            return;

        dotNetRef.invokeMethodAsync("CodeScannedCallback", code);
    },
    ErrorOccured: function (error) {
        if (!dotNetRef)
            return;
        
        let json = JSON.stringify(error);
        dotNetRef.invokeMethodAsync("ErrorCallback", json);
    },
    Init: function (dotNet, canvasId, requestedWidth, highlightColor) {
        try {
            dotNetRef = dotNet;
            videoObject = document.createElement("video");
            let canvasElement = document.getElementById(canvasId);
            let canvas = canvasElement.getContext("2d", { willReadFrequently: true });

            function drawLine(begin, end, color) {
                canvas.beginPath();
                canvas.moveTo(begin.x, begin.y);
                canvas.lineTo(end.x, end.y);
                canvas.lineWidth = 4;
                canvas.strokeStyle = color;
                canvas.stroke();
            }

            // Use facingMode: environment to attempt to get the front camera on phones
            navigator.mediaDevices
                .getUserMedia({ video: { facingMode: "environment" } })
                .then(function (stream) {
                    videoObject.srcObject = stream;
                    videoObject.setAttribute("playsinline", true); // required to tell iOS safari we don't want fullscreen
                    videoObject.play();
                    requestAnimationFrame(tick)
                })
                .catch((userMediaError) => {
                    DumBlazorScanner.ErrorOccured({ mediaDevicesError: userMediaError.toString() });
                });

            function tick() {
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