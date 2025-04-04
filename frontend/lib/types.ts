type Topic = {
    id: number,
    name: string,
    description: string,
    createdAt: Date,
}

type User = {
  id: number;
  user_name: string;
  full_name: string;
  email: string;
  user_since: string;
  is_active: boolean;
  role: string;
};

type DataHTTPResponse = {
  status: number;
  message: string;
}