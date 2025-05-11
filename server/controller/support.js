import Support from '../model/Support.js';

const getReports = async (req, res) => {
  const reports = await Support.find();
  res.status(200).json(reports);
};

export { getReports };
