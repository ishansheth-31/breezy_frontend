import React, { useState } from "react";
import axios from "axios";
import "./App.css";
import FormPage from "./Components/formpage";
import ChatPage from "./Components/chatpage";
import MedFormPage from "./Components/responsiveformpage";

function App() {
    const pathParts = window.location.href.split("/");
    const patient_id = pathParts[pathParts.length - 1];

    const [initialQuestions, setInitialQuestions] = useState({
        "What is your first and last name?": "",
        "What is your approximate height?": "4'0\"",
        "What is your approximate weight?": "",
        "Are you currently taking any medications?": "",
        "Have you had any recent surgeries?": "",
        "Do you have any known drug allergies?": "",
        "Finally, what are you in for today?": "",
    });
    const [isConversationStarted, setIsConversationStarted] = useState(false);
    const [stageNumber, setStageNumber] = useState(-1);
    const [loading, setLoading] = useState(false);
    const [chatHistory, setChatHistory] = useState([]);

    const handleSubmission = (input, stageNumber) => {
        const questionKey = Object.keys(initialQuestions)[stageNumber];
        const updatedQuestions = {
            ...initialQuestions,
            [questionKey]: input,
        };
        setInitialQuestions(updatedQuestions);
    };

    const startConversation = async () => {
        try {
            setLoading(true);
            const response = await axios.post(
                `http://127.0.0.1:5000/start/${patient_id}`,
                initialQuestions,
                {
                    headers: { "Content-Type": "application/json" },
                }
            );
            setChatHistory([
                { role: "assistant", content: response.data.initial_response },
            ]);
            setIsConversationStarted(true);
            setLoading(false);
        } catch (error) {
            console.error("Error starting conversation:", error);
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                display: "flex",
                height: "85vh",
                //height: "100vh",
                justifyContent: "center",
                background: "white",
                color: "black",
            }}
        >
            {!isConversationStarted ? (
                (stageNumber === -1 && (
                    <FormPage
                        stageNumber={stageNumber}
                        setStageNumber={setStageNumber}
                        question={
                            "I become more intelligent the more you share, so I'll ask some questions that will aid me in assisting you."
                        }
                        handleSubmission={() => {
                            return;
                        }}
                        submitLabel={"Okay"}
                        inputs={[]}
                    />
                )) ||
                ((stageNumber >= 0 && stageNumber < 3) |
                    (stageNumber === 6) && (
                    <>
                        <FormPage
                            stageNumber={stageNumber}
                            setStageNumber={setStageNumber}
                            question={initialQuestions[stageNumber]}
                            handleSubmission={handleSubmission}
                            submitLabel={
                                stageNumber === 6 ? "Submit Reason" : "Next"
                            }
                            inputs={
                                stageNumber === 0
                                    ? [
                                          {
                                              inputType: "text",
                                              inputLabel: "Full Name",
                                          },
                                      ]
                                    : stageNumber === 1
                                    ? [
                                          {
                                              inputType: "number",
                                              inputLabel: "# Feet",
                                          },
                                          {
                                              inputType: "number",
                                              inputLabel: "# Inches",
                                          },
                                      ]
                                    : stageNumber === 2
                                    ? [
                                          {
                                              inputType: "number",
                                              inputLabel: "# Pounds",
                                          },
                                      ]
                                    : stageNumber === 3
                                    ? [
                                          {
                                              inputType: "text",
                                              inputLabel:
                                                  "Medications (separate by comma, put 'no' if none)",
                                          },
                                      ]
                                    : stageNumber === 4
                                    ? [
                                          {
                                              inputType: "text",
                                              inputLabel:
                                                  "Surgeries (separate by comma, put 'no' if none)",
                                          },
                                      ]
                                    : stageNumber === 5
                                    ? [
                                          {
                                              inputType: "text",
                                              inputLabel:
                                                  "Drug Allergies (separate by comma, put 'no' if none)",
                                          },
                                      ]
                                    : stageNumber === 6
                                    ? [
                                          {
                                              inputType: "text",
                                              inputLabel: "Reason for Visit",
                                          },
                                      ]
                                    : []
                            }
                        />
                    </>
                )) ||
                (stageNumber >= 3 && stageNumber < 6 && (
                    <>
                        <MedFormPage
                            stageNumber={stageNumber}
                            setStageNumber={setStageNumber}
                            question={initialQuestions[stageNumber]}
                            handleSubmission={handleSubmission}
                            submitLabel="Next"
                            inputs={
                                stageNumber === 3
                                    ? [
                                          {
                                              inputType: "text",
                                              inputLabel: "Medication",
                                          },
                                          {
                                              inputType: "text",
                                              inputLabel: "Dosage",
                                          },
                                      ]
                                    : stageNumber === 4
                                    ? [
                                          {
                                              inputType: "text",
                                              inputLabel: "Surgery",
                                          },
                                          {
                                              dosage: "date",
                                              inputLabel: "Date",
                                          },
                                      ]
                                    : stageNumber === 5
                                    ? [
                                          {
                                              inputType: "text",
                                              inputLabel: "Drug Allergies",
                                          },
                                      ]
                                    : []
                            }
                        />
                    </>
                )) ||
                (stageNumber === 7 && (
                    <FormPage
                        stageNumber={stageNumber}
                        setStageNumber={setStageNumber}
                        question={
                            "Thank you. Now you will begin a quick 5-minute conversation with our virtual nurse, Ava. This will save you the wait at the doctor’s office."
                        }
                        handleSubmission={startConversation}
                        submitLabel={"Start Conversation"}
                        inputs={[]}
                    />
                ))
            ) : (
                <ChatPage
                    patient_id={patient_id}
                    loading={loading}
                    setLoading={setLoading}
                    chatHistory={chatHistory}
                    setChatHistory={setChatHistory}
                />
            )}
        </div>
    );
}

export default App;
