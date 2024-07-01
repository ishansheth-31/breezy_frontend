import React, { useState, useEffect } from "react";

const ResponsiveFormPage = ({
    stageNumber,
    setStageNumber,
    question,
    handleSubmission,
    submitLabel,
    inputs,
}) => {
    const [input, setInput] = useState(Array(inputs.length).fill(""));
    const [cumulativeInput, setCumulativeInput] = useState([]);
    const [isNone, setIsNone] = useState(false);

    useEffect(() => {
        setInput(Array(inputs.length).fill(""));
        setCumulativeInput([]);
        setIsNone(false);
    }, [stageNumber, inputs.length]);

    const handleInputChange = (index, value) => {
        const newInput = [...input];
        newInput[index] = value;
        setInput(newInput);
    };

    const isAnyInputEmpty = () => {
        return input.some((value) => value.trim() === "");
    };

    const isAnyCumInputEmpty = () => {
        if (isNone) return false;
        if (cumulativeInput.length > 0) return false;
        return true;
    };

    const handleAddInput = () => {
        if (!isAnyInputEmpty()) {
            const newEntry = {};
            inputs.forEach((inputField, index) => {
                newEntry[inputField.inputLabel] = input[index];
            });
            setCumulativeInput([...cumulativeInput, newEntry]);
            setInput(Array(inputs.length).fill(""));
        }
    };

    const handleCheckboxChange = () => {
        setIsNone(!isNone);
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
                    height: "35%",
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
                    width: "95%",
                    height: "55%",
                    alignItems: "start",
                    justifyContent: "start",
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
                    {question}{" "}
                    <span
                        style={{
                            fontSize: "12px",
                            fontWeight: "600",
                            color: "#65C6FF",
                        }}
                    >
                        (click + to add)
                    </span>
                </p>
                <div
                    style={{
                        display: "flex",
                        width: "100%",
                        gap: "30px",
                    }}
                >
                    {inputs.map((inputField, index) => (
                        <div
                            key={`${index}-${stageNumber}`}
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                width: "100%",
                                flex: 2,
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
                                    borderRadius: "0px",
                                }}
                                name={inputField.inputLabel}
                                onChange={(e) =>
                                    handleInputChange(index, e.target.value)
                                }
                                type={inputField.inputType}
                                value={input[index]}
                            />
                            <p
                                style={{
                                    marginTop: "0px",
                                    marginLeft: "2px",
                                    fontSize: "12px",
                                }}
                            >
                                {inputField.inputLabel}
                            </p>
                        </div>
                    ))}
                    <button
                        onClick={handleAddInput}
                        style={{
                            borderColor: "#65C6FF",
                            color: "#ffffff",
                            height: "50%",
                            borderRadius: "2px",
                            border: "1px solid #000000",
                            backgroundColor: "#94d1f2",
                            fontSize: "12px",
                            fontWeight: "600",
                            cursor: "pointer",
                        }}
                    >
                        +
                    </button>
                </div>
                <div
                    style={{
                        overflowY: "auto",
                        width: "100%",
                        marginBottom: "10px",
                        marginLeft: "10px",
                        paddingRight: "10px",
                    }}
                >
                    {cumulativeInput.toReversed().map((entry, index) => (
                        <div
                            key={index}
                            style={{
                                display: "flex",
                                width: "100%",
                                gap: "30px",
                            }}
                        >
                            {Object.entries(entry).map(([key, value]) => (
                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        width: "90%",
                                        flex: 1,
                                    }}
                                >
                                    <div
                                        style={{
                                            height: "28px",
                                            width: "100%",
                                            borderTop: "none",
                                            borderLeft: "none",
                                            borderRight: "none",
                                            borderBottom: "1px solid",
                                            fontSize: "18px",
                                            borderRadius: "0px",
                                        }}
                                    >
                                        {value}
                                    </div>
                                    <p
                                        style={{
                                            marginTop: "0px",
                                            marginLeft: "2px",
                                            fontSize: "12px",
                                        }}
                                    >
                                        {key}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
                <div>
                    <input
                        type="checkbox"
                        id="none"
                        name="none"
                        checked={isNone}
                        onChange={handleCheckboxChange}
                    />
                    <label htmlFor="none">None</label>
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
                        if (!isAnyCumInputEmpty() || !isAnyInputEmpty()) {
                            if (isNone) {
                                handleSubmission("none", stageNumber);
                            } else {
                                handleAddInput();
                                handleSubmission(
                                    JSON.stringify(cumulativeInput),
                                    stageNumber
                                );
                            }
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
                </button>
            </div>
        </div>
    );
};

export default ResponsiveFormPage;
