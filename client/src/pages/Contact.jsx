import React, { useState } from "react";
import { Mail, Phone, MapPin, Clock, Send, CheckCircle } from "lucide-react";
import Container from "../components/layout/Container/Container";

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); setSubmitted(true); }, 1200);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-16">
        <Container>
          <div className="text-center">
            <h1 className="text-5xl font-black mb-4">Contact Us</h1>
            <p className="text-blue-100 text-lg max-w-xl mx-auto">
              Have a question or need help? Our support team is ready to assist you.
            </p>
          </div>
        </Container>
      </div>

      <Container className="py-16">
        <div className="grid lg:grid-cols-3 gap-10">
          {/* Info cards */}
          <div className="space-y-6">
            {[
              { icon: <Mail size={22} />, title: "Email", lines: ["support@shopstream.com", "We reply within 24 hours"] },
              { icon: <Phone size={22} />, title: "Phone", lines: ["+1 (800) 555-0199", "Mon–Fri, 9am–6pm EST"] },
              { icon: <MapPin size={22} />, title: "Address", lines: ["123 Commerce Lane,", "San Francisco, CA 94103"] },
              { icon: <Clock size={22} />, title: "Support Hours", lines: ["Mon–Sat: 9:00 AM – 6:00 PM", "Sunday: Closed"] },
            ].map(({ icon, title, lines }) => (
              <div key={title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex gap-4">
                <div className="bg-blue-50 text-blue-600 rounded-xl w-12 h-12 flex items-center justify-center shrink-0">
                  {icon}
                </div>
                <div>
                  <p className="font-bold text-gray-900 mb-1">{title}</p>
                  {lines.map((l) => <p key={l} className="text-sm text-gray-500">{l}</p>)}
                </div>
              </div>
            ))}
          </div>

          {/* Form */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
            {submitted ? (
              <div className="flex flex-col items-center justify-center h-full py-16 text-center gap-4">
                <CheckCircle size={56} className="text-green-500" />
                <h3 className="text-2xl font-black text-gray-900">Message Sent!</h3>
                <p className="text-gray-500 max-w-sm">
                  Thank you for reaching out, {form.name || "there"}! We'll get back to you within 24 hours.
                </p>
                <button
                  onClick={() => { setSubmitted(false); setForm({ name: "", email: "", subject: "", message: "" }); }}
                  className="mt-4 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  Send Another
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-black text-gray-900 mb-6">Send Us a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name *</label>
                      <input
                        type="text" name="name" value={form.name} onChange={handleChange} required
                        placeholder="John Doe"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address *</label>
                      <input
                        type="email" name="email" value={form.email} onChange={handleChange} required
                        placeholder="john@example.com"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Subject *</label>
                    <select
                      name="subject" value={form.subject} onChange={handleChange} required
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition bg-white"
                    >
                      <option value="">Select a topic</option>
                      <option>Order Issue</option>
                      <option>Return / Refund</option>
                      <option>Product Question</option>
                      <option>Payment Problem</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Message *</label>
                    <textarea
                      name="message" value={form.message} onChange={handleChange} required rows={6}
                      placeholder="Describe your issue or question in detail..."
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
                    />
                  </div>
                  <button
                    type="submit" disabled={loading}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-8 py-3 rounded-xl font-bold transition"
                  >
                    {loading ? "Sending..." : <><Send size={16} /> Send Message</>}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </Container>
    </main>
  );
};

export default Contact;
