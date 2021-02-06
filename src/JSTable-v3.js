/**
 * Defines what is a Cell.
 * A Cell contains its position and its own table.
 */
class Cell {
    /**
     * Defines the main properties of a cell.
     * @param {number} x The x-axis of the cell.
     * @param {number} y The y-axis of the cell.
     * @param {HTMLTableDataCellElement} element The HTML element of the cell.
     * @param {HTMLTableElement} table The table in which the cell is contained.
     */
    constructor(x, y, element, table) {
        this.x = x;
        this.y = y;
        this.element = element;
        this.table = table || document.body;
        this.container = this.table === document.body ? document.body : this.table.parentElement;

        this.attributes = [];
        for (var i = 0; i < this.element.getAttributeNames().length; i++) {
            var name = this.element.getAttributeNames()[i];
            var value = this.element.getAttribute(name);
            this.attributes[this.attributes.length] = [name, value];
        }
    }

    /**
     * Gets the position of a cell in a specific table.
     * @returns {object} The x-axis & y-axis (integers).
     */
    getPos() { return {x:this.x, y:this.y}; }

    /**
     * Gets the cell as a HTML element.
     * @returns {HTMLTableDataCellElement} The cell.
     */
    getElement() { return this.element; }

    /**
     * Gets the table in which the cell is contained.
     * @returns {HTMLTableElement} The table in which the cell is contained.
     */
    getTable() { return this.table; }

    /**
     * Gets the container in which the table is contained.
     * @returns {HTMLElement} The content in which the table is contained.
     */
    getContainer() { return this.container; }

    /**
     * Gets all the attributes of the cell.
     * @returns {Array<string>} The attributes and their names in a two-dimensional array: [[name, value]]
     */
    getAttributes() { return this.attributes; }

    /**
     * Clear the content of a cell.
     */
    clearContent() {
        this.element.textContent = "";
    }
}

/**
 * Manager your tables.
 */
class TableManager {
    /**
     * Manage your tables.
     * @param {HTMLTableElement} table The current table you want to exploit. Not required.
     */
    constructor(table) {
        this.currentTable = table;
    }

    /**
     * Gets the table you are currently exploiting.
     * @returns {HTMLTableElement} The current table.
     */
    getCurrentTable() { return this.currentTable; }

    /**
     * Defines the table to exploit.
     * @param {HTMLTableElement} table The new current table you want to exploit.
     */
    setCurrentTable(table) { this.currentTable = table; }

    /**
     * Checks whether a cell exists in a table according to precise coordinates.
     * @param {number} x The x-axis of the cell.
     * @param {number} y The y-axis of the cell.
     * @param {HTMLTableElement} table The table.
     * @returns {boolean} `true` if the cell exists, otherwise it returns `false`.
     */
    doesExist(x, y, table) {
        if (!table) {
            if (!this.getCurrentTable()) {
                throw new Error("TableManager -> doesExist(): the table is not defined.");
            } else {
                table = this.getCurrentTable();
            }
        }

        try {
            var cell = table.rows[y].childNodes[x];
            return true;
        } catch(e) {
            return false;
        }
    }

    /**
     * Select a cell in a table according to precise coordinates. 
     * @param {number} x The x-axis of a cell.
     * @param {number} y The y-axis of a cell.
     * @param {HTMLTableElement} table The table.
     * @returns {Cell} The wanted cell with some datas (x, y, container). If the cell doesn't exist, then it returns `undefined`.
     */
    selectCell(x, y, table) {
        if (!table) {
            if (!this.getCurrentTable()) {
                throw new Error("TableManager -> selectCell(): the table is not defined.");
            } else {
                table = this.getCurrentTable();
            }
        }
        
        try {
            var cell = table.rows[y].childNodes[x];
            return new Cell(x, y, cell, table);
        } catch (e) {
            return undefined;
        }
    }

