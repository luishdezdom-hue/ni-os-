export type Language = 'es-MX' | 'en-US' | 'nah';

const translations: { [lang in Language]: { [key: string]: string } } = {
  'es-MX': {
    // General
    back: 'Regresar',
    level: 'Nivel {level}',
    excellent: '¡Excelente!',
    excellentWork: '¡Excelente Trabajo!',
    correctExclamation: '¡Correcto!',
    almost: '¡Casi!',
    almostThere: '¡Casi lo logras! Necesitas {score}% para pasar.',
    goodTry: '¡Buen intento! Sigue así.',
    ohNo: '¡Oh no!',
    retry: 'Reintentar',
    nextLevel: 'Siguiente Nivel',
    unlockedNextLevel: '¡Has desbloqueado el siguiente nivel!',
    levelCompleted: 'Nivel {level} Completado',
    yourScore: 'Tu Puntuación:',
    backToLevels: 'Volver a los Niveles',
    check: 'Revisar',
    checking: 'Revisando...',
    analyzing: 'Analizando...',
    listenToLetter: 'Escuchar la letra',
    readyToPlay: '¡Listo para Jugar!',
    play: 'Jugar',
    learn: 'Aprender',

    // Language/Character Selection
    chooseYourGuide: 'Elige tu Guía',
    selectACharacter: 'Selecciona un personaje para que te acompañe en tu aventura.',
    charGreeting: '¡Hola, soy {name}!',
    begin: 'Comenzar',

    // Camera/Recognition Mode
    identifyingLetter: 'Identificando la letra...',
    couldNotIdentify: 'No se pudo identificar.',
    tryCentering: 'Intenta centrar la letra y asegúrate de que haya buena luz.',
    itLooksLike: '¡Parece una...',
    showAndRecognize: 'Muestra una letra a la cámara para que la reconozca.',
    findWithCamera: 'Encontrar con Cámara',
    turnOnCamera: 'Encender Cámara',
    turnOffCamera: 'Apagar Cámara',
    
    // Quiz Mode
    findTheLetter: 'Encuentra la letra {letter}',
    correctIsLetter: '¡Correcto! Esa es la letra {letter}.',
    youFoundLetter: 'Encontraste la letra',
    nextLetter: 'Siguiente Letra',
    cameraSaw: 'La cámara vio "{sawLetter}", pero buscamos "{targetLetter}".',
    keepTrying: '¡Sigue intentando!',
    findThisLetter: 'Busca esta letra:',

    // Drawing Mode
    drawingMode: 'Modo Dibujo',
    drawTheLetterYouSee: 'Dibuja la letra que ves a continuación.',
    letterToDraw: 'Letra a dibujar:',
    drawTheLetter: 'Dibuja la letra {letter}',
    clear: 'Limpiar',
    
    // Words Mode
    wordsMode: 'Modo Palabras',
    baseLevel: 'Nivel Básico',
    advancedLevel: 'Nivel Avanzado',
    wordOf: 'Palabra {current} de {total}',
    listenToWord: 'Escuchar la palabra',
    listenToWordSpelled: 'Escuchar la palabra deletreada',
    theCorrectWordWas: 'La palabra correcta era:',

    // Sentences Mode
    sentencesMode: 'Modo Oraciones',
    completeTheSentence: 'Completa la Oración',
    sentenceOf: 'Oración {current} de {total}',
    nextSentence: 'Siguiente Oración',
    viewResults: 'Ver Resultados',
    tryAgain: 'Inténtalo de nuevo.',
    
    // Colors Mode
    colorsMode: 'Modo Colores',
    findTheColor: 'Encuentra el color {color}',
    checkColor: 'Revisar Color',
    nextColor: 'Siguiente Color',
    matchTheColor: 'Une el Color',
    connectTheColor: 'Conecta el color con su nombre.',
    colorOf: 'Color {current} de {total}',

    // Numbers Mode
    numbersMode: 'Modo Números',
    writeTheNumber: 'Escribe el Número',
    addAndSubtract: 'Sumar y Restar',
    multiplyAndDivide: 'Multiplicar y Dividir',
    numberAsWord: 'Escribe el nombre del número:',
    theCorrectNumberWas: 'El número correcto era:',
    problemOf: 'Problema {current} de {total}',
    theCorrectAnswerWas: 'La respuesta correcta era:',
    learnAdditionTitle: 'Aprendiendo a Sumar (+)',
    learnAdditionDesc: 'La suma junta dos o más números para obtener un total. Es como añadir más juguetes a tu colección.',
    addExample1: '5 + 3 = 8',
    addExample2: '10 + 20 = 30',
    learnSubtractionTitle: 'Aprendiendo a Restar (-)',
    learnSubtractionDesc: 'La resta quita un número de otro. Es como si te comieras algunas galletas de un plato.',
    subtractExample1: '8 - 2 = 6',
    subtractExample2: '50 - 10 = 40',
    learnMultiplicationTitle: 'Aprendiendo a Multiplicar (×)',
    learnMultiplicationDesc: 'La multiplicación es sumar un número a sí mismo varias veces. Es una suma rápida.',
    multiplyExample1: '4 × 3 = 12  (es como 4 + 4 + 4)',
    multiplyExample2: '5 × 5 = 25',
    learnDivisionTitle: 'Aprendiendo a Dividir (÷)',
    learnDivisionDesc: 'La división es repartir un número en partes iguales. Como compartir dulces con tus amigos.',
    divideExample1: '10 ÷ 2 = 5  (10 dulces para 2 amigos)',
    divideExample2: '9 ÷ 3 = 3',
  },
  'en-US': {
    // General
    back: 'Back',
    level: 'Level {level}',
    excellent: 'Excellent!',
    excellentWork: 'Excellent Work!',
    correctExclamation: 'Correct!',
    almost: 'Almost!',
    almostThere: 'Almost there! You need {score}% to pass.',
    goodTry: 'Good try! Keep it up.',
    ohNo: 'Oh no!',
    retry: 'Retry',
    nextLevel: 'Next Level',
    unlockedNextLevel: 'You have unlocked the next level!',
    levelCompleted: 'Level {level} Complete',
    yourScore: 'Your Score:',
    backToLevels: 'Back to Levels',
    check: 'Check',
    checking: 'Checking...',
    analyzing: 'Analyzing...',
    listenToLetter: 'Listen to the letter',
    readyToPlay: 'Ready to Play!',
    play: 'Play',
    learn: 'Learn',

    // Language/Character Selection
    chooseYourGuide: 'Choose Your Guide',
    selectACharacter: 'Select a character to join you on your adventure.',
    charGreeting: 'Hi, I\'m {name}!',
    begin: 'Begin',

    // Camera/Recognition Mode
    identifyingLetter: 'Identifying the letter...',
    couldNotIdentify: 'Could not identify.',
    tryCentering: 'Try centering the letter and make sure there is good light.',
    itLooksLike: 'It looks like a...',
    showAndRecognize: 'Show a letter to the camera for it to recognize.',
    findWithCamera: 'Find with Camera',
    turnOnCamera: 'Turn on Camera',
    turnOffCamera: 'Turn off Camera',
    
    // Quiz Mode
    findTheLetter: 'Find the letter {letter}',
    correctIsLetter: 'Correct! That is the letter {letter}.',
    youFoundLetter: 'You found the letter',
    nextLetter: 'Next Letter',
    cameraSaw: 'The camera saw "{sawLetter}", but we are looking for "{targetLetter}".',
    keepTrying: 'Keep trying!',
    findThisLetter: 'Find this letter:',

    // Drawing Mode
    drawingMode: 'Drawing Mode',
    drawTheLetterYouSee: 'Draw the letter you see below.',
    letterToDraw: 'Letter to draw:',
    drawTheLetter: 'Draw the letter {letter}',
    clear: 'Clear',

    // Words Mode
    wordsMode: 'Words Mode',
    baseLevel: 'Base Level',
    advancedLevel: 'Advanced Level',
    wordOf: 'Word {current} of {total}',
    listenToWord: 'Listen to the word',
    listenToWordSpelled: 'Listen to the word spelled out',
    theCorrectWordWas: 'The correct word was:',

    // Sentences Mode
    sentencesMode: 'Sentences Mode',
    completeTheSentence: 'Complete the Sentence',
    sentenceOf: 'Sentence {current} of {total}',
    nextSentence: 'Next Sentence',
    viewResults: 'View Results',
    tryAgain: 'Try again.',
    
    // Colors Mode
    colorsMode: 'Colors Mode',
    findTheColor: 'Find the color {color}',
    checkColor: 'Check Color',
    nextColor: 'Next Color',
    matchTheColor: 'Match the Color',
    connectTheColor: 'Connect the color to its name.',
    colorOf: 'Color {current} of {total}',
    
    // Numbers Mode
    numbersMode: 'Numbers Mode',
    writeTheNumber: 'Write the Number',
    addAndSubtract: 'Add & Subtract',
    multiplyAndDivide: 'Multiply & Divide',
    numberAsWord: 'Write the number\'s name:',
    theCorrectNumberWas: 'The correct number was:',
    problemOf: 'Problem {current} of {total}',
    theCorrectAnswerWas: 'The correct answer was:',
    learnAdditionTitle: 'Learning to Add (+)',
    learnAdditionDesc: 'Addition brings two or more numbers together to make a total. It\'s like adding more toys to your collection.',
    addExample1: '5 + 3 = 8',
    addExample2: '10 + 20 = 30',
    learnSubtractionTitle: 'Learning to Subtract (-)',
    learnSubtractionDesc: 'Subtraction takes one number away from another. It\'s like eating some cookies from a plate.',
    subtractExample1: '8 - 2 = 6',
    subtractExample2: '50 - 10 = 40',
    learnMultiplicationTitle: 'Learning to Multiply (×)',
    learnMultiplicationDesc: 'Multiplication is adding a number to itself many times. It\'s a fast way to add.',
    multiplyExample1: '4 × 3 = 12  (it\'s like 4 + 4 + 4)',
    multiplyExample2: '5 × 5 = 25',
    learnDivisionTitle: 'Learning to Divide (÷)',
    learnDivisionDesc: 'Division is splitting a number into equal parts. Like sharing candy with your friends.',
    divideExample1: '10 ÷ 2 = 5  (10 candies for 2 friends)',
    divideExample2: '9 ÷ 3 = 3',
  },
  'nah': {
    // NOTE: These are simplified translations.
    // General
    back: 'Tlacuepayotl',
    level: 'Nepantla {level}',
    excellent: '¡Qualtzin!',
    excellentWork: '¡Qualtzin Téquitl!',
    correctExclamation: '¡Yuhqui!',
    almost: '¡Achitzin!',
    almostThere: '¡Achitzin! Monequi {score}%',
    goodTry: '¡Qualtzin Tlayecoltica!',
    ohNo: '¡Ayayay!',
    retry: 'Occeppa',
    nextLevel: 'Niman Nepantla',
    unlockedNextLevel: '¡Otontlapo in niman nepantla!',
    levelCompleted: 'Nepantla {level} Otlamic',
    yourScore: 'Mo Tlapoaltz:',
    backToLevels: 'Tlacuepas Nepantla',
    check: 'Tlachia',
    checking: 'Tlachialo...',
    analyzing: 'Tlanemililo...',
    listenToLetter: 'Caquiliztli in letra',
    readyToPlay: '¡Timochihua!',
    play: 'Mahualtîltia',
    learn: 'Momachtia',

    // Language/Character Selection
    chooseYourGuide: 'Tlapejpeni Mo Yakanke',
    selectACharacter: 'Tlapejpeni ce tlamantli.',
    charGreeting: '¡Niltze, nehuatl {name}!',
    begin: 'Pepehua',

    // Camera/Recognition Mode
    identifyingLetter: 'Tlachialo in letra...',
    couldNotIdentify: 'Amo omochiuh.',
    tryCentering: 'Xitlaeco centrar in letra.',
    itLooksLike: '¡Iuhqui...',
    showAndRecognize: 'Xinexti ce letra.',
    findWithCamera: 'Tlatema ica Cámara',
    turnOnCamera: 'Tlatlati Cámara',
    turnOffCamera: 'Tlacehui Cámara',
    
    // Quiz Mode
    findTheLetter: 'Xitemo in letra {letter}',
    correctIsLetter: '¡Yuhqui! Yeh in letra {letter}.',
    youFoundLetter: 'Otontemo in letra',
    nextLetter: 'Niman Letra',
    cameraSaw: 'Cámara oquittac "{sawLetter}", zan nican "{targetLetter}".',
    keepTrying: '¡Ximoyolchihua!',
    findThisLetter: 'Xitemo inin letra:',

    // Drawing Mode
    drawingMode: 'Tlahcuiloa',
    drawTheLetterYouSee: 'Xihcuilo in letra.',
    letterToDraw: 'Letra tlahcuilol:',
    drawTheLetter: 'Xihcuilo in letra {letter}',
    clear: 'Tlapopohua',
    
    // Words Mode
    wordsMode: 'Tlahtolmej',
    baseLevel: 'Nepantla Tlani',
    advancedLevel: 'Nepantla Acopa',
    wordOf: 'Tlahtolli {current} de {total}',
    listenToWord: 'Caquiliztli in tlahtolli',
    listenToWordSpelled: 'Caquiliztli in tlahtolli deletreada',
    theCorrectWordWas: 'In tlahtolli melahuac:',

    // Sentences Mode
    sentencesMode: 'Tlahtolpamitl',
    completeTheSentence: 'Tlayecchiua in Tlahtolpamitl',
    sentenceOf: 'Tlahtolpamitl {current} de {total}',
    nextSentence: 'Niman Tlahtolpamitl',
    viewResults: 'Tlachia Tlamiliztli',
    tryAgain: 'Occeppa xitlaeco.',
    
    // Colors Mode
    colorsMode: 'Tlapalmej',
    findTheColor: 'Xitemo in tlapalli {color}',
    checkColor: 'Tlachia Tlapalli',
    nextColor: 'Niman Tlapalli',
    matchTheColor: 'Tlanamiqui in Tlapalli',
    connectTheColor: 'Xitlazalohua in tlapalli.',
    colorOf: 'Tlapalli {current} de {total}',

    // Numbers Mode
    numbersMode: 'Tlapoalmej',
    writeTheNumber: 'Xihcuilo in Tlapoalli',
    addAndSubtract: 'Tlacepahua huan Tlatlacui',
    multiplyAndDivide: 'Tlamichihua huan Tlaxeloa',
    numberAsWord: 'Xihcuilo itoca in tlapoalli:',
    theCorrectNumberWas: 'In tlapoalli melahuac:',
    problemOf: 'Problema {current} de {total}',
    theCorrectAnswerWas: 'In tlamiliztli melahuac:',
    learnAdditionTitle: 'Momachtia Tlacepahua (+)',
    learnAdditionDesc: 'Tlacepahua quichihua ce. Iuhqui ocachi ahahuil.',
    addExample1: '5 + 3 = 8',
    addExample2: '10 + 20 = 30',
    learnSubtractionTitle: 'Momachtia Tlatlacui (-)',
    learnSubtractionDesc: 'Tlatlacui quiquixtia ce tlapoalli.',
    subtractExample1: '8 - 2 = 6',
    subtractExample2: '50 - 10 = 40',
    learnMultiplicationTitle: 'Momachtia Tlamichihua (×)',
    learnMultiplicationDesc: 'Tlamichihua iuhqui tlacepahua miecpa.',
    multiplyExample1: '4 × 3 = 12',
    multiplyExample2: '5 × 5 = 25',
    learnDivisionTitle: 'Momachtia Tlaxeloa (÷)',
    learnDivisionDesc: 'Tlaxeloa quixeloa ce tlapoalli.',
    divideExample1: '10 ÷ 2 = 5',
    divideExample2: '9 ÷ 3 = 3',
  },
};

export const getTranslation = (language: Language, key: string, replacements?: { [key: string]: string }): string => {
  let translation = translations[language]?.[key] || translations['en-US'][key] || key;

  if (replacements) {
    Object.keys(replacements).forEach(placeholder => {
      translation = translation.replace(`{${placeholder}}`, replacements[placeholder]);
    });
  }

  return translation;
};