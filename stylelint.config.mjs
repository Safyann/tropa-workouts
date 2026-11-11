export default {
  extends: ['stylelint-config-recommended'],
  overrides: [
    {
      files: ['**/*.module.css'],
      rules: {
        'property-no-unknown': [true, { ignoreProperties: ['composes'] }],
      },
    },
  ],
};
