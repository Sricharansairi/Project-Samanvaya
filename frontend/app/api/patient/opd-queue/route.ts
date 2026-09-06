import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dept = searchParams.get("department") || "All";

  // Default dynamic OPD pool across all assigned hospital departments
  const defaultOpdPatients = [
    {
      token_number: "OPD-GM-101",
      tokenNumber: 101,
      patientName: "Ramesh Sharma",
      age: "52",
      gender: "Male",
      abhaId: "14-8921-4320-7712",
      phone: "+91 98452 11982",
      department: "General Medicine",
      roomNumber: "Room 101",
      doctorName: "Dr. On-Duty Specialist",
      urgency: "High",
      status: "WAITING",
      chief_concern: "Recurrent fever for 4 days with nocturnal chills and productive cough",
      registrationTime: "09:15 AM",
      estimatedWaitMinutes: 8
    },
    {
      token_number: "OPD-CARD-102",
      tokenNumber: 102,
      patientName: "Meenakshi Sundaram",
      age: "61",
      gender: "Female",
      abhaId: "14-3312-9845-6621",
      phone: "+91 97120 44512",
      department: "Cardiology",
      roomNumber: "Room 102",
      doctorName: "Dr. Arvind Rao",
      urgency: "Emergency",
      status: "WAITING",
      chief_concern: "Exertional retrosternal chest heaviness radiating to left shoulder, diaphoresis",
      registrationTime: "09:30 AM",
      estimatedWaitMinutes: 0
    },
    {
      token_number: "OPD-PULM-103",
      tokenNumber: 103,
      patientName: "Abdul Ghaffar",
      age: "48",
      gender: "Male",
      abhaId: "14-5544-2211-9988",
      phone: "+91 98200 33412",
      department: "Pulmonology",
      roomNumber: "Room 103",
      doctorName: "Dr. Meenakshi",
      urgency: "Normal",
      status: "WAITING",
      chief_concern: "Chronic dry cough for 3 weeks, mild exertional dyspnea, history of smoking",
      registrationTime: "09:45 AM",
      estimatedWaitMinutes: 16
    },
    {
      token_number: "OPD-ORTHO-104",
      tokenNumber: 104,
      patientName: "Savitri Devi",
      age: "58",
      gender: "Female",
      abhaId: "14-7766-3322-1100",
      phone: "+91 94451 88992",
      department: "Orthopedics",
      roomNumber: "Room 104",
      doctorName: "Dr. On-Duty Specialist",
      urgency: "Normal",
      status: "WAITING",
      chief_concern: "Bilateral knee joint pain on walking, morning stiffness lasting 15 mins",
      registrationTime: "10:00 AM",
      estimatedWaitMinutes: 24
    },
    {
      token_number: "OPD-AYUSH-105",
      tokenNumber: 105,
      patientName: "Balaji Venkat",
      age: "41",
      gender: "Male",
      abhaId: "14-9988-7766-5544",
      phone: "+91 99881 22334",
      department: "AYUSH / Integrative",
      roomNumber: "Room 105",
      doctorName: "Vaidya Shastry",
      urgency: "Normal",
      status: "WAITING",
      chief_concern: "Vata-pitta imbalance, chronic dyspepsia, acid regurgitation, insomnia",
      registrationTime: "10:15 AM",
      estimatedWaitMinutes: 32
    },
    {
      token_number: "OPD-PEDS-106",
      tokenNumber: 106,
      patientName: "Aarav Patel",
      age: "6",
      gender: "Male",
      abhaId: "14-1122-3344-5566",
      phone: "+91 98112 33445",
      department: "Pediatrics",
      roomNumber: "Room 106",
      doctorName: "Dr. On-Duty Specialist",
      urgency: "High",
      status: "WAITING",
      chief_concern: "High fever (102°F) since last night, decreased oral intake, throat pain",
      registrationTime: "10:30 AM",
      estimatedWaitMinutes: 12
    }
  ];

  const filtered = dept === "All"
    ? defaultOpdPatients
    : defaultOpdPatients.filter(p => p.department.toLowerCase().includes(dept.toLowerCase()));

  return NextResponse.json({
    department: dept,
    total_waiting: filtered.filter(p => p.status === "WAITING").length,
    total_assigned: filtered.length,
    queue: filtered
  });
}
