
export async function fetchSongs() {
  const res = await fetch('http://localhost:3005/admin/api/songs');
  if (!res.ok) throw new Error('Failed to fetch songs');
  const data = await res.json();

  return data.songs || [];
}
