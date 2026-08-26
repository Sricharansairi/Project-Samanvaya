import requests
import json

base_url = "https://integrate.api.nvidia.com/v1"

models_to_test = [
    "meta/llama-3.2-3b-instruct",
    "meta/llama-3.2-1b-instruct",
    "meta/llama3-70b-instruct",
    "meta/llama-3-70b-instruct",
    "mistralai/mixtral-8x22b-instruct-v0.1",
    "mistralai/mistral-large-2407",
    "nvidia/llama-3.1-nemotron-70b-instruct"
]

for model in models_to_test:
    payload = {
        "model": model,
        "messages": [{"role": "user", "content": "hello"}],
        "max_tokens": 5
    }
    headers = {
        "Authorization": "Bearer dummy_key",
        "Content-Type": "application/json"
    }
    
    response = requests.post(f"{base_url}/chat/completions", json=payload, headers=headers)
    print(f"Model: {model} -> Status: {response.status_code}")

# Let's also check the RAG models (different endpoint probably, or same just diff format, let's see if it 401s)
rag_models = [
    "nvidia/nv-embedqa-e5-v5",
    "nvidia/nv-embed-v1",
    "snowflake/arctic-embed-l"
]
for model in rag_models:
    payload = {
        "input": ["hello"],
        "model": model,
        "input_type": "query"
    }
    response = requests.post(f"{base_url}/embeddings", json=payload, headers=headers)
    print(f"RAG Embed Model: {model} -> Status: {response.status_code}")
