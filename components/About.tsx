export default function About() {
  return (
    <div className="py-16 bg-white" id="about">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">About Us</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Building the Future of AI Infrastructure
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            Tinova.ai is at the forefront of AI technology, developing robust infrastructure 
            solutions that power the next generation of intelligent applications.
          </p>
        </div>

        <div className="mt-10">
          <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
            <div className="relative">
              <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <p className="ml-16 text-lg leading-6 font-medium text-gray-900">
                High-Performance Infrastructure
              </p>
              <p className="mt-2 ml-16 text-base text-gray-500">
                Our infrastructure solutions are designed to handle the most demanding AI workloads 
                with optimized performance and resource management.
              </p>
            </div>

            <div className="relative">
              <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <p className="ml-16 text-lg leading-6 font-medium text-gray-900">
                Secure & Reliable
              </p>
              <p className="mt-2 ml-16 text-base text-gray-500">
                Security-first approach with enterprise-grade reliability, ensuring your AI 
                applications run smoothly and securely in production environments.
              </p>
            </div>

            <div className="relative">
              <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <p className="ml-16 text-lg leading-6 font-medium text-gray-900">
                Scalable Architecture
              </p>
              <p className="mt-2 ml-16 text-base text-gray-500">
                Built to scale from prototype to production, our solutions grow with your business 
                needs and adapt to changing requirements.
              </p>
            </div>

            <div className="relative">
              <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <p className="ml-16 text-lg leading-6 font-medium text-gray-900">
                Seamless Integration
              </p>
              <p className="mt-2 ml-16 text-base text-gray-500">
                Easy-to-use APIs and comprehensive documentation make integration straightforward, 
                allowing developers to focus on building great AI applications.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}