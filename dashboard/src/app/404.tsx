"use client";

import { Suspense } from "react";
import Link from "next/link";

export default function NotFoundPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          404 - Page Not Found
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          href="/"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Return to Dashboard
        </Link>
      </div>
    </Suspense>
  );
}
