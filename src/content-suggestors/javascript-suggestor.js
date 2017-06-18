import { remote } from 'electron';

const weaki = remote.getGlobal('instance');
const regex = /([\w\.]+)@([\w\.]*)]/;

class JavascriptSuggestor {

    getSuggestions (textDescriptor, editor) {
        const match = regex.exec(textDescriptor.currentWord.text);
        if (!match)
            return [];

        const fileName = match[1];
        const sectionName = match[2];

        const sectionStart = textDescriptor.currentWord.start + match.index + fileName.length + 1;
        const sectionEnd = sectionStart + sectionName.length;

        return weaki.fileInterpreter.interpretFile(fileName)
        .then(file => {
            const suggestions = [];

            for (let section of file.sections) {
                if (section.name !== sectionName && section.name.indexOf(sectionName) === 0) {
                    suggestions.push({
                        icont: 'icon icon-javascript',
                        text: section.name,
                        action: () => editor.replaceRange(sectionStart, sectionEnd, section.name)
                    });
                }
            }

            return suggestions;
        });
    }

};

export default JavascriptSuggestor;
