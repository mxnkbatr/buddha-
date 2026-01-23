import { ObjectId } from "mongodb";

export interface User {
  _id?: ObjectId | string;
  clerkId: string; // Links to Clerk Auth (or 'custom-db' for direct users)
  email?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  phone?: string;
  password?: string; // Hashed password for direct DB auth

  // Spiritual Stats
  karma: number;
  meditationDays: number;
  totalMerits: number;
  earnings?: number; // Total earnings for monks
  role: "seeker" | "monk" | "admin";
  monkStatus?: "pending" | "approved" | "rejected"; // Approval status for monks

  createdAt: Date;
  updatedAt: Date;
}

export interface Monk {
  _id?: ObjectId | string;
  name: {
    mn: string;
    en: string;
  };
  title: {
    mn: string;
    en: string;
  };
  image: string;
  video?: string;
  specialties: string[]; // e.g., ["Astrology", "Meditation"]
  bio: {
    mn: string;
    en: string;
  };
  isAvailable: boolean;
  quote: {
    mn: string;
    en: string;
  };
  monkNumber?: number; // Order/Display number

  // New Fields
  phone?: string;
  isSpecial?: boolean; // Admin-controlled special status
  yearsOfExperience: number;
  education: {
    mn: string;
    en: string;
  };
  philosophy: {
    mn: string;
    en: string;
  };
  services: {
    id: string;
    name: {
      mn: string;
      en: string;
    };
    price: number; // in local currency
    duration: string; // e.g., "30 min", "1 hour"
    status?: 'pending' | 'active' | 'rejected';
  }[];
  schedule?: {
    day: string;
    start: string;
    end: string;
    active: boolean
  }[];
  blockedSlots?: {
    id: string;
    date: string;
    time: string;
  }[];
}

export interface Booking {
  _id?: ObjectId | string;
  userId: string; // Clerk ID
  monkId: ObjectId | string;
  date: Date;
  type: "Astrology" | "Counseling" | "Prayer" | "Ritual";
  status: "pending" | "confirmed" | "completed" | "cancelled";
  notes?: string;
  createdAt: Date;
}

export interface Comment {
  _id?: ObjectId | string;
  userId?: string; // Optional if guest
  authorName: string;
  authorRole: string;
  avatar: string;
  text: string;
  karma: number; // Likes/Upvotes
  element: "gold" | "saffron" | "ochre" | "light" | "earth" | "wind" | "water" | "fire" | "air" | "dark"; // Visual theme
  createdAt: Date;
}
export interface Service {
  _id?: ObjectId | string;
  id: string;
  name: {
    mn: string;
    en: string;
  };
  price: number
  duration: string; // e.g., "30 min", "1 hour"
  type: "teaching" | "divination"; // Aesthetic theme
  desc: {
    mn: string;
    en: string;
  }
  subtitle: {
    mn: string;
    en: string;
  };
  title: {
    mn: string;
    en: string;
  };
  image?: string;
  quote?: {
    mn: string;
    en: string;
  };
}

export interface Message {
  _id?: ObjectId | string;
  bookingId: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: Date;
}