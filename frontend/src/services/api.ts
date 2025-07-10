// API service for all backend interactions
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000');
// WebSocket URL for streaming APIs
const WS_BASE_URL = import.meta.env.VITE_API_WS_URL || 'ws://localhost:8000';

// Authentication interfaces
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    email: string;
    created_at?: string;
  };
}

export interface SessionResponse {
  session_id: string;
  message: string;
}

export interface InterviewStartRequest {
  job_role: string;
  job_description?: string;
  resume_content?: string;
  style?: 'formal' | 'casual' | 'aggressive' | 'technical';
  difficulty?: 'easy' | 'medium' | 'hard';
  company_name?: string;
  interview_duration_minutes?: number;
  use_time_based_interview?: boolean;
}

// Speech recognition types
export interface SpeechTranscriptionEvent {
  type: 'transcript' | 'error' | 'connected' | 'speech_started' | 'utterance_end';
  text?: string;
  is_final?: boolean;
  error?: string;
  message?: string;
  timestamp?: string;
  event_time?: string;
  last_spoken_at?: number;
}

export interface StreamingSpeechOptions {
  sessionId?: string;  // Add session ID for linking speech tasks
  onTranscript: (transcript: string, isFinal: boolean) => void;
  onError: (error: string) => void;
  onConnected: () => void;
  onDisconnected: () => void;
  onSpeechStarted?: (timestamp: number) => void;
  onUtteranceEnd?: (lastSpokenAt: number) => void;
}

export class StreamingSpeechRecognition {
  private ws: WebSocket | null = null;
  private isConnected: boolean = false;
  private mediaStream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private options: StreamingSpeechOptions;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;

  constructor(options: StreamingSpeechOptions) {
    this.options = options;
  }

  async start(): Promise<void> {
    try {
      // Get microphone access
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Connect WebSocket
      await this.connectWebSocket();
      
      // Start recording
      this.startRecording();
      
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  }

  stop(): void {
    // Stop recording
    if (this.mediaRecorder) {
      this.mediaRecorder.stop();
      this.mediaRecorder = null;
    }
    
    // Stop microphone
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    
    // Close WebSocket
    this.closeWebSocket();
  }

  private async connectWebSocket(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Build WebSocket URL with optional session ID
      let wsUrl = `${WS_BASE_URL}/api/speech-to-text/stream`;
      if (this.options.sessionId) {
        wsUrl += `?session_id=${encodeURIComponent(this.options.sessionId)}`;
      }
      
      // Create WebSocket connection
      this.ws = new WebSocket(wsUrl);
      
      // Set binary type to arraybuffer
      this.ws.binaryType = 'arraybuffer';
      
      // Set up event handlers
      this.ws.onopen = () => {
        this.isConnected = true;
        this.reconnectAttempts = 0;
        resolve();
      };
      
      this.ws.onclose = (event) => {
        this.isConnected = false;
        this.options.onDisconnected();
        console.log('WebSocket closed:', event);
      };
      
      this.ws.onerror = (event) => {
        console.error('WebSocket error:', event);
        reject(new Error('WebSocket connection failed'));
      };
      
      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as SpeechTranscriptionEvent;
          
          switch (data.type) {
            case 'transcript':
              if (data.text !== undefined) {
                this.options.onTranscript(data.text, data.is_final || false);
              }
              break;
            case 'speech_started':
              if (data.timestamp !== undefined && this.options.onSpeechStarted) {
                this.options.onSpeechStarted(Number(data.timestamp));
              }
              break;
            case 'utterance_end':
              if (data.last_spoken_at !== undefined && this.options.onUtteranceEnd) {
                this.options.onUtteranceEnd(Number(data.last_spoken_at));
              }
              break;
            case 'error':
              if (data.error) {
                this.options.onError(data.error);
              }
              break;
            case 'connected':
              this.options.onConnected();
              break;
          }
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
        }
      };
    });
  }

  private closeWebSocket(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.isConnected = false;
    }
  }

  private startRecording(): void {
    if (!this.mediaStream || !this.isConnected) return;
    
    // Create recorder with appropriate options
    // Using 16kHz mono audio for optimal STT performance
    const audioOptions = { mimeType: 'audio/webm' };
    
    try {
      this.mediaRecorder = new MediaRecorder(this.mediaStream, audioOptions);
      
      // Send data whenever it becomes available
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && this.ws && this.isConnected) {
          // Convert Blob to ArrayBuffer and send over WebSocket
          const reader = new FileReader();
          reader.onload = () => {
            if (this.ws && this.isConnected && reader.result) {
              this.ws.send(reader.result);
            }
          };
          reader.readAsArrayBuffer(event.data);
        }
      };
      
      // Start recording with small timeslices for low latency
      this.mediaRecorder.start(100);  // 100ms chunks
    } catch (error) {
      console.error('Error starting MediaRecorder:', error);
      this.options.onError(`Failed to start recording: ${error}`);
    }
  }
}

