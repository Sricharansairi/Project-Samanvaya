/**
 * Project Samanvaya - AYUSH Clinical Assessment & Prakriti Engine
 * Grounded in Ministry of AYUSH Guidelines, Charaka Samhita, and Sushruta Samhita.
 */

export interface PrakritiQuestion {
  id: string;
  category: "physical" | "physiological" | "psychological";
  question: string;
  description: string;
  options: {
    dosha: "Vata" | "Pitta" | "Kapha";
    label: string;
    detail: string;
    points: number;
  }[];
}

export const PRAKRITI_QUESTIONNAIRE: PrakritiQuestion[] = [
  {
    id: "q1_frame",
    category: "physical",
    question: "Body Frame & Physical Build",
    description: "Observation of skeletal framework, joints, and prominence of veins.",
    options: [
      { dosha: "Vata", label: "Thin, lean, prominent joints & veins", detail: "Difficulty gaining weight; tall or short slender frame.", points: 1 },
      { dosha: "Pitta", label: "Medium build, proportionate, moderate musculature", detail: "Steady weight, sharp features, flexible joints.", points: 1 },
      { dosha: "Kapha", label: "Broad, sturdy, well-developed bone structure", detail: "Gains weight easily, large well-padded joints.", points: 1 }
    ]
  },
  {
    id: "q2_skin",
    category: "physical",
    question: "Skin Texture & Complexion",
    description: "Tactile feel, oiliness, and thermal response of skin.",
    options: [
      { dosha: "Vata", label: "Dry, rough, thin, cool to touch", detail: "Prone to cracking in cold weather; prominent tan.", points: 1 },
      { dosha: "Pitta", label: "Warm, oily T-zone, reddish/pinkish hue", detail: "Prone to acne, moles, freckles, sunburns easily.", points: 1 },
      { dosha: "Kapha", label: "Thick, soft, smooth, lustrous, cool", detail: "Hydrated, oily, clear complexion, rarely cracks.", points: 1 }
    ]
  },
  {
    id: "q3_digestion",
    category: "physiological",
    question: "Agni (Digestive Fire) & Appetite",
    description: "Pattern of hunger, digestion speed, and post-meal comfort.",
    options: [
      { dosha: "Vata", label: "Vishamagni (Irregular & unpredictable)", detail: "Sometimes hungry, sometimes misses meals; prone to bloating/gas.", points: 1 },
      { dosha: "Pitta", label: "Tikshnagni (Intense & fast hunger)", detail: "Cannot tolerate delayed meals, irritable when hungry, hyperacidity.", points: 1 },
      { dosha: "Kapha", label: "Mandagni (Slow & steady appetite)", detail: "Can skip meals comfortably; slow digestion, feels heavy after food.", points: 1 }
    ]
  },
  {
    id: "q4_bowel",
    category: "physiological",
    question: "Koshtha (Bowel Habits & Evacuation)",
    description: "Frequency, stool consistency, and ease of elimination.",
    options: [
      { dosha: "Vata", label: "Krura Koshtha (Dry, hard, prone to constipation)", detail: "Irregular elimination, requires warm water or laxatives.", points: 1 },
      { dosha: "Pitta", label: "Mridu Koshtha (Loose, frequent, yellowish stools)", detail: "Evacuates 2-3 times daily, sensitive to milk and spicy food.", points: 1 },
      { dosha: "Kapha", label: "Madhyama Koshtha (Regular, well-formed, sluggish)", detail: "Once daily, heavy, moderate transit time.", points: 1 }
    ]
  },
  {
    id: "q5_thermal",
    category: "physiological",
    question: "Thermal Tolerance & Climate Preference",
    description: "Sensitivity to environmental cold, heat, or humidity.",
    options: [
      { dosha: "Vata", label: "Cold Intolerant (Sheeta Asahishnuta)", detail: "Craves warmth, sun, warm beverages; hates cold wind.", points: 1 },
      { dosha: "Pitta", label: "Heat Intolerant (Ushna Asahishnuta)", detail: "Sweats profusely, craves cold drinks, air conditioning, shaded areas.", points: 1 },
      { dosha: "Kapha", label: "Dislikes cold & damp weather", detail: "Prefers dry, warm, well-ventilated weather; tolerates both moderately.", points: 1 }
    ]
  },
  {
    id: "q6_sleep",
    category: "psychological",
    question: "Sleep Quality & Duration (Nidra)",
    description: "Ease of falling asleep, depth of sleep, and morning alertness.",
    options: [
      { dosha: "Vata", label: "Light, interrupted, restless (4-6 hours)", detail: "Wakes up frequently at night; prone to active flying dreams.", points: 1 },
      { dosha: "Pitta", label: "Moderate, sound (6-7 hours)", detail: "Falls asleep easily; wakes up refreshed; intense colorful dreams.", points: 1 },
      { dosha: "Kapha", label: "Deep, heavy, prolonged (8-10 hours)", detail: "Difficult to wake up early; lethargic morning start; watery dreams.", points: 1 }
    ]
  },
  {
    id: "q7_mind",
    category: "psychological",
    question: "Mental Temperament & Stress Reaction (Manasa Prakriti)",
    description: "Cognitive pace, memory retention, and response to acute stress.",
    options: [
      { dosha: "Vata", label: "Quick grasp, quick to forget, prone to anxiety", detail: "Multitasker, restless mind, worries easily when under pressure.", points: 1 },
      { dosha: "Pitta", label: "Sharp intellect, focused, prone to impatience/anger", detail: "Goal-oriented, perfectionist, decisive, competitive.", points: 1 },
      { dosha: "Kapha", label: "Calm, deliberate, excellent long-term memory", detail: "Takes time to learn but never forgets; emotionally stable, forgiving.", points: 1 }
    ]
  }
];

