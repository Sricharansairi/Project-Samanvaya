import { NextResponse } from "next/server";
import { ALL_INDIA_SCHEMES, SchemeDefinition } from "@/services/schemes_repository";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      state = "CENTRAL",
      age = 35,
      gender = "Any",
      income = null,
      ration_card_type = "WHITE",
      clinical_condition = "ANY",
      is_migrant = false,
      caste = "GENERAL"
    } = body;

    const matched: {
      scheme: SchemeDefinition;
      status: "Directly Eligible" | "Conditionally Eligible" | "Relief Fund";
      reason: string;
    }[] = [];

    for (const scheme of ALL_INDIA_SCHEMES) {
      const e = scheme.eligibility;
      let eligible = true;
      let status: "Directly Eligible" | "Conditionally Eligible" | "Relief Fund" = "Directly Eligible";
      let matchReason = `Matched under ${scheme.authority} guidelines for ${scheme.category.replace('_', ' ')}.`;

      // 1. State Domicile check
      // Central schemes apply everywhere in India
      if (scheme.stateCode !== "CENTRAL" && scheme.stateCode !== state) {
        eligible = false;
        continue;
      }

      // 2. Senior Citizen 70+ requirement
      if (e.requiresSenior70) {
        if (age < 70) {
          eligible = false;
          continue;
        } else {
          status = "Directly Eligible";
          matchReason = "Age >= 70 unlocks universal Ayushman Vay Vandana coverage irrespective of income.";
        }
      }

      // 3. Gender check
      if (e.gender && e.gender !== "Any") {
        if (e.gender.toLowerCase() !== gender.toLowerCase()) {
          eligible = false;
          continue;
        }
      }

      // 4. Clinical Condition check
      if (e.allowedConditions && !e.allowedConditions.includes("ANY")) {
        if (!e.allowedConditions.includes(clinical_condition) && clinical_condition !== "ANY") {
          status = "Conditionally Eligible";
          matchReason = `Requires medical diagnosis confirmation of ${e.allowedConditions.join(" or ")}.`;
        }
      }

      // 5. Income ceiling check
      if (income !== null && e.maxFamilyIncome) {
        if (income > e.maxFamilyIncome) {
          eligible = false;
          continue;
        }
      }

      // 6. Ration Card check
      const allowedCards = e.allowedRationCards || ["ANY"];
      if (!allowedCards.includes("ANY")) {
        if (!allowedCards.map(c => c.toUpperCase()).includes(ration_card_type.toUpperCase())) {
          if (scheme.category === "bpl_ration") {
            status = "Conditionally Eligible";
            matchReason = `Requires ${allowedCards.join(" or ")} ration card. If unavailable, can apply with Tehsildar income certificate.`;
          }
        }
      }

      // 7. Relief Funds / Disease grants
      if (scheme.category === "disease_specific" && scheme.id.includes("ran")) {
        status = "Relief Fund";
      }

      if (eligible) {
        matched.push({
          scheme,
          status,
          reason: matchReason
        });
      }
    }

    // Sort: Directly Eligible first, then Conditionally Eligible, then highest coverage amount
    matched.sort((a, b) => {
      if (a.status === "Directly Eligible" && b.status !== "Directly Eligible") return -1;
      if (b.status === "Directly Eligible" && a.status !== "Directly Eligible") return 1;
      return b.scheme.coverageAmount - a.scheme.coverageAmount;
    });

    const directlyEligibleCoverage = matched
      .filter(m => m.status === "Directly Eligible")
      .reduce((sum, m) => sum + m.scheme.coverageAmount, 0);

    return NextResponse.json({
      success: true,
      evaluated_for: {
        state,
        age,
        gender,
        income,
        ration_card_type,
        clinical_condition,
        is_migrant
      },
      national_portability_active: is_migrant || state !== "CENTRAL",
      total_eligible_coverage: directlyEligibleCoverage,
      total_eligible_coverage_display: `₹${directlyEligibleCoverage.toLocaleString("en-IN")} Cashless Protection`,
      matched_schemes: matched
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
