import { useAuth } from "../context/AuthContext";

const HomePage = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <h1 className="text-3xl font-bold text-indigo-600 mb-2">
        FluentFeed Speaking Evaluation
      </h1>
      <p className="text-gray-600 mb-6">Welcome, {user?.name} 👋</p>
      <button
        onClick={logout}
        className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
      >
        Log Out
      </button>
    </div>
  );
};

export default HomePage;