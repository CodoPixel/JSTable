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

    generateCell(cell, colspan) {
        var cellElement = document.createElement('td');
        var content = cell;

        // this.functions cannot be null because there is already <Main>
        for (var func of this.functions) {
            var regex = new RegExp('<' + func.name + '\(.*\)>|<' + func.name + '>', 'gm');
            
            // if there is a function inside the cell
            if (regex.test(cell)) {
                // change the tagname if required
                if (func.tagName) {
                    cellElement = document.createElement(func.tagName);
                }

                // get the arguments if there is a callback function
                if (func.callback) {
                    var args = this.getArgumentsFrom(func.name, cell);
                    content = func.callback(args);
                } else {
                    content = content.replace(regex, '');
                }
            }

            console.log(cellElement);
            cellElement.setAttribute('colspan', colspan);
            cellElement.innerHTML = content;
        }
        
        return cellElement;
    }

    jsArrayToHtml(arr) {
        var table = document.createElement('table');
        for (var y = 0; y < arr.length; y++) {
            var tr = document.createElement('tr');
            for (var i = 0, r = 1, c = 1; i < arr[y].length; i++) {
                if (arr[y][i] === "r.") continue;
                if (arr[y][i] === "c.") continue;

                var colspan = 1;
                while (arr[y][i + r] === "r.") {
                    colspan++;
                    r++;
                }

                var rowspan = 1;
                if (arr[y][i].indexOf("c.") !== -1) {
                    while (arr[y + c][i] === "c.") {
                        rowspan++;
                        c++;
                    }
                }

                var cellElement = this.generateCell(arr[y][i], colspan);
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