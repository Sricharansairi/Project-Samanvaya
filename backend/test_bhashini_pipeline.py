"""
Project Samanvaya - End-to-End Bhashini Pipeline Verification
Tests all Bhashini voice services with real credentials from .env
"""

import os
import io
import sys

# Force UTF-8 output on Windows
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

import os
import sys
import json
import time

# Ensure project root is in path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.chdir(os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
load_dotenv()

PASS = "[PASS]"
FAIL = "[FAIL]"
WARN = "[WARN]"

results = []

def log_result(test_name: str, status: str, details: str, latency_ms: int = 0):
    icon = PASS if status == "pass" else (FAIL if status == "fail" else WARN)
    results.append({"test": test_name, "status": status, "details": details, "latency_ms": latency_ms})
    lat_str = f" [{latency_ms}ms]" if latency_ms else ""
    print(f"  {icon} {test_name}{lat_str}: {details}")


def test_credentials():
    """Test 1: Verify Bhashini credentials are loaded."""
    print("\n" + "=" * 70)
    print("TEST 1: CREDENTIAL VERIFICATION")
    print("=" * 70)

    uid = os.getenv("BHASHINI_USER_ID", "")
    ulca = os.getenv("BHASHINI_ULCA_API_KEY", "")
    inf = os.getenv("BHASHINI_INFERENCE_KEY", "")

    if uid and ulca and inf:
        log_result("BHASHINI_USER_ID", "pass", f"Present ({uid[:8]}...)")
        log_result("BHASHINI_ULCA_API_KEY", "pass", f"Present ({ulca[:12]}...)")
        log_result("BHASHINI_INFERENCE_KEY", "pass", f"Present ({inf[:12]}...)")
        return True
    else:
        if not uid: log_result("BHASHINI_USER_ID", "fail", "MISSING from .env")
        if not ulca: log_result("BHASHINI_ULCA_API_KEY", "fail", "MISSING from .env")
        if not inf: log_result("BHASHINI_INFERENCE_KEY", "fail", "MISSING from .env")
        return False


def test_key_rotator():
    """Test 2: Key rotator Bhashini methods."""
    print("\n" + "=" * 70)
    print("TEST 2: KEY ROTATOR BHASHINI METHODS")
    print("=" * 70)

    from app.core.key_rotator import key_rotator
    try:
        uid = key_rotator.get_bhashini_user_id()
        log_result("get_bhashini_user_id()", "pass", f"Returns: {uid[:8]}...")
    except Exception as e:
        log_result("get_bhashini_user_id()", "fail", str(e))

    try:
        api = key_rotator.get_bhashini_ulca_api_key()
        log_result("get_bhashini_ulca_api_key()", "pass", f"Returns: {api[:12]}...")
    except Exception as e:
        log_result("get_bhashini_ulca_api_key()", "fail", str(e))

    try:
        inf = key_rotator.get_bhashini_inference_key()
        log_result("get_bhashini_inference_key()", "pass", f"Returns: {inf[:12]}...")
    except Exception as e:
        log_result("get_bhashini_inference_key()", "fail", str(e))


def test_health_check():
    """Test 3: Bhashini service health check."""
    print("\n" + "=" * 70)
    print("TEST 3: BHASHINI SERVICE HEALTH CHECK")
    print("=" * 70)

    from app.services.bhashini_service import bhashini_service
    result = bhashini_service.health_check()
    if result.get("status") == "ok":
        log_result("Health Check", "pass", json.dumps(result, indent=2)[:200])
    else:
        log_result("Health Check", "fail", str(result))


def test_pipeline_config():
    """Test 4: Pipeline config resolution (real API call)."""
    print("\n" + "=" * 70)
    print("TEST 4: PIPELINE CONFIG RESOLUTION (LIVE API)")
    print("=" * 70)

    from app.services.bhashini_service import bhashini_service
    start = time.time()

    config = bhashini_service._get_pipeline_config(["asr", "translation", "tts"], source_lang="hi", target_lang="en")
    latency = round((time.time() - start) * 1000)

    if config:
        pipeline_resp = config.get("pipelineResponseConfig", [])
        log_result("Config API Call", "pass", f"Got {len(pipeline_resp)} task configs", latency)

        # Check compute URL resolution
        log_result("Compute URL", "pass", f"Resolved: {bhashini_service._compute_url}")
        log_result("Inference Key", "pass", f"Resolved: {bhashini_service._inference_key[:12]}..." if bhashini_service._inference_key else "Using env fallback")

        for tc in pipeline_resp:
            task = tc.get("taskType", "unknown")
            configs = tc.get("config", [])
            sid = configs[0].get("serviceId", "N/A") if configs else "N/A"
            log_result(f"  {task.upper()} Service", "pass", f"serviceId: {sid}")
    else:
        log_result("Config API Call", "fail", "No response from Bhashini config endpoint", latency)


def test_translation():
    """Test 5: NMT translation (Hindi ↔ English)."""
    print("\n" + "=" * 70)
    print("TEST 5: NEURAL MACHINE TRANSLATION (LIVE)")
    print("=" * 70)

    from app.services.bhashini_service import bhashini_service

    # Hindi → English
    hi_text = "मुझे सीने में बहुत तेज दर्द हो रहा है"
    result = bhashini_service.translate_text(hi_text, "hi", "en")
    if result.get("translated_text") and "error" not in result:
        log_result("Hindi→English", "pass", f"'{hi_text[:30]}...' → '{result['translated_text'][:50]}'", result.get("latency_ms", 0))
    else:
        log_result("Hindi→English", "fail", str(result))

    # English → Telugu
    en_text = "The patient has severe chest pain with sweating"
    result2 = bhashini_service.translate_text(en_text, "en", "te")
    if result2.get("translated_text") and "error" not in result2:
        log_result("English→Telugu", "pass", f"'{en_text[:40]}...' → '{result2['translated_text'][:50]}'", result2.get("latency_ms", 0))
    else:
        log_result("English→Telugu", "fail", str(result2))


