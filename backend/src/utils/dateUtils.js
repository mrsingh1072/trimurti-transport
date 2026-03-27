const MS_PER_DAY = 1000 * 60 * 60 * 24;

const diffInDays = (start, end) => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffMs = endDate - startDate;
  return Math.ceil(diffMs / MS_PER_DAY);
};

module.exports = { diffInDays };
