import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <span className="text-2xl font-bold text-primary-400">Tinova.ai</span>
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              Technology company focused on AI infrastructure and services, 
              providing cutting-edge solutions for the modern digital landscape.
            </p>
            <p className="text-gray-400 text-sm">
              Building the future of AI-powered applications with robust, 
              scalable infrastructure solutions.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-300 hover:text-primary-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-300 hover:text-primary-400 transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-gray-300 hover:text-primary-400 transition-colors">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Services</h3>
            <ul className="space-y-2 text-gray-300">
              <li>AI Infrastructure</li>
              <li>Cloud Solutions</li>
              <li>Monitoring & Analytics</li>
              <li>Technical Consulting</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} Tinova.ai. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0">
            <p className="text-gray-400 text-sm">
              Powered by Next.js & Hosted on GitHub Pages
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}