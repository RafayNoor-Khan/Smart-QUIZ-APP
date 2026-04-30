'use client';

export default function ResultsCard({ attempt, quiz }) {
  const getGrade = (percentage) => {
    if (percentage >= 90) return { grade: 'A', color: 'text-green-600', bg: 'bg-green-100' };
    if (percentage >= 80) return { grade: 'B', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (percentage >= 70) return { grade: 'C', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { grade: 'F', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const gradeInfo = getGrade(attempt.percentage);

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">🎉 Quiz Completed!</h1>
        <p className="text-gray-600 text-lg mb-6">{quiz.topic}</p>

        <div className={`inline-block ${gradeInfo.bg} px-8 py-4 rounded-lg mb-6`}>
          <div className={`text-6xl font-bold ${gradeInfo.color}`}>
            {gradeInfo.grade}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-8">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-gray-600 text-sm">Score</p>
            <p className="text-2xl font-bold text-blue-600">{attempt.score}/{quiz.questions.length}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-gray-600 text-sm">Percentage</p>
            <p className="text-2xl font-bold text-green-600">{attempt.percentage}%</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <p className="text-gray-600 text-sm">Correct Answers</p>
            <p className="text-2xl font-bold text-purple-600">{attempt.score} out of {quiz.questions.length}</p>
          </div>
        </div>
      </div>

      <div className="border-t pt-6 mt-6">
        <a href="/dashboard" className="w-full block text-center bg-blue-600 text-white py-3 rounded font-semibold hover:bg-blue-700">
          Back to Dashboard
        </a>
      </div>
    </div>
  );
}