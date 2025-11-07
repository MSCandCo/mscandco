import { TableSkeleton } from '@/components/shared/SkeletonLoader'

export default function Loading() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="animate-pulse h-8 bg-gray-200 rounded w-1/3"></div>
      </div>
      <TableSkeleton rows={10} />
    </div>
  )
}