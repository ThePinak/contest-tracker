const BASE_URL = "http://localhost:5000/api/contests";

export async function fetchCodeforcesContests(filter = "") {
  const url = filter
    ? `${BASE_URL}/codeforces?filter=${filter}`
    : `${BASE_URL}/codeforces`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch contests");
  }
  return response.json();
}
