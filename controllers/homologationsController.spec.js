const {
  getAvailablePeriods,
  queryHomologationsCount,
  queryHomologations,
} = require('./homologationsController');
const HomologationModel = require('../models/homologation');

const dateString = '2022-01-01T05:00:00.000Z';

jest.mock('../models/homologation', () => ({
  distinct: jest.fn(async (param) => param === 'añoHomologacion' ? [new Date(dateString)] : ['1']),
  find: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  sort: jest.fn(() => []),
  count: jest.fn(() => 1)
}));

const res = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis()
};

describe('Homologations', () => {
  describe('query config', () => {
    beforeEach(() => {
      res.status.mockClear();
      res.json.mockClear();

      HomologationModel.distinct.mockClear();
      HomologationModel.find.mockClear();
    });

    it('sould query all data', async () => {
      await queryHomologations({}, false);

      expect(HomologationModel.skip).not.toHaveBeenCalled();
      expect(HomologationModel.limit).not.toHaveBeenCalled();
      expect(HomologationModel.find).toHaveBeenCalled();
      expect(HomologationModel.sort).toHaveBeenCalled();
    });

    it('sould paginate', async () => {
      await queryHomologations({}, true, 0);

      expect(HomologationModel.skip).toHaveBeenCalled();
      expect(HomologationModel.limit).toHaveBeenCalled();
    });
  });
});

describe('Homologations', () => {
  describe('periods', () => {
    beforeEach(() => {
      res.status.mockClear();
      res.json.mockClear();

      HomologationModel.distinct.mockClear();
      HomologationModel.find.mockClear();
    });

    it('should return periods', async () => {
      await getAvailablePeriods(undefined, res);

      const year = new Date(dateString).getFullYear();
      const dateFrom = new Date(year, 0, 0).toISOString();
      const dateTo = new Date(year + 1, 0, 0).toISOString();

      expect(HomologationModel.distinct).toHaveBeenCalledTimes(2);
      expect(HomologationModel.distinct).toHaveBeenCalledWith('añoHomologacion');
      expect(HomologationModel.distinct).toHaveBeenCalledWith('periodo');
      expect(HomologationModel.find).toHaveBeenCalledWith({ añoHomologacion: { $gte: dateFrom, $lte: dateTo } });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ periods: ['2022 - 1'] });
    });

    it('should catch error', async () => {
      HomologationModel.distinct.mockImplementationOnce(async () => { throw new Error('test'); });
      await getAvailablePeriods(undefined, res);

      expect(HomologationModel.distinct).toHaveBeenCalledWith('añoHomologacion');
      expect(HomologationModel.find).toHaveBeenCalledTimes(0);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: true, description: 'test' });
    });

    it('should filter repeated years', async () => {
      const duplicatedYearDate = '2022-02-02T05:00:00.000Z';
      HomologationModel.distinct.mockImplementationOnce(async () => [new Date(dateString), new Date(duplicatedYearDate)]);
      await getAvailablePeriods(undefined, res);

      expect(HomologationModel.find).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ periods: ['2022 - 1'] });
    });
  });
});

describe('Homologations', () => {
  describe('Count', () => {
    it('should count with query', async () => {
      const count = await queryHomologationsCount({});

      expect(HomologationModel.count).toHaveBeenCalled();
      expect(count).toBe(1);
    });
  });
});
