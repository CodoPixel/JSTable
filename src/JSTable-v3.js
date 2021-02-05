class JSTable {
    constructor(parent) {
        this.table = null;
        this.functions = [
            {
                name: 'Main',
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
        return RegExp.$1.replace(/\(|\)/gm, '').split(',');
    }

    generateCell(cell) {
        var cellElement = document.createElement('td');

        // this.functions cannot be null because there is already <Main>
        for (var func of this.functions) {
            var regex = new RegExp('<' + func.name + '\(.*\)>|<' + func.name + '>', 'gm');
            
            // if there is a function inside the cell
            if (regex.test(cell)) {
                // change the tagname if required
                if (func.tagName) cellElement = document.createElement(func.tagName);

                // get the arguments if there is a callback function
                if (func.callback) {
                    var args = this.getArgumentsFrom(func.name, cell);
                    cellElement.innerHTML = func.callback(args);
                    continue;
                }
            }

            // otherwise
            cell = cell.replace(regex, '');
            cellElement.innerHTML = cell;
        }
        
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