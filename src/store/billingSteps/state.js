export default {
  current: 0,
  currentModal: 0,
  loading: false,

  org: {
    name: null,
    description: null,
  },
  orgError: null,
  project: {
    name: null,
    dateFormat: 'D',
    timeZone: 'America/Argentina/Buenos_Aires',
  },
  projectError: null,
  users: [],
  userChanges: {},
};
