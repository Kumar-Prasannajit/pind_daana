import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import dbConnect from '@/lib/db'
import Client from '@/models/Client'
import { issueTokens } from '@/services/token.service'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { data: sessionData, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('Supabase Auth Error:', error)
      return NextResponse.redirect(`${requestUrl.origin}/client/login?error=OAuthFailed`)
    }

    const email = sessionData.user?.email
    const name = sessionData.user?.user_metadata?.full_name || sessionData.user?.user_metadata?.name || 'User'

    if (!email) {
      return NextResponse.redirect(`${requestUrl.origin}/client/login?error=EmailNotProvided`)
    }

    try {
      await dbConnect()
      
      const existingClient = await Client.findOne({ email })

      if (existingClient) {
        // User exists, issue our custom JWTs and log them in
        const { jwt, refreshToken } = await issueTokens(existingClient)
        
        const cookieStore = await cookies()
        cookieStore.set('refresh_token', refreshToken, { 
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production', 
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 // 7 days
        })

        cookieStore.set('client_token', jwt, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 
        })

        cookieStore.set('client_auth_token', jwt, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 
        })

        cookieStore.set('client_auth_status', 'true', {
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60
        })

        return NextResponse.redirect(`${requestUrl.origin}/`) // Or wherever the dashboard is
      } else {
        // User DOES NOT exist. We need to redirect them to complete profile.
        // We will store their OAuth info in a temporary secure cookie.
        const pendingOAuthData = {
          email,
          name,
          provider: 'google'
        }
        
        const cookieStore = await cookies()
        cookieStore.set('oauth_pending', JSON.stringify(pendingOAuthData), {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax', // Must be lax to redirect properly
          maxAge: 3600 // 1 hour to complete signup
        })

        return NextResponse.redirect(`${requestUrl.origin}/client/complete-profile`)
      }

    } catch (dbError) {
      console.error('DB Error during OAuth:', dbError)
      return NextResponse.redirect(`${requestUrl.origin}/client/login?error=ServerError`)
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(`${requestUrl.origin}/client/login`)
}
