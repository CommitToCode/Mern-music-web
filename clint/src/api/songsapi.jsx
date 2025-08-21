export async function fetchSongs() {
  const res = await fetch("https://mern-music-web.onrender.com/admin/api/songs", {
    credentials: "include" 
  });

  if (!res.ok) {
    throw new Error("Failed to fetch songs");
  }

  const data = await res.json();
  return data.songs || [];
}
