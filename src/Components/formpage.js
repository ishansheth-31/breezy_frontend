import React, { useState, useEffect } from "react";

const FormPage = ({
    stageNumber,
    setStageNumber,
    question,
    handleSubmission,
    submitLabel,
    inputs,
}) => {
    const [input, setInput] = useState(Array(inputs.length).fill(""));

    useEffect(() => {
        setInput(Array(inputs.length).fill(""));
    }, [stageNumber, inputs.length]);

    const handleInputChange = (index, value) => {
        const newInput = [...input];
        newInput[index] = value;
        setInput(newInput);
    };

    const isAnyInputEmpty = () => {
        return input.some((value) => value.trim() === "");
    };

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
                <p style={{ fontSize: "18px", fontWeight: "400" }}>
                    {question}
                </p>
                <div style={{ display: "flex", width: "100%", gap: "10px" }}>
                    {inputs.map((input, index) => (
                        <div
                            key={`${index}-${stageNumber}`}
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                flex: 1,
                            }}
                        >
                            <input
                                style={{
                                    height: "28px",
                                    width: "100%",
                                    borderTop: "none",
                                    borderLeft: "none",
                                    borderRight: "none",
                                    borderBottom: "1px solid",
                                    fontSize: "18px",
                                }}
                                name={input.inputLabel}
                                onChange={(e) =>
                                    handleInputChange(index, e.target.value)
                                }
                                type={input.inputType}
                                value={input[index]}
                            />
                            <p
                                style={{
                                    marginTop: "0px",
                                    marginLeft: "2px",
                                    fontSize: "12px",
                                }}
                            >
                                {input.inputLabel}
                            </p>
                        </div>
                    ))}
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
                <button
                    onClick={() => {
                        if (!isAnyInputEmpty()) {
                            handleSubmission(input, stageNumber);
                            if (stageNumber !== 7) {
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
                </button>
            </div>
        </div>
    );
};

export default FormPage;
