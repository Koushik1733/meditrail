import Link from "next/link";
import { Activity, ShieldCheck, Clock, Share2 } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-teal-700" />
            <span className="font-bold text-xl text-slate-900">MediTrail</span>
          </div>
          <div className="flex gap-4">
            <Link href="/login" className="text-slate-600 hover:text-slate-900 font-medium px-4 py-2">
              Sign In
            </Link>
            <Link href="/register" className="bg-teal-700 hover:bg-teal-800 text-white font-medium px-4 py-2 rounded-md transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-6">
            Your medical history, <br className="hidden md:block"/> wherever care happens.
          </h1>
          <p className="text-xl text-slate-600 mb-10 max-w-3xl mx-auto">
            Stop carrying folders of PDFs and photos. Turn your scattered records into a doctor-ready, patient-controlled timeline in seconds.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/register" className="bg-teal-700 hover:bg-teal-800 text-white text-lg font-semibold px-8 py-3 rounded-lg shadow-sm transition-colors">
              Create Your Trail
            </Link>
            <Link href="/demo" className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-lg font-semibold px-8 py-3 rounded-lg shadow-sm transition-colors">
              View Demo
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="bg-white py-20 border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-12">
              <div className="text-center">
                <div className="mx-auto bg-teal-50 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                  <Clock className="h-8 w-8 text-teal-700" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Unified Timeline</h3>
                <p className="text-slate-600">Past diagnoses, prescriptions, tests, and hospital visits ordered chronologically.</p>
              </div>
              <div className="text-center">
                <div className="mx-auto bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                  <ShieldCheck className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Care Awareness</h3>
                <p className="text-slate-600">We automatically flag potentially repeated tests and overlapping medication entries.</p>
              </div>
              <div className="text-center">
                <div className="mx-auto bg-purple-50 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                  <Share2 className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Controlled Sharing</h3>
                <p className="text-slate-600">Share selected records with a doctor via secure link with expiry and revocation.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
