// services/mathService.ts

export type Operator = '+' | '-' | '×' | '÷';

export interface MathProblem {
  operand1: number;
  operand2: number;
  operator: Operator;
  answer: number;
}

const getRandomNumber = (minDigits: number, maxDigits: number): number => {
  const min = 10 ** (minDigits - 1);
  const max = (10 ** maxDigits) - 1;
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const generateProblem = (level: number, operationType: 'add-subtract' | 'multiply-divide'): MathProblem => {
  let operand1: number, operand2: number;

  if (operationType === 'add-subtract') {
    const operator: '+' | '-' = Math.random() < 0.5 ? '+' : '-';
    switch (level) {
      case 1: // 1-digit numbers
        operand1 = getRandomNumber(1, 1);
        operand2 = getRandomNumber(1, 1);
        break;
      case 2: // 2-digit numbers
        operand1 = getRandomNumber(2, 2);
        operand2 = getRandomNumber(1, 2);
        break;
      case 3: // 3-digit numbers
        operand1 = getRandomNumber(3, 3);
        operand2 = getRandomNumber(2, 3);
        break;
      case 4: // 4+ digit numbers
      default:
        operand1 = getRandomNumber(4, 4);
        operand2 = getRandomNumber(3, 4);
        break;
    }

    if (operator === '-' && operand1 < operand2) {
      // Swap to avoid negative results
      [operand1, operand2] = [operand2, operand1];
    }
    
    const answer = operator === '+' ? operand1 + operand2 : operand1 - operand2;
    return { operand1, operand2, operator, answer };

  } else { // multiply-divide
    const operator: '×' | '÷' = Math.random() < 0.5 ? '×' : '÷';

    if (operator === '×') {
       switch (level) {
        case 1:
          operand1 = getRandomNumber(1, 1);
          operand2 = getRandomNumber(1, 1);
          break;
        case 2:
          operand1 = getRandomNumber(2, 2);
          operand2 = getRandomNumber(1, 1);
          break;
        case 3:
          operand1 = getRandomNumber(3, 3);
          operand2 = getRandomNumber(1, 2);
          break;
        case 4:
        default:
          operand1 = getRandomNumber(3, 4);
          operand2 = getRandomNumber(2, 2);
          break;
      }
      return { operand1, operand2, operator, answer: operand1 * operand2 };
    } else { // Division
      // To ensure integer results, we generate the answer and one operand first
      let divisor, quotient;
      switch (level) {
        case 1:
          divisor = getRandomNumber(1, 1); // e.g., 2-9
          quotient = getRandomNumber(1, 1); // e.g., 2-9
          break;
        case 2:
          divisor = getRandomNumber(1, 1); // e.g., 2-9
          quotient = getRandomNumber(1, 2); // e.g., 5-50
          break;
        case 3:
          divisor = getRandomNumber(1, 2); // e.g., 5-15
          quotient = getRandomNumber(2, 2); // e.g., 20-80
          break;
        case 4:
        default:
          divisor = getRandomNumber(2, 2); // e.g., 10-99
          quotient = getRandomNumber(2, 3); // e.g., 10-150
          break;
      }
      operand1 = divisor * quotient;
      operand2 = divisor;
      // Ensure operand2 is not 1 to make it a bit more interesting, if possible without infinite loop
      if(operand2 === 1 && level > 1) {
          operand2 = Math.floor(Math.random() * 8) + 2; // 2-9
          operand1 = operand2 * quotient;
      }
      return { operand1, operand2, operator: '÷', answer: quotient };
    }
  }
};

export const getProblemsForLevel = (level: number, operationType: 'add-subtract' | 'multiply-divide', count: number): MathProblem[] => {
  const problems: MathProblem[] = [];
  // Use a Set to prevent duplicate problems in a single session
  const problemSet = new Set<string>();

  while (problems.length < count) {
    const newProblem = generateProblem(level, operationType);
    const problemKey = `${newProblem.operand1}${newProblem.operator}${newProblem.operand2}`;
    
    if (!problemSet.has(problemKey)) {
      problemSet.add(problemKey);
      problems.push(newProblem);
    }
  }
  return problems;
};