import os
import random
from typing import List
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class SmartKeyRotator:
    def __init__(self):
        # Dynamically scan os.environ for keys matching the specific model prefixes
        self.llama_3_3_70b_keys = self._get_keys_by_prefix("NVIDIA_LLAMA_3_3_70B_KEY_")
        self.llama_3_2_90b_keys = self._get_keys_by_prefix("NVIDIA_LLAMA_3_2_90B_KEY_")
        self.phi_4_keys = self._get_keys_by_prefix("NVIDIA_PHI_4_KEY_")
        
        self.sarvam_keys = self._get_keys_by_prefix("SARVAM_API_KEY_")

    def _get_keys_by_prefix(self, prefix: str) -> List[str]:
        """Scans environment variables for keys starting with the given prefix."""
        keys = []
        for env_var, value in os.environ.items():
            if env_var.startswith(prefix) and value.strip():
                keys.append(value.strip())
        return keys

    def get_llama_3_3_70b_key(self) -> str:
        if not self.llama_3_3_70b_keys:
            raise ValueError("No Llama 3.3 70B keys found in .env!")
        return random.choice(self.llama_3_3_70b_keys)

    def get_llama_3_2_90b_key(self) -> str:
        if not self.llama_3_2_90b_keys:
            raise ValueError("No Llama 3.2 90B keys found in .env!")
        return random.choice(self.llama_3_2_90b_keys)

    def get_phi_4_key(self) -> str:
        if not self.phi_4_keys:
            raise ValueError("No Phi-4 Multimodal keys found in .env!")
        return random.choice(self.phi_4_keys)


    def get_sarvam_key(self) -> str:
        if not self.sarvam_keys:
            raise ValueError("No SARVAM API keys found in .env!")
        return random.choice(self.sarvam_keys)

# Instantiate a singleton to be used across the application
key_rotator = SmartKeyRotator()