import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner'; // Keep toast for potential errors outside chat flow
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { SendHorizonal } from 'lucide-react';
import type { Job } from '../types'; // Import Job type

// Define message type
interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
}

// Define possible chat states
type ChatState =
  | 'idle' // Initial state, awaiting first input
  | 'awaiting_title'
  | 'awaiting_company'
  | 'awaiting_location'
  | 'awaiting_description'
  | 'awaiting_requirements'
  | 'awaiting_type'
  | 'awaiting_level'
  | 'awaiting_external_link'
  | 'confirming_details'
  | 'awaiting_confirmation'
  | 'submitting'
  | 'completed'
  | 'error';
  // Add more states as needed for link scraping, editing, etc.

export function PostJobPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false); // Used for bot thinking/submission
  const [messages, setMessages] = useState<ChatMessage[]>([
    { sender: 'bot', text: "Hello! Please paste a job description, a link to a job posting, or just tell me about the job you want to post." }
  ]);
  const [userInput, setUserInput] = useState('');
  // State to store collected job data
  const [jobData, setJobData] = useState<Partial<Job>>({});
  // State to track chat flow/current question
  const [chatState, setChatState] = useState<ChatState>('idle');

  // Helper to add bot message with delay
  const addBotMessage = (text: string) => {
    setLoading(true); // Show thinking indicator (optional)
    setTimeout(() => {
      setMessages(prev => [...prev, { sender: 'bot', text }]);
      setLoading(false); // Hide thinking indicator
    }, 500); // Simulate thinking delay
  };

  // Function to process user messages and advance chat state
  const processUserMessage = async (messageText: string) => {
    let nextState: ChatState = chatState;
    let botResponse = "I'm not sure how to handle that yet. Can you try again?"; // Default fallback

    // Trim message text for processing
    const processedText = messageText.trim();

    switch (chatState) {
      case 'idle':
        // Basic URL check (improve as needed)
        if (processedText.startsWith('http://') || processedText.startsWith('https://')) {
          botResponse = "Okay, I see a link. I'll try to scrape the details... (Note: Scraping not implemented yet). For now, let's proceed manually. What is the job title?";
          // TODO: Implement actual scraping with Firecrawl here
          // If scraping successful, populate jobData and jump to 'confirming_details'
          // If scraping fails, ask for manual input
          setJobData({ externalLink: processedText }); // Store the link using camelCase
          nextState = 'awaiting_title';
        } else {
          // Assume it's a description or initial prompt
          botResponse = "Thanks! Let's get started. What is the job title?";
          setJobData({ description: processedText }); // Store initial text as description
          nextState = 'awaiting_title';
        }
        break;

      case 'awaiting_title':
        setJobData(prev => ({ ...prev, title: processedText }));
        botResponse = "Got it. What is the company name?";
        nextState = 'awaiting_company';
        break;

      case 'awaiting_company':
        setJobData(prev => ({ ...prev, company: processedText }));
        botResponse = "Great. Where is the job located? (e.g., City, ST or Remote)";
        nextState = 'awaiting_location';
        break;

      case 'awaiting_location':
         setJobData(prev => ({ ...prev, location: processedText }));
         // If description wasn't provided initially (e.g., user started with link/title), ask for it now
         if (!jobData.description) {
            botResponse = "Okay. Could you provide a description for the job?";
            nextState = 'awaiting_description';
         } else {
            // Otherwise, move to requirements
            botResponse = "Thanks. What are the key requirements? (Please list them separated by commas)";
            nextState = 'awaiting_requirements';
         }
         break;

       case 'awaiting_description':
         setJobData(prev => ({ ...prev, description: processedText }));
         botResponse = "Perfect. What are the key requirements? (Please list them separated by commas)";
         nextState = 'awaiting_requirements';
         break;

       case 'awaiting_requirements':
         // Simple comma split, trim whitespace
         const requirements = processedText.split(',').map(r => r.trim()).filter(Boolean);
         setJobData(prev => ({ ...prev, requirements }));
         botResponse = "Understood. What is the job type? (e.g., Full-Time, Part-Time, Internship, Contract)";
         // TODO: Could offer options here
         nextState = 'awaiting_type';
         break;

       case 'awaiting_type':
         // Basic validation could be added
         setJobData(prev => ({ ...prev, type: processedText as Job['type'] })); // Cast for now
         botResponse = "And the experience level required? (e.g., Entry Level, Intermediate, Expert)";
         // TODO: Could offer options
         nextState = 'awaiting_level';
         break;

       case 'awaiting_level':
         setJobData(prev => ({ ...prev, level: processedText as Job['level'] })); // Cast for now
         // If external link wasn't provided initially, ask now
         if (!jobData.externalLink) { // Use camelCase
            botResponse = "Do you have an external link for the full job posting? (Optional, type 'none' if not)";
            nextState = 'awaiting_external_link';
         } else {
            // Skip to confirmation if link was already provided
            const currentJobData = { ...jobData, level: processedText as Job['level'] }; // Ensure latest level is included
            const confirmationText = `Okay, here's what I have:\n\n` +
              `**Title:** ${currentJobData.title}\n` +
              `**Company:** ${currentJobData.company}\n` +
              `**Location:** ${currentJobData.location}\n` +
              `**Type:** ${currentJobData.type}\n` +
              `**Level:** ${currentJobData.level}\n` +
              `**Requirements:** ${currentJobData.requirements?.join(', ') || 'N/A'}\n` +
              `**Link:** ${currentJobData.externalLink || 'N/A'}\n\n` + // Use camelCase
              `**Description:**\n${currentJobData.description}\n\n` +
              `Does this look correct? (yes/no)`;
            botResponse = confirmationText;
            nextState = 'awaiting_confirmation';
         }
         break;

       case 'awaiting_external_link':
         const link = processedText.toLowerCase() === 'none' ? undefined : processedText;
         const currentJobDataWithLink = { ...jobData, externalLink: link }; // Ensure latest link is included (use camelCase)
         setJobData(currentJobDataWithLink); // Update state
         // Format collected data for confirmation
         const confirmationText = `Okay, here's what I have:\n\n` +
           `**Title:** ${currentJobDataWithLink.title}\n` +
           `**Company:** ${currentJobDataWithLink.company}\n` +
           `**Location:** ${currentJobDataWithLink.location}\n` +
           `**Type:** ${currentJobDataWithLink.type}\n` +
           `**Level:** ${currentJobDataWithLink.level}\n` +
           `**Requirements:** ${currentJobDataWithLink.requirements?.join(', ') || 'N/A'}\n` +
           `**Link:** ${currentJobDataWithLink.externalLink || 'N/A'}\n\n` + // Use camelCase
           `**Description:**\n${currentJobDataWithLink.description}\n\n` +
           `Does this look correct? (yes/no)`;
         botResponse = confirmationText;
         nextState = 'awaiting_confirmation';
         break;

       case 'awaiting_confirmation':
         const confirmation = processedText.toLowerCase();
         if (confirmation === 'yes' || confirmation === 'y') {
           botResponse = "Great! Posting the job now...";
           nextState = 'submitting';
           // --- Trigger actual submission ---
           await submitJob();
           // submitJob will handle setting 'completed' or 'error' state and adding final bot message
         } else {
           botResponse = "Okay, what needs to be changed? (e.g., 'change title to Senior Developer', or paste the full corrected details). For now, we'll restart the process.";
           // TODO: Implement logic to handle change requests - complex!
           nextState = 'idle'; // Reset for now, needs refinement
           setJobData({}); // Clear collected data
         }
         break;

      // Add cases for 'submitting', 'completed', 'error' if needed for specific messages

      default:
        console.warn(`Unhandled chat state: ${chatState}`);
        botResponse = "Sorry, I got a bit confused. Let's try starting over. Please paste the job details or link.";
        nextState = 'idle';
        setJobData({}); // Reset job data
    }

    // Only add bot message here if not submitting (submitJob handles its own messages)
    if (nextState !== 'submitting') {
       addBotMessage(botResponse);
    }
    setChatState(nextState);
  };


  // Function to handle the actual Supabase submission
  const submitJob = async () => {
    if (!user) {
      addBotMessage("Error: You must be logged in to post a job.");
      setChatState('error');
      setLoading(false); // Ensure loading stops on auth error
      return;
    }
    // Check required fields before attempting submission
    const requiredFields: (keyof Job)[] = ['title', 'company', 'location', 'description', 'type', 'level'];
    const missingFields = requiredFields.filter(field => !jobData[field]);

    if (missingFields.length > 0) {
       addBotMessage(`Error: Missing required job details: ${missingFields.join(', ')}. Let's try again.`);
       setChatState('idle'); // Reset to start over
       setJobData({});
       setLoading(false); // Ensure loading stops
       return;
    }

    setLoading(true); // Indicate submission process

    try {
      // Prepare data for Supabase (using snake_case for column names)
      const dataToInsert = {
        title: jobData.title!,
        company: jobData.company!,
        location: jobData.location!,
        description: jobData.description!,
        type: jobData.type!,
        level: jobData.level!,
        external_link: jobData.externalLink || null, // Convert camelCase to snake_case for DB
        employer_id: user.id,
        requirements: jobData.requirements || [],
        // Add other fields like applicants, posted_at if needed (defaults might be set in DB)
      };

      const { error } = await supabase.from('jobs').insert(dataToInsert);

      if (error) throw error;

      addBotMessage("Job posted successfully! Redirecting you to the dashboard.");
      setChatState('completed');
      setTimeout(() => navigate('/dashboard'), 2000); // Redirect after a short delay

    } catch (error: any) {
      console.error("Supabase submission error:", error);
      // Check for specific errors like RLS if needed
      if (error.code === '42501') { // RLS violation code
         addBotMessage(`Error posting job: Permission denied. Please ensure you have the correct role/permissions.`);
      } else {
         addBotMessage(`Error posting job: ${error.message}. Please try again later.`);
      }
      setChatState('error');
    } finally {
      setLoading(false); // Ensure loading stops regardless of outcome
    }
  };


  // Handle user message submission
  const handleSendMessage = () => {
    if (!userInput.trim() || loading) return; // Prevent sending empty messages or while bot is thinking/submitting

    const newUserMessage: ChatMessage = { sender: 'user', text: userInput };
    const currentInput = userInput; // Capture input before clearing
    setMessages(prev => [...prev, newUserMessage]);
    setUserInput('');

    // Process the message using the state machine logic
    processUserMessage(currentInput);
  };

  return (
    <div className="container mx-auto px-4 py-12 flex flex-col h-[calc(100vh-150px)]"> {/* Adjust height as needed */}
      <h1 className="text-3xl font-bold mb-6 text-center">Post a Job via Chat</h1>

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
              {/* Basic rendering, consider markdown support later */}
              {/* Replace newline characters with <br /> for display */}
              {msg.text.split('\n').map((line, i) => (
                <span key={i}>{line}{i === msg.text.split('\n').length - 1 ? '' : <br />}</span>
              ))}
            </div>
          </div>
        ))}
        {/* Loading indicator */}
        {loading && chatState !== 'submitting' && (
           <div className="flex justify-start">
             <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow bg-white text-gray-500 italic">
               Thinking...
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
          disabled={loading || chatState === 'completed' || chatState === 'submitting'} // Disable input when loading/done
        />
        <button
          onClick={handleSendMessage}
          disabled={loading || !userInput.trim() || chatState === 'completed' || chatState === 'submitting'}
          className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          <SendHorizonal size={20} />
        </button>
      </div>
    </div>
  );
}
