document.addEventListener('DOMContentLoaded', () => {
    const gameState = {
        alreadyPlayed: null,
        device: 'a', // 'a' = Aparelho Auditivo, 'i' = Implante Coclear
        name: '',
        avatarList: [],
        avatarIndex: 0
    };

    let precisaDeQuiz = false;
    let currentPartIndex = 0; // Índice da pergunta/peça atual no Nível 1

    // Configuração com coordenadas (top, left) para colocar o apontador vermelho na foto
    const level1Data = {
        a: {
            diagramImg: 'img/Aparelho auditivo.png',
            fallbackImg: 'img/aparelho auditivo (1)_3.png',
            questions: [
                {
                    partName: 'Molde auricular',
                    pointerTop: '80%',   // Ajuste este valor (altura na imagem)
                    pointerLeft: '20%',  // Ajuste este valor (largura na imagem)
                    options: ['Molde auricular', 'Compartimento de Bateria', 'Tubo', 'Microfone']
                },
                {
                    partName: 'Tubo',
                    pointerTop: '40%',   // Ajuste este valor
                    pointerLeft: '30%',  // Ajuste este valor
                    options: ['Tubo', 'Molde auricular', 'Bateria', 'Imã']
                },
                {
                    partName: 'Compartimento de Bateria',
                    pointerTop: '75%',   // Ajuste este valor
                    pointerLeft: '70%',  // Ajuste este valor
                    options: ['Compartimento de Bateria', 'Processador de Som', 'Tubo', 'Cabo']
                }
            ]
        },
        i: {
            diagramImg: 'img/Implante coclear.png',
            fallbackImg: 'img/implante coclear (1)_3.png',
            questions: [
                {
                    partName: 'Imã',
                    pointerTop: '20%',   // Ajuste este valor
                    pointerLeft: '45%',  // Ajuste este valor
                    options: ['Imã', 'Bateria', 'Tubo', 'Molde auricular']
                },
                {
                    partName: 'Cabo',
                    pointerTop: '45%',   // Ajuste este valor
                    pointerLeft: '20%',  // Ajuste este valor
                    options: ['Cabo', 'Processador de Som', 'Imã', 'Alto-falante']
                },
                {
                    partName: 'Processador de Som',
                    pointerTop: '60%',   // Ajuste este valor
                    pointerLeft: '65%',  // Ajuste este valor
                    options: ['Processador de Som', 'Bateria', 'Cabo', 'Molde auricular']
                },
                {
                    partName: 'Bateria',
                    pointerTop: '80%',   // Ajuste este valor
                    pointerLeft: '65%',  // Ajuste este valor
                    options: ['Bateria', 'Imã', 'Tubo', 'Cabo']
                }
            ]
        }
    };

    // Elementos do DOM
    const screenWelcome = document.getElementById('screen-welcome');
    const screenDevice = document.getElementById('screen-device');
    const screenName = document.getElementById('screen-name');
    const screenAvatar = document.getElementById('screen-avatar');
    const screenLevels = document.getElementById('screen-levels');
    
    const screenQuiz1 = document.getElementById('screen-quiz-1');
    const screenQuiz2 = document.getElementById('screen-quiz-2');
    const screenQuiz3 = document.getElementById('screen-quiz-3');

    const screenLevel1Parts = document.getElementById('screen-level1-parts');
    const screenLevel1Storage = document.getElementById('screen-level1-storage');
    const screenLevel1Rain = document.getElementById('screen-level1-rain');

    const headerPlayerName = document.getElementById('header-player-name');
    const headerAvatarImg = document.getElementById('header-avatar-img');

    const btnWelcomeYes = document.getElementById('btn-welcome-yes');
    const btnWelcomeNo = document.getElementById('btn-welcome-no');
    const deviceOptions = document.querySelectorAll('.device-option');
    const inputPlayerName = document.getElementById('player-name');
    const btnNameNext = document.getElementById('btn-name-next');
    const currentAvatarImg = document.getElementById('current-avatar-img');
    const avatarPrev = document.getElementById('avatar-prev');
    const avatarNext = document.getElementById('avatar-next');
    const btnAvatarNext = document.getElementById('btn-avatar-next');

    function changeScreen(fromScreen, toScreen) {
        if (fromScreen) fromScreen.classList.remove('active');
        if (toScreen) toScreen.classList.add('active');
    }

    function hideAllScreens() {
        document.querySelectorAll('.game-screen').forEach(s => s.classList.remove('active'));
    }

    function goToLevelsScreen() {
        headerPlayerName.textContent = gameState.name || 'Jogador';
        if (gameState.avatarList.length > 0) {
            const finalAvatar = gameState.avatarList[gameState.avatarIndex];
            headerAvatarImg.src = `img/${finalAvatar.filename}`;
        }
        headerAvatarImg.onerror = function() { this.src = "img/avatar.png"; };
    }

    // --- Seleção de Boas-Vindas ---
    btnWelcomeYes.addEventListener('click', () => {
        precisaDeQuiz = false;
        gameState.alreadyPlayed = true;
        changeScreen(screenWelcome, screenDevice);
    });

    btnWelcomeNo.addEventListener('click', () => {
        precisaDeQuiz = true;
        gameState.alreadyPlayed = false;
        changeScreen(screenWelcome, screenDevice);
    });

    // --- Seleção do Dispositivo ---
    deviceOptions.forEach(option => {
        option.addEventListener('click', () => {
            deviceOptions.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            gameState.device = option.getAttribute('data-device'); // 'a' ou 'i'
            
            setTimeout(() => {
                changeScreen(screenDevice, screenName);
            }, 250);
        });
    });

    // --- Digitar Nome ---
    inputPlayerName.addEventListener('input', (e) => {
        btnNameNext.disabled = e.target.value.trim().length === 0;
    });

    btnNameNext.addEventListener('click', () => {
        gameState.name = inputPlayerName.value.trim();
        generateAvatarList();
        updateAvatarDisplay();
        changeScreen(screenName, screenAvatar);
    });

    function generateAvatarList() {
        gameState.avatarList = [];
        const dev = gameState.device;
        for (let i = 0; i <= 5; i++) gameState.avatarList.push({ filename: `menino${i}${dev}.png` });
        for (let i = 0; i <= 5; i++) gameState.avatarList.push({ filename: `menina${i}${dev}.png` });
        gameState.avatarIndex = 0;
    }

    function updateAvatarDisplay() {
        if (gameState.avatarList.length === 0) return;
        currentAvatarImg.src = `img/${gameState.avatarList[gameState.avatarIndex].filename}`;
        currentAvatarImg.onerror = function() { this.src = "img/avatar.png"; };
    }

    avatarPrev.addEventListener('click', () => {
        gameState.avatarIndex = (gameState.avatarIndex - 1 + gameState.avatarList.length) % gameState.avatarList.length;
        updateAvatarDisplay();
    });

    avatarNext.addEventListener('click', () => {
        gameState.avatarIndex = (gameState.avatarIndex + 1) % gameState.avatarList.length;
        updateAvatarDisplay();
    });

    btnAvatarNext.addEventListener('click', () => {
        goToLevelsScreen();
        if (precisaDeQuiz) {
            changeScreen(screenAvatar, screenQuiz1);
        } else {
            changeScreen(screenAvatar, screenLevels);
        }
    });

    // --- Navegação do Quiz Inicial ---
    window.nextQuiz = function(currentStep) {
        if (currentStep === 1) changeScreen(screenQuiz1, screenQuiz2);
        else if (currentStep === 2) changeScreen(screenQuiz2, screenQuiz3);
    };

    window.finishQuiz = function() {
        goToLevelsScreen();
        changeScreen(screenQuiz3, screenLevels);
    };

    // --- LÓGICA DO NÍVEL 1 (APONTADOR DE PEÇA E ESCOLHA DO NOME) ---
    window.startLevel = function(levelNumber) {
        if (levelNumber === 1) {
            currentPartIndex = 0;
            startLevel1Question();
        }
    };

    function startLevel1Question() {
        hideAllScreens();

        const data = level1Data[gameState.device] || level1Data['a'];
        const currentQuestion = data.questions[currentPartIndex];

        const diagramImg = document.getElementById('level1-diagram-img');
        const pointer = document.getElementById('part-pointer');
        const buttonsContainer = document.getElementById('level1-parts-buttons');

        diagramImg.src = data.diagramImg;
        diagramImg.onerror = function() {
            this.src = data.fallbackImg;
        };

        pointer.style.top = currentQuestion.pointerTop;
        pointer.style.left = currentQuestion.pointerLeft;

        buttonsContainer.innerHTML = '';

        const shuffledOptions = [...currentQuestion.options].sort(() => Math.random() - 0.5);

        shuffledOptions.forEach(optionText => {
            const btn = document.createElement('button');
            btn.className = 'btn-quiz';
            btn.textContent = optionText;

            btn.addEventListener('click', () => {
                if (optionText === currentQuestion.partName) {
                    // Acertou: fica verde
                    btn.classList.add('correct-answer');
                    
                    setTimeout(() => {
                        currentPartIndex++;
                        if (currentPartIndex < data.questions.length) {
                            startLevel1Question();
                        } else {
                            changeScreen(screenLevel1Parts, screenLevel1Storage);
                        }
                    }, 600); // Aguarda o feedback visual verde antes de avançar
                } else {
                    // Errou: fica vermelho e depois volta ao normal
                    btn.classList.add('wrong-answer');
                    setTimeout(() => {
                        btn.classList.remove('wrong-answer');
                    }, 600);
                }
            });

            buttonsContainer.appendChild(btn);
        });

        screenLevel1Parts.classList.add('active');
    }

 // --- ETAPA 2: ONDE GUARDAR O APARELHO ---
window.selectStorage = function(btnElement, isCorrect) {
    // Remove qualquer classe de acerto/erro anterior de todas as opções
    const allCards = document.querySelectorAll('.storage-card');
    allCards.forEach(card => card.classList.remove('correct-answer', 'wrong-answer'));

    if (isCorrect) {
        // Marca o botão clicado em verde
        btnElement.classList.add('correct-answer');
        
        // Aguarda 1.2 segundos para mostrar o verde e passa para a Etapa 3 (Chuva)
        setTimeout(() => {
            btnElement.classList.remove('correct-answer');
            changeScreen(screenLevel1Storage, screenLevel1Rain);
        }, 1200);
    } else {
        // Marca o botão clicado em vermelho
        btnElement.classList.add('wrong-answer');
        
        // Remove o vermelho após 1 segundo para permitir tentar novamente
        setTimeout(() => {
            btnElement.classList.remove('wrong-answer');
        }, 1000);
    }
};

// --- ETAPA 3: PROTEÇÃO CONTRA A CHUVA ---
window.selectRainProtection = function(btnElement, isCorrect) {
    // Remove qualquer classe de acerto/erro anterior de todas as opções
    const allCards = document.querySelectorAll('.rain-card');
    allCards.forEach(card => card.classList.remove('correct-answer', 'wrong-answer'));

    if (isCorrect) {
        // Marca o botão clicado em verde
        btnElement.classList.add('correct-answer');
        
        // Aguarda 1.2 segundos para mostrar o verde e volta para a tela do mapa
        setTimeout(() => {
            btnElement.classList.remove('correct-answer');
            goToLevelsScreen();
            changeScreen(screenLevel1Rain, screenLevels);
        }, 1200);
    } else {
        // Marca o botão clicado em vermelho
        btnElement.classList.add('wrong-answer');
        
        // Remove o vermelho após 1 segundo para permitir tentar novamente
        setTimeout(() => {
            btnElement.classList.remove('wrong-answer');
        }, 1000);
    }
};
});