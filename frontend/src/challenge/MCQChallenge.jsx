import React from "react";
import { useState } from "react";

export function MCQChallenge({challenge, showExplanation=false}) {
    const [selectedOption, setSelectedOption] = useState(null)
    const [isShowExplanation, setIsShowExplanation] = useState(showExplanation)

    const options = typeof challenge.options === "string"
        ? JSON.parse(challenge.options)
        : challenge.options 

    const handleOptionsSelect = (index) => {
        if(selectedOption !== null) return;
        setSelectedOption(index)
        setIsShowExplanation(true)
    }

    const getOptionClass = (index) => {
        if(selectedOption === null) "option";

        if(selectedOption===index && index === challenge.correct_answer_id) {
            return "option correct"
        }

        if(selectedOption === index && index != challenge.correct_answer_id) {
            return "option incorrect"
        }

        return "option"
    }

    return <div className="challenge-display">
        <p><strong>Difficulty</strong>: {challenge.difficulty}</p>
        <p className="challenge-title">{challenge.title}</p>
        <div className="options">
            {options && options.map((option, index) => (
                <div 
                    className={getOptionClass(index)}
                    key={index}
                    onClick={() => handleOptionsSelect(index)}
                >
                    {option}
                </div>
            ))}
        </div>

        {isShowExplanation && selectedOption !== null && (
            <div className="explanation">
                <h4>Explanation</h4>
                <p>{challenge.explanation}</p>
            </div>
        )}
    </div>
}