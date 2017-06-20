import React from 'react';
import path from 'path';
import { remote } from 'electron';

const weaki = remote.getGlobal('instance');

const TEMPLATES_LOCATION = '.weaki/templates';

class PageTemplates extends React.Component {

    constructor (props) {
        super(props);
        this.state = {
            templates: [],
            currentTemplate: null
        };
    }

    componentDidMount () {
        this.updateTemplates();
    }

    shouldComponentUpdate (nextProps, nextState) {
        return this.state !== nextState ||
            nextProps.file !== this.props.file ||
            nextProps.file.template !== this.state.template;
    }

    componentWillReceiveProps (nextProps) {
        if (nextProps.file.template !== this.state.currentTemplate)
            this.setState({ currentTemplate: nextProps.file.template });
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
        const items = this.state.templates.map((template, index) => {
            return <PageTemplate key={index}
                template={template}
                file={this.props.file}
                editor={this.props.editor}/>;
        });
        return <ul className='page-templates'>
            <h2 className='page-templates-title'>Templates</h2>
            {items}
        </ul>;
    }

};

class PageTemplate extends React.Component {

    constructor (props) {
        super(props);
        this.state = {
            controlsHidden: true,
            variables: [],
            values: {}
        };

        const variableRegex = /{{([^}]+)}}/g;
        let match = null;
        while ((match = variableRegex.exec(this.props.template.content)))
            this.state.variables.push(match[1]);
    }

    onApply (event) {
        const pathParsed = path.parse(this.props.template.stat.path);

        this.props.editor.applyTemplate({
            name: pathParsed.name,
            content: this.props.template.content
        }, this.state.values);
    }

    render () {
        const pathParsed = path.parse(this.props.template.stat.path);

        const classes = ['page-template'];
        if (this.props.file.template && this.props.file.template.name === pathParsed.name)
            classes.push('page-template-current');

        return <li className={classes.join(' ')}>
            <div className="page-template-header"
                onClick={() => this.setState({ controlsHidden: !this.state.controlsHidden })}>
                <span className='octicon-white octicon-file'></span>
                {pathParsed.name}
            </div>
            <div className={this.state.controlsHidden ? 'page-template-controls-hidden' : 'page-template-controls'}>
                {this.state.variables.map(variable =>
                    <div className="page-template-input">
                        {variable}
                        <textarea type="text"
                            value={this.state.values[variable]}
                            onChange={(event) => {
                                this.state.values[variable] = event.target.value;
                                this.setState({ value: this.state.values });
                            }}>
                            </textarea>
                    </div>)}
                <span className="button" onClick={this.onApply.bind(this)}>Apply</span>
            </div>
        </li>;
    }

};

export default PageTemplates;
export { PageTemplates, PageTemplate };
