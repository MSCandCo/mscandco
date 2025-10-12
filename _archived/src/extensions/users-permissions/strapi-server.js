module.exports = (plugin) => {
  // Override the registration controller
  plugin.controllers.auth.register = async (ctx) => {
    const pluginStore = strapi.store({
      environment: '',
      type: 'plugin',
      name: 'users-permissions',
    });

    const settings = await pluginStore.get({
      key: 'advanced',
    });

    if (!settings.allow_register) {
      throw new ApplicationError('Register action is currently disabled');
    }

    const params = {
      ...ctx.request.body,
      provider: 'local',
    };

    params.password = await strapi.plugin('users-permissions').service('user').hashPassword(params);

    const user = await strapi.query('plugin::users-permissions.user').create({
      ...params,
      confirmed: false,
      emailVerificationCode: Math.floor(100000 + Math.random() * 900000).toString(),
      emailVerificationExpires: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
    });

    const sanitizedUser = await strapi.plugin('users-permissions').service('user').sanitizeUser(user);

    ctx.send({
      jwt: strapi.plugin('users-permissions').service('jwt').issue(strapi.utils.sanitizeEntity(sanitizedUser, { model: strapi.getModel('plugin::users-permissions.user') })),
      user: sanitizedUser,
    });
  };

  return plugin;
}; 