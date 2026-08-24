import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

const WaveMark = () => (
  <div className="flex items-end gap-[3px] h-5">
    <span className="w-[3px] h-2 bg-primary rounded-full"></span>
    <span className="w-[3px] h-5 bg-primary rounded-full"></span>
    <span className="w-[3px] h-3 bg-accent rounded-full"></span>
    <span className="w-[3px] h-4 bg-primary rounded-full"></span>
  </div>
);

const HomePage = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <header className="flex items-center justify-between px-6 md:px-12 py-6">
        <div className="flex items-center gap-2.5">
          <WaveMark />
          <span className="font-display font-bold text-lg tracking-tight text-ink">
            FluentFeed
          </span>
        </div>
        <button
          onClick={logout}
          className="text-sm text-ink-soft hover:text-ink transition"
        >
          Log out
        </button>
      </header>

      <main className="flex-1 flex items-center px-6 md:px-12">
        <div className="max-w-xl">
          <p className="text-sm font-medium text-primary mb-3">
            Welcome back, {user?.name}
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-ink leading-[1.1] mb-4">
            Find your voice
            <br />
            in English.
          </h1>
          <p className="text-ink-soft text-lg mb-8 max-w-md">
            Speak on a topic for a couple of minutes and get instant feedback
            on your grammar, vocabulary, and clarity.
          </p>

          <div className="flex items-center gap-6 flex-wrap">
            <Link
              to="/speaking"
              className="inline-flex items-center gap-2.5 bg-primary text-white px-6 py-3.5 rounded-xl font-medium hover:bg-primary-dark transition shadow-[0_10px_24px_-10px_rgba(91,79,233,0.55)]"
            >
              <WaveMark />
              Start speaking practice
            </Link>
            <Link
              to="/history"
              className="text-ink font-medium hover:text-primary transition inline-flex items-center gap-1"
            >
              View my progress
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;