import Papa from 'papaparse';

const parseCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    Papa.parse(filePath, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve(results.data);
      },
      error: (error) => {
        console.error(`Error loading CSV from ${filePath}:`, error);
        reject(error);
      }
    });
  });
};

export const loadAllData = async () => {
  try {
    const [
      languages,
      questions,
      tsm,
      cropProductMapping,
      districtStateMapping
    ] = await Promise.all([
      parseCSV('/data/hoodibaba_ews_languages.csv'),
      parseCSV('/data/hoodibaba_ews_questions.csv'),
      parseCSV('/data/hoodibaba_ews_tsm.csv'),
      parseCSV('/data/hoodibaba_ews_crop_product_mapping.csv'),
      parseCSV('/data/hoodibaba_ews_district_state_mapping.csv')
    ]);

    return {
      languages,
      questions,
      tsm,
      cropProductMapping,
      districtStateMapping
    };
  } catch (error) {
    console.error('Failed to load CSV data', error);
    throw error;
  }
};
