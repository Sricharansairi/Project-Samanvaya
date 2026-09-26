"""
Project Samanvaya - Professional PowerPoint Presentation Generator
Creates a clean, modern, 7-slide executive pitch deck (16:9 Widescreen)
Complies with instructions: No SIH, no team name, simple, clean, and professional.
"""

import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

def create_deck():
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # Color Palette
    PRIMARY_NAVY = RGBColor(15, 76, 129)       # #0F4C81
    DEEP_NAVY = RGBColor(10, 37, 64)           # #0A2540
    ACCENT_TEAL = RGBColor(13, 148, 136)       # #0D9488
    EMERALD_GREEN = RGBColor(16, 185, 129)     # #10B981
    WARM_ORANGE = RGBColor(234, 88, 12)        # #EA580C
    TEXT_DARK = RGBColor(15, 23, 42)           # #0F172A
    TEXT_SLATE = RGBColor(71, 85, 105)         # #475569
    CARD_BG = RGBColor(248, 250, 252)          # #F8FAFC
    CARD_BORDER = RGBColor(226, 232, 240)      # #E2E8F0
    WHITE = RGBColor(255, 255, 255)
    LIGHT_BLUE = RGBColor(240, 249, 255)       # #F0F9FF
    BORDER_BLUE = RGBColor(186, 230, 253)

    LOGO_PATH = os.path.abspath("frontend/public/logo.png")

    def add_header(slide, title, category_badge):
        # Header Badge
        badge_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.45), Inches(4.5), Inches(0.35))
        tf_b = badge_box.text_frame
        tf_b.word_wrap = True
        tf_b.margin_left = tf_b.margin_top = tf_b.margin_right = tf_b.margin_bottom = 0
        p_b = tf_b.paragraphs[0]
        p_b.text = category_badge.upper()
        p_b.font.size = Pt(10)
        p_b.font.bold = True
        p_b.font.color.rgb = ACCENT_TEAL

        # Title
        title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.75), Inches(9.5), Inches(0.6))
        tf_t = title_box.text_frame
        tf_t.word_wrap = True
        tf_t.margin_left = tf_t.margin_top = tf_t.margin_right = tf_t.margin_bottom = 0
        p_t = tf_t.paragraphs[0]
        p_t.text = title
        p_t.font.size = Pt(22)
        p_t.font.bold = True
        p_t.font.color.rgb = PRIMARY_NAVY

        # Small Logo in top-right
        if os.path.exists(LOGO_PATH):
            slide.shapes.add_picture(LOGO_PATH, Inches(11.5), Inches(0.45), width=Inches(1.05))

        # Thin rule divider
        line = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(1.4), Inches(11.733), Inches(0.015))
        line.fill.solid()
        line.fill.fore_color.rgb = CARD_BORDER
        line.line.color.rgb = CARD_BORDER

    def add_footer(slide, current, total=7):
        footer_box = slide.shapes.add_textbox(Inches(0.8), Inches(7.0), Inches(9.0), Inches(0.3))
        tf = footer_box.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = "Project Samanvaya • National Smart Case-Taking & Clinical Intelligence Platform"
        p.font.size = Pt(9)
        p.font.color.rgb = RGBColor(148, 163, 184)

        num_box = slide.shapes.add_textbox(Inches(10.5), Inches(7.0), Inches(2.0), Inches(0.3))
        tf_num = num_box.text_frame
        p_num = tf_num.paragraphs[0]
        p_num.text = f"{current} / {total}"
        p_num.alignment = PP_ALIGN.RIGHT
        p_num.font.size = Pt(9)
        p_num.font.bold = True
        p_num.font.color.rgb = RGBColor(148, 163, 184)

    # ==========================================
    # SLIDE 1: TITLE SLIDE (COVER)
    # ==========================================
    s1 = prs.slides.add_slide(blank_layout)

    # Background gentle card
    bg_card = s1.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(13.333), Inches(7.5))
    bg_card.fill.solid()
    bg_card.fill.fore_color.rgb = WHITE
    bg_card.line.color.rgb = WHITE

    # Accent Top Stripe
    top_stripe = s1.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(13.333), Inches(0.12))
    top_stripe.fill.solid()
    top_stripe.fill.fore_color.rgb = PRIMARY_NAVY
    top_stripe.line.color.rgb = PRIMARY_NAVY

    # Center Logo
    if os.path.exists(LOGO_PATH):
        s1.shapes.add_picture(LOGO_PATH, Inches(5.666), Inches(1.2), width=Inches(2.0))

    # Badge Pill
    pill = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(3.9), Inches(2.9), Inches(5.533), Inches(0.42))
    pill.fill.solid()
    pill.fill.fore_color.rgb = LIGHT_BLUE
    pill.line.color.rgb = BORDER_BLUE
    tf_p = pill.text_frame
    p_p = tf_p.paragraphs[0]
    p_p.text = "NATIONAL DIGITAL HEALTHCARE ARCHITECTURE"
    p_p.alignment = PP_ALIGN.CENTER
    p_p.font.size = Pt(11)
    p_p.font.bold = True
    p_p.font.color.rgb = PRIMARY_NAVY

    # Main Title
    t_box = s1.shapes.add_textbox(Inches(1.0), Inches(3.45), Inches(11.333), Inches(1.1))
    tf = t_box.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "Project Samanvaya (समन्वय)"
    p.alignment = PP_ALIGN.CENTER
    p.font.size = Pt(40)
    p.font.bold = True
    p.font.color.rgb = DEEP_NAVY

    # Subtitle
    sub_box = s1.shapes.add_textbox(Inches(1.5), Inches(4.6), Inches(10.333), Inches(0.8))
    tf_s = sub_box.text_frame
    tf_s.word_wrap = True
    p_s = tf_s.paragraphs[0]
    p_s.text = "Smart Case-Taking & AYUSH-Allopathic Clinical Intelligence Platform"
    p_s.alignment = PP_ALIGN.CENTER
    p_s.font.size = Pt(18)
    p_s.font.bold = True
    p_s.font.color.rgb = ACCENT_TEAL

    # Tagline
    tag_box = s1.shapes.add_textbox(Inches(2.0), Inches(5.35), Inches(9.333), Inches(0.6))
    tf_tag = tag_box.text_frame
    tf_tag.word_wrap = True
    p_tag = tf_tag.paragraphs[0]
    p_tag.text = "Bridging linguistic, diagnostic, and clinical operational gaps across Indian Public Healthcare Facilities"
    p_tag.alignment = PP_ALIGN.CENTER
    p_tag.font.size = Pt(13)
    p_tag.font.color.rgb = TEXT_SLATE

    # Standards Bar at bottom
    std_box = s1.shapes.add_textbox(Inches(1.5), Inches(6.4), Inches(10.333), Inches(0.4))
    tf_std = std_box.text_frame
    p_std = tf_std.paragraphs[0]
    p_std.text = "ABDM FHIR R4 Compliant  •  DPDP Act 2023 Verified  •  22 Scheduled Indian Languages"
    p_std.alignment = PP_ALIGN.CENTER
    p_std.font.size = Pt(11)
    p_std.font.bold = True
    p_std.font.color.rgb = RGBColor(100, 116, 139)


    # ==========================================
    # SLIDE 2: THE PROBLEM
    # ==========================================
    s2 = prs.slides.add_slide(blank_layout)
    add_header(s2, "The OPD Bottleneck in Public Healthcare", "The Healthcare Challenge")
    add_footer(s2, 2)

    # 3 Cards for Problems
    cards_data = [
        {
            "tag": "PROBLEM 1",
            "title": "Severe Linguistic & Literacy Barriers",
            "desc": "Over 80% of patients attending district hospitals speak regional vernaculars or dialects. Patients struggle with complex registration forms, English medical jargon, and inability to read prescription instructions.",
            "color": WARM_ORANGE,
            "stat": "80%+",
            "stat_label": "Dialect Intake Gap"
        },
        {
            "tag": "PROBLEM 2",
            "title": "Overcrowded OPD & Rushed Case-Taking",
            "desc": "Government doctors routinely manage 100-150 patients in a single 4-hour OPD window (< 90 seconds per patient). Critical past medical history, drug allergies, and vital signs slip through administrative cracks.",
            "color": PRIMARY_NAVY,
            "stat": "< 90s",
            "stat_label": "Avg Physician Consultation"
        },
        {
            "tag": "PROBLEM 3",
            "title": "Allopathic & AYUSH Incompatibility",
            "desc": "Millions of citizens simultaneously use traditional ayurvedic remedies alongside allopathic drugs. Complete absence of cross-system checking leads to dangerous herb-drug conflicts and adverse reactions.",
            "color": ACCENT_TEAL,
            "stat": "Zero",
            "stat_label": "Cross-System Safety Checks"
        }
    ]

    card_w = Inches(3.64)
    card_h = Inches(4.9)
    gap = Inches(0.4)
    start_x = Inches(0.8)

    for i, c in enumerate(cards_data):
        cx = start_x + i * (card_w + gap)
        # Background card
        card = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, cx, Inches(1.8), card_w, card_h)
        card.fill.solid()
        card.fill.fore_color.rgb = CARD_BG
        card.line.color.rgb = CARD_BORDER
        card.line.width = Pt(1)

        # Top tag
        tbox = s2.shapes.add_textbox(cx + Inches(0.3), Inches(2.05), card_w - Inches(0.6), Inches(0.35))
        tf = tbox.text_frame
        p = tf.paragraphs[0]
        p.text = c["tag"]
        p.font.size = Pt(11)
        p.font.bold = True
        p.font.color.rgb = c["color"]

        # Card Title
        tit_box = s2.shapes.add_textbox(cx + Inches(0.3), Inches(2.4), card_w - Inches(0.6), Inches(0.8))
        tf_t = tit_box.text_frame
        tf_t.word_wrap = True
        p_t = tf_t.paragraphs[0]
        p_t.text = c["title"]
        p_t.font.size = Pt(16)
        p_t.font.bold = True
        p_t.font.color.rgb = DEEP_NAVY

        # Card Desc
        desc_box = s2.shapes.add_textbox(cx + Inches(0.3), Inches(3.25), card_w - Inches(0.6), Inches(1.7))
        tf_d = desc_box.text_frame
        tf_d.word_wrap = True
        p_d = tf_d.paragraphs[0]
        p_d.text = c["desc"]
        p_d.font.size = Pt(12)
        p_d.font.color.rgb = TEXT_SLATE

        # Stat Box at bottom of card
        stat_rect = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, cx + Inches(0.3), Inches(5.15), card_w - Inches(0.6), Inches(1.2))
        stat_rect.fill.solid()
        stat_rect.fill.fore_color.rgb = WHITE
        stat_rect.line.color.rgb = CARD_BORDER
        
        st_box = s2.shapes.add_textbox(cx + Inches(0.3), Inches(5.22), card_w - Inches(0.6), Inches(0.6))
        tf_st = st_box.text_frame
        p_st = tf_st.paragraphs[0]
        p_st.text = c["stat"]
        p_st.alignment = PP_ALIGN.CENTER
        p_st.font.size = Pt(22)
        p_st.font.bold = True
        p_st.font.color.rgb = c["color"]

        sl_box = s2.shapes.add_textbox(cx + Inches(0.3), Inches(5.8), card_w - Inches(0.6), Inches(0.4))
        tf_sl = sl_box.text_frame
        p_sl = tf_sl.paragraphs[0]
        p_sl.text = c["stat_label"]
        p_sl.alignment = PP_ALIGN.CENTER
        p_sl.font.size = Pt(10)
        p_sl.font.color.rgb = TEXT_SLATE


    # ==========================================
    # SLIDE 3: THE SOLUTION & ARCHITECTURE
    # ==========================================
    s3 = prs.slides.add_slide(blank_layout)
    add_header(s3, "Intelligent Case-Taking & Strict Role Separation", "The Solution")
    add_footer(s3, 3)

    # Core Banner
    sol_banner = s3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.65), Inches(11.733), Inches(0.95))
    sol_banner.fill.solid()
    sol_banner.fill.fore_color.rgb = LIGHT_BLUE
    sol_banner.line.color.rgb = BORDER_BLUE
    
    sb_txt = s3.shapes.add_textbox(Inches(1.0), Inches(1.72), Inches(11.333), Inches(0.8))
    tf_sb = sb_txt.text_frame
    tf_sb.word_wrap = True
    p1 = tf_sb.paragraphs[0]
    p1.text = "Core Design Principle:"
    p1.font.bold = True
    p1.font.size = Pt(11)
    p1.font.color.rgb = PRIMARY_NAVY

    p2 = tf_sb.add_paragraph()
    p2.text = "“Not simply digitizing an intake form — but ensuring a patient's case never falls through the cracks between walking in and clinical discharge.”"
    p2.font.bold = True
    p2.font.size = Pt(13)
    p2.font.color.rgb = DEEP_NAVY

    # Two Main Panels: Citizen Portal vs HIS Enclave
    panel_w = Inches(5.666)
    panel_h = Inches(4.0)
    top_y = Inches(2.8)

    # Left Panel: Citizen Portal
    p_left = s3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), top_y, panel_w, panel_h)
    p_left.fill.solid()
    p_left.fill.fore_color.rgb = CARD_BG
    p_left.line.color.rgb = CARD_BORDER
    p_left.line.width = Pt(1)

    tag_l = s3.shapes.add_textbox(Inches(1.1), top_y + Inches(0.2), panel_w - Inches(0.6), Inches(0.3))
    p = tag_l.text_frame.paragraphs[0]
    p.text = "PUBLIC CITIZEN PORTAL (ZERO LOGIN FRICTION)"
    p.font.size = Pt(10)
    p.font.bold = True
    p.font.color.rgb = ACCENT_TEAL

    tit_l = s3.shapes.add_textbox(Inches(1.1), top_y + Inches(0.55), panel_w - Inches(0.6), Inches(0.45))
    p = tit_l.text_frame.paragraphs[0]
    p.text = "Patient-First Autonomous Kiosk"
    p.font.size = Pt(17)
    p.font.bold = True
    p.font.color.rgb = DEEP_NAVY

    items_l = [
        "Instant 14-Digit ABHA 3D Smart Card creation with offline caching",
        "Multilingual Vernacular Voice Triage in patient's native dialect",
        "Prescription Scanner & Jan Aushadhi generic mapping (85% savings)",
        "PM-JAY & 36 States/UTs Scheme Navigator adapting to ration card colors",
        "Tele-MANAS 14416 mental health integration & guided breathing pacers",
        "Live OPD Token pass tracking wait times and assigned doctor room"
    ]
    
    desc_l = s3.shapes.add_textbox(Inches(1.1), top_y + Inches(1.1), panel_w - Inches(0.6), Inches(2.6))
    tf_l = desc_l.text_frame
    tf_l.word_wrap = True
    for idx, item in enumerate(items_l):
        p = tf_l.paragraphs[0] if idx == 0 else tf_l.add_paragraph()
        p.text = f"• {item}"
        p.font.size = Pt(11.5)
        p.font.color.rgb = TEXT_SLATE
        p.space_after = Pt(4)

    # Right Panel: Hospital Staff (HIS) Enclave
    p_right = s3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.866), top_y, panel_w, panel_h)
    p_right.fill.solid()
    p_right.fill.fore_color.rgb = CARD_BG
    p_right.line.color.rgb = CARD_BORDER
    p_right.line.width = Pt(1)

    tag_r = s3.shapes.add_textbox(Inches(7.166), top_y + Inches(0.2), panel_w - Inches(0.6), Inches(0.3))
    p = tag_r.text_frame.paragraphs[0]
    p.text = "HOSPITAL INFORMATION SYSTEM (HIS ENCLAVE)"
    p.font.size = Pt(10)
    p.font.bold = True
    p.font.color.rgb = PRIMARY_NAVY

    tit_r = s3.shapes.add_textbox(Inches(7.166), top_y + Inches(0.55), panel_w - Inches(0.6), Inches(0.45))
    p = tit_r.text_frame.paragraphs[0]
    p.text = "Role-Gated Clinical & Doctor Suite"
    p.font.size = Pt(17)
    p.font.bold = True
    p.font.color.rgb = DEEP_NAVY

    items_r = [
        "Physician Consultation Desk with longitudinal patient timeline",
        "Clinical Decision Support (CDSS) with cross-system Herb-Drug safety",
        "Automated ABDM FHIR R4 Bundle authoring and direct dispatch",
        "Clinical RAG Co-Pilot grounded in ICMR & AIIMS standard guidelines",
        "WHO AWaRe Antimicrobial Stewardship Audit flagging antibiotic overuse",
        "Statutory DPDP Act 2023 Consent Logs with cryptographic audit trails"
    ]

    desc_r = s3.shapes.add_textbox(Inches(7.166), top_y + Inches(1.1), panel_w - Inches(0.6), Inches(2.6))
    tf_r = desc_r.text_frame
    tf_r.word_wrap = True
    for idx, item in enumerate(items_r):
        p = tf_r.paragraphs[0] if idx == 0 else tf_r.add_paragraph()
        p.text = f"• {item}"
        p.font.size = Pt(11.5)
        p.font.color.rgb = TEXT_SLATE
        p.space_after = Pt(4)


    # ==========================================
    # SLIDE 4: CITIZEN EXPERIENCE & WORKFLOW
    # ==========================================
    s4 = prs.slides.add_slide(blank_layout)
    add_header(s4, "Frictionless Walk-in Patient Workflow", "Patient Experience")
    add_footer(s4, 4)

    # 4 Sequential Steps (Card layout)
    flow_steps = [
        {
            "num": "01",
            "title": "Voice Intake in Vernacular Tongue",
            "desc": "Patient speaks in their dialect. Voice AI converts speech to text, while Babel Fish translates idioms to clinical terms in real-time.",
            "tech": "Sarvam ASR + Bhashini (22 Languages)"
        },
        {
            "num": "02",
            "title": "3-Tier Triage & Red-Flag Escort",
            "desc": "Deterministic regex instantly catches life-threatening red flags (chest pain, stroke). High-param models structure symptoms into SNOMED codes.",
            "tech": "Groq LPU (<250ms) + 70B Clinical Models"
        },
        {
            "num": "03",
            "title": "Document OCR & Jan Aushadhi",
            "desc": "Camera scans old handwritten prescriptions. System maps expensive brand drugs to generic Jan Aushadhi salts saving up to 85% cost.",
            "tech": "Multimodal Vision AI + Kendra GPS"
        },
        {
            "num": "04",
            "title": "Smart Parchi & WhatsApp Pass",
            "desc": "Issues physical smart slip and WhatsApp digital pass with live OPD queue number, department room, and doctor timeline.",
            "tech": "Real-time Queue Bus + ABDM Gateway"
        }
    ]

    col_w = Inches(2.72)
    col_gap = Inches(0.28)
    col_start = Inches(0.8)

    for i, s in enumerate(flow_steps):
        sx = col_start + i * (col_w + col_gap)
        scard = s4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, sx, Inches(1.8), col_w, Inches(4.9))
        scard.fill.solid()
        scard.fill.fore_color.rgb = CARD_BG
        scard.line.color.rgb = CARD_BORDER
        scard.line.width = Pt(1)

        # Step Number
        num_box = s4.shapes.add_textbox(sx + Inches(0.2), Inches(2.05), col_w - Inches(0.4), Inches(0.6))
        tf = num_box.text_frame
        p = tf.paragraphs[0]
        p.text = s["num"]
        p.font.size = Pt(28)
        p.font.bold = True
        p.font.color.rgb = PRIMARY_NAVY

        # Title
        t_box = s4.shapes.add_textbox(sx + Inches(0.2), Inches(2.75), col_w - Inches(0.4), Inches(0.8))
        tf = t_box.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = s["title"]
        p.font.size = Pt(15)
        p.font.bold = True
        p.font.color.rgb = DEEP_NAVY

        # Desc
        d_box = s4.shapes.add_textbox(sx + Inches(0.2), Inches(3.65), col_w - Inches(0.4), Inches(1.6))
        tf = d_box.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = s["desc"]
        p.font.size = Pt(11.5)
        p.font.color.rgb = TEXT_SLATE

        # Tech Badge
        tech_pill = s4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, sx + Inches(0.2), Inches(5.6), col_w - Inches(0.4), Inches(0.8))
        tech_pill.fill.solid()
        tech_pill.fill.fore_color.rgb = WHITE
        tech_pill.line.color.rgb = BORDER_BLUE
        
        tbox2 = s4.shapes.add_textbox(sx + Inches(0.25), Inches(5.65), col_w - Inches(0.5), Inches(0.7))
        tf2 = tbox2.text_frame
        tf2.word_wrap = True
        p2 = tf2.paragraphs[0]
        p2.text = s["tech"]
        p2.alignment = PP_ALIGN.CENTER
        p2.font.size = Pt(10)
        p2.font.bold = True
        p2.font.color.rgb = ACCENT_TEAL


    # ==========================================
    # SLIDE 5: CLINICAL INTELLIGENCE & SAFETY
    # ==========================================
    s5 = prs.slides.add_slide(blank_layout)
    add_header(s5, "Clinical Decision Support & Pharmacovigilance", "Physician Intelligence")
    add_footer(s5, 5)

    # 4 Feature Blocks in 2x2 Grid
    features_2x2 = [
        {
            "tag": "SAFETY INNOVATION",
            "title": "Cross-System Herb-Drug Conflict Checker",
            "desc": "Real-time safety engine evaluating allopathic prescriptions against active Ayurvedic and herbal preparations (e.g., Metformin + Karela leading to hypoglycemia, or Aspirin + Ginkgo increasing hemorrhage risks).",
            "badge": "Allopathic + AYUSH Bridge"
        },
        {
            "tag": "ANTIMICROBIAL STEWARDSHIP",
            "title": "WHO AWaRe Antibiotic Compliance Audit",
            "desc": "Automated clinical audit classifying prescribed antibiotics into Access, Watch, and Reserve categories. Directly flags empirical fluoroquinolone/macrolide overuse to fight antimicrobial resistance (AMR).",
            "badge": "ICMR & WHO Aligned"
        },
        {
            "tag": "EVIDENCE RETRIEVAL",
            "title": "Clinical RAG Grounded in ICMR Protocols",
            "desc": "Evidence-grounded medical copilot powered by ICMR Standard Treatment Workflows, AIIMS algorithms, and StatPearls. Generates diagnostic check panels and red-flag alerts directly for the consulting physician.",
            "badge": "pgvector Hybrid RAG"
        },
        {
            "tag": "INTEROPERABILITY",
            "title": "Automated ABDM FHIR R4 Bundling",
            "desc": "Converts patient vitals, clinical observations, diagnoses, and prescriptions into standardized FHIR R4 JSON bundles compatible with NHA milestones M1, M2, and M3 for seamless federated health exchange.",
            "badge": "NHA & ABDM Compliant"
        }
    ]

    gw = Inches(5.666)
    gh = Inches(2.35)
    gx_left = Inches(0.8)
    gx_right = Inches(6.866)
    gy_top = Inches(1.8)
    gy_bot = Inches(4.35)

    coords = [(gx_left, gy_top), (gx_right, gy_top), (gx_left, gy_bot), (gx_right, gy_bot)]

    for i, f in enumerate(features_2x2):
        x, y = coords[i]
        b = s5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, y, gw, gh)
        b.fill.solid()
        b.fill.fore_color.rgb = CARD_BG
        b.line.color.rgb = CARD_BORDER
        b.line.width = Pt(1)

        # Header tag + Pill
        tag_tb = s5.shapes.add_textbox(x + Inches(0.3), y + Inches(0.2), Inches(3.2), Inches(0.3))
        p = tag_tb.text_frame.paragraphs[0]
        p.text = f["tag"]
        p.font.size = Pt(10)
        p.font.bold = True
        p.font.color.rgb = ACCENT_TEAL

        pill_tb = s5.shapes.add_textbox(x + gw - Inches(2.2), y + Inches(0.2), Inches(1.9), Inches(0.3))
        p = pill_tb.text_frame.paragraphs[0]
        p.text = f["badge"]
        p.alignment = PP_ALIGN.RIGHT
        p.font.size = Pt(9.5)
        p.font.bold = True
        p.font.color.rgb = PRIMARY_NAVY

        # Title
        tit_tb = s5.shapes.add_textbox(x + Inches(0.3), y + Inches(0.55), gw - Inches(0.6), Inches(0.45))
        p = tit_tb.text_frame.paragraphs[0]
        p.text = f["title"]
        p.font.size = Pt(15)
        p.font.bold = True
        p.font.color.rgb = DEEP_NAVY

        # Description
        desc_tb = s5.shapes.add_textbox(x + Inches(0.3), y + Inches(1.05), gw - Inches(0.6), Inches(1.15))
        tf = desc_tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = f["desc"]
        p.font.size = Pt(11)
        p.font.color.rgb = TEXT_SLATE


    # ==========================================
    # SLIDE 6: TECHNOLOGY STACK & STANDARDS
    # ==========================================
    s6 = prs.slides.add_slide(blank_layout)
    add_header(s6, "Robust 3-Tier AI Stack & Production Standards", "Technical Architecture")
    add_footer(s6, 6)

    # Left Column: 3-Tier AI Engine Architecture
    c_left = s6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.8), Inches(6.0), Inches(4.9))
    c_left.fill.solid()
    c_left.fill.fore_color.rgb = CARD_BG
    c_left.line.color.rgb = CARD_BORDER

    tb_ai = s6.shapes.add_textbox(Inches(1.1), Inches(2.0), Inches(5.4), Inches(0.4))
    p = tb_ai.text_frame.paragraphs[0]
    p.text = "3-TIER FAULT-TOLERANT AI ROUTING NET"
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = PRIMARY_NAVY

    tiers = [
        {
            "title": "Tier 1: Ultra-Fast Intent Routing",
            "engine": "Groq LPU Engine (Llama 3.3)",
            "stat": "< 250ms latency",
            "desc": "Real-time voice intent parsing, quick navigation chips, and high-throughput conversational routing."
        },
        {
            "title": "Tier 2: Deterministic Emergency Safety Net",
            "engine": "Deterministic Clinical Regex Engine",
            "stat": "< 5ms (Zero Hallucination)",
            "desc": "Hardcoded red-flag net monitoring for chest pain, stroke, severe bleeding, and respiratory distress."
        },
        {
            "title": "Tier 3: Deep Clinical Structuring",
            "engine": "70B Medical Models + Multimodal NIM",
            "stat": "~ 1.2s Clinical Synthesis",
            "desc": "Maps unstructured vernacular complaints into SNOMED-CT, ICD-10, and LOINC terminologies."
        }
    ]

    tier_y = Inches(2.5)
    for t in tiers:
        t_card = s6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.1), tier_y, Inches(5.4), Inches(1.2))
        t_card.fill.solid()
        t_card.fill.fore_color.rgb = WHITE
        t_card.line.color.rgb = CARD_BORDER

        tb = s6.shapes.add_textbox(Inches(1.25), tier_y + Inches(0.1), Inches(5.1), Inches(0.35))
        p = tb.text_frame.paragraphs[0]
        p.text = t["title"]
        p.font.size = Pt(12)
        p.font.bold = True
        p.font.color.rgb = DEEP_NAVY

        tb2 = s6.shapes.add_textbox(Inches(1.25), tier_y + Inches(0.42), Inches(5.1), Inches(0.3))
        p2 = tb2.text_frame.paragraphs[0]
        p2.text = f"{t['engine']}  •  {t['stat']}"
        p2.font.size = Pt(10)
        p2.font.bold = True
        p2.font.color.rgb = ACCENT_TEAL

        tb3 = s6.shapes.add_textbox(Inches(1.25), tier_y + Inches(0.72), Inches(5.1), Inches(0.45))
        tf3 = tb3.text_frame
        tf3.word_wrap = True
        p3 = tf3.paragraphs[0]
        p3.text = t["desc"]
        p3.font.size = Pt(10)
        p3.font.color.rgb = TEXT_SLATE

        tier_y += Inches(1.35)

    # Right Column: Production Technology Components
    c_right = s6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(7.1), Inches(1.8), Inches(5.433), Inches(4.9))
    c_right.fill.solid()
    c_right.fill.fore_color.rgb = CARD_BG
    c_right.line.color.rgb = CARD_BORDER

    tb_tech = s6.shapes.add_textbox(Inches(7.4), Inches(2.0), Inches(4.8), Inches(0.4))
    p = tb_tech.text_frame.paragraphs[0]
    p.text = "PRODUCTION STACK & INTEROPERABILITY"
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = PRIMARY_NAVY

    tech_specs = [
        ("Frontend Architecture", "Next.js 16 (App Router + Turbopack), React 19, Framer Motion, Vanilla CSS Design System"),
        ("High-Performance Backend", "FastAPI (Python 3.11), Uvicorn ASGI, Pydantic v2 schemas, WebSocket stateful streams"),
        ("Database & Vector Engine", "Supabase PostgreSQL with pgvector cosine similarity search and cryptographic SHA-256 audit triggers"),
        ("Speech & Language", "Sarvam AI (Saaras v3 / Bulbul v3) + Digital India Bhashini ULCA for 22 scheduled languages"),
        ("Statutory Compliance", "DPDP Act 2023 Section 6 consent manager + ABDM FHIR R4 Bundle generator")
    ]

    spec_y = Inches(2.55)
    for title, desc in tech_specs:
        s_box = s6.shapes.add_textbox(Inches(7.4), spec_y, Inches(4.8), Inches(0.75))
        tf = s_box.text_frame
        tf.word_wrap = True
        p1 = tf.paragraphs[0]
        p1.text = title
        p1.font.size = Pt(12)
        p1.font.bold = True
        p1.font.color.rgb = DEEP_NAVY

        p2 = tf.add_paragraph()
        p2.text = desc
        p2.font.size = Pt(10.5)
        p2.font.color.rgb = TEXT_SLATE
        spec_y += Inches(0.8)


    # ==========================================
    # SLIDE 7: IMPACT & STATUTORY COMPLIANCE
    # ==========================================
    s7 = prs.slides.add_slide(blank_layout)
    add_header(s7, "Measurable National Impact & Privacy by Design", "Impact & Compliance")
    add_footer(s7, 7)

    # Top: 3 Metric Cards
    metrics = [
        {"val": "65%", "label": "Reduction in OPD Intake Wait", "sub": "Structured preliminary case summaries ready before physician consultation"},
        {"val": "85%", "label": "Max Out-of-Pocket Savings", "sub": "Direct brand-to-salt substitution via Jan Aushadhi Kendras"},
        {"val": "22", "label": "Official Indian Languages", "sub": "Universal vernacular voice access for zero-barrier rural inclusion"}
    ]

    m_w = Inches(3.64)
    m_h = Inches(1.8)
    for i, m in enumerate(metrics):
        mx = Inches(0.8) + i * (m_w + Inches(0.4))
        m_card = s7.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, mx, Inches(1.8), m_w, m_h)
        m_card.fill.solid()
        m_card.fill.fore_color.rgb = LIGHT_BLUE
        m_card.line.color.rgb = BORDER_BLUE

        v_tb = s7.shapes.add_textbox(mx, Inches(1.95), m_w, Inches(0.6))
        p = v_tb.text_frame.paragraphs[0]
        p.text = m["val"]
        p.alignment = PP_ALIGN.CENTER
        p.font.size = Pt(32)
        p.font.bold = True
        p.font.color.rgb = PRIMARY_NAVY

        l_tb = s7.shapes.add_textbox(mx + Inches(0.2), Inches(2.6), m_w - Inches(0.4), Inches(0.4))
        p = l_tb.text_frame.paragraphs[0]
        p.text = m["label"]
        p.alignment = PP_ALIGN.CENTER
        p.font.size = Pt(12)
        p.font.bold = True
        p.font.color.rgb = DEEP_NAVY

        s_tb = s7.shapes.add_textbox(mx + Inches(0.2), Inches(3.0), m_w - Inches(0.4), Inches(0.5))
        tf = s_tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = m["sub"]
        p.alignment = PP_ALIGN.CENTER
        p.font.size = Pt(9.5)
        p.font.color.rgb = TEXT_SLATE

    # Bottom: Statutory Privacy & Compliance Banner (DPDP & ABDM)
    comp_card = s7.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(3.9), Inches(11.733), Inches(2.8))
    comp_card.fill.solid()
    comp_card.fill.fore_color.rgb = CARD_BG
    comp_card.line.color.rgb = CARD_BORDER

    tb_cp = s7.shapes.add_textbox(Inches(1.1), Inches(4.1), Inches(11.133), Inches(0.35))
    p = tb_cp.text_frame.paragraphs[0]
    p.text = "STATUTORY COMPLIANCE & PRIVACY BY DESIGN (DPDP ACT 2023)"
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = PRIMARY_NAVY

    comp_points = [
        ("Section 6 Bilingual Audio Consent:", "Patients are read consent terms aloud in their vernacular language. Audio alone is not considered valid—a mandatory physical touch confirmation on the kiosk screen is recorded."),
        ("Zero-Knowledge Media Purge:", "Under strict data minimization principles, raw voice waveforms and prescription camera photos are processed in-memory and permanently purged after clinical text extraction."),
        ("Immutable SHA-256 Audit Trail:", "All doctor modifications to AI-drafted triage notes and patient consent authorizations are logged into tamper-proof PostgreSQL audit tables with millisecond timestamps."),
        ("National Standards Interoperability:", "Full compliance with Ayushman Bharat Digital Mission (ABDM) specifications, ensuring cross-hospital portability across any compliant Indian healthcare provider.")
    ]

    pt_y = Inches(4.55)
    for h_txt, b_txt in comp_points:
        tb_pt = s7.shapes.add_textbox(Inches(1.1), pt_y, Inches(11.133), Inches(0.45))
        tf = tb_pt.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = f"• {h_txt} "
        p.font.size = Pt(10.5)
        p.font.bold = True
        p.font.color.rgb = DEEP_NAVY

        # Add normal text
        run = p.add_run()
        run.text = b_txt
        run.font.size = Pt(10.5)
        run.font.bold = False
        run.font.color.rgb = TEXT_SLATE

        pt_y += Inches(0.48)

    # Save presentation
    output_path = os.path.abspath("Project_Samanvaya_Presentation.pptx")
    prs.save(output_path)
    print(f"Presentation saved successfully to: {output_path}")

if __name__ == "__main__":
    create_deck()
