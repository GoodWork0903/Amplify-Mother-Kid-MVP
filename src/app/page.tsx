import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Mother/Kid SaaS Platform
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            A comprehensive SaaS solution designed specifically for mothers and kids, 
            featuring secure authentication and multi-tenant architecture.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/admin"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              Admin Portal
            </Link>
            <Link 
              href="/t/demo"
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              Tenant Portal
            </Link>
          </div>
          
          <div className="mt-16 grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Secure Authentication</h3>
              <p className="text-gray-600">
                Powered by AWS Cognito with hosted UI for enterprise-grade security.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Multi-Tenant</h3>
              <p className="text-gray-600">
                Isolated tenant environments with role-based access control.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Modern Stack</h3>
              <p className="text-gray-600">
                Built with Next.js 15, TypeScript, and AWS services.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
