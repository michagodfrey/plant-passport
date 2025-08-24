#!/usr/bin/env node

// Test the Edge Function using the same method as the frontend
// This helps reproduce the exact issue the frontend is experiencing

import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Please set SUPABASE_URL and SUPABASE_ANON_KEY environment variables');
    console.error('   export SUPABASE_URL=https://your-project.supabase.co');
    console.error('   export SUPABASE_ANON_KEY=your_anon_key');
    process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('🧪 Testing Edge Function using Supabase client (same as frontend)...');
console.log('📍 Supabase URL:', supabaseUrl);
console.log('');

// Test payload (same structure as frontend)
const testPayload = {
    commodity: 'Apple (fruit)',
    origin: 'Victoria',
    destination: 'Tasmania',
    applicableRequirements: [
        {
            requirement: {
                id: 1,
                name: 'Test Requirement',
                description: 'Test description'
            },
            reason: 'Test reason',
            source: 'Test source',
            actions: ['Test action']
        }
    ],
    nonApplicableRequirements: [],
    pestContext: {
        identifiedPests: [
            { pest_id: 1, name: 'Test Pest', acronym: 'TP' }
        ],
        pestsPresent: [
            { pest_id: 1, name: 'Test Pest', acronym: 'TP' }
        ],
        pestsAbsent: []
    }
};

console.log('📦 Request payload:');
console.log(JSON.stringify(testPayload, null, 2));
console.log('');

try {
    console.log('🚀 Making request to Edge Function...');
    
    const { data, error } = await supabase.functions.invoke('compliance-summarization', {
        body: testPayload,
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (error) {
        console.error('❌ Edge Function error:', error);
        process.exit(1);
    }

    console.log('✅ Success! Response:');
    console.log(JSON.stringify(data, null, 2));

} catch (err) {
    console.error('❌ Request failed:', err.message);
    console.error('Stack trace:', err.stack);
    process.exit(1);
}

console.log('');
console.log('🎉 Test completed successfully!');
