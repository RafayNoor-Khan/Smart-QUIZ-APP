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

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || `API Error: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`API call error for ${endpoint}:`, error);
    throw error;
  }
}

// ===== AUTH =====
export async function registerUser(email, name, password, role) {
  try {
    const result = await apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, name, password, role }),
    });

    if (result.error) {
      return { success: false, message: result.error };
    }

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

    if (!result.access_token || !result.user) {
      return { success: false, message: 'Invalid login response' };
    }

    // Store token in cookie
    const cookieStore = await cookies();
    cookieStore.set('token', result.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    });

    // Remove password from user object before returning
    const { password: _, ...safeUser } = result.user;

    return { success: true, user: safeUser };
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
    return { success: true, data: result.data || result || [] };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export async function getQuizById(id) {
  try {
    const result = await apiCall(`/quizzes/${id}`);
    return { success: true, data: result.data || result };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export async function generateQuiz(topic, numberOfQuestions = 10) {
  try {
    console.log('Server action - generateQuiz called with:', { topic, numberOfQuestions });

    const result = await apiCall('/quizzes/generate', {
      method: 'POST',
      body: JSON.stringify({
        topic: topic.trim(),
        numberOfQuestions: parseInt(numberOfQuestions) || 10,
      }),
    });

    console.log('Server action - generateQuiz result:', result);

    if (!result.success) {
      return {
        success: false,
        message: result.message || 'Failed to generate quiz',
      };
    }

    return {
      success: true,
      data: result.data || result,
    };
  } catch (error) {
    console.error('Error generating quiz:', error);
    return {
      success: false,
      message: error.message || 'Failed to generate quiz',
    };
  }
}

export async function saveQuiz(data) {
  try {
    console.log('Server action - saveQuiz called with:', data);

    if (!data || !data.topic || !Array.isArray(data.questions)) {
      return {
        success: false,
        message: 'Invalid quiz data structure',
      };
    }

    const result = await apiCall('/quizzes/save', {
      method: 'POST',
      body: JSON.stringify({
        topic: data.topic,
        type: data.type || 'mcq',
        questions: data.questions,
      }),
    });

    console.log('Server action - saveQuiz result:', result);

    return { success: true, data: result.data || result };
  } catch (error) {
    console.error('Error saving quiz:', error);
    return { success: false, message: error.message };
  }
}

export async function submitQuiz(quizId, userId, answers, assignmentId) {
  try {
    const result = await apiCall(`/quizzes/${quizId}/submit`, {
      method: 'POST',
      body: JSON.stringify({
        userId,
        answers,
        assignmentId,
        submittedAt: new Date().toISOString(),
      }),
    });

    if (!result.success) {
      return { success: false, message: result.message || 'Submission failed' };
    }

    return {
      success: true,
      data: {
        attemptId: result.data?.id || result.data?.attemptId,
        score: result.data?.score,
        percentage: result.data?.percentage,
      },
    };
  } catch (error) {
    console.error('Submit quiz error:', error);
    return { success: false, message: error.message };
  }
}

export async function getQuizAnalytics(quizId) {
  try {
    const result = await apiCall(`/quizzes/${quizId}/analytics`);
    return { success: true, data: result.data || result };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

// ===== ASSIGNMENTS =====
export async function getUserAssignments(userId) {
  try {
    const result = await apiCall(`/assignments/user/${userId}`);
    return { success: true, data: result.data || result || [] };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export async function getPendingAssignments(userId) {
  try {
    const result = await apiCall(`/assignments/user/${userId}/pending`);
    return { success: true, data: result.data || result || [] };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export async function getCompletedAssignments(userId) {
  try {
    const result = await apiCall(`/assignments/user/${userId}/completed`);
    return { success: true, data: result.data || result || [] };
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
    return { success: true, data: result.data || result };
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
    return { success: true, data: result.data || result };
  } catch (error) {
    return { success: false, message: error.message };
  }

}
// Add this to lib/actions.js

export async function deleteQuiz(quizId) {
  try {
    const result = await apiCall(`/quizzes/${quizId}`, {
      method: 'DELETE',
    });
    return { success: true, data: result };
  } catch (error) {
    return { success: false, message: error.message };
  }
}