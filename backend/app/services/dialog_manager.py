import json
from openai import OpenAI
from app.core.key_rotator import key_rotator

class TriageSession:
    def __init__(self, client_id: str):
        self.client_id = client_id
        self.history = []
        self.extracted_symptoms = []
        self.system_prompt = """You are a highly skilled Triage AI at an Indian Government Hospital.
Your goal is to extract the patient's Chief Complaint, History of Present Illness (HPI), and any red flags.
Follow the SOCRATES pain framework if applicable.
Keep your questions extremely short, empathetic, and simple (suitable for low-literacy patients).
Do NOT ask more than 1 question at a time.
If the patient's symptoms are fully clear and sufficient for a doctor, set "status" to "complete".

You MUST ALWAYS respond with a raw JSON object with no other text or markdown, in the following format:
{
    "status": "interviewing" | "complete",
    "next_question_audio_text": "What to say to the patient next",
    "suggested_chips": ["Option 1", "Option 2", "Option 3"],
    "current_extracted_symptoms": ["list", "of", "all", "symptoms", "so", "far"]
}
"""
        self.history.append({"role": "system", "content": self.system_prompt})
        
        # Add initial prompt
        self.history.append({"role": "assistant", "content": json.dumps({
            "status": "interviewing",
            "next_question_audio_text": "Namaste. How can I help you today? Where are you feeling uncomfortable?",
            "suggested_chips": ["Fever", "Stomach Ache", "Cough", "Chest Pain"],
            "current_extracted_symptoms": []
        })})

    def process_patient_input(self, text: str) -> dict:
        api_key = key_rotator.get_llama_3_3_70b_key()
        client = OpenAI(
            base_url="https://integrate.api.nvidia.com/v1",
            api_key=api_key
        )
        
        self.history.append({"role": "user", "content": text})
        
        try:
            completion = client.chat.completions.create(
                model="nvidia/llama-3.1-nemotron-70b-instruct",
                messages=self.history,
                temperature=0.3,
                max_tokens=512,
                response_format={"type": "json_object"}
            )
            
            response_text = completion.choices[0].message.content.strip()
            result = json.loads(response_text)
            
            # Save assistant response to history
            self.history.append({"role": "assistant", "content": response_text})
            
            # Update internal state
            self.extracted_symptoms = result.get("current_extracted_symptoms", [])
            
            return result
        except Exception as e:
            print(f"Dialog Manager Error: {e}")
            return {
                "status": "error",
                "next_question_audio_text": "Sorry, I didn't catch that. Could you repeat?",
                "suggested_chips": [],
                "current_extracted_symptoms": self.extracted_symptoms
            }
