import React from "react";

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
                    height: "18%",
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
            </div>
            <div
                style={{
                    display: "flex",
                    height: "70%",
                    width: "100%",
                    flexDirection: "column",
                    alignItems: "center",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        width: "80%",
                        alignItems: "center",
                        backgroundColor: "#94d1f2",
                        padding: "5px 10px 5px 10px",
                        borderRadius: "10px",
                        fontSize: "12px",
                    }}
                >
                    <p>
                        {question} Below, view instructions regarding how to
                        complete the next step of this pre-visit form, and press{" "}
                        <strong>'Start Conversation'</strong> to begin.
                    </p>
                </div>
                <div
                    style={{
                        display: "flex",
                        width: "fit-content",
                        height: "55%",
                        alignItems: "center",
                        padding: "5px 5px 5px 5px",
                        fontSize: "12px",
                        marginTop: "10px",
                        marginBottom: "10px",
                    }}
                >
                    <img
                        src="/breezymedtutorial.jpg"
                        alt=""
                        style={{
                            border: "solid 1px",
                            maxHeight: "100%",
                            maxWidth: "100%",
                        }}
                    />
                </div>
                {/* <p
                    style={{
                        fontSize: "18px",
                        fontWeight: "400",
                        width: "80%",
                    }}
                >
                    {question}
                </p> */}
            </div>
            <div
                style={{
                    display: "flex",
                    height: "10%",
                    width: "100%",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "end",
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
                        width: "80%",
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
