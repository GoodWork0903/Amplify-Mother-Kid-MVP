import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { getCognitoLoginUrl } from '@/lib/auth'

export default async function TenantLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ tenant: string }>
}) {
  const { tenant } = await params
  const session = await getSession()
  
  if (!session) {
    const state = encodeURIComponent(JSON.stringify({ next: `/t/${tenant}` }))
    const loginUrl = getCognitoLoginUrl(state)
    redirect(loginUrl)
  }
  
  // Check if user has access to this tenant
  // In a real app, you'd validate tenant access from your backend
  const hasTenantAccess = true // This should be validated against your API
  
  if (!hasTenantAccess) {
    redirect('/?error=tenant_access_denied')
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                {tenant.charAt(0).toUpperCase() + tenant.slice(1)} Portal
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Welcome, {session.user.name || session.user.email}
              </span>
              <a 
                href="/auth/logout"
                className="text-sm text-red-600 hover:text-red-800"
              >
                Logout
              </a>
            </div>
          </div>
        </div>
      </nav>
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}
