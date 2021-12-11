import { Container, Typography } from "@mui/material";
import { CameraIndoor } from "@mui/icons-material";
import React, { useEffect, useRef, useState } from "react";
import "./App.css";

const webSocketCam = new WebSocket("ws://localhost:9000/jpgstream_client");
const webSocketPIR = new WebSocket("ws://localhost:9000/pir_sensor");

webSocketCam.onopen = () => {
    console.log("WSC Connected to server!");
};

webSocketCam.onclose = () => {
    console.log("WSC Closed Connection!");
};

webSocketPIR.onopen = () => {
    console.log("WSP connected to server!");
};

webSocketPIR.onclose = () => {
    console.log("WSP Closed Connection!");
};

function App() {
    const [videoURL, setVideoURL] = useState(null);
    const [pirSensor, setPirSensor] = useState(null);
    const canvasRef = useRef(null);

    webSocketCam.onmessage = (message) => {
        const url = URL.createObjectURL(message.data);
        setVideoURL(url);
    };

    webSocketPIR.onmessage = (message) => {
        setPirSensor(+message.data);
    }

    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");

        const img = new Image();
        img.src = videoURL;
        img.onload = function () {
            canvas.style.width = this.width + "px";
            canvas.style.height = this.height + "px";
            context.drawImage(
                this,
                0,
                0,
                this.width,
                this.height,
                0,
                0,
                canvas.width,
                canvas.height
            );
            context.rotate(-Math.PI/2);
        };
    }, [videoURL]);

    return (
        <div className="App">
            <Container maxWidth="sm" style={styles.mainContainer}>
                <CameraIndoor color="primary" sx={{ fontSize: 56 }} />
                <Typography variant="h3" component="h2" color="primary">
                    RC Project
                </Typography>
            </Container>
            <Container maxWidth="md" style={styles.basicContainer}>
                <canvas id="canvas" ref={canvasRef}></canvas>
            </Container>
            <Container maxWidth="sm" style={styles.endContainer}>
                <Typography variant="h6" component="h2" color="primary">
                    PIR Sensor: { !!pirSensor ? 'Motion is detected!' : 'Motion is not detected!'}
                </Typography>
            </Container>
        </div>
    );
}

const styles = {
    mainContainer: {
        textAlign: "center",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 50,
        marginBottom: "auto",
    },
    basicContainer: {
        textAlign: "center",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flex: 1,
    },
    endContainer: {
        textAlign: "center",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        marginTop: "auto",
        paddingTop: "10px",
        paddingBottom: "50px",
    }
};

export default App;
