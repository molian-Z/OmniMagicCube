import * as monaco from 'monaco-editor'

export const completions = (t: any) => {
    return [
        {
            label: 'vars',
            kind: monaco.languages.CompletionItemKind.Property,
            insertText: 'vars',
            detail: t('codeEditor.getVars'),
            sortText: '0000',
            prefix: ['this']
        },
        {
            label: 'app',
            kind: monaco.languages.CompletionItemKind.Property,
            insertText: 'app',
            detail: t('codeEditor.getApp'),
            sortText: '0001',
            prefix: ['this']
        },
        {
            label: '$refs',
            kind: monaco.languages.CompletionItemKind.Property,
            insertText: '$refs',
            detail: t('codeEditor.getRefs'),
            sortText: '0002',
            prefix: ['this']
        }
    ]
}

export const getHighRules = () => {
    return [
        {
            token: "keyword.operator",
            regex: /(?<=\.)($slot|vars|$refs)\b/,
            caseInsensitive: true,
        }
    ]
}