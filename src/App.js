import React, { useState } from "react";
import axios from "axios";
import "./App.css";
import FormPage from "./Components/formpage";
import ChatPage from "./Components/chatpage";
import MedFormPage from "./Components/responsiveformpage";
import BinaryFormPage from "./Components/binaryformpage";
import EndPage from "./Components/endpage";
import audioServiceInstance from './Components/audioService';


function App() {
    const pathParts = window.location.href.split("/");
    const patient_id = pathParts[pathParts.length - 1];

    const [initialQuestions, setInitialQuestions] = useState({
        "What is your first and last name?": "",
        "What is your approximate height?": "4'0\"",
        "What is your approximate weight?": "",
        "Have you started any new medications?": "",
        "Have you had any recent surgeries?": "",
        "Do you have any known drug allergies?": "",
        "Do you smoke or vape?": "",
        "Do you have exposure to 2nd-hand smoke or passive exposure?": "",
        "Do you consume smokeless tobacco products? (Chewing tobacco, Zyn, nicotine patches, etc.)":
            "",
        "Do you consume alcohol or other drugs?": "",
        "Do you have a regular exercise habit?": "",
        "Finally, what is the main reason for your visit?": "",
    });
    const [isConversationStarted, setIsConversationStarted] = useState(false);
    const [stageNumber, setStageNumber] = useState(-1);
    const [loading, setLoading] = useState(false);
    const [chatHistory, setChatHistory] = useState([]);
    const [isPlayingAudio, setIsPlayingAudio] = useState(false);


    const handleSubmission = (input, stageNumber) => {
        const questionKey = Object.keys(initialQuestions)[stageNumber];
        const updatedQuestions = {
            ...initialQuestions,
            [questionKey]: input,
        };
        setInitialQuestions(updatedQuestions);
    };

    const handlePlayAudio = async (audioUrl) => {
        try {
            setIsPlayingAudio(true);
            await audioServiceInstance.playAudio(audioUrl);
        } catch (error) {
            console.error("Error playing audio:", error);
        } finally {
            setIsPlayingAudio(false);
        }
    };

    const startConversation = async () => {
        try {
            setLoading(true);
            const response = await axios.post(
                `https://breezy-backend-de177311f71b.herokuapp.com/start/${patient_id}`,
                initialQuestions,
                {
                    headers: { "Content-Type": "application/json" },
                }
            );
            setChatHistory([
                { role: "assistant", content: response.data.initial_response },
            ]);

            const audioUrl = await audioServiceInstance.fetchAudio(response.data.initial_response);

            setIsConversationStarted(true);
            setLoading(false);

            if (audioUrl) {
                try {
                    await handlePlayAudio(audioUrl);  // Play the nurse's response
                } catch (error) {
                    console.error("Error playing audio:", error);
                }
            }
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
                    (stageNumber === 11) && (
                    <>
                        <FormPage
                            stageNumber={stageNumber}
                            setStageNumber={setStageNumber}
                            question={
                                Object.keys(initialQuestions)[stageNumber]
                            }
                            handleSubmission={handleSubmission}
                            submitLabel={
                                stageNumber === 11 ? "Submit Reason" : "Next"
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
                                    : stageNumber === 11
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
                            question={
                                Object.keys(initialQuestions)[stageNumber]
                            }
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
                (stageNumber === 12 && (
                    <EndPage
                        stageNumber={stageNumber}
                        setStageNumber={setStageNumber}
                        question={
                            "Thank you for the information so far! You will now begin a quick conversation with Ava, your virtual nurse. This will be a verbal conversation just as you may have with any other nurse."
                        }
                        handleSubmission={startConversation}
                        submitLabel={"Start Conversation"}
                    />
                )) ||
                (stageNumber >= 6 && stageNumber < 12 && (
                    <BinaryFormPage
                        stageNumber={stageNumber}
                        setStageNumber={setStageNumber}
                        question={Object.keys(initialQuestions)[stageNumber]}
                        handleSubmission={handleSubmission}
                        submitLabel="Next"
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