export interface PrakritiResult {
  dominantPrakriti: string;
  prakritiType: "Eka-Doshaja" | "Dvi-Doshaja" | "Sama-Doshaja";
  scores: {
    Vata: number;
    Pitta: number;
    Kapha: number;
  };
  percentages: {
    Vata: number;
    Pitta: number;
    Kapha: number;
  };
  agniType: string;
  koshthaType: string;
  pathyaAhara: string[]; // Recommended Foods
  apathyaAhara: string[]; // Foods to avoid
  viharaAdvice: string[]; // Lifestyle & Daily routine
  yogaPranayama: string[]; // Recommended Yogic postures
  ayushFormulations: string[]; // Classical formulations
  herbDrugSafetyWarnings: string[]; // Drug interactions
}

export function evaluatePrakriti(answers: Record<string, "Vata" | "Pitta" | "Kapha">): PrakritiResult {
  const scores = { Vata: 0, Pitta: 0, Kapha: 0 };

  for (const q of PRAKRITI_QUESTIONNAIRE) {
    const selected = answers[q.id];
    if (selected && scores[selected] !== undefined) {
      scores[selected] += 1;
    }
  }

  const total = scores.Vata + scores.Pitta + scores.Kapha || 1;
  const percentages = {
    Vata: Math.round((scores.Vata / total) * 100),
    Pitta: Math.round((scores.Pitta / total) * 100),
    Kapha: Math.round((scores.Kapha / total) * 100)
  };

  // Determine dominant
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  let dominantPrakriti = sorted[0][0];
  let prakritiType: "Eka-Doshaja" | "Dvi-Doshaja" | "Sama-Doshaja" = "Eka-Doshaja";

  if (sorted[0][1] === sorted[1][1] && sorted[1][1] === sorted[2][1]) {
    dominantPrakriti = "Sama-Doshaja (Tridoshic Balance)";
    prakritiType = "Sama-Doshaja";
  } else if (sorted[0][1] - sorted[1][1] <= 1) {
    dominantPrakriti = `${sorted[0][0]}-${sorted[1][0]} (Dual Doshic)`;
    prakritiType = "Dvi-Doshaja";
  } else {
    dominantPrakriti = `${sorted[0][0]} Dominant`;
  }

  const primary = sorted[0][0] as "Vata" | "Pitta" | "Kapha";

  const recommendations = {
    Vata: {
      agni: "Vishamagni (Irregular digestive fire)",
      koshtha: "Krura (Dry, prone to constipation)",
      pathya: [
        "Warm, unctuous (Snigdha), grounding foods with Ghee or Sesame oil",
        "Cooked whole grains: Wheat, Basmati rice, Oats with milk",
        "Sweet, sour, and mildly salty tastes (Madhura, Amla, Lavana)",
        "Warm spices: Ginger, Cumin, Cardamom, Cinnamon, Hing (Asafoetida)",
        "Warm milk with a pinch of Nutmeg and Turmeric before bedtime"
      ],
      apathya: [
        "Dry, raw, cold foods (raw salads, iced drinks, dry crackers)",
        "Excessive pungent, bitter, or astringent tastes (Katu, Tikta, Kashaya)",
        "Carbonated sodas, caffeine, and stale/reheated foods",
        "Skipping meals or fasting excessively"
      ],
      vihara: [
        "Abhyanga: Daily self-massage with warm Sesame oil (Tila Taila)",
        "Maintain fixed regular hours for eating, sleeping, and working",
        "Avoid cold drafts and keep ears and neck covered in windy weather",
        "Gentle, grounding activities; avoid excessive late-night screen time"
      ],
      yoga: [
        "Nadi Shodhana Pranayama (Alternate Nostril Breathing - 10 mins)",
        "Grounding asanas: Tadasana, Vrikshasana, Paschimottanasana, Balasana",
        "Extended Shavasana (Corpse Pose) with deep diaphragmatic breathing"
      ],
      formulations: [
        "Ashwagandha Churna (3g with warm milk at night for Vata pacification)",
        "Triphala Churna (with warm water at bedtime for Krura Koshtha)",
        "Dashamula Kwatha (for muscular stiffness and joint aches)"
      ],
      safety: [
        "Ashwagandha may enhance sedative effects if co-administered with Benzodiazepines.",
        "Ensure patient maintains proper hydration when consuming Triphala."
      ]
    },
    Pitta: {
      agni: "Tikshnagni (Intense, sharp digestive fire)",
      koshtha: "Mridu (Soft, sensitive bowel)",
      pathya: [
        "Cooling, soothing foods: Coconut water, Cucumber, Melons, Grapes",
        "Dairy products: Cow's milk, fresh Ghee, butter, homemade curd (fresh)",
        "Sweet, bitter, and astringent tastes (Madhura, Tikta, Kashaya)",
        "Grains: Basmati rice, Barley (Yava), Wheat",
        "Cooling spices: Coriander (Dhaniya), Fennel (Saunf), Mint (Pudina)"
      ],
      apathya: [
        "Extremely spicy, oily, deep-fried foods and hot chilies",
        "Excessively sour items: Vinegar, fermented pickles, tamarind",
        "Excessive alcohol, tobacco, coffee, and energy drinks",
        "Skipping meals when hungry (aggravates Tikshnagni & causes acid ulcers)"
      ],
      vihara: [
        "Avoid excessive direct sun exposure during peak afternoon hours",
        "Moonlight walks (Sheetala Vihara) and water sports/swimming",
        "Use cooling essential oils: Sandalwood (Chandan), Rose water, Khus",
        "Practice emotional detachment; avoid contentious heated debates"
      ],
      yoga: [
        "Sheetali & Sheetkari Pranayama (Cooling breath - 5-7 mins)",
        "Heart and abdominal opening asanas: Bhujangasana, Matsyasana, Chandranamaskar",
        "Cooling meditation focusing on Ajna Chakra"
      ],
      formulations: [
        "Shatavari Churna (3g with cold milk or water for Pitta soothing)",
        "Avipattikar Churna (3-5g before meals for hyperacidity & Amlapitta)",
        "Amalaki Rasayana (potent natural Vitamin C and antioxidant)"
      ],
      safety: [
        "Avipattikar contains salt/sugar; use with caution in renal hypertension and diabetes.",
        "Check liver function if prolonged use of multi-herb metallic Bhasmas."
      ]
    },
    Kapha: {
      agni: "Mandagni (Slow, sluggish digestive fire)",
      koshtha: "Madhyama (Regular, slow transit)",
      pathya: [
        "Light, warm, dry, and easily digestible foods",
        "Millets: Ragi, Jowar, Bajra, and old Barley (Yava)",
        "Pungent, bitter, and astringent tastes (Katu, Tikta, Kashaya)",
        "Honey (Madhu - never heated), warm water with lemon and ginger",
        "Stimulating spices: Black pepper (Maricha), Dry Ginger (Sunthi), Pippali (Trikatu)"
      ],
      apathya: [
        "Heavy, oily, deep-fried sweets, bakery pastries, and ice creams",
        "Cold milk, heavy cheeses, curd at night, and bananas",
        "Daytime sleeping (Diva Swapna) which severely aggravates Kapha",
        "Excessive salt and refined sugar"
      ],
      vihara: [
        "Udvartana: Dry powder massage with Triphala / Kolakulathadi powder",
        "Vigorous daily cardiovascular exercise; wake up before sunrise (Brahma Muhurta)",
        "Keep environment warm, dry, and stimulating; avoid sedentary lethargy",
        "Occasional intermittent fasting (Langhana) under supervision"
      ],
      yoga: [
        "Kapalabhati & Bhastrika Pranayama (Energizing, heating breath - 5 mins)",
        "Dynamic Surya Namaskar (12 rounds brisk pace)",
        "Warrior poses: Virabhadrasana I & II, Dhanurasana (Bow pose)"
      ],
      formulations: [
        "Trikatu Churna (Sunthi + Maricha + Pippali - 1g with honey for Mandagni)",
        "Guggulu preparations: Kanchanar Guggulu or Medohar Guggulu (for lipid/weight management)",
        "Punarnavadi Kwatha (for edema and lymphatic drainage)"
      ],
      safety: [
        "Trikatu is heating; contraindicated in active gastric ulceration or hyperacidity.",
        "Guggulu may interact with thyroid and anti-lipidemic statin medications."
      ]
    }
  };

  const currentRec = recommendations[primary];

  return {
    dominantPrakriti,
    prakritiType,
    scores,
    percentages,
    agniType: currentRec.agni,
    koshthaType: currentRec.koshtha,
    pathyaAhara: currentRec.pathya,
    apathyaAhara: currentRec.apathya,
    viharaAdvice: currentRec.vihara,
    yogaPranayama: currentRec.yoga,
    ayushFormulations: currentRec.formulations,
    herbDrugSafetyWarnings: currentRec.safety
  };
}
