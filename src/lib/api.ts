export async function fetchOpportunities() {
  // Fetch from remote API or return cached data
  const response = await fetch('/api/opportunities')
  if (!response.ok) throw new Error('Failed to fetch opportunities')
  return response.json()
}

export async function fetchMentors() {
  const response = await fetch('/api/mentors')
  if (!response.ok) throw new Error('Failed to fetch mentors')
  return response.json()
}

export async function fetchPlan() {
  const response = await fetch('/api/plan')
  if (!response.ok) throw new Error('Failed to fetch plan')
  return response.json()
}

export async function submitSBAR(ticket: { situation: string; background: string; assessment: string; request: string }) {
  const response = await fetch('/api/sbar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ticket),
  })
  if (!response.ok) throw new Error('Failed to submit SBAR')
  return response.json()
}

export async function completeMilestone(milestoneId: string) {
  const response = await fetch('/api/milestones/' + milestoneId + '/complete', {
    method: 'POST',
  })
  if (!response.ok) throw new Error('Failed to complete milestone')
  return response.json()
}
