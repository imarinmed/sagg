"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button, Chip } from "@heroui/react";
import { 
  Brain, 
  Trophy, 
  ArrowRight, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  HelpCircle,
  Sparkles,
  BookOpen,
  Network
} from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { api, MythosElement, MythosConnection } from "@/lib/api";
import Link from "next/link";
import "@/styles/mythos-atmosphere.css";

// ============================================
// TYPES
// ============================================

type Difficulty = "easy" | "medium" | "hard";
type GameState = "start" | "playing" | "results";
type QuestionType = "category" | "trait" | "ability" | "connection" | "description";

interface Question {
  id: string;
  type: QuestionType;
  text: string;
  answers: string[];
  correctAnswer: string;
  explanation?: string;
}

interface QuizConfig {
  questionCount: number;
  types: QuestionType[];
}

const DIFFICULTY_CONFIG: Record<Difficulty, QuizConfig> = {
  easy: {
    questionCount: 5,
    types: ["category", "description"]
  },
  medium: {
    questionCount: 10,
    types: ["category", "description", "trait", "ability"]
  },
  hard: {
    questionCount: 15,
    types: ["category", "description", "trait", "ability", "connection"]
  }
};

// ============================================
// UTILS
// ============================================

function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

function getRandomItems<T>(array: T[], count: number, exclude?: T): T[] {
  const filtered = exclude ? array.filter(item => item !== exclude) : array;
  return shuffleArray(filtered).slice(0, count);
}

// ============================================
// COMPONENT
// ============================================

