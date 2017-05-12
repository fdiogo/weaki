import FileCrawler from './file-crawler';
const babylon = require('babylon');

class JavascriptCrawler extends FileCrawler {

    getSection (name) {
        if (!this.content)
            return null;

        const identifiers = name.split('.');
        const AST = babylon.parse(this.content, {
            sourceType: 'module',
            plugins: ['jsx']
        });

        let node = AST.program;
        let children = node.body;
        for (let identifier of identifiers) {
            for (let child of children) {
                if (!child.id && !child.key)
                    continue;

                const name = child.id ? child.id.name : child.key.name;
                if (name !== identifier)
                    continue;

                if (child.type === 'ClassDeclaration') {
                    node = child;
                    children = child.body.body;
                    break;
                } else if (child.type === 'FunctionDeclaration' || child.type === 'ClassMethod') {
                    node = child;
                    children = child.bod;
                    break;
                }
            }
        }

        if (node === AST.program)
            return null;

        let section = '';
        if (node.leadingComments && node.leadingComments.length > 0)
            section += `/*${node.leadingComments.map(comment => comment.value).join('')}*/\n`;

        section += this.content.substring(node.start, node.end);

        return section;
    }

}

export default JavascriptCrawler;
