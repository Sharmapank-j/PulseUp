import seedData from '../../../research/seed_data.json';

export const allOpportunities = seedData;

export const categories = [
  "All",
  "Medical College Fests",
  "National Quizzes & Competitions",
  "Clinical Certifications",
  "Government Research Grants",
  "Observerships & Clinical Electives"
];

export const getCategoryStats = () => {
  const stats = {};
  seedData.forEach(item => {
    stats[item.category] = (stats[item.category] || 0) + 1;
  });
  return stats;
};

export const getOpportunitiesByCategory = (cat) => {
  if (!cat || cat === "All") return seedData;
  return seedData.filter(item => item.category === cat);
};
