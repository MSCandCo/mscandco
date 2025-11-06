import { ListSkeleton } from '@/components/shared/SkeletonLoader'

export default function Loading() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="animate-pulse h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
      </div>
      <ListSkeleton items={8} />
    </div>
  )
}
