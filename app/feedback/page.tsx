"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Send, CheckCircle, Loader2, User } from "lucide-react";
import { feedbackApi, FeedbackQuestion, FeedbackResponse } from "@/lib/api";

export default function FeedbackPage() {
  const [questions, setQuestions] = useState<FeedbackQuestion[]>([]);
  const [answers, setAnswers] = useState<FeedbackResponse[]>([]);
  const [name, setName] = useState("");
  const [language, setLanguage] = useState<"odia" | "english">("odia");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [hoveredStar, setHoveredStar] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      console.log('Fetching questions from API...');
      const data = await feedbackApi.getActiveQuestions();
      console.log('Questions received:', data);
      setQuestions(data);
      setAnswers(data.map((q) => ({ questionId: q.id, rating: 0 })));
      setError(null);
    } catch (error) {
      console.error("Failed to fetch questions:", error);
      setError(error instanceof Error ? error.message : 'Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const handleRatingChange = (questionId: string, rating: number) => {
    setAnswers((prev) =>
      prev.map((a) => (a.questionId === questionId ? { ...a, rating } : a))
    );
  };

  const handleCommentChange = (questionId: string, comment: string) => {
    setAnswers((prev) =>
      prev.map((a) => (a.questionId === questionId ? { ...a, comment } : a))
    );
  };

  const handleSubmit = async () => {
    // Validate name
    if (!name.trim()) {
      alert(
        language === "english"
          ? "Please enter your name before submitting."
          : "ଦାଖଲ କରିବା ପୂର୍ବରୁ ଦୟାକରି ଆପଣଙ୍କର ନାମ ପ୍ରବେଶ କରନ୍ତୁ।"
      );
      return;
    }

    // Filter out unanswered questions (rating = 0)
    const answeredQuestions = answers.filter((a) => a.rating > 0);
    
    console.log('All answers:', answers);
    console.log('Filtered answers:', answeredQuestions);
    
    if (answeredQuestions.length === 0) {
      alert(
        language === "english"
          ? "Please answer at least one question before submitting."
          : "ଦାଖଲ କରିବା ପୂର୍ବରୁ ଅନ୍ତତଃ ଗୋଟିଏ ପ୍ରଶ୍ନର ଉତ୍ତର ଦିଅନ୍ତୁ।"
      );
      return;
    }

    setSubmitting(true);
    try {
      console.log('Submitting data:', { name, responses: answeredQuestions });
      await feedbackApi.submitFeedback({ name: name.trim(), responses: answeredQuestions });
      setSubmitted(true);
    } catch (error) {
      console.error("Failed to submit feedback:", error);
      alert(
        language === "english"
          ? "Failed to submit feedback. Please try again."
          : "ମତାମତ ଦାଖଲ କରିବାରେ ବିଫଳ। ଦୟାକରି ପୁନର୍ବାର ଚେଷ୍ଟା କରନ୍ତୁ।"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const answeredCount = answers.filter((a) => a.rating > 0).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sky-100 to-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader2 className="w-12 h-12 animate-spin text-sky-500 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading questions...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sky-100 to-white p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md bg-white rounded-3xl shadow-xl p-8"
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {language === "english" ? "Error Loading Questions" : "ପ୍ରଶ୍ନ ଲୋଡ୍ କରିବାରେ ତ୍ରୁଟି"}
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => {
              setLoading(true);
              setError(null);
              fetchQuestions();
            }}
            className="px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-500 text-white font-semibold rounded-full hover:shadow-lg transition-all"
          >
            {language === "english" ? "Try Again" : "ପୁନର୍ବାର ଚେଷ୍ଟା କରନ୍ତୁ"}
          </button>
          <p className="text-sm text-gray-500 mt-4">
          </p>
        </motion.div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-6" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-4xl font-bold text-gray-800 mb-4"
          >
            {language === "english" ? "Thank You!" : "ଧନ୍ୟବାଦ!"}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-lg text-gray-600 mb-2"
          >
            {language === "english"
              ? `Thank you, ${name}!`
              : `ଧନ୍ୟବାଦ, ${name}!`}
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="text-lg text-gray-600 mb-8"
          >
            {language === "english"
              ? "Your feedback has been submitted successfully."
              : "ଆପଣଙ୍କର ମତାମତ ସଫଳତାର ସହିତ ଦାଖଲ ହୋଇଛି।"}
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex gap-2 justify-center"
          >
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, rotate: -180 }}
                animate={{ opacity: 1, rotate: 0 }}
                transition={{ delay: 1 + i * 0.1 }}
              >
                <Star className="w-8 h-8 fill-yellow-400 text-yellow-400" />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 to-white relative overflow-hidden pb-32">
      {/* Rotating watermark circle */}
      <img
        src="/images/circle.png"
        alt="Decorative Circle"
        className="absolute -top-32 -right-36 w-[300px] h-[300px] md:w-[450px] md:h-[400px] opacity-20 pointer-events-none animate-spin-slow"
      />

      {/* Header */}
      <header className="w-full py-4 relative z-10">
        <div className="w-full px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-3 md:gap-4" style={{ alignItems: "center" }}>
            <img
              src="/images/logo.png"
              alt="Logo"
              className="h-20 w-20 md:h-28 md:w-28 lg:h-32 lg:w-32 object-contain flex-shrink-0"
            />
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl font-semibold text-center md:text-left" style={{ color: "#0ea5e9" }}>
              Matsya Pranee Samavesh Odisha 2026
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto px-4 py-8 relative z-10"
      >
        {/* Title Section */}
        <div className="text-center mb-8">
          <motion.h2
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-bold text-gray-800 mb-3"
          >
            {language === "english" ? "Your Feedback Matters" : "ଆପଣଙ୍କର ମତାମତ ଗୁରୁତ୍ୱପୂର୍ଣ୍ଣ"}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-600 mb-4"
          >
            {language === "english"
              ? "Help us improve by sharing your experience"
              : "ଆପଣଙ୍କର ଅନୁଭବ ଶେୟାର କରି ଆମକୁ ଉନ୍ନତ କରିବାରେ ସାହାଯ୍ୟ କରନ୍ତୁ"}
          </motion.p>

          {/* Language Toggle */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="inline-flex rounded-full bg-white shadow-lg p-1 border-2 border-sky-200 mb-4"
          >
            <button
              onClick={() => setLanguage("odia")}
              className={`px-6 py-2 z-50 rounded-full text-sm font-medium transition-all ${
                language === "odia"
                  ? "bg-gradient-to-r from-sky-500 to-blue-500 text-white shadow-md"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              ଓଡ଼ିଆ
            </button>
            <button
              onClick={() => setLanguage("english")}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                language === "english"
                  ? "bg-gradient-to-r from-sky-500 to-blue-500 text-white shadow-md"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              English
            </button>
          </motion.div>

          {/* Progress Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-full shadow-md p-3 inline-block"
          >
            <p className="text-sm font-semibold text-gray-700">
              {language === "english" 
                ? `Answered: ${answeredCount} / ${questions.length}`
                : `ଉତ୍ତର ଦିଆଯାଇଛି: ${answeredCount} / ${questions.length}`
              }
            </p>
          </motion.div>
        </div>

        {/* Name Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 border-2 border-sky-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-r from-sky-500 to-blue-500 rounded-full">
                <User className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-800">
                {language === "english" ? "Your Name" : "ଆପଣଙ୍କର ନାମ"}
              </h3>
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={
                language === "english"
                  ? "Enter your name *"
                  : "ଆପଣଙ୍କର ନାମ ପ୍ରବେଶ କରନ୍ତୁ *"
              }
              className="w-full px-5 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition-all outline-none"
              required
            />
            <p className="text-sm text-gray-500 mt-2">
              {language === "english" 
                ? "* Required field" 
                : "* ଆବଶ୍ୟକ କ୍ଷେତ୍ର"}
            </p>
          </div>
        </motion.div>

        {/* Questions */}
        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {questions.map((question, index) => {
              const answer = answers.find((a) => a.questionId === question.id);
              const currentRating = answer?.rating || 0;
              const hovered = hoveredStar[question.id] || 0;
              const isAnswered = currentRating > 0;

              return (
                <motion.div
                  key={question.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-white rounded-3xl shadow-xl p-6 md:p-8 border-2 transition-all ${
                    isAnswered ? "border-green-300" : "border-sky-100"
                  }`}
                >
                  {/* Question */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="inline-block px-4 py-1 bg-gradient-to-r from-sky-500 to-blue-500 text-white text-sm font-semibold rounded-full">
                        {language === "english" ? `Question ${index + 1}` : `ପ୍ରଶ୍ନ ${index + 1}`}
                      </span>
                      {isAnswered && (
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      )}
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
                      {language === "english" ? question.questionEnglish : question.questionOdia}
                    </h3>
                  </div>

                  {/* Star Rating */}
                  <div className="mb-6">
                    <div className="flex gap-2 mb-2 flex-wrap justify-center md:justify-start">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const isActive = star <= (hovered || currentRating);
                        return (
                          <motion.button
                            key={star}
                            whileHover={{ scale: 1.2, rotate: 10 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleRatingChange(question.id, star)}
                            onDoubleClick={() => handleRatingChange(question.id, 0)}
                            onMouseEnter={() =>
                              setHoveredStar({ ...hoveredStar, [question.id]: star })
                            }
                            onMouseLeave={() =>
                              setHoveredStar({ ...hoveredStar, [question.id]: 0 })
                            }
                            className="focus:outline-none"
                          >
                            <Star
                              className={`w-10 h-10 md:w-12 md:h-12 transition-all duration-200 ${
                                isActive
                                  ? "fill-yellow-400 text-yellow-400 drop-shadow-lg"
                                  : "text-gray-300"
                              }`}
                            />
                          </motion.button>
                        );
                      })}
                    </div>
                    <p className="text-sm text-gray-500">
                      {currentRating > 0 ? (
                        <span className="font-semibold text-sky-600">
                          {currentRating === 5
                            ? language === "english"
                              ? "Excellent! ⭐"
                              : "ଉତ୍କୃଷ୍ଟ! ⭐"
                            : currentRating === 4
                            ? language === "english"
                              ? "Good 👍"
                              : "ଭଲ 👍"
                            : currentRating === 3
                            ? language === "english"
                              ? "Average 👌"
                              : "ମଧ୍ୟମ 👌"
                            : currentRating === 2
                            ? language === "english"
                              ? "Below Average 😐"
                              : "ମଧ୍ୟମ ତଳେ 😐"
                            : language === "english"
                            ? "Poor 😞"
                            : "ଖରାପ 😞"}
                        </span>
                      ) : (
                        <span className="text-gray-400 font-medium">
                          {language === "english" ? "Optional - Rate if you'd like" : "ଐଚ୍ଛିକ - ଇଚ୍ଛା କଲେ ମୂଲ୍ୟାଙ୍କନ କରନ୍ତୁ"}
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {language === "english" ? "Double click to clear response" : "ପ୍ରତିକ୍ରିୟା ସଫା କରିବାକୁ ଦୁଇଥର କ୍ଲିକ୍ କରନ୍ତୁ"}
                    </p>
                  </div>

                  {/* Comment (Optional) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === "english" ? "Additional Comments (Optional)" : "ଅତିରିକ୍ତ ମନ୍ତବ୍ୟ (ଐଚ୍ଛିକ)"}
                    </label>
                    <textarea
                      value={answer?.comment || ""}
                      onChange={(e) => handleCommentChange(question.id, e.target.value)}
                      placeholder={
                        language === "english"
                          ? "Share your thoughts..."
                          : "ଆପଣଙ୍କର ଚିନ୍ତାଧାରା ଶେୟାର କରନ୍ତୁ..."
                      }
                      rows={3}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition-all outline-none resize-none"
                    />
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Submit Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSubmit}
            disabled={submitting}
            className="px-12 py-4 text-lg font-bold rounded-full shadow-2xl transition-all bg-gradient-to-r from-sky-500 to-blue-500 text-white hover:shadow-sky-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin inline mr-2" />
                {language === "english" ? "Submitting..." : "ଦାଖଲ କରାଯାଉଛି..."}
              </>
            ) : (
              <>
                <Send className="w-6 h-6 inline mr-2" />
                {language === "english" ? "Submit Feedback" : "ମତାମତ ଦାଖଲ କରନ୍ତୁ"}
              </>
            )}
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Fish & Cow Illustration */}
      <img
        src="/images/fish-cow.png"
        alt="Fish & Cow Illustration"
        className="absolute bottom-0 right-4 md:right-6 w-[110px] md:w-[220px] lg:w-[260px] xl:w-[300px] pointer-events-none z-10"
      />

      {/* Grass Footer */}
      <div className="absolute bottom-0 left-0 w-full z-0 pointer-events-none">
        <div
          className="w-full h-[100px] md:h-[140px] bg-repeat-x"
          style={{
            backgroundImage: "url('/images/grass.png')",
            backgroundSize: "contain",
          }}
        />
      </div>
    </div>
  );
}