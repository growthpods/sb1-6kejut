import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { SendHorizonal, Loader2 } from 'lucide-react';
import type { Job } from '../types';
import { getJobPostingService } from '../lib/jobPostingService';

// Define message type
interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
}

// Define possible chat states
type ChatState =
  | 'idle' // Initial state, awaiting first input
  | 'processing_url' // Processing a job URL with Firecrawl
  | 'processing_text' // Processing job text with LLM
  | 'collecting_info' // Collecting missing information
  | 'confirming_details' // Confirming job details
  | 'submitting' // Submitting to database
  | 'completed' // Job posted successfully
  | 'error'; // Error state

export function PostJobPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [processingUrl, setProcessingUrl] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { sender: 'bot', text: "Hello! I'm your AI-powered job posting assistant. You can paste a job description, share a link to a job posting, or just tell me about the job you want to post." }
  ]);
  const [userInput, setUserInput] = useState('');
  const [jobData, setJobData] = useState<Partial<Job>>({});
  const [chatState, setChatState] = useState<ChatState>('idle');
  
  // Get the job posting service
  const jobPostingService = getJobPostingService();

  // Add a bot message with optional delay
  const addBotMessage = (text: string, delay = 500) => {
    setLoading(true);
    setTimeout(() => {
      setMessages(prev => [...prev, { sender: 'bot', text }]);
      setLoading(false);
    }, delay);
  };

  // Process a job URL using Firecrawl
  const processJobUrl = async (url: string) => {
    try {
      setProcessingUrl(true);
      addBotMessage(`I'm analyzing the job posting at ${url}. This might take a moment...`, 0);
      
      // Process the URL with our service
      const jobAnalysis = await jobPostingService.processJobUrl(url);
      
      // Update job data with the analysis results
      const updatedJobData = {
        ...jobData,
        title: jobAnalysis.title,
        company: jobAnalysis.company,
        location: jobAnalysis.location,
        description: jobAnalysis.description,
        requirements: jobAnalysis.requirements,
        type: normalizeJobType(jobAnalysis.type),
        level: normalizeJobLevel(jobAnalysis.level),
        timeCommitment: normalizeTimeCommitment(jobAnalysis.timeCommitment),
        applicationUrl: jobAnalysis.applicationUrl,
        externalLink: url
      };
      
      setJobData(updatedJobData);
      
      // Determine missing fields
      const missingFields = getMissingRequiredFields(updatedJobData);
      
      if (missingFields.length === 0) {
        // All required fields are present, show confirmation
        const confirmationText = formatJobConfirmation(updatedJobData);
        addBotMessage(`I've successfully extracted all the job details!\n\n${confirmationText}\n\nDoes this look correct? (yes/no)`);
        setChatState('confirming_details');
      } else {
        // Some fields are missing, ask for them
        const missingFieldsText = missingFields.join(', ');
        addBotMessage(`I've extracted some information from the job posting, but I still need a few details: ${missingFieldsText}.\n\nLet's start with: What is the ${missingFields[0]}?`);
        setChatState('collecting_info');
      }
    } catch (error) {
      console.error('Error processing job URL:', error);
      addBotMessage("I had trouble extracting information from that URL. Let's proceed manually. What is the job title?");
      setChatState('collecting_info');
    } finally {
      setProcessingUrl(false);
    }
  };

  // Process a job description using LLM
  const processJobDescription = async (description: string) => {
    try {
      console.log('Processing job description:', description.substring(0, 100) + '...');
      setLoading(true);
      addBotMessage("I'm analyzing the job description you provided. This will just take a moment...", 0);
      
      // Process the description with our service
      console.log('Calling jobPostingService.processJobDescription');
      const jobAnalysis = await jobPostingService.processJobDescription(description);
      console.log('Job analysis result:', jobAnalysis);
      
      // Update job data with the analysis results
      const updatedJobData = {
        ...jobData,
        title: jobAnalysis.title,
        company: jobAnalysis.company,
        location: jobAnalysis.location,
        description: jobAnalysis.description || description,
        requirements: jobAnalysis.requirements,
        type: normalizeJobType(jobAnalysis.type),
        level: normalizeJobLevel(jobAnalysis.level),
        timeCommitment: normalizeTimeCommitment(jobAnalysis.timeCommitment),
        applicationUrl: jobAnalysis.applicationUrl
      };
      
      setJobData(updatedJobData);
      
      // Determine missing fields
      const missingFields = getMissingRequiredFields(updatedJobData);
      
      if (missingFields.length === 0) {
        // All required fields are present, show confirmation
        const confirmationText = formatJobConfirmation(updatedJobData);
        addBotMessage(`I've successfully extracted all the job details!\n\n${confirmationText}\n\nDoes this look correct? (yes/no)`);
        setChatState('confirming_details');
      } else {
        // Some fields are missing, ask for them
        const missingFieldsText = missingFields.join(', ');
        addBotMessage(`I've extracted some information from your description, but I still need a few details: ${missingFieldsText}.\n\nLet's start with: What is the ${missingFields[0]}?`);
        setChatState('collecting_info');
      }
    } catch (error) {
      console.error('Error processing job description:', error);
      addBotMessage("I had trouble analyzing that description. Let's proceed step by step. What is the job title?");
      setChatState('collecting_info');
    } finally {
      setLoading(false);
    }
  };

  // Process user messages using the LLM
  const processUserMessage = async (messageText: string) => {
    setLoading(true);
    console.log('Processing user message:', messageText);
    
    try {
      const processedText = messageText.trim();
      console.log('Current chat state:', chatState);
      
      // Handle initial input (URL or description)
      if (chatState === 'idle') {
        if (processedText.startsWith('http://') || processedText.startsWith('https://')) {
          // Process as URL
          setChatState('processing_url');
          await processJobUrl(processedText);
        } else {
          // Process as description or initial prompt
          setChatState('processing_text');
          await processJobDescription(processedText);
        }
        return;
      }
      
      // For all other states, use the LLM to generate responses
      const { response, updatedJobData } = await jobPostingService.generateChatResponse(
        processedText,
        messages,
        jobData
      );
      
      // Update job data with any changes from the LLM
      setJobData(updatedJobData);
      
      // Add the bot response
      addBotMessage(response, 0);
      
      // Check if we need to change state based on the response
      if (response.toLowerCase().includes('does this look correct') || 
          response.toLowerCase().includes('is this information correct')) {
        setChatState('confirming_details');
      } else if (processedText.toLowerCase() === 'yes' && chatState === 'confirming_details') {
        setChatState('submitting');
        await submitJob();
      }
    } catch (error) {
      console.error('Error processing message:', error);
      addBotMessage("I'm sorry, I encountered an error. Let's try again. Could you please repeat your last message?");
    } finally {
      setLoading(false);
    }
  };

  // Helper functions to normalize job data to match expected types
  const normalizeJobType = (type?: string): 'Full-Time' | 'Part-Time' | 'Remote' | undefined => {
    if (!type) return undefined;
    
    const lowerType = type.toLowerCase();
    if (lowerType.includes('full') || lowerType.includes('full time') || lowerType.includes('fulltime')) {
      return 'Full-Time';
    } else if (lowerType.includes('part') || lowerType.includes('part time') || lowerType.includes('parttime')) {
      return 'Part-Time';
    } else if (lowerType.includes('remote')) {
      return 'Remote';
    }
    
    // Default to Full-Time if we can't determine
    return 'Full-Time';
  };
  
  const normalizeJobLevel = (level?: string): 'Entry Level' | 'Intermediate' | 'Expert' | undefined => {
    if (!level) return undefined;
    
    const lowerLevel = level.toLowerCase();
    if (lowerLevel.includes('entry') || lowerLevel.includes('junior') || lowerLevel.includes('beginner')) {
      return 'Entry Level';
    } else if (lowerLevel.includes('mid') || lowerLevel.includes('intermediate')) {
      return 'Intermediate';
    } else if (lowerLevel.includes('senior') || lowerLevel.includes('expert') || lowerLevel.includes('advanced')) {
      return 'Expert';
    }
    
    // Default to Entry Level if we can't determine
    return 'Entry Level';
  };
  
  const normalizeTimeCommitment = (commitment?: string): 'Evening' | 'Weekend' | 'Summer' | undefined => {
    if (!commitment) return undefined;
    
    const lowerCommitment = commitment.toLowerCase();
    if (lowerCommitment.includes('evening')) {
      return 'Evening';
    } else if (lowerCommitment.includes('weekend')) {
      return 'Weekend';
    } else if (lowerCommitment.includes('summer')) {
      return 'Summer';
    }
    
    // Default to undefined if we can't determine
    return undefined;
  };

  // Helper function to get missing required fields
  const getMissingRequiredFields = (data: Partial<Job>): string[] => {
    const requiredFields: (keyof Job)[] = [
      'title', 'company', 'location', 'description', 
      'type', 'level', 'timeCommitment', 'applicationUrl'
    ];
    
    return requiredFields.filter(field => !data[field]);
  };

  // Helper function to format job confirmation message
  const formatJobConfirmation = (data: Partial<Job>): string => {
    return `**Title:** ${data.title || 'N/A'}\n` +
      `**Company:** ${data.company || 'N/A'}\n` +
      `**Location:** ${data.location || 'N/A'}\n` +
      `**Type:** ${data.type || 'N/A'}\n` +
      `**Level:** ${data.level || 'N/A'}\n` +
      `**Time Commitment:** ${data.timeCommitment || 'N/A'}\n` +
      `**Requirements:** ${data.requirements?.join(', ') || 'N/A'}\n` +
      `**Application URL:** ${data.applicationUrl || 'N/A'}\n` +
      `**Link:** ${data.externalLink || 'N/A'}\n\n` +
      `**Description:**\n${data.description || 'N/A'}`;
  };

  // Function to submit the job to Supabase
  const submitJob = async () => {
    if (!user) {
      addBotMessage("Error: You must be logged in to post a job.");
      setChatState('error');
      return;
    }
    
    // Check required fields - Note that timeCommitment and applicationUrl might not exist in the database yet
    const requiredFields: (keyof Job)[] = [
      'title', 'company', 'location', 'description', 
      'type', 'level'
    ];
    const missingFields = requiredFields.filter(field => !jobData[field]);

    if (missingFields.length > 0) {
      addBotMessage(`Error: Missing required job details: ${missingFields.join(', ')}. Let's try again.`);
      setChatState('collecting_info');
      return;
    }

    setLoading(true);

    try {
      // Prepare data for Supabase (using snake_case for column names)
      // Include timeCommitment and applicationUrl if they exist in jobData
      const dataToInsert: any = {
        title: jobData.title!,
        company: jobData.company!,
        location: jobData.location!,
        description: jobData.description!,
        type: jobData.type!,
        level: jobData.level!,
        external_link: jobData.externalLink || null,
        employer_id: user.id,
        requirements: jobData.requirements || [],
        posted_at: new Date().toISOString(),
        applicants: 0
      };
      
      // Add timeCommitment and applicationUrl if they exist in jobData
      if ('timeCommitment' in jobData && jobData.timeCommitment) {
        dataToInsert.time_commitment = jobData.timeCommitment;
      }
      
      if ('applicationUrl' in jobData && jobData.applicationUrl) {
        dataToInsert.application_url = jobData.applicationUrl;
      }

      const { error } = await supabase.from('jobs').insert(dataToInsert);

      if (error) throw error;

      addBotMessage("🎉 Job posted successfully! Your job listing is now live and visible to students. I'll redirect you to the dashboard in a moment.");
      setChatState('completed');
      
      // Redirect after a short delay
      setTimeout(() => navigate('/dashboard'), 2500);
    } catch (error: any) {
      console.error("Supabase submission error:", error);
      
      if (error.code === '42501') { // RLS violation code
        addBotMessage(`Error posting job: Permission denied. Please ensure you have the correct role/permissions.`);
      } else {
        addBotMessage(`Error posting job: ${error.message}. Please try again later.`);
      }
      
      setChatState('error');
    } finally {
      setLoading(false);
    }
  };

  // Handle sending a message
  const handleSendMessage = () => {
    if (!userInput.trim() || loading || processingUrl) return;

    const newUserMessage: ChatMessage = { sender: 'user', text: userInput };
    const currentInput = userInput;
    
    setMessages(prev => [...prev, newUserMessage]);
    setUserInput('');
    
    processUserMessage(currentInput);
  };

  return (
    <div className="container mx-auto px-4 py-12 flex flex-col h-[calc(100vh-150px)]">
      <h1 className="text-3xl font-bold mb-6 text-center">AI-Powered Job Posting</h1>
      
      {/* Environment indicator for API key */}
      {!import.meta.env.VITE_OPENROUTER_API_KEY && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
          <p className="font-bold">Note:</p>
          <p>OpenRouter API key not found. Add VITE_OPENROUTER_API_KEY to your .env file for AI-powered job posting.</p>
        </div>
      )}

      {/* Chat Message Display Area */}
      <div className="flex-grow overflow-y-auto mb-4 p-4 border rounded-lg bg-gray-50 space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow ${
                msg.sender === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-800'
              }`}
            >
              {/* Render message with markdown-like formatting */}
              {msg.text.split('\n').map((line, i) => (
                <span key={i}>
                  {line.startsWith('**') && line.endsWith('**') 
                    ? <strong>{line.substring(2, line.length - 2)}</strong> 
                    : line}
                  {i === msg.text.split('\n').length - 1 ? '' : <br />}
                </span>
              ))}
            </div>
          </div>
        ))}
        
        {/* Loading indicators */}
        {loading && (
          <div className="flex justify-start">
            <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow bg-white text-gray-500 italic flex items-center">
              <Loader2 className="animate-spin mr-2" size={16} />
              Thinking...
            </div>
          </div>
        )}
        
        {processingUrl && (
          <div className="flex justify-start">
            <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow bg-white text-gray-500 italic flex items-center">
              <Loader2 className="animate-spin mr-2" size={16} />
              Analyzing job posting...
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="flex items-center border-t pt-4">
        <textarea
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Type your message or paste job details here..."
          rows={2}
          className="flex-grow p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mr-2"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          disabled={loading || processingUrl || chatState === 'completed' || chatState === 'submitting'}
        />
        <button
          onClick={handleSendMessage}
          disabled={loading || processingUrl || !userInput.trim() || chatState === 'completed' || chatState === 'submitting'}
          className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          <SendHorizonal size={20} />
        </button>
      </div>
    </div>
  );
}