    /**
     * Selects several cells (begin to end or end to begin) in a table.
     * @param {object} from The initial coordinates (x1: number = 0, y1: number = 0).
     * @param {object} to The final coordinates (x2: number = 0, y2: number = 0).
     * @param {HTMLTableElement} table The table in which you want to select those cells.
     * @returns {Array<Cell>} An array of Cells.
     */
    selectMultipleCells(from, to, table) {
        if (!table) {
            if (!this.getCurrentTable()) {
                throw new Error("TableManager -> selectMultipleCells(): no table defined.");
            } else {
                table = this.getCurrentTable();
            }
        }

        var cells = [];

        // default values
        if (from.y1 === undefined) from.y1 = 0;
        if (from.x1 === undefined) from.x1 = 0;
        if (to.y2 === undefined) to.y2 = 0;
        if (to.x2 === undefined) to.x2 = 0;

        // if y1 > y2 => must reverse OR if y1 == y2 AND x1 > x2 => must reverse
        var isReversed = (from.y1 > to.y2) || (from.y1 === to.y2 && from.x1 > to.x2);
        if (isReversed) {
            try {
                [from.x1, to.x2, from.y1, to.y2] = [to.x2, from.x1, to.y2, from.y1];
            } catch(e) {
                var temp_x1 = from.x1;
                var temp_x2 = to.x2;
                to.x2 = temp_x1;
                from.x1 = temp_x2;

                var temp_y1 = from.y1;
                var temp_y2 = to.y2;
                to.y2 = temp_y1;
                from.y1 = temp_y2;
            }
        }
        
        // selection
        if (from.y1 === to.y2) {
            var row = table.rows[from.y1];
            for (var i = from.x1; i <= to.x2; i++) {
                cells[cells.length] = new Cell(i, from.y1, row.children[i], table);
            }
        } else if (from.y1 < to.y2) {
            while (!(from.y1 > to.y2)) {
                var row = table.rows[from.y1];
                for (var i = from.x1; i < row.children.length; i++) {
                    cells[cells.length] = new Cell(i, from.y1, row.children[i], table);
                }
                from.y1++;
            }
        }

        if (isReversed) {
            return cells.reverse();
        } else {
            return cells;
        }
    }

    /**
     * Get an instance of Cell of a basic cell in a table.
     * @param {HTMLTableDataCellElement} cell The cell to translate.
     * @param {HTMLTableElement} table The table in which there is the cell.
     * @returns {object<number>} x, y & identifier of the cell.
     */
    translate(cell) {
        var row = cell.parentElement;
        var table = row.parentElement;
        var x = 0;
        var y = 0;

        for (var td of row.children) {
            if (td === cell) {
                break;
            }
            x++;
        }

        for (var tr of table.children) {
            if (tr === row) {
                break;
            }
            y++;
        }

        return new Cell(x, y, cell, table);
    }

    /**
     * Checks if `cell` is an instance of Cell.
     * @param {Object} cell What you want to check.
     */
    isCell(cell) {
        return cell instanceof Cell;
    }

    /**
     * Removes an event listener from a cell.
     * @param {Cell} cell The cell from which you want to remove an event.
     * @param {string} name The name of the event.
     * @param {Function} callback The callback function used for the event.
     */
    removeEventListenerFrom(cell, name, callback) {
        if (!this.isCell(cell)) return;
        cell.getElement().addEventListener(name, callback);
    }

    /**
     * Adds an event listener to a cell.
     * @param {Cell} cell The cell to which you want to add an event.
     * @param {string} name The name of the event.
     * @param {Function} callback The callback function to use for the event.
     */
    addEventListenerTo(cell, name, callback) {
        if (!this.isCell(cell)) return;
        cell.getElement().addEventListener(name, callback);
    }

    /**
     * Permanently deletes a table.
     * @param {HTMLTableElement} table The table to delete.
     */
    deleteTable(table) {
        if (!table) {
            if (!this.getCurrentTable()) {
                throw new Error("TableManager -> deleteTable(): the table is not defined.");
            } else {
                table = this.getCurrentTable();
            }
        }

        while (table.firstChild) {
            table.removeChild(table.firstChild);
        }

        table.style.display="none";
    }

