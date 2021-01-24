/**
 * The parent class of `Cell` & `MainCell`. Do not use it separately.
 */
class PartOfTable {
    /**
     * The cell of a table.
     * @param {string|HTMLElement} content The content to be displayed in the cell.
     * @param {object} options Options you can add to the cell.
     */
    constructor(content, options) {
        this.isElement = content instanceof HTMLElement;
        this.content = content;

        if (!options) options = {};
        this.rowspan = options.rowspan || 1;
        this.colspan = options.colspan || 1;
        this.scope = options.scope || '';
        this.id = options.id || '';
        this.classname = options.classname || '';
        this.allowInterpretation = true;
    }

    /**
     * When you change the orientation of a table, then the rowspan becomes colspan & colspan becomes rowspan.
     */
    invertRowspanAndColspan() {
        try {
            [this.rowspan, this.colspan] = [this.colspan, this.rowspan];
        } catch(e) {
            var temp_rowspan = this.rowspan;
            var temp_colspan = this.colspan;
            this.colspan = temp_rowspan;
            this.rowspan = temp_colspan;
            console.info("A feature is not properly supported by your navigator because it is too old. Consider changing your browser.");
        }
    }

    /**
     * @returns {boolean} true if the content inside the cell is a HTMLElement.
     */
    isHTMLElement() { return this.isElement; }

    /**
     * @returns {string} The content displayed inside the cell.
     */
    getContent() { return this.content; }

    /**
     * Sets the content of your cell.
     * @param {string|HTMLElement} content Content to be added to your cell.
     */
    setContent(content) { this.content = content; }

    /**
     * @returns {number} The rowspan value.
     */
    getRowspan() { return this.rowspan; }

    /**
     * @returns {number} The colspan value.
     */
    getColspan() { return this.colspan; }

    /**
     * @returns {string} The scope of the cell.
     */
    getScope() { return this.scope; }
    
    /**
     * @returns {string} The id of the cell.
     */
    getID() { return this.id; }

    /**
     * @returns {string} The classes of the cell. Separate the different classes with white spaces.
     */
    getClassname() { return this.classname; }

    /**
     * Adds a single class to the cell.
     * @param {string} cla A class to add to the cell.
     */
    addSingleClass(cla) {
        if (this.classname.length > 0) {
            this.classname += " " + cla;
        } else {
            this.classname = cla;
        }
    }

    /**
     * @returns {boolean} Is JSTable allowed to interpret the code inside the cell?
     */
    isAllowedToInterpret() { return this.allowInterpretation; }

    /**
     * Disables the interpretation of the codes contained in the cell.
     */
    disableInterpretation() { this.allowInterpretation = false; }

    /**
     * Enables the interpretation of the codes contained in the cell.
     */
    enableInterpretation() { this.allowInterpretation = true; }
}

/**
 * A future `<td>` (a classic cell) in your generated table.
 */
class Cell extends PartOfTable {
    /**
     * A Cell will be, in HTML, a `<td>`.
     * @param {string|HTMLElement} content The content to be displayed in the cell.
     * @param {Array<Object<string>>} options Options you can add to the cell.
     */
    constructor(content, options) {
        super(content, options);
    }
}

/**
 * A future `<th>` (a main cell) in your generated table.
 */
class MainCell extends PartOfTable {
    /**
     * A MainCell will be, in HTML, a `<th>`.
     * @param {string|HTMLElement} content The content to be displayed in the cell.
     * @param {Array<Object<string>>} options Options you can add to the cell.
     */
    constructor(content, options) {
        super(content, options);
    }
}

/**
 * Generates a cell with a random number in it and to each cell, we add a specific class: 'cell-random'.
 */
class RandomCell extends PartOfTable {
    /**
     * Generates a cell with a random number in it and to each cell, we add a specific class: 'cell-random'.
     * @param {number} min The minimum random number (included).
     * @param {number} max The maximum random number (included).
     * @param {Array<Object<String>>} options Options you can add to the cell.
     */
    constructor(min, max, options) {
        if (options) {
            if (options.classname) {
                options.classname += " cell-random";
            } else {
                options.classname = "cell-random";
            }
        } else {
            options = {classname: "cell-random"};
        }

        super("", options);

        if (min === null || min === undefined || max === null || max === undefined) {
            throw new Error("A RandomCell() doesn't have a minimum or a maximum value.");
        }

        this.min = min;
        this.max = max;
        this.number = this.getRandomIntInclusive(min, max);
        this.content = this.number.toString();
    }

