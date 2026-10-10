import { useState } from "react";

const avatars = ["🧑🏻", "👩🏻", "🧑🏽", "👩🏽", "🧑🏿", "👩🏿"];
const outfits = ["👕", "🧥", "👗", "🥼"];

export default function Avatar() {
  const [selectedAvatar, setSelectedAvatar] = useState(avatars[0]);
  const [selectedOutfit, setSelectedOutfit] = useState(outfits[0]);

  return (
    <main className="page">
      <span className="eyebrow">YOUR TRAVEL COMPANION</span>
      <h1>Avatar Studio ✨</h1>
      <p>Create a character to accompany you on your adventures.</p>

      <section className="avatar-editor">
        <div className="avatar-preview">
          <span className="avatar-character">{selectedAvatar}</span>
          <span className="avatar-outfit">{selectedOutfit}</span>
          <p>Your character</p>
        </div>

        <div className="editor-controls">
          <h3>Choose your character</h3>
          <div className="choice-list">
            {avatars.map((avatar) => (
              <button
                key={avatar}
                className={`choice-button ${
                  selectedAvatar === avatar ? "selected" : ""
                }`}
                onClick={() => setSelectedAvatar(avatar)}
                aria-label={`Choose ${avatar}`}
              >
                {avatar}
              </button>
            ))}
          </div>

          <h3>Choose an outfit</h3>
          <div className="choice-list">
            {outfits.map((outfit) => (
              <button
                key={outfit}
                className={`choice-button ${
                  selectedOutfit === outfit ? "selected" : ""
                }`}
                onClick={() => setSelectedOutfit(outfit)}
                aria-label={`Choose outfit ${outfit}`}
              >
                {outfit}
              </button>
            ))}
          </div>

          <p className="helper-text">
            This is a preview prototype. Avatar customization will be saved
            when persistence is implemented.
          </p>
        </div>
      </section>
    </main>
  );
}