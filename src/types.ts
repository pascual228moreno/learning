
export interface Step {
  id: string;
  title: string;
  description: string;
  duration?: string; // e.g. "20 min"
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
