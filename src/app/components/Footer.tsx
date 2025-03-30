// components/Footer.jsx
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="w-full py-6 bg-gray-100 dark:bg-zinc-900">
      <div className="container max-w-screen-lg mx-auto px-4 flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
        <p className="text-sm text-gray-700 dark:text-gray-300">
          &copy; {new Date().getFullYear()} CheungWanYin FYP Website. All rights reserved.
        </p>
        
        <div className="flex space-x-4">
          <Link href="/">
            <button
              className="px-4 py-2 text-sm font-semibold 
                        border border-pink-400 text-pink-400 rounded 
                        hover:bg-pink-400 hover:text-white transition"
            >
              Back to HomePage
            </button>
          </Link>
          <a
            href="https://wanyins-organization.gitbook.io/donty-docs"
            target="_blank"
            rel="noopener noreferrer"
          >
            <button
              className="px-4 py-2 text-sm font-semibold 
                        border border-green-400 text-green-400 rounded 
                        hover:bg-green-400 hover:text-white transition"
            >
              View Docs
            </button>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
