import { useQuery } from "@tanstack/react-query";

const fetchUserTopics = async (userID: number) => {
  const response = await fetch(
    `https://social-network-production.up.railway.app/api/users/${userID}/topics`,
    {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
  if (!response.ok) {
    throw new Error("Error fetching user topics");
  }
  return response.json();
};

export default function useUser(userID: number) {
  return useQuery({
    queryKey: ["userTopics", userID],
    queryFn: () => fetchUserTopics(userID),
  });
}
