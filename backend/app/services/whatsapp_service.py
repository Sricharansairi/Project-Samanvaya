def send_whatsapp_message(phone_number: str, message: str, document_url: str = None) -> bool:
    """
    Mock service to simulate sending a WhatsApp/SMS message via a provider like Twilio/Gupshup.
    """
    print(f"--- WHATSAPP MESSAGE SENT TO {phone_number} ---")
    print(message)
    if document_url:
        print(f"Attached Document: {document_url}")
    print("---------------------------------------------")
    
    return True
