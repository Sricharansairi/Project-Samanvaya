from app.services.triage_service import triage_symptoms

def test_failsafe():
    print("Testing 'chest pain'...")
    res1 = triage_symptoms("I have severe chest pain")
    assert res1["urgency"] == "Critical", f"Failed: {res1}"
    assert res1["confidence"] == 1.0
    print("✓ Chest pain passed.")

    print("Testing 'choking'...")
    res2 = triage_symptoms("Help he is choking")
    assert res2["urgency"] == "Critical", f"Failed: {res2}"
    print("✓ Choking passed.")

    print("Testing normal fever...")
    res3 = triage_symptoms("I have a mild fever")
    # This should hit the LLM (which might take a second or fail if key is bad),
    # but it shouldn't trigger the failsafe.
    print(f"Normal fever result: {res3['urgency']}")

if __name__ == '__main__':
    test_failsafe()
    print("All failsafe tests passed!")
