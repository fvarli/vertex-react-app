import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="centered-screen">
      <div className="panel">
        <h2>Not Found</h2>
        <Link to="/dashboard">Go to dashboard</Link>
      </div>
    </div>
  )
}
