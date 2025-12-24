/**
 * Page Visit Tracker
 *
 * Tracks user page visits in localStorage for personalized Quick Actions
 * on the dashboard
 */

export function trackPageVisit(userId, pathname) {
  if (!userId || !pathname || pathname === '/dashboard') {
    return // Don't track dashboard itself
  }

  try {
    // Get existing visits
    const visits = JSON.parse(localStorage.getItem('pageVisits') || '{}')

    // Initialize user's visits if needed
    if (!visits[userId]) {
      visits[userId] = {}
    }

    // Increment visit count for this page
    visits[userId][pathname] = (visits[userId][pathname] || 0) + 1

    // Save back to localStorage
    localStorage.setItem('pageVisits', JSON.stringify(visits))
  } catch (error) {
    console.error('Error tracking page visit:', error)
  }
}

export function getPageVisits(userId) {
  try {
    const visits = JSON.parse(localStorage.getItem('pageVisits') || '{}')
    return visits[userId] || {}
  } catch (error) {
    console.error('Error getting page visits:', error)
    return {}
  }
}

export function clearPageVisits(userId) {
  try {
    const visits = JSON.parse(localStorage.getItem('pageVisits') || '{}')
    if (userId) {
      delete visits[userId]
    } else {
      // Clear all if no userId provided
      localStorage.removeItem('pageVisits')
      return
    }
    localStorage.setItem('pageVisits', JSON.stringify(visits))
  } catch (error) {
    console.error('Error clearing page visits:', error)
  }
}
