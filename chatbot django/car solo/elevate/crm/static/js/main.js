let messages = [];
let thinkingIndicator = null;
let isGenerating = false;
let shouldStop = false;

function showThinking() {
    const chatMessages = document.getElementById('chatMessages');
    thinkingIndicator = document.createElement('div');
    thinkingIndicator.className = 'thinking';
    thinkingIndicator.innerHTML = '<div class="dot-animation">Thinking <span>.</span><span>.</span><span>.</span></div>';
    chatMessages.appendChild(thinkingIndicator);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function hideThinking() {
    if (thinkingIndicator) {
        thinkingIndicator.remove();
        thinkingIndicator = null;
    }
}

// Add API selector buttons with logos
const selectorHtml = `
    <div class="api-selector">
        ${Object.entries(AI_MODELS).map(([key, model]) => `
            <button class="api-button ${key === 'gemini' ? 'active' : ''}" 
                    data-api="${key}">
                <img src="${AI_LOGOS[key]}" 
                     alt="${model.name} logo" 
                     onerror="this.innerHTML='${model.name[0]}'"/>
                ${model.name}
            </button>
        `).join('')}
    </div>
`;
document.querySelector('.chat-container').insertAdjacentHTML('afterbegin', selectorHtml);

// Handle API button clicks
let currentModel = 'gemini';
document.querySelectorAll('.api-button').forEach(button => {
    button.addEventListener('click', () => {
        // Update active state
        document.querySelectorAll('.api-button').forEach(btn => 
            btn.classList.remove('active'));
        button.classList.add('active');
        currentModel = button.dataset.api;
    });
});

// Add this function to handle stopping generation
function stopGeneration() {
    shouldStop = true;
    document.getElementById('stopButton').classList.remove('visible');
    // We don't reset isGenerating here because it will be reset in addMessageToChat
    // when the message generation is complete
}

// Function to update send button state
function updateSendButtonState() {
    const sendButton = document.querySelector('.input-container button:not(.stop-button)');
    if (isGenerating) {
        sendButton.disabled = true;
        sendButton.style.opacity = '0.5';
        sendButton.style.cursor = 'not-allowed';
    } else {
        sendButton.disabled = false;
        sendButton.style.opacity = '1';
        sendButton.style.cursor = 'pointer';
    }
}

async function sendMessage() {
    // If already generating, don't send another message
    if (isGenerating) {
        return;
    }
    
    const userInput = document.getElementById('userInput').value;
    const model = AI_MODELS[currentModel];
    
    if (!userInput.trim()) return;

    // Set generating flag to true before starting
    isGenerating = true;
    updateSendButtonState();
    
    addMessageToChat('user', userInput);
    document.getElementById('userInput').value = '';
    showThinking();

    try {
        // First, save the message to the database
        const formData = new FormData();
        formData.append('message', userInput);
        formData.append('model', currentModel);
        
        // Get CSRF token
        const csrftoken = getCookie('csrftoken');
        
        const saveResponse = await fetch('/send-message', {
            method: 'POST',
            headers: {
                'X-CSRFToken': csrftoken
            },
            body: formData
        });
        
        // Check if the response indicates an authentication error
        if (saveResponse.status === 403) {
            hideThinking();
            isGenerating = false;
            updateSendButtonState();
            
            // Show login message
            var chatMessages = document.getElementById('chatMessages');
            var messageDiv = document.createElement('div');
            messageDiv.className = 'message bot-message';
            messageDiv.innerHTML = '<strong>System:</strong> Please login to use the chat. <a href="/my-login">Login here</a>';
            chatMessages.appendChild(messageDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
            return;
        }
        
        if (!saveResponse.ok) {
            throw new Error('Failed to save message');
        }

        // Then proceed with the AI model request
        const url = currentModel === 'gemini' ? 
            `${model.url}?key=${model.key}` : 
            model.url;

        const response = await fetch(url, {
            method: 'POST',
            headers: model.headers,
            body: JSON.stringify(model.formatRequest(userInput))
        });

        const data = await response.json();
        hideThinking();

        try {
            const botResponse = model.formatResponse(data);
            addMessageToChat('bot', botResponse);
        } catch (error) {
            console.error('Error parsing response:', error);
            addMessageToChat('bot', 'Sorry, I encountered an error processing the response.');
            isGenerating = false;
            updateSendButtonState();
        }
    } catch (error) {
        hideThinking();
        console.error('Error:', error);
        addMessageToChat('bot', 'Sorry, an error occurred while processing your request.');
        isGenerating = false;
        updateSendButtonState();
    }
}

// Function to get CSRF token from cookies
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

async function addMessageToChat(sender, message) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    let userHasScrolled = false;
    
    // Add scroll event listener to detect manual scrolling
    const scrollHandler = () => {
        const isAtBottom = chatMessages.scrollHeight - chatMessages.scrollTop <= chatMessages.clientHeight + 100;
        if (!isAtBottom) {
            userHasScrolled = true;
        }
    };
    chatMessages.addEventListener('scroll', scrollHandler);
    
    if (sender === 'bot') {
        messageDiv.innerHTML = '';
        chatMessages.appendChild(messageDiv);
        
        let formattedMessage = message
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
            .replace(/`(.*?)`/g, '<code>$1</code>');

        let currentText = '';
        messageDiv.innerHTML = '<span class="generating"></span>';
        
        document.getElementById('stopButton').classList.add('visible');
        // isGenerating is already set to true in sendMessage
        shouldStop = false;
        
        for (let i = 0; i < formattedMessage.length; i++) {
            if (shouldStop) {
                break;
            }
            currentText += formattedMessage[i];
            messageDiv.innerHTML = currentText + '<span class="generating"></span>';
            
            // Only auto-scroll if user hasn't manually scrolled up
            if (!userHasScrolled) {
                requestAnimationFrame(() => {
                    chatMessages.scrollTop = chatMessages.scrollHeight;
                });
            }
            
            await new Promise(resolve => setTimeout(resolve, 20));
        }
        
        document.getElementById('stopButton').classList.remove('visible');
        isGenerating = false; // Reset the generating flag when done
        updateSendButtonState(); // Update the send button state
        shouldStop = false;
        messageDiv.innerHTML = currentText;
        
        // Remove scroll event listener after generation
        chatMessages.removeEventListener('scroll', scrollHandler);
        
        // Add copy button if needed
        if (message.includes('```') || message.includes('`')) {
            const copyButton = document.createElement('button');
            copyButton.className = 'copy-button';
            copyButton.innerHTML = '<i class="fas fa-copy"></i>';
            copyButton.onclick = () => {
                let codeContent;
                if (message.includes('```')) {
                    // Extract content between triple backticks
                    codeContent = message.match(/```(?:\w*\n)?([^```]+)```/)[1].trim();
                } else {
                    // Extract content between single backticks
                    codeContent = message.match(/`([^`]+)`/)[1].trim();
                }
                
                navigator.clipboard.writeText(codeContent).then(() => {
                    copyButton.innerHTML = '<i class="fas fa-check"></i>';
                    setTimeout(() => {
                        copyButton.innerHTML = '<i class="fas fa-copy"></i>';
                    }, 2000);
                }).catch(err => {
                    console.error('Failed to copy:', err);
                    copyButton.innerHTML = '<i class="fas fa-times"></i>';
                });
            };
            messageDiv.appendChild(copyButton);
        }
    } else {
        // User message handling
        const formattedMessage = message
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
            .replace(/`(.*?)`/g, '<code>$1</code>');
        
        messageDiv.innerHTML = formattedMessage;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

// Allow sending message with Enter key
document.getElementById('userInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && !isGenerating) {
        sendMessage();
    }
});

// Add this at the beginning of your script section
function toggleNav() {
    const sidebar = document.querySelector('.nav-sidebar');
    const mainContent = document.querySelector('.main-content');
    
    if (window.innerWidth <= 768) {
        sidebar.classList.toggle('open');
    } else {
        sidebar.classList.toggle('closed');
        mainContent.classList.toggle('full-width');
    }
}

// Add event listener for window resize
window.addEventListener('resize', () => {
    const sidebar = document.querySelector('.nav-sidebar');
    const mainContent = document.querySelector('.main-content');
    
    if (window.innerWidth <= 768) {
        sidebar.classList.remove('closed');
        mainContent.classList.remove('full-width');
        sidebar.classList.remove('open');
    }
});