    /**
     * Delete a row from a table.
     * @param {number} y The number of the row (starting from 0).
     * @param {HTMLTableElement} table The table in which you want to delete a row.
     */
    removeRow(y, table) {
        table.deleteRow(y);
    }
}

/**
 * Converts a JS array into a HTML table and generates it in an optimised way.
 */
class JSTable extends TableManager {
    constructor(parent) {
        super();

        this.table = null;
        this.functions = [
            {
                name: 'Main',
                callback: null,
                events: null,
                tagName: 'th',
                attributes: null,
            }
        ];

        this.regexColspan = /\.r\*(\d{1,})/;
        this.regexRowspan = /\.c\*(\d{1,})/;
        
        if (!parent) {
            this.parent = document.body;
        } else {
            this.parent = document.getElementById(parent);
            if (!this.parent) {
                throw new Error("JSTable(): the parent does not exist.");
            }
        }
        
    }

    /**
     * Gets the parent in which the table is generated.
     * @returns {HTMLElement} The parent in which the table is generated.
     */
    getCurrentParent() { return this.parent; }

    /**
     * Defines the parent in which the table has to be generated.
     * @param {HTMLElement} parent The parent in which the table has to be generated.
     */
    setCurrentParent(parent) { this.parent = parent; }

    /**
     * @returns {HTMLTableElement} The generated table.
     */
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

    /**
     * Get the arguments of a custom function inside the content of a cell. Do not use this function.
     * @param {string} name The name of the custom function.
     * @param {HTMLTableDataCellElement} cell The cell that is currently being generated
     */
    _getArgumentsFrom(name, cell) {
        var regex = new RegExp('<' + name + '\((.*)\)>', 'gmi');
        cell = cell.replace(', ', ',');
        cell.replace(regex, '$1');
        return RegExp.$1.replace(/\(|\)/gm, '').split(',');
    }

    generateCell(cell, colspan, rowspan) {
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
                    var args = this._getArgumentsFrom(func.name, cell);
                    content = func.callback(args);
                } else {
                    content = content.replace(regex, '');
                }

                // set the attributes
                if (func.attributes) {
                    for (var attr of func.attributes) {
                        cellElement.setAttribute(attr[0], attr[1]);
                    }
                }

                // add the wanted events to the cell
                if (func.events) {
                    for (var event of func.events) {
                        cellElement.addEventListener(event[0], event[1]);
                    }
                }
            }

            cellElement.setAttribute('colspan', colspan);
            cellElement.setAttribute('rowspan', rowspan);
            cellElement.innerHTML = content;
        }
        
        return cellElement;
    }

    _getColspanIdentifierFrom(cell) {
        var colspan = 1;
        if (this.regexColspan.test(cell) === true) {
            cell.replace(this.regexColspan, '$1');
            colspan = parseInt(RegExp.$1);
        }

        return colspan;
    }

    _getRowspanIdentifierFrom(cell) {
        var rowspan = 1;
        if (this.regexRowspan.test(cell) === true) {
            cell.replace(this.regexRowspan, '$1');
            rowspan = parseInt(RegExp.$1);
        }

        return rowspan;
    }

    _clearAllIdentifiersOf(cell) {
        cell = cell.replace(this.regexColspan, '');
        cell = cell.replace(this.regexRowspan, '');
        return cell;
    }

    jsArrayToHtml(arr) {
        this.table = document.createElement('table');

        for (var y = 0; y < arr.length; y++) {
            var tr = document.createElement('tr');
            for (var x = 0; x < arr[y].length; x++) {
                var cell = arr[y][x];
                if (cell === ".") continue;

                var colspan = this._getColspanIdentifierFrom(cell);
                var rowspan = this._getRowspanIdentifierFrom(cell);
                cell = this._clearAllIdentifiersOf(cell);
                
                var cellElement = this.generateCell(cell, colspan, rowspan);
                tr.appendChild(cellElement);
            }
            this.table.appendChild(tr);
        }

        return this.table;
    }

    generate(table) {
        if (!table) {
            if (!this.table) {
                return undefined;
            } else {
                table = this.table;
            }
        }

        this.parent.appendChild(table);
    }
}