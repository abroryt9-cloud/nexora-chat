import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { setLanguage as setLanguageAction } from '../store/userSlice';
import { languages } from '@nexora/shared';

export const useLanguage = () => {
  const { i18n } = useTranslation();
  const dispatch = useDispatch();
  const language = useSelector((state: RootState) => state.user.language);

  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language, i18n]);

  const setLanguage = (lang: string) => {
    dispatch(setLanguageAction(lang));
    localStorage.setItem('language', lang);
  };

  return { language, setLanguage, languages };
};
