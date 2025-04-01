import { useQuery } from '@tanstack/react-query';

const fetchUserTopics = async (userID: number) => {
    const response = await fetch(`http://localhost:3000/api/users/${userID}/topics`, {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${document.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1")}` // Extrae la cookie `token`
        }
    });
    if (!response.ok) {
        throw new Error('Error fetching user topics');
    }
    return response.json();
};

export default function useUser(userID: number) {
    return useQuery({ queryKey: ['userTopics', userID], queryFn: () => fetchUserTopics(userID) });
}