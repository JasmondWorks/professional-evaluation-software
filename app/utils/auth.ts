/**
 * Utility functions for authentication and token management
 */

import { jwtDecode } from 'jwt-decode'
import { TokenManager } from './TokenManager'

/**
 * Safely retrieves the access token from localStorage
 * @returns The access token or null if not found/invalid
 */
export function getAccessToken(): string | null {
  return TokenManager.getToken();
}

/**
 * Safely stores the access token in localStorage
 * @param token - The JWT token to store
 */
export function setAccessToken(token: string): void {
  TokenManager.setToken(token);
}

/**
 * Removes the access token from localStorage
 */
export function removeAccessToken(): void {
  TokenManager.clearToken();
}

/**
 * Decodes and validates a JWT token
 * @param token - The JWT token to decode
 * @returns The decoded token payload or null if invalid
 */
export function decodeToken<T = any>(token: string | null): T | null {
  if (!token) {
    return null
  }

  try {
    const decoded = jwtDecode<T>(token)
    return decoded
  } catch (error) {
    console.error('Error decoding token:', error)
    return null
  }
}

/**
 * Gets the decoded user data from the stored access token
 * @returns The decoded user data or null if not available
 */
export function getCurrentUser<T = any>(): T | null {
  const token = getAccessToken()
  return decodeToken<T>(token)
}

/**
 * Checks if the user is authenticated
 * @returns true if a valid token exists, false otherwise
 */
export function isAuthenticated(): boolean {
  const token = getAccessToken()
  if (!token) {
    return false
  }

  try {
    const decoded = jwtDecode<{ exp?: number }>(token)
    
    // Check if token is expired
    if (decoded.exp) {
      const currentTime = Date.now() / 1000
      if (decoded.exp < currentTime) {
        removeAccessToken()
        return false
      }
    }
    
    return true
  } catch (error) {
    return false
  }
}

/**
 * Redirects to login page if not authenticated
 * @param router - Next.js router instance
 */
export function requireAuth(router: any): boolean {
  if (!isAuthenticated()) {
    router.push('/login')
    return false
  }
  return true
}
