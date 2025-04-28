CREATE TABLE definitions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    word TEXT NOT NULL,
    definition_text TEXT NOT NULL,
    definition_index INTEGER NOT NULL,
    part_of_speech TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE examples (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    word TEXT NOT NULL,
    definition_index INTEGER NOT NULL,
    example_index INTEGER NOT NULL,
    native_text TEXT NOT NULL,
    french_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
); 