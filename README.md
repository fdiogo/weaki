# Weaki [![Build Status](https://travis-ci.org/fdiogo/weaki.svg?branch=master)](https://travis-ci.org/fdiogo/weaki)
An electron based tool for agile software documentation

## Features

### Versioned references

Instead of copying and pasting pieces of code you can instead reference them and be sure everything's always up-to-date.

#### Reference a file
A reference can be created by enclosing the path of the file with square brackets. This path can either be absolute or relative to the repository. This syntax is compatible with regular markdown links.

```markdown
[app.js]
[app.js](https://github.com/fdiogo/weaki/blob/master/app.js)
```

#### Specifify sections of a file
If there's a need to only reference certain parts of a file it's possible to add the name of a section preceded by a "@". These are called **sections** which are specific to the file's type. For example, the sections of a JavaScript file are its **classes** and **functions**.

```markdown
[app.js@Weaki]
```

#### Specify versions of a file
It's possible to specify the version of a file by identifying a **commit**  through its hash or even by an offset to the latest, both preceded by a "#". The latter is not recommended as a permanent option since the referenced commit is altered as new ones are created. On the other hand it's a good way to quickly preview an older version of the file when editing.

```markdown
[app.js@Weaki#b5bcf]
[app.js@Weaki#HEAD~10]
```