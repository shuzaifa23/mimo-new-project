import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy | Vision Printt Technologies',
  description: 'Privacy Policy for Vision Printt Technologies.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 py-20 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <h1 className="text-4xl md:text-6xl font-outfit font-black tracking-tight text-zinc-900 dark:text-white mb-8">
          Privacy <span className="bg-gradient-to-r from-[#66DFC0] via-[#2DBDD5] to-[#2553B5] bg-clip-text text-transparent">Policy</span>
        </h1>
        <div className="prose prose-lg dark:prose-invert max-w-none text-zinc-700 dark:text-zinc-300 space-y-6">
          <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Last updated: {new Date().toLocaleDateString()}</p>
          <p className="text-xl">
            At Vision Printt Technologies, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website printmimo.page or use our services.
          </p>
          
          <div className="space-y-12 mt-12">
            <section>
              <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white mb-4 flex items-center">
                <span className="bg-[#2DBDD5]/20 text-[#2DBDD5] w-8 h-8 rounded-lg flex items-center justify-center text-lg mr-3">1</span>
                Information We Collect
              </h2>
              <p>
                We may collect personal information that you voluntarily provide to us when you register on the website, place an order, or contact us. This includes your name, email address, shipping address, and payment information. We also collect the documents you upload solely for the purpose of printing and fulfilling your order.
              </p>
            </section>

            <section>
              <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white mb-4 flex items-center">
                <span className="bg-[#2DBDD5]/20 text-[#2DBDD5] w-8 h-8 rounded-lg flex items-center justify-center text-lg mr-3">2</span>
                How We Use Your Information
              </h2>
              <p>
                We use the information we collect primarily to provide, maintain, and improve our services, process your transactions, and communicate with you about your orders.
              </p>
            </section>

            <section>
              <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white mb-4 flex items-center">
                <span className="bg-[#2DBDD5]/20 text-[#2DBDD5] w-8 h-8 rounded-lg flex items-center justify-center text-lg mr-3">3</span>
                Data Security
              </h2>
              <p>
                We implement reasonable security measures to protect your personal information. Uploaded documents are processed securely and are strictly confidential. We do not share your documents with any third parties other than our trusted printing partners who are bound by confidentiality agreements.
              </p>
            </section>

            <section>
              <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white mb-4 flex items-center">
                <span className="bg-[#2DBDD5]/20 text-[#2DBDD5] w-8 h-8 rounded-lg flex items-center justify-center text-lg mr-3">4</span>
                Contact Us
              </h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us at <a href="mailto:support@printmimo.page" className="text-[#2DBDD5] hover:underline font-semibold">support@printmimo.page</a>.
              </p>
            </section>
          </div>
        </div>
        <div className="mt-16 pt-8 border-t border-zinc-200 dark:border-zinc-800">
          <Link href="/" className="inline-flex items-center px-6 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white font-bold hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors">
            &larr; Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
