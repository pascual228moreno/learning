
export interface Step {
  id: string;
  title: string;
  description: string;
  /** Full Markdown body of the module. Rendered with react-markdown. */
  content?: string;
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

export type Role = 'student' | 'superadmin';

/** Row from public.profiles (snake_case to match Postgres). */
export interface UserProfile {
  id: string;
  email: string;
  display_name: string | null;
  photo_url: string | null;
  role: Role;
  course_ids: string[];
  created_at: string;
  created_by: string | null;
  last_login_at: string | null;
}

/** Row from public.comments. */
export interface Comment {
  id: string;
  user_id: string;
  user_name: string | null;
  user_photo: string | null;
  course_id: string;
  session_id: string;
  text: string;
  created_at: string;
}

/** Row from public.progress. */
export interface ProgressRow {
  id: string;
  user_id: string;
  course_id: string;
  step_id: string;
  completed: boolean;
  updated_at: string;
}
