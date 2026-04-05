import AdminLayout from '../../components/AdminLayout'
import FeedbackList from '../../components/FeedbackList'

export default function AdminFeedbackPage() {
  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-3">
            <span className="gradient-text">Customer Feedback</span>
          </h1>
          <p className="text-gray-400 text-lg">Monitor customer satisfaction and reviews across all rentals</p>
        </div>

        {/* Feedback List Component */}
        <FeedbackList />
      </div>
    </AdminLayout>
  )
}
