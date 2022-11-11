const AdvancementModel = require('../models/advancement');
const { paginationSize } = require('../constants/constants');

const queryAdvancements = (query, paginated, pageNumber, pageSize = paginationSize) => {
  if (!paginated) {
    return AdvancementModel.find(query)
      .populate('docenteId')
      .populate('asignaturaId')
      .sort({ fechaCreacion: -1 });
  }

  return AdvancementModel.find(query)
    .populate('docenteId')
    .populate('asignaturaId')
    .skip(pageNumber * pageSize)
    .limit(pageSize).sort({ fechaCreacion: -1 });
};

const queryAdvancementsCount = (query) => AdvancementModel.count(query);

module.exports = {
  queryAdvancements,
  queryAdvancementsCount
};
