document.addEventListener('DOMContentLoaded', () => {
    const gameState = {
        alreadyPlayed: null,
        device: 'a', // 'a' = Aparelho Auditivo, 'i' = Implante Coclear
        name: '',
        avatarList: [],
        avatarIndex: 0,
        maxUnlockedLevel: 4 // Por padrão, todas as fases ficam abertas
    };

    // --- EFEITOS SONOROS E MÚSICA ---
    const musicaFundo = new Audio('audio/soundgallerybydmitrytaras-children-background-555815.mp3');
    musicaFundo.loop = true;
    musicaFundo.volume = 0.2;

    const somAcerto = new Audio('audio/success-chime.mp3');
    somAcerto.volume = 0.4;
    const somErro = new Audio('audio/wrong-buzzer_dudoo.mp3');
    somErro.volume = 0.1;
    const somClique = new Audio('audio/aceeldon-click-button-578399.mp3');

    let musicaAtiva = true;

    function tocarAcerto() {
        somAcerto.currentTime = 0;
        somAcerto.play();
    }

    function tocarErro() {
        somErro.currentTime = 0;
        somErro.play();
    }

    function tocarClique() {
        somClique.currentTime = 0;
        somClique.play();
    }

    window.toggleMusica = function() {
        musicaAtiva = !musicaAtiva;
        if (musicaAtiva) {
            musicaFundo.play();
            document.getElementById('btn-musica').textContent = '🔊';
        } else {
            musicaFundo.pause();
            document.getElementById('btn-musica').textContent = '🔇';
        }
    };

    function mostrarBotaoProximo(feedback, textoBotao, aoClicar) {
        if (!feedback || !feedback.parentElement) return;
        
        const btnExistente = feedback.parentElement.querySelector('.btn-proximo-pergunta');
        if (btnExistente) btnExistente.remove();

        const btn = document.createElement('button');
        btn.className = 'btn-proximo-pergunta';
        btn.textContent = textoBotao;
        btn.addEventListener('click', () => {
            tocarClique();
            btn.remove();
            aoClicar();
        });
        feedback.parentElement.appendChild(btn);
    }

    let precisaDeQuiz = false;
    let currentPartIndex = 0;
    let currentL4Index = 0;

    const level1Data = {
        a: {
            diagramImg: 'img/Aparelho auditivo.png',
            fallbackImg: 'img/aparelho auditivo (1)_3.png',
            questions: [
                {
                    partName: 'Molde auricular',
                    pointerTop: '80%',
                    pointerLeft: '20%',
                    options: ['Molde auricular', 'Compartimento de Bateria', 'Tubo', 'Microfone']
                },
                {
                    partName: 'Tubo',
                    pointerTop: '40%',
                    pointerLeft: '30%',
                    options: ['Tubo', 'Molde auricular', 'Bateria', 'Imã']
                },
                {
                    partName: 'Compartimento de Bateria',
                    pointerTop: '75%',
                    pointerLeft: '70%',
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
                    pointerTop: '20%',
                    pointerLeft: '45%',
                    options: ['Imã', 'Bateria', 'Tubo', 'Molde auricular']
                },
                {
                    partName: 'Cabo',
                    pointerTop: '65%',
                    pointerLeft: '20%',
                    options: ['Cabo', 'Processador de Som', 'Imã', 'Alto-falante']
                },
                {
                    partName: 'Processador de Som',
                    pointerTop: '55%',
                    pointerLeft: '60%',
                    options: ['Processador de Som', 'Bateria', 'Cabo', 'Molde auricular']
                },
                {
                    partName: 'Bateria',
                    pointerTop: '80%',
                    pointerLeft: '60%',
                    options: ['Bateria', 'Imã', 'Tubo', 'Cabo']
                }
            ]
        }
    };

    // Perguntas Focadas em Autoadvocacia no Nível 4
    const level4Questions = [
        {
            title: "O que é autoadvocacia para quem usa aparelho auditivo ou implante?",
            options: [
                { text: "Saber explicar suas necessidades e defender seus direitos para ouvir bem", correct: true, explicacao: "Perfeito! Autoadvocacia é ter voz para garantir que você ouça bem em qualquer lugar!" },
                { text: "Deixar que os outros tomem todas as decisões por você", correct: false, explicacao: "Você é o principal interessado no seu som! É importante você mesmo dizer o que precisa." },
                { text: "Esconder o dispositivo para ninguém notar", correct: false, explicacao: "Seu dispositivo é super legal e te ajuda a ouvir. Não precisa esconder nada!" }
            ]
        },
        {
            title: "Por que o autoconhecimento sobre seu dispositivo é importante?",
            options: [
                { text: "Para saber como ele funciona e conseguir pedir a ajuda certa quando precisar", correct: true, explicacao: "Exatamente! Entender seu aparelho te dá superpoderes para explicar qualquer problema!" },
                { text: "Para poder consertar o aparelho sozinho com ferramentas", correct: false, explicacao: "Consertos mais pesados quem faz é o fonoaudiólogo ou técnico, mas você deve saber o básico!" },
                { text: "Apenas para tirar notas boas na escola", correct: false, explicacao: "Conhecer seu dispositivo serve para a vida toda, na escola, nas brincadeiras e em casa!" }
            ]
        },
        {
            title: "O que significa ter autonomia no dia a dia com seu dispositivo?",
            options: [
                { text: "Aprender a cuidar, guardar e avisar sobre qualquer problema com o aparelho", correct: true, explicacao: "Mandou bem! Cuidar do seu aparelho mostra o quanto você é responsável!" },
                { text: "Usar o dispositivo apenas quando um adulto mandar", correct: false, explicacao: "Quanto mais você cuidar do seu próprio som com autonomia, melhor será seu dia a dia!" },
                { text: "Nunca contar para ninguém se o som estiver ruim", correct: false, explicacao: "Se o som falhar, conte imediatamente! Ficar sem ouvir bem não é legal." }
            ]
        },
        {
            title: "Qual é o objetivo de expressar o que você precisa nos ambientes que frequenta?",
            options: [
                { text: "Garantir que você tenha acesso à informação e participe de tudo em igualdade", correct: true, explicacao: "Excelente! Falar sobre suas necessidades garante que você nunca fique de fora das conversas!" },
                { text: "Fazer com que os outros sintam pena de você", correct: false, explicacao: "Nada de pena! Você é forte e inteligente, só precisa que o ambiente esteja favorável para ouvir." },
                { text: "Evitar fazer as tarefas e atividades do dia a dia", correct: false, explicacao: "O objetivo é justamente conseguir participar de TODAS as atividades com sucesso!" }
            ]
        }
    ];

    // --- ELEMENTOS DO DOM ---
    const screenWelcome = document.getElementById('screen-welcome');
    const screenDevice = document.getElementById('screen-device');
    const screenName = document.getElementById('screen-name');
    const screenAvatar = document.getElementById('screen-avatar');
    const screenLevels = document.getElementById('screen-levels');

    // Quizzes de Cadastro
    const screenQuiz1 = document.getElementById('screen-quiz-1');
    const screenQuiz2 = document.getElementById('screen-quiz-2');
    const screenQuiz3 = document.getElementById('screen-quiz-3');

    // Telas do Nível 1
    const screenLevel1Entry = document.getElementById('screen-level1-entry');
    const screenLevel1Parts = document.getElementById('screen-level1-parts');
    const screenLevel1Storage = document.getElementById('screen-level1-storage');
    const screenLevel1Rain = document.getElementById('screen-level1-rain');

    // Telas do Nível 2
    const screenLevel2Entry = document.getElementById('screen-level2-entry');
    const screenLevel2Speech = document.getElementById('screen-level2-speech');
    const screenLevel2Friend = document.getElementById('screen-level2-friend');
    const screenLevel2Tv = document.getElementById('screen-level2-tv');

    // Telas do Nível 3
    const screenLevel3Entry = document.getElementById('screen-level3-entry');

    // Telas do Nível 4 e Conclusão
    const screenLevel4Entry = document.getElementById('screen-level4-entry');
    const screenLevel4Quiz = document.getElementById('screen-level4-quiz');
    const screenConclusion = document.getElementById('screen-conclusion');

    // Header
    const headerPlayerName = document.getElementById('header-player-name');
    const headerAvatarImg = document.getElementById('header-avatar-img');

    // Botões e Inputs
    const btnWelcomeYes = document.getElementById('btn-welcome-yes');
    const btnWelcomeNo = document.getElementById('btn-welcome-no');
    const deviceOptions = document.querySelectorAll('.device-option');
    const inputPlayerName = document.getElementById('player-name');
    const btnNameNext = document.getElementById('btn-name-next');
    const currentAvatarImg = document.getElementById('current-avatar-img');
    const avatarPrev = document.getElementById('avatar-prev');
    const avatarNext = document.getElementById('avatar-next');
    const btnAvatarNext = document.getElementById('btn-avatar-next');

    // --- FUNÇÕES DE NAVEGAÇÃO DE TELA ---
    function changeScreen(fromScreen, toScreen) {
        if (fromScreen) fromScreen.classList.remove('active');
        if (toScreen) toScreen.classList.add('active');
    }

    function hideAllScreens() {
        document.querySelectorAll('.game-screen').forEach(s => s.classList.remove('active'));
        document.querySelectorAll('.feedback-explicacao').forEach(f => {
            f.textContent = '';
            f.className = 'feedback-explicacao';
        });
    }

    function updateLevelsUI() {
        for (let i = 1; i <= 4; i++) {
            const btn = document.querySelector(`.level-${i}`);
            if (!btn) continue;

            if (i > gameState.maxUnlockedLevel) {
                btn.classList.add('locked');
                btn.innerHTML = `<img src="img/cadeado.png" alt="Bloqueado" class="lock-icon">`;
            } else {
                btn.classList.remove('locked');
                btn.textContent = i;
            }
        }
    }

    function goToLevelsScreen() {
        hideAllScreens();
        headerPlayerName.textContent = gameState.name || 'Jogador';
        if (gameState.avatarList.length > 0) {
            const finalAvatar = gameState.avatarList[gameState.avatarIndex];
            headerAvatarImg.src = `img/${finalAvatar.filename}`;
        }
        headerAvatarImg.onerror = function() { this.src = "img/avatar.png"; };
        
        updateLevelsUI();
        screenLevels.classList.add('active');
    }

    function showConclusionScreen() {
        hideAllScreens();
        if (screenConclusion) screenConclusion.classList.add('active');
    }

    window.backToLevels = function(currentScreenId) {
        tocarClique();
        const currentScreen = document.getElementById(currentScreenId);
        if (currentScreen) currentScreen.classList.remove('active');
        goToLevelsScreen();
    };

    window.voltarNiveisFinal = function() {
        tocarClique();
        goToLevelsScreen();
    };

    // --- FLUXO DE BOAS-VINDAS E CADASTRO ---
    btnWelcomeYes.addEventListener('click', () => {
        tocarClique();
        precisaDeQuiz = false;
        gameState.alreadyPlayed = true;
        gameState.maxUnlockedLevel = 4;
        changeScreen(screenWelcome, screenDevice);
    });

    btnWelcomeNo.addEventListener('click', () => {
        tocarClique();
        precisaDeQuiz = true;
        gameState.alreadyPlayed = false;
        gameState.maxUnlockedLevel = 1;
        changeScreen(screenWelcome, screenDevice);
    });

    deviceOptions.forEach(option => {
        option.addEventListener('click', () => {
            tocarClique();
            deviceOptions.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            gameState.device = option.getAttribute('data-device');

            setTimeout(() => {
                changeScreen(screenDevice, screenName);
            }, 250);
        });
    });

    inputPlayerName.addEventListener('input', (e) => {
        btnNameNext.disabled = e.target.value.trim().length === 0;
    });

    btnNameNext.addEventListener('click', () => {
        tocarClique();
        gameState.name = inputPlayerName.value.trim();
        if (musicaAtiva) musicaFundo.play();
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
        tocarClique();
        gameState.avatarIndex = (gameState.avatarIndex - 1 + gameState.avatarList.length) % gameState.avatarList.length;
        updateAvatarDisplay();
    });

    avatarNext.addEventListener('click', () => {
        tocarClique();
        gameState.avatarIndex = (gameState.avatarIndex + 1) % gameState.avatarList.length;
        updateAvatarDisplay();
    });

    btnAvatarNext.addEventListener('click', () => {
        tocarClique();
        if (precisaDeQuiz) {
            changeScreen(screenAvatar, screenQuiz1);
        } else {
            goToLevelsScreen();
        }
    });

    // --- QUIZ INICIAL DE ADAPTAÇÃO ---
    window.nextQuiz = function(currentStep) {
        tocarClique();
        if (currentStep === 1) changeScreen(screenQuiz1, screenQuiz2);
        else if (currentStep === 2) changeScreen(screenQuiz2, screenQuiz3);
    };

    window.finishQuiz = function() {
        tocarClique();
        goToLevelsScreen();
    };

    // --- SELEÇÃO DE NÍVEIS NO MAPA ---
    window.startLevel = function(levelNumber) {
        if (levelNumber > gameState.maxUnlockedLevel) return;
        tocarClique();

        hideAllScreens();
        if (levelNumber === 1) {
            screenLevel1Entry.classList.add('active');
        } else if (levelNumber === 2) {
            screenLevel2Entry.classList.add('active');
        } else if (levelNumber === 3) {
            screenLevel3Entry.classList.add('active');
        } else if (levelNumber === 4) {
            screenLevel4Entry.classList.add('active');
        }
    };

    // --- NÍVEL 1 ---
    window.goToLevel1Parts = function() {
        tocarClique();
        screenLevel1Entry.classList.remove('active');
        currentPartIndex = 0;
        startLevel1Question();
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
                    tocarAcerto();
                    btn.classList.add('correct-answer');
                    setTimeout(() => {
                        currentPartIndex++;
                        if (currentPartIndex < data.questions.length) {
                            startLevel1Question();
                        } else {
                            changeScreen(screenLevel1Parts, screenLevel1Storage);
                        }
                    }, 600);
                } else {
                    tocarErro();
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

    window.selectStorage = function(btnElement, isCorrect, explicacao) {
        const feedback = document.getElementById("feedback-guardar");
        if (feedback) feedback.textContent = explicacao;
        
        const allCards = document.querySelectorAll('.storage-card');
        allCards.forEach(card => card.classList.remove('correct-answer', 'wrong-answer'));

        if (isCorrect) {
            tocarAcerto();
            btnElement.classList.add('correct-answer');
            if (feedback) feedback.className = "feedback-explicacao certo";
            mostrarBotaoProximo(feedback, 'Próxima pergunta ➜', () => {
                btnElement.classList.remove('correct-answer');
                changeScreen(screenLevel1Storage, screenLevel1Rain);
            });
        } else {
            tocarErro();
            btnElement.classList.add('wrong-answer');
            if (feedback) feedback.className = "feedback-explicacao errado";
            mostrarBotaoProximo(feedback, 'Tentar de novo ↩', () => {
                btnElement.classList.remove('wrong-answer');
                if (feedback) {
                    feedback.textContent = '';
                    feedback.className = 'feedback-explicacao';
                }
            });
        }
    };

    window.selectRainProtection = function(btnElement, isCorrect, explicacao) {
        const feedback = document.getElementById("feedback-proteger");
        if (feedback) feedback.textContent = explicacao;

        const allCards = document.querySelectorAll('.rain-card');
        allCards.forEach(card => card.classList.remove('correct-answer', 'wrong-answer'));

        if (isCorrect) {
            tocarAcerto();
            btnElement.classList.add('correct-answer');
            if (feedback) feedback.className = "feedback-explicacao certo";
            mostrarBotaoProximo(feedback, 'Próxima pergunta ➜', () => {
                btnElement.classList.remove('correct-answer');
                if (gameState.maxUnlockedLevel < 2) {
                    gameState.maxUnlockedLevel = 2;
                }
                goToLevelsScreen();
            });
        } else {
            tocarErro();
            btnElement.classList.add('wrong-answer');
            if (feedback) feedback.className = "feedback-explicacao errado";
            mostrarBotaoProximo(feedback, 'Tentar de novo ↩', () => {
                btnElement.classList.remove('wrong-answer');
                if (feedback) {
                    feedback.textContent = '';
                    feedback.className = 'feedback-explicacao';
                }
            });
        }
    };

    // --- NÍVEL 2 ---
    window.goToLevel2Scenario1 = function() {
        tocarClique();
        changeScreen(screenLevel2Entry, screenLevel2Speech);
    };

    window.selectSpeechOption = function(btnElement, isCorrect, explicacao) {
        const feedback = document.getElementById("feedback-speech");
        if (feedback) feedback.textContent = explicacao;
        
        const allBtns = document.querySelectorAll('#screen-level2-speech .btn-quiz');
        allBtns.forEach(btn => btn.classList.remove('correct-answer', 'wrong-answer'));

        if (isCorrect) {
            tocarAcerto();
            btnElement.classList.add('correct-answer');
            if (feedback) feedback.className = "feedback-explicacao certo";
            mostrarBotaoProximo(feedback, 'Próxima pergunta ➜', () => {
                btnElement.classList.remove('correct-answer');
                changeScreen(screenLevel2Speech, screenLevel2Friend);
            });
        } else {
            tocarErro();
            btnElement.classList.add('wrong-answer');
            if (feedback) feedback.className = "feedback-explicacao errado";
            mostrarBotaoProximo(feedback, 'Tentar de novo ↩', () => {
                btnElement.classList.remove('wrong-answer');
                if (feedback) {
                    feedback.textContent = '';
                    feedback.className = 'feedback-explicacao';
                }
            });
        }
    };

    window.selectFriendOption = function(btnElement, isCorrect, explicacao) {
        const feedback = document.getElementById("feedback-pergunta");
        if (feedback) feedback.textContent = explicacao;

        const allBtns = document.querySelectorAll('#screen-level2-friend .btn-quiz');
        allBtns.forEach(btn => btn.classList.remove('correct-answer', 'wrong-answer'));

        if (isCorrect) {
            tocarAcerto();
            btnElement.classList.add('correct-answer');
            if (feedback) feedback.className = "feedback-explicacao certo";
            mostrarBotaoProximo(feedback, 'Próxima pergunta ➜', () => {
                btnElement.classList.remove('correct-answer');
                changeScreen(screenLevel2Friend, screenLevel2Tv);
            });
        } else {
            tocarErro();
            btnElement.classList.add('wrong-answer');
            if (feedback) feedback.className = "feedback-explicacao errado";
            mostrarBotaoProximo(feedback, 'Tentar de novo ↩', () => {
                btnElement.classList.remove('wrong-answer');
                if (feedback) {
                    feedback.textContent = '';
                    feedback.className = 'feedback-explicacao';
                }
            });
        }
    };

    window.selectTvOption = function(btnElement, isCorrect, explicacao) {
        const feedback = document.getElementById("feedback-tv");
        if (feedback) feedback.textContent = explicacao;

        const allCards = document.querySelectorAll('.tv-card');
        allCards.forEach(card => card.classList.remove('correct-answer', 'wrong-answer'));

        if (isCorrect) {
            tocarAcerto();
            btnElement.classList.add('correct-answer');
            if (feedback) feedback.className = "feedback-explicacao certo";
            mostrarBotaoProximo(feedback, 'Próxima pergunta ➜', () => {
                btnElement.classList.remove('correct-answer');
                if (gameState.maxUnlockedLevel < 3) {
                    gameState.maxUnlockedLevel = 3;
                }
                goToLevelsScreen();
            });
        } else {
            tocarErro();
            btnElement.classList.add('wrong-answer');
            if (feedback) feedback.className = "feedback-explicacao errado";
            mostrarBotaoProximo(feedback, 'Tentar de novo ↩', () => {
                btnElement.classList.remove('wrong-answer');
                if (feedback) {
                    feedback.textContent = '';
                    feedback.className = 'feedback-explicacao';
                }
            });
        }
    };

    // --- NÍVEL 3 ---
    window.goToLevel3Scenario1 = function() {
        tocarClique();
        changeScreen(screenLevel3Entry, document.getElementById('screen-level3-seating'));
    };

    window.selectSeatingOption = function(btnElement, isCorrect, explicacao) {
        const feedback = document.getElementById("feedback-sentar");
        if (feedback) feedback.textContent = explicacao;

        const allBtns = document.querySelectorAll('#screen-level3-seating .btn-quiz');
        allBtns.forEach(btn => btn.classList.remove('correct-answer', 'wrong-answer'));

        if (isCorrect) {
            tocarAcerto();
            btnElement.classList.add('correct-answer');
            if (feedback) feedback.className = "feedback-explicacao certo";
            mostrarBotaoProximo(feedback, 'Próxima pergunta ➜', () => {
                btnElement.classList.remove('correct-answer');
                changeScreen(
                    document.getElementById('screen-level3-seating'),
                    document.getElementById('screen-level3-battery')
                );
            });
        } else {
            tocarErro();
            btnElement.classList.add('wrong-answer');
            if (feedback) feedback.className = "feedback-explicacao errado";
            mostrarBotaoProximo(feedback, 'Tentar de novo ↩', () => {
                btnElement.classList.remove('wrong-answer');
                if (feedback) {
                    feedback.textContent = '';
                    feedback.className = 'feedback-explicacao';
                }
            });
        }
    };

    window.navigateToScene = function(targetScreenId) {
        tocarClique();
        const currentActive = document.querySelector('.game-screen.active');
        const targetScreen = document.getElementById(targetScreenId);
        if (currentActive && targetScreen) {
            changeScreen(currentActive, targetScreen);
        }
    };

    window.handleOptionChoice = function(btnElement, isCorrect, explicacao) {
        const telaAtiva = document.querySelector('.game-screen.active');
        const feedbackId = 'feedback-' + telaAtiva.id.replace('screen-level3-', '');
        const feedback = document.getElementById(feedbackId);
        
        if (feedback) feedback.textContent = explicacao;

        const parent = btnElement.parentElement;
        const allBtns = parent.querySelectorAll('.btn-quiz');
        allBtns.forEach(b => b.classList.remove('correct-answer', 'wrong-answer'));

        if (isCorrect) {
            tocarAcerto();
            btnElement.classList.add('correct-answer');
            if (feedback) feedback.className = "feedback-explicacao certo";
            mostrarBotaoProximo(feedback, 'Próxima pergunta ➜', () => {
                btnElement.classList.remove('correct-answer');
                if (gameState.maxUnlockedLevel < 4) {
                    gameState.maxUnlockedLevel = 4;
                }
                goToLevelsScreen();
            });
        } else {
            tocarErro();
            btnElement.classList.add('wrong-answer');
            if (feedback) feedback.className = "feedback-explicacao errado";
            mostrarBotaoProximo(feedback, 'Tentar de novo ↩', () => {
                btnElement.classList.remove('wrong-answer');
                if (feedback) {
                    feedback.textContent = '';
                    feedback.className = 'feedback-explicacao';
                }
            });
        }
    };

window.proceedToLevel4Content = function() {
    tocarClique();
    currentL4Index = 0;
    showLevel4Question();
};

function showLevel4Question() {
    hideAllScreens();

    // Ativa a tela do quiz do nível 4
    if (screenLevel4Quiz) screenLevel4Quiz.classList.add('active');

    // Validação corrigida para evitar interrupção indevida
    if (typeof level4Questions === 'undefined' || !level4Questions[currentL4Index]) {
        console.error("Pergunta do Nível 4 não encontrada ou array 'level4Questions' não foi definido!");
        return;
    }
    
    const q = level4Questions[currentL4Index];
    const titleElem = document.getElementById('l4-question-title');
    const container = document.getElementById('l4-options-container');

    if (titleElem) titleElem.textContent = q.title;

    if (container) {
        container.innerHTML = '';
        
        let feedback = container.parentElement.querySelector('.feedback-explicacao');
        if (!feedback) {
            feedback = document.createElement('div');
            feedback.className = 'feedback-explicacao';
            container.parentElement.appendChild(feedback);
        }
        feedback.textContent = '';
        feedback.className = 'feedback-explicacao';

        const shuffled = [...q.options].sort(() => Math.random() - 0.5);

        shuffled.forEach(option => {
            const btn = document.createElement('button');
            btn.className = 'btn-quiz l4-btn-option';
            btn.textContent = option.text;

            btn.addEventListener('click', () => {
                const allBtns = container.querySelectorAll('.btn-quiz');
                allBtns.forEach(b => b.classList.remove('correct-answer', 'wrong-answer'));

                if (option.correct) {
                    if (typeof tocarAcerto === 'function') tocarAcerto();
                    btn.classList.add('correct-answer');
                    feedback.textContent = option.explicacao || '';
                    feedback.className = "feedback-explicacao certo";

                    mostrarBotaoProximo(feedback, 'Próxima pergunta ➔', () => {
                        currentL4Index++;
                        if (currentL4Index < level4Questions.length) {
                            showLevel4Question();
                        } else {
                            showConclusionScreen();
                        }
                    });
                } else {
                    if (typeof tocarErro === 'function') tocarErro();
                    btn.classList.add('wrong-answer');
                    feedback.textContent = option.explicacao || '';
                    feedback.className = "feedback-explicacao errado";

                    mostrarBotaoProximo(feedback, 'Tentar de novo ↩', () => {
                        btn.classList.remove('wrong-answer');
                        feedback.textContent = '';
                        feedback.className = 'feedback-explicacao';
                    });
                }
            });

            container.appendChild(btn);
        });
    }

}
});