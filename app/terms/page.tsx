import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service | Vision Printt Technologies',
  description: 'Terms of Service for Vision Printt Technologies.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 py-20 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <h1 className="text-4xl md:text-6xl font-outfit font-black tracking-tight text-zinc-900 dark:text-white mb-8">
          Terms of <span className="bg-gradient-to-r from-[#66DFC0] via-[#2DBDD5] to-[#2553B5] bg-clip-text text-transparent">Service</span>
        </h1>
        <div className="prose prose-lg dark:prose-invert max-w-none text-zinc-700 dark:text-zinc-300 space-y-6">
          <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Last updated: {new Date().toLocaleDateString()}</p>
          <p className="text-xl">
            Please read these Terms of Service carefully before using the printmimo.page website operated by Vision Printt Technologies.
          </p>
          
          <div className="space-y-12 mt-12">
            <section>
              <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white mb-4 flex items-center">
                <span className="bg-[#66DFC0]/20 text-[#66DFC0] w-8 h-8 rounded-lg flex items-center justify-center text-lg mr-3">1</span>
                Acceptance of Terms
              </h2>
              <p>
                By accessing or using our service, you agree to be bound by these Terms. If you disagree with any part of the terms, then you may not access the service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white mb-4 flex items-center">
                <span className="bg-[#66DFC0]/20 text-[#66DFC0] w-8 h-8 rounded-lg flex items-center justify-center text-lg mr-3">2</span>
                Description of Service
              </h2>
              <p>
                Vision Printt Technologies provides online document printing and binding services. We reserve the right to modify or discontinue the service at any time without notice.
              </p>
            </section>

            <section>
              <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white mb-4 flex items-center">
                <span className="bg-[#66DFC0]/20 text-[#66DFC0] w-8 h-8 rounded-lg flex items-center justify-center text-lg mr-3">3</span>
                User Content
              </h2>
              <p>
                You retain all rights to any documents you upload for printing. You are solely responsible for the content of your documents and ensure that you have the right to reproduce them. We will not print materials that violate copyright laws or are otherwise illegal.
              </p>
            </section>

            <section>
              <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white mb-4 flex items-center">
                <span className="bg-[#66DFC0]/20 text-[#66DFC0] w-8 h-8 rounded-lg flex items-center justify-center text-lg mr-3">4</span>
                Limitation of Liability
              </h2>
              <p>
                Vision Printt Technologies shall not be liable for any indirect, incidental, special, consequential or punitive damages resulting from your use of the service.
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
