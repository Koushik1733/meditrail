import { NextResponse } from 'next/server';
import { getSession } from '@/lib/supabase-client';

// Mock deterministic fallback for demonstration when AI credentials are unavailable
const DEMO_EXTRACTION_RESULT = {
  record_type: "Laboratory Test",
  document_date: "2026-10-09",
  provider_name: "City Diagnostic Labs",
  patient_name: "John Doe",
  diagnoses: [],
  medications: [],
  allergies: [],
  laboratory_tests: [
    { test_name: "HbA1c", result: "6.8", unit: "%", reference_range: "< 5.7", test_date: "2026-10-09" },
    { test_name: "Fasting Glucose", result: "110", unit: "mg/dL", reference_range: "70-99", test_date: "2026-10-09" }
  ],
  procedures: [],
  follow_up_recommendations: ["Consult endocrinologist for elevated HbA1c"],
  uncertain_fields: []
};

export async function POST(req: Request) {
  try {
    const user = await getSession(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // In a full deployment, we would upload the file to Supabase Storage here:
    // const { data, error } = await supabase.storage.from('medical_docs').upload(`${user.id}/${file.name}`, file)

    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      // DEMO FALLBACK: Return structured data without hitting AI
      console.log("No AI credentials found. Using deterministic demo fallback.");
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return NextResponse.json({ 
        success: true, 
        extractedData: DEMO_EXTRACTION_RESULT,
        demoMode: true
      });
    }

    // --- REAL AI PIPELINE WOULD GO HERE ---
    // 1. Extract text via OCR (e.g., Tesseract or Azure Document Intelligence)
    // 2. Pass text to LLM with strict JSON schema instructions
    // 3. Validate response against schema
    // --------------------------------------

    return NextResponse.json({ error: 'AI Pipeline implementation requires OCR service' }, { status: 501 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