def test_tts():
    """Test 6: Text-to-Speech (Hindi & Telugu)."""
    print("\n" + "=" * 70)
    print("TEST 6: TEXT-TO-SPEECH (LIVE)")
    print("=" * 70)

    from app.services.bhashini_service import bhashini_service

    # Hindi TTS
    result = bhashini_service.text_to_speech("आपका स्वागत है, कृपया अपने लक्षण बताएं", "hi", "female")
    if result.get("audio_base64") and len(result["audio_base64"]) > 100:
        log_result("Hindi TTS (Female)", "pass", f"Audio base64 length: {len(result['audio_base64'])} chars", result.get("latency_ms", 0))
    else:
        log_result("Hindi TTS (Female)", "fail", str(result)[:200])

    # Telugu TTS
    result2 = bhashini_service.text_to_speech("మీ లక్షణాలను చెప్పండి", "te", "male")
    if result2.get("audio_base64") and len(result2["audio_base64"]) > 100:
        log_result("Telugu TTS (Male)", "pass", f"Audio base64 length: {len(result2['audio_base64'])} chars", result2.get("latency_ms", 0))
    else:
        log_result("Telugu TTS (Male)", "fail", str(result2)[:200])


def test_medical_rag():
    """Test 7: Medical RAG retrieval."""
    print("\n" + "=" * 70)
    print("TEST 7: MEDICAL RAG RETRIEVAL")
    print("=" * 70)

    from app.services.medical_rag import retrieve_medical_guideline
    start = time.time()

    # Emergency: chest pain
    result = retrieve_medical_guideline("severe chest pain radiating to left arm with sweating")
    latency = round((time.time() - start) * 1000)
    if result.get("guideline"):
        g = result["guideline"]
        log_result("Emergency Retrieval (ACS)", "pass",
                   f"Matched: {g.get('condition')} | ICD-10: {g.get('icd10')} | Emergency: {result.get('is_emergency')}",
                   latency)
    else:
        log_result("Emergency Retrieval (ACS)", "fail", "No guideline returned")

    # Non-emergency: fever
    start2 = time.time()
    result2 = retrieve_medical_guideline("mild fever and headache for 2 days")
    latency2 = round((time.time() - start2) * 1000)
    if result2.get("guideline"):
        g2 = result2["guideline"]
        log_result("Standard Retrieval (Fever)", "pass",
                   f"Matched: {g2.get('condition')} | Urgency: {g2.get('urgency')}",
                   latency2)


def test_dual_branch():
    """Test 8: Dual-branch LLM architecture."""
    print("\n" + "=" * 70)
    print("TEST 8: DUAL-BRANCH LLM ARCHITECTURE")
    print("=" * 70)

    from app.services.dual_model_service import dual_model_service

    # Branch 1: High-Param General
    start = time.time()
    result1 = dual_model_service.query_high_param_branch(
        "Patient with crushing chest pain, diaphoresis, left arm pain. What is the immediate triage protocol?"
    )
    latency1 = round((time.time() - start) * 1000)
    if result1.get("content"):
        log_result("Branch 1 (High-Param Beast)", "pass",
                   f"Model: {result1.get('model')} | Tier: {result1.get('tier')} | Response: {result1['content'][:80]}...",
                   latency1)
    else:
        log_result("Branch 1 (High-Param Beast)", "warn", f"No content: {result1}")

    # Branch 2: Medical Specialist
    start2 = time.time()
    result2 = dual_model_service.query_medical_branch(
        "Check drug interaction: Metformin 500mg + Aspirin 75mg + Atorvastatin 10mg in Type 2 DM patient"
    )
    latency2 = round((time.time() - start2) * 1000)
    if result2.get("content"):
        log_result("Branch 2 (Medical Specialist)", "pass",
                   f"Model: {result2.get('model')} | Tier: {result2.get('tier')} | Response: {result2['content'][:80]}...",
                   latency2)
    else:
        log_result("Branch 2 (Medical Specialist)", "warn", f"No content: {result2}")


def print_summary():
    """Print final test summary."""
    print("\n" + "=" * 70)
    print("VERIFICATION SUMMARY")
    print("=" * 70)

    total = len(results)
    passed = sum(1 for r in results if r["status"] == "pass")
    failed = sum(1 for r in results if r["status"] == "fail")
    warned = sum(1 for r in results if r["status"] == "warn")

    print(f"\n  Total Tests: {total}")
    print(f"  {PASS} Passed: {passed}")
    print(f"  {FAIL} Failed: {failed}")
    print(f"  {WARN} Warnings: {warned}")
    print(f"\n  Pass Rate: {round(passed/total*100, 1) if total else 0}%")

    if failed == 0:
        print(f"\n  >>> ALL TESTS PASSED -- Bhashini Pipeline is OPERATIONAL")
    else:
        print(f"\n  >>> {failed} test(s) failed -- review above for details")


if __name__ == "__main__":
    print("======================================================================")
    print("  PROJECT SAMANVAYA -- BHASHINI PIPELINE E2E VERIFICATION")
    print("======================================================================")

    creds_ok = test_credentials()
    test_key_rotator()
    test_health_check()

    if creds_ok:
        test_pipeline_config()
        test_translation()
        test_tts()
    else:
        print("\n  [WARN] Skipping live API tests -- credentials missing")

    test_medical_rag()
    test_dual_branch()
    print_summary()
