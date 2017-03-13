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
         * The roots of the file tree.
         * @member {Object.<string, FileTreeNode>}
         */
        this.roots = {};
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
     * Makes sure the tree includes all parts of the path as directories.
     * @param {string} fullPath - The directory path to create.
     * @returns {FileTreeNode} The last node created.
     * @throws If the path is not absolute.
     */
    ensureDirectories (fullPath) {
        if (path.isAbsolute(fullPath) === false)
            throw new Error('The directory path must be absolute');

        const parts = path.parse(fullPath);
        const root = parts.root;
        const remainingPath = fullPath.substring(root.length);
        const segments = remainingPath.length > 0 ? remainingPath.split(path.sep) : [];

        if (!this.roots.hasOwnProperty(root))
            this.roots[root] = new FileTreeNode(root, true);

        let node = this.roots[root];
        for (let i = 0; i < segments.length; i++) {
            const segment = segments[i];

            if (node.hasChild(segment))
                node = node.getChild(segment);
            else {
                const fullPath = path.join(root, ...segments.slice(0, i + 1));
                const newDirectoryNode = new FileTreeNode(fullPath, true);
                node.addChild(newDirectoryNode);
                node = newDirectoryNode;
            }
        }

        return node;
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
        /** @member {string} */
        this.name = path.basename(this.fullPath);
        /** @member {boolean} */
        this.isDirectory = isDirectory;
        /** @member {FileTreeNode} */
        this.parent = null;
        /** @member {Object.<string, FileTreeNode>} */
        this.children = {};
    }

    /**
     * Adds a node as a direct child.
     * @param {FileTreeNode} node - The node to add as a child.
     * @throws If this node is not a directory or if the child node doesn't have a compatible path.
     */
    addChild (node) {
        if (!this.isDirectory)
            throw new Error('Can\'t add a child to a non-directory node!');

        const parts = path.parse(node.fullPath);
        if (parts.dir !== this.fullPath)
            throw new Error(`The path of the node (${parts.dir}) is not compatible with this directory (${this.fullPath})!`);

        this.children[node.name] = node;
        node.parent = this;
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
