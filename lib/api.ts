export interface User {
  id: string
  email: string
  fio: string
  phone?: string
  city?: string
  organization?: string
  birthDate?: string
  role: 'participant' | 'organizer' | 'admin'
  status: 'pending' | 'confirmed' | 'rejected'
  createdAt?: string
  updatedAt?: string
}

export interface Team {
  id: string
  name: string
  category: string
  status: 'pending' | 'confirmed'
  stage?: 'qualifier' | 'final'
  resultsPublished?: boolean
  members: TeamMember[]
}

export interface TeamMember {
  id: string
  userId: string
  teamId: string
  status: 'pending' | 'confirmed'
  user: User
}

export interface Document {
  id: string
  userId: string
  name: string
  fileName: string
  fileSize: number
  status: 'pending' | 'confirmed' | 'rejected'
  createdAt: string
}

export interface Upload {
  id: string
  userId: string
  dishNumber: number
  fileType: 'photo' | 'techCard' | 'menu'
  fileName: string
  fileSize: number
  status: 'pending' | 'confirmed'
  createdAt: string
}

export interface UploadWithUser extends Upload {
  user: { id: string; fio: string; email: string }
}

export interface ViolationPhoto {
  id: string
  resultId: string
  criterionKey: string
  fileName: string
  fileSize: number
  createdAt: string
}

export interface Result {
  id: string
  teamId: string
  judgeId: string
  dishNumber: number
  stage?: 'qualifier' | 'final'
  taste: number
  presentation: number
  workSkills: number
  hygiene: number
  miseEnPlace: number
  penalties: number
  total: number
  violationPhotos?: ViolationPhoto[]
}

function getToken(): string {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token') || ''
  }
  return ''
}

function setToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token)
  }
}

function removeToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token')
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = 'Internal server error'
    try {
      const data = await response.json()
      errorMessage = data.error || errorMessage
    } catch {
      errorMessage = `HTTP ${response.status}: ${response.statusText}`
    }
    throw new Error(errorMessage)
  }
  
  try {
    const data = await response.json()
    return data
  } catch (error) {
    throw new Error('Invalid response format')
  }
}

