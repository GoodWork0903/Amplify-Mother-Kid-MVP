import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { config } from '@/lib/config'

export async function GET(request: NextRequest) {
  return handleProxyRequest(request, 'GET')
}

export async function POST(request: NextRequest) {
  return handleProxyRequest(request, 'POST')
}

export async function PUT(request: NextRequest) {
  return handleProxyRequest(request, 'PUT')
}

export async function DELETE(request: NextRequest) {
  return handleProxyRequest(request, 'DELETE')
}

export async function PATCH(request: NextRequest) {
  return handleProxyRequest(request, 'PATCH')
}

async function handleProxyRequest(request: NextRequest, method: string) {
  try {
    const session = await getSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get the path after /api/proxy
    const url = new URL(request.url)
    const path = url.pathname.replace('/api/proxy', '')
    
    // Construct the target API URL
    const targetUrl = `${config.api.baseUrl}${path}${url.search}`
    
    // Get the request body if it exists
    let body: string | undefined
    if (method !== 'GET' && method !== 'HEAD') {
      body = await request.text()
    }
    
    // Forward the request to API Gateway
    const response = await fetch(targetUrl, {
      method,
      headers: {
        'Content-Type': request.headers.get('Content-Type') || 'application/json',
        'Authorization': `Bearer ${session.accessToken}`,
        // Forward other relevant headers
        ...(request.headers.get('Accept') && { 'Accept': request.headers.get('Accept')! }),
        ...(request.headers.get('User-Agent') && { 'User-Agent': request.headers.get('User-Agent')! }),
      },
      body,
    })
    
    // Get the response body
    const responseBody = await response.text()
    
    // Create a new response with the same status and headers
    const newResponse = new NextResponse(responseBody, {
      status: response.status,
      statusText: response.statusText,
    })
    
    // Copy relevant response headers
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() !== 'content-encoding') {
        newResponse.headers.set(key, value)
      }
    })
    
    return newResponse
    
  } catch (error) {
    console.error('Proxy error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
