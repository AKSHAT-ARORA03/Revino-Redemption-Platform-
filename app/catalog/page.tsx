import { Suspense } from "react"
import CatalogClient from "./CatalogClient"

export default function CatalogPage() {
  return (
    <Suspense fallback={<CatalogLoading />}>
      <CatalogClient />
    </Suspense>
  )
}

function CatalogLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Reward Catalog</h1>
        <p className="text-gray-600">Loading rewards and vouchers...</p>
      </div>
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    </div>
  )
}