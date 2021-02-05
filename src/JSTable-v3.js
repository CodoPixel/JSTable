class JSTable {
    constructor(parent) {
        this.table = null;
        this.functions = [
            {
                name: 'Main',
                arguments: 0,
                callback: null,
                tagName: 'th'
            }
        ];
        
        if (!parent) {
            this.parent = document.body;
        } else {
            this.parent = document.getElementById(parent);
            if (!this.parent) {
                throw new Error("JSTable(): the parent does not exist.");
            }
        }
        
    }

    getCurrentParent() { return this.parent; }
    setCurrentParent(parent) { this.parent = parent; }

    getTable() {
        return this.table;
    }

    /**
     * Add special functions to execute while the creation of the table.
     * @param {Object} options An object that contains a few options in order for the function to work properly.
     */
    addFunction(options) {
        this.functions[this.functions.length] = options;
    }

    getArgumentsFrom(name, cell) {
        var regex = new RegExp('<' + name + '\((.*)\)>', 'gmi');
        cell = cell.replace(', ', ',');
        cell.replace(regex, '$1');
        return RegExp.$1.split(',');
    }

    generateCell(cell) {
        var cellElement = document.createElement('td');

        var self = this;
        this.functions.forEach(function(func) {
            var regex = new RegExp('<' + func.name + '\(.*\)>|<' + func.name + '>', 'gmi');
            if (regex.test(cell)) {
                // change the tagname if needed
                if (func.tagName) cellElement.tagName = func.tagName;

                // get the arguments
                if (func.arguments > 0) {
                    var args = self.getArgumentsFrom(func.name, cell);
                    if (func.callback) {
                        func.callback(args);
                    }
                }
            }
        });

        if (this.isRandomCell(cell)) cellElement = this.randomCell(cell);
        
        cellElement.innerHTML = cell;
        return cellElement;
    }

    jsArrayToHtml(arr) {
        var table = document.createElement('table');
        for (var line of arr) {
            var tr = document.createElement('tr');
            for (var cell of line) {
                var cellElement = this.generateCell(cell);
                tr.appendChild(cellElement);
            }
            table.appendChild(tr);
        }
        return table;
    }

    generate(table) {
        if (!table) {
            if (!this.table) {
                return undefined;
            } else {
                document.body.appendChild(this.table);
            }
        } else {
            document.body.appendChild(table);
        }
    }
}