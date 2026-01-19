"use client";

import { useState, useEffect } from "react";
import { motion, Reorder } from "framer-motion";
import {
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  GripVertical,
  BarChart3,
  Eye,
  EyeOff,
  Loader2,
  TrendingUp,
  Users,
  MessageSquare,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  feedbackApi,
  FeedbackQuestion,
  FeedbackStatistics,
} from "@/lib/api";

interface QuestionWithStats extends FeedbackQuestion {
  statistics?: {
    totalResponses: number;
    averageRating: string;
    ratings: Array<{
      rating: number;
      count: number;
      percentage: string;
    }>;
  };
}

export default function ManageFeedbackPage() {
  const [questions, setQuestions] = useState<QuestionWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showStatsDialog, setShowStatsDialog] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionWithStats | null>(null);
  const [stats, setStats] = useState<FeedbackStatistics | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [overallStats, setOverallStats] = useState<{
    totalQuestions: number;
    totalResponses: number;
    overallAverage: string;
  } | null>(null);

  // Form states
  const [questionEnglish, setQuestionEnglish] = useState("");
  const [questionOdia, setQuestionOdia] = useState("");

  useEffect(() => {
    fetchQuestions();
    fetchOverallStats();
  }, []);

  const fetchQuestions = async () => {
    try {
      const data = await feedbackApi.getAllQuestions(true);
      setQuestions(data.sort((a, b) => a.order - b.order));
    } catch (error) {
      console.error("Failed to fetch questions:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOverallStats = async () => {
    try {
      const data = await feedbackApi.getAllStatistics();
      setOverallStats({
        totalQuestions: data.totalQuestions,
        totalResponses: data.totalResponses,
        overallAverage: data.overallAverage,
      });
    } catch (error) {
      console.error("Failed to fetch overall stats:", error);
    }
  };

  const handleAddQuestion = async () => {
    if (!questionEnglish || !questionOdia) {
      alert("Please fill in both English and Odia questions");
      return;
    }

    if (submitting) return;
    setSubmitting(true);

    try {
      await feedbackApi.createQuestion({
        questionEnglish,
        questionOdia,
        order: questions.length,
      });
      setShowAddDialog(false);
      setQuestionEnglish("");
      setQuestionOdia("");
      fetchQuestions();
      fetchOverallStats();
    } catch (error) {
      console.error("Failed to add question:", error);
      alert("Failed to add question");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateQuestion = async () => {
    if (!selectedQuestion || !questionEnglish || !questionOdia) {
      alert("Please fill in both English and Odia questions");
      return;
    }

    if (submitting) return;
    setSubmitting(true);

    try {
      await feedbackApi.updateQuestion(selectedQuestion.id, {
        questionEnglish,
        questionOdia,
      });
      setShowEditDialog(false);
      setSelectedQuestion(null);
      setQuestionEnglish("");
      setQuestionOdia("");
      fetchQuestions();
    } catch (error) {
      console.error("Failed to update question:", error);
      alert("Failed to update question");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm("Are you sure you want to delete this question?")) return;

    try {
      await feedbackApi.deleteQuestion(id);
      fetchQuestions();
      fetchOverallStats();
    } catch (error) {
      console.error("Failed to delete question:", error);
      alert("Failed to delete question");
    }
  };

  const handleToggleActive = async (question: QuestionWithStats) => {
    try {
      await feedbackApi.updateQuestion(question.id, {
        isActive: !question.isActive,
      });
      fetchQuestions();
    } catch (error) {
      console.error("Failed to toggle question:", error);
    }
  };

  const handleReorder = async (newOrder: QuestionWithStats[]) => {
    setQuestions(newOrder);

    const orders = newOrder.map((q, index) => ({
      id: q.id,
      order: index,
    }));

    try {
      await feedbackApi.reorderQuestions(orders);
    } catch (error) {
      console.error("Failed to reorder questions:", error);
    }
  };

  const openEditDialog = (question: QuestionWithStats) => {
    setSelectedQuestion(question);
    setQuestionEnglish(question.questionEnglish);
    setQuestionOdia(question.questionOdia);
    setShowEditDialog(true);
  };

  const openStatsDialog = async (question: QuestionWithStats) => {
    setSelectedQuestion(question);
    setShowStatsDialog(true);
    setLoadingStats(true);

    try {
      const data = await feedbackApi.getQuestionStatistics(question.id);
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoadingStats(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <Card className="mb-8 shadow-xl border-0">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
            <CardTitle className="text-3xl font-bold flex items-center gap-3">
              <BarChart3 className="w-8 h-8" />
              Feedback Management
            </CardTitle>
            <CardDescription className="text-blue-100">
              Manage feedback questions and view responses
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Overall Statistics */}
        {overallStats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-500 to-purple-600">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">Total Questions</p>
                    <p className="text-4xl font-bold text-white mt-2">
                      {overallStats.totalQuestions}
                    </p>
                  </div>
                  <div className="p-4 bg-white/20 rounded-full">
                    <BarChart3 className="w-8 h-8 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-gradient-to-br from-green-500 to-emerald-600">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Total Responses</p>
                    <p className="text-4xl font-bold text-white mt-2">
                      {overallStats.totalResponses}
                    </p>
                  </div>
                  <div className="p-4 bg-white/20 rounded-full">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-gradient-to-br from-orange-500 to-red-600">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm font-medium">Overall Average</p>
                    <p className="text-4xl font-bold text-white mt-2">
                      {overallStats.overallAverage} ⭐
                    </p>
                  </div>
                  <div className="p-4 bg-white/20 rounded-full">
                    <TrendingUp className="w-8 h-8 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Add Question Button */}
        <div className="mb-6">
          <Button
            onClick={() => setShowAddDialog(true)}
            size="lg"
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add New Question
          </Button>
        </div>

        {/* Questions List */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>Questions ({questions.length})</CardTitle>
            <CardDescription>Drag to reorder questions</CardDescription>
          </CardHeader>
          <CardContent>
            <Reorder.Group axis="y" values={questions} onReorder={handleReorder}>
              <div className="space-y-4">
                {questions.map((question) => {
                  const hasStats = question.statistics && question.statistics.totalResponses > 0;
                  
                  return (
                    <Reorder.Item key={question.id} value={question}>
                      <motion.div
                        layout
                        className={`p-6 rounded-xl border-2 ${
                          question.isActive
                            ? "bg-white border-blue-200"
                            : "bg-gray-50 border-gray-200"
                        } shadow-md hover:shadow-lg transition-all cursor-move`}
                      >
                        <div className="flex items-start gap-4">
                          <GripVertical className="w-6 h-6 text-gray-400 mt-1 flex-shrink-0" />

                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-3">
                              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                                Order: {question.order + 1}
                              </span>
                              {question.isActive ? (
                                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                                  Active
                                </span>
                              ) : (
                                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
                                  Inactive
                                </span>
                              )}
                            </div>

                            <h3 className="text-lg font-bold text-gray-800 mb-1">
                              {question.questionEnglish}
                            </h3>
                            <p className="text-gray-600 mb-4">
                              {question.questionOdia}
                            </p>

                            {/* Statistics Summary */}
                            {hasStats ? (
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3">
                                  <p className="text-xs text-blue-600 font-medium">Responses</p>
                                  <p className="text-2xl font-bold text-blue-700">
                                    {question.statistics!.totalResponses}
                                  </p>
                                </div>
                                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3">
                                  <p className="text-xs text-yellow-600 font-medium">Avg Rating</p>
                                  <p className="text-2xl font-bold text-yellow-700">
                                    {question.statistics!.averageRating} ⭐
                                  </p>
                                </div>
                                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3">
                                  <p className="text-xs text-green-600 font-medium">5 Stars</p>
                                  <p className="text-2xl font-bold text-green-700">
                                    {question.statistics!.ratings.find(r => r.rating === 5)?.count || 0}
                                  </p>
                                </div>
                                <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-3">
                                  <p className="text-xs text-red-600 font-medium">1 Star</p>
                                  <p className="text-2xl font-bold text-red-700">
                                    {question.statistics!.ratings.find(r => r.rating === 1)?.count || 0}
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <div className="bg-gray-100 rounded-lg p-4 text-center">
                                <p className="text-gray-500 text-sm">No responses yet</p>
                              </div>
                            )}

                            {/* Rating Distribution Bar (Mini) */}
                            {hasStats && (
                              <div className="space-y-1">
                                {question.statistics!.ratings
                                  .slice()
                                  .reverse()
                                  .map((rating) => (
                                    <div key={rating.rating} className="flex items-center gap-2">
                                      <span className="text-xs font-medium text-gray-600 w-8">
                                        {rating.rating}⭐
                                      </span>
                                      <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
                                        <div
                                          className="bg-gradient-to-r from-yellow-400 to-orange-500 h-full flex items-center px-2 text-white text-xs font-semibold transition-all"
                                          style={{ width: `${rating.percentage}%` }}
                                        >
                                          {rating.count > 0 && (
                                            <span className="text-[10px]">{rating.count}</span>
                                          )}
                                        </div>
                                      </div>
                                      <span className="text-xs font-medium text-gray-500 w-12 text-right">
                                        {rating.percentage}%
                                      </span>
                                    </div>
                                  ))}
                              </div>
                            )}
                          </div>

                          <div className="flex gap-2 flex-shrink-0 flex-col md:flex-row">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openStatsDialog(question)}
                              className="whitespace-nowrap"
                            >
                              <MessageSquare className="w-4 h-4 md:mr-2" />
                              <span className="hidden md:inline">Details</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleActive(question)}
                            >
                              {question.isActive ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(question)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteQuestion(question.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    </Reorder.Item>
                  );
                })}
              </div>
            </Reorder.Group>

            {questions.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No questions yet. Add your first question to get started!
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Question Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Question</DialogTitle>
              <DialogDescription>
                Create a new feedback question in both English and Odia
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <Label>Question (English) *</Label>
                <Textarea
                  value={questionEnglish}
                  onChange={(e) => setQuestionEnglish(e.target.value)}
                  placeholder="How would you rate the event organization?"
                  rows={3}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Question (Odia - ଓଡ଼ିଆ) *</Label>
                <Textarea
                  value={questionOdia}
                  onChange={(e) => setQuestionOdia(e.target.value)}
                  placeholder="ଇଭେଣ୍ଟ ସଂଗଠନକୁ ଆପଣ କିପରି ମୂଲ୍ୟାଙ୍କନ କରିବେ?"
                  rows={3}
                  className="mt-2"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleAddQuestion}
                disabled={submitting}
                className="bg-gradient-to-r from-green-600 to-emerald-600"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {submitting ? "Adding..." : "Add Question"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Question Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Question</DialogTitle>
              <DialogDescription>Update the question in both languages</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <Label>Question (English) *</Label>
                <Textarea
                  value={questionEnglish}
                  onChange={(e) => setQuestionEnglish(e.target.value)}
                  rows={3}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Question (Odia - ଓଡ଼ିଆ) *</Label>
                <Textarea
                  value={questionOdia}
                  onChange={(e) => setQuestionOdia(e.target.value)}
                  rows={3}
                  className="mt-2"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleUpdateQuestion}
                disabled={submitting}
                className="bg-gradient-to-r from-blue-600 to-indigo-600"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {submitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Statistics Dialog */}
        <Dialog open={showStatsDialog} onOpenChange={setShowStatsDialog}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Question Statistics - Detailed View</DialogTitle>
              <DialogDescription>
                {selectedQuestion?.questionEnglish}
              </DialogDescription>
            </DialogHeader>

            {loadingStats ? (
              <div className="py-12 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto" />
              </div>
            ) : stats ? (
              <div className="space-y-6 py-4">
                {/* Summary */}
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <p className="text-3xl font-bold text-blue-600">
                          {stats.totalResponses}
                        </p>
                        <p className="text-sm text-gray-600">Total Responses</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <p className="text-3xl font-bold text-green-600">
                          {stats.averageRating} ⭐
                        </p>
                        <p className="text-sm text-gray-600">Average Rating</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Rating Distribution */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-4">Rating Distribution</h4>
                  <div className="space-y-2">
                    {stats.ratings
                      .slice()
                      .reverse()
                      .map((rating) => (
                        <div key={rating.rating} className="flex items-center gap-3">
                          <span className="w-12 text-sm font-medium text-gray-700">
                            {rating.rating} ⭐
                          </span>
                          <div className="flex-1 bg-gray-200 rounded-full h-8 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-yellow-400 to-orange-500 h-full flex items-center px-3 text-white text-sm font-semibold transition-all"
                              style={{ width: `${rating.percentage}%` }}
                            >
                              {rating.count > 0 && `${rating.count} (${rating.percentage}%)`}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Recent Comments */}
                {stats.recentComments.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-4">
                      Recent Comments ({stats.recentComments.length})
                    </h4>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {stats.recentComments.map((comment, index) => (
                        <div
                          key={index}
                          className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-yellow-500 font-semibold">
                                {"⭐".repeat(comment.rating)}
                              </span>
                              <span className="font-semibold text-gray-700">
                                {comment.name}
                              </span>
                            </div>
                            <span className="text-xs text-gray-500">
                              {new Date(comment.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-gray-700 text-sm">{comment.comment}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}