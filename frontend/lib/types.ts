export type Topic = {
  id: number;
  name: string;
  description: string;
  createdAt: Date;
};

export type User = {
  id: number;
  user_name: string;
  full_name: string;
  email: string;
  user_since: string;
  is_active: boolean;
  role: string;
  bio?: string;
};

export type DataHTTPResponse = {
  status: number;
  message: string;
};

export type Event = {
  id: number;
  name: string;
  description: string;
  picture: string;
  location: string;
  creator: User;
  topic: Topic;
  createdAt: string;
  date: string;
};
