import ContestList from "./components/ContestList";
import "./App.css";

function App() {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Contest Tracker</h1>
        <p>Track upcoming programming contests in one place</p>
      </header>

      <ContestList />
    </div>
  );
}

export default App;