export const api = {
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await handleResponse<{ token: string; user: User }>(response)
    setToken(data.token)
    return data
  },

  async register(data: {
    email: string
    password: string
    fio: string
    phone?: string
    city?: string
    organization?: string
    birthDate?: string
  }): Promise<{ token: string; user: User }> {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const result = await handleResponse<{ token: string; user: User }>(response)
    setToken(result.token)
    return result
  },

  logout(): void {
    removeToken()
  },

  async getProfile(): Promise<User> {
    const response = await fetch('/api/profile', {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
    return handleResponse<User>(response)
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await fetch('/api/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(data),
    })
    return handleResponse<User>(response)
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const response = await fetch('/api/profile/password', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    })
    await handleResponse<void>(response)
  },

  async getTeam(): Promise<Team> {
    const response = await fetch('/api/team', {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
    return handleResponse<Team>(response)
  },

  async getDocuments(): Promise<Document[]> {
    const response = await fetch('/api/documents', {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
    return handleResponse<Document[]>(response)
  },

  async uploadDocument(file: File): Promise<Document> {
    const formData = new FormData()
    formData.append('file', file)
    const response = await fetch('/api/documents', {
      method: 'POST',
      headers: { Authorization: `Bearer ${getToken()}` },
      body: formData,
    })
    return handleResponse<Document>(response)
  },

  async updateDocumentStatus(id: string, status: 'pending' | 'confirmed' | 'rejected'): Promise<Document> {
    const response = await fetch(`/api/documents/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ status }),
    })
    return handleResponse<Document>(response)
  },

  async deleteDocument(id: string): Promise<void> {
    const response = await fetch(`/api/documents/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${getToken()}` },
    })
    await handleResponse<void>(response)
  },

  async getUploads(): Promise<Upload[]> {
    const response = await fetch('/api/uploads', {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
    return handleResponse<Upload[]>(response)
  },

  async uploadFile(
    dishNumber: number,
    fileType: 'photo' | 'techCard' | 'menu',
    file: File
  ): Promise<Upload> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('dishNumber', dishNumber.toString())
    formData.append('fileType', fileType)
    const response = await fetch('/api/uploads', {
      method: 'POST',
      headers: { Authorization: `Bearer ${getToken()}` },
      body: formData,
    })
    return handleResponse<Upload>(response)
  },

  async getOrganizerUploads(userId?: string): Promise<UploadWithUser[]> {
    const url = userId ? `/api/organizer/uploads?userId=${userId}` : '/api/organizer/uploads'
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
    return handleResponse<UploadWithUser[]>(response)
  },

  async getResults(): Promise<Result[]> {
    const response = await fetch('/api/results', {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
    return handleResponse<Result[]>(response)
  },

  async getOrganizerParticipants(): Promise<User[]> {
    const response = await fetch('/api/organizer/participants', {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
    return handleResponse<User[]>(response)
  },

  async updateParticipantStatus(userId: string, status: string): Promise<User> {
    const response = await fetch('/api/organizer/participants', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ userId, status }),
    })
    return handleResponse<User>(response)
  },

  async getOrganizerTeams(): Promise<any[]> {
    const response = await fetch('/api/organizer/teams', {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
    return handleResponse<any[]>(response)
  },

  async createTeam(data: {
    name: string
    category: string
    userIds?: string[]
  }): Promise<Team> {
    const response = await fetch('/api/organizer/teams', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(data),
    })
    return handleResponse<Team>(response)
  },

  async getOrganizerTeam(teamId: string): Promise<any> {
    const response = await fetch(`/api/organizer/teams/${teamId}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
    return handleResponse<any>(response)
  },

  async publishTeamResults(teamId: string, published: boolean): Promise<any> {
    const response = await fetch(`/api/organizer/teams/${teamId}/publish`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ resultsPublished: published }),
    })
    return handleResponse<any>(response)
  },

  async updateTeamStage(teamId: string, stage: 'qualifier' | 'final'): Promise<any> {
    const response = await fetch(`/api/organizer/teams/${teamId}/stage`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ stage }),
    })
    return handleResponse<any>(response)
  },

  async updateTeamStatus(teamId: string, status: string): Promise<any> {
    const response = await fetch('/api/organizer/teams', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ teamId, status }),
    })
    return handleResponse<any>(response)
  },

  async getOrganizerResults(): Promise<any[]> {
    const response = await fetch('/api/organizer/results', {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
    return handleResponse<any[]>(response)
  },

  async getOrganizerJudges(): Promise<User[]> {
    const response = await fetch('/api/organizer/judges', {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
    return handleResponse<User[]>(response)
  },

  async getJudgeResults(teamId: string, judgeId: string): Promise<Result[]> {
    const response = await fetch(`/api/organizer/teams/${teamId}/judges/${judgeId}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
    return handleResponse<Result[]>(response)
  },

  async getJudgeResultsByStage(
    teamId: string,
    judgeId: string,
    stage: 'qualifier' | 'final'
  ): Promise<Result[]> {
    const response = await fetch(
      `/api/organizer/teams/${teamId}/judges/${judgeId}?stage=${stage}`,
      { headers: { Authorization: `Bearer ${getToken()}` } }
    )
    return handleResponse<Result[]>(response)
  },

  async saveJudgeResult(
    teamId: string,
    judgeId: string,
    data: {
      dishNumber: number
      stage?: 'qualifier' | 'final'
      taste: number
      presentation: number
      workSkills: number
      hygiene: number
      miseEnPlace: number
      penalties?: number
    }
  ): Promise<Result> {
    const response = await fetch(`/api/organizer/teams/${teamId}/judges/${judgeId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(data),
    })
    return handleResponse<Result>(response)
  },

  async getAllUsers(): Promise<User[]> {
    const response = await fetch('/api/admin/users', {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
    return handleResponse<User[]>(response)
  },

  async createUser(data: {
    email: string
    password: string
    fio: string
    phone?: string
    city?: string
    organization?: string
    role: 'participant' | 'organizer' | 'admin'
    status?: 'pending' | 'confirmed'
  }): Promise<User> {
    const response = await fetch('/api/admin/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(data),
    })
    return handleResponse<User>(response)
  },

  async updateUser(
    userId: string,
    data: {
      email?: string
      fio?: string
      phone?: string
      city?: string
      organization?: string
      role?: 'participant' | 'organizer' | 'admin'
      status?: 'pending' | 'confirmed'
      password?: string
    }
  ): Promise<User> {
    const response = await fetch(`/api/admin/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(data),
    })
    return handleResponse<User>(response)
  },

  async deleteUser(userId: string): Promise<void> {
    const response = await fetch(`/api/admin/users/${userId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${getToken()}` },
    })
    await handleResponse<void>(response)
  },

  async addTeamMember(teamId: string, userId: string): Promise<TeamMember> {
    const response = await fetch(`/api/organizer/teams/${teamId}/members`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ userId }),
    })
    return handleResponse<TeamMember>(response)
  },

  async removeTeamMember(teamId: string, memberId: string): Promise<void> {
    const response = await fetch(`/api/organizer/teams/${teamId}/members?memberId=${memberId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${getToken()}` },
    })
    await handleResponse<void>(response)
  },

  async getParticipantDocuments(userId?: string): Promise<(Document & { user: { id: string; fio: string; email: string } })[]> {
    const url = userId 
      ? `/api/organizer/documents?userId=${userId}`
      : '/api/organizer/documents'
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
    return handleResponse<(Document & { user: { id: string; fio: string; email: string } })[]>(response)
  },

  async uploadViolationPhoto(resultId: string, criterionKey: string, file: File): Promise<ViolationPhoto> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('resultId', resultId)
    formData.append('criterionKey', criterionKey)

    const response = await fetch('/api/organizer/violation-photos', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
      body: formData,
    })
    return handleResponse<ViolationPhoto>(response)
  },

  async deleteViolationPhoto(photoId: string): Promise<void> {
    const response = await fetch(`/api/organizer/violation-photos?id=${photoId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${getToken()}` },
    })
    await handleResponse<void>(response)
  },

  async fixResultSheet(teamId: string, judgeId: string, stage?: 'qualifier' | 'final'): Promise<void> {
    const url = stage
      ? `/api/organizer/teams/${teamId}/judges/${judgeId}/fix?stage=${stage}`
      : `/api/organizer/teams/${teamId}/judges/${judgeId}/fix`
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
    })
    await handleResponse<void>(response)
  },

  async unfixResultSheet(teamId: string, judgeId: string, stage?: 'qualifier' | 'final'): Promise<void> {
    const url = stage
      ? `/api/organizer/teams/${teamId}/judges/${judgeId}/unfix?stage=${stage}`
      : `/api/organizer/teams/${teamId}/judges/${judgeId}/unfix`
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
    })
    await handleResponse<void>(response)
  },
}

export { getToken, setToken, removeToken }
