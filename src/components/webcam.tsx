"use client";
import React, { useEffect } from "react";
import Webcam from "react-webcam";

const videoConstraints = {
  width: 1280,
  height: 720,
  facingMode: "user",
};

const WebcamCapture = () => {
  const webcamRef = React.useRef<Webcam>(null);

  useEffect(() => {
    const checkCameraAccess = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        console.log("Camera access granted");
        stream.getTracks().forEach((track) => track.stop());
      } catch (error: any) {
        if (error?.name === "NotReadableError") {
          console.error(
            "Camera is already in use by another application",
            error,
          );
        } else {
          console.error("Camera access denied", error);
        }
      }
    };

    checkCameraAccess();
  }, []);

  const capture = React.useCallback(() => {
    const imageSrc = webcamRef?.current?.getScreenshot();
    console.log(imageSrc);
  }, [webcamRef]);

  return (
    <>
      <Webcam
        audio={false}
        height={720}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        width={1280}
        videoConstraints={videoConstraints}
      />
      <button onClick={capture}>Capture photo</button>
    </>
  );
};

export default WebcamCapture;
