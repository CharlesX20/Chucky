import Link from "next/link";

const Footer = () => {
  return (
    <footer className="w-full border-t border-light-600/20 bg-dark-100 mt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          {/* Main Footer Text */}
          <p className="text-light-100 text-lg font-semibold mb-2">
            Crafted with 💚 by Charles
          </p>
          
          {/* Contact Information */}
          <p className="text-light-400 text-sm mb-4">
            For collaborations, questions, or feedback
          </p>
          
          {/* Contact Details */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-light-100 text-sm">
            <div className="flex items-center gap-2 bg-dark-200 px-4 py-2 rounded-full">
              <svg className="w-4 h-4 text-success-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span className="font-semibold">+1 (647) 801-5413</span>
            </div>
            
            <Link 
              href="mailto:charleschime23@gmail.com"
              className="flex items-center gap-2 bg-dark-200 px-4 py-2 rounded-full hover:bg-success-100/10 transition-colors"
            >
              <svg className="w-4 h-4 text-success-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="font-semibold">Email Charles</span>
            </Link>
          </div>
          
          {/* Copyright */}
          <div className="mt-6 pt-4 border-t border-light-600/20">
            <p className="text-light-400 text-xs">
              © {new Date().getFullYear()} Chucky InterviewPrep. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;