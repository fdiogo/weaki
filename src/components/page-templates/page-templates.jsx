import React from 'react';
import path from 'path';
import { remote } from 'electron';

const weaki = remote.getGlobal('instance');

const TEMPLATES_LOCATION = '.weaki/templates';

class PageTemplates extends React.Component {

    constructor (props) {
        super(props);
        this.state = {
            templates: []
        };
    }

    componentDidMount () {
        this.updateTemplates();
    }

    shouldComponentUpdate (nextProps, nextState) {
        return this.state !== nextState;
    }

    updateTemplates () {
        return weaki.fileManager.createDirectory(TEMPLATES_LOCATION)
            .then(() => weaki.fileManager.readDirectory(TEMPLATES_LOCATION))
            .then(files => {
                const promises = [];
                for (let file of files) {
                    const promise = weaki.fileManager.readFile(file.path)
                        .then(content => ({ stat: file, content: content }));

                    promises.push(promise);
                }

                return Promise.all(promises);
            })
            .then(templates => this.setState({ templates: templates }));
    }

    render () {
        console.log('Templates rendered');
        const items = this.state.templates.map((template, index) => {
            return <PageTemplate key={index}
                template={template}
                editor={this.props.editor}/>;
        });
        return <ul className='page-templates'>
            <h2 className='page-templates-title'>Templates</h2>
            {items}
        </ul>;
    }

};

class PageTemplate extends React.Component {

    onClick (event) {
        this.props.editor.refs.textEditor.replaceText(this.props.template.content);
    }

    render () {
        const pathParsed = path.parse(this.props.template.stat.path);

        return <li className="page-template" onClick={this.onClick.bind(this)}>
            {pathParsed.name}
        </li>;
    }

};

export default PageTemplates;
export { PageTemplates, PageTemplate };
