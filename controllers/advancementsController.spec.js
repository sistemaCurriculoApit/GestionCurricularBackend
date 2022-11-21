const {
  getAvailablePeriods,
  getAvailableProfessorsByPeriod,
  getAvailableSubjectsByPeriod,
  queryAdvancements,
  getAdvancements
} = require('./advancementsController');
const AdvancementModel = require('../models/advancement');
const ProfessorModel = require('../models/docente');
const SubjectModel = require('../models/asignatura');
const { paginationSize } = require('../constants/constants');

const dateString = '2022-01-01T05:00:00.000Z';
const professorId = 'c611f4c5-6fec-41e9-92c9-a580d7e9f6d7';
const subjectId = '9d65a5cd-578c-4785-aa74-9e427f76e9bf';

jest.mock('../models/advancement', () => ({
  distinct: jest.fn(async (param) => param === 'añoAvance' ? [new Date(dateString)] : ['1']),
  find: jest.fn().mockReturnThis(),
  populate: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  sort: jest.fn(() => []),
  count: jest.fn(() => 1)
}));

jest.mock('../models/docente', () => ({
  find: jest.fn(() => [{ _id: professorId }]),
}));

jest.mock('../models/asignatura', () => ({
  find: jest.fn(() => [{ _id: subjectId }]),
}));

const res = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis()
};

describe('Advancements', () => {
  describe('query config', () => {
    beforeEach(() => {
      res.status.mockClear();
      res.json.mockClear();

      AdvancementModel.distinct.mockClear();
      AdvancementModel.find.mockClear();
    });

    it('sould query all data', async () => {
      await queryAdvancements({}, false);

      expect(AdvancementModel.skip).not.toHaveBeenCalled();
      expect(AdvancementModel.limit).not.toHaveBeenCalled();
      expect(AdvancementModel.find).toHaveBeenCalled();
      expect(AdvancementModel.sort).toHaveBeenCalled();
      expect(AdvancementModel.populate).toHaveBeenCalledTimes(2);
    });

    it('sould paginate', async () => {
      await queryAdvancements({}, true, 0);

      expect(AdvancementModel.skip).toHaveBeenCalled();
      expect(AdvancementModel.limit).toHaveBeenCalled();
    });
  });
});

describe('Advancements', () => {
  describe('fetch', () => {
    beforeEach(() => {
      res.status.mockClear();
      res.json.mockClear();

      AdvancementModel.distinct.mockClear();
      AdvancementModel.find.mockClear();
    });

    it('Should fetch advancements without query object', async () => {
      const req = {
        query: {}
      };

      await getAdvancements(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ advancements: [], advancementsCount: 1 });
    });

    it('Should fetch advancements with date from query', async () => {
      const req = {
        query: {
          dateCreationFrom: dateString
        }
      };

      await getAdvancements(req, res);

      expect(AdvancementModel.find).toHaveBeenCalledWith({ fechaCreacion: { $gte: dateString } });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ advancements: [], advancementsCount: 1 });
    });

    it('Should fetch advancements with date to query', async () => {
      const req = {
        query: {
          dateCreationTo: dateString
        }
      };

      await getAdvancements(req, res);

      expect(AdvancementModel.find).toHaveBeenCalledWith({ fechaCreacion: { $lte: dateString } });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ advancements: [], advancementsCount: 1 });
    });

    it('Should fetch advancements with search query paginated', async () => {
      const search = 'test';
      const page = 1;
      const req = {
        query: {
          search,
          paginated: true,
          page
        }
      };

      await getAdvancements(req, res);

      expect(AdvancementModel.find).toHaveBeenCalledWith({ descripcion: new RegExp(search, 'ig') });
      expect(AdvancementModel.skip).toHaveBeenCalledWith(page * paginationSize);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ advancements: [], advancementsCount: 1 });
    });

    it('Should fetch advancements with search query not paginated', async () => {
      const search = 'test';
      const req = {
        query: {
          search,
          paginated: false
        }
      };
      const regex = new RegExp(search, 'ig');

      await getAdvancements(req, res);

      expect(AdvancementModel.find).toHaveBeenCalledWith({
        $or: [
          { identificacionSolicitante: regex },
          { nombreSolicitante: regex },
          { universidadSolicitante: regex },
          { programaSolicitante: regex },
          { asignaturaSolicitante: regex },
        ]
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ advancements: [], advancementsCount: 1 });
    });

    it('Should catch an error', async () => {
      AdvancementModel.count.mockImplementationOnce(async () => { throw new Error('test'); });
      const req = { query: {} };

      await getAdvancements(req, res);

      expect(AdvancementModel.find).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: true, description: 'test' });
    });
  });
});

