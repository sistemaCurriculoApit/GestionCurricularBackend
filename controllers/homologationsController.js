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

module.exports = {
  queryHomologations,
  queryHomologationsCount
};
