import React from 'react';

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-tr from-blue-500 via-orange-500 to-white flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-[0px_20px_179px_14px_rgba(54,_69,_198,_0.59)] max-w-md w-full">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Test Styling
        </h1>
        <p className="text-gray-600 mb-4">
          If you can see this text with proper styling (colors, gradients, shadows), then Tailwind CSS is working correctly.
        </p>
        <div className="flex justify-center mt-6">
          <button className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors">
            Styled Button
          </button>
        </div>
      </div>
    </div>
  );
}