describe('Advancements', () => {
  describe('periods', () => {
    beforeEach(() => {
      res.status.mockClear();
      res.json.mockClear();

      AdvancementModel.distinct.mockClear();
      AdvancementModel.find.mockClear();
    });

    it('should return periods', async () => {
      await getAvailablePeriods(undefined, res);

      const year = new Date(dateString).getFullYear();
      const dateFrom = new Date(year, 0, 0).toISOString();
      const dateTo = new Date(year + 1, 0, 0).toISOString();

      expect(AdvancementModel.distinct).toHaveBeenCalledTimes(2);
      expect(AdvancementModel.distinct).toHaveBeenCalledWith('añoAvance');
      expect(AdvancementModel.distinct).toHaveBeenCalledWith('periodo');
      expect(AdvancementModel.find).toHaveBeenCalledWith({ añoAvance: { $gte: dateFrom, $lte: dateTo } });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ periods: ['2022 - 1'] });
    });

    it('should catch error', async () => {
      AdvancementModel.distinct.mockImplementationOnce(async () => { throw new Error('test'); });
      await getAvailablePeriods(undefined, res);

      expect(AdvancementModel.distinct).toHaveBeenCalledWith('añoAvance');
      expect(AdvancementModel.find).toHaveBeenCalledTimes(0);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: true, description: 'test' });
    });

    it('should filter repeated years', async () => {
      const duplicatedYearDate = '2022-02-02T05:00:00.000Z';
      AdvancementModel.distinct.mockImplementationOnce(async () => [new Date(dateString), new Date(duplicatedYearDate)]);
      await getAvailablePeriods(undefined, res);

      expect(AdvancementModel.find).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ periods: ['2022 - 1'] });
    });
  });
});

describe('Advancements', () => {
  describe('Professors', () => {
    beforeEach(() => {
      res.status.mockClear();
      res.json.mockClear();

      AdvancementModel.distinct.mockClear();
      AdvancementModel.find.mockClear();
      ProfessorModel.find.mockClear();
    });

    it('should reject request witout year', async () => {
      const req = { params: { period: '1' } };
      await getAvailableProfessorsByPeriod(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: true, description: 'Period or Year were not provided' });
    });

    it('should reject request witout period', async () => {
      const req = { params: { year: '2022' } };
      await getAvailableProfessorsByPeriod(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: true, description: 'Period or Year were not provided' });
    });

    it('should return professors', async () => {
      AdvancementModel.distinct.mockImplementationOnce(async () => [professorId]);

      const year = new Date(dateString).getFullYear();
      const req = { params: { year, period: '1' } };
      await getAvailableProfessorsByPeriod(req, res);

      const dateFrom = new Date(year, 0, 0).toISOString();
      const dateTo = new Date(year + 1, 0, 0).toISOString();

      expect(AdvancementModel.find).toHaveBeenCalledWith({ periodo: req.params.period, añoAvance: { $gte: dateFrom, $lte: dateTo } });
      expect(AdvancementModel.distinct).toHaveBeenCalledWith('docenteId');
      expect(ProfessorModel.find).toHaveBeenCalledWith({ _id: { $in: [professorId] } });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ professors: [{ _id: professorId }] });
    });
  });
});

describe('Advancements', () => {
  describe('Subjects', () => {
    beforeEach(() => {
      res.status.mockClear();
      res.json.mockClear();

      AdvancementModel.distinct.mockClear();
      AdvancementModel.find.mockClear();
      ProfessorModel.find.mockClear();
    });

    it('should reject request witout year', async () => {
      const req = { params: { period: '1' } };
      await getAvailableSubjectsByPeriod(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: true, description: 'Period or Year were not provided' });
    });

    it('should reject request witout period', async () => {
      const req = { params: { year: '2022' } };
      await getAvailableSubjectsByPeriod(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: true, description: 'Period or Year were not provided' });
    });

    it('should return professors', async () => {
      AdvancementModel.distinct.mockImplementationOnce(async () => [subjectId]);

      const year = new Date(dateString).getFullYear();
      const req = { params: { year, period: '1' } };
      await getAvailableSubjectsByPeriod(req, res);

      const dateFrom = new Date(year, 0, 0).toISOString();
      const dateTo = new Date(year + 1, 0, 0).toISOString();

      expect(AdvancementModel.find).toHaveBeenCalledWith({ periodo: req.params.period, añoAvance: { $gte: dateFrom, $lte: dateTo } });
      expect(AdvancementModel.distinct).toHaveBeenCalledWith('asignaturaId');
      expect(SubjectModel.find).toHaveBeenCalledWith({ _id: { $in: [subjectId] } });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ subjects: [{ _id: subjectId }] });
    });
  });
});
