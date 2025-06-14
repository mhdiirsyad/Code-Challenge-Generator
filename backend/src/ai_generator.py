import os 
import json
import google.generativeai as genai
from typing import Dict, Any
from dotenv import load_dotenv
from fastapi import HTTPException

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_SECRET_KEY"))

def generate_challenge_ai(difficulty: str) -> Dict[str, Any]:
    system_prompt = """You are an expert coding challenge creator. 
    Your task is to generate a coding question with multiple choice answers.
    The question should be appropriate for the specified difficulty level.

    For easy questions: Focus on basic syntax, simple operations, or common programming concepts.
    For medium questions: Cover intermediate concepts like data structures, algorithms, or language features.
    For hard questions: Include advanced topics, design patterns, optimization techniques, or complex algorithms.

    Return the challenge in the following JSON structure:
    {
        "title": "The question title",
        "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
        "correct_answer_id": 0, // Index of the correct answer (0-3)
        "explanation": "Detailed explanation of why the correct answer is right"
    }

    Make sure the options are plausible but with only one clearly correct answer.
    """

    try:
        model = genai.GenerativeModel('gemini-2.0-flash-lite')

        generation_config = genai.types.GenerationConfig(
            response_mime_type="application/json", 
            temperature=0.6
        )

        response = model.generate_content(
            contents=f"{system_prompt}\n\nGenerate a {difficulty} difficulty coding challenge.",
            generation_config=generation_config,
        )
        content = response.text
        challenge_data = json.loads(content)

        required_field = ["title", "options", "correct_answer_id", "explanation"]
        for field in required_field:
            if field not in challenge_data:
                raise ValueError(f"Missing required field: {field}")
        
        return challenge_data
    
    except Exception as e:
        # # Cetak error ke terminal backend Anda untuk debugging
        # print(f"An error occurred while calling OpenAI API: {e}")
        # # Jangan kembalikan data fallback. Sebaliknya, lemparkan error HTTP.
        # # Ini akan memberi tahu frontend bahwa ada yang salah.
        # raise HTTPException(status_code=503, detail="Failed to generate challenge from AI service.")
        
        print(str(e))
        fallback_data =  {
            "title": "Basic Python List Operation",
            "options": [
                "my_list.append(5)",
                "my_list.add(5)",
                "my_list.push(5)",
                "my_list.insert(5)",
            ],
            "correct_answer_id": 0,
            "explanation": "In Python, append() is the correct method to add an element into list"
        }
        print("\n")
        print(fallback_data)
        print("\n")
        return fallback_data