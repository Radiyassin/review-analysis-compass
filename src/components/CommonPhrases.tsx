
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';

const CommonPhrases = () => {
  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-green-600" />
          Common Phrases
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul id="phraseList" className="space-y-2">
          <li className="text-gray-600">Analysis will populate common phrases here...</li>
        </ul>
      </CardContent>
    </Card>
  );
};

export default CommonPhrases;
