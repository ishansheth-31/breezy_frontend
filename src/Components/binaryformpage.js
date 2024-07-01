import React, { useState, useEffect } from "react";

const BinaryFormPage = ({
    stageNumber,
    setStageNumber,
    question,
    handleSubmission,
    submitLabel,
}) => {
    const [input, setInput] = useState("");

    useEffect(() => {
        setInput("");
    }, [stageNumber]);

    const handleButtonClick = (value) => {
        setInput(value);
        handleSubmission(input, stageNumber);
        if (stageNumber !== 12) {
            setStageNumber(stageNumber + 1);
        }
    };

    // const isInputEmpty = () => {
    //     return input.trim() === "";
    // };

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
                    height: "55%",
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
                        width: "80%",
                        alignItems: "center",
                        backgroundColor: "#94d1f2",
                        padding: "5px 10px 5px 10px",
                        borderRadius: "10px",
                        fontSize: "12px",
                        marginTop: "10px",
                    }}
                >
                    <p>
                        This survey is for{" "}
                        <strong>Southern Urogynecology</strong>. Please complete
                        this form so we can help serve you.
                    </p>
                </div>
            </div>
            <div
                style={{
                    display: "flex",
                    width: "80%",
                    height: "35%",
                    alignItems: "start",
                    flexDirection: "column",
                }}
            >
                <img
                    style={{
                        width: "40px",
                    }}
                    src="./Logo.svg"
                    alt="Logo"
                />
                <p
                    style={{
                        fontSize: "18px",
                        fontWeight: "400",
                    }}
                >
                    {question}
                </p>
                <div
                    style={{
                        display: "flex",
                        width: "100%",
                        gap: "30px",
                    }}
                >
                    <button
                        className="hoverButtonYN"
                        onClick={() => handleButtonClick("yes")}
                        style={{
                            height: "40px",
                            width: "100px",
                            borderRadius: "5px",
                            backgroundColor:
                                input === "yes" ? "#2e9ee8" : "#fff",
                            border: "1px solid #2e9ee8",
                            color: input === "yes" ? "#fff" : "#2e9ee8",
                            fontSize: "18px",
                            cursor: "pointer",
                            transition: "background-color 0.3s, color 0.3s",
                        }}
                    >
                        Yes
                    </button>
                    <button
                        className="hoverButtonYN"
                        onClick={() => handleButtonClick("no")}
                        style={{
                            height: "40px",
                            width: "100px",
                            borderRadius: "5px",
                            backgroundColor:
                                input === "no" ? "#2e9ee8" : "#fff",
                            border: "1px solid #2e9ee8",
                            color: input === "no" ? "#fff" : "#2e9ee8",
                            fontSize: "18px",
                            cursor: "pointer",
                            transition: "background-color 0.3s, color 0.3s",
                        }}
                    >
                        No
                    </button>
                </div>
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
                {/* <button
                    onClick={() => {
                        if (!isInputEmpty()) {
                            handleSubmission(input, stageNumber);
                            if (stageNumber !== 12) {
                                setStageNumber(stageNumber + 1);
                            }
                        }
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
                </button> */}
            </div>
        </div>
    );
};

export default BinaryFormPage;
