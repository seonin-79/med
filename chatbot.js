(function() {
    const chatMessages = document.getElementById('chatMessages');
    const messageInput = document.getElementById('messageInput');
    const micButton = document.getElementById('micButton');
    const sendButton = document.getElementById('sendButton');

    // 스크롤을 맨 아래로 이동
    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // 사용자 메시지 추가
    function addUserMessage(text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message user';
        
        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';
        bubble.textContent = text;
        
        messageDiv.appendChild(bubble);
        chatMessages.appendChild(messageDiv);
        scrollToBottom();
    }

    // 타이핑 인디케이터 추가
    function addTypingIndicator() {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message bot';
        messageDiv.id = 'typingIndicator';
        
        const indicator = document.createElement('div');
        indicator.className = 'typing-indicator';
        
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('div');
            dot.className = 'typing-dot';
            indicator.appendChild(dot);
        }
        
        messageDiv.appendChild(indicator);
        chatMessages.appendChild(messageDiv);
        scrollToBottom();
    }

    // 타이핑 인디케이터 제거
    function removeTypingIndicator() {
        const indicator = document.getElementById('typingIndicator');
        if (indicator) {
            indicator.remove();
        }
    }

    // 봇 메시지 추가
    function addBotMessage(text) {
        removeTypingIndicator();
        
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message bot';
        
        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';
        bubble.textContent = text;
        
        messageDiv.appendChild(bubble);
        chatMessages.appendChild(messageDiv);
        scrollToBottom();
    }

    // 간단한 챗봇 응답 생성
    function getBotResponse(userMessage) {
        const message = userMessage.toLowerCase().trim();
        
        // 인사말
        if (message.includes('안녕') || message.includes('hello') || message.includes('hi')) {
            return '안녕하세요! 약을먹자 챗봇입니다. 무엇을 도와드릴까요?';
        }
        
        // 약 관련 질문
        if (message.includes('약') || message.includes('복용') || message.includes('먹어')) {
            if (message.includes('언제') || message.includes('시간')) {
                return '복약 시간은 처방전에 따라 다릅니다. 복약 내역 페이지에서 확인하실 수 있습니다.';
            }
            if (message.includes('어떻게') || message.includes('방법')) {
                return '약은 식후 30분에 복용하는 것이 일반적입니다. 의사나 약사의 지시사항을 따르시기 바랍니다.';
            }
            return '약에 대해 궁금한 점이 있으시면 구체적으로 질문해주세요.';
        }
        
        // 부작용 관련
        if (message.includes('부작용') || message.includes('증상') || message.includes('아픔')) {
            return '약물 부작용이 발생하면 즉시 복용을 중단하고 의사나 약사에게 상담하시기 바랍니다.';
        }
        
        // 검색 관련
        if (message.includes('검색') || message.includes('찾아')) {
            return '약 검색은 메인 화면의 검색 버튼을 통해 할 수 있습니다.';
        }
        
        // 기본 응답
        const responses = [
            '죄송합니다. 더 구체적으로 질문해주시면 도와드리겠습니다.',
            '약 복용, 복약 내역, 약 검색 등에 대해 질문해주세요.',
            '약을먹자 앱의 기능에 대해 궁금한 점이 있으시면 언제든 물어보세요!'
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    // 메시지 전송 처리
    function sendMessage() {
        const message = messageInput.value.trim();
        if (!message) return;

        // 사용자 메시지 추가
        addUserMessage(message);
        messageInput.value = '';

        // 타이핑 인디케이터 표시
        addTypingIndicator();

        // 봇 응답 시뮬레이션 (1-2초 후)
        setTimeout(() => {
            const botResponse = getBotResponse(message);
            addBotMessage(botResponse);
        }, 1000 + Math.random() * 1000);
    }

    // 입력창 엔터 키 처리
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // 전송 버튼 클릭 처리 함수
    function handleSendButton(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        sendMessage();
        return false;
    }

    // 전송 버튼 이벤트 (모바일/데스크톱 모두 지원)
    sendButton.addEventListener('click', handleSendButton, { passive: false });
    sendButton.addEventListener('touchend', handleSendButton, { passive: false });
    sendButton.addEventListener('touchstart', (e) => {
        // touchstart에서도 처리하여 더 빠른 반응
        e.preventDefault();
    }, { passive: false });

    // 음성 인식 기능
    let recognition = null;
    let isListening = false;

    // Web Speech API 지원 확인 및 초기화
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.lang = 'ko-KR';
        recognition.continuous = false;
        recognition.interimResults = true; // 실시간 결과 표시

        recognition.onresult = (event) => {
            let interimTranscript = '';
            let finalTranscript = '';

            // 실시간 결과와 최종 결과 분리
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                } else {
                    interimTranscript += transcript;
                }
            }

            // 실시간으로 입력 필드 업데이트
            if (finalTranscript) {
                messageInput.value = finalTranscript;
                isListening = false;
                micButton.classList.remove('listening');
            } else if (interimTranscript) {
                messageInput.value = interimTranscript;
            }
        };

        recognition.onerror = (event) => {
            console.error('음성 인식 오류:', event.error);
            isListening = false;
            micButton.classList.remove('listening');
            if (event.error === 'not-allowed') {
                alert('마이크 권한이 필요합니다. 브라우저 설정에서 마이크 권한을 허용해주세요.');
            }
        };

        recognition.onend = () => {
            isListening = false;
            micButton.classList.remove('listening');
        };
    }

    // 마이크 버튼 클릭
    micButton.addEventListener('click', () => {
        if (!recognition) {
            alert('이 브라우저는 음성 인식을 지원하지 않습니다.');
            return;
        }

        if (isListening) {
            // 이미 듣고 있으면 중지
            recognition.stop();
            isListening = false;
            micButton.classList.remove('listening');
        } else {
            // 음성 인식 시작
            try {
                recognition.start();
                isListening = true;
                micButton.classList.add('listening');
            } catch (error) {
                console.error('음성 인식 시작 오류:', error);
                isListening = false;
                micButton.classList.remove('listening');
            }
        }
    });

    // 초기 환영 메시지
    window.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            addTypingIndicator();
            setTimeout(() => {
                addBotMessage('안녕하세요! 약을먹자 챗봇입니다. 약 복용, 복약 내역 등에 대해 질문해주세요.');
            }, 1000);
        }, 500);
    });
})();

