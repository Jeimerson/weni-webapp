import request from './request.js';

export default {
  list(offset, limit) {
    return request
      .$http()
      .get(`/v1/organization/org/?offset=${offset}&limit=${limit}`);
  },

  createOrg(name, description) {
    return request.$http().post('/v1/organization/org/', {
      name,
      description,
    });
  },

  editOrg(uuid, name, description) {
    return request.$http().patch(`/v1/organization/org/${uuid}/`, {
      name,
      description,
    });
  },

  deleteOrg(uuid) {
    return request.$http().delete(`/v1/organization/org/${uuid}/`);
  },

  getMembers(uuid, offset, limit, search) {
    const searchQuery = search && search.length > 0 ? `&search=${search}` : '';
    return request
      .$http()
      .get(
        `/v1/organization/authorizations/?organization=${uuid}&limit=${limit}&offset=${offset}${searchQuery}`,
      );
  },

  addAuthorization(orgId, username, role) {
    return request
      .$http()
      .put(`/v1/organization/authorizations/${orgId}/${username}/`, {
        role: role,
      });
  },

  removeAuthorization(orgId, username) {
    return request
      .$http()
      .delete(`/v1/organization/authorizations/${orgId}/${username}/`);
  },

  changeAuthorization(orgId, username, role) {
    return request
      .$http()
      .patch(`/v1/organization/authorizations/${orgId}/${username}/`, {
        role: role,
      });
  },

  createRequestPermission({ organization, email, role }) {
    return request.$http().post('/v1/organization/request-permission/', {
      organization,
      email,
      role,
    });
  },

  deleteRequestPermission({ id, organization }) {
    return request
      .$http()
      .delete(`/v1/organization/request-permission/${id}/`, {
        params: {
          organization,
        },
      });
  },

  listRequestPermission({ organization, page = 1, limit = 20 }) {
    const offset = limit * (page - 1);

    return request.$http().get('/v1/organization/request-permission/', {
      params: {
        organization,
        offset,
        limit,
      },
    });
  },

  leaveOrg(orgId, username) {
    return request
      .$http()
      .delete(
        `/v1/organization/authorizations/${orgId}/${username}/remove_my_user/`,
      );
  },
};