export interface UserInput {
  message: string;
}

// This interface should match the structure returned by the /interview/message endpoint,
// which is based on the dictionary constructed in AgentSessionManager.process_message
export interface AgentResponse {
  role: 'user' | 'assistant' | 'system'; // Role can be user, assistant, or system
  agent?: 'interviewer' | 'coach';      // Optional: specifies the agent type for assistant messages
  content: any;                         // Can be string (interviewer) or object (coach feedback)
  response_type?: string;               // e.g., 'question', 'coaching_feedback', 'introduction', 'closing'
  metadata?: Record<string, any>;       // Any additional metadata
  timestamp?: string;                   // ISO string timestamp
  processing_time?: number;             // Optional processing time
  is_error?: boolean;                   // If it's a system error message
}

export interface PerTurnFeedbackItem {
  question: string;
  answer: string;
  feedback: string;
}

export interface EndResponse {
  results: any;  // This contains the coaching summary directly
  per_turn_feedback?: PerTurnFeedbackItem[];
}

export interface FinalSummaryStatusResponse {
  status: 'generating' | 'completed' | 'error';
  results?: any;
  error?: string;
}

export interface ResumeUploadServerResponse {
  filename: string;
  resume_text: string;
  message: string;
}

export interface HistoryResponse {
  history: any[];
}

export interface StatsResponse {
  stats: any;
}

export interface ResetResponse {
  message: string;
}

export interface SessionTimeRemainingResponse {
  time_remaining_minutes: number;
  session_active: boolean;
}

export interface SessionPingResponse {
  success: boolean;
  message: string;
  new_expiry_minutes: number;
}

export interface SessionCleanupResponse {
  success: boolean;
  message: string;
}

// Helper for handling response errors
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.detail || 'An error occurred';
    
    // Check for session timeout/not found errors
    if (response.status === 404 && errorMessage.toLowerCase().includes('session')) {
      // Session not found - likely timed out
      throw new Error('SESSION_TIMEOUT: Your session has expired due to inactivity. Please start a new interview from the home page.');
    }
    
    throw new Error(errorMessage);
  }
  
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  
  return response;
};

// Authentication-related API calls
export async function registerUser(data: RegisterRequest): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  return handleResponse(response);
}

export async function loginUser(data: LoginRequest): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  return handleResponse(response);
}

