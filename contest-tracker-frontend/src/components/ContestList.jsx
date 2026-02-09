import { useEffect, useState } from "react";
import { fetchCodeforcesContests } from "../services/contestApi";

function ContestList() {
  const [contests, setContests] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadContests() {
      setLoading(true);
      const data = await fetchCodeforcesContests(
        filter === "all" ? "" : filter
      );
      setContests(data.contests);
      setLoading(false);
    }
    loadContests();
  }, [filter]);

  if (loading) return <p>Loading contests...</p>;

  return (
    <div>
      <h2 className="section-title">
  Upcoming Codeforces Contests
</h2>

      <div className="filter-buttons">
  <button
    className={filter === "all" ? "active" : ""}
    onClick={() => setFilter("all")}
  >
    All
  </button>
  <button
    className={filter === "today" ? "active" : ""}
    onClick={() => setFilter("today")}
  >
    Today
  </button>
  <button
    className={filter === "week" ? "active" : ""}
    onClick={() => setFilter("week")}
  >
    This Week
  </button>
</div>


      <div className="contest-list">
  {contests.map((contest, index) => (
    <div className="contest-card" key={index}>
      <span className="badge">Codeforces</span>
      <h3>{contest.name}</h3>

      <p>
        <strong>Start:</strong>{" "}
        {new Date(contest.startTime).toLocaleString()}
      </p>

      <p>
        <strong>Duration:</strong> {contest.duration} mins
      </p>

      <a href={contest.url} target="_blank" rel="noreferrer">
        View Contest →
      </a>
    </div>
  ))}
</div>

    </div>
  );
}

export default ContestList;
