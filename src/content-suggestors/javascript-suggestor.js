import { remote } from 'electron';

const weaki = remote.getGlobal('instance');
const regex = /([\w\.]+)@([\w\.]*)]/;

class JavascriptSuggestor {

    getSuggestions (textDescriptor) {
        return [];

        // const match = regex.exec(textDescriptor.currentWord.text);
        // if (!match)
        //     return [];
        //
        // const fileName = match[1];
        // const sectionName = match[2];
        //
        // return weaki.fileInterpreter.interpretFile(fileName)
        // .then(file => {
        //     const suggestions = [];
        //
        //     for (let section of file.sections) {
        //         if (section.name.indexOf(sectionName) === 0) {
        //             suggestions.push({
        //                 icont: 'icon icon-javascript',
        //                 text: section.name
        //             });
        //         }
        //     }
        //
        //     return suggestions;
        // });
    }

};

export default JavascriptSuggestor;
