import Link from 'next/link';

export const metadata = {
  title: 'Contact Us | Vision Printt Technologies',
  description: 'Get in touch with Vision Printt Technologies.',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 py-20 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <h1 className="text-4xl md:text-6xl font-outfit font-black tracking-tight text-zinc-900 dark:text-white mb-8">
          Contact <span className="bg-gradient-to-r from-[#66DFC0] via-[#2DBDD5] to-[#2553B5] bg-clip-text text-transparent">Us</span>
        </h1>
        <div className="prose prose-lg dark:prose-invert max-w-none text-zinc-700 dark:text-zinc-300 space-y-6">
          <p>
            Have a question, feedback, or need support? We're here to help! Reach out to us using the information below, and our team will get back to you as soon as possible.
          </p>
          <div className="bg-white dark:bg-zinc-900/50 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 mt-8 shadow-xl shadow-zinc-200/20 dark:shadow-none backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">Get in Touch</h2>
            <ul className="space-y-6">
              <li className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-[#2DBDD5]/10 flex items-center justify-center text-[#2DBDD5] mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                </div>
                <div>
                  <span className="block text-sm font-medium text-zinc-500 dark:text-zinc-400">Email</span>
                  <a href="mailto:support@printmimo.page" className="text-lg font-bold text-zinc-900 dark:text-white hover:text-[#2DBDD5] dark:hover:text-[#2DBDD5] transition-colors">support@printmimo.page</a>
                </div>
              </li>
              <li className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-[#66DFC0]/10 flex items-center justify-center text-[#66DFC0] mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                </div>
                <div>
                  <span className="block text-sm font-medium text-zinc-500 dark:text-zinc-400">Company</span>
                  <span className="text-lg font-bold text-zinc-900 dark:text-white">Vision Printt Technologies</span>
                </div>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12">
          <Link href="/" className="inline-flex items-center px-6 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white font-bold hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors">
            &larr; Back to Home
          </Link>
        </div>
      </div>
      
      {/* Background decorations */}
      <div className="absolute top-1/3 right-0 w-80 h-80 bg-[#2553B5]/5 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
    </div>
  );
}
