import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export interface AuthUser {
  id: string
  name: string
  email: string
  role: string
  companyName?: string
}

export async function getAuthUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies()
  const userCookie = cookieStore.get("auth-user")

  if (!userCookie) {
    console.log("No auth-user cookie found");
    return null
  }

  try {
    const user = JSON.parse(userCookie.value);
    if (!user || !user.id || !user.role) {
      console.log("Invalid user data in cookie");
      return null;
    }
    return user;
  } catch (error) {
    console.error("Failed to parse auth cookie:", error);
    // Delete invalid cookie
    cookieStore.delete("auth-user");
    return null
  }
}

export async function requireAuth(requiredRole?: string): Promise<AuthUser> {
  const user = await getAuthUser()

  if (!user) {
    console.log("No authenticated user found, redirecting to login")
    redirect("/login")
  }

  if (requiredRole && user.role !== requiredRole) {
    console.log(`User role ${user.role} does not match required role ${requiredRole}, redirecting to login`)
    redirect("/login")
  }

  return user
}

export async function setAuthCookie(user: AuthUser): Promise<void> {
  const cookieStore = await cookies()
  
  // First clear any existing cookie
  cookieStore.delete("auth-user");
  
  // Set a fresh cookie
  cookieStore.set("auth-user", JSON.stringify(user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24, // 1 day as specified in requirements
    path: '/', // Ensure cookie is available everywhere
  })
}

export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies()
  
  // Delete by setting an expired cookie with the same path
  cookieStore.set("auth-user", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: new Date(0), // Set to epoch time to ensure immediate expiration
    path: '/',
  })
}
