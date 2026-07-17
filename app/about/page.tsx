import Link from 'next/link';

export const metadata = {
  title: 'About Us | Vision Printt Technologies',
  description: 'Learn more about Vision Printt Technologies and our mission.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 py-20 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <h1 className="text-4xl md:text-6xl font-outfit font-black tracking-tight text-zinc-900 dark:text-white mb-8">
          About <span className="bg-gradient-to-r from-[#66DFC0] via-[#2DBDD5] to-[#2553B5] bg-clip-text text-transparent">Us</span>
        </h1>
        <div className="prose prose-lg dark:prose-invert max-w-none text-zinc-700 dark:text-zinc-300 space-y-6">
          <p>
            At Vision Printt Technologies, we are dedicated to revolutionizing the way students and professionals handle their printing needs. Our flagship platform, MIMO, is designed to take the stress out of document preparation.
          </p>
          <p>
            Our mission is simple: You focus on your research, and we'll handle the rest. We print, bind, and prepare your documents with the utmost care and quality, delivering them right to your doorstep.
          </p>
          <p>
            Founded in 2026, Vision Printt Technologies brings innovation to the traditional printing industry, ensuring a seamless, fast, and reliable experience for everyone.
          </p>
        </div>
        <div className="mt-12">
          <Link href="/" className="inline-flex items-center px-6 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white font-bold hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors">
            &larr; Back to Home
          </Link>
        </div>
      </div>
      
      {/* Background decorations */}
      <div className="absolute top-1/4 left-0 w-64 h-64 bg-[#2DBDD5]/10 rounded-full blur-[80px] -z-10 pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-0 w-64 h-64 bg-[#66DFC0]/10 rounded-full blur-[80px] -z-10 pointer-events-none"></div>
    </div>
  );
}
