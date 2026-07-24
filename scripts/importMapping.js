import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import xlsx from 'xlsx';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env variables from .env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function importMapping() {
  const filePath = path.resolve(__dirname, '../public/EWS Mapping Sheet - data.xlsx');
  
  if (!fs.existsSync(filePath)) {
    console.error("Excel file not found:", filePath);
    process.exit(1);
  }

  const wb = xlsx.readFile(filePath);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const data = xlsx.utils.sheet_to_json(ws);

  console.log(`Found ${data.length} records to import...`);

  const records = data.map(row => ({
    tsm_name: row.TSM,
    territory: row.Territory,
    region: row.Region,
    position: row.Position
  })).filter(row => row.tsm_name); // ensure we have a TSM name

  // First, let's clear the existing table (optional, but good for fresh import)
  const { error: deleteError } = await supabase
    .from('tsm_mapping')
    .delete()
    .neq('id', 0); // delete all

  if (deleteError) {
    console.error("Error clearing existing mapping:", deleteError);
  }

  // Insert records in batches of 100
  const batchSize = 100;
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    const { error } = await supabase.from('tsm_mapping').insert(batch);
    if (error) {
      console.error(`Error inserting batch ${i}:`, error);
    } else {
      console.log(`Inserted ${i + batch.length} of ${records.length} records`);
    }
  }

  console.log("Import completed!");
}

importMapping();
