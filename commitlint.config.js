/* eslint-disable no-undef */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', ['feat', 'fix', 'wip', 'patch', 'build', 'chore', 'refactor']],
  },
};
