import orgs from '../../api/orgs';
import { unnnicCallModal } from '@weni/unnnic-system';

export default {
  getOrgs(store, { page = 1, limit = 20 }) {
    const offset = limit * (page - 1);
    return orgs.list(offset, limit);
  },

  async createOrg(
    {
      commit,
      rootState: {
        BillingSteps: { org },
      },
    },
    orgType,
  ) {
    commit('ORG_CREATE_REQUEST');
    try {
      const response = await orgs.createOrg(org.name, org.description, orgType);
      commit('ORG_CREATE_SUCCESS', response.data);
    } catch (e) {
      commit('ORG_CREATE_ERROR', e);
      commit('OPEN_MODAL', {

      })
    }
  },

  editOrg(store, { uuid, name, description }) {
    return orgs.editOrg(uuid, name, description);
  },

  deleteOrg(store, { uuid }) {
    return orgs.deleteOrg(uuid);
  },

  getMembers(store, { uuid, page = 1, limit = 20, search }) {
    const offset = limit * (page - 1);
    return orgs.getMembers(uuid, offset, limit, search);
  },

  addAuthorization(store, { orgId, username, role }) {
    return orgs.addAuthorization(orgId, username, role);
  },

  removeAuthorization(store, { orgId, username }) {
    return orgs.removeAuthorization(orgId, username);
  },

  changeAuthorization(store, { orgId, username, role }) {
    return orgs.changeAuthorization(orgId, username, role);
  },

  leaveOrg(store, { orgId, username }) {
    return orgs.leaveOrg(orgId, username);
  },

  setCurrentOrg(
    { commit },
    { name, uuid, inteligence_organization, authorization } = {},
  ) {
    commit('setCurrentOrg', {
      name,
      uuid,
      inteligence_organization,
      authorization,
    });
  },

  clearCurrentOrg({ commit }) {
    commit('setCurrentOrg', null);
  },
};
