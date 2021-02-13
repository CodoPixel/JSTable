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
        this.table = table;
        this.container = this.table.parentElement;

        this.attributes = [];
        try {
            for (var i = 0; i < this.element.getAttributeNames().length; i++) {
                var name = this.element.getAttributeNames()[i];
                var value = this.element.getAttribute(name);
                this.attributes[this.attributes.length] = [name, value];
            }
        } catch(e) {
            throw new Error("An error has occured while trying to create a cell from a HTML element.");
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
     * @returns {Array<Array<string>>} The attributes and their names in a two-dimensional array: [[name, value]]
     */
    getAttributes() { return this.attributes; }

    /**
     * Clear the content of a cell.
     */
    clearContent() {
        this.element.textContent = "";
    }

    editable() {
        this.element.setAttribute('contenteditable', 'true');
        this.element.setAttribute('spellcheck', 'false');
        this.element.classList.add('editable');
        this.element.addEventListener('focusout', function(e) {
            var jstable = new JSTable();
            var table = jstable.translate(e.target).getTable();
            jstable.refresh(table);
        });
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
            },
            {
                name: 'Editable',
                attributes: [['class', 'editable'], ['contenteditable', 'true']]
            }
        ];

        this.formulas = {
            AVERAGE: function(values) {
                var n = values.length;
                var s = 0;
                for (var i = 0; i < n; i++) {
                    s+=parseInt(values[i]);
                }
                return s / n;
            },
            SUM: function(values) {
                var s = 0;
                for (var i = 0; i < values.length; i++) {
                    s+=parseInt(values[i]);
                }
                return s;
            },
            MAX: function(values) {
                var max = values[0];
                for (var i = 0; i < values.length; i++) {
                    var n = parseInt(values[i]);
                    if (n > max) {
                        max = n;
                    }
                }
                return max;
            },
            MIN: function(values) {
                var min = values[0];
                for (var i = 0; i < values.length; i++) {
                    var n = parseInt(values[i]);
                    if (n < min) {
                        min = n;
                    }
                }
                return min;
            },
            ABS: function(values) {
                var n = parseInt(values[0]);
                return n < 0 ? n * -1 : n;
            },
            FACTORIAL: function(values) {
                var p = 1;
                var value = parseInt(values[0]);
                for (var i = value; i > 0; i--) {
                    p = p * i;
                }
                return p;
            }
        };

        this.regexColspan = /\.r\*(\d{1,})/;
        this.regexRowspan = /\.c\*(\d{1,})/;
        this.regexSelector = /#(\d{1,}-\d{1,}:\d{1,}-\d{1,})|#(\d{1,}-\d{1,})/g;
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
            return this.selectRow(y1, table);
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
            if (!row) return cells;
            if (to.x2 >= row.childElementCount) to.x2 = row.childElementCount - 1;
            for (var i = from.x1; i <= to.x2; i++) {
                cells[cells.length] = new Cell(i, from.y1, row.children[i], table);
            }
        } else if (from.y1 < to.y2) {
            while (!(from.y1 > to.y2)) {
                var row = table.rows[from.y1];
                if (!row) break;
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
     * @returns {Cell} The converted cell.
     */
    translate(cell) {
        var row = cell.parentElement;
        var table = row.parentElement;
        // if this is the tbody that we select
        if (table instanceof HTMLTableSectionElement) table = row.parentElement.parentElement;

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
     * Deletes a column from a table.
     * @param {number} x The number of the column (starting from 0). -1 to delete the last column.
     * @param {HTMLTableElement} table The table in which you want to delete a column.
     */
    removeColumn(x, table) {
        for (var y = 0; y < table.rows.length; y++) {
            try {
                table.rows[y].deleteCell(x);
            } catch(e) {
                return false;
            }
        }

        return true;
    }

    /**
     * Deletes a row from a table.
     * @param {number} y The number of the row (starting from 0). -1 to delete the last row.
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
     * Removes a cell at a specific position in a table.
     * @param {number} x The x-axis of the cell.
     * @param {number} y The y-axis of the cell.
     * @param {HTMLTableElement} table The table in which we can find the cell.
     * @returns {boolean} Was the removal successful?
     */
    removeCellAt(x, y, table) {
        try {
            table.rows[y].deleteCell(x);
            return true;
        } catch(e) {
            return false;
        }
    }

    /**
     * Removes a particular cell in a table.
     * @param {Cell} cell The Cell to remove.
     */
    removeCell(cell) {
        var element = cell.getElement();
        element.parentElement.removeChild(element);
    }

    /**
     * Add custom functions to execute while the creation of the table.
     * @param {object} options An object that contains a few options in order for the function to work properly.
     */
    addFunction(options) {
        this.functions[this.functions.length] = options;
    }

    /**
     * Adds a formula.
     * @param {Function} func The function to execute.
     */
    addFormula(name, func) {
        this.formulas[name] = func;
    }

    /**
     * Overwrite a custom function.
     * @param {string} refName The name of the function to overwrite.
     * @param {object} options An object that contains the function's options.
     */
    overwriteFunction(refName, options) {
        for (var i = 0; i < this.functions.length; i++) {
            if (this.functions[i].name === refName) {
                this.functions[i] = options;
                return;
            }
        }
    }

    /**
     * Get the arguments of a custom function inside the content of a cell. Do not use this function.
     * @param {string} name The name of the custom function.
     * @param {string} cell The cell that is currently being generated
     */
    _getArgumentsFrom(name, cell) {
        var regex = new RegExp('<' + name + '\((.*)\)>', 'gmi');
        cell = cell.replace(', ', ',');
        cell.replace(regex, '$1');
        return RegExp.$1.replace(/\(|\)/gm, '').split(',');
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
     * @param {string} text The content of a cell.
     * @returns {string} The cell without any identifiers.
     */
    _clearAllIdentifiersOf(text) {
        text = text.replace(this.regexColspan, '');
        text = text.replace(this.regexRowspan, '');
        return text;
    }

    /**
     * Generates a cell to put inside a future HTML table. The custom functions inside the content are executed.
     * @param {string} text The content of a cell.
     * @param {number} colspan The colspan value.
     * @param {number} rowspan The rowspan value.
     * @returns {HTMLTableDataCellElement} The generated cell.
     */
    createCell(text, colspan, rowspan) {
        var cell = document.createElement('td');

        if (this.commonClass) cell.classList.add(this.commonClass);
        cell.setAttribute('colspan', colspan);
        cell.setAttribute('rowspan', rowspan);
        cell.setAttribute('data-origin', text);
        cell.appendChild(document.createTextNode(text));

        return cell;
    }

    /**
     * Adds a column in a table at a certain position.
     * @param {Array<string>} column An array of strings
     * @param {HTMLTableElement} table The HTML table in which you want to add the new column.
     * @param {number} index The position of the column (-1 by default).
     */
    addColumn(column, table, index=-1) {
        if (!table) throw new Error("addColumn(): cannot add a row in a table that doesn't exist.");

        for (var y = 0; y < column.length; y++) {
            var text = column[y];
            if (text === ".") continue;

            var colspan = this._getColspanIdentifierFrom(text);
            var rowspan = this._getRowspanIdentifierFrom(text);
            if (colspan > 1 || rowspan > 1) text = this._clearAllIdentifiersOf(text);

            var newCell = this.createCell(text, colspan, rowspan);
            if (index === -1) {
                table.rows[y].appendChild(newCell);
            } else {
                table.rows[y].insertBefore(newCell, table.rows[y].children[index]); // if ref undefined => -1
            }
        }   
    }

    /**
     * Adds a row in a table at a certain position.
     * @param {Array<string>} row An array of strings
     * @param {HTMLTableElement} table The HTML table in which you want to add the new row.
     * @param {number} index The position of the row (-1 by default).
     */
    addRow(row, table, index=-1) {
        if (!table) throw new Error("addRow(): cannot add a row in a table that doesn't exist.");

        var newRow = table.insertRow(index);
        for (var x = 0; x < row.length; x++) {
            var text = row[x];
            if (text === ".") continue;

            var colspan = this._getColspanIdentifierFrom(text);
            var rowspan = this._getRowspanIdentifierFrom(text);
            if (colspan > 1 || rowspan > 1) text = this._clearAllIdentifiersOf();

            var newCell = this.createCell(text, colspan, rowspan);
            newRow.appendChild(newCell);
        }
    }

    /**
     * Checks whether a selector is a multiple selector or not.
     * @param {string} selector The selector.
     * @returns {boolean} Is a multiple selector ?
     */
    isMultipleSelector(selector) {
        return /#(\d{1,}-\d{1,}:\d{1,}-\d{1,})/g.test(selector);
    }

    /**
     * Reads a multiple selector and returns the coordinates.
     * @param {string} selector The multiple selector.
     * @returns {object} The coordinates x1, y1, x2, y2.
     */
    readMultipleSelector(selector) {
        var matches = selector.match(/(\d{1,})/g);
        var y1 = parseInt(matches[0]),
            x1 = parseInt(matches[1]),
            y2 = parseInt(matches[2]),
            x2 = parseInt(matches[3]);
        return {
            y1:y1,
            x1:x1,
            y2:y2,
            x2:x2
        };
    }

    /**
     * Reads a basic selector in order to extrapolate the x-axis & y-axis.
     * @param {string} selector The basic selector.
     * @returns {object} The coordinates x, y.
     */
    readBasicSelector(selector) {
        var matches = selector.match(/(\d{1,})/g);
        var y = parseInt(matches[0]),
            x = parseInt(matches[1]);
        return {
            y:y,
            x:x
        };
    }

    /**
     * Reads the content of a cell in order to execute the custom function that it might contains.
     * @param {string} text The cell to read.
     * @returns {object} The new propreties to apply to a cell.
     */
    interpretCustomFunction(text) {
        var newContent = text;
        var attributes = []; // [][]
        var events = []; // [][]

        for (var func of this.functions) {
            var regex = new RegExp('<' + func.name + '\(.*\)>|<' + func.name + '>', 'gm');
            if (regex.test(text)) {
                if (func.callback) {
                    var args = this._getArgumentsFrom(func.name, text);
                    newContent = func.callback(args);
                } else {
                    newContent = text.replace(regex, '');
                }

                if (func.attributes) {
                    for (var attr of func.attributes) {
                        attributes[attributes.length] = attr;
                    }
                }

                if (func.events) {
                    for (var event of func.events) {
                        events[events.length] = event;
                    }
                }
            }
        }

        return {
            newContent: newContent,
            attributes: attributes,
            events: events
        };
    }

    /**
     * We read the content in order to get all the sequences to interpret.
     * @param {string} content A string that contains selectors.
     * @returns {Array<string>} The sequences.
     */
    getSequencesFrom(content) { return content.match(/\{(.*?)\}/gmi); }

    /**
     * Read sequences & interpret its content.
     * @param {string} text The content of a cell to interpret.
     * @param {HTMLTableElement} table The table in which we can find the cells.
     */
    interpretSequences(text, table) {
        var sequences = this.getSequencesFrom(text),
            sequence = '',
            newContent = text; // []

        if (!sequences) return text;

        for (sequence of sequences) {
            var selectors = sequence.match(this.regexSelector);
            for (var selector of selectors) {
                if (!this.isMultipleSelector(selector)) {
                    var data = this.readBasicSelector(selector);
                    var cell = this.selectCell(data.x, data.y, table).getElement();
                    newContent = newContent.replace(selector, cell.textContent);
                } else {
                    throw new Error("interpretSequences(): cannot read a multiple selector inside a sequence.");
                }
            }
        }

        sequences = this.getSequencesFrom(newContent);
        for (sequence of sequences) {
            var clothes = /\{|\}/gm;
            var nakedSequence = sequence.replace(clothes, "");
            try {
                var evaluatedContent = eval(nakedSequence);
                newContent = newContent.replace(sequence, evaluatedContent);
            } catch(e) {
                console.info("Unable to evaluate the content of a cell while interpreting it.");
            }
        }

        return newContent;
    }

    /**
     * Read a text in order to interpret its content if there is a formula in it.
     * @param {string} text The content of a cell.
     * @param {HTMLTableElement} table The table in which we can find the cells.
     */
    interpretFormula(text, table) {
        var formulaRegex = /=([A-Z]*)/g;
        text.replace(formulaRegex, '$1');
        var formulaName = RegExp.$1;
        
        var values = [];
        var selectors = text.match(this.regexSelector);
        if (selectors) {
            for (var selector of selectors) {
                if (this.isMultipleSelector(selector)) {
                    var data = this.readMultipleSelector(selector);
                    var cells = this.selectMultipleCells({y1:data.y1, x1:data.x1}, {y2:data.y2, x2:data.x2}, table);
                    for (var cell of cells) {
                        values[values.length] = cell.getElement().textContent;
                    }
                } else {
                    var data = this.readBasicSelector(selector);
                    values[values.length] = this.selectCell(data.x,data.y,table).getElement().textContent;
                }
            }
        } else {
            // if there is no selectors,
            // then it may means that the user used sequences instead of arguments.
            // Therefore, all the numbers inside `text` must be the values
            values = text.match(/(\d{1,})/g);
        }

        if (this.formulas[formulaName]) {
            return this.formulas[formulaName](values);
        } else {
            return undefined;
        }
    }

    /**
     * Re-evaluates the original code of the cell at the time of its creation.
     * Useful if you have modified data within a cell and want to recalculate automatically.
     * @param {HTMLTableElement} table The table to refresh.
     */
    refreshContent(table) {
        var y = 0,
            x = 0;

        var origins = [];

        for (y = 0; y < table.rows.length; y++) {
            origins[y] = [];
            for (x = 0; x < table.rows[y].cells.length; x++) {
                origins[y][x] = table.rows[y].cells[x].dataset.origin;
            }
        }

        for (y = 0; y < origins.length; y++) {
            for (x = 0; x < origins[y].length; x++) {
                var originalCell = origins[y][x];

            }
        }

        // chaque cellule prendra la nouvelle valeur qui lui correspond
        // PB : attributes & events ?

        for (y = 0; y < table.rows.length; y++) {
            for (x = 0; x < table.rows[y].cells.length; x++) {
                var cell = table.rows[y].cells[x];
                var origin = cell.dataset.origin;
                var result = this.interpretCustomFunction(origin);
                table.rows[y].cells[x].textContent = result.newContent;
            }
        }

        for (y = 0; y < table.rows.length; y++) {
            for (x = 0; x < table.rows[y].cells.length; x++) {
                var cell = table.rows[y].cells[x];
                var text = cell.dataset.origin;
                table.rows[y].cells[x].textContent = this.interpretSequences(text, table);
            }
        }

        for (y = 0; y < table.rows.length; y++) {
            for (x = 0; x < table.rows[y].cells.length; x++) {
                var cell = table.rows[y].cells[x];
                var text = cell.dataset.origin;
                console.log(text);
                if (text[0] === "=") {
                    table.rows[y].cells[x].textContent = this.interpretFormula(text, table);
                }
            }
        }

        console.log(table);

        return table;
    }

    /**
     * Reads a table in order to do all the necessary interpretations (sequences, custom functions & formulas)
     * @param {HTMLTableElement} table The table to read.
     * @returns {HTMLTableElement} The table whose cells were read.
     */
    read(table) {
        var y = 0,
            x = 0;

        for (y = 0; y < table.rows.length; y++) {
            for (x = 0; x < table.rows[y].cells.length; x++) {
                var cell = table.rows[y].cells[x];
                var result = this.interpretCustomFunction(cell.textContent);
                table.rows[y].cells[x].textContent = result.newContent;
                for (var attr of result.attributes) {
                    table.rows[y].cells[x].setAttribute(attr[0], attr[1]);
                }
                for (var event of result.events) {
                    table.rows[y].cells[x].addEventListener(event[0], event[1]);
                }
            }
        }

        for (y = 0; y < table.rows.length; y++) {
            for (x = 0; x < table.rows[y].cells.length; x++) {
                var text = table.rows[y].cells[x].textContent;
                table.rows[y].cells[x].textContent = this.interpretSequences(text, table);
            }
        }

        for (y = 0; y < table.rows.length; y++) {
            for (x = 0; x < table.rows[y].cells.length; x++) {
                var text = table.rows[y].cells[x].textContent;
                if (text[0] === "=") {
                    table.rows[y].cells[x].textContent = this.interpretFormula(text, table);
                }
            }
        }

        return table;
    }

    /**
     * Converts a js array into a HTML table.
     * @param {Array<Array<string>>} arr An array of strings
     */
    jsArrayToHtml(arr) {
        var table = document.createElement('table');

        for (var y = 0; y < arr.length; y++) {
            this.addRow(arr[y], table, -1);
        }

        return this.read(table);
    }

    /**
     * Converts a HTML table into a Javascript array of Cells.
     * @param {HTMLTableElement} table The HTML table to convert.
     * @returns {Array<Array<Cell>>} The Cells of the table.
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
     * @returns {Array<Array<string>>} The cells in a basic string.
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