import { useState } from "react";

export const DailingAudio = ({ name = "Faramade", visible = false, onEnd }) => {
  return (<div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
        width: "70vh",
        height: "35vh",
        color: "black",
        borderRadius: "5px",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
      }}
    >
      <h1>Dialing {name} !</h1>
      <audio loop controls={false} autoPlay={visible}>
        <source src="/asset/dial_tone.mp3" type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
      <button type="button" onClick={onEnd}>
        END CALL
      </button>
    </div>
  );
};
