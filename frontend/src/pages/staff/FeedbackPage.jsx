import StaffLayout from '../../components/StaffLayout'
import FeedbackList from '../../components/FeedbackList'

export default function StaffFeedbackPage() {
  return (
    <StaffLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-3">
            <span className="gradient-text">Customer Feedback</span>
          </h1>
          <p className="text-gray-400 text-lg">View customer reviews and ratings from all completed rentals</p>
        </div>

        {/* Feedback List Component */}
        <FeedbackList />
      </div>
    </StaffLayout>
  )
}
