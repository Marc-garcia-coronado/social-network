import { useQuery } from '@tanstack/react-query';

const fetchPosts = async () => {
    const response = await fetch('http://localhost:3000/api/feed', {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${document.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1")}` // Extrae la cookie `token`
        }
    });
    if (!response.ok) {
        throw new Error('Error fetching posts');
    }
    return response.json();
};

export default function useHome() {
    return useQuery({ queryKey: ['posts'], queryFn: fetchPosts });
}