export default function MythosQuizPage() {
  // Data State
  const [elements, setElements] = useState<MythosElement[]>([]);
  const [connections, setConnections] = useState<MythosConnection[]>([]);
  const [loading, setLoading] = useState(true);

  // Game State
  const [gameState, setGameState] = useState<GameState>("start");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);

  // Load Data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [elementsData, connectionsData] = await Promise.all([
          api.mythos.list(),
          api.mythos.connections()
        ]);
        setElements(elementsData);
        setConnections(connectionsData);
      } catch (err) {
        console.error("Failed to load quiz data", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Question Generators
  const generateQuestions = useCallback(() => {
    if (elements.length === 0) return;

    const config = DIFFICULTY_CONFIG[difficulty];
    const newQuestions: Question[] = [];
    const usedElementIds = new Set<string>();

    // Helper to get random element not recently used
    const getRandomElement = () => {
      const available = elements.filter(e => !usedElementIds.has(e.id));
      if (available.length === 0) return elements[Math.floor(Math.random() * elements.length)];
      const el = available[Math.floor(Math.random() * available.length)];
      usedElementIds.add(el.id);
      return el;
    };

    for (let i = 0; i < config.questionCount; i++) {
      const type = config.types[Math.floor(Math.random() * config.types.length)];
      let question: Question | null = null;

      // Try to generate a valid question of the selected type
      let attempts = 0;
      while (!question && attempts < 5) {
        attempts++;
        const target = getRandomElement();

        switch (type) {
          case "category":
            if (target.category) {
              const allCategories = Array.from(new Set(elements.map(e => e.category).filter(Boolean)));
              const wrong = getRandomItems(allCategories, 3, target.category);
              question = {
                id: `q-${i}`,
                type,
                text: `Which category does "${target.name}" belong to?`,
                correctAnswer: target.category,
                answers: shuffleArray([target.category, ...wrong]),
                explanation: `${target.name} is classified as ${target.category}.`
              };
            }
            break;

          case "description":
            if (target.short_description || target.description) {
              const desc = target.short_description || target.description?.slice(0, 100) + "...";
              if (desc) {
                const wrong = getRandomItems(elements.map(e => e.name), 3, target.name);
                question = {
                  id: `q-${i}`,
                  type,
                  text: `Which element matches this description: "${desc}"?`,
                  correctAnswer: target.name,
                  answers: shuffleArray([target.name, ...wrong]),
                  explanation: `This describes ${target.name}.`
                };
              }
            }
            break;

          case "trait":
            if (target.traits && target.traits.length > 0) {
              const trait = target.traits[0];
              const allTraits = Array.from(new Set(elements.flatMap(e => e.traits || [])));
              const wrong = getRandomItems(allTraits, 3, trait);
              question = {
                id: `q-${i}`,
                type,
                text: `Which trait is associated with "${target.name}"?`,
                correctAnswer: trait,
                answers: shuffleArray([trait, ...wrong]),
                explanation: `${target.name} is known for being ${trait}.`
              };
            }
            break;

          case "ability":
            if (target.abilities && target.abilities.length > 0) {
              const ability = target.abilities[0];
              const allAbilities = Array.from(new Set(elements.flatMap(e => e.abilities || [])));
              const wrong = getRandomItems(allAbilities, 3, ability);
              question = {
                id: `q-${i}`,
                type,
                text: `What ability does "${target.name}" possess?`,
                correctAnswer: ability,
                answers: shuffleArray([ability, ...wrong]),
                explanation: `${target.name} has the power of ${ability}.`
              };
            }
            break;

          case "connection":
            const targetConnections = connections.filter(c => c.from_element_id === target.id);
            if (targetConnections.length > 0) {
              const conn = targetConnections[0];
              const connectedEl = elements.find(e => e.id === conn.to_element_id);
              if (connectedEl) {
                const wrong = getRandomItems(elements.map(e => e.name), 3, connectedEl.name);
                question = {
                  id: `q-${i}`,
                  type,
                  text: `Which element is ${conn.connection_type} to "${target.name}"?`,
                  correctAnswer: connectedEl.name,
                  answers: shuffleArray([connectedEl.name, ...wrong]),
                  explanation: `${connectedEl.name} is ${conn.connection_type} to ${target.name}.`
                };
              }
            }
            break;
        }
      }

      // Fallback to category if generation failed
      if (!question) {
        const target = getRandomElement();
        const allCategories = Array.from(new Set(elements.map(e => e.category).filter(Boolean)));
        const wrong = getRandomItems(allCategories, 3, target.category);
        question = {
          id: `q-${i}`,
          type: "category",
          text: `Which category does "${target.name}" belong to?`,
          correctAnswer: target.category,
          answers: shuffleArray([target.category, ...wrong]),
          explanation: `${target.name} is classified as ${target.category}.`
        };
      }

      newQuestions.push(question);
    }

    setQuestions(newQuestions);
    setGameState("playing");
    setCurrentIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setIsAnswerCorrect(null);
  }, [elements, connections, difficulty]);

  // Handlers
  const handleAnswer = (answer: string) => {
    if (selectedAnswer) return; // Prevent multiple clicks

    const currentQuestion = questions[currentIndex];
    const correct = answer === currentQuestion.correctAnswer;
    
    setSelectedAnswer(answer);
    setIsAnswerCorrect(correct);
    
    if (correct) {
      setScore(s => s + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswerCorrect(null);
    } else {
      setGameState("results");
    }
  };

  const getRank = () => {
    const percentage = (score / questions.length) * 100;
    if (percentage === 100) return { title: "Elder", color: "text-[var(--color-accent-primary)]", msg: "Perfection. You know the darkness as if you were born in it." };
    if (percentage >= 80) return { title: "Expert", color: "text-[var(--color-accent-secondary)]", msg: "Impressive. Few mortals possess such knowledge." };
    if (percentage >= 60) return { title: "Adept", color: "text-blue-400", msg: "You have studied well, but secrets remain." };
    if (percentage >= 40) return { title: "Initiate", color: "text-yellow-400", msg: "A promising start, but the shadows are deep." };
    return { title: "Novice", color: "text-gray-400", msg: "You are fresh blood. Study the archives." };
  };

  // Loading Screen
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 border-4 border-[var(--color-accent-primary)]/20 rounded-full" />
          <div className="absolute inset-0 border-4 border-[var(--color-accent-primary)] rounded-full border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 pt-24 px-4 animate-fade-in">
      <div className="fog-overlay" aria-hidden="true" />
      
      <div className="max-w-3xl mx-auto">
        <AnimatePresence mode="wait">
          
          {/* START SCREEN */}
          {gameState === "start" && (
            <motion.div
              key="start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <GlassCard className="p-8 md:p-12 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--color-accent-primary)] to-transparent opacity-50" />
                
                <div className="w-20 h-20 mx-auto rounded-full bg-[var(--color-accent-primary)]/10 flex items-center justify-center mb-6 blood-glow">
                  <Brain className="w-10 h-10 text-[var(--color-accent-primary)]" />
                </div>
                
                <h1 className="font-heading text-4xl md:text-5xl text-[var(--color-text-primary)] mb-4 text-glow">
                  Test Your Knowledge
                </h1>
                <p className="text-lg text-[var(--color-text-secondary)] mb-8 max-w-lg mx-auto">
                  Prove your mastery over the vampire mythos. Choose your difficulty and face the trials of the night.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 max-w-2xl mx-auto">
                  {(["easy", "medium", "hard"] as Difficulty[]).map((level) => (
                    <button
                      key={level}
                      onClick={() => setDifficulty(level)}
                      className={`p-4 rounded-xl border transition-all duration-300 ${
                        difficulty === level
                          ? "bg-[var(--color-accent-primary)]/20 border-[var(--color-accent-primary)] shadow-[0_0_15px_rgba(212,175,55,0.2)]"
                          : "bg-[var(--glass-bg)] border-[var(--glass-border)] hover:border-[var(--color-accent-primary)]/50"
                      }`}
                    >
                      <div className="font-heading text-lg capitalize mb-1 text-[var(--color-text-primary)]">
                        {level}
                      </div>
                      <div className="text-xs text-[var(--color-text-muted)]">
                        {DIFFICULTY_CONFIG[level].questionCount} Questions
                      </div>
                    </button>
                  ))}
                </div>

                <Button 
                  size="lg"
                  className="bg-[var(--color-accent-primary)] text-[var(--polar-night)] font-bold px-12 shadow-lg hover:shadow-[var(--color-accent-primary)]/30 transition-shadow"
                  onPress={generateQuestions}
                >
                  Begin Trial
                </Button>
              </GlassCard>
            </motion.div>
          )}

          {/* GAME SCREEN */}
          {gameState === "playing" && questions[currentIndex] && (
            <motion.div
              key="playing"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Chip size="sm" variant="soft" className="bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)] capitalize">
                    {difficulty}
                  </Chip>
                  <span className="text-sm text-[var(--color-text-muted)]">
                    Question {currentIndex + 1} / {questions.length}
                  </span>
                </div>
                <div className="text-sm font-medium text-[var(--color-text-primary)]">
                  Score: {score}
                </div>
              </div>

              <div className="h-1 w-full bg-[var(--glass-border)] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[var(--color-accent-primary)] transition-all duration-300 ease-out"
                  style={{ width: `${((currentIndex) / questions.length) * 100}%` }}
                />
              </div>

              <GlassCard className="p-6 md:p-10 min-h-[400px] flex flex-col justify-center relative">
                <div className="mb-8">
                  <span className="inline-block px-3 py-1 rounded-full bg-[var(--color-surface)] border border-[var(--glass-border)] text-xs font-medium text-[var(--color-text-muted)] mb-4 uppercase tracking-wider">
                    {questions[currentIndex].type}
                  </span>
                  <h2 className="font-heading text-2xl md:text-3xl text-[var(--color-text-primary)] leading-relaxed">
                    {questions[currentIndex].text}
                  </h2>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {questions[currentIndex].answers.map((answer, idx) => {
                    const isSelected = selectedAnswer === answer;
                    const isCorrect = answer === questions[currentIndex].correctAnswer;
                    const showResult = selectedAnswer !== null;

                    let buttonClass = "bg-[var(--glass-bg)] border-[var(--glass-border)] hover:border-[var(--color-accent-primary)]/50 text-[var(--color-text-secondary)]";
                    
                    if (showResult) {
                      if (isCorrect) {
                        buttonClass = "bg-green-500/20 border-green-500 text-green-200";
                      } else if (isSelected && !isCorrect) {
                        buttonClass = "bg-red-500/20 border-red-500 text-red-200";
                      } else {
                        buttonClass = "opacity-50 grayscale";
                      }
                    } else if (isSelected) {
                      buttonClass = "bg-[var(--color-accent-primary)]/20 border-[var(--color-accent-primary)] text-[var(--color-text-primary)]";
                    }

                    return (
                      <motion.button
                        key={idx}
                        whileHover={!showResult ? { scale: 1.01, x: 4 } : {}}
                        whileTap={!showResult ? { scale: 0.99 } : {}}
                        onClick={() => handleAnswer(answer)}
                        disabled={showResult}
                        className={`p-4 rounded-xl border text-left transition-all duration-200 flex items-center justify-between group ${buttonClass}`}
                      >
                        <span className="font-medium">{answer}</span>
                        {showResult && isCorrect && <CheckCircle2 className="w-5 h-5 text-green-400" />}
                        {showResult && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-400" />}
                        {!showResult && <div className="w-2 h-2 rounded-full bg-[var(--color-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Feedback & Next Button */}
                <AnimatePresence>
                  {selectedAnswer && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-8 pt-6 border-t border-[var(--glass-border)] flex items-center justify-between"
                    >
                      <div className="flex-1 mr-4">
                        <p className={`text-sm font-medium mb-1 ${isAnswerCorrect ? "text-green-400" : "text-red-400"}`}>
                          {isAnswerCorrect ? "Correct!" : "Incorrect"}
                        </p>
                        <p className="text-sm text-[var(--color-text-muted)]">
                          {questions[currentIndex].explanation}
                        </p>
                      </div>
                      <Button 
                        className="bg-[var(--color-accent-primary)] text-[var(--polar-night)] font-bold"
                        onPress={handleNext}
                      >
                        <span className="flex items-center gap-2">
                          {currentIndex < questions.length - 1 ? "Next Question" : "Finish Quiz"}
                          <ArrowRight className="w-4 h-4" />
                        </span>
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </GlassCard>
            </motion.div>
          )}

          {/* RESULTS SCREEN */}
          {gameState === "results" && (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <GlassCard className="p-8 md:p-12 max-w-2xl mx-auto relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-accent-primary)]/5 to-transparent pointer-events-none" />
                
                <div className="w-24 h-24 mx-auto rounded-full bg-[var(--color-surface)] border-2 border-[var(--color-accent-primary)] flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(212,175,55,0.2)]">
                  <Trophy className="w-12 h-12 text-[var(--color-accent-primary)]" />
                </div>

                <h2 className="font-heading text-3xl text-[var(--color-text-primary)] mb-2">
                  Trial Complete
                </h2>
                
                <div className="text-6xl font-bold text-[var(--color-text-primary)] mb-2 tracking-tighter">
                  {Math.round((score / questions.length) * 100)}%
                </div>
                
                <div className={`text-xl font-heading mb-6 ${getRank().color}`}>
                  Rank: {getRank().title}
                </div>
                
                <p className="text-[var(--color-text-secondary)] mb-8 max-w-md mx-auto">
                  {getRank().msg}
                </p>

                <div className="grid grid-cols-2 gap-4 mb-8 max-w-sm mx-auto">
                  <div className="p-4 rounded-xl bg-[var(--color-surface)]/50 border border-[var(--glass-border)]">
                    <div className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Correct</div>
                    <div className="text-2xl font-bold text-green-400">{score}</div>
                  </div>
                  <div className="p-4 rounded-xl bg-[var(--color-surface)]/50 border border-[var(--glass-border)]">
                    <div className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Incorrect</div>
                    <div className="text-2xl font-bold text-red-400">{questions.length - score}</div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    variant="outline"
                    onPress={() => setGameState("start")}
                    className="border-[var(--glass-border)] text-[var(--color-text-primary)] hover:bg-[var(--glass-bg)]"
                  >
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4" />
                      Try Again
                    </span>
                  </Button>
                  <Link href="/mythos">
                    <Button 
                      className="bg-[var(--color-accent-primary)] text-[var(--polar-night)] font-bold w-full sm:w-auto"
                    >
                      <span className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        Return to Archives
                      </span>
                    </Button>
                  </Link>
                </div>
              </GlassCard>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
