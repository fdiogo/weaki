import { remote } from 'electron';

const weaki = remote.getGlobal('instance');
const regex = /([\w\.]+)@([\w\.]*)(?!#([\w\.]*))?]/; //eslint-disable-line

class JavascriptSuggester {

    getSuggestions (textDescriptor, editor) {
        const match = regex.exec(textDescriptor.currentWord.text);
        if (!match)
            return [];

        const fileName = match[1];
        const sectionName = match[2];
        const commitHash = match[3];

        const sectionStart = textDescriptor.currentWord.start + match.index + fileName.length + 1;
        const sectionEnd = sectionStart + sectionName.length;

        return weaki.fileInterpreter.interpretFile(fileName, null, commitHash)
        .then(file => {
            const suggestions = [];

            for (let section of file.sections) {
                if (section.name !== sectionName && section.name.indexOf(sectionName) === 0) {
                    suggestions.push({
                        icon: 'icon icon-javascript',
                        text: section.name,
                        action: () => editor.replaceRange(sectionStart, sectionEnd, section.name)
                    });
                }
            }

            return suggestions;
        });
    }

};

export default JavascriptSuggester;
