export type User = {
  id: number;
  email: string;
  type: string;
  avatar_url: string;
  created_at: number;
  name: string;
};

export type UserProfile = {
  id: string;
  type: string;
  email: string;
  name: string | null;
  avatar_url: string;
  created_at: string;
};

export type AuthResponse = {
  user: UserProfile | null;
  error: string | null;
};
