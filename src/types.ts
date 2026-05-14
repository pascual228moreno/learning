
export interface Step {
  id: string;
  title: string;
  description: string;
  duration?: string;
  isExpanded?: boolean;
  resources?: { title: string; url: string }[];
}

export interface Exercise {
  id: string;
  title: string;
  description: string;
}

export interface Session {
  id: number;
  title: string;
  date: string;
  objectives: string[];
  script: Step[];
  exercises: Exercise[];
  takeaways: string[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  category: string;
  sessions: Session[];
  image?: string;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  courseId: string;
  sessionId: string;
  text: string;
  createdAt: any;
}

export type Role = 'student' | 'superadmin';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  role: Role;
  courseIds: string[];
  createdAt?: any;
  createdBy?: string | null;
  lastLoginAt?: any;
}
