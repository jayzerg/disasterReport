import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-tr from-blue-500 via-orange-500 to-white flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-[0px_20px_179px_14px_rgba(54,_69,_198,_0.59)] p-8 max-w-2xl w-full">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 text-gray-800">
            Disaster Response Platform
          </h1>
          <p className="text-gray-600">
            Help emergency responders by reporting disaster impacts in your area or view reports on the map.
          </p>
        </header>
        <main>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link 
              href="/report" 
              className="flex-1 px-6 py-4 bg-blue-600 text-white font-medium rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-center transition-all hover:scale-105"
            >
              Submit Report
            </Link>
            <Link 
              href="/map" 
              className="flex-1 px-6 py-4 bg-green-600 text-white font-medium rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-center transition-all hover:scale-105"
            >
              View Map
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}