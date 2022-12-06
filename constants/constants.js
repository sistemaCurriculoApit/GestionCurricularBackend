const constant = {};

constant.paginationSize = 15;

constant.userProfilesObject = {
  admin: {
    id: 1,
    title: 'Administrador',
  },
  coorProg: {
    id: 2,
    title: 'CoordinadorPrograma',
  },
  doc: {
    id: 3,
    title: 'Docente',
  },
  est: {
    id: 4,
    title: 'Estudiante',
  },
  coorArea: {
    id: 5,
    title: 'CoordinadorArea',
  }
};

constant.userProfilesArray = [
  {
    id: 1,
    title: 'Administrador',
  },
  {
    id: 2,
    title: 'CoordinadorPrograma',
  },
  {
    id: 3,
    title: 'Docente',
  },
  {
    id: 4,
    title: 'Estudiante'
  },
  {
    id: 5,
    title: 'CoordinadorArea',
  }
];

module.exports = constant;
