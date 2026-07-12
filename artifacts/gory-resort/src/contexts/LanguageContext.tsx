import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'ru';

interface Translations {
  [key: string]: {
    en: string;
    ru: string;
  };
}

export const translations: Translations = {
  // Navigation
  nav_vision: { en: 'The Vision', ru: 'Видение' },
  nav_ski: { en: 'Ski', ru: 'Склоны' },
  nav_stay: { en: 'Stay', ru: 'Проживание' },
  nav_experiences: { en: 'Experiences', ru: 'Впечатления' },
  nav_invest: { en: 'Invest', ru: 'Инвестиции' },
  nav_gallery: { en: 'Gallery', ru: 'Галерея' },
  
  // Hero
  hero_tagline: { en: 'WHERE THE CAUCASUS MEETS THE FUTURE', ru: 'ГДЕ КАВКАЗ ВСТРЕЧАЕТ БУДУЩЕЕ' },
  hero_opening: { en: 'OPENING 2027', ru: 'ОТКРЫТИЕ В 2027 ГОДУ' },
  
  // Vision
  vision_title: { en: 'THE VISION', ru: 'ВИДЕНИЕ' },
  vision_stat_1_val: { en: '2,400', ru: '2,400' },
  vision_stat_1_lbl: { en: 'm altitude', ru: 'м над уровнем моря' },
  vision_stat_2_val: { en: '42', ru: '42' },
  vision_stat_2_lbl: { en: 'km of ski runs', ru: 'км горнолыжных трасс' },
  vision_stat_3_val: { en: '12', ru: '12' },
  vision_stat_3_lbl: { en: 'lifts planned', ru: 'подъёмников в проекте' },
  vision_stat_4_val: { en: '2027', ru: '2027' },
  vision_stat_4_lbl: { en: 'grand opening', ru: 'торжественное открытие' },
  vision_desc_1: { 
    en: "A new chapter in Caucasian mountain culture. GORY is not merely a resort — it is a new destination forged from ancient stone and visionary ambition.", 
    ru: "Новая глава горной культуры Кавказа. ГОРЫ — это не просто курорт. Это новое направление, рождённое из древнего камня и дальновидных амбиций." 
  },
  vision_desc_2: {
    en: "Set against the backdrop of the world's most dramatic mountain range, GORY will redefine alpine luxury for the next generation.",
    ru: "На фоне самого драматичного горного массива в мире, ГОРЫ переосмыслят альпийскую роскошь для следующего поколения."
  },

  // Ski
  ski_title: { en: 'THE MOUNTAIN', ru: 'ГОРА' },
  ski_cat_1: { en: 'BEGINNER', ru: 'НОВИЧОК' },
  ski_cat_2: { en: 'INTERMEDIATE', ru: 'ЛЮБИТЕЛЬ' },
  ski_cat_3: { en: 'EXPERT', ru: 'ЭКСПЕРТ' },
  
  // Stay
  stay_title: { en: 'SANCTUARY', ru: 'УБЕЖИЩЕ' },
  stay_type_1: { en: 'The Peaks Collection', ru: 'Коллекция «Вершины»' },
  stay_desc_1: { en: '48 Suites', ru: '48 Сьютов' },
  stay_type_2: { en: 'Glacier Chalets', ru: 'Ледниковые Шале' },
  stay_desc_2: { en: '12 Private Chalets', ru: '12 Частных Шале' },
  stay_type_3: { en: 'Base Camp Residences', ru: 'Резиденции Базового Лагеря' },
  stay_desc_3: { en: '24 Residences for sale', ru: '24 резиденции в продажу' },
  
  // Experiences
  exp_title: { en: 'ELEVATED EXPERIENCES', ru: 'ВЫСОКИЕ ВПЕЧАТЛЕНИЯ' },
  exp_1: { en: 'Skiing & Snowboarding', ru: 'Горные лыжи и сноуборд' },
  exp_2: { en: 'Wellness & Spa', ru: 'Велнес и Спа' },
  exp_3: { en: 'Heliskiing', ru: 'Хели-ски' },
  exp_4: { en: 'Georgian Gastronomy', ru: 'Грузинская Гастрономия' },
  
  // Investment
  inv_title: { en: 'INVEST IN THE CAUCASUS', ru: 'ИНВЕСТИРУЙТЕ В КАВКАЗ' },
  inv_subhead: { 
    en: 'Limited early-stage investment positions available. Join the founding partners shaping the future of mountain luxury in Georgia.', 
    ru: 'Ограниченное число позиций для инвесторов ранней стадии. Присоединяйтесь к партнерам-основателям, формирующим будущее горной роскоши в Грузии.' 
  },
  inv_tier_1_title: { en: 'FOUNDATION PARTNER', ru: 'ПАРТНЁР-ОСНОВАТЕЛЬ' },
  inv_tier_1_desc: { en: 'from $500,000', ru: 'от $500,000' },
  inv_tier_1_ret: { en: '15% projected IRR', ru: '15% ожидаемая доходность (IRR)' },
  inv_tier_2_title: { en: 'SLOPE PARTNER', ru: 'ПАРТНЕР СКЛОНОВ' },
  inv_tier_2_desc: { en: 'from $250,000', ru: 'от $250,000' },
  inv_tier_2_ret: { en: '12% projected IRR', ru: '12% ожидаемая доходность (IRR)' },
  inv_tier_3_title: { en: 'SUMMIT MEMBER', ru: 'УЧАСТНИК ВЕРШИНЫ' },
  inv_tier_3_desc: { en: 'from $50,000', ru: 'от $50,000' },
  inv_tier_3_ret: { en: 'Resort membership + returns', ru: 'Членство в курорте + доход' },
  inv_cta: { en: 'REQUEST INVESTOR DECK', ru: 'ЗАПРОСИТЬ ИНВЕСТИЦИОННЫЙ ПАКЕТ' },
  
  // Form
  form_title: { en: 'CONNECT', ru: 'СВЯЗЬ' },
  form_name: { en: 'Name', ru: 'Имя' },
  form_email: { en: 'Email', ru: 'Email' },
  form_interest: { en: 'Interest', ru: 'Интерес' },
  form_interest_inv: { en: 'Investor', ru: 'Инвестор' },
  form_interest_guest: { en: 'Guest', ru: 'Гость' },
  form_interest_media: { en: 'Media', ru: 'Медиа' },
  form_message: { en: 'Message', ru: 'Сообщение' },
  form_submit: { en: 'SUBMIT INQUIRY', ru: 'ОТПРАВИТЬ ЗАПРОС' },
  form_success: { en: 'Message received. We will contact you shortly.', ru: 'Сообщение получено. Мы свяжемся с вами в ближайшее время.' },
  
  // Gallery
  gallery_title: { en: 'GALLERY', ru: 'ГАЛЕРЕЯ' },
  
  // Footer
  footer_address: { en: 'Kazbegi Municipality, Mtskheta-Mtianeti, Georgia', ru: 'Муниципалитет Казбеги, Мцхета-Мтианети, Грузия' },
  footer_privacy: { en: 'Privacy', ru: 'Конфиденциальность' },
  footer_terms: { en: 'Terms', ru: 'Условия' },
  footer_investors: { en: 'Investor Relations', ru: 'Инвесторам' }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string) => {
    if (!translations[key]) {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }
    return translations[key][language];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};