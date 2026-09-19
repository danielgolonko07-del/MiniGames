export default {
    extends: ['@commitlint/config-conventional'],

    rules: {
        'type-enum': [
            2,
            'always',
            [
                'init',
                'feat',
                'fix',
                'refactor',
                'docs',
                'style',
                'test',
                'chore',
                'build',
                'ci',
                'perf',
                'revert',
            ],
        ],

        'type-case': [2, 'always', 'lower-case'],
        'subject-empty': [2, 'never'],
    },
};