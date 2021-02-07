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
        try {
            for (var i = 0; i < this.element.getAttributeNames().length; i++) {
                var name = this.element.getAttributeNames()[i];
                var value = this.element.getAttribute(name);
                this.attributes[this.attributes.length] = [name, value];
            }
        } catch(e) {
            throw new Error("En error has occured while trying to create a cell from a HTML element.");
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
 * Converts a JS array into a HTML table and generates it in an optimised way.
 */
class JSTable {
    constructor(commonClass) {
        this.commonClass = commonClass;
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
    }

    /**
     * Adds a common class to all cells when they are being generated.
     * @param {string} commonClass The class to add to each cell before generation.
     */
    setCommonClass(commonClass) {
        this.commonClass = commonClass;
    }

    /**
     * Checks whether a cell exists in a table according to precise coordinates.
     * @param {number} x The x-axis of the cell.
     * @param {number} y The y-axis of the cell.
     * @param {HTMLTableElement} table The table.
     * @returns {boolean} `true` if the cell exists, otherwise it returns `false`.
     */
    doesExist(x, y, table) {
        try {
            var cell = table.rows[y].childNodes[x];
            return cell !== undefined;
        } catch(e) {
            return false;
        }
    }

    /**
     * Calculates the maximum number of cells per row in a HTML table.
     * @param {HTMLTableElement} table The HTML table.
     * @returns {number} The number of cells per row.
     */
    getNumberOfCellsPerRow(table) {
        var max = 0;
        for (var line of table.rows) {
            var n = line.children.length;
            if (n > max) max = n
        }

        return max;
    }

    /**
     * Select a cell in a table according to precise coordinates. 
     * @param {number} x The x-axis of a cell.
     * @param {number} y The y-axis of a cell.
     * @param {HTMLTableElement} table The table.
     * @returns {Cell} The wanted cell with some datas (x, y, container, etc.). If the cell doesn't exist, then it returns `undefined`.
     */
    selectCell(x, y, table) {
        try {
            var cell = table.rows[y].childNodes[x];
            return new Cell(x, y, cell, table);
        } catch (e) {
            return undefined;
        }
    }

    /**
     * Selects all the cells from a given row in a table according to its y-axis.
     * @param {number} y The y-axis of the row.
     * @param {HTMLTableElement} table The table.
     * @returns {Array<Cell>} The selected cells.
     */
    selectRow(y, table) {
        var cells = [];
        var row = table.rows[y];
        for (var x = 0; x < row.childElementCount; x++) {
            cells[cells.length] = new Cell(x, y, row.children[x], table);
        }

        return cells;
    }

    /**
     * Selects all the cells from several rows in a table.
     * @param {number} y1 The y-axis of the starting point.
     * @param {number} y2 The y-axis of the ending point.
     * @param {HTMLTableElement} table The HTML table in which we can find the rows.
     * @returns {Array<Array<Cell>>} An array of Cells.
     */
    selectSeveralRows(y1, y2, table) {
        if (y1 === y2) {
            return this.selectRow(y1);
        }
        
        var isReversed = y1 > y2;
        if (isReversed) {
            try {
                [y1, y2] = [y2, y1];
            } catch(e) {
                var temp_y1 = y1;
                var temp_y2 = y2;
                y1 = temp_y2;
                y2 = temp_y1;
            }
        }

        var cells = [];
        for (var i = y1; i <= y2; i++) {
            cells[cells.length] = this.selectRow(i, table);
        }

        if (isReversed) {
            for (var i = 0; i < cells.length; i++) cells[i].reverse();
            return cells.reverse();
        } else {
            return cells;
        }
    } 

    /**
     * Selects all the cells from a given column in a table.
     * @param {number} x The x-axis of the column in the table.
     * @param {HTMLTableElement} table The table in which we can find the column.
     * @returns {Array<Cell>} The selected cells.
     */
    selectColumn(x, table) {
        var cells = [];
        for (var y = 0; y < table.rows.length; y++) {
            cells[cells.length] = new Cell(x, y, table.rows[y].children[x], table);
        }

        return cells;
    }

    /**
     * Selects all the cells from several columns in a table.
     * @param {number} x1 The x-axis of the starting point.
     * @param {number} x2 The x-axis of the ending point.
     * @param {HTMLTableElement} table The HTML table in which we can find the columns.
     * @returns {Array<Array<Cell>>} An array of Cells.
     */
    selectSeveralColumns(x1, x2, table) {
        if (x1 === x2) {
            return this.selectColumn(x1);
        }
        
        var isReversed = x1 > x2;
        if (isReversed) {
            try {
                [x1, x2] = [x2, x1];
            } catch(e) {
                var temp_x1 = x1;
                var temp_x2 = x2;
                x1 = temp_x2;
                x2 = temp_x1;
            }
        }

        var cells = [];
        for (var i = x1; i <= x2; i++) {
            cells[cells.length] = this.selectColumn(i, table);
        }

        if (isReversed) {
            for (var i = 0; i < cells.length; i++) cells[i].reverse();
            return cells.reverse();
        } else {
            return cells;
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
            if (to.x2 >= row.childElementCount) to.x2 = row.childElementCount - 1;
            for (var i = from.x1; i <= to.x2; i++) {
                cells[cells.length] = new Cell(i, from.y1, row.children[i], table);
            }
        } else if (from.y1 < to.y2) {
            while (!(from.y1 > to.y2)) {
                var row = table.rows[from.y1];
                var endingPoint = to.x2;
                if (from.y1 === to.y2) {
                    // if this is the last line,
                    // then we have to stop to x2
                    // however, if x2 >= number of cells, then we select every cell of that row again
                    if (to.x2 >= row.childElementCount) endingPoint = row.childElementCount - 1;
                } else {
                    // if this is not the last line,
                    // then we select every cell of that row
                    endingPoint = row.childElementCount - 1;
                }
                for (var i = from.x1; i <= endingPoint; i++) {
                    cells[cells.length] = new Cell(i, from.y1, row.children[i], table);
                }
                from.y1++;
            }
        }

        return isReversed ? cells.reverse() : cells;
    }

    /**
     * Gets an instance of Cell from a basic cell in a table.
     * @param {HTMLTableDataCellElement} cell The cell to translate.
     * @param {HTMLTableElement} table The table in which there is the cell.
     * @returns {Cell} The converted cell.
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
        try {
            table.deleteRow(y);
            return true;
        } catch(e) {
            return false;
        }
    }

    /**
     * Deletes the very last row of a table.
     * @param {HTMLTableElement} table The table in which you want to delete the row.
     */
    removeLastRow(table) {
        try {
            table.deleteRow(-1);
            return true;
        } catch(e) {
            return false;
        }
    }

    /**
     * Removes a cell at a specific position in a table.
     * @param {number} x The x-axis of the cell.
     * @param {number} y The y-axis of the cell.
     * @param {HTMLTableElement} table The table in which we can find the cell.
     */
    removeCellAt(x, y, table) {
        var cell = this.selectCell(x, y, table);
        if (cell) {
            return this.removeCell(cell);
        } else {
            return;
        }
    }

    /**
     * Removes a particular cell in a table.
     * @param {Cell} cell The Cell to remove.
     */
    removeCell(cell) {
        try {
            var element = cell.getElement();
            element.parentElement.removeChild(element);
            return true;
        } catch(e) {
            console.error(e);
        }

        return false;
    }

    /**
     * Add special functions to execute while the creation of the table.
     * @param {object} options An object that contains a few options in order for the function to work properly.
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

    /**
     * Generates a cell to put inside a future HTML table. The custom functions inside the content are executed.
     * @param {string} cell The content of a cell.
     * @param {number} colspan The colspan value.
     * @param {number} rowspan The rowspan value.
     * @returns {HTMLTableDataCellElement} The generated cell.
     */
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

            if (this.commonClass) {
                cellElement.classList.add(this.commonClass);
            }

            cellElement.setAttribute('colspan', colspan);
            cellElement.setAttribute('rowspan', rowspan);
            cellElement.innerHTML = content;
        }
        
        return cellElement;
    }

    /**
     * Read the colspan identifier.
     * @param {string} cell The content of a cell.
     * @returns {number} The colspan value.
     */
    _getColspanIdentifierFrom(cell) {
        var colspan = 1;
        if (this.regexColspan.test(cell) === true) {
            cell.replace(this.regexColspan, '$1');
            colspan = parseInt(RegExp.$1);
        }

        return colspan;
    }

    /**
     * Read the rowspan identifier.
     * @param {string} cell The content of a cell.
     * @returns {number} The rowspan value.
     */
    _getRowspanIdentifierFrom(cell) {
        var rowspan = 1;
        if (this.regexRowspan.test(cell) === true) {
            cell.replace(this.regexRowspan, '$1');
            rowspan = parseInt(RegExp.$1);
        }

        return rowspan;
    }

    /**
     * Deletes all the identifiers (colspan & rowspan) after they have been read.
     * @param {string} cell The content of a cell.
     * @returns {string} The cell without any identifiers.
     */
    _clearAllIdentifiersOf(cell) {
        cell = cell.replace(this.regexColspan, '');
        cell = cell.replace(this.regexRowspan, '');
        return cell;
    }

    /**
     * Adds a row to a table.
     * @param {Array<string>} row An array of strings
     * @param {HTMLTableElement} table The HTML table in which you want to add the new row.
     */
    addRow(row, table) {
        if (!table) throw new Error("addRow(): cannot add a row to a table that doesn't exist.");

        var tr = document.createElement('tr');
        for (var x = 0; x < row.length; x++) {
            var cell = row[x];
            if (cell === ".") continue;

            var colspan = this._getColspanIdentifierFrom(cell);
            var rowspan = this._getRowspanIdentifierFrom(cell);
            if (colspan > 1 || rowspan > 1) cell = this._clearAllIdentifiersOf(cell);
            
            var cellElement = this.generateCell(cell, colspan, rowspan);
            tr.appendChild(cellElement);
        }

        table.appendChild(tr);
    }

    /**
     * Converts a js array into a HTML table.
     * @param {Array<Array<string>>} arr An array of strings
     */
    jsArrayToHtml(arr) {
        var table = document.createElement('table');

        for (var y = 0; y < arr.length; y++) {
            this.addRow(arr[y], table);
        }

        return table;
    }

    /**
     * Converts a HTML table into a Javascript array of Cells.
     * @param {HTMLTableElement} table The HTML table to convert.
     * @returns {Array<Cell>} The Cells of the table.
     */
    htmlTableToJS(table) {
        var array = [];

        var rows = table.rows;
        for (var y = 0; y < rows.length; y++) {
            array[y] = [];
            for (var x = 0; x < rows[y].children.length; x++) {
                array[y][x] = new Cell(x, y, rows[y].children[x], table);
            }
        }

        return array;
    }

    /**
     * Transforms an array of Cells into an array of strings, 
     * just like it has to be when you convert a Javascript array into a HTML table.
     * @param {HTMLTableElement} table The HTML table to convert.
     * @returns {Array<string>} The cells in a basic string.
     */
    htmlTableToString(table) {
        var array = [];
        var rows = table.rows;
        var cellsPerRow = this.getNumberOfCellsPerRow(table);

        for (var y = 0; y < rows.length; y++) {
            array[y] = [];
            for (var x = 0; x < cellsPerRow; x++) {
                var cell = rows[y].children[x];
                if (cell === undefined) {
                    array[y][x] = ".";
                } else {
                    var content = cell.textContent;
                    var rowspan = parseInt(cell.getAttribute("rowspan"));
                    var colspan = parseInt(cell.getAttribute("colspan"));
                    if (rowspan > 1) content += ".c*" + rowspan;
                    if (colspan > 1) content += ".r*" + colspan;

                    array[y][x] = content;
                }
            }
        }

        return array;
    }

    /**
     * Generates a table in the given parent element.
     * @param {HTMLTableElement} table The table to generate.
     * @param {HTMLElement} container The container in which to generate the table.
     */
    generate(table, container) {
        container.appendChild(table);
    }
}