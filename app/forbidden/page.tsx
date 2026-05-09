export default function ForbiddenPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-3xl font-bold text-red-600 mb-4">Access Denied 🚫</h1>
      <p className="text-gray-600 mb-6">
        You tried to access this page without a valid product link.
      </p>
      <a
        href="/"
        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
      >
        Go Home
      </a>
    </div>
  );
}