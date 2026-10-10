import { Activity, Bell, Calendar, Clock, FileText, Share2, AlertTriangle, ShieldCheck } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:block flex-shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-slate-200">
          <Activity className="h-6 w-6 text-teal-700 mr-2" />
          <span className="font-bold text-xl text-slate-900">MediTrail</span>
        </div>
        <nav className="p-4 space-y-2">
          <a href="#" className="flex items-center px-4 py-2 bg-teal-50 text-teal-700 rounded-md font-medium">
            <Clock className="h-5 w-5 mr-3" />
            Timeline
          </a>
          <a href="#" className="flex items-center px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-md font-medium">
            <ShieldCheck className="h-5 w-5 mr-3" />
            Health Snapshot
          </a>
          <a href="#" className="flex items-center px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-md font-medium">
            <FileText className="h-5 w-5 mr-3" />
            Documents
          </a>
          <a href="/share" className="flex items-center px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-md font-medium">
            <Share2 className="h-5 w-5 mr-3" />
            Share Records
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
          <h1 className="text-xl font-bold text-slate-900">Patient Dashboard</h1>
          <div className="flex items-center gap-4">
            <button className="text-slate-500 hover:text-slate-700">
              <Bell className="h-5 w-5" />
            </button>
            <div className="h-8 w-8 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center font-bold">
              JD
            </div>
          </div>
        </header>

        <div className="p-8 max-w-6xl mx-auto space-y-8">
          
          {/* Welcome & Quick Actions */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Good morning, John</h2>
              <p className="text-slate-600 mt-1">Your health records are up to date. You have 2 care alerts to review.</p>
            </div>
            <div className="flex gap-3">
              <button className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-md font-medium hover:bg-slate-50 transition">
                Upload Record
              </button>
              <button className="bg-teal-700 text-white px-4 py-2 rounded-md font-medium hover:bg-teal-800 transition">
                Share with Doctor
              </button>
            </div>
          </div>

          {/* Care Awareness Engine Alerts */}
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-md">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-amber-500 mr-3 mt-0.5" />
              <div>
                <h3 className="font-semibold text-amber-800">Care Awareness Alerts</h3>
                <ul className="mt-2 text-sm text-amber-700 space-y-1">
                  <li>• <strong>Possible Duplicate Test:</strong> You had an 'HbA1c' blood test 2 weeks ago. A new test was just uploaded.</li>
                  <li>• <strong>Medication Overlap:</strong> 'Lisinopril' and 'Amlodipine' overlap. Please review with your clinician.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Health Snapshot Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
              <h3 className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-4">Current Medications</h3>
              <ul className="space-y-3">
                <li className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-slate-900">Metformin 500mg</p>
                    <p className="text-xs text-slate-500">Twice daily with meals</p>
                  </div>
                  <span className="bg-teal-100 text-teal-800 text-xs px-2 py-1 rounded-full">Verified</span>
                </li>
                <li className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-slate-900">Lisinopril 10mg</p>
                    <p className="text-xs text-slate-500">Once daily</p>
                  </div>
                  <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-full">Unverified</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
              <h3 className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-4">Allergies & Conditions</h3>
              <div className="mb-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 mr-2">
                  Penicillin Allergy
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                  Type 2 Diabetes
                </span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
              <h3 className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-4">Recent Vitals</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-600">Blood Pressure</span>
                  <span className="font-medium text-slate-900">135/85 mmHg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Heart Rate</span>
                  <span className="font-medium text-slate-900">72 bpm</span>
                </div>
              </div>
            </div>
          </div>

          {/* Unified Timeline */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-900">Unified Medical Timeline</h3>
              <div className="flex gap-2">
                <select className="border border-slate-300 rounded-md text-sm px-3 py-1.5 text-slate-700">
                  <option>All Records</option>
                  <option>Prescriptions</option>
                  <option>Lab Tests</option>
                  <option>Visits</option>
                </select>
              </div>
            </div>
            <div className="p-6">
              <div className="relative border-l-2 border-slate-200 ml-3 space-y-8">
                
                {/* Timeline Item 1 */}
                <div className="relative pl-6">
                  <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-white bg-blue-500"></div>
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-slate-900">Cardiology Consultation</h4>
                    <span className="text-sm font-medium text-blue-600">Oct 05, 2026</span>
                  </div>
                  <p className="text-sm text-slate-600 mb-2">Dr. Sarah Smith • Metro Heart Institute</p>
                  <div className="bg-slate-50 p-4 rounded-md text-sm text-slate-700 border border-slate-100">
                    <p><strong>Notes:</strong> Patient reported mild shortness of breath during exercise. BP slightly elevated.</p>
                    <div className="mt-3 flex gap-2">
                      <span className="bg-white border border-slate-200 px-2 py-1 rounded text-xs">Lisinopril 10mg added</span>
                      <span className="bg-white border border-slate-200 px-2 py-1 rounded text-xs text-teal-700 font-medium cursor-pointer hover:underline">View PDF</span>
                    </div>
                  </div>
                </div>

                {/* Timeline Item 2 */}
                <div className="relative pl-6">
                  <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-white bg-green-500"></div>
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-slate-900">Comprehensive Blood Panel</h4>
                    <span className="text-sm text-slate-500">Sep 20, 2026</span>
                  </div>
                  <p className="text-sm text-slate-600 mb-2">City Diagnostic Labs</p>
                  <div className="bg-slate-50 p-4 rounded-md text-sm text-slate-700 border border-slate-100">
                    <p><strong>Results:</strong> HbA1c: 6.8% (Slightly high), Cholesterol: 190 mg/dL.</p>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
