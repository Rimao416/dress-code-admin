import { SessionOptions, getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { Role } from '../../generated/prisma';
import prisma from '../client';

// Define the session data structure
export type SessionData = {
  userId?: string;
  userEmail?: string;
  userName?: string; // Will be firstName + lastName from Client
  userRole?: Role;
  userAvatar?: string;
  userLanguage?: string;
  isAuthenticated?: boolean;
  expiresAt?: number;
};

// Define the interface for the iron session with save method
export interface IronSessionWithData extends SessionData {
  save: () => Promise<void>;
}

// Role-based expiry configuration (in seconds)
const ROLE_EXPIRY = {
  ADMIN: 60 * 60 * 8,          // 8 hours for admins
  CLIENT: 60 * 60 * 4,         // 4 hours for clients
  DEFAULT: 60 * 60 * 1,        // 1 hour default
};

// Get the appropriate TTL based on user role
const getExpiryForRole = (role?: Role): number => {
  if (!role) return ROLE_EXPIRY.DEFAULT;
  
  // Safely map Role enum to ROLE_EXPIRY keys
  switch (role) {
    case Role.ADMIN:
      return ROLE_EXPIRY.ADMIN;
    case Role.CLIENT:
      return ROLE_EXPIRY.CLIENT;
    default:
      return ROLE_EXPIRY.DEFAULT;
  }
};

// Session configuration options
export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET || 'this-should-be-at-least-32-chars-long',
  cookieName: 'dress-code_session',
  cookieOptions: {
    // TODO : Change after test
    secure: false,
    httpOnly: true,
    sameSite: 'strict',
    path: '/',
  },
  ttl: ROLE_EXPIRY.DEFAULT,
};

// Get or create a session
export const getSession = async (): Promise<IronSessionWithData> => {
  // Create a cookie store from Next.js cookies
  const cookieStore = await cookies();
  
  // Use a more direct approach with type assertion
  const session = await getIronSession<IronSessionWithData>(cookieStore, sessionOptions);
  
  // Check if session has expired
  if (session.expiresAt && Date.now() > session.expiresAt) {
    // Simple approach: reset key properties rather than trying to delete them
    session.userId = undefined;
    session.userEmail = undefined;
    session.userName = undefined;
    session.userRole = undefined;
    session.isAuthenticated = false;
    session.expiresAt = undefined;
    session.userAvatar = undefined;
    session.userLanguage = undefined;
    
    // Save the reset session
    await session.save();
  }
  
  return session;
};

// Helper to check if user is logged in
export const isLoggedIn = (session: IronSessionWithData): boolean => {
  return !!session.isAuthenticated && !!session.userId;
};

// Helper to get the authenticated user type/role
export const userType = (session: IronSessionWithData): Role | undefined => {
  return session.userRole;
};

// Helper to get the full authenticated user
export const authenticatedUser = async (session: IronSessionWithData) => {
  if (!isLoggedIn(session) || !session.userId) {
    return null;
  }
  
  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId }, // userId is now a string (UUID)
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        // Include related data based on role
        client: {
          select: {
            firstName: true,
            lastName: true,
            phone: true,
            dateOfBirth: true,
            gender: true,
          }
        },
        admin: {
          select: {
            id: true,
          }
        }
      }
    });
    
    return user;
  } catch (error) {
    console.error('Error fetching authenticated user:', error);
    return null;
  }
};

// Update session with user information and set proper expiry
export const updateSessionWithUser = async (session: IronSessionWithData, userId: string): Promise<boolean> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }, // userId is now a string (UUID)
      include: {
        client: {
          select: {
            firstName: true,
            lastName: true,
          }
        },
        admin: true,
      }
    });
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Update session with user data
    session.userId = user.id; // Already a string (UUID)
    session.userEmail = user.email;
    
    // Set userName based on role
    if (user.role === Role.CLIENT && user.client) {
      session.userName = `${user.client.firstName} ${user.client.lastName}`;
    } else if (user.role === Role.ADMIN) {
      // For admin, we could use email as name or set a default
      session.userName = user.email.split('@')[0]; // Use email prefix as name
    } else {
      session.userName = user.email.split('@')[0]; // Fallback
    }
    
    session.userRole = user.role;
    session.isAuthenticated = true;
    
    // Set expiry based on role
    const ttl = getExpiryForRole(user.role);
    session.expiresAt = Date.now() + (ttl * 1000);
    
    await session.save();
    return true;
  } catch (error) {
    console.error('Error updating session with user:', error);
    return false;
  }
};

// Helper to get user display name based on role
export const getUserDisplayName = async (userId: string): Promise<string | null> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        client: {
          select: {
            firstName: true,
            lastName: true,
          }
        }
      }
    });
    
    if (!user) return null;
    
    if (user.role === Role.CLIENT && user.client) {
      return `${user.client.firstName} ${user.client.lastName}`;
    }
    
    // For admin or fallback
    return user.email.split('@')[0];
  } catch (error) {
    console.error('Error getting user display name:', error);
    return null;
  }
};

// Helper to clear session
export const clearSession = async (session: IronSessionWithData): Promise<void> => {
  session.userId = undefined;
  session.userEmail = undefined;
  session.userName = undefined;
  session.userRole = undefined;
  session.isAuthenticated = false;
  session.expiresAt = undefined;
  session.userAvatar = undefined;
  session.userLanguage = undefined;
  
  await session.save();
};