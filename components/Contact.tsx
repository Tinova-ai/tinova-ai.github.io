export default function Contact() {
  return (
    <div className="bg-white" id="contact">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-lg mx-auto md:max-w-none md:grid md:grid-cols-2 md:gap-8">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
              Get in Touch
            </h2>
            <div className="mt-3">
              <p className="text-lg text-gray-500">
                Ready to transform your business with AI? We'd love to hear about your project 
                and discuss how Tinova.ai can help you achieve your goals.
              </p>
            </div>
            <div className="mt-9">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="ml-3 text-base text-gray-500">
                  <p>contact@tinova.ai</p>
                </div>
              </div>
              <div className="mt-6 flex">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3 text-base text-gray-500">
                  <p>Available 24/7 for enterprise support</p>
                </div>
              </div>
              <div className="mt-6 flex">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="ml-3 text-base text-gray-500">
                  <p>San Francisco, CA & Remote</p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-12 sm:mt-16 md:mt-0">
            <h2 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
              Our Services
            </h2>
            <div className="mt-3">
              <p className="text-lg text-gray-500">
                We offer a comprehensive suite of AI infrastructure services:
              </p>
            </div>
            <div className="mt-9">
              <ul className="space-y-4">
                <li className="flex">
                  <div className="flex-shrink-0">
                    <div className="h-2 w-2 bg-primary-600 rounded-full mt-2"></div>
                  </div>
                  <div className="ml-3">
                    <p className="text-base text-gray-700 font-medium">AI Model Hosting & Deployment</p>
                    <p className="text-sm text-gray-500">Scalable model serving with auto-scaling</p>
                  </div>
                </li>
                <li className="flex">
                  <div className="flex-shrink-0">
                    <div className="h-2 w-2 bg-primary-600 rounded-full mt-2"></div>
                  </div>
                  <div className="ml-3">
                    <p className="text-base text-gray-700 font-medium">Infrastructure Monitoring</p>
                    <p className="text-sm text-gray-500">Real-time metrics and alerting</p>
                  </div>
                </li>
                <li className="flex">
                  <div className="flex-shrink-0">
                    <div className="h-2 w-2 bg-primary-600 rounded-full mt-2"></div>
                  </div>
                  <div className="ml-3">
                    <p className="text-base text-gray-700 font-medium">API Gateway & Security</p>
                    <p className="text-sm text-gray-500">Secure API management and access control</p>
                  </div>
                </li>
                <li className="flex">
                  <div className="flex-shrink-0">
                    <div className="h-2 w-2 bg-primary-600 rounded-full mt-2"></div>
                  </div>
                  <div className="ml-3">
                    <p className="text-base text-gray-700 font-medium">Technical Consulting</p>
                    <p className="text-sm text-gray-500">Expert guidance on AI architecture</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}