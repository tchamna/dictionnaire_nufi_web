import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">About Afri-Poly</h1>
      
      <div className="max-w-3xl mx-auto">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Our Mission</CardTitle>
            <CardDescription>Connecting people through language</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Afri-Poly is dedicated to promoting and preserving the rich linguistic diversity of Africa. 
              Our platform aims to make African languages more accessible to learners, researchers, and 
              enthusiasts around the world.
            </p>
            <p>
              By providing a comprehensive resource for multiple African languages, we hope to foster 
              greater understanding and appreciation of Africa&apos;s cultural heritage and facilitate 
              communication across language barriers.
            </p>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Our Approach</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                We believe in a practical, user-friendly approach to language learning. Our platform 
                focuses on everyday phrases, common vocabulary, and cultural context to help users 
                gain functional knowledge of African languages.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Our Vision</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                We envision a world where African languages are celebrated, preserved, and widely 
                spoken. Through technology and education, we aim to contribute to the revitalization 
                of indigenous languages and promote multilingualism.
              </p>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Languages</CardTitle>
            <CardDescription>Currently supported languages on our platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-4 bg-muted rounded-md">
                <h3 className="font-medium mb-1">Swahili</h3>
                <p className="text-sm text-muted-foreground">East Africa</p>
              </div>
              <div className="p-4 bg-muted rounded-md">
                <h3 className="font-medium mb-1">Yoruba</h3>
                <p className="text-sm text-muted-foreground">West Africa</p>
              </div>
              <div className="p-4 bg-muted rounded-md">
                <h3 className="font-medium mb-1">Zulu</h3>
                <p className="text-sm text-muted-foreground">Southern Africa</p>
              </div>
              <div className="p-4 bg-muted rounded-md">
                <h3 className="font-medium mb-1">Hausa</h3>
                <p className="text-sm text-muted-foreground">West Africa</p>
              </div>
              <div className="p-4 bg-muted rounded-md">
                <h3 className="font-medium mb-1">Amharic</h3>
                <p className="text-sm text-muted-foreground">East Africa</p>
              </div>
              <div className="p-4 bg-muted rounded-md">
                <h3 className="font-medium mb-1">Igbo</h3>
                <p className="text-sm text-muted-foreground">West Africa</p>
              </div>
              <div className="p-4 bg-muted rounded-md">
                <h3 className="font-medium mb-1">Xhosa</h3>
                <p className="text-sm text-muted-foreground">Southern Africa</p>
              </div>
              <div className="p-4 bg-muted rounded-md">
                <h3 className="font-medium mb-1">Somali</h3>
                <p className="text-sm text-muted-foreground">East Africa</p>
              </div>
              <div className="p-4 bg-muted rounded-md">
                <h3 className="font-medium mb-1">Twi</h3>
                <p className="text-sm text-muted-foreground">West Africa</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
