import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'

type StudentsResponse = {
  data: {
    data: Array<{ id: number; full_name: string; phone: string; status: string }>
  }
}

export function StudentsPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const response = await api.get<StudentsResponse>('/students')
      return response.data.data.data
    },
  })

  return (
    <div className="panel page">
      <h2>Students</h2>
      {isLoading ? <p>Loading students...</p> : null}
      {isError ? <p className="error">Could not load students.</p> : null}
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Phone</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {data?.map((student) => (
            <tr key={student.id}>
              <td>{student.full_name}</td>
              <td>{student.phone}</td>
              <td>{student.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
