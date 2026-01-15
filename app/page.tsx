export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Find Your Perfect Job
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              In One Place
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto">
            Stop wasting time checking multiple job boards. We aggregate thousands of opportunities from JustJoin.it, NoFluffJobs, Pracuj.pl and more.
          </p>

          {/* Search Bar */}
          <div className="max-w-3xl mx-auto mb-12">
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Job title, keywords, or company"
                className="flex-1 px-6 py-4 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Location"
                className="w-48 px-6 py-4 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">
                Search
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">50,000+</div>
              <div className="text-gray-600 dark:text-gray-400">Active Jobs</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">5+</div>
              <div className="text-gray-600 dark:text-gray-400">Job Boards</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">24/7</div>
              <div className="text-gray-600 dark:text-gray-400">Updated</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center mb-16 text-gray-900 dark:text-white">
          Why JobStack?
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">All Jobs in One Place</h3>
            <p className="text-gray-600 dark:text-gray-400">
              No more switching between multiple job boards. Find everything from JustJoin.it, NoFluffJobs, Pracuj.pl and more.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Real-time Updates</h3>
            <p className="text-gray-600 dark:text-gray-400">
              New jobs are added every hour. Get instant access to the latest opportunities before anyone else.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Smart Filtering</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Filter by technology, location, salary, remote work and more. Find exactly what you're looking for.
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="container mx-auto px-4 py-20">
        <div className="bg-blue-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">Ready to find your dream job?</h2>
          <p className="text-xl mb-8 opacity-90">Join thousands of job seekers using JobStack</p>
          <div className="flex gap-4 justify-center">
            <button className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors">
              Get Started Free
            </button>
            <button className="px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
              For Employers
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-600 dark:text-gray-400">
            <p>© 2026 JobStack. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
