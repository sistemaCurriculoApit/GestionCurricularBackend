const AdvancementModel = require('../models/advancement');
const ProfessorModel = require('../models/docente');
const SubjectModel = require('../models/asignatura');
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

const getAdvancements = async (req, res) => {
  const {
    search,
    dateCreationFrom,
    dateCreationTo,
    page,
    paginated
  } = req.query;

  try {
    const pageNumber = page && page >= 0 ? page : 0;
    const query = {};

    if (dateCreationFrom || dateCreationTo) {
      query.fechaCreacion = {};

      if (dateCreationFrom) {
        query.fechaCreacion.$gte = new Date(new Date(dateCreationFrom).toDateString()).toISOString();
      }
      if (dateCreationTo) {
        query.fechaCreacion.$lte = new Date(new Date(dateCreationTo).toDateString()).toISOString();
      }
    }

    if (search) {
      const regex = new RegExp(search, 'ig');
      if (paginated) {
        query.descripcion = regex;
      } else {
        query.$or = [
          { identificacionSolicitante: regex },
          { nombreSolicitante: regex },
          { universidadSolicitante: regex },
          { programaSolicitante: regex },
          { asignaturaSolicitante: regex },
        ];
      }
    }

    const [advancements, advancementsCount] = await Promise.all([queryAdvancements(query, paginated, pageNumber), queryAdvancementsCount(query)]);

    res.status(200).json({ advancements, advancementsCount });
  } catch (error) {
    res.status(400).json({
      error: true,
      description: error.message
    });
  }
};

const getAvailablePeriods = async (_, res) => {
  try {
    const years = await AdvancementModel.distinct('añoAvance');
    const uniqueYears = years
      .map((year) => year.getFullYear())
      .filter((year, i, _this) => (
        _this.findIndex((_year) => _year === year) === i
      ));

    const periodsPerYear = await Promise.all(uniqueYears.map((year) => (
      AdvancementModel.find({
        añoAvance: {
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

const getAvailableProfessorsByPeriod = async (req, res) => {
  const { period: periodo, year } = req.params;

  try {
    if (!periodo || !year) {
      throw new Error('Period or Year were not provided');
    }

    const query = {
      periodo,
      añoAvance: {
        $gte: new Date(year, 0, 0).toISOString(),
        $lte: new Date(year + 1, 0, 0).toISOString()
      }
    };

    const professorIds = await AdvancementModel
      .find(query)
      .distinct('docenteId');

    const professors = await ProfessorModel
      .find({ _id: { $in: professorIds } });

    res.status(200).json({ professors });
  } catch (error) {
    res.status(400).json({
      error: true,
      description: error.message
    });
  }
};

const getAvailableSubjectsByPeriod = async (req, res) => {
  const { period: periodo, year } = req.params;

  try {
    if (!periodo || !year) {
      throw new Error('Period or Year were not provided');
    }

    const query = {
      periodo,
      añoAvance: {
        $gte: new Date(year, 0, 0).toISOString(),
        $lte: new Date(year + 1, 0, 0).toISOString()
      }
    };

    const subjectsId = await AdvancementModel
      .find(query)
      .distinct('asignaturaId');

    const subjects = await SubjectModel
      .find({ _id: { $in: subjectsId } });

    res.status(200).json({ subjects });
  } catch (error) {
    res.status(400).json({
      error: true,
      description: error.message
    });
  }
};

module.exports = {
  getAdvancements,
  getAvailablePeriods,
  getAvailableProfessorsByPeriod,
  getAvailableSubjectsByPeriod,
  queryAdvancements,
  queryAdvancementsCount
};
