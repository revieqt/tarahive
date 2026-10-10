const items = [
  { id: 1, name: "Cozy Plant", emoji: "🪴", price: 100 },
  { id: 2, name: "Warm Lamp", emoji: "🪔", price: 150 },
  { id: 3, name: "Soft Pillow", emoji: "🛏️", price: 200 },
  { id: 4, name: "Travel Backpack", emoji: "🎒", price: 250 },
];

export default function Shop() {
  return (
    <main className="page">
      <span className="eyebrow">MAKE IT YOURS</span>
      <h1>Honey Shop 🍯</h1>
      <p>Find something lovely for your camper or your avatar.</p>

      <div className="honey-balance">🍯 Honey Points: 0</div>

      <section className="item-grid">
        {items.map((item) => (
          <article className="item-card" key={item.id}>
            <div className="item-emoji">{item.emoji}</div>
            <h3>{item.name}</h3>
            <p>🍯 {item.price} Honey Points</p>
            <button
              className="primary-button"
              onClick={() => alert("Purchases will be available soon!")}
            >
              View item
            </button>
          </article>
        ))}
      </section>
    </main>
  );
}