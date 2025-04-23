#!/bin/bash

# Get the API key from .env file
API_KEY=$(grep VITE_GEMINI_API_KEY .env | cut -d '=' -f2)

# Test prompt
PROMPT="Software Developer Intern position available for high school students. Part-time, evenings and weekends."

# Make the API request
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=$API_KEY" \
-H 'Content-Type: application/json' \
-X POST \
-d '{
  "contents": [{
    "parts":[{"text": "'"$PROMPT"'"}]
    }]
   }'
