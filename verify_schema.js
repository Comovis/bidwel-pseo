
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '/Applications/gemini_workspace/bidwel/backend/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    console.log('Checking schema for uk_tenders...');

    // Fetch a single row to inspect keys and types
    const { data, error } = await supabase
        .from('uk_tenders')
        .select(`
            industry,
            location, 
            region, 
            main_cpv_description, 
            cpv_code, 
            buyer_name, 
            is_sme_friendly,
            stage
        `)
        .limit(1);

    if (error) {
        console.error('Error fetching data:', error);
        return;
    }

    if (data && data.length > 0) {
        const row = data[0];
        console.log('--- Column Existence Check ---');
        console.log('industry:', row.hasOwnProperty('industry') ? '✅ Exists' : '❌ MISSING');
        console.log('location:', row.hasOwnProperty('location') ? '✅ Exists' : '❌ MISSING');
        console.log('region:', row.hasOwnProperty('region') ? '✅ Exists' : '❌ MISSING');
        console.log('main_cpv_description:', row.hasOwnProperty('main_cpv_description') ? '✅ Exists' : '❌ MISSING');
        console.log('buyer_name:', row.hasOwnProperty('buyer_name') ? '✅ Exists' : '❌ MISSING');
        console.log('is_sme_friendly:', row.hasOwnProperty('is_sme_friendly') ? '✅ Exists' : '❌ MISSING');
        console.log('stage:', row.hasOwnProperty('stage') ? '✅ Exists' : '❌ MISSING');

        console.log('\n--- Data Type Check ---');
        console.log('cpv_code type:', Array.isArray(row.cpv_code) ? '✅ Array' : `⚠️ Not an Array (${typeof row.cpv_code})`);
        console.log('is_sme_friendly type:', typeof row.is_sme_friendly === 'boolean' ? '✅ Boolean' : `⚠️ Not a Boolean (${typeof row.is_sme_friendly})`);

    } else {
        console.log('No data found in uk_tenders to verify schema.');
    }
}

checkSchema();
