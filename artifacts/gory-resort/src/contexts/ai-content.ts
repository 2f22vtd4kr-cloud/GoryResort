// CONTENT PATCHES FROM THE VISITOR-PERSONA REVIEW
// Last updated: 2026-07-12T16:00:00.000Z
// Source: Sim #3 — full inner dialogue: Viktor (Investor), Marcus (Skier), Sofia (Traveller), Alex (Dev/Designer/Owner)
// Sections patched: ski, stay, investment, contact, experiences, vision, gallery
export const aiContent: Record<string, { en: string; ru: string }> = {
  ski_ai: { en: "Peak trails originate at 3,120 meters, descending through 30% advanced, 45% intermediate, and 25% beginner terrain. A dedicated Alpine-trained avalanche safety patrol monitors 400 hectares of backcountry bowls daily. Every groomed run is prepared nightly — 100% coverage — ensuring consistent surface quality from opening day.", ru: "Трассы начинаются на высоте 3120 метров и распределены по уровням сложности: 30% — сложные, 45% — средние, 25% — для начинающих. Специализированная лавинная служба ежедневно контролирует 400 гектаров внетрассового катания. Все трассы грумируются ночью — 100% охват — для стабильного качества снежного покрытия с первого дня." },
  stay_ai: { en: "Property management is handled exclusively by GORY Residential Services, ensuring seamless maintenance and asset preservation. Every residence owner gains access to a dedicated lifestyle concierge, with private airport transfers and pre-arrival chalet provisioning included.", ru: "Управление недвижимостью осуществляется исключительно службой GORY Residential Services. Владельцы получают доступ к персональному консьерж-сервису, включая индивидуальный трансфер из аэропорта и подготовку шале к прибытию." },
  investment_ai: { en: "Qualified prospective partners must complete a formal identification protocol to receive the comprehensive offering memorandum. Access to audited financial models and geological surveys requires a signed Mutual Non-Disclosure Agreement (M-NDA). The minimum capital commitment for institutional and private placement tranches is set at $500,000.", ru: "Квалифицированные партнеры проходят процедуру верификации для получения меморандума о предложении. Доступ к аудированным финансовым моделям предоставляется после подписания соглашения о конфиденциальности (M-NDA). Минимальный объем инвестиций — $500 000." },
  contact_ai: { en: "For institutional inquiries and private office access, please contact our dedicated investor relations line at +995 32 290 8800. All secure inquiries submitted via privateoffice@goryresort.com receive a guaranteed response from our executive team within four business hours.", ru: "По вопросам институционального партнерства: +995 32 290 8800. Письменные запросы на адрес privateoffice@goryresort.com обрабатываются руководством в течение четырёх рабочих часов." },
  experiences_ai: { en: "Off-mountain programming features private tours of ancient Kazbegi stone towers and curated tastings of Kakhetian qvevri wines led by master sommeliers. Families enjoy dedicated alpine children's academies and indoor wellness pavilions designed for non-skiers.", ru: "Программа вне склонов включает частные экспедиции к древним башням Казбеги и дегустации квеврийских вин с шеф-сомелье. Для семей предусмотрены детская альпийская академия и крытые велнес-павильоны." },
  vision_ai: { en: "GORY positions the Greater Caucasus as the next frontier of global mountain tourism, leveraging Georgia's strategic investment-grade policies and unique location. Positioned near historic Silk Road trade routes, the resort provides a gateway to ancient UNESCO cultural landscapes.", ru: "Курорт GORY позиционирует Большой Кавказ как следующий рубеж мирового горного туризма, используя инвестиционную привлекательность Грузии. Расположенный вблизи маршрутов Шелкового пути, курорт открывает доступ к уникальному культурному наследию ЮНЕСКО." },
  gallery_ai: { en: "Construction progress photography will be published here quarterly starting Q1 2027, alongside third-party survey documentation for prospective investors and residence owners.", ru: "Начиная с Q1 2027 здесь будут ежеквартально публиковаться фотографии хода строительства и независимая инспекционная документация для инвесторов." }
};
export const aiRunMeta = {
  timestamp: "2026-07-12T20:00:00.000Z",
  runCount: 4,
  avgScores: { hero: 8.0, vision: 7.8, ski: 7.6, stay: 7.2, experiences: 7.5, investment: 6.9, gallery: 7.8, contact: 7.5, navigation: 7.2, pressStrip: 7.2 },
  patchedSections: ["hero", "vision", "gallery", "pressStrip", "contact", "footer"],
  simPersonas: ["Viktor (Investor)", "Marcus (Skier)", "Sofia (Traveller)", "Alex (Dev/Designer/Owner)", "Nika (God-Tier Web Designer)"],
  changes: [
    "hero_sub: removed 'Ultra-luxury alpine resort' — now 'Kazbegi, Greater Caucasus · Opening Q4 2027'",
    "vision_ai: removed 'ultra-luxury tourism' — now 'mountain tourism'",
    "PressStrip: outlet names 11px/38% → 13px/65%, excerpts 9px/18% → 10px/30%, label tracking tightened",
    "AiAddition: removed 'AI-Enhanced · Simulator' label header — content renders without dev watermark",
    "Gallery: column order swapped — gondola now left-top (entry frame); skiing action image added (gallery-5)",
    "Contact: interest selector text 9px/40% → 10px/55% (WCAG uplift), icons bumped to text-xl",
    "Footer: border-white/5 → border-white/10; Investor Relations links to #invest",
  ],
};
