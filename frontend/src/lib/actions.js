'use server';

import { cookies } from 'next/headers';

const API_BASE = 'http://localhost:3000';

// Helper function
async function apiCall(endpoint, options = {}) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();
  return data;
}

// ===== AUTH =====
export async function registerUser(email, name, password, role) {
  try {
    const result = await apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, name, password, role }),
    });
    return { success: true, user: result.user };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export async function loginUser(email, password) {
  try {
    const result = await apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    // Store token
    const cookieStore = await cookies();
    cookieStore.set('token', result.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    });

    return { success: true, user: result.user };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete('token');
  return { success: true };
}

// ===== QUIZ =====
export async function getAllQuizzes() {
  try {
    const result = await apiCall('/quizzes/all');
    return { success: true, data: result.data || [] };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export async function getQuizById(id) {
  try {
    const result = await apiCall(`/quizzes/${id}`);
    return { success: true, data: result.data };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export async function generateQuiz(topic) {
  try {
    const result = await apiCall('/quizzes/generate', {
      method: 'POST',
      body: JSON.stringify({ topic }),
    });
    return { success: true, data: result.data };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export async function saveQuiz(data) {
  try {
    const result = await apiCall('/quizzes/save', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return { success: true, data: result.data };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export async function submitQuiz(quizId, userId, answers) {
  try {
    const result = await apiCall(`/quizzes/${quizId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ userId, answers }),
    });
    return { success: true, data: result.data };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export async function getQuizAnalytics(quizId) {
  try {
    const result = await apiCall(`/quizzes/${quizId}/analytics`);
    return { success: true, data: result.data };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

// ===== ASSIGNMENTS =====
export async function getUserAssignments(userId) {
  try {
    const result = await apiCall(`/assignments/user/${userId}`);
    return { success: true, data: result.data || [] };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export async function getPendingAssignments(userId) {
  try {
    const result = await apiCall(`/assignments/user/${userId}/pending`);
    return { success: true, data: result.data || [] };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export async function getCompletedAssignments(userId) {
  try {
    const result = await apiCall(`/assignments/user/${userId}/completed`);
    return { success: true, data: result.data || [] };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export async function createAssignment(userId, quizId, deadline, weightage) {
  try {
    const result = await apiCall('/assignments/create', {
      method: 'POST',
      body: JSON.stringify({ userId, quizId, deadline, weightage }),
    });
    return { success: true, data: result.data };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export async function assignQuizToAll(quizId, deadline) {
  try {
    const result = await apiCall('/quizzes/assign-all', {
      method: 'POST',
      body: JSON.stringify({ quizId, deadline }),
    });
    return { success: true, data: result.data };
  } catch (error) {
    return { success: false, message: error.message };
  }
}