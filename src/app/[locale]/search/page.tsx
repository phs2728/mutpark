import { Suspense } from "react";
import SearchResults from "@/components/search/SearchResults";

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <Suspense fallback={<SearchResultsSkeleton />}>
          <SearchResults />
        </Suspense>
      </div>
    </div>
  );
}

function SearchResultsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Search bar skeleton */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
      </div>

      {/* Filters skeleton */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex space-x-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 w-20 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>

      {/* Results skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm p-4">
            <div className="h-48 bg-gray-200 rounded-lg mb-4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-2 animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse"></div>
          </div>
        ))}
      </div>
    </div>
  );
}