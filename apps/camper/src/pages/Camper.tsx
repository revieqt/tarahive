import { Link } from "react-router";

export default function Camper() {
  return (
    <main className="page">
      <span className="eyebrow">YOUR LITTLE GETAWAY</span>
      <h1>My Camper 🚐</h1>
      <p>Welcome home! Explore your cozy camper and make it your own.</p>

      <section className="game-placeholder">
        <div className="camper-emoji">🚐</div>
        <h2>Your adventure starts here</h2>
        <p>Your 3D camper environment will appear here.</p>
        <Link className="primary-button" to="/avatar">
          Customize my avatar
        </Link>
      </section>
    </main>
  );
}