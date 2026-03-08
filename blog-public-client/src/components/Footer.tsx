export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-16">
      <div className="max-w-6xl mx-auto px-4 py-8 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Blog. All rights reserved.
      </div>
    </footer>
  );
}
