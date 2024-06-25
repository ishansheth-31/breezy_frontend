import React, { useState, useEffect } from "react";

const EndPage = ({
    stageNumber,
    setStageNumber,
    question,
    handleSubmission,
    submitLabel,
}) => {
    return (
        <div
            style={{
                display: "flex",
                width: "100%",
                flexDirection: "column",
                padding: "15px",
                alignItems: "start",
            }}
        >
            <div
                style={{
                    display: "flex",
                    height: "90%",
                    width: "100%",
                    flexDirection: "column",
                }}
            >
                <p
                    style={{
                        fontWeight: "600",
                        marginBottom: "10px",
                    }}
                >
                    Breezy Medical
                </p>
                {stageNumber !== -1 && (
                    <p
                        onClick={() => {
                            setStageNumber(stageNumber - 1);
                        }}
                        style={{
                            marginBottom: "20px",
                            marginTop: "0px",
                            color: "#2e9ee8",
                            fontSize: "14px",
                            fontWeight: "600",
                            cursor: "pointer",
                        }}
                    >
                        &lt; Previous
                    </p>
                )}
                <div
                    style={{
                        display: "flex",
                        width: "fit-content",
                        height: "40%",
                        alignItems: "center",
                        backgroundColor: "#94d1f2",
                        padding: "5px 5px 5px 5px",
                        borderRadius: "10px",
                        fontSize: "12px",
                        marginTop: "10px",
                        marginBottom: "10px",
                    }}
                >
                    <img
                        src="/breezymedtutorial.jpg"
                        alt=""
                        style={{
                            borderRadius: "10px",
                            maxHeight: "100%",
                            maxWidth: "auto",
                        }}
                    />
                </div>
                <p
                    style={{
                        fontSize: "18px",
                        fontWeight: "400",
                        width: "80%",
                    }}
                >
                    {question}
                </p>
            </div>
            <div
                style={{
                    display: "flex",
                    width: "100%",
                    height: "10%",
                    alignItems: "end",
                    flexDirection: "column",
                }}
            >
                <button
                    onClick={() => {
                        handleSubmission();
                    }}
                    style={{
                        borderColor: "#65C6FF",
                        backgroundColor: "white",
                        borderRadius: "100px",
                        padding: "10px 20px 10px 20px",
                        border: "1px solid",
                        color: "#2e9ee8",
                        fontSize: "12px",
                        fontWeight: "600",
                        cursor: "pointer",
                    }}
                >
                    {submitLabel}
                </button>
            </div>
        </div>
    );
};

export default EndPage;
