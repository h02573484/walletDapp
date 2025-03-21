import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { summarizeText, analyzeSentiment } from "@/lib/openai";

export default function TextSummarizer() {
  const [inputText, setInputText] = useState('');
  const [summary, setSummary] = useState('');
  const [sentiment, setSentiment] = useState<{ rating: number; confidence: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSummarize = async () => {
    if (!inputText.trim()) {
      setError('Please enter some text to summarize');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const [summaryResult, sentimentResult] = await Promise.all([
        summarizeText(inputText),
        analyzeSentiment(inputText)
      ]);

      setSummary(summaryResult.summary);
      setSentiment(sentimentResult);
    } catch (err) {
      setError('Failed to generate summary. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6 space-y-4">
      <h2 className="text-2xl font-bold">AI Text Summarizer</h2>
      <div className="space-y-2">
        <label className="block text-sm font-medium">Enter your text:</label>
        <Textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Paste your text here..."
          className="min-h-[200px]"
        />
      </div>

      <Button
        onClick={handleSummarize}
        disabled={isLoading || !inputText.trim()}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating Summary...
          </>
        ) : (
          'Summarize Text'
        )}
      </Button>

      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}

      {summary && (
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Summary:</h3>
            <p className="text-gray-700 dark:text-gray-300">{summary}</p>
          </div>
          
          {sentiment && (
            <div>
              <h3 className="font-medium mb-2">Sentiment Analysis:</h3>
              <div className="flex items-center gap-2">
                <span>Rating: {sentiment.rating}/5</span>
                <span className="text-sm text-gray-500">
                  (Confidence: {Math.round(sentiment.confidence * 100)}%)
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
