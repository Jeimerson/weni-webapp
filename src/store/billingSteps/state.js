export default {
  current: 0,
  currentModal: 0,
  loading: false,
  isActiveNewWhatsappIntegrations: false,
  integrations: '1',
  flow: '',
  org: {
    name: null,
    description: null,
  },
  orgError: null,
  project: {
    name: null,
    dateFormat: 'D',
    timeZone: 'America/Argentina/Buenos_Aires',
    format: null,
  },
  projectError: null,
  users: [],
  billing_details: {
    customer: '',
    address: {
      city: '',
      country: '',
      line1: '',
      line2: null,
      postal_code: '',
      state: '',
    },
    email: null,
    name: '',
    phone: null,
    cpfOrCnpj: '',
    additionalInformation: '',
  },
  pricing: {
    status: null,
    plans: {},
  },
};
