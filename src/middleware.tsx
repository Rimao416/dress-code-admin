import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getIronSession } from 'iron-session'
import { sessionOptions,SessionData } from './lib/auth/session'
import { Role } from './generated/prisma'

// ========== ROUTE DEFINITIONS ==========

// Routes publiques accessibles sans authentification
const publicRoutes = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/auth/logout',
  '/api/auth/refresh',
  '/favicon.ico',
  '/_next',
]

// Routes protégées nécessitant le rôle ADMIN
const adminOnlyRoutes = [
  { path: '/dashboard', roles: [Role.ADMIN] },
  { path: '/api', roles: [Role.ADMIN] }, // Toutes les routes API sauf auth
]

// ========== OPTIMIZATIONS ==========

// Pre-compute public routes as Set for O(1) lookup
const publicRoutesSet = new Set(publicRoutes)
const publicPrefixes = publicRoutes.filter(route => route.endsWith('/')).map(route => route.slice(0, -1))

// Pre-compute protected routes
const protectedPrefixes: { prefix: string; roles: Role[] }[] = []
adminOnlyRoutes.forEach(route => {
  protectedPrefixes.push({ prefix: route.path, roles: route.roles })
})

// Sort by length (longest first) for correct prefix matching
protectedPrefixes.sort((a, b) => b.prefix.length - a.prefix.length)

// Simple in-memory session cache with TTL
interface CachedSession {
  session: SessionData
  expires: number
}

const sessionCache = new Map<string, CachedSession>()
const CACHE_TTL = 30 * 1000 // 30 seconds

// Clean cache periodically
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    sessionCache.forEach((cached, key) => {
      if (cached.expires < now) {
        sessionCache.delete(key)
      }
    })
  }, 60 * 1000)
}

// ========== HELPER FUNCTIONS ==========

/**
 * Ultra-fast public path check with Set lookup and prefix matching
 */
function isPublicPath(path: string): boolean {
  if (publicRoutesSet.has(path)) return true
  if (path.startsWith('/_next/static') || path.startsWith('/_next/image')) return true
  return publicPrefixes.some(prefix => path.startsWith(prefix + '/'))
}

/**
 * Check if path requires admin authentication
 */
function requiresAdmin(path: string): boolean {
  // Routes /api/* sauf /api/auth/*
  if (path.startsWith('/api/') && !path.startsWith('/api/auth/')) {
    return true
  }
  
  // Routes /dashboard/*
  if (path.startsWith('/dashboard')) {
    return true
  }
  
  return false
}

/**
 * Get session with caching
 */
async function getCachedSession(request: NextRequest): Promise<SessionData> {
  const cookieHeader = request.headers.get('cookie') || ''
  const cacheKey = Buffer.from(cookieHeader).toString('base64').slice(0, 32)
  
  const now = Date.now()
  const cached = sessionCache.get(cacheKey)
  
  if (cached && cached.expires > now) {
    return cached.session
  }
  
  const session = await getIronSession<SessionData>(
    request,
    NextResponse.next(),
    sessionOptions
  )
  
  if (session.isAuthenticated && session.userId) {
    sessionCache.set(cacheKey, {
      session,
      expires: now + CACHE_TTL
    })
  }
  
  return session
}

// ========== PRE-BUILT RESPONSES ==========

const RESPONSES = {
  FORBIDDEN_API: new NextResponse(
    JSON.stringify({ error: 'Accès interdit - Droits administrateur requis' }),
    { status: 403, headers: { 'Content-Type': 'application/json' } }
  ),
  UNAUTHORIZED_API: new NextResponse(
    JSON.stringify({ error: 'Non authentifié' }),
    { status: 401, headers: { 'Content-Type': 'application/json' } }
  ),
  SESSION_EXPIRED_API: new NextResponse(
    JSON.stringify({ error: 'Session expirée' }),
    { status: 401, headers: { 'Content-Type': 'application/json' } }
  ),
  AUTH_ERROR_API: new NextResponse(
    JSON.stringify({ error: 'Erreur d\'authentification' }),
    { status: 500, headers: { 'Content-Type': 'application/json' } }
  ),
} as const

// ========== MIDDLEWARE ==========

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  console.log('Middleware exécuté pour:', pathname)

  // STEP 1: Fast public route check (most common case)
  if (isPublicPath(pathname)) {
    return NextResponse.next()
  }

  // STEP 2: Check if route requires admin
  if (!requiresAdmin(pathname)) {
    return NextResponse.next()
  }

  // STEP 3: Special handling for API routes
  if (pathname.startsWith('/api/')) {
    try {
      const session = await getCachedSession(request)

      // Check authentication
      if (!session.isAuthenticated || !session.userId) {
        console.log('❌ API - Accès refusé: Non authentifié')
        return RESPONSES.UNAUTHORIZED_API
      }

      // Check session expiry
      if (session.expiresAt && Date.now() > session.expiresAt) {
        console.log('❌ API - Accès refusé: Session expirée')
        return RESPONSES.SESSION_EXPIRED_API
      }

      // Check admin role
      if (session.userRole !== Role.ADMIN) {
        console.log('❌ API - Accès refusé: Role insuffisant', {
          userId: session.userId,
          role: session.userRole,
          required: Role.ADMIN
        })
        return RESPONSES.FORBIDDEN_API
      }

      console.log('✅ API - Accès autorisé:', {
        userId: session.userId,
        role: session.userRole,
        path: pathname
      })

      // Add custom headers for API routes
      const response = NextResponse.next()
      response.headers.set('X-User-Id', session.userId)
      response.headers.set('X-User-Role', session.userRole)
      return response

    } catch (error) {
      console.error('Erreur middleware API:', error)
      return RESPONSES.AUTH_ERROR_API
    }
  }

  // STEP 4: Handle dashboard routes (non-API)
  try {
    const session = await getCachedSession(request)

    // Check authentication
    if (!session.isAuthenticated || !session.userId) {
      console.log('❌ Dashboard - Accès refusé: Non authentifié')
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Check session expiry
    if (session.expiresAt && Date.now() > session.expiresAt) {
      console.log('❌ Dashboard - Accès refusé: Session expirée')
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      loginUrl.searchParams.set('session_expired', 'true')
      return NextResponse.redirect(loginUrl)
    }

    // Check admin role
    if (session.userRole !== Role.ADMIN) {
      console.log('❌ Dashboard - Accès refusé: Role insuffisant', {
        userId: session.userId,
        role: session.userRole,
        required: Role.ADMIN
      })
      return NextResponse.redirect(new URL('/', request.url))
    }

    console.log('✅ Dashboard - Accès autorisé:', {
      userId: session.userId,
      role: session.userRole,
      path: pathname
    })

    return NextResponse.next()

  } catch (error) {
    console.error('Erreur middleware dashboard:', error)
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }
}

// Configure the middleware to run only on specific paths
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}