export async function logoutUser(): Promise<{ message: string }> {
  const token = localStorage.getItem('ai_interviewer_access_token');
  
  const response = await fetch(`${API_BASE_URL}/auth/logout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  return handleResponse(response);
}

export async function getUserProfile(): Promise<any> {
  const token = localStorage.getItem('ai_interviewer_access_token');
  
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  return handleResponse(response);
}

// Utility function to add auth headers to API requests
function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('ai_interviewer_access_token');
  
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
}

// Modified existing API functions to include authentication

export async function createSession(data: InterviewStartRequest): Promise<SessionResponse> {
  const response = await fetch(`${API_BASE_URL}/interview/session`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  return handleResponse(response);
}

export async function startInterview(sessionId: string, data: InterviewStartRequest): Promise<AgentResponse> {
  const response = await fetch(`${API_BASE_URL}/interview/start`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'X-Session-ID': sessionId,
    },
    body: JSON.stringify(data),
  });

  return handleResponse(response);
}

export async function sendMessage(sessionId: string, data: UserInput): Promise<AgentResponse> {
  const response = await fetch(`${API_BASE_URL}/interview/message`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'X-Session-ID': sessionId,
    },
    body: JSON.stringify(data),
  });

  return handleResponse(response);
}

export async function endInterview(sessionId: string): Promise<EndResponse> {
  const response = await fetch(`${API_BASE_URL}/interview/end`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'X-Session-ID': sessionId,
    },
  });

  return handleResponse(response);
}

export async function getConversationHistory(sessionId: string): Promise<HistoryResponse> {
  const response = await fetch(`${API_BASE_URL}/interview/history`, {
    method: 'GET',
    headers: {
      ...getAuthHeaders(),
      'X-Session-ID': sessionId,
    },
  });

  return handleResponse(response);
}

export async function getSessionStats(sessionId: string): Promise<StatsResponse> {
  const response = await fetch(`${API_BASE_URL}/interview/stats`, {
    method: 'GET',
    headers: {
      ...getAuthHeaders(),
      'X-Session-ID': sessionId,
    },
  });

  return handleResponse(response);
}

export async function getPerTurnFeedback(sessionId: string): Promise<PerTurnFeedbackItem[]> {
  const response = await fetch(`${API_BASE_URL}/interview/per-turn-feedback`, {
    method: 'GET',
    headers: {
      ...getAuthHeaders(),
      'X-Session-ID': sessionId,
    },
  });

  return handleResponse(response);
}

export async function getFinalSummaryStatus(sessionId: string): Promise<FinalSummaryStatusResponse> {
  const response = await fetch(`${API_BASE_URL}/interview/final-summary-status`, {
    method: 'GET',
    headers: {
      ...getAuthHeaders(),
      'X-Session-ID': sessionId,
    },
  });

  return handleResponse(response);
}

export async function resetInterview(sessionId: string): Promise<ResetResponse> {
  const response = await fetch(`${API_BASE_URL}/interview/reset`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'X-Session-ID': sessionId,
    },
  });

  return handleResponse(response);
}

export async function getSessionTimeRemaining(sessionId: string): Promise<SessionTimeRemainingResponse> {
  const response = await fetch(`${API_BASE_URL}/interview/session/time-remaining`, {
    method: 'GET',
    headers: {
      ...getAuthHeaders(),
      'X-Session-ID': sessionId,
    },
  });

  return handleResponse(response);
}

export async function pingSession(sessionId: string): Promise<SessionPingResponse> {
  const response = await fetch(`${API_BASE_URL}/interview/session/ping`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'X-Session-ID': sessionId,
    },
  });

  return handleResponse(response);
}

export async function cleanupSession(sessionId: string): Promise<SessionCleanupResponse> {
  const response = await fetch(`${API_BASE_URL}/interview/session/cleanup`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'X-Session-ID': sessionId,
    },
  });

  return handleResponse(response);
}

// API methods
export const api = {
  // Health check
  checkHealth: async () => {
    const response = await fetch(`${API_BASE_URL}/`);
    return handleResponse(response);
  },
  
  // File Processing API
  uploadResumeFile: async (file: File): Promise<ResumeUploadServerResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/files/upload-resume`, {
      method: 'POST',
      body: formData,
      // Note: Do not set Content-Type header when using FormData with fetch,
      // the browser will set it correctly including the boundary.
    });
    return handleResponse(response);
  },
  
  // Speech to Text API (batch processing with AssemblyAI)
  speechToText: async (audioBlob: Blob, language?: string): Promise<{ task_id: string, status: string }> => {
    const formData = new FormData();
    formData.append('audio_file', audioBlob);
    if (language) {
      formData.append('language', language);
    }
    
    const response = await fetch(`${API_BASE_URL}/api/speech-to-text`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse(response);
  },
  
  checkSpeechToTextStatus: async (taskId: string): Promise<{ status: string, transcript?: string, error?: string }> => {
    const response = await fetch(`${API_BASE_URL}/api/speech-to-text/status/${taskId}`);
    return handleResponse(response);
  },
  
  // Create streaming speech recognition instance
  createStreamingSpeechRecognition: (options: StreamingSpeechOptions): StreamingSpeechRecognition => {
    return new StreamingSpeechRecognition(options);
  },
  
  // Text to Speech API
  textToSpeech: async (text: string, speed?: number): Promise<Blob> => {
    const formData = new URLSearchParams();
    formData.append('text', text);
    // Note: voice_id is intentionally not sent - backend will use environment variables
    if (speed !== undefined) {
      formData.append('speed', speed.toString());
    }
    
    const response = await fetch(`${API_BASE_URL}/api/text-to-speech`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'An error occurred with TTS');
    }
    
    return response.blob();
  },
};
