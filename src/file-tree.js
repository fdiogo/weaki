import path from 'path';

/**
 * Represents a file tree.
 * @class FileTree
 */
class FileTree {

    /**
     * @constructor
     */
    constructor () {
        /**
         * The root of the file tree.
         * @member {FileTreeNode}
         */
        this.root = new FileTreeNode('', true);
    }

    /**
     * Adds a directory to the tree creating the intermediate directories if necessary.
     * @param {string} directory - The full name of the directory.
     * @returns {boolean} The added node.
     * @throws If there is not parent directory on the tree.
     */
    addDirectory (directory) {
        return this.ensureDirectories(directory);
    }

    /**
     * Adds a file to the tree creating the intermediate directories if necessary.
     * @param {string} fullPath - The full path of the file.
     * @returns {FileTreeNode} - The created node.
     * @throws If there is not parent directory on the tree.
     */
    addFile (fullPath) {
        const parts = path.parse(fullPath);
        let parent = this.ensureDirectories(parts.dir);

        const node = new FileTreeNode(fullPath, false);
        parent.addChild(node);

        return node;
    }

    /**
     * Obtains a node by its full path.
     * @param {string} fullPath - The full path of the node.
     * @returns {FileTreeNode} - The wanted node or null if non-existent.
     */
    getNode (fullPath) {
        if (path.isAbsolute(fullPath) === false)
            return null;

        const parts = path.parse(fullPath);

        let node = this.roots[parts.root];
        if (!node)
            return null;

        const dir = path.dir.substring(parts.root.length);
        const segments = dir.split(path.sep);
        for (let segment of segments) {
            if (node.hasChild(segment))
                node.getChild(segment);
            else
                return null;
        }

        return node;
    }

    /**
     * Searches for the lowest node in the tree from which is possible to reach the remaining lower nodes.
     *
     * For example, if the tree consists of:        Or this:                       Or this:
     *           / (dir)                                / (dir)                         / (dir)
     *           |                                      |                               |
     *         home (dir)                              home (dir)                      home (dir)
     *           |                                      |                               |
     *         user (dir)                              user (dir)                      user (dir)
     *        /    \                                    |
     *  Documents  Desktop                           file.txt (file)
     *    (dir)      (dir)
     *
     * The returned node is 'user'           The returned node is 'user'        The returned node is 'user'
     */
    getWorkspaceNode () {
        let node = this.root;
        while (node.hasChildren()) {
            const childrenNames = Object.keys(node.children);
            if (childrenNames.length === 0 || childrenNames.length > 1)
                return node;
            else {
                const childNode = node.getChild(childrenNames[0]);
                if (!childNode.isDirectory)
                    return node;
                else
                    node = childNode;
            }
        }

        return node;
    }

    /**
     * Makes sure the tree includes all parts of the path as directories.
     * @param {string} fullPath - The directory path to create.
     * @returns {FileTreeNode} The last node created.
     * @throws If the path is not absolute.
     */
    ensureDirectories (fullPath) {
        if (path.isAbsolute(fullPath) === false)
            throw new Error('The directory path must be absolute');

        const segments = FileTree.splitPath(fullPath);
        let node = this.root;
        for (let i = 0; i < segments.length; i++) {
            const segment = segments[i];

            if (node.hasChild(segment))
                node = node.getChild(segment);
            else {
                const fullPath = path.join(...segments.slice(0, i + 1));
                const newDirectoryNode = new FileTreeNode(fullPath, true);
                node.addChild(newDirectoryNode);
                node = newDirectoryNode;
            }
        }

        return node;
    }

    /**
     * Returns the relative path of the node to the workspace.
     * @param {FileTreeNode} node - The relative node.
     * @returns {string} - The relative path of the node.
     */
    getWorkspaceRelativePath (node) {
        const workspaceNode = this.getWorkspaceNode();
        return path.relative(workspaceNode.fullPath, node.fullPath);
    }

    /**
     *
     */
    static splitPath (fullPath) {
        const parsed = path.parse(fullPath);
        const exceptRoot = fullPath.substring(parsed.root.length);
        const segments = [parsed.root].concat(exceptRoot.split(path.sep));
        return segments;
    }
}

/**
* Represents a node in a {@link FileTree}.
 * @class FileTreeNode
 */
class FileTreeNode {

    constructor (fullPath, isDirectory) {
        /** @member {string} */
        this.fullPath = fullPath;
        /** @member {boolean} */
        this.isDirectory = isDirectory;
        /** @member {FileTreeNode} */
        this.parent = null;
        /** @member {Object.<string, FileTreeNode>} */
        this.children = {};
        /** @member {string} */
        this.name = path.basename(this.fullPath);
        if (this.name.length === 0)
            this.name = this.fullPath;
    }

    /**
     * Adds a node as a direct child.
     * @param {FileTreeNode} node - The node to add as a child.
     * @throws If this node is not a directory or if the child node doesn't have a compatible path.
     */
    addChild (node) {
        if (!this.isDirectory)
            throw new Error('Can\'t add a child to a non-directory node!');

        if (this.parent !== null && path.relative(node.fullPath, this.fullPath) !== '..')
            throw new Error(`The path '${node.fullPath}' is not compatible with this directory (${this.fullPath})!`);

        this.children[node.name] = node;
        node.parent = this;
    }

    /**
     * Looks for children in the node.
     * @returns {boolean} True if the node has children.
     */
    hasChildren () {
        return Object.keys(this.children).length !== 0;
    }

    /**
     * Tests to see if the node has the named child.
     * @param {string} childName - The name of the child node.
     * @returns {boolean} - Whether the node exists or not.
     */
    hasChild (childName) {
        return this.children.hasOwnProperty(childName);
    }

    /**
     * Obtains the child node by name.
     * @param {string} childName - The name of the child node.
     * @returns {FileTreeNode} - The child node or null if non-existing.
     */
    getChild (childName) {
        if (!this.hasChild(childName))
            return null;
        else
            return this.children[childName];
    }

}

export default FileTree;
export { FileTree, FileTreeNode };
