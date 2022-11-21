const HomologationModel = require('../models/homologation');
const { paginationSize } = require('../constants/constants');

const queryHomologations = (query, paginated, pageNumber, pageSize = paginationSize) => {
  if (!paginated) {
    return HomologationModel.find(query).sort({ fechaCreacion: -1 });
  }

  return HomologationModel.find(query)
    .skip(pageNumber * pageSize)
    .limit(pageSize).sort({ fechaCreacion: -1 });
};

const queryHomologationsCount = (query) => HomologationModel.count(query);

const getAvailablePeriods = async (_, res) => {
  try {
    const years = await HomologationModel.distinct('añoHomologacion');
    const uniqueYears = years
      .map((year) => year.getFullYear())
      .filter((year, i, _this) => (
        _this.findIndex((_year) => _year === year) === i
      ));

    const periodsPerYear = await Promise.all(uniqueYears.map((year) => (
      HomologationModel.find({
        añoHomologacion: {
          $gte: new Date(year, 0, 0).toISOString(),
          $lte: new Date(year + 1, 0, 0).toISOString()
        }
      }).distinct('periodo')
    )));

    const yearsPeriod = uniqueYears
      .reduce((acc, year, i) => [
        ...acc,
        ...periodsPerYear[i].map((period) => `${year} - ${period}`)
      ], []);

    res.status(200).json({ periods: yearsPeriod });
  } catch (e) {
    res.status(400).json({
      error: true,
      description: e.message
    });
  }
};

module.exports = {
  getAvailablePeriods,
  queryHomologations,
  queryHomologationsCount
};
