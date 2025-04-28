'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter
} from '@/components/ui/sheet';
import { Language } from '@/types';

interface NavItem {
  href: string;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Home' },
  { href: '/dictionary', label: 'Dictionary' },
  { href: '/phrases/examples', label: 'Examples' }
];

interface LanguageToggleProps {
  language: Language;
  onToggle: (id: string) => void;
}

const LanguageToggle: React.FC<LanguageToggleProps> = ({ language, onToggle }) => (
  <Button
    variant={language.isSelected ? 'default' : 'outline'}
    size="sm"
    onClick={() => onToggle(language.id)}
    className="text-sm"
  >
    {language.name}
  </Button>
);

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const pathname = usePathname();
  const { selectedLanguages, availableLanguages, toggleLanguage, selectAllLanguages, deselectAllLanguages } = useLanguage();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality
    console.log('Searching for:', searchQuery);
  };

  const isActive = (path: string) => {
    if (path === '/phrases/examples') {
      return pathname === '/phrases/examples';
    }
    return pathname === path;
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-background border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xl">A</span>
              </div>
              <span className="font-display font-bold text-xl text-foreground hidden sm:inline-block">
                African Languages
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {NAV_ITEMS.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`font-medium ${isActive(item.href) ? 'text-primary' : 'text-foreground'}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Search and Language Selector */}
          <div className="flex items-center space-x-2">
            {/* Search Form */}
            <form onSubmit={handleSearchSubmit} className="hidden md:flex relative">
              <Input
                type="text"
                placeholder="Search phrases..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-40 lg:w-64"
              />
              <Button 
                type="submit" 
                variant="ghost" 
                size="icon"
                className="absolute right-0 top-0 h-full"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </Button>
            </form>

            {/* Language Selector using Sheet */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                  </svg>
                  <span className="hidden sm:inline">Languages</span>
                  {selectedLanguages.length > 0 && (
                    <span className="ml-1 text-xs bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center">
                      {selectedLanguages.length}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="overflow-y-auto">
                <SheetHeader className="mb-4">
                  <SheetTitle>Select Languages</SheetTitle>
                  <SheetDescription>
                    Choose the languages you want to see translations for
                  </SheetDescription>
                </SheetHeader>
                <div className="py-2">
                  <div className="flex justify-between mb-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={selectAllLanguages}
                    >
                      Select All
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={deselectAllLanguages}
                    >
                      Deselect All
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 gap-2 max-h-[50vh] overflow-y-auto pr-2">
                    {availableLanguages.map(language => (
                      <div 
                        key={language.id} 
                        className={`p-3 rounded-md cursor-pointer flex items-center space-x-2 transition-colors ${
                          language.isSelected
                            ? 'bg-primary/10 border border-primary'
                            : 'bg-muted hover:bg-muted/80 border border-transparent'
                        }`}
                        onClick={() => toggleLanguage(language.id)}
                      >
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                          language.isSelected
                            ? 'bg-primary'
                            : 'border border-muted-foreground'
                        }`}>
                          {language.isSelected && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <span>{language.name}</span>
                        {/* Removed hasAudio check since it's not in the Language type */}
                      </div>
                    ))}
                  </div>
                </div>
                <SheetFooter className="mt-4">
                  <div className="text-xs text-muted-foreground">
                    Selected: {selectedLanguages.length} of {availableLanguages.length} languages
                  </div>
                </SheetFooter>
              </SheetContent>
            </Sheet>

            {/* Mobile Menu Button */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t">
          <div className="container mx-auto px-4 py-3">
            <nav className="flex flex-col space-y-3">
              {NAV_ITEMS.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={toggleMenu}
                  className="w-full justify-start"
                >
                  {item.label}
                </Link>
              ))}
              <form onSubmit={handleSearchSubmit} className="relative mt-2">
                <Input
                  type="text"
                  placeholder="Search phrases..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
                <Button 
                  type="submit" 
                  variant="ghost" 
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </Button>
              </form>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
