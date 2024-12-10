export const completions = (t) => {
    return [{
            meta: t('codeEditor.getVars'),
            caption: `vars`,
            value: `vars`,
            score: 9999,
            mode: "javascript",
            prefix: ["this"],
        },
        {
            meta: t('codeEditor.getApp'),
            caption: `app`,
            value: `app`,
            score: 9999,
            mode: "javascript",
            prefix: ["this"],
        },
        {
            meta: t('codeEditor.getRefs'),
            caption: `$refs`,
            value: `\$refs`,
            score: 9999,
            mode: "javascript",
            prefix: ["this"],
        },
    ]
}

export const getHighRules = () => {
    return [{
        token: "keyword.operator",
        regex: /(?<=\.)(\$slot|vars|\$refs)\b/,
        caseInsensitive: true,
      }]
}