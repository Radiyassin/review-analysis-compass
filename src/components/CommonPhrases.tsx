
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';

interface Phrase {
  phrase: string;
  count: number;
}

const CommonPhrases = () => {
  const [phrases, setPhrases] = useState<Phrase[]>([]);

  useEffect(() => {
    console.log('💬 CommonPhrases component mounted');

    let unsubscribe: (() => void) | null = null;
    
    const initializeDataStore = () => {
      if (typeof window !== 'undefined' && window.dataStore) {
        console.log('💬 CommonPhrases: DataStore found, subscribing');
        
        // Check for existing data
        const existingPhrases = window.dataStore.getData('commonPhrases');
        if (Array.isArray(existingPhrases)) {
          const formattedPhrases = existingPhrases.slice(0, 10).map(([phrase, count]) => ({
            phrase: String(phrase),
            count: Number(count)
          }));
          setPhrases(formattedPhrases);
        }
        
        // Subscribe to changes
        unsubscribe = window.dataStore.subscribe((key: string, value: any) => {
          if (key === 'commonPhrases' && Array.isArray(value)) {
            const formattedPhrases = value.slice(0, 10).map(([phrase, count]) => ({
              phrase: String(phrase),
              count: Number(count)
            }));
            setPhrases(formattedPhrases);
          }
        });
      }
    };

    // Initialize immediately
    initializeDataStore();

    // Listen for analysis completion event
    const handleAnalysisComplete = (event: CustomEvent) => {
      console.log('💬 CommonPhrases: Analysis completed event received');
      if (event.detail && Array.isArray(event.detail.common_phrases)) {
        const formattedPhrases = event.detail.common_phrases.slice(0, 10).map(([phrase, count]: [string, number]) => ({
          phrase: String(phrase),
          count: Number(count)
        }));
        setPhrases(formattedPhrases);
      }
    };

    window.addEventListener('analysisCompleted', handleAnalysisComplete as EventListener);

    // Cleanup function
    return () => {
      console.log('💬 CommonPhrases: Cleaning up');
      if (unsubscribe) {
        unsubscribe();
      }
      window.removeEventListener('analysisCompleted', handleAnalysisComplete as EventListener);
    };
  }, []);

  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-green-600" />
          Common Phrases
        </CardTitle>
      </CardHeader>
      <CardContent>
        {phrases.length > 0 ? (
          <ul className="space-y-2">
            {phrases.map((item, index) => (
              <li key={`${item.phrase}-${index}`} className="text-gray-700">
                {item.phrase} ({item.count})
              </li>
            ))}
          </ul>
        ) : (
          <ul className="space-y-2">
            <li className="text-gray-600">Analysis will populate common phrases here...</li>
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default CommonPhrases;
