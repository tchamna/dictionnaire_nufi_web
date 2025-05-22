'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Volume2, Play } from 'lucide-react';
import { getAudioFilename, hasAudio, audioMapping } from '@/data/audioMapping';

export default function AudioDemoPage() {
  const [word, setWord] = useState('bà');
  const [audioUrl, setAudioUrl] = useState('');
  const [status, setStatus] = useState('');
  const [audioFiles, setAudioFiles] = useState<string[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Function to test direct audio playback
  const testDirectAudio = async () => {
    try {
      setStatus('Testing direct audio playback...');
      
      // Check if we have audio for this word
      if (!hasAudio(word)) {
        setStatus(`No audio mapping found for "${word}"`);
        return;
      }
      
      // Get the audio filename
      const audioFilename = getAudioFilename(word);
      if (!audioFilename) {
        setStatus(`No audio filename found for "${word}"`);
        return;
      }
      
      // Construct the S3 URL
      const region = process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1';
      const bucket = process.env.NEXT_PUBLIC_S3_BUCKET_NAME || 'dictionnaire-nufi-audio';
      const url = `https://${bucket}.s3.${region}.amazonaws.com/${audioFilename}.mp3`;
      
      setAudioUrl(url);
      setStatus(`Audio URL: ${url}`);
      
      // Try to play the audio
      if (audioRef.current) {
        audioRef.current.src = url;
        try {
          await audioRef.current.play();
          setStatus(`Playing audio from ${url}`);
        } catch (error) {
          setStatus(`Error playing audio: ${error}`);
        }
      }
    } catch (error) {
      setStatus(`Error: ${error}`);
    }
  };

  // Function to list available audio files
  const listAudioFiles = () => {
    const files = Object.entries(audioMapping)
      .filter(([key]) => key.toLowerCase().includes(word.toLowerCase()))
      .map(([key, value]) => `${key} -> ${value}.mp3`);
    
    setAudioFiles(files);
    setStatus(`Found ${files.length} audio files matching "${word}"`);
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Audio Demo Page</h1>
      <p className="mb-4">This page demonstrates different ways to play audio files from the S3 bucket.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Test Direct Audio Playback</CardTitle>
            <CardDescription>Play audio directly from S3</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Input 
                  value={word} 
                  onChange={(e) => setWord(e.target.value)} 
                  placeholder="Enter a word (e.g., bà, mbà)"
                />
                <Button onClick={testDirectAudio}>
                  <Play className="h-4 w-4 mr-2" />
                  Play
                </Button>
              </div>
              
              <div className="text-sm">
                <p>Status: {status}</p>
                {audioUrl && (
                  <div className="mt-2">
                    <p>Audio URL: <a href={audioUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{audioUrl}</a></p>
                    <audio ref={audioRef} controls className="mt-2 w-full">
                      <source src={audioUrl} type="audio/mpeg" />
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Find Audio Files</CardTitle>
            <CardDescription>Search for audio files in our mapping</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Input 
                  value={word} 
                  onChange={(e) => setWord(e.target.value)} 
                  placeholder="Enter a search term"
                />
                <Button onClick={listAudioFiles}>
                  <Volume2 className="h-4 w-4 mr-2" />
                  Find
                </Button>
              </div>
              
              {audioFiles.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-medium mb-2">Found {audioFiles.length} audio files:</h3>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    {audioFiles.map((file, index) => (
                      <li key={index}>{file}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Troubleshooting</CardTitle>
          <CardDescription>Common issues and solutions</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>CORS Error</strong>: If you see a CORS error in the console, the S3 bucket needs to be configured to allow cross-origin requests.</li>
            <li><strong>Access Denied</strong>: If you see an access denied error, the S3 bucket or specific files might not be publicly accessible.</li>
            <li><strong>File Not Found</strong>: If you see a 404 error, the audio file might not exist in the bucket or the path might be incorrect.</li>
            <li><strong>Audio Format</strong>: If the browser can't play the audio, the file might be in an unsupported format.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
