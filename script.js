document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const imageInput = document.getElementById('imageInput');
    const chooseFileBtn = document.getElementById('chooseFileBtn');
    const uploadBtn = document.getElementById('uploadBtn');
    const detectBtn = document.getElementById('detectBtn');
    const resetBtn = document.getElementById('resetBtn');
    const uploadArea = document.getElementById('uploadArea');
    const previewSection = document.getElementById('previewSection');
    const resultSection = document.getElementById('resultSection');
    const loadingSection = document.getElementById('loadingSection');
    const previewImage = document.getElementById('previewImage');
    const resultImage = document.getElementById('resultImage');
    const foodItem = document.getElementById('foodItem');
    const freshnessStatus = document.getElementById('freshnessStatus');
    const confidence = document.getElementById('confidence');

    let selectedFile = null;

    // Choose File Button
    chooseFileBtn.addEventListener('click', function() {
        imageInput.click();
    });

    // File input change event
    imageInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            handleFileSelection(file);
        }
    });

    // Drag and drop functionality
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (file.type.startsWith('image/')) {
                handleFileSelection(file);
            } else {
                showError('Please select a valid image file.');
            }
        }
    });

    // Upload Button
    uploadBtn.addEventListener('click', function() {
        if (selectedFile) {
            showPreview();
        } else {
            showError('Please select a file first.');
        }
    });

    // Detect Button
    detectBtn.addEventListener('click', function() {
        if (selectedFile) {
            detectFreshness();
        } else {
            showError('No image selected for detection.');
        }
    });

    // Reset Button
    resetBtn.addEventListener('click', function() {
        resetApp();
    });

    // Handle file selection
    function handleFileSelection(file) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            showError('Please select a valid image file.');
            return;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            showError('File size should be less than 10MB.');
            return;
        }

        selectedFile = file;
        
        // Show preview
        const reader = new FileReader();
        reader.onload = function(e) {
            previewImage.src = e.target.result;
            resultImage.src = e.target.result; // Also set the result image
        };
        reader.readAsDataURL(file);

        // Enable upload button
        uploadBtn.disabled = false;
        
        // Show success message
        showSuccess(`File "${file.name}" selected successfully!`);
    }

    // Show preview section
    function showPreview() {
        previewSection.style.display = 'block';
        resultSection.style.display = 'none';
        loadingSection.style.display = 'none';
        
        // Scroll to preview section
        previewSection.scrollIntoView({ behavior: 'smooth' });
        
        showSuccess('Image uploaded successfully! Click "Detect Freshness" to analyze.');
    }

    // Detect freshness
    async function detectFreshness() {
        if (!selectedFile) {
            showError('No image selected for detection.');
            return;
        }

        // Show loading
        showLoading();
        
        try {
            console.log("Sending request to:", 'http://127.0.0.1:8000/predict/');
            console.log("File being sent:", selectedFile.name, "Size:", selectedFile.size, "Type:", selectedFile.type);
            
            const formData = new FormData();
            formData.append('file', selectedFile);
            
            const response = await fetch('http://127.0.0.1:8000/predict/', {
                method: 'POST',
                body: formData
            });

            console.log("Response status:", response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Server error response:", errorText);
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }

            const data = await response.json();
            console.log("Response data:", data);
            
            // Hide loading and show results
            hideLoading();
            showResults(data);
            
        } catch (error) {
            console.error("Error details:", error);
            hideLoading();
            showError(`Detection failed: ${error.message}. Please check if the server is running and try again.`);
        }
    }

    // Show loading
    function showLoading() {
        loadingSection.style.display = 'block';
        previewSection.style.display = 'none';
        resultSection.style.display = 'none';
        
        // Scroll to loading section
        loadingSection.scrollIntoView({ behavior: 'smooth' });
    }

    // Hide loading
    function hideLoading() {
        loadingSection.style.display = 'none';
    }

    // Show results
    function showResults(data) {
        // Update result elements
        const foodItemName = data.food_item.charAt(0).toUpperCase() + data.food_item.slice(1);
        foodItem.textContent = foodItemName;
        foodItem.className = 'result-value';
        
        freshnessStatus.textContent = data.prediction;
        freshnessStatus.className = `result-value ${data.prediction === 'Fresh' ? 'status-fresh' : 'status-rotten'}`;
        
        confidence.textContent = data.confidence;
        confidence.className = 'result-value';
        
        // Show result section (image will already be set from handleFileSelection)
        resultSection.style.display = 'block';
        previewSection.style.display = 'none';
        
        // Scroll to results
        resultSection.scrollIntoView({ behavior: 'smooth' });
        
        // Show success message
        const statusIcon = data.prediction === 'Fresh' ? '✅' : '⚠️';
        showSuccess(`${statusIcon} Analysis complete! ${foodItemName} is ${data.prediction.toLowerCase()} with ${data.confidence} confidence.`);
    }

    // Show error message
    function showError(message) {
        // Remove existing error messages
        const existingError = document.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${message}`;
        
        // Insert at the top of main content
        const mainContent = document.querySelector('.main-content');
        mainContent.insertBefore(errorDiv, mainContent.firstChild);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.remove();
            }
        }, 5000);
    }

    // Show success message
    function showSuccess(message) {
        // Remove existing success messages
        const existingSuccess = document.querySelector('.success-message');
        if (existingSuccess) {
            existingSuccess.remove();
        }
        
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
        
        // Insert at the top of main content
        const mainContent = document.querySelector('.main-content');
        mainContent.insertBefore(successDiv, mainContent.firstChild);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (successDiv.parentNode) {
                successDiv.remove();
            }
        }, 5000);
    }

    // Reset functionality
    function resetApp() {
        selectedFile = null;
        imageInput.value = '';
        uploadBtn.disabled = true;
        previewSection.style.display = 'none';
        resultSection.style.display = 'none';
        loadingSection.style.display = 'none';
        
        // Clear images
        previewImage.src = '#';
        resultImage.src = '#';
        
        // Clear messages
        const messages = document.querySelectorAll('.error-message, .success-message');
        messages.forEach(msg => msg.remove());
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Add reset button functionality (optional)
    // You can add a reset button to the UI if needed
    window.resetApp = resetApp;
});

// Chatbot Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Chatbot DOM elements
    const chatToggle = document.getElementById('chatToggle');
    const chatContainer = document.getElementById('chatContainer');
    const chatClose = document.getElementById('chatClose');
    const chatMessages = document.getElementById('chatMessages');
    const chatInput = document.getElementById('chatInput');
    const chatSend = document.getElementById('chatSend');

    let isChatOpen = false;

    // Chatbot toggle
    chatToggle.addEventListener('click', function() {
        toggleChat();
    });

    // Close chat
    chatClose.addEventListener('click', function() {
        toggleChat();
    });

    // Send message on button click
    chatSend.addEventListener('click', function() {
        sendMessage();
    });

    // Send message on Enter key
    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // Toggle chat function
    function toggleChat() {
        isChatOpen = !isChatOpen;
        if (isChatOpen) {
            chatContainer.classList.add('active');
            chatInput.focus();
        } else {
            chatContainer.classList.remove('active');
        }
    }

    // Send message function
    function sendMessage() {
        const message = chatInput.value.trim();
        if (message === '') return;

        // Add user message
        addMessage(message, 'user');
        chatInput.value = '';

        // Show typing indicator
        showTypingIndicator();

        // Simulate AI response delay
        setTimeout(() => {
            hideTypingIndicator();
            const response = generateAIResponse(message);
            addMessage(response, 'bot');
        }, 1000 + Math.random() * 2000); // Random delay between 1-3 seconds
    }

    // Add message to chat
    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;

        const icon = sender === 'bot' ? 'fas fa-robot' : 'fas fa-user';
        
        messageDiv.innerHTML = `
            <div class="message-content">
                <i class="${icon}"></i>
                <div class="message-text">${text}</div>
            </div>
        `;

        chatMessages.appendChild(messageDiv);
        scrollToBottom();
    }

    // Show typing indicator
    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot-message typing-indicator';
        typingDiv.id = 'typingIndicator';
        typingDiv.innerHTML = `
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        `;
        chatMessages.appendChild(typingDiv);
        scrollToBottom();
    }

    // Hide typing indicator
    function hideTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    // Scroll to bottom of chat
    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Generate AI response based on user input
    function generateAIResponse(userMessage) {
        const message = userMessage.toLowerCase();
        
        // Food freshness detection tips
        if (message.includes('fresh') || message.includes('freshness') || message.includes('detect')) {
            return `Here are some tips to detect food freshness:<br><br>
            <strong>Visual Signs:</strong><br>
            • Bright, vibrant colors<br>
            • Firm texture<br>
            • No mold or dark spots<br>
            • Fresh smell<br><br>
            <strong>For Fruits:</strong><br>
            • Apples: Firm, no soft spots<br>
            • Bananas: Yellow with no brown spots<br>
            • Oranges: Heavy for size, bright color<br><br>
            <strong>For Vegetables:</strong><br>
            • Tomatoes: Firm, bright red<br>
            • Cucumbers: Firm, dark green<br>
            • Potatoes: No sprouts or green spots`;
        }
        
        // Health risks of rotten food
        else if (message.includes('rotten') || message.includes('spoiled') || message.includes('health risk') || message.includes('danger')) {
            return `⚠️ <strong>Health Risks of Consuming Rotten Food:</strong><br><br>
            <strong>Immediate Effects:</strong><br>
            • Food poisoning<br>
            • Nausea and vomiting<br>
            • Diarrhea<br>
            • Stomach cramps<br><br>
            <strong>Serious Risks:</strong><br>
            • Bacterial infections (Salmonella, E. coli)<br>
            • Fungal toxins<br>
            • Allergic reactions<br>
            • Long-term health issues<br><br>
            <strong>Prevention:</strong><br>
            • Always check expiration dates<br>
            • Store food properly<br>
            • When in doubt, throw it out!`;
        }
        
        // Storage recommendations
        else if (message.includes('store') || message.includes('storage') || message.includes('refrigerator') || message.includes('fridge')) {
            return `🌡️ <strong>Food Storage Recommendations:</strong><br><br>
            <strong>Refrigerator (32-40°F):</strong><br>
            • Most fruits and vegetables<br>
            • Keep in crisper drawer<br>
            • Use within 1-2 weeks<br><br>
            <strong>Room Temperature:</strong><br>
            • Bananas, tomatoes, potatoes<br>
            • Onions, garlic<br>
            • Keep in cool, dry place<br><br>
            <strong>Freezer:</strong><br>
            • Blanch vegetables first<br>
            • Use airtight containers<br>
            • Label with dates`;
        }
        
        // Disease prevention
        else if (message.includes('disease') || message.includes('prevent') || message.includes('sick') || message.includes('infection')) {
            return `🛡️ <strong>Disease Prevention Tips:</strong><br><br>
            <strong>Food Safety:</strong><br>
            • Wash hands before handling food<br>
            • Clean cutting boards and utensils<br>
            • Separate raw and cooked foods<br>
            • Cook food to proper temperatures<br><br>
            <strong>Fresh Food Benefits:</strong><br>
            • Higher nutrient content<br>
            • Better immune support<br>
            • Reduced risk of foodborne illness<br>
            • Better taste and texture<br><br>
            <strong>When to Avoid:</strong><br>
            • Moldy or spoiled food<br>
            • Unpleasant odors<br>
            • Slimy texture<br>
            • Discolored spots`;
        }
        
        // Specific fruits
        else if (message.includes('apple') || message.includes('apples')) {
            return `🍎 <strong>Apple Freshness Guide:</strong><br><br>
            <strong>Fresh Signs:</strong><br>
            • Firm to the touch<br>
            • Bright, consistent color<br>
            • Fresh apple smell<br>
            • No soft spots or bruises<br><br>
            <strong>Storage:</strong><br>
            • Refrigerate for longer shelf life<br>
            • Keep in crisper drawer<br>
            • Can last 2-4 weeks when stored properly<br><br>
            <strong>Health Benefits:</strong><br>
            • High in fiber and vitamin C<br>
            • Contains antioxidants<br>
            • Supports heart health`;
        }
        
        else if (message.includes('banana') || message.includes('bananas')) {
            return `🍌 <strong>Banana Freshness Guide:</strong><br><br>
            <strong>Fresh Signs:</strong><br>
            • Yellow color with no brown spots<br>
            • Firm texture<br>
            • Fresh banana smell<br>
            • No mold or dark areas<br><br>
            <strong>Storage:</strong><br>
            • Store at room temperature<br>
            • Keep away from other fruits<br>
            • Refrigerate when ripe to slow ripening<br><br>
            <strong>Health Benefits:</strong><br>
            • High in potassium<br>
            • Good source of vitamin B6<br>
            • Natural energy booster`;
        }
        
        else if (message.includes('tomato') || message.includes('tomatoes')) {
            return `🍅 <strong>Tomato Freshness Guide:</strong><br><br>
            <strong>Fresh Signs:</strong><br>
            • Firm but slightly soft<br>
            • Bright red color<br>
            • Fresh tomato smell<br>
            • No cracks or mold<br><br>
            <strong>Storage:</strong><br>
            • Store at room temperature<br>
            • Keep stem side up<br>
            • Refrigerate only when fully ripe<br><br>
            <strong>Health Benefits:</strong><br>
            • Rich in lycopene<br>
            • High vitamin C content<br>
            • Supports skin health`;
        }
        
        // General help
        else if (message.includes('help') || message.includes('what can you do') || message.includes('assist')) {
            return `🤖 <strong>I can help you with:</strong><br><br>
            • <strong>Freshness Detection:</strong> Tips on how to identify fresh vs rotten food<br>
            • <strong>Health Risks:</strong> Information about dangers of consuming spoiled food<br>
            • <strong>Storage Tips:</strong> Best practices for storing fruits and vegetables<br>
            • <strong>Disease Prevention:</strong> How to avoid foodborne illnesses<br>
            • <strong>Specific Foods:</strong> Ask about apples, bananas, tomatoes, etc.<br><br>
            Just ask me anything about food freshness and safety!`;
        }
        
        // Default response
        else {
            return `I'm here to help with food freshness and safety questions! Try asking me about:<br><br>
            • How to detect fresh food<br>
            • Health risks of rotten food<br>
            • Storage recommendations<br>
            • Disease prevention<br>
            • Specific fruits or vegetables<br><br>
            What would you like to know?`;
        }
    }
});