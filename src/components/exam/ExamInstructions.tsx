
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, FileText, Monitor, AlertTriangle } from "lucide-react";

interface ExamInstructionsProps {
  onStartExam: () => void;
}

export const ExamInstructions: React.FC<ExamInstructionsProps> = ({ onStartExam }) => {
  const [acknowledged, setAcknowledged] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            FRCR Part 2B Examination
          </h1>
          <p className="text-lg text-gray-600">
            Rapid Reporting Session - Instructions
          </p>
        </div>

        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-800">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Important Notice
            </CardTitle>
          </CardHeader>
          <CardContent className="text-blue-700">
            <p>
              This is a simulation of the FRCR Part 2B examination. Please read all instructions 
              carefully before proceeding. Once you start, you will have <strong>6 minutes per case</strong> 
              to provide your rapid reporting answers.
            </p>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="mr-2 h-5 w-5 text-blue-600" />
                Examination Format
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h4 className="font-semibold">Duration:</h4>
                <p className="text-gray-600">6 minutes per case</p>
              </div>
              <div>
                <h4 className="font-semibold">Number of Cases:</h4>
                <p className="text-gray-600">30 cases in total</p>
              </div>
              <div>
                <h4 className="font-semibold">Total Time:</h4>
                <p className="text-gray-600">3 hours (180 minutes)</p>
              </div>
              <div>
                <h4 className="font-semibold">Format:</h4>
                <p className="text-gray-600">Rapid reporting with standardized questions</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5 text-green-600" />
                Question Format
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h4 className="font-semibold">Standard Question:</h4>
                <p className="text-gray-600 italic">
                  "Please provide a short report on the imaging findings"
                </p>
              </div>
              <div>
                <h4 className="font-semibold">Expected Response:</h4>
                <p className="text-gray-600">
                  Concise, structured radiology report identifying key findings
                </p>
              </div>
              <div>
                <h4 className="font-semibold">Assessment:</h4>
                <p className="text-gray-600">
                  Accuracy, completeness, and clinical relevance
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Monitor className="mr-2 h-5 w-5 text-purple-600" />
              Technical Instructions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">DICOM Image Viewing:</h4>
              <ul className="list-disc pl-6 space-y-1 text-gray-600">
                <li>Use mouse wheel or scroll to navigate through image slices</li>
                <li>Left-click and drag to adjust window/level settings</li>
                <li>Right-click for additional viewing tools</li>
                <li>Use keyboard shortcuts for efficient navigation</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Answer Submission:</h4>
              <ul className="list-disc pl-6 space-y-1 text-gray-600">
                <li>Type your report in the provided text area</li>
                <li>Submit your answer before the 6-minute timer expires</li>
                <li>You cannot return to previous cases once submitted</li>
                <li>Ensure your answer is complete before submitting</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8 border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-amber-800">Examination Rules</CardTitle>
          </CardHeader>
          <CardContent className="text-amber-700 space-y-2">
            <ul className="list-disc pl-6 space-y-1">
              <li>You have exactly 6 minutes per case - manage your time carefully</li>
              <li>Once you submit an answer, you cannot go back to that case</li>
              <li>If time expires, your current answer will be automatically submitted</li>
              <li>The examination will automatically progress through all 30 cases</li>
              <li>No breaks are permitted during the examination</li>
              <li>Ensure you have a stable internet connection before starting</li>
            </ul>
          </CardContent>
        </Card>

        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <input
              type="checkbox"
              id="acknowledge"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <label htmlFor="acknowledge" className="text-gray-700">
              I have read and understood the examination instructions
            </label>
          </div>
          
          <Button
            onClick={onStartExam}
            disabled={!acknowledged}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
          >
            Start FRCR Part 2B Examination
          </Button>
          
          <p className="text-sm text-gray-500 mt-4">
            Once you click "Start Examination", the timer will begin and you cannot pause the exam.
          </p>
        </div>
      </div>
    </div>
  );
};
