import unittest
from app.services.scheme_agent import evaluate_schemes, generate_patient_scheme_message

class TestSchemeAgent(unittest.TestCase):
    def test_deterministic_schemes(self):
        # Universal scheme in Rajasthan
        raj_schemes = evaluate_schemes("Rajasthan")
        self.assertEqual(len(raj_schemes), 1)
        self.assertIn("Chiranjeevi", raj_schemes[0]["scheme_name"])
        
        # Income threshold scheme in AP
        ap_schemes_eligible = evaluate_schemes("Andhra Pradesh", patient_income=300000)
        self.assertEqual(len(ap_schemes_eligible), 1)
        self.assertIn("Aarogyasri", ap_schemes_eligible[0]["scheme_name"])
        
        # Ineligible
        ap_schemes_ineligible = evaluate_schemes("Andhra Pradesh", patient_income=800000)
        self.assertEqual(len(ap_schemes_ineligible), 0)

if __name__ == "__main__":
    unittest.main()
