const fs = require('fs');
const dotenv = require('dotenv');

const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
console.log('URL:', JSON.stringify(envConfig.NEXT_PUBLIC_SUPABASE_URL));
console.log('KEY:', JSON.stringify(envConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY));
