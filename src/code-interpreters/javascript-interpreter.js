import CodeInterpreter from './code-interpreter';
const babylon = require('babylon');

class JavascriptInterpreter extends CodeInterpreter {

    static getSections (text) {
        const AST = babylon.parse(text, {
            sourceType: 'module',
            plugins: ['jsx']
        });

        return getRelevantSections(AST.program);
    }

};

function getRelevantSections (baseNode, prefix = []) {
    const sections = [];
    for (let child of baseNode.body) {
        if (child.type !== 'ClassDeclaration' && child.type !== 'FunctionDeclaration' && child.type !== 'ClassMethod')
            continue;

        const name = child.id ? child.id.name : child.key.name;
        const newPrefix = prefix.concat([name]);
        const completeName = newPrefix.join('.');

        let start = child.start;
        if (child.leadingComments)
            start = child.leadingComments[0].start;

        const section = {
            start: start,
            end: child.end,
            name: completeName
        };

        sections.push(section);

        if (child.type === 'ClassDeclaration')
            sections.push(...getRelevantSections(child.body, newPrefix));
    }

    return sections;
}

JavascriptInterpreter.fileType = 'javascript';
JavascriptInterpreter.fileExtension = ['js', 'jsx'];

export default JavascriptInterpreter;
