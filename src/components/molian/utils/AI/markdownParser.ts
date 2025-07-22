export function parseMarkdownChanges(markdown: string) {
    const changes = [];

    // 使用正则表达式解析Markdown中的代码块
    const codeBlockRegex = /```(\w+)(?::([^\n]+))?\n([\s\S]*?)```/g;
    let match;

    while ((match = codeBlockRegex.exec(markdown)) !== null) {
        const language = match[1];
        const identifier = match[2] || ''; // 可能是路径或其他标识符
        const content = match[3].trim();

        // 简化处理，直接将内容作为值
        changes.push({
            type: 'modified', // 默认为修改
            identifier: identifier, // 使用identifier替代path
            language: language,
            value: content
        });
    }

    return changes;
}