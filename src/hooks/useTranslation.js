import { useData } from '../context/DataContext';
import { useForm } from '../context/FormContext';

export const useTranslation = () => {
  const { questions } = useData();
  const { formData } = useForm();
  
  const currentLang = formData.language || 'English';

  const t = (englishKey) => {
    if (!questions || questions.length === 0) return englishKey;
    
    // Find the row where English column matches the key exactly
    const row = questions.find(q => q.English === englishKey);
    
    if (row && row[currentLang]) {
      return row[currentLang];
    }
    
    // Fallback to English key if translation not found
    return englishKey;
  };

  return { t, currentLang };
};
