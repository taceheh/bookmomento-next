export const Footer = () => {
  return (
    <footer className="w-full border-t bg-white text-xs text-gray-400 py-6">
      <div className="max-w-screen-sm mx-auto px-4 text-center space-y-2">
        <p>© 2025 책담 冊談</p>
        <p>
          Built with{' '}
          <span className="font-semibold text-gray-500">Next.js</span> &
          Tailwind CSS
        </p>
        <p>
          <a
            href="https://github.com/your-github-id/bookmomento"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-600"
          >
            GitHub Repository
          </a>
        </p>
      </div>
    </footer>
  );
};
