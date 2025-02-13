import { shallowMount, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import Router from 'vue-router';
import home from '@/views/home.vue';
import i18n from '@/utils/plugins/i18n';
import { org } from '../../__mocks__';
import profile from '../../__mocks__/profile';
import project from '../../__mocks__/project';

const localVue = createLocalVue();
localVue.use(Vuex);
localVue.use(Router);

const router = new Router();

jest.mock('@/api/request.js', () => {});

describe('home.vue', () => {
  let wrapper;
  let store;
  let actions;
  let getters;
  let state;

  beforeEach(() => {
    getters = {
      currentOrg: () => {
        return org;
      },
      currentProject: () => {
        return project;
      },
    };
    state = {
      Account: {
        profile,
      },
    };
    actions = {
      updateProfile: jest.fn(),
      updateProfilePicture: jest.fn(),
      removeProfilePicture: jest.fn(),
      openModal: jest.fn(),
    };

    store = new Vuex.Store({
      getters,
      actions,
      state,
    });

    wrapper = shallowMount(home, {
      localVue,
      i18n,
      store,
      router,
      mocks: {
        $t: () => 'some specific text',
      },
      stubs: {
        unnnicButton: true,
        emoji: true,
        unnnicAccordion: true,
      },
    });
  });

  it('should be rendered properly', () => {
    expect(wrapper).toMatchSnapshot();
  });
});