    /**
     * @param {number} min The minimum random number (included).
     * @param {number} max The maximum random number (included).
     * @returns {number} A random number between `min` (included) & `man` (included).
     */
    getRandomIntInclusive(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * @returns {number} Get the generated random number during the creation of the cell.
     */
    getGeneratedRandomNumber() { return this.number; }

    /**
     * Set the random number that the cell has to contain.
     * @param {number} number The random number to be displayed.
     */
    setRandomNumber(number) { this.number = number || 0; }

    /**
     * Generates a new random integer between `min` (included) & `max` (included).
     * @param {number} min The minimum random number (included).
     * @param {number} max The maximum random number (included).
     */
    generateNewRandomNumber(min, max) {
        if (min === null || min === undefined) min = this.min;
        if (max === null || max === undefined) max = this.max;
        this.number = this.getRandomIntInclusive(min, max);
        this.content = this.number.toString();
    }
}

/**
 * Generates a fake cell in order to the cells to have rowspan & colspan attributes without throwing an Error.
 */
class BreakPointCell {
    constructor() {}
}

class TableManager {
    constructor(table) {
        this.currentTable = this.setCurrentTable(table);
    }

    setCurrentTable(table) { this.table = table; }
    getCurrentTable() { return this.table; }

    /**
     * Select a cell in a table.
     * @param {string} identifier The identifier of the wanted cell.
     * @param {HTMLTableElement} table The table whose cell you want to select.
     * @returns {HTMLTableCellElement} The wanted cell.
     */
    selectCell(identifier, table) {
        if (!table) {
            if (!this.getCurrentTable()) {
                throw new Error("selectCell(): no table defined.");
            } else {
                table = this.getCurrentTable();
            }
        }

        if (!/#\d?-\d?/gmi.test(identifier)) throw new Error("selectCell(): unable to read the identifier.");

        var lineNumber = identifier.match(/\d{1,}/gm)[0];
        var cellNumber = identifier.match(/\d{1,}/gm)[1];

        var allLines = table.querySelectorAll('tr');
        if (!allLines[lineNumber]) {
            console.error("selectCell(): unable to find the content of the cell. The line doesn't exist.");
            return '';
        }

        try {
            var cell = allLines[lineNumber].childNodes[cellNumber];
            return cell;
        } catch (e) {
            console.error("selectCell(): unable to read the content of the cell. The cell doesn't exist.");
            return null;
        }
    }

    /**
     * Select all the cells in a table at a specific line, from a starting point to an ending point: 'r-s:e'.
     * @param {string} identifier The identifier of the wanted cell.
     * @param {HTMLTableElement} table The table whose cell you want to select.
     * @returns {Array<HTMLTableCellElement>} The wanted cells.
     */
    selectMultipleCells(identifier, table) {
        if (!table) {
            if (!this.getCurrentTable()) {
                throw new Error("selectMultipleCells(): no table defined.");
            } else {
                table = this.getCurrentTable();
            }
        }

        if (!/#\d?-\d?:\d/gmi.test(identifier)) throw new Error("selectMultipleCells(): unable to read the identifier.");

        // the line number
        var line = identifier.match(/\d{1,}/gm)[0];

        // the cells number
        identifier.replace(/(\d{1,}):(\d{1,})/gm, '$1, $2');
        var startingPoint = parseInt(RegExp.$1);
        var endingPoint = parseInt(RegExp.$2);

        var cells = [];
        if (startingPoint < endingPoint) {
            for (var i = startingPoint; i <= endingPoint; i++) {
                var selectedCell = this.selectCell("#" + line + "-" + i);
                if (selectedCell) {
                    cells[cells.length] = selectedCell;
                } else {
                    break;
                }
            }
        } else if (startingPoint > endingPoint) {
            for (var i = endingPoint; i <= startingPoint; i++) {
                var selectedCell = this.selectCell("#" + line + "-" + i);
                if (selectedCell) {
                    cells[cells.length] = selectedCell;
                } else {
                    break;
                }
            }
        } else {
            return this.selectCell("#" + line + "-" + startingPoint);
        }

        return cells;
    }

    /**
     * We read the content in order to get all the sequences to interpret.
     * @param {string} content A string that contains identifiers.
     * @returns {Array<string>} The sequences.
     */
    getSequencesFrom(content) { return content.match(/\{(.*?)\}/gmi); }

    /**
     * Read the content of a cell in order to interpret it.
     * @param {string} content The content of a cell.
     */
    interpret(content, table) {
        if (!table) {
            if (!this.getCurrentTable()) {
                throw new Error("interpret(): no table defined.");
            } else {
                table = this.getCurrentTable();
            }
        }

        var newContent = content;

        // Read the sequence
        var allSequences = this.getSequencesFrom(content);
        if (!allSequences || !Array.isArray(allSequences)) { return content; }

        for (var sequence of allSequences) {
            var identifiers = sequence.match(/#[0-9]{1,}-[0-9]{1,}/gmi);
            if (identifiers) {
                for (var identifier of identifiers) {
                    newContent = newContent.replace(new RegExp(identifier, "g"), this.selectCell(identifier).innerHTML);
                }
            } else {
                return content;
            }
        }

        try {
            // Interpret the sequence
            allSequences = this.getSequencesFrom(newContent);
            for (var sequence of allSequences) {
                var evaluatedContent = eval(sequence.replace(/\{|\}/gm, ""));
                newContent = newContent.replace(sequence, evaluatedContent.toString());
            }

            return newContent;
        } catch(e) {
            console.info("Unable to evaluate the content inside the cell while interpreting it.");
            return newContent.replace(/\{|\}/gm, "");
        }
    }

    /**
     * Permanently deletes a table.
     * @param {HTMLTableElement} table The table to delete.
     */
    deleteTable(table) {
        if (!table) {
            if (!this.getCurrentTable()) {
                throw new Error("deleteTable(): no table defined.");
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
     * Clear the content of a cell.
     * @param {string} identifier The identifier of the wanted cell.
     * @param {HTMLTableElement} table The table whose cell you want to select.
     */
    clearCell(identifier, table) {
        if (!table) {
            if (!this.getCurrentTable()) {
                throw new Error("clearCell(): no table defined.");
            } else {
                table = this.getCurrentTable();
            }
        }

        var selectedCell = this.selectCell(identifier);
        selectedCell.innerHTML = "";
    }

    /**
     * Generates a line to be added to a table.
     * @param {HTMLTableElement} table The table in which you want to add a new line.
     * @param {PartOfTable} startsWith The beginning of the line (optional).
     * @param {Function} inLine The cells to be generated inside the line.
     * @param {PartOfTable} endsWith The end of the line (optional).
     * @param {number} cellsToGenerate The number of cells that has to be generated. By default 1.
     * @returns {Array<PartOfTable>} The generated line.
     */
    generateLine(options) {
        if (!options) return;

        var startsWith = options.startsWith;
        var endsWith = options.endsWith;
        var inLine = options.inLine;
        var cellsToGenerate = options.cellsToGenerate || 1;

        var line = [];
        if (startsWith) line[0] = startsWith;

        try {
            for (var i = 0; i < cellsToGenerate; i++) {
                line[line.length] = inLine(i);
            }
        } catch(e) {
            throw new Error("generateLine(): cannot execute the function from the inLine parameter.");
        }
        
        if (endsWith) line[line.length] = endsWith;
        return line;
    }

    /**
     * Generates a `<td>` or a `<th>` to put in the table.
     * @param {PartOfTable} cell A cell to put in the table.
     * @param {HTMLTableElement} table The table in which you want to interpret (if needed).
     * @returns {HTMLTableDataCellElement} A new cell for the table.
     */
    generateCell(cell, table) {
        if (!table) {
            if (!this.getCurrentTable()) {
                throw new Error("generateCell(): no table defined.");
            } else {
                table = this.getCurrentTable();
            }
        }

        var htmlCell = document.createElement('td');
        if (cell instanceof MainCell) htmlCell = document.createElement('th');

        if (cell.isAllowedToInterpret() && !cell.isHTMLElement()) {
            htmlCell.innerHTML = this.interpret(cell.getContent(), table);
        } else {
            if (cell.isHTMLElement()) {
                htmlCell.appendChild(cell.getContent());
            } else {
                htmlCell.innerHTML = cell.getContent();
            }
        }

        htmlCell.setAttribute('rowspan', cell.getRowspan());
        htmlCell.setAttribute('colspan', cell.getColspan());
        htmlCell.setAttribute('scope', cell.getScope());
        htmlCell.setAttribute('id', cell.getID());
        if (cell.getClassname()) {
            var classes = cell.getClassname().trim().split(' ');
            classes.forEach(function(clas) {
                htmlCell.classList.add(clas);
            });
        }
        return htmlCell;
    }

    /**
     * Adds a line in a table.
     * @param {Array<PartOfTable|BreakPointCell>} line A line to be added to the table.
     * @param {HTMLTableElement} table The table in which you want to add a line.
     */
    addLine(line, table) {
        if (!table) {
            if (!this.getCurrentTable()) {
                throw new Error("addLine(): no table defined.");
            } else {
                table = this.getCurrentTable();
            }
        }

        var tr = document.createElement('tr');
        for (var cell of line) {
            if (cell instanceof BreakPointCell) continue;
            tr.appendChild(this.generateCell(cell));
        }

        table.appendChild(tr);
    }
}

/**
 * Thanks to JSTable, you can create a table using Javascript.
 */
class JSTable extends TableManager {
    /**
     * Defines the primary requirements for JSTable to generate a table.
     * @param {string} parent The query selector of the parent in which to put the generated table.
     * @param {string} title The title of the table (`<caption>`).
     * @param {string} titlePos The position of the title (caption-side CSS property): 'bottom' or 'top' (by default).
     * @param {string} orientation The orientation of the table: 'vertical' or 'horizontal' (by default).
     * @param {Array<Array<PartOfTable|BreakPointCell>>} cells An array that contains all the cells of the table.
     * @param {Array<Object>} attributes An array in which you can define some attributes to add to the generated table.
     * @param {number} cellsPerLine The number of cells per line. Useless for horizontal tables.
     * @param {string} commonClass Classes common to all cells.
     */
    constructor({parent, title, titlePos, orientation, cells, attributes, cellsPerLine, commonClass}) {
        super(null);

        this.parent = document.querySelector(parent) || document.body;
        this.title = title || '';
        this.titlePos = titlePos || 'top';
        this.cells = cells || [];
        this.attributes = attributes || [];
        this.cellsPerLine = cellsPerLine;
        this.commonClass = commonClass;
        this.setOrientation(orientation);
        this.table = null;
    }

    /**
     * @returns {HTMLTableElement} The generated table. Returns `null` if the table does not yet exist.
     */
    getTable() { return this.table; }

    /**
     * Gets the orientation of the table.
     * @returns {string} The orientation of the table: 'vertical' or 'horizontal'. Horizontal by default.
     */
    getOrientation() { return this.orientation; }

    /**
     * Sets the orientation of the table. 
     * @param {string} orientation
     */
    setOrientation(orientation) {
        if (!orientation) orientation = 'horizontal';
        if (orientation != 'horizontal' && orientation != 'vertical') {
            throw new Error("JSTable: orientation must be 'vertical' or 'horizontal'.");
        }
        this.orientation = orientation;
    }

    /**
     * Set classes common to all cells.
     * @param {string} commonClass The classes to add to each cell. Separate the classes with white spaces.
     */
    setCommonClass(commonClass) {
        if (!commonClass) {
            if (!this.commonClass) {
                return;
            } else {
                commonClass = this.commonClass;
            }
        } else {
            this.commonClass = commonClass;
        }

        var self = this;
        var classes = commonClass.split(" ");
        classes.forEach(function(cla) {
            self.cells.forEach(function(line) {
                line.forEach(function(cell) {
                    cell.addSingleClass(cla);
                });
            });
        });
    }

    /**
     * Set the cells that the table will contain.
     * @param {Array<Array<PartOfTable|BreakPointCell>>} cells An array that contains all the cells of the table. By default an empty array.
     * @param {number} cellsPerLine The number of cells per line.
     * @param {string} commonClass Classes common to each cell. Separate the classes with a white space.
     */
    setCells(cells, cellsPerLine, commonClass) {
        this.cellsPerLine = cellsPerLine;
        this.cells = cells || [];
        if (commonClass) {
            this.setCommonClass(commonClass);
        }
    }

    /**
     * Get the cells contained in the table.
     * @returns {Array<Array<PartOfTable|BreakPointCell>>} The cells of the table.
     */
    getCells() {
        return this.cells;
    }

    /**
     * We pretend that the painting is vertical while we build it horizontally.
     * @returns {Array<Array<PartOfTable|BreakPointCell>>} An array of arrays of cells.
     */
    _reorganizeCellsForVerticalTable() {
        var numberOfColumns = this.cells.length;
        var numberOfLines = this.cellsPerLine || this.cells[0].length; // every line must have the same number of cells.

        // destructure the input
        var newArrayOfCells = []; // [[0, 0], [1, 1], [2, 2], [3, 3]]
        for (var i = 0; i < numberOfLines; i++) {
            newArrayOfCells[i] = [];
            for (var e = 0; e < numberOfColumns; e++) {
                var currentCell = this.cells[e][i];
                if (currentCell instanceof PartOfTable) currentCell.invertRowspanAndColspan();
                newArrayOfCells[i][e] = currentCell;
            }
        }

        return newArrayOfCells;
    }

    /**
     * Generates the table according to its orientation.
     * @param {string} orientation The orientation of the table.
     */
    generate(orientation) {
        if (!orientation) orientation = this.orientation;
        
        this.table = document.createElement('table');
        this.setCommonClass();
       
        // Create the title
        var caption = document.createElement('caption');
        caption.innerHTML = this.title || '';
        caption.style.captionSide = this.titlePos;

        this.table.appendChild(caption);

        if (this.attributes) {
            var self = this;
            this.attributes.forEach(function(attr) {
                self.table.setAttribute(attr.name, attr.value);
            });
        }

        var cells = this.cells;
        if (orientation === "vertical") cells = this._reorganizeCellsForVerticalTable();

        for (var line of cells) {
            var tr = document.createElement('tr');
            for (var cell of line) {
                if (cell instanceof BreakPointCell) continue;
                tr.appendChild(this.generateCell(cell, this.table));
            }
            this.table.appendChild(tr);
        }

        this.parent.appendChild(this.table);
    }
}