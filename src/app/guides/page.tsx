'use client';

import { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function GuidesPage() {
  const { selectedLanguages } = useLanguage();
  const [activeTab, setActiveTab] = useState('pronunciation');

  // Mock data for language guides
  const guides = {
    pronunciation: [
      {
        language: 'swahili',
        name: 'Swahili',
        rules: [
          {
            title: 'Vowels',
            content: 'Swahili has five vowels: a, e, i, o, u. They are pronounced similarly to Spanish vowels. Each vowel is pronounced distinctly and clearly.'
          },
          {
            title: 'Consonants',
            content: 'Most consonants are pronounced as in English. Notable exceptions include "j" which is pronounced like the "j" in "jam", and "g" which is always hard as in "get".'
          },
          {
            title: 'Stress',
            content: 'In Swahili, stress typically falls on the penultimate (second-to-last) syllable of a word.'
          }
        ],
        examples: [
          { word: 'jambo', pronunciation: 'JAHM-boh', meaning: 'hello' },
          { word: 'habari', pronunciation: 'hah-BAH-ree', meaning: 'news/how are you' },
          { word: 'asante', pronunciation: 'ah-SAHN-teh', meaning: 'thank you' }
        ]
      },
      {
        language: 'yoruba',
        name: 'Yoruba',
        rules: [
          {
            title: 'Tones',
            content: 'Yoruba is a tonal language with three tones: high (´), mid (unmarked), and low (`). The tone can change the meaning of a word.'
          },
          {
            title: 'Vowels',
            content: 'Yoruba has seven oral vowels (a, e, ẹ, i, o, ọ, u) and five nasal vowels (an, ẹn, in, ọn, un).'
          },
          {
            title: 'Consonants',
            content: 'Yoruba has 18 consonants, including some that don\'t exist in English, like "gb" which is pronounced as a single sound.'
          }
        ],
        examples: [
          { word: 'báwo ni', pronunciation: 'BAH-woh nee', meaning: 'hello/how are you' },
          { word: 'ẹ ṣeun', pronunciation: 'eh sheh-OON', meaning: 'thank you' },
          { word: 'jọwọ', pronunciation: 'joh-WOH', meaning: 'please' }
        ]
      },
      {
        language: 'zulu',
        name: 'Zulu',
        rules: [
          {
            title: 'Clicks',
            content: 'Zulu has three main click consonants, represented by c, q, and x. The "c" click is dental (tongue against teeth), "q" is alveolar (tongue against ridge), and "x" is lateral (tongue against side teeth).'
          },
          {
            title: 'Vowels',
            content: 'Zulu has five vowels: a, e, i, o, u. They are pronounced clearly and distinctly.'
          },
          {
            title: 'Tone',
            content: 'Zulu is a tonal language, with high and low tones that can change the meaning of words.'
          }
        ],
        examples: [
          { word: 'sawubona', pronunciation: 'sah-woo-BOH-nah', meaning: 'hello' },
          { word: 'ngiyabonga', pronunciation: 'n-gee-yah-BOHN-gah', meaning: 'thank you' },
          { word: 'uxolo', pronunciation: 'oo-XOH-loh', meaning: 'excuse me/sorry' }
        ]
      }
    ],
    grammar: [
      {
        language: 'swahili',
        name: 'Swahili',
        rules: [
          {
            title: 'Noun Classes',
            content: 'Swahili has a system of noun classes (similar to grammatical gender). There are about 18 noun classes, with different prefixes for singular and plural forms.'
          },
          {
            title: 'Subject-Verb Agreement',
            content: 'Verbs must agree with the subject\'s noun class. This is shown through prefixes attached to the verb.'
          },
          {
            title: 'Tense Markers',
            content: 'Tense is indicated by prefixes in the verb. For example, "na" indicates present tense, "li" past tense, and "ta" future tense.'
          }
        ],
        examples: [
          { sentence: 'Ninasoma kitabu', translation: 'I am reading a book', explanation: '"Nina" = I + present tense, "soma" = read, "kitabu" = book' },
          { sentence: 'Tulienda sokoni', translation: 'We went to the market', explanation: '"Tuli" = we + past tense, "enda" = go, "sokoni" = to the market' },
          { sentence: 'Watoto wanacheza', translation: 'The children are playing', explanation: '"Watoto" = children, "wana" = they + present tense, "cheza" = play' }
        ]
      },
      {
        language: 'yoruba',
        name: 'Yoruba',
        rules: [
          {
            title: 'Subject-Verb-Object',
            content: 'Yoruba follows a subject-verb-object (SVO) word order, similar to English.'
          },
          {
            title: 'Tense and Aspect',
            content: 'Yoruba does not mark tense on verbs. Instead, it uses particles and auxiliaries to indicate time.'
          },
          {
            title: 'Pronouns',
            content: 'Yoruba pronouns do not distinguish gender (he/she) but do distinguish between singular and plural.'
          }
        ],
        examples: [
          { sentence: 'Mo n lọ si ile', translation: 'I am going home', explanation: '"Mo" = I, "n" = present continuous marker, "lọ" = go, "si ile" = to home' },
          { sentence: 'O ti jẹun', translation: 'You have eaten', explanation: '"O" = you, "ti" = perfect aspect marker, "jẹun" = eat food' },
          { sentence: 'Wọn yoo wa', translation: 'They will come', explanation: '"Wọn" = they, "yoo" = future marker, "wa" = come' }
        ]
      },
      {
        language: 'zulu',
        name: 'Zulu',
        rules: [
          {
            title: 'Noun Classes',
            content: 'Zulu has a system of noun classes (about 17) that determine agreement patterns throughout the sentence.'
          },
          {
            title: 'Agglutination',
            content: 'Zulu is an agglutinative language, meaning words are formed by adding prefixes and suffixes to roots.'
          },
          {
            title: 'Concords',
            content: 'Adjectives, verbs, and other parts of speech must agree with the noun class through concords (agreement markers).'
          }
        ],
        examples: [
          { sentence: 'Ngiyakhuluma isiZulu', translation: 'I speak Zulu', explanation: '"Ngi" = I, "ya" = present tense marker, "khuluma" = speak, "isiZulu" = Zulu language' },
          { sentence: 'Abantu bahamba', translation: 'The people are walking', explanation: '"Abantu" = people (class 2), "ba" = subject concord for class 2, "hamba" = walk' },
          { sentence: 'Izinja ziyagijima', translation: 'The dogs are running', explanation: '"Izinja" = dogs (class 10), "zi" = subject concord for class 10, "ya" = present tense, "gijima" = run' }
        ]
      }
    ],
    vocabulary: [
      {
        language: 'swahili',
        name: 'Swahili',
        categories: [
          {
            name: 'Greetings',
            words: [
              { word: 'Jambo', meaning: 'Hello' },
              { word: 'Habari', meaning: 'How are you/News' },
              { word: 'Habari za asubuhi', meaning: 'Good morning' },
              { word: 'Habari za jioni', meaning: 'Good evening' },
              { word: 'Kwaheri', meaning: 'Goodbye' }
            ]
          },
          {
            name: 'Numbers',
            words: [
              { word: 'moja', meaning: 'one' },
              { word: 'mbili', meaning: 'two' },
              { word: 'tatu', meaning: 'three' },
              { word: 'nne', meaning: 'four' },
              { word: 'tano', meaning: 'five' }
            ]
          },
          {
            name: 'Common Phrases',
            words: [
              { word: 'Asante', meaning: 'Thank you' },
              { word: 'Tafadhali', meaning: 'Please' },
              { word: 'Samahani', meaning: 'Sorry/Excuse me' },
              { word: 'Ndiyo', meaning: 'Yes' },
              { word: 'Hapana', meaning: 'No' }
            ]
          }
        ]
      },
      {
        language: 'yoruba',
        name: 'Yoruba',
        categories: [
          {
            name: 'Greetings',
            words: [
              { word: 'Báwo ni', meaning: 'Hello/How are you' },
              { word: 'Káàbọ̀', meaning: 'Welcome' },
              { word: 'Ẹ kú àárọ̀', meaning: 'Good morning' },
              { word: 'Ẹ kú alẹ́', meaning: 'Good evening' },
              { word: 'Ó dàbọ̀', meaning: 'Goodbye' }
            ]
          },
          {
            name: 'Numbers',
            words: [
              { word: 'ọ̀kan', meaning: 'one' },
              { word: 'èjì', meaning: 'two' },
              { word: 'ẹ̀ta', meaning: 'three' },
              { word: 'ẹ̀rin', meaning: 'four' },
              { word: 'àrún', meaning: 'five' }
            ]
          },
          {
            name: 'Common Phrases',
            words: [
              { word: 'Ẹ ṣeun', meaning: 'Thank you' },
              { word: 'Jọ̀wọ́', meaning: 'Please' },
              { word: 'Má bínú', meaning: 'Sorry' },
              { word: 'Bẹ́ẹ̀ni', meaning: 'Yes' },
              { word: 'Bẹ́ẹ̀kọ́', meaning: 'No' }
            ]
          }
        ]
      },
      {
        language: 'zulu',
        name: 'Zulu',
        categories: [
          {
            name: 'Greetings',
            words: [
              { word: 'Sawubona', meaning: 'Hello' },
              { word: 'Unjani', meaning: 'How are you' },
              { word: 'Sawubona ekuseni', meaning: 'Good morning' },
              { word: 'Sawubona ntambama', meaning: 'Good evening' },
              { word: 'Hamba kahle', meaning: 'Goodbye (to person leaving)' }
            ]
          },
          {
            name: 'Numbers',
            words: [
              { word: 'kunye', meaning: 'one' },
              { word: 'kubili', meaning: 'two' },
              { word: 'kuthathu', meaning: 'three' },
              { word: 'kune', meaning: 'four' },
              { word: 'kuhlanu', meaning: 'five' }
            ]
          },
          {
            name: 'Common Phrases',
            words: [
              { word: 'Ngiyabonga', meaning: 'Thank you' },
              { word: 'Ngicela', meaning: 'Please' },
              { word: 'Uxolo', meaning: 'Sorry/Excuse me' },
              { word: 'Yebo', meaning: 'Yes' },
              { word: 'Cha', meaning: 'No' }
            ]
          }
        ]
      }
    ]
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Language Guides</h1>
        
        <Tabs defaultValue="pronunciation" value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pronunciation">Pronunciation</TabsTrigger>
            <TabsTrigger value="grammar">Grammar</TabsTrigger>
            <TabsTrigger value="vocabulary">Vocabulary</TabsTrigger>
          </TabsList>
          
          {/* Pronunciation Tab */}
          <TabsContent value="pronunciation" className="pt-6">
            <p className="mb-6 text-muted-foreground">
              Learn how to correctly pronounce words in various African languages with our pronunciation guides.
            </p>
            
            {guides.pronunciation.map((guide) => (
              <Card key={guide.language} className="mb-6">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-4">{guide.name} Pronunciation Guide</h2>
                  
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-3">Pronunciation Rules</h3>
                    <Accordion type="single" collapsible className="w-full">
                      {guide.rules.map((rule, index) => (
                        <AccordionItem key={index} value={`rule-${index}`}>
                          <AccordionTrigger className="text-left font-medium">
                            {rule.title}
                          </AccordionTrigger>
                          <AccordionContent>
                            <p className="text-muted-foreground">{rule.content}</p>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-3">Example Words</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {guide.examples.map((example, index) => (
                        <div key={index} className="border rounded-md p-3">
                          <div className="font-bold text-lg mb-1">{example.word}</div>
                          <div className="text-sm text-muted-foreground mb-1">
                            Pronunciation: <span className="font-medium">{example.pronunciation}</span>
                          </div>
                          <div className="text-sm">
                            Meaning: <span>{example.meaning}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
          
          {/* Grammar Tab */}
          <TabsContent value="grammar" className="pt-6">
            <p className="mb-6 text-muted-foreground">
              Understand the basic grammar rules and sentence structures of African languages.
            </p>
            
            {guides.grammar.map((guide) => (
              <Card key={guide.language} className="mb-6">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-4">{guide.name} Grammar Guide</h2>
                  
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-3">Grammar Rules</h3>
                    <Accordion type="single" collapsible className="w-full">
                      {guide.rules.map((rule, index) => (
                        <AccordionItem key={index} value={`rule-${index}`}>
                          <AccordionTrigger className="text-left font-medium">
                            {rule.title}
                          </AccordionTrigger>
                          <AccordionContent>
                            <p className="text-muted-foreground">{rule.content}</p>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-3">Example Sentences</h3>
                    <div className="space-y-4">
                      {guide.examples.map((example, index) => (
                        <div key={index} className="border rounded-md p-4">
                          <div className="font-bold mb-2">{example.sentence}</div>
                          <div className="text-sm mb-2">
                            Translation: <span className="italic">{example.translation}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Explanation: {example.explanation}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
          
          {/* Vocabulary Tab */}
          <TabsContent value="vocabulary" className="pt-6">
            <p className="mb-6 text-muted-foreground">
              Build your vocabulary with essential words and phrases categorized by topic.
            </p>
            
            {guides.vocabulary.map((guide) => (
              <Card key={guide.language} className="mb-6">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-4">{guide.name} Vocabulary</h2>
                  
                  <Accordion type="single" collapsible className="w-full">
                    {guide.categories.map((category, index) => (
                      <AccordionItem key={index} value={`category-${index}`}>
                        <AccordionTrigger className="text-left font-medium">
                          {category.name}
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {category.words.map((word, wordIndex) => (
                              <div key={wordIndex} className="flex justify-between border-b py-2">
                                <div className="font-medium">{word.word}</div>
                                <div className="text-muted-foreground">{word.meaning}</div>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
        
        {/* Selected Languages Info */}
        <div className="mt-8 pt-6 border-t">
          <h3 className="font-medium mb-3">Selected Languages for Translation</h3>
          {selectedLanguages.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {selectedLanguages.map(language => (
                <span 
                  key={language.id} 
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary"
                >
                  {language.name}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No languages selected. Select languages from the header to enable translations